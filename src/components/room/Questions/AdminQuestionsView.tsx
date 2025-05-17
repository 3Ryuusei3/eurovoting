import { RoomQuestionWithDetails } from '@/types/Question'
import { QuestionsView } from './QuestionsView'

interface AdminQuestionsViewProps {
  questions: RoomQuestionWithDetails[]
  loading: boolean
}

export function AdminQuestionsView({ questions, loading }: AdminQuestionsViewProps) {
  return (
    <QuestionsView
      questions={questions}
      loading={loading}
      isAdmin={true}
    />
  )
}
