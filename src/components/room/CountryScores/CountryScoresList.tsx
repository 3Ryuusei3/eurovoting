import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CountryScoreItem } from './CountryScoreItem'
import { CountryScore, UserScore } from './types'

interface CountryScoresListProps {
  countryScores: CountryScore[]
  currentUserIndex: number
  userScores: UserScore[]
  revealedPoints: {[userId: string]: number[]}
}

export function CountryScoresList({
  countryScores,
  currentUserIndex,
  userScores,
  revealedPoints
}: CountryScoresListProps) {
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
      }, 1000); // Reduced animation duration for smoother transitions

      return () => clearTimeout(timer);
    } else {
      // First load, just set the positions without animation
      setPrevPositions(currentPositions);
    }
  }, [countryScores])

  return (
    <div className={`grid grid-rows-${Math.ceil(countryScores.length / 2)} grid-cols-2 gap-2 grid-flow-col-dense`}>
      <AnimatePresence>
        {countryScores.map((score, index) => {
          // Check if this entry was voted by the current user
          const currentUser = userScores[currentUserIndex];
          const isVotedByCurrentUser = currentUser && Object.entries(currentUser.points).some(([pointValue, vote]) =>
            vote && vote.entry_id === score.entry_id &&
            revealedPoints[currentUser.user_id]?.includes(parseInt(pointValue, 10))
          );

          // Find the points given by this user to this entry
          let pointsGiven: string | undefined;
          if (isVotedByCurrentUser && currentUser) {
            // Loop through all points to find the matching entry
            for (const [pointValue, vote] of Object.entries(currentUser.points)) {
              if (vote && vote.entry_id === score.entry_id) {
                pointsGiven = pointValue;
                break;
              }
            }
          }

          // Calculate animation properties
          const prevPosition = prevPositions[score.entry_id] !== undefined ? prevPositions[score.entry_id] : index;
          const yDelta = (index - prevPosition) * 40;

          return (
            <CountryScoreItem
              key={score.entry_id}
              score={score}
              index={index}
              isVotedByCurrentUser={isVotedByCurrentUser}
              pointsGiven={pointsGiven}
              yDelta={yDelta}
            />
          );
        })}
      </AnimatePresence>
    </div>
  )
}
