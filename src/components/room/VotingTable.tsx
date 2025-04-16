import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { YouTubeDialog } from './YouTubeDialog'
import { EntryInfo } from './EntryInfo'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Entry, SortMethod } from '@/types/Room'
import { categories, points } from '@/constants'
import { getOverlayStyles, getButtonStyles, getPointTextColor } from '@/utils'
import { useStore } from '@/store/useStore'

import playIcon from '@/assets/icons/play-icon.svg'

interface VotingTableProps {
  entries: Entry[]
}

export function VotingTable({ entries }: VotingTableProps) {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')
  const [selectedPoints, setSelectedPoints] = useState<Record<string, Record<string, number>>>({})
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [sortMethod, setSortMethod] = useState<SortMethod>('running_order')
  const [sortedEntries, setSortedEntries] = useState<Entry[]>(entries)

  const { savePoints, getPoints } = useStore()

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

  const calculateTotalPoints = (entryId: number) => {
    const entryPoints = selectedPoints[entryId]
    if (!entryPoints) return 0

    return entryPoints.main || 0
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
        if (pointsA === pointsB) {
          return a.running_order - b.running_order
        }
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
          <span>Ordenar por <span className='font-swiss italic p-0'>actuación</span></span>
        </Button>
        <Button
          variant={sortMethod === 'points' ? 'default' : 'outline'}
          onClick={() => handleSort('points')}
          disabled={!hasAnyVotes}
        >
          <span>Ordenar por <span className='font-swiss italic p-0'>puntuación</span></span>
        </Button>
      </div>

      {sortedEntries.map((entry) => (
        <div key={entry.id} className="relative flex flex-col gap-3 p-4 border rounded-lg">
          {selectedPoints[entry.id]?.main && (
            <div className={getOverlayStyles(selectedPoints[entry.id]?.main)}></div>
          )}
          <EntryInfo entry={entry} />

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

            {/* Categories drawer and video button */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Votar por <span className='font-swiss italic p-0'>categorías</span></span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="mx-auto w-full max-w-xl">
                      <DrawerHeader>
                        <DrawerTitle>Votar por categorías</DrawerTitle>
                        <DrawerDescription>
                          Puedes votar también por categorías si lo prefieres y actualizar la puntuación principal.
                        </DrawerDescription>
                        <EntryInfo entry={entry} />
                        <div className="text-sm font-medium ml-auto">
                          Tu puntuación principal:
                          <span className={`${getPointTextColor(selectedPoints[entry.id]?.main)} text-xl font-bold pl-1`}>{selectedPoints[entry.id]?.main}</span>
                        </div>
                      </DrawerHeader>

                      <div className="p-4 space-y-4">
                        {categories.map((category) => (
                          <div key={category.value} className="flex flex-col gap-1">
                            <div className="text-sm font-medium">{category.label}</div>
                            <div className="grid grid-cols-10 w-full">
                              {points.map((point, idx) => (
                                <Button
                                  key={idx}
                                  variant={isPointSelected(entry.id, category.value, point) ? "default" : "outline"}
                                  size="sm"
                                  className={`w-full ${idx === 0 ? 'rounded-none rounded-l-sm' : idx === points.length - 1 ? 'rounded-none rounded-r-sm' : 'rounded-none'} ${getButtonStylesForPoint(entry.id, category.value, point)}`}
                                  onClick={() => handlePointClick(entry.id, category.value, point)}
                                >
                                  {isPointSelected(entry.id, category.value, point) && (
                                    <div className={getOverlayStyles(point, true)}></div>
                                  )}
                                  {point}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <DrawerFooter>
                        <Button
                          className="w-full"
                          disabled={!hasCategoryVotes(entry.id)}
                          onClick={() => handleUpdateMainScore(entry.id)}
                        >
                          Actualizar puntuación principal
                        </Button>
                        <DrawerClose asChild>
                          <Button variant="outline">Cerrar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
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
