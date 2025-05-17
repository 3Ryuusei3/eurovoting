import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RoomQuestionWithDetails, Answer, UserAnswer } from '@/types/Question'
import { submitUserAnswer } from '@/services/questions'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

interface QuestionModalProps {
  isOpen: boolean
  question: RoomQuestionWithDetails | null
  userAnswer: UserAnswer | null
  onClose?: () => void
}

export function QuestionModal({ isOpen, question, userAnswer, onClose }: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const { user } = useStore()

  // Reset selected answer when question changes
  useEffect(() => {
    if (question) {
      setSelectedAnswer(userAnswer?.answer_id || null)
      setShowCorrectAnswer(!!userAnswer)
    }
  }, [question, userAnswer])

  if (!question || !question.question) {
    return null
  }

  const handleSubmit = async () => {
    if (!user || !user.id || !selectedAnswer || !question) return

    try {
      setSubmitting(true)
      await submitUserAnswer(
        user.id.toString(),
        question.room_id.toString(),
        question.question_id.toString(),
        selectedAnswer.toString()
      )
      toast.success('Respuesta enviada correctamente')
      setShowCorrectAnswer(true)
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Error al enviar la respuesta')
    } finally {
      setSubmitting(false)
    }
  }

  const getCorrectAnswer = (): Answer | undefined => {
    return question.question.answers.find(answer => answer.is_correct)
  }

  const isAnswerCorrect = (): boolean => {
    const correctAnswer = getCorrectAnswer()
    return !!correctAnswer && correctAnswer.id === selectedAnswer
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      console.log('QuestionModal: Dialog closed by user');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent className="sm:max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle>
            Pregunta
          </DialogTitle>
          <DialogDescription>
            {question.question.title}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {question.question.answers.map((answer) => {
            const isSelected = selectedAnswer === answer.id
            const isCorrect = answer.is_correct && showCorrectAnswer
            const isIncorrect = isSelected && !answer.is_correct && showCorrectAnswer

            return (
              <Button
                key={answer.id}
                variant={isSelected ? "default" : "gray"}
                className={cn(
                  "justify-start h-auto py-3 px-4 opacity-100!",
                  isCorrect && "bg-[#2EFD79] text-black",
                  isIncorrect && "bg-red-500 text-white"
                )}
                onClick={() => {
                  if (!showCorrectAnswer) {
                    setSelectedAnswer(answer.id)
                  }
                }}
                disabled={submitting || showCorrectAnswer}
              >
                {answer.name}
              </Button>
            )
          })}
        </div>
        <div className="flex gap-2">
          {!showCorrectAnswer ? (
            <div className="ml-auto">
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null || submitting}
              >
                Enviar respuesta
              </Button>
            </div>
          ) : (
            <div className="text-sm text-left">
              {isAnswerCorrect() ? (
                <span className="text-green-500 font-medium">¡Respuesta correcta!</span>
              ) : (
                <span className="text-red-500 font-medium">Respuesta incorrecta</span>
              )}
            </div>
          )}
        </div>
        <div className='flex justify-end'>
          <Button
            onClick={onClose}
            variant='secondary'
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
