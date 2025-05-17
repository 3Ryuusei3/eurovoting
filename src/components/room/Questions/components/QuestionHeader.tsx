import { RoomQuestionWithDetails } from '@/types/Question'

interface QuestionHeaderProps {
  roomQuestion: RoomQuestionWithDetails
  index: number
  children?: React.ReactNode
}

export function QuestionHeader({ roomQuestion, index, children }: QuestionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <h3 className="text-lg font-medium">
        {roomQuestion.state === 'ready'
          ? `Pregunta ${index + 1}`
          : `${index + 1}. ${roomQuestion.question.title}`}
      </h3>
      {children && (
        <div className="flex items-center gap-2 ml-auto">
          {children}
        </div>
      )}
    </div>
  )
}
