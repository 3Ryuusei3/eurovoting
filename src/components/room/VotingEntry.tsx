import { Button } from '@/components/ui/button'
import { EntryInfo } from './EntryInfo'
import { CategoryDrawer } from './CategoryDrawer'
import { Play, Star } from 'lucide-react'
import { Entry } from '@/types/Room'
import { points } from '@/constants'

interface VotingEntryProps {
  entry: Entry
  selectedPoints: Record<string, Record<string, number>>
  isPointSelected: (entryId: number, category: string, point: number) => boolean
  getButtonStylesForPoint: (entryId: number, category: string, point: number) => string
  handlePointClick: (entryId: number, category: string, point: number) => void
  handleUpdateMainScore: (entryId: number) => void
  checkHasCategoryVotes: (entryId: number) => boolean
  hasUnupdatedCategoryVotes: (entryId: number) => boolean
  getSuggestedScore: (entryId: number) => number | null
  setSelectedEntry: (entry: Entry) => void
}

export function VotingEntry({
  entry,
  selectedPoints,
  isPointSelected,
  getButtonStylesForPoint,
  handlePointClick,
  handleUpdateMainScore,
  checkHasCategoryVotes,
  hasUnupdatedCategoryVotes,
  getSuggestedScore,
  setSelectedEntry
}: VotingEntryProps) {
  return (
    <div className="relative flex flex-col gap-3 p-4 bg-[#1F1F1F]">
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
            <Play className="h-4 w-4" strokeWidth={2} />
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
                {point}
                {isSuggestedScore && (
                  <Star className="absolute top-6 right-0.25 p-0.5 border-1 rounded-full border-white bg-[#414141]" strokeWidth={2} />
                )}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
