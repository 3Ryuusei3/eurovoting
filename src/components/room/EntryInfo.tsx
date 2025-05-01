import { Star } from "lucide-react"
import { Entry } from "@/types/Room"

interface EntryInfoProps {
  entry: Entry
  score?: boolean
  categoryAvg?: number
}

export function EntryInfo({ entry, score, categoryAvg }: EntryInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={entry.country.flag}
        alt={entry.country.name_es}
        className="w-11 h-7 object-cover drop-shadow"
      />
      <div className="flex-1">
        <p className="text-sm font-bold flex items-center">
          {entry.running_order.toString().padStart(2, '0')} - {entry.country.name_es}
          {score && categoryAvg > 0 && (
            <>
              <span className="mx-1"> - </span>
              <span className="flex items-center gap-0.5 text-xs">
                <Star className="h-2 w-2 inline-block" strokeWidth={2} />
                {categoryAvg.toFixed(1)}
              </span>
            </>
          )}
        </p>
        <p className="text-sm font-light leading-3">{entry.song} - {entry.artist}</p>
      </div>
    </div>
  )
}
