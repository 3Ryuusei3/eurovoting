import { Entry } from '@/types/Room'
import { Input } from '@/components/ui/input'

interface VotingTableProps {
  entries: Entry[]
}

export function VotingTable({ entries }: VotingTableProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-4 p-2 border rounded-lg">
          <div className="w-8 text-center font-medium text-muted-foreground">{entry.running_order.toString().padStart(2, '0')}</div>
          <img
            src={entry.country.flag}
            alt={entry.country.name_es}
            className="w-8 h-6 object-cover rounded"
          />
          <div className="flex-1">
            <div className="text-sm">{entry.song}</div>
            <div className="text-sm text-muted-foreground">{entry.artist}</div>
          </div>
          <Input
            type="number"
            min="1"
            max="12"
            className="w-10 text-center"
            placeholder='#'
          />
        </div>
      ))}
    </div>
  )
}
