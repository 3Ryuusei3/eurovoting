import { Trophy, Box } from "lucide-react"
import { Entry } from "@/types/Room"

interface EntryInfoProps {
  entry: Entry
  score?: boolean
  userPoints?: number
  categoryAvg?: number
}

export function EntryInfo({ entry, score, userPoints, categoryAvg }: EntryInfoProps) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={entry.country.flag}
        alt={entry.country.name_es}
        className="w-11 h-7 object-cover rounded drop-shadow"
      />
      <div className="flex-1 gap-0">
        <p className="text-sm leading-3">{entry.song} - {entry.artist}</p>
        <p className="text-sm text-muted-foreground flex">
          {entry.running_order.toString().padStart(2, '0')} - {entry.country.name_es}
          {score && userPoints !== undefined && (
            <>
              <span className="mx-1"> / </span>
              <span className="flex items-center gap-0.5">
                <Trophy className="h-3 w-3 inline-block" strokeWidth={2} />
                {userPoints}
              </span>
            </>
          )}
          {score && categoryAvg > 0 && (
            <>
              <span className="mx-1"> - </span>
              <span className="flex items-center gap-0.5">
                <Box className="h-3 w-3 inline-block" strokeWidth={2} />
                {categoryAvg.toFixed(1)}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
