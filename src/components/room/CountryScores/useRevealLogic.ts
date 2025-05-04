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
  const [modalHasBeenShown, setModalHasBeenShown] = useState(false)
  const [finalScoresMode, setFinalScoresMode] = useState(false)
  const [showTwelvePointsAnimation, setShowTwelvePointsAnimation] = useState(false)
  const [twelvePointsCountry, setTwelvePointsCountry] = useState('')
  const [twelvePointsUserName, setTwelvePointsUserName] = useState('')

  const navigateUsers = (direction: 'prev' | 'next') => {
    if (userScores.length === 0) return

    // Always allow free navigation in final scores mode
    if (finalScoresMode) {
      let newIndex: number
      if (direction === 'prev') {
        newIndex = currentUserIndex > 0 ? currentUserIndex - 1 : currentUserIndex
      } else {
        newIndex = currentUserIndex < userScores.length - 1 ? currentUserIndex + 1 : currentUserIndex
      }

      if (newIndex !== currentUserIndex) {
        setCurrentUserIndex(newIndex)
      }
      return
    }

    // Check if all users have revealed their scores (for normal reveal mode)
    const allRevealed = userScores.every(user =>
      user.user_id in revealStage && revealStage[user.user_id] === 2
    )

    // Get current user ID and stage
    const currentUserId = userScores[currentUserIndex]?.user_id
    const currentStage = currentUserId ? revealStage[currentUserId] || 0 : 0

    // Allow free navigation if all users have revealed their scores
    // Otherwise, only allow navigation if current user's points have been fully revealed (stage 2)
    if (!allRevealed && ((currentUserId && currentStage !== 2) || !selectedUserId)) {
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

          setTimeout(() => {
            setIsRevealing(false);
          }, 500);
        } else if (currentStage === 1) {
          // Find the country that received 12 points from this user
          const twelvePointsVote = userScores[currentUserIndex]?.points['12']
          const currentUserName = userScores[currentUserIndex]?.user_name || ''

          // Update the reveal stage and reveal the 12 points first
          setRevealStage(prev => ({ ...prev, [userId]: 2 }))
          revealUserScore(userId, [12])

          if (twelvePointsVote) {
            // Wait for the points to be revealed and animation to finish
            setTimeout(() => {
              // Set the country name and user name for the animation
              setTwelvePointsCountry(twelvePointsVote.country_name)
              setTwelvePointsUserName(currentUserName)

              // Show the animation
              setShowTwelvePointsAnimation(true)

              // We'll set isRevealing to false after the animation completes
              // This is handled by the onAnimationComplete callback
            }, 1200); // Increased delay to give more time for points reveal animation
          } else {
            // If there's no 12 points vote, just proceed normally
            setTimeout(() => {
              setIsRevealing(false);
            }, 500);
          }
        }
      }, 100);
    }
  }

  // Function to handle when the 12 points animation completes
  const handleTwelvePointsAnimationComplete = () => {
    setShowTwelvePointsAnimation(false)
    setIsRevealing(false)
  }

  const handleReset = () => {
    setSelectedUserId(null)
    setRevealStage({})
    setIsRevealing(false)
    setCurrentUserIndex(0)
    setShowResultsModal(false)
    setModalHasBeenShown(false)
    setFinalScoresMode(false)
    resetScores()
  }

  // Function to enable final scores mode
  const enableFinalScoresMode = () => {
    setFinalScoresMode(true)
    setShowResultsModal(false)
  }

  // Check if all users have revealed their scores
  useEffect(() => {
    // Don't show modal in final scores mode or if it has already been shown
    if (userScores.length === 0 || finalScoresMode || modalHasBeenShown) return

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
            setModalHasBeenShown(true) // Mark that the modal has been shown
          }, 1500)
        }
      }
    }
  }, [userScores, currentUserIndex, revealStage, isRevealing, finalScoresMode, modalHasBeenShown])

  return {
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
  }
}
