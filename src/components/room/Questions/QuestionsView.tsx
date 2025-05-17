import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomQuestionWithDetails, UserAnswer } from '@/types/Question'
import { updateRoomQuestionState, getQuestionUserAnswers } from '@/services/questions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FileQuestion, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'

// Import atomic components
import { LoadingState } from './components/LoadingState'
import { EmptyState } from './components/EmptyState'
import { QuestionCard } from './components/QuestionCard'
import { QuestionModal } from './QuestionModal'
import { PlayerScoresView } from './components/PlayerScoresView'

interface QuestionsViewProps {
  questions: RoomQuestionWithDetails[]
  loading: boolean
  isAdmin: boolean
  userAnswers?: Record<number, UserAnswer | null>
  roomId?: number
}

export function QuestionsView({
  questions,
  loading,
  isAdmin,
  userAnswers = {},
  roomId = 0
}: QuestionsViewProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'questions' | 'scores'>('questions')

  // Admin state
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [showingAnswers, setShowingAnswers] = useState<Record<number, boolean>>({})
  const [allUserAnswers, setAllUserAnswers] = useState<UserAnswer[]>([])

  // User state
  const [selectedQuestion, setSelectedQuestion] = useState<RoomQuestionWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Accordion state
  const [areAllExpanded, setAreAllExpanded] = useState(true)

  // Fetch all user answers for the room when in admin mode and scores tab is active
  useEffect(() => {
    if (isAdmin && activeTab === 'scores' && roomId > 0) {
      const fetchAllUserAnswers = async () => {
        try {
          const allAnswers: UserAnswer[] = []

          // Fetch user answers for each question
          for (const question of questions) {
            const answers = await getQuestionUserAnswers(
              roomId.toString(),
              question.question_id.toString()
            )
            allAnswers.push(...answers)
          }

          setAllUserAnswers(allAnswers)
        } catch (error) {
          console.error('Error fetching all user answers:', error)
        }
      }

      fetchAllUserAnswers()
      // Set up polling every 5 seconds
      const intervalId = setInterval(fetchAllUserAnswers, 5000)

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [isAdmin, activeTab, roomId, questions])

  // Admin handlers
  const handleUpdateState = async (questionId: number, newState: string) => {
    try {
      setUpdatingId(questionId)
      // Update the question state in the database
      await updateRoomQuestionState(questionId.toString(), newState)
      // Show appropriate toast message
      if (newState === 'sent') {
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

  // Toggle all accordions
  const toggleAllAccordions = () => {
    setAreAllExpanded(prev => !prev)
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
        title="Quiz"
        description={isAdmin
          ? "No hay preguntas disponibles para esta sala"
          : "No hay preguntas disponibles en este momento"
        }
      />
    )
  }

  return (
    <Card blurred>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle main>Quiz</CardTitle>

        {/* Tabs for admin view */}
        {isAdmin && (
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'questions' ? "default" : "gray"}
              size="sm"
              onClick={() => setActiveTab('questions')}
            >
              <FileQuestion className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTab === 'scores' ? "default" : "gray"}
              size="sm"
              onClick={() => setActiveTab('scores')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Questions Tab Content */}
        {(!isAdmin || activeTab === 'questions') && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Gestiona las preguntas para esta sala. Puedes enviar preguntas a los participantes y ver las respuestas."
                  : "Responde a preguntas sobre Eurovision."
                }
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllAccordions}
                className="flex items-center gap-1"
              >
                {areAllExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Colapsar todo</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Expandir todo</span>
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-3">
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
                  defaultOpen={areAllExpanded}
                />
              ))}
            </div>
          </div>
        )}

        {/* Scores Tab Content */}
        {isAdmin && activeTab === 'scores' && roomId > 0 && (
          <PlayerScoresView
            roomId={roomId}
            questionIds={questions.map(q => q.question_id)}
            userAnswers={allUserAnswers}
          />
        )}
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
