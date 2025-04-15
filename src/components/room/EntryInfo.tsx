import { Entry } from "@/types/Room"

interface EntryInfoProps {
  entry: Entry
}

export function EntryInfo({ entry }: EntryInfoProps) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <img
        src={entry.country.flag}
        alt={entry.country.name_es}
        className="w-11 h-7 object-cover rounded drop-shadow"
      />
      <div className="flex-1 gap-0">
        <p className="text-sm leading-3">{entry.song} - {entry.artist}</p>
        <p className="text-sm text-muted-foreground leading-5">{entry.running_order.toString().padStart(2, '0')} - {entry.country.name_es}</p>
      </div>
    </div>
  )
}
