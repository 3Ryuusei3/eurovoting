import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomQuestionWithDetails, UserAnswer } from '@/types/Question'
import { updateRoomQuestionState } from '@/services/questions'
import { toast } from 'sonner'

// Import atomic components
import { LoadingState } from './components/LoadingState'
import { EmptyState } from './components/EmptyState'
import { QuestionCard } from './components/QuestionCard'
import { QuestionModal } from './QuestionModal'

interface QuestionsViewProps {
  questions: RoomQuestionWithDetails[]
  loading: boolean
  isAdmin: boolean
  userAnswers?: Record<number, UserAnswer | null>
}

export function QuestionsView({
  questions,
  loading,
  isAdmin,
  userAnswers = {}
}: QuestionsViewProps) {
  // Admin state
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [showingAnswers, setShowingAnswers] = useState<Record<number, boolean>>({})

  // User state
  const [selectedQuestion, setSelectedQuestion] = useState<RoomQuestionWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Admin handlers
  const handleUpdateState = async (questionId: number, newState: string) => {
    try {
      setUpdatingId(questionId)

      console.log(`QuestionsView: Updating question ${questionId} state to ${newState}`);

      // Update the question state in the database
      await updateRoomQuestionState(questionId.toString(), newState)
      console.log(`QuestionsView: Question ${questionId} state updated successfully to ${newState}`);

      // Show appropriate toast message
      if (newState === 'sent') {
        console.log('QuestionsView: Question sent to participants');
        toast.success('Pregunta enviada a los participantes')
      } else if (newState === 'answered') {
        toast.success('Pregunta marcada como respondida')
      } else {
        toast.success('Estado de la pregunta actualizado')
      }
    } catch (error) {
      console.error('Error updating question state:', error)
      toast.error('Error al actualizar el estado de la pregunta')
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleShowAnswers = (questionId: number) => {
    setShowingAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  // User handlers
  const handleOpenQuestion = (question: RoomQuestionWithDetails) => {
    setSelectedQuestion(question)
    setIsModalOpen(true)
  }

  if (loading) {
    return <LoadingState />
  }

  // Filter questions for user view (only show sent or answered)
  const displayQuestions = isAdmin
    ? questions
    : questions.filter(q => q.state === 'sent' || q.state === 'answered')

  if (displayQuestions.length === 0) {
    return (
      <EmptyState
        title="Preguntas"
        description={isAdmin
          ? "No hay preguntas disponibles para esta sala"
          : "No hay preguntas disponibles en este momento"
        }
      />
    )
  }

  return (
    <Card blurred>
      <CardHeader>
        <CardTitle main>Preguntas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Gestiona las preguntas para esta sala. Puedes enviar preguntas a los participantes y ver las respuestas."
              : "Responde a las preguntas enviadas por el administrador de la sala."
            }
          </p>
          <div className="space-y-6">
            {displayQuestions.map((roomQuestion, index) => (
              <QuestionCard
                key={roomQuestion.id}
                roomQuestion={roomQuestion}
                index={index}
                isAdmin={isAdmin}
                userAnswer={userAnswers[roomQuestion.question_id]}
                updatingId={updatingId}
                showingAnswers={showingAnswers[roomQuestion.id]}
                onToggleShowAnswers={isAdmin ? toggleShowAnswers : undefined}
                onUpdateState={isAdmin ? handleUpdateState : undefined}
                onOpenQuestion={!isAdmin ? handleOpenQuestion : undefined}
              />
            ))}
          </div>
        </div>
      </CardContent>

      {!isAdmin && selectedQuestion && (
        <QuestionModal
          isOpen={isModalOpen}
          question={selectedQuestion}
          userAnswer={userAnswers[selectedQuestion.question_id]}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Card>
  )
}
