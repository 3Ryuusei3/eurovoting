import { Button } from "@/components/ui/button"
import { RoomQuestionWithDetails } from '@/types/Question'

interface AdminControlsProps {
  roomQuestion: RoomQuestionWithDetails
  updatingId: number | null
  showingAnswers: boolean
  onToggleShowAnswers: () => void
  onUpdateState: (state: string) => void
}

export function AdminControls({
  roomQuestion,
  updatingId,
  showingAnswers,
  onToggleShowAnswers,
  onUpdateState
}: AdminControlsProps) {
  return (
    <div className="flex pt-3 justify-end">
      {roomQuestion.state !== 'ready' && (
        <Button
          variant="secondary"
          onClick={onToggleShowAnswers}
        >
          {showingAnswers ? (
            <>Ocultar respuestas</>
          ) : (
            <>Mostrar respuestas</>
          )}
        </Button>
      )}

      {roomQuestion.state === 'ready' && (
        <Button
          onClick={() => onUpdateState('sent')}
          disabled={updatingId === roomQuestion.id}
          className="ml-2"
        >
          Enviar pregunta
        </Button>
      )}
    </div>
  )
}

interface UserControlsProps {
  onOpenQuestion: () => void
}

export function UserControls({ onOpenQuestion }: UserControlsProps) {
  return (
    <Button
      onClick={onOpenQuestion}
    >
      Responder pregunta
    </Button>
  )
}
