import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getInitial } from '@/utils'
import { UserScore } from './types'

interface UserCarouselProps {
  userScores: UserScore[]
  currentUserIndex: number
  selectedUserId: string | null
  revealStage: Record<string, 0 | 1 | 2>
  isRevealing: boolean
  onNavigate: (direction: 'prev' | 'next') => void
  onReveal: () => void
  finalScoresMode?: boolean
}

export function UserCarousel({
  userScores,
  currentUserIndex,
  selectedUserId,
  revealStage,
  isRevealing,
  onNavigate,
  onReveal,
  finalScoresMode = false
}: UserCarouselProps) {
  const currentUser = userScores[currentUserIndex]
  const currentUserId = currentUser?.user_id
  const currentStage = currentUserId ? revealStage[currentUserId] || 0 : 0
  // Check if all users have revealed their scores (for normal reveal mode)
  const allRevealed = userScores.every(user =>
    user.user_id in revealStage && revealStage[user.user_id] === 2
  )

  // Allow free navigation in final scores mode or if all users have revealed their scores
  const canNavigatePrev = currentUserIndex > 0 && (
    finalScoresMode || allRevealed || (selectedUserId && currentStage === 2 && !isRevealing)
  )

  const canNavigateNext = currentUserIndex < userScores.length - 1 && (
    finalScoresMode || allRevealed || (selectedUserId && currentStage === 2 && !isRevealing)
  )

  if (userScores.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-4">No hay usuarios con votos</p>
  }

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {canNavigatePrev ? (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={() => onNavigate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-9 h-9"></div>
        )}

        <div className="text-sm font-medium text-center">
          <div className='text-lg'>{currentUser?.user_name || 'Usuario'}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {userScores.length > 0 ? `${currentUserIndex + 1} de ${userScores.length}` : ''}
          </div>
        </div>

        {canNavigateNext ? (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={() => onNavigate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-9 h-9"></div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`w-16 h-16 flex items-center justify-center text-xl font-medium transition shadow-sm ${selectedUserId === currentUserId ? 'ring-2 ring-primary' : ''}`}
                style={{
                  backgroundColor: currentUser?.color || 'var(--primary)',
                  color: currentUser?.text_color || 'var(--primary-foreground)'
                }}
              >
                {currentUser ? getInitial(currentUser.user_name) : '?'}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentUser?.user_name || 'Usuario'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {!finalScoresMode && (
          <div className="mt-4 flex flex-col gap-2 w-full">
            <Button
              variant="default"
              size="sm"
              className="w-full"
              disabled={finalScoresMode || (currentUser && revealStage[currentUser.user_id] === 2) || isRevealing}
              onClick={onReveal}
            >
              {finalScoresMode ? 'Modo puntuación final' :
                currentUser ?
                  (revealStage[currentUser.user_id] === 0 || !revealStage[currentUser.user_id] ? 'Mostrar 1-10 puntos' :
                  revealStage[currentUser.user_id] === 1 ? 'Mostrar 12 puntos' :
                  'Puntuación revelada') : 'Revelar puntos'
              }
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
