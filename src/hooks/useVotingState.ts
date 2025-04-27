import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { hasUserVoted } from '@/services/rooms'
import { Entry, SortMethod } from '@/types/Room'
import { sortEntries } from '@/utils'

interface UseVotingStateProps {
  entries: Entry[]
  roomId: string | null
}

export function useVotingState({ entries, roomId }: UseVotingStateProps) {
  const [selectedPoints, setSelectedPoints] = useState<Record<string, Record<string, number>>>({})
  const [hasVoted, setHasVoted] = useState<boolean>(false)
  const [isCheckingVotes, setIsCheckingVotes] = useState<boolean>(true)
  const [sortMethod, setSortMethod] = useState<SortMethod>('running_order')
  const [sortedEntries, setSortedEntries] = useState<Entry[]>(entries)
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const { savePoints, getPoints } = useStore()

  // Get current entries for the page
  const currentEntries = useMemo(() => {
    if (pageSize === -1) return sortedEntries
    const startIndex = (currentPage - 1) * pageSize
    return sortedEntries.slice(startIndex, startIndex + pageSize)
  }, [sortedEntries, currentPage, pageSize])

  // Load saved points and check if user has voted
  useEffect(() => {
    if (roomId) {
      const savedPoints = getPoints(roomId)
      if (savedPoints) {
        setSelectedPoints(savedPoints)
      }

      // Check if the user has already voted
      const checkUserVotes = async () => {
        setIsCheckingVotes(true)
        try {
          const { user } = useStore.getState()
          if (user && user.id) {
            const voted = await hasUserVoted(user.id.toString(), roomId)
            setHasVoted(voted)
          }
        } catch (error) {
          console.error('Error checking if user has voted:', error)
        } finally {
          setIsCheckingVotes(false)
        }
      }

      checkUserVotes()
    }
  }, [roomId, getPoints])

  // Save points to store when they change
  useEffect(() => {
    if (roomId && Object.keys(selectedPoints).length > 0) {
      savePoints(roomId, selectedPoints)
    }
  }, [selectedPoints, roomId, savePoints])

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  // Handle sorting
  const handleSort = (method: SortMethod) => {
    setSortMethod(method)
    const newSortedEntries = sortEntries(entries, method, selectedPoints)
    setSortedEntries(newSortedEntries)
  }

  // Update sorted entries when entries or selected points change
  useEffect(() => {
    const newSortedEntries = sortEntries(entries, sortMethod, selectedPoints)
    setSortedEntries(newSortedEntries)
  }, [entries, selectedPoints, sortMethod])

  // Count how many countries have been voted for (with a 'main' score)
  const countVotedCountries = () => {
    return Object.values(selectedPoints).filter(entry => entry.main !== undefined).length
  }

  // Check if the minimum required votes (10) have been cast
  const hasMinimumVotes = countVotedCountries() >= 10

  // Check if there are any votes
  const hasAnyVotes = Object.keys(selectedPoints).length > 0

  return {
    selectedPoints,
    setSelectedPoints,
    hasVoted,
    setHasVoted,
    isCheckingVotes,
    sortMethod,
    sortedEntries,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    currentEntries,
    handleSort,
    countVotedCountries,
    hasMinimumVotes,
    hasAnyVotes
  }
}
