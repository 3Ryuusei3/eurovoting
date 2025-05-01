import { useSearchParams } from 'react-router-dom'

import { YouTubeDialog } from './YouTubeDialog'
import { VotingConfirmationDialog } from './VotingConfirmationDialog'
import { VotingResults } from './VotingResults'
import { ResetScoresDialog } from './ResetScoresDialog'
import { VotingTableHeader } from './VotingTableHeader'
import { VotingEntry } from './VotingEntry'
import { VotingControls } from './VotingControls'
import { Pagination } from '@/components/ui/pagination'
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { Entry, RoomState } from '@/types/Room'
import { getButtonStyles } from '@/utils'
import { useVotingState } from '@/hooks/useVotingState'
import { useVotingActions } from '@/hooks/useVotingActions'



interface VotingTableProps {
  entries: Entry[]
  roomState: RoomState
}

export function VotingTable({ entries, roomState }: VotingTableProps) {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')

  // Use custom hooks for state and actions
  const {
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
  } = useVotingState({ entries, roomId })

  const {
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
  } = useVotingActions({
    entries,
    roomId,
    selectedPoints,
    setSelectedPoints,
    setHasVoted
  })

  // Helper function for button styles
  const getButtonStylesForPoint = (entryId: number, category: string, point: number) => {
    return getButtonStyles(isPointSelected(entryId, category, point), point)
  }

  // If room state is finished or completed, show voting results
  if (roomState === 'finished' || roomState === 'completed') {
    const topEntries = getTopVotedEntries()
    return <VotingResults topEntries={topEntries} />
  }

  return (
    <Card className="gap-3 relative" blurred={true}>
      <CardHeader>
        <VotingTableHeader
          sortMethod={sortMethod}
          handleSort={handleSort}
          hasAnyVotes={hasAnyVotes}
          hasVoted={hasVoted}
          isCheckingVotes={isCheckingVotes}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Entry list */}
          {currentEntries.map((entry) => (
            <VotingEntry
              key={entry.id}
              entry={entry}
              selectedPoints={selectedPoints}
              isPointSelected={isPointSelected}
              getButtonStylesForPoint={getButtonStylesForPoint}
              handlePointClick={handlePointClick}
              handleUpdateMainScore={handleUpdateMainScore}
              checkHasCategoryVotes={checkHasCategoryVotes}
              hasUnupdatedCategoryVotes={hasUnupdatedCategoryVotes}
              getSuggestedScore={getSuggestedScore}
              setSelectedEntry={setSelectedEntry}
            />
          ))}

          {/* Pagination */}
          <Pagination
            totalItems={sortedEntries.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(value) => setPageSize(parseInt(value))}
            pageSizeOptions={[5, 10]}
          />

          {/* Controls */}
          <VotingControls
            hasMinimumVotes={hasMinimumVotes}
            hasAnyVotes={hasAnyVotes}
            countVotedCountries={countVotedCountries}
            onOpenVotingConfirmation={handleOpenVotingConfirmation}
            onOpenResetScoresDialog={() => setIsResetScoresDialogOpen(true)}
          />

          {/* Dialogs */}
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
          <ResetScoresDialog
            isOpen={isResetScoresDialogOpen}
            onClose={() => setIsResetScoresDialogOpen(false)}
            onConfirm={handleResetScores}
          />
        </div>
      </CardContent>
    </Card>
  )
}
