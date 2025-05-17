import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getRoomQuestions, getUserAnswer } from '@/services/questions'
import { RoomQuestionWithDetails, UserAnswer } from '@/types/Question'
import { useStore } from '@/store/useStore'

interface UseQuestionsSubscriptionProps {
  roomId: string | null
  isAdmin?: boolean
}

export function useQuestionsSubscription({ roomId, isAdmin = false }: UseQuestionsSubscriptionProps) {
  const [questions, setQuestions] = useState<RoomQuestionWithDetails[]>([])
  const [activeQuestion, setActiveQuestion] = useState<RoomQuestionWithDetails | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer | null>>({})
  const [loading, setLoading] = useState(true)
  const { user } = useStore()

  const loadQuestions = useCallback(async () => {
    if (!roomId) return

    try {
      setLoading(true)
      const data = await getRoomQuestions(roomId)
      setQuestions(data)

      const active = data.find(q => q.state === 'sent')
      setActiveQuestion(active || null)

      if (user && user.id) {
        if (isAdmin) {
          const answers: Record<number, UserAnswer | null> = {}

          for (const question of data) {
            const answer = await getUserAnswer(
              user.id.toString(),
              roomId,
              question.question_id.toString()
            )
            answers[question.question_id] = answer
          }

          setUserAnswers(answers)
        } else {
          const answers: Record<number, UserAnswer | null> = {}

          for (const question of data) {
            const answer = await getUserAnswer(
              user.id.toString(),
              roomId,
              question.question_id.toString()
            )
            answers[question.question_id] = answer
          }

          setUserAnswers(answers)
        }
      }
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }, [roomId, user, isAdmin])

  useEffect(() => {
    if (!roomId) return

    loadQuestions()

    const roomQuestionsChannel = supabase
      .channel('room_questions_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'room_questions',
          filter: `room_id=eq.${parseInt(roomId, 10)}`
        },
        async (payload) => {
          const updatedQuestion = payload.new;

          setQuestions(prevQuestions => {
            const newQuestions = [...prevQuestions];
            const index = newQuestions.findIndex(q => q.id === updatedQuestion.id);

            if (index !== -1) {
              newQuestions[index] = {
                ...newQuestions[index],
                state: updatedQuestion.state,
                updated_at: updatedQuestion.updated_at
              };
            }

            const active = newQuestions.find(q => q.state === 'sent');
            setActiveQuestion(active || null);

            return newQuestions;
          });
        }
      )
      .subscribe()

    let userAnswersChannel = null;

    if (user && user.id) {
      const filter = isAdmin
        ? `room_id=eq.${parseInt(roomId, 10)}`
        : `user_id=eq.${parseInt(user.id.toString(), 10)}`;


      userAnswersChannel = supabase
        .channel('user_answers_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_answers',
            filter: filter
          },
          async (payload) => {

            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newAnswer = payload.new;

              if (isAdmin) {
                loadQuestions();
              } else {
                if (newAnswer.user_id === parseInt(user.id.toString(), 10)) {
                  setUserAnswers(prev => ({
                    ...prev,
                    [newAnswer.question_id]: newAnswer as UserAnswer
                  }));
                }
              }
            }
          }
        )
        .subscribe()
    }

    return () => {
      roomQuestionsChannel.unsubscribe()
      if (userAnswersChannel) {
        userAnswersChannel.unsubscribe()
      }
    }
  }, [roomId, loadQuestions, user])

  return {
    questions,
    activeQuestion,
    userAnswers,
    loading,
    refreshQuestions: loadQuestions
  }
}
