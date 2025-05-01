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
import { Star } from "lucide-react"

import { categories, points } from '@/constants'
import { Entry } from '@/types/Room'
import { EntryInfo } from './EntryInfo'
import { calculateCategoryPoints, roundToValidScore } from '@/utils'

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
  handlePointClick,
  handleUpdateMainScore,
  hasCategoryVotes
}: Props) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary" size="icon" className="size-8">
          <Star className="h-4 w-4" strokeWidth={2} />
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
            <div className="flex flex-col sm:flex-row gap-3 w-full ml-auto text-right mt-3">
              <div className="flex items-center justify-between text-sm text-center font-light w-full bg-[#1F1F1F]">
                <span className="pb-1 pt-0.5 px-3">Tu puntuación principal</span>
                <span className={` font-medium tracking-tighter py-2 text-center w-14 bg-[#FF0000] text-white`}>
                  {selectedPoints[entry.id]?.main || '-'}
                </span>
              </div>
              {hasCategoryVotes(entry.id) && (
                <div className="flex items-center justify-between text-sm text-center font-light w-full bg-[#1F1F1F]">
                  <span className="pb-1 pt-0.5 px-3">Media de categorías</span>
                  <span className={`font-medium tracking-tighter py-2 w-14 bg-[#414141] text-white`}>
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
                      variant={isPointSelected(entry.id, category.value, point) ? "cuaternary" : "outline"}
                      size="sm"
                      className={`w-full ${idx === 0 ? '' : idx === points.length - 1 ? '' : ''}`}
                      onClick={() => handlePointClick(entry.id, category.value, point)}
                    >
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
              <Button variant="secondary">Cerrar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
