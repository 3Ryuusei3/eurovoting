import { Button } from '@/components/ui/button'

interface VotingControlsProps {
  hasMinimumVotes: boolean
  hasAnyVotes: boolean
  countVotedCountries: () => number
  onOpenVotingConfirmation: () => void
  onOpenResetScoresDialog: () => void
}

export function VotingControls({
  hasMinimumVotes,
  hasAnyVotes,
  countVotedCountries,
  onOpenVotingConfirmation,
  onOpenResetScoresDialog
}: VotingControlsProps) {
  return (
    <div className="flex flex-col items-end gap-2 pt-5">
      <div className="text-xs text-muted-foreground">
        {hasMinimumVotes
          ? "Has votado por 10 o más países. ¡Ya puedes emitir tus votos!"
          : `Has votado por ${countVotedCountries()} de 10 países necesarios para emitir votos`
        }
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onOpenResetScoresDialog}
          disabled={!hasAnyVotes}
        >
          Reiniciar puntuaciones
        </Button>
        <Button
          variant="secondary"
          onClick={onOpenVotingConfirmation}
          disabled={!hasMinimumVotes}
        >
          Emitir votos
        </Button>
      </div>
    </div>
  )
}
