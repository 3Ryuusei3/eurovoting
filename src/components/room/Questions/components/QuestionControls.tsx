import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from 'lucide-react'
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
    <>
      {roomQuestion.state !== 'ready' && (
        <Button
          variant="secondary"
          size="icon"
          onClick={onToggleShowAnswers}
          className="h-8 w-8"
        >
          {showingAnswers ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
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
    </>
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
