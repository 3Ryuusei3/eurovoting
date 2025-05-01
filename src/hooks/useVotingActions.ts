import { useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { resetUserVotes } from '@/services/rooms'
import { Entry, TopVotedEntry } from '@/types/Room'
import { categories } from '@/constants'
import { calculateCategoryPoints, roundToValidScore } from '@/utils'

interface UseVotingActionsProps {
  entries: Entry[]
  roomId: string | null
  selectedPoints: Record<string, Record<string, number>>
  setSelectedPoints: React.Dispatch<React.SetStateAction<Record<string, Record<string, number>>>>
  setHasVoted: React.Dispatch<React.SetStateAction<boolean>>
}

export function useVotingActions({
  entries,
  roomId,
  selectedPoints,
  setSelectedPoints,
  setHasVoted
}: UseVotingActionsProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [isVotingConfirmationDialogOpen, setIsVotingConfirmationDialogOpen] = useState(false)
  const [isResetScoresDialogOpen, setIsResetScoresDialogOpen] = useState(false)
  const [topVotedEntries, setTopVotedEntries] = useState<TopVotedEntry[]>([])

  const { savePoints } = useStore()

  // Handle point click
  const handlePointClick = (entryId: number, category: string, point: number) => {
    setSelectedPoints(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        [category]: prev[entryId]?.[category] === point ? undefined : point
      }
    }))
  }

  // Check if a point is selected
  const isPointSelected = (entryId: number, category: string, point: number) => {
    return selectedPoints[entryId]?.[category] === point
  }

  // Update main score based on category votes
  const handleUpdateMainScore = (entryId: number) => {
    const categoryPoints = calculateCategoryPoints(selectedPoints, entryId, categories)
    // Use the roundToValidScore function to get the closest valid score
    const closestPoints = roundToValidScore(categoryPoints)

    setSelectedPoints(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        main: closestPoints
      }
    }))
  }

  // Check if entry has category votes
  const checkHasCategoryVotes = (entryId: number) => {
    const entryPoints = selectedPoints[entryId] || {}
    return categories.some(category => entryPoints[category.value] !== undefined)
  }

  // Check if entry has category votes but no main score or different main score
  const hasUnupdatedCategoryVotes = (entryId: number) => {
    const entryPoints = selectedPoints[entryId] || {}
    const mainScore = entryPoints.main
    const hasCategories = checkHasCategoryVotes(entryId)

    if (!hasCategories) return false

    // Calculate the category average and round to valid score
    const categoryAvg = calculateCategoryPoints(selectedPoints, entryId, categories)
    const roundedCategoryAvg = roundToValidScore(categoryAvg)

    // If there's no main score or the main score is different from the rounded category average
    return mainScore === undefined || mainScore !== roundedCategoryAvg
  }

  // Get the suggested score based on category votes
  const getSuggestedScore = (entryId: number) => {
    if (!checkHasCategoryVotes(entryId)) return null

    const categoryAvg = calculateCategoryPoints(selectedPoints, entryId, categories)
    // Round to the nearest valid score
    return roundToValidScore(categoryAvg)
  }

  // Get the top 10 voted countries with tiebreakers and assign Eurovision points
  const getTopVotedEntries = () => {
    // Create an array of entries with their points and category average
    const entriesWithPoints = entries.map(entry => {
      const mainPoints = selectedPoints[entry.id]?.main || 0

      // Calculate the exact average of category points (not rounded)
      const entryPoints = selectedPoints[entry.id] || {}
      const votedCategories = categories.filter(category => entryPoints[category.value] !== undefined)
      let categoryAvg = 0

      if (votedCategories.length > 0) {
        const totalPoints = votedCategories.reduce((sum, category) => {
          return sum + (entryPoints[category.value] || 0)
        }, 0)
        categoryAvg = totalPoints / votedCategories.length
      }

      return {
        ...entry,
        userPoints: mainPoints,
        categoryAvg,
        finalPoints: 0 // Will be assigned later
      }
    })

    // Filter entries that have points
    const votedEntries = entriesWithPoints.filter(entry => entry.userPoints > 0)

    // Sort by: 1. Points (desc), 2. Category average (desc), 3. Running order (asc)
    const sortedEntries = votedEntries.sort((a, b) => {
      // First sort by main points
      if (b.userPoints !== a.userPoints) {
        return b.userPoints - a.userPoints
      }

      // If points are equal, sort by category average
      if (b.categoryAvg !== a.categoryAvg) {
        return b.categoryAvg - a.categoryAvg
      }

      // If category average is also equal, sort by running order
      return a.running_order - b.running_order
    })

    const eurovisionPoints = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1]
    const top10 = sortedEntries.slice(0, 10).map((entry, index) => ({
      ...entry,
      finalPoints: eurovisionPoints[index] || 0
    }))

    return top10
  }

  // Handle reset scores
  const handleResetScores = async () => {
    if (roomId) {
      try {
        const { user } = useStore.getState()
        if (user && user.id) {
          // Reset votes in database to 0
          await resetUserVotes(user.id.toString(), roomId, entries)

          // Reset all points in local state
          setSelectedPoints({})
          // Save empty points to store
          savePoints(roomId, {})

          // Update hasVoted state
          setHasVoted(false)

          // Show success message
          toast.success('Puntuaciones reiniciadas correctamente')
        }
      } catch (error) {
        console.error('Error resetting scores:', error)
        toast.error('Error al reiniciar las puntuaciones')
      }
    }
  }

  // Handle opening voting confirmation dialog
  const handleOpenVotingConfirmation = () => {
    const topEntries = getTopVotedEntries()
    setTopVotedEntries(topEntries)
    setIsVotingConfirmationDialogOpen(true)
  }

  return {
    selectedEntry,
    setSelectedEntry,
    isVotingConfirmationDialogOpen,
    setIsVotingConfirmationDialogOpen,
    isResetScoresDialogOpen,
    setIsResetScoresDialogOpen,
    topVotedEntries,
    handlePointClick,
    isPointSelected,
    handleUpdateMainScore,
    checkHasCategoryVotes,
    hasUnupdatedCategoryVotes,
    getSuggestedScore,
    getTopVotedEntries,
    handleResetScores,
    handleOpenVotingConfirmation
  }
}
