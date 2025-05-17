import { RoomQuestionWithDetails, UserAnswer } from '@/types/Question'
import { QuestionsView } from './QuestionsView'

interface UserQuestionsViewProps {
  questions: RoomQuestionWithDetails[]
  userAnswers: Record<number, UserAnswer | null>
  loading: boolean
}

export function UserQuestionsView({ questions, userAnswers, loading }: UserQuestionsViewProps) {
  return (
    <QuestionsView
      questions={questions}
      userAnswers={userAnswers}
      loading={loading}
      isAdmin={false}
    />
  )
}
