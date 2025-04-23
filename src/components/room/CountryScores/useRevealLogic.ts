import { useState } from 'react'
import { UserScore } from './types'

interface UseRevealLogicProps {
  userScores: UserScore[]
  revealUserScore: (userId: string, pointsFilter?: number[]) => void
  resetScores: () => void
}

export function useRevealLogic({ userScores, revealUserScore, resetScores }: UseRevealLogicProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [currentUserIndex, setCurrentUserIndex] = useState<number>(0)
  const [revealStage, setRevealStage] = useState<{[userId: string]: 0 | 1 | 2}>({})
  const [isRevealing, setIsRevealing] = useState(false)

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

  const handleReveal = () => {
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
  }

  const handleReset = () => {
    setSelectedUserId(null)
    setRevealStage({})
    setIsRevealing(false)
    setCurrentUserIndex(0)
    resetScores()
  }

  return {
    selectedUserId,
    currentUserIndex,
    revealStage,
    isRevealing,
    navigateUsers,
    handleReveal,
    handleReset
  }
}
