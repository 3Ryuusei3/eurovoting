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
import { Star, Music, Mic, Theater, Clapperboard } from "lucide-react"

import { categories, points } from '@/constants'
import { Entry } from '@/types/Room'
import { EntryInfo } from './EntryInfo'
import { calculateCategoryPoints, roundToValidScore } from '@/utils'

// Map of icon names to components
const iconMap = {
  Music,
  Mic,
  Theater,
  Clapperboard
}

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
        <Button variant="secondary" size="icon" className="size-6 sm:size-9">
          <Star className="h-3 w-3" strokeWidth={2} />
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full ml-auto text-right mt-3">
              <div className="flex items-center justify-between text-sm text-center font-light w-full bg-[#1F1F1F]">
                <span className="pb-1 pt-0.5 px-3 font-medium">Tu puntuación principal</span>
                <span className={` font-medium tracking-tighter py-2 text-center w-14 bg-[#FF0000] text-white`}>
                  {selectedPoints[entry.id]?.main || '-'}
                </span>
              </div>
              {hasCategoryVotes(entry.id) && (
                <div className="flex items-center justify-between text-sm text-center font-light w-full bg-[#1F1F1F]">
                  <span className="pb-1 pt-0.5 px-3 font-medium">Media de categorías</span>
                  <span className={`font-medium tracking-tighter py-2 w-14 bg-[#414141] text-white`}>
                    {roundToValidScore(calculateCategoryPoints(selectedPoints, entry.id, categories))}
                  </span>
                </div>
              )}
            </div>
          </DrawerHeader>

          <div className="px-4 pb-2 space-y-2">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap];
              return (
                <div key={category.value} className="flex flex-col gap-1">
                  <div className="text-sm font-medium flex items-center gap-1">
                    <IconComponent className="h-4 w-4" strokeWidth={2} />
                    <span>{category.label}</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1 w-full">
                    {points.map((point, idx) => (
                      <Button
                        key={idx}
                        variant={isPointSelected(entry.id, category.value, point) ? "cuaternary" : "outline"}
                        size="sm"
                        className={`w-full ${idx === 0 ? '' : idx === points.length - 1 ? '' : ''} border-0`}
                        onClick={() => handlePointClick(entry.id, category.value, point)}
                      >
                        {point}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
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
