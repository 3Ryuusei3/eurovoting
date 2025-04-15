import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { YouTubeDialog } from './YouTubeDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

import { Entry, SortMethod } from '@/types/Room'
import { categories, points } from '@/constants'

import playIcon from '@/assets/icons/play-icon.svg'

interface VotingTableProps {
  entries: Entry[]
}

export function VotingTable({ entries }: VotingTableProps) {
  const [selectedPoints, setSelectedPoints] = useState<Record<string, Record<string, number>>>({})
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [sortMethod, setSortMethod] = useState<SortMethod>('running_order')
  const [sortedEntries, setSortedEntries] = useState<Entry[]>(entries)

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

  const getButtonStyles = (entryId: number, category: string, point: number) => {
    if (!isPointSelected(entryId, category, point)) return "outline"
    if (point === 12) return "bg-yellow-600 hover:bg-yellow-700 text-white"
    if (point === 10) return "bg-gray-500 hover:bg-gray-600 text-white"
    return "default"
  }

  const calculateTotalPoints = (entryId: number) => {
    const entryPoints = selectedPoints[entryId]
    if (!entryPoints) return 0

    return Object.values(entryPoints).reduce((sum, points) => sum + (points || 0), 0)
  }

  const calculateCategoryPoints = (entryId: number) => {
    const entryPoints = selectedPoints[entryId]
    if (!entryPoints) return 0

    const votedCategories = categories.filter(category => entryPoints[category.value] !== undefined)
    if (votedCategories.length === 0) return 0

    const totalPoints = votedCategories.reduce((sum, category) => {
      return sum + (entryPoints[category.value] || 0)
    }, 0)

    return Math.round(totalPoints / votedCategories.length)
  }

  const hasAnyVotes = Object.keys(selectedPoints).length > 0

  const handleSort = (method: SortMethod) => {
    setSortMethod(method)
    const newSortedEntries = [...entries].sort((a, b) => {
      if (method === 'running_order') {
        return a.running_order - b.running_order
      } else {
        const pointsA = calculateTotalPoints(a.id)
        const pointsB = calculateTotalPoints(b.id)
        return pointsB - pointsA
      }
    })
    setSortedEntries(newSortedEntries)
  }

  const handleUpdateMainScore = (entryId: number) => {
    const categoryPoints = calculateCategoryPoints(entryId)
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

  const hasCategoryVotes = (entryId: number) => {
    const entryPoints = selectedPoints[entryId]
    if (!entryPoints) return false

    return categories.some(category => entryPoints[category.value] !== undefined)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end flex-wrap gap-2">
        <Button
          variant={sortMethod === 'running_order' ? 'default' : 'outline'}
          onClick={() => handleSort('running_order')}
        >
          Orden por actuación
        </Button>
        <Button
          variant={sortMethod === 'points' ? 'default' : 'outline'}
          onClick={() => handleSort('points')}
          disabled={!hasAnyVotes}
        >
          Orden por puntuación
        </Button>
      </div>

      {sortedEntries.map((entry) => (
        <div key={entry.id} className="flex flex-col gap-3 p-4 border rounded-lg">
          <div className="flex items-start gap-4">
            <img
              src={entry.country.flag}
              alt={entry.country.name_es}
              className="w-11 h-7 object-cover rounded"
            />
            <div className="flex-1 gap-0">
              <p className="text-sm leading-3">{entry.song} - {entry.artist}</p>
              <p className="text-sm text-muted-foreground leading-5">{entry.running_order.toString().padStart(2, '0')} - {entry.country.name_es}</p>
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
                  className={`w-full ${idx === 0 ? 'rounded-none rounded-l-sm' : idx === points.length - 1 ? 'rounded-none rounded-r-sm' : 'rounded-none'} ${getButtonStyles(entry.id, 'main', point)}`}
                  onClick={() => handlePointClick(entry.id, 'main', point)}
                >
                  {point}
                </Button>
              ))}
            </div>

            {/* Categories dropdown and video button */}
            <div className="flex gap-2">
              <div className="flex-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Categorías
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[350px] p-4 ">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground pb-2">Puedes votar también por categorías si lo prefieres y actualizar la puntuación principal.</p>
                      {categories.map((category) => (
                        <div key={category.value} className="flex flex-col gap-1">
                          <div className="text-sm font-medium">{category.label}</div>
                          <div className="grid grid-cols-10 w-full">
                            {points.map((point, idx) => (
                              <Button
                                key={idx}
                                variant={isPointSelected(entry.id, category.value, point) ? "default" : "outline"}
                                size="sm"
                                className={`w-full ${idx === 0 ? 'rounded-none rounded-l-sm' : idx === points.length - 1 ? 'rounded-none rounded-r-sm' : 'rounded-none'} ${getButtonStyles(entry.id, category.value, point)} p-0`}
                                onClick={() => handlePointClick(entry.id, category.value, point)}
                              >
                                {point}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <Button
                        className="mt-2 w-full"
                        disabled={!hasCategoryVotes(entry.id)}
                        onClick={() => handleUpdateMainScore(entry.id)}
                      >
                        Actualizar puntuación principal
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedEntry(entry)}
              >
                <img src={playIcon} alt="Play" width={16} height={16} className="dark:invert" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <YouTubeDialog
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
      />
    </div>
  )
}
