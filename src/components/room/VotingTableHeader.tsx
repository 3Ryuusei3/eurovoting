import { Button } from '@/components/ui/button'
import { CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Hash, Info } from 'lucide-react'
import { RoomInfoModal } from './RoomInfoModal'
import { SortMethod } from '@/types/Room'

interface VotingTableHeaderProps {
  sortMethod: SortMethod
  handleSort: (method: SortMethod) => void
  hasAnyVotes: boolean
  hasVoted: boolean
  isCheckingVotes: boolean
}

export function VotingTableHeader({
  sortMethod,
  handleSort,
  hasAnyVotes,
  hasVoted,
  isCheckingVotes
}: VotingTableHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <CardTitle main>Votaciones</CardTitle>
          <RoomInfoModal buttonPosition="header" />
        </div>
        <div className="flex justify-end flex-wrap gap-1">
          <Button
            variant={sortMethod === 'running_order' ? 'default' : 'outline'}
            onClick={() => handleSort('running_order')}
            className='size-8'
          >
            <Hash className="h-4 w-4" strokeWidth={2} />
          </Button>
          <Button
            variant={sortMethod === 'points' ? 'default' : 'outline'}
            onClick={() => handleSort('points')}
            disabled={!hasAnyVotes}
            className='size-8'
          >
            <Trophy className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
      {hasVoted && !isCheckingVotes && (
        <Alert className="mt-2 bg-red-50 dark:bg-red-950/30 border-0">
          <Info className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-300">
            Ya has emitido tus votos. Puedes volver a hacerlo antes de que el administrador cierre la votación.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
