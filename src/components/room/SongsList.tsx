import { Entry } from '@/types/Room'
import playIcon from '@/assets/icons/play-icon.svg'
import { useState } from 'react'
import { YouTubeDialog } from './YouTubeDialog'

interface SongsListProps {
  entries: Entry[]
}

export function SongsList({ entries }: SongsListProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  return (
    <div className="space-y-4">
      {entries.map(entry => (
        <div key={entry.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-primary/5 cursor-pointer">
          <img
            src={entry.country.flag}
            alt={entry.country.name_es}
            className="w-12 h-8 object-cover rounded shadow-sm"
          />
          <div>
            <p className="font-medium">{entry.song} - {entry.artist}</p>
            <p className="text-sm text-muted-foreground">{entry.running_order.toString().padStart(2, '0')} - {entry.country.name_es} {entry.year}</p>
          </div>
          <button
            className="ml-auto"
            onClick={() => setSelectedEntry(entry)}
          >
            <img src={playIcon} alt="Play" width={24} height={24} className="dark:invert" />
          </button>
        </div>
      ))}

      <YouTubeDialog
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
      />
    </div>
  )
}
