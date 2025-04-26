import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { YouTubeDialog } from './YouTubeDialog'
import { EntryInfo } from './EntryInfo'
import { CategoryDrawer } from './CategoryDrawer'
import { VotingConfirmationDialog } from './VotingConfirmationDialog'
import { VotingResults } from './VotingResults'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Film, Trophy, Hash, Star, Info } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Entry, SortMethod, RoomState } from '@/types/Room'
import { categories, points } from '@/constants'
import {
  getOverlayStyles,
  getButtonStyles,
  calculateCategoryPoints,
  hasCategoryVotes,
  sortEntries,
  roundToValidScore
} from '@/utils'
import { useStore } from '@/store/useStore'
import { hasUserVoted } from '@/services/rooms'

// Interface for top voted entries with additional information
export interface TopVotedEntry extends Entry {
  userPoints: number // Original points given by user
  categoryAvg: number // Average of category points
  finalPoints: number // Final points in Eurovision style (12, 10, 8, etc.)
}

interface VotingTableProps {
  entries: Entry[]
  roomState: RoomState
}

export function VotingTable({ entries, roomState }: VotingTableProps) {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')
  const [selectedPoints, setSelectedPoints] = useState<Record<string, Record<string, number>>>({})
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [isVotingConfirmationDialogOpen, setIsVotingConfirmationDialogOpen] = useState(false)
  const [topVotedEntries, setTopVotedEntries] = useState<TopVotedEntry[]>([])
  const [sortMethod, setSortMethod] = useState<SortMethod>('running_order')
  const [sortedEntries, setSortedEntries] = useState<Entry[]>(entries)
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [hasVoted, setHasVoted] = useState<boolean>(false)
  const [isCheckingVotes, setIsCheckingVotes] = useState<boolean>(true)

  const { savePoints, getPoints } = useStore()

  // Get current entries for the page
  const currentEntries = useMemo(() => {
    if (pageSize === -1) return sortedEntries // Show all entries
    const startIndex = (currentPage - 1) * pageSize
    return sortedEntries.slice(startIndex, startIndex + pageSize)
  }, [sortedEntries, currentPage, pageSize])

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

  useEffect(() => {
    if (roomId && Object.keys(selectedPoints).length > 0) {
      savePoints(roomId, selectedPoints)
    }
  }, [selectedPoints, roomId, savePoints])

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  const handlePointClick = (entryId: number, category: string, point: number) => {
    setSelectedPoints(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        [category]: prev[entryId]?.[category] === point ? undefined : point
      }
    }))
  }

  const isPointSelected = (entryId: number, category: string, point: number) => {
    return selectedPoints[entryId]?.[category] === point
  }

  const getButtonStylesForPoint = (entryId: number, category: string, point: number) => {
    return getButtonStyles(isPointSelected(entryId, category, point), point)
  }

  const hasAnyVotes = Object.keys(selectedPoints).length > 0

  // Count how many countries have been voted for (with a 'main' score)
  const countVotedCountries = () => {
    return Object.values(selectedPoints).filter(entry => entry.main !== undefined).length
  }

  // Check if the minimum required votes (10) have been cast
  const hasMinimumVotes = countVotedCountries() >= 10

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

  const handleSort = (method: SortMethod) => {
    setSortMethod(method)
    const newSortedEntries = sortEntries(entries, method, selectedPoints)
    setSortedEntries(newSortedEntries)
  }

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value))
  }

  // Define a local hasCategoryVotes function that uses the imported utility
  const checkHasCategoryVotes = (entryId: number) => {
    return hasCategoryVotes(selectedPoints, entryId, categories)
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

  if (roomState === 'finished' || roomState === 'completed') {
    // Get the top voted entries
    const topEntries = getTopVotedEntries();
    return <VotingResults topEntries={topEntries} />;
  }

  return (
    <Card className="gap-3 relative" blurred={true}>
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle main>Votaciones</CardTitle>
            <div className="flex justify-end flex-wrap gap-1">
              <Button
                variant={sortMethod === 'running_order' ? 'default' : 'outline'}
                onClick={() => handleSort('running_order')}
                className='size-8'
              >
                <Hash className="h-4 w-4" strokeWidth={2} />
              </Button>
              <Button
                variant={sortMethod === 'points' ? 'default' : 'outline'}
                onClick={() => handleSort('points')}
                disabled={!hasAnyVotes}
                className='size-8'
              >
                <Trophy className="h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          </div>
          {hasVoted && !isCheckingVotes && (
            <Alert className="mt-2 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <Info className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-300">
                Ya has emitido tus votos anteriormente. Si emites nuevos votos, se actualizarán los anteriores.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentEntries.map((entry) => (
              <div key={entry.id} className="relative flex flex-col gap-3 p-4 bg-[#1F1F1F]">
                {selectedPoints[entry.id]?.main > 0 && (
                  <div className={getOverlayStyles(selectedPoints[entry.id]?.main)}></div>
                )}
                <div className='flex justify-between items-center'>
                  <EntryInfo entry={entry} />
                  <div className="flex justify-end gap-1">
                    <CategoryDrawer
                      entry={entry}
                      selectedPoints={selectedPoints}
                      isPointSelected={isPointSelected}
                      getButtonStylesForPoint={getButtonStylesForPoint}
                      handlePointClick={handlePointClick}
                      handleUpdateMainScore={handleUpdateMainScore}
                      hasCategoryVotes={checkHasCategoryVotes}
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-8"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <Film className="h-4 w-4" strokeWidth={2}  />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Main score row */}
                  <div className="grid grid-cols-10 w-full relative">
                    {points.map((point, idx) => {
                      const suggestedScore = getSuggestedScore(entry.id)
                      const isSuggestedScore = suggestedScore === point

                      return (
                        <Button
                          key={idx}
                          variant={isPointSelected(entry.id, 'main', point) ? "default" : isSuggestedScore && hasUnupdatedCategoryVotes(entry.id) ? "cuaternary" : "outline"}
                          size="sm"
                          className={`w-full relative ${idx === 0 ? '' : idx === points.length - 1 ? '' : ''} ${isPointSelected(entry.id, 'main', point) ? 'font-bold' : ''}`}
                          onClick={() => handlePointClick(entry.id, 'main', point)}
                        >
                          {isPointSelected(entry.id, 'main', point) && (
                            <div className={getOverlayStyles(point, true)}></div>
                          )}
                          {point}
                          {isSuggestedScore && hasUnupdatedCategoryVotes(entry.id) && (
                            <Star className="absolute top-5.5 right-0.25 p-0.5 border-1 rounded-full border-white bg-[#414141]" strokeWidth={2} />
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination component */}
            <Pagination
              totalItems={sortedEntries.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10]}
            />

            <div className="flex flex-col items-end gap-2 pt-5">
              <div className="text-xs text-muted-foreground">
                {hasMinimumVotes
                  ? "Has votado por 10 o más países. ¡Ya puedes emitir tus votos!"
                  : `Has votado por ${countVotedCountries()} de 10 países necesarios para emitir votos`
                }
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  const topEntries = getTopVotedEntries()
                  setTopVotedEntries(topEntries)
                  setIsVotingConfirmationDialogOpen(true)
                }}
                disabled={!hasMinimumVotes}
              >
                Emitir votos
              </Button>
            </div>

            <YouTubeDialog
              isOpen={!!selectedEntry}
              onClose={() => setSelectedEntry(null)}
              entry={selectedEntry}
            />
            <VotingConfirmationDialog
              isOpen={isVotingConfirmationDialogOpen}
              onClose={() => setIsVotingConfirmationDialogOpen(false)}
              topVotedEntries={topVotedEntries}
              onConfirm={(updatedPoints) => {
                setSelectedPoints(updatedPoints)
              }}
              onVotesSubmitted={() => {
                setHasVoted(true)
              }}
            />
          </div>
        </CardContent>
      </Card>
  )
}
