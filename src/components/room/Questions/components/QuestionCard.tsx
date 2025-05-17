import { useState, useEffect } from 'react'
import { RoomQuestionWithDetails, UserAnswer } from '@/types/Question'
import { QuestionHeader } from './QuestionHeader'
import { QuestionAnswers } from './QuestionAnswers'
import { AdminControls, UserControls } from './QuestionControls'
import { getQuestionUserAnswers } from '@/services/questions'

interface QuestionCardProps {
  roomQuestion: RoomQuestionWithDetails
  index: number
  isAdmin: boolean
  userAnswer?: UserAnswer | null
  updatingId?: number | null
  showingAnswers?: boolean
  onToggleShowAnswers?: (questionId: number) => void
  onUpdateState?: (questionId: number, state: string) => void
  onOpenQuestion?: (question: RoomQuestionWithDetails) => void
}

export function QuestionCard({
  roomQuestion,
  index,
  isAdmin,
  userAnswer,
  updatingId,
  showingAnswers = false,
  onToggleShowAnswers,
  onUpdateState,
  onOpenQuestion
}: QuestionCardProps) {
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const hasAnswered = !!userAnswer

  useEffect(() => {
    if (isAdmin) {
      const fetchUserAnswers = async () => {
        try {
          const answers = await getQuestionUserAnswers(
            roomQuestion.room_id.toString(),
            roomQuestion.question_id.toString()
          )
          setUserAnswers(answers)
        } catch (error) {
          console.error('Error fetching user answers:', error)
        }
      }

      // Fetch data
      fetchUserAnswers()
      const intervalId = setInterval(fetchUserAnswers, 5000)

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [isAdmin, roomQuestion.room_id, roomQuestion.question_id, roomQuestion.id, roomQuestion.state])

  return (
    <div className="bg-[#1F1F1F] p-4 flex flex-col gap-4">
      <QuestionHeader
        roomQuestion={roomQuestion}
        index={index}
      >
        {isAdmin ? (
          onToggleShowAnswers && onUpdateState && (
            <AdminControls
              roomQuestion={roomQuestion}
              updatingId={updatingId || null}
              showingAnswers={showingAnswers}
              onToggleShowAnswers={() => onToggleShowAnswers(roomQuestion.id)}
              onUpdateState={(state) => onUpdateState(roomQuestion.id, state)}
            />
          )
        ) : (
          !hasAnswered && onOpenQuestion && (
            <UserControls
              onOpenQuestion={() => onOpenQuestion(roomQuestion)}
            />
          )
        )}
      </QuestionHeader>

      {roomQuestion.state !== 'ready' && (
        isAdmin ? (
          <QuestionAnswers
            answers={roomQuestion.question.answers}
            showCorrectAnswers={showingAnswers}
            userAnswers={userAnswers}
          />
        ) : (
          hasAnswered && (
            <QuestionAnswers
              answers={roomQuestion.question.answers}
              userAnswer={userAnswer}
              showCorrectAnswers={true}
            />
          )
        )
      )}
    </div>
  )
}
