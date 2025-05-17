import { RoomQuestionWithDetails } from '@/types/Question'
import { QuestionsView } from './QuestionsView'

interface AdminQuestionsViewProps {
  questions: RoomQuestionWithDetails[]
  loading: boolean
}

export function AdminQuestionsView({ questions, loading }: AdminQuestionsViewProps) {
  // Get the room ID from the first question (all questions have the same room_id)
  const roomId = questions.length > 0 ? questions[0].room_id : 0

  return (
    <QuestionsView
      questions={questions}
      loading={loading}
      isAdmin={true}
      roomId={roomId}
    />
  )
}
