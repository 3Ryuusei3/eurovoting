import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCountryScoresSubscription } from '@/hooks/useCountryScoresSubscription'
import { Entry } from '@/types/Room'
import { LoadingState } from './CountryScores/LoadingState'
import { EmptyState } from './CountryScores/EmptyState'
import { UserCarousel } from './CountryScores/UserCarousel'
import { CountryScoresList } from './CountryScores/CountryScoresList'
import { ResultsModal } from './CountryScores/ResultsModal'
import { TwelvePointsAnimation } from './CountryScores/TwelvePointsAnimation'
import { useRevealLogic } from './CountryScores/useRevealLogic'

interface VotingScreenProps {
  roomId: string
  entries: Entry[]
  isAdmin?: boolean
  roomState: string
}

export function VotingScreen({ roomId, entries, isAdmin = false, roomState }: VotingScreenProps) {
  // Local state to track if we should show the final scores button
  const [showFinalScoresButton, setShowFinalScoresButton] = useState(false)
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
    finalScoresMode,
    showTwelvePointsAnimation,
    twelvePointsCountry,
    twelvePointsUserName,
    handleTwelvePointsAnimationComplete
  } = useRevealLogic({ userScores, revealUserScore, resetScores })

  if (loading) {
    return <LoadingState />
  }

  if (countryScores.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <Card blurred>
        <CardHeader>
          <CardTitle main>Puntuaciones por país</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-60 p-4 flex flex-col items-center justify-start gap-4 border-b sm:border-b-0">
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

          <div className='flex gap-2 mt-8 justify-end'>
            <Button
              variant="secondary"
              onClick={handleReset}
            >
              Reiniciar puntuaciones
            </Button>

            {(showFinalScoresButton || roomState === 'completed') && (
              <Button
                variant="default"
                onClick={() => {
                  revealAllScores();
                  enableFinalScoresMode();
                }}
              >
                Mostrar puntuaciones finales
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Modal */}
      <ResultsModal
        isOpen={showResultsModal}
        onClose={() => {
          setShowResultsModal(false);
          // When the modal is closed, update our local state to show the final scores button
          if (isAdmin) {
            setShowFinalScoresButton(true);
          }
        }}
        countryScores={countryScores}
        entries={entries}
      />

      {/* 12 Points Animation */}
      <TwelvePointsAnimation
        isVisible={showTwelvePointsAnimation}
        countryName={twelvePointsCountry}
        userName={twelvePointsUserName}
        onAnimationComplete={handleTwelvePointsAnimationComplete}
      />
    </>
  )
}
