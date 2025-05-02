import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getInitial } from '@/utils'
import { UserBingo } from './types'

interface UserBingoCarouselProps {
  userBingos: UserBingo[]
  currentUserIndex: number
  onNavigate: (direction: 'prev' | 'next') => void
}

export function UserBingoCarousel({
  userBingos,
  currentUserIndex,
  onNavigate
}: UserBingoCarouselProps) {
  const currentUser = userBingos[currentUserIndex]
  
  const canNavigatePrev = currentUserIndex > 0
  const canNavigateNext = currentUserIndex < userBingos.length - 1

  if (userBingos.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-4">No hay usuarios con tarjetas de bingo</p>
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
            {userBingos.length > 0 ? `${currentUserIndex + 1} de ${userBingos.length}` : ''}
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
                className="w-16 h-16 flex items-center justify-center text-xl font-medium transition shadow-sm"
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

        <div className="mt-2 text-center">
          <div className="text-sm font-medium">
            Casillas completadas: {currentUser?.completedCount || 0} / {currentUser?.cells.length || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round((currentUser?.completedCount || 0) / (currentUser?.cells.length || 1) * 100)}% completado
          </div>
        </div>
      </div>
    </>
  )
}
