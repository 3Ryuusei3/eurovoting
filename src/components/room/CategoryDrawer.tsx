// CategoryDrawer.tsx
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

import { categories, points } from '@/constants'
import { Entry } from '@/types/Room'
import { EntryInfo } from './EntryInfo'
import { getOverlayStyles, getPointTextColor } from '@/utils'

interface Props {
  entry: Entry
  selectedPoints: Record<string, Record<string, number>>
  isPointSelected: (entryId: number, category: string, point: number) => boolean
  getButtonStylesForPoint: (entryId: number, category: string, point: number) => string
  handlePointClick: (entryId: number, category: string, point: number) => void
  handleUpdateMainScore: (entryId: number) => void
  hasCategoryVotes: (entryId: number) => boolean
}

export function CategoryDrawer({
  entry,
  selectedPoints,
  isPointSelected,
  getButtonStylesForPoint,
  handlePointClick,
  handleUpdateMainScore,
  hasCategoryVotes
}: Props) {
  return (
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
              <span className={`${getPointTextColor(selectedPoints[entry.id]?.main)} text-xl font-bold pl-1`}>
                {selectedPoints[entry.id]?.main}
              </span>
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
  )
}
