import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useAllUsersBingoSubscription } from '@/hooks/useAllUsersBingoSubscription'
import { UserBingoCarousel } from './UserBingoCarousel'
import { UserBingoGrid } from './UserBingoGrid'

interface AdminBingoViewProps {
  roomId: string
}

export function AdminBingoView({ roomId }: AdminBingoViewProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const { userBingos, loading } = useAllUsersBingoSubscription({ roomId })

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1)
    } else if (direction === 'next' && currentUserIndex < userBingos.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1)
    }
  }

  if (loading) {
    return (
      <Card blurred>
        <CardHeader>
          <CardTitle main>Bingo de Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (userBingos.length === 0) {
    return (
      <Card blurred>
        <CardHeader>
          <CardTitle main>Bingo de Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <p className="text-center text-muted-foreground">No hay usuarios con tarjetas de bingo</p>
        </CardContent>
      </Card>
    )
  }

  const currentUser = userBingos[currentUserIndex]

  return (
    <Card blurred>
      <CardHeader>
        <CardTitle main>Bingo de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-60 p-4 flex flex-col items-center justify-start gap-4 border-b sm:border-b-0 sm:border-r">
            <UserBingoCarousel
              userBingos={userBingos}
              currentUserIndex={currentUserIndex}
              onNavigate={handleNavigate}
            />
          </div>

          <div className="flex-1 p-4 sm:p-0">
            {currentUser && (
              <UserBingoGrid cells={currentUser.cells} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
