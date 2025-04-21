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
import { Box } from "lucide-react"

import { categories, points } from '@/constants'
import { Entry } from '@/types/Room'
import { EntryInfo } from './EntryInfo'
import { getOverlayStyles, getPointTextColor, calculateCategoryPoints, roundToValidScore } from '@/utils'

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
        <Button variant="outline" size="icon" className="size-8">
          <Box className="h-4 w-4" strokeWidth={2} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-xl">
          <DrawerHeader>
            <DrawerTitle>Votar por categorías</DrawerTitle>
            <DrawerDescription className="mb-3">
              Puedes votar en distintas categorías y actualizar la puntuación principal con la media de estas. Se redondeará a la puntuación posible más cercana.
            </DrawerDescription>
            <EntryInfo entry={entry} />
            <div className="ml-auto text-right">
              <div className="text-sm font-medium">
                Tu puntuación principal:
                <span className={`${getPointTextColor(selectedPoints[entry.id]?.main)} text-xl font-bold pl-1`}>
                  {selectedPoints[entry.id]?.main}
                </span>
              </div>
              {hasCategoryVotes(entry.id) && (
                <div className="text-sm font-medium">
                  Media de categorías:
                  <span className={`${getPointTextColor(roundToValidScore(calculateCategoryPoints(selectedPoints, entry.id, categories)))} text-xl font-bold pl-1`}>
                    {roundToValidScore(calculateCategoryPoints(selectedPoints, entry.id, categories))}
                  </span>
                </div>
              )}
            </div>
          </DrawerHeader>

          <div className="px-4 pb-2 space-y-2">
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

          <DrawerFooter className="pb-10">
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
