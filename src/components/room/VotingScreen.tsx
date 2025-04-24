import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCountryScoresSubscription } from '@/hooks/useCountryScoresSubscription'
import { Entry } from '@/types/Room'
import { LoadingState } from './CountryScores/LoadingState'
import { EmptyState } from './CountryScores/EmptyState'
import { UserCarousel } from './CountryScores/UserCarousel'
import { CountryScoresList } from './CountryScores/CountryScoresList'
import { ResultsModal } from './CountryScores/ResultsModal'
import { useRevealLogic } from './CountryScores/useRevealLogic'

interface VotingScreenProps {
  roomId: string
  entries: Entry[]
}

export function VotingScreen({ roomId, entries }: VotingScreenProps) {
  const { countryScores, userScores, loading, revealUserScore, resetScores, revealedPoints, revealAllScores } = useCountryScoresSubscription({
    roomId,
    entries
  })

  const {
    selectedUserId,
    currentUserIndex,
    revealStage,
    isRevealing,
    showResultsModal,
    setShowResultsModal,
    navigateUsers,
    handleReveal,
    handleReset,
    enableFinalScoresMode,
    finalScoresMode
  } = useRevealLogic({ userScores, revealUserScore, resetScores })

  if (loading) {
    return <LoadingState />
  }

  if (countryScores.length === 0) {
    return <EmptyState />
  }

  return (
    <>
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
                finalScoresMode={finalScoresMode}
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

      <div className='flex gap-2 mt-4 justify-end'>
        <Button
          variant="outline"
          onClick={handleReset}
        >
          <span><span className='font-swiss italic'>Reiniciar</span> puntuaciones</span>
        </Button>
        <Button
          variant="default"
          onClick={() => {
            revealAllScores();
            enableFinalScoresMode();
          }}
        >
          <span>Mostrar <span className='font-swiss italic'>puntuaciones finales</span></span>
        </Button>
      </div>

      {/* Results Modal */}
      <ResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        countryScores={countryScores}
        entries={entries}
      />
    </>
  )
}
