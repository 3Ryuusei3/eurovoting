import { useState, useEffect } from 'react'
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
  const [showResultsModal, setShowResultsModal] = useState(false)

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
    setShowResultsModal(false)
    resetScores()
  }

  // Check if all users have revealed their scores
  useEffect(() => {
    if (userScores.length === 0) return

    // Only check when we're at the last user and not in the middle of revealing
    if (currentUserIndex === userScores.length - 1 && !isRevealing) {
      const currentUserId = userScores[currentUserIndex]?.user_id

      // If the current user has fully revealed their scores (stage 2)
      if (currentUserId && revealStage[currentUserId] === 2) {
        // Check if all users have revealed their scores
        const allRevealed = userScores.every(user =>
          revealStage[user.user_id] === 2
        )

        if (allRevealed) {
          // Wait a moment before showing the results modal
          setTimeout(() => {
            setShowResultsModal(true)
          }, 1500)
        }
      }
    }
  }, [userScores, currentUserIndex, revealStage, isRevealing])

  return {
    selectedUserId,
    currentUserIndex,
    revealStage,
    isRevealing,
    showResultsModal,
    setShowResultsModal,
    navigateUsers,
    handleReveal,
    handleReset
  }
}
