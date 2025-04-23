import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCountryScoresSubscription } from '@/hooks/useCountryScoresSubscription'
import { Entry } from '@/types/Room'
import { LoadingState } from './CountryScores/LoadingState'
import { EmptyState } from './CountryScores/EmptyState'
import { UserCarousel } from './CountryScores/UserCarousel'
import { CountryScoresList } from './CountryScores/CountryScoresList'
import { useRevealLogic } from './CountryScores/useRevealLogic'

interface VotingScreenProps {
  roomId: string
  entries: Entry[]
}

export function VotingScreen({ roomId, entries }: VotingScreenProps) {
  const { countryScores, userScores, loading, revealUserScore, resetScores, revealedPoints } = useCountryScoresSubscription({
    roomId,
    entries
  })

  const {
    selectedUserId,
    currentUserIndex,
    revealStage,
    isRevealing,
    navigateUsers,
    handleReveal,
    handleReset
  } = useRevealLogic({ userScores, revealUserScore, resetScores })

  if (loading) {
    return <LoadingState />
  }

  if (countryScores.length === 0) {
    return <EmptyState />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Puntuaciones por país</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-60 p-4 flex flex-col items-center justify-start gap-4 border-b sm:border-b-0 sm:border-r">
            <UserCarousel
              userScores={userScores}
              currentUserIndex={currentUserIndex}
              selectedUserId={selectedUserId}
              revealStage={revealStage}
              isRevealing={isRevealing}
              onNavigate={navigateUsers}
              onReveal={handleReveal}
              onReset={handleReset}
            />
          </div>

          <div className="flex-1 p-4 sm:p-0">
            <CountryScoresList
              countryScores={countryScores}
              currentUserIndex={currentUserIndex}
              userScores={userScores}
              revealedPoints={revealedPoints}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
