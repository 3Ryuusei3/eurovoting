import { Entry } from '@/types/Room'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import playIcon from '@/assets/icons/play-icon.svg'
import { useState } from 'react'

interface VotingTableProps {
  entries: Entry[]
}

export function VotingTable({ entries }: VotingTableProps) {
  const points = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12]
  const categories = [
    { value: 'song', label: '🎵 Canción' },
    { value: 'singing', label: '🎤 Voz' },
    { value: 'performance', label: '🎭 Interpretación' },
    { value: 'staging', label: '🎬 Puesta en escena' }
  ]

  // Track selected points for each entry and category
  const [selectedPoints, setSelectedPoints] = useState<Record<string, Record<string, number>>>({})

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

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
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
                  <DropdownMenuContent className="w-[400px] p-4">
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.value} className="flex flex-col gap-1">
                          <div className="text-sm font-medium">{category.label}</div>
                          <div className="grid grid-cols-10 w-full">
                            {points.map((point, idx) => (
                              <Button
                                key={idx}
                                variant={isPointSelected(entry.id, category.value, point) ? "default" : "outline"}
                                size="sm"
                                className={`w-full ${idx === 0 ? 'rounded-none rounded-l-sm' : idx === points.length - 1 ? 'rounded-none rounded-r-sm' : 'rounded-none'} ${getButtonStyles(entry.id, category.value, point)}`}
                                onClick={() => handlePointClick(entry.id, category.value, point)}
                              >
                                {point}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link to={entry.youtube} target="_blank">
                <Button variant="outline" size="icon">
                  <img src={playIcon} alt="Play" width={16} height={16} className="dark:invert" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
