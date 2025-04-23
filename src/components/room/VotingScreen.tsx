import { useState, useEffect } from 'react'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getPositionTextColor, getInitial, getOverlayStyles } from '@/utils'
import { useCountryScoresSubscription } from '@/hooks/useCountryScoresSubscription'
import { Entry } from '@/types/Room'

interface CountryScoresProps {
  roomId: string
  entries: Entry[]
}

export function CountryScores({ roomId, entries }: CountryScoresProps) {
  const { countryScores, userScores, loading, revealUserScore, resetScores, revealedPoints } = useCountryScoresSubscription({
    roomId,
    entries
  })

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [currentUserIndex, setCurrentUserIndex] = useState<number>(0)
  const [revealStage, setRevealStage] = useState<{[userId: string]: 0 | 1 | 2}>({})
  const [isRevealing, setIsRevealing] = useState(false)

  // Track previous positions for animations
  const [prevPositions, setPrevPositions] = useState<{[key: number]: number}>({})

  // Update previous positions when scores change
  useEffect(() => {
    // Create a map of entry_id to current position
    const currentPositions: {[key: number]: number} = {};
    countryScores.forEach((score, index) => {
      currentPositions[score.entry_id] = index;
    });

    // Only update if we have previous data to compare with
    if (Object.keys(prevPositions).length > 0) {
      // Wait a bit to let the animation complete
      const timer = setTimeout(() => {
        setPrevPositions(currentPositions);
      }, 2000); // Animation duration

      return () => clearTimeout(timer);
    } else {
      // First load, just set the positions without animation
      setPrevPositions(currentPositions);
    }
  }, [countryScores, prevPositions])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Puntuaciones por país</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (countryScores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Puntuaciones por país</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            No se encontraron puntuaciones para esta sala.
            <br />
            <small className="block mt-2">Si crees que debería haber puntuaciones, revisa la consola para más información.</small>
          </p>
        </CardContent>
      </Card>
    )
  }

  const navigateUsers = (direction: 'prev' | 'next') => {
    if (userScores.length === 0) return

    // Get current user ID and stage
    const currentUserId = userScores[currentUserIndex]?.user_id
    const currentStage = currentUserId ? revealStage[currentUserId] || 0 : 0

    // Only allow navigation if current user's points have been fully revealed (stage 2)
    // Never allow navigation if the process hasn't started yet (no selectedUserId)
    if ((currentUserId && currentStage !== 2) || !selectedUserId) {
      return // Prevent navigation if points haven't been fully revealed or process hasn't started
    }

    let newIndex: number
    if (direction === 'prev') {
      // Only go back if not at the beginning
      newIndex = currentUserIndex > 0 ? currentUserIndex - 1 : currentUserIndex
    } else {
      // Only go forward if not at the end
      newIndex = currentUserIndex < userScores.length - 1 ? currentUserIndex + 1 : currentUserIndex
    }

    // Only update if the index actually changed
    if (newIndex !== currentUserIndex) {
      setCurrentUserIndex(newIndex)
    }
  }

  const handleReset = () => {
    setSelectedUserId(null)
    setRevealStage({})
    setIsRevealing(false)
    setCurrentUserIndex(0) // Reset to first user
    resetScores()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Puntuaciones por país</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-60 p-4 flex flex-col items-center justify-start gap-4 border-b sm:border-b-0 sm:border-r">
            {userScores.length > 0 ? (
              <>
                <div className="flex items-center justify-between w-full">
                  {/* Only show prev button if we can navigate back and process has started */}
                  {currentUserIndex > 0 &&
                   selectedUserId && // Process has started
                   userScores[currentUserIndex]?.user_id &&
                   revealStage[userScores[currentUserIndex]?.user_id] === 2 && // Current user is complete
                   !isRevealing ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => navigateUsers('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="w-9 h-9"></div>
                  )}

                  <div className="text-sm font-medium text-center">
                    <div>{userScores[currentUserIndex]?.user_name || 'Usuario'}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {userScores.length > 0 ? `${currentUserIndex + 1} de ${userScores.length}` : ''}
                    </div>
                  </div>

                  {/* Only show next button if we can navigate forward and process has started */}
                  {currentUserIndex < userScores.length - 1 &&
                   selectedUserId && // Process has started
                   userScores[currentUserIndex]?.user_id &&
                   revealStage[userScores[currentUserIndex]?.user_id] === 2 && // Current user is complete
                   !isRevealing ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => navigateUsers('next')}
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
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium transition shadow-sm ${selectedUserId === userScores[currentUserIndex]?.user_id ? 'ring-2 ring-primary' : ''}`}
                          style={{
                            backgroundColor: userScores[currentUserIndex]?.color || 'var(--primary)',
                            color: userScores[currentUserIndex]?.text_color || 'var(--primary-foreground)'
                          }}
                        >
                          {userScores[currentUserIndex] ? getInitial(userScores[currentUserIndex].user_name) : '?'}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{userScores[currentUserIndex]?.user_name || 'Usuario'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Eurovision-style reveal button */}
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      disabled={(userScores[currentUserIndex] && revealStage[userScores[currentUserIndex].user_id] === 2) || isRevealing}
                      onClick={() => {
                        if (userScores[currentUserIndex] && !isRevealing) {
                          const userId = userScores[currentUserIndex].user_id
                          setSelectedUserId(userId)

                          const currentStage = revealStage[userId] || 0

                          setIsRevealing(true);

                          setTimeout(() => {
                            if (currentStage === 0) {
                              setRevealStage(prev => ({ ...prev, [userId]: 1 }))
                              revealUserScore(userId, [1, 2, 3, 4, 5, 6, 7, 8, 10])
                            } else if (currentStage === 1) {
                              setRevealStage(prev => ({ ...prev, [userId]: 2 }))
                              revealUserScore(userId, [12])
                            }

                            setTimeout(() => {
                              setIsRevealing(false);
                            }, 500);
                          }, 100);
                        }
                      }}
                    >
                      {userScores[currentUserIndex] ?
                        (revealStage[userScores[currentUserIndex].user_id] === 0 || !revealStage[userScores[currentUserIndex].user_id] ? 'Mostrar 1-10 puntos' :
                         revealStage[userScores[currentUserIndex].user_id] === 1 ? 'Mostrar 12 puntos' :
                         'Puntuación revelada') : 'Revelar puntos'}
                    </Button>
                  </div>

                  {/* Reset button at the bottom */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-auto"
                    onClick={handleReset}
                  >
                    Reiniciar
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">No hay usuarios con votos</p>
            )}
          </div>

          {/* Country Scores Column */}
          <div className="flex-1 p-4 sm:p-0">
            <div className={`grid grid-rows-${Math.ceil(countryScores.length / 2)} grid-cols-2 gap-2 grid-flow-col-dense`}>
              <AnimatePresence>
                {countryScores.map((score, index) => {
                  // Check if this entry was voted by the current user
                  const currentUser = userScores[currentUserIndex];
                  const isVotedByCurrentUser = currentUser && Object.entries(currentUser.points).some(([pointValue, vote]) =>
                    vote && vote.entry_id === score.entry_id &&
                    revealedPoints[currentUser.user_id]?.includes(parseInt(pointValue, 10))
                  );

                  // Calculate animation properties
                  const prevPosition = prevPositions[score.entry_id] !== undefined ? prevPositions[score.entry_id] : index;
                  const yDelta = (index - prevPosition) * 40;

                  return (
                    <motion.div
                      key={score.entry_id}
                      layout
                      initial={{ y: yDelta < 0 ? yDelta : 0, opacity: yDelta < 0 ? 0 : 1 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 35, damping: 11, duration: 2 }}
                      className={`flex gap-3 items-center py-1 px-2 border rounded-md shadow-sm relative overflow-hidden bg-primary-foreground
                        ${isVotedByCurrentUser ? 'border-primary/70' : ''}`}
                    >
                      {score.points > 0 && index < 3 && (
                        <div className={`absolute ${getOverlayStyles(score.points, false, index)}`}></div>
                      )}
                      <div className="flex-shrink-0 w-5 text-center font-medium">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex-shrink-0">
                        <img
                          src={score.country_flag}
                          alt={score.country_name}
                          className="relative w-9 h-6 object-cover rounded shadow-sm z-10"
                        />
                      </div>
                      <div className="flex-grow">
                        {score.country_name}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Show points given by current user if this entry was voted by them */}
                        {isVotedByCurrentUser && currentUser && (() => {
                          // Find the points given by this user to this entry
                          let pointsGiven = '?';

                          // Loop through all points to find the matching entry
                          for (const [pointValue, vote] of Object.entries(currentUser.points)) {
                            if (vote && vote.entry_id === score.entry_id) {
                              pointsGiven = pointValue;
                              break;
                            }
                          }

                          return (
                            <div className="text-sm font-medium px-1.5 py-0.5 rounded-md bg-muted">
                              +{pointsGiven}
                            </div>
                          );
                        })()}
                        <div className={`flex-shrink-0 text-right font-bold text-lg ${score.points !== 0 ? getPositionTextColor(index) : ''}`}>
                          {score.points}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
