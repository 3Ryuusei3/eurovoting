import { Entry } from "@/types/Room"
interface EntryInfoProps {
  entry: Entry
  score?: boolean
  categoryAvg?: number
}

export function EntryInfo({ entry }: EntryInfoProps) {
  return (
    <div className="flex items-top sm:items-center gap-3 sm:gap-3">
      <img
        src={entry.country.flag_square}
        alt={entry.country.name_es}
        className="w-12 h-12 sm:w-13 sm:h-13 object-cover"
      />
      <div className="flex-1 flex flex-col justify-top">
        <p className="text-sm sm:text-md pt-1.5 sm:pt-0 font-bold flex items-center font-swiss italic">
          {entry.running_order.toString().padStart(2, '0')} {entry.country.name_es}
        </p>
        <p className="text-xs pb-1.5 sm:pb-0  sm:text-sm font-light leading-4"><span className="font-bold">{entry.artist}</span> - {entry.song}</p>
      </div>
    </div>
  )
}
