import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { YouTubeDialog } from './YouTubeDialog'
import { EntryInfo } from './EntryInfo'
import { CategoryDrawer } from './CategoryDrawer'
import { VotingConfirmationDialog } from './VotingConfirmationDialog'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Trophy, Hash } from 'lucide-react';

import { Entry, SortMethod } from '@/types/Room'
import { categories, points } from '@/constants'
import {
  getOverlayStyles,
  getButtonStyles,
  calculateCategoryPoints,
  hasCategoryVotes,
  sortEntries
} from '@/utils'
import { useStore } from '@/store/useStore'

interface VotingTableProps {
  entries: Entry[]
}

export function VotingTable({ entries }: VotingTableProps) {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')
  const [selectedPoints, setSelectedPoints] = useState<Record<string, Record<string, number>>>({})
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [isVotingConfirmationDialogOpen, setIsVotingConfirmationDialogOpen] = useState(false)
  const [sortMethod, setSortMethod] = useState<SortMethod>('running_order')
  const [sortedEntries, setSortedEntries] = useState<Entry[]>(entries)
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

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

  const handleSort = (method: SortMethod) => {
    setSortMethod(method)
    const newSortedEntries = sortEntries(entries, method, selectedPoints)
    setSortedEntries(newSortedEntries)
  }

  const handleUpdateMainScore = (entryId: number) => {
    const categoryPoints = calculateCategoryPoints(selectedPoints, entryId, categories)
    const closestPoints = points.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev - categoryPoints)
      const currDiff = Math.abs(curr - categoryPoints)
      if (prevDiff === currDiff) {
        return Math.max(prev, curr)
      }
      return currDiff < prevDiff ? curr : prev
    })

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

  return (
    <Card className="gap-3">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle>Votaciones</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentEntries.map((entry) => (
              <div key={entry.id} className="relative flex flex-col gap-3 p-4 border rounded-lg">
                {selectedPoints[entry.id]?.main && (
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
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <Play className="h-4 w-4" strokeWidth={2}  />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Main score row */}
                  <div className="grid grid-cols-10 w-full">
                    {points.map((point, idx) => (
                      <Button
                        key={idx}
                        variant={isPointSelected(entry.id, 'main', point) ? "default" : "outline"}
                        size="sm"
                        className={`w-full ${idx === 0 ? 'rounded-none rounded-l-sm' : idx === points.length - 1 ? 'rounded-none rounded-r-sm' : 'rounded-none'} ${getButtonStylesForPoint(entry.id, 'main', point)}`}
                        onClick={() => handlePointClick(entry.id, 'main', point)}
                      >
                        {isPointSelected(entry.id, 'main', point) && (
                          <div className={getOverlayStyles(point, true)}></div>
                        )}
                        {point}
                      </Button>
                    ))}
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

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsVotingConfirmationDialogOpen(true)}>
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
            />
          </div>
        </CardContent>
      </Card>
  )
}
