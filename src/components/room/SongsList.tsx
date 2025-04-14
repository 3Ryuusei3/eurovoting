import { Link } from 'react-router-dom'
import { Entry } from '@/types/Room'
import playIcon from '@/assets/icons/play-icon.svg'

interface SongsListProps {
  entries: Entry[]
}

export function SongsList({ entries }: SongsListProps) {
  return (
    <div className="space-y-4">
      {entries.map(entry => (
        <div key={entry.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-primary/5 cursor-pointer">
          <img
            src={entry.country.flag}
            alt={entry.country.name_es}
            className="w-12 h-8 object-cover rounded"
          />
          <div>
            <p className="font-medium">{entry.song} - {entry.artist}</p>
            <p className="text-sm text-muted-foreground">{entry.running_order.toString().padStart(2, '0')} - {entry.country.name_es} {entry.year}</p>
          </div>
          <Link className="ml-auto" to={entry.youtube} target="_blank">
            <img src={playIcon} alt="Play" width={32} height={32} className="dark:invert" />
          </Link>
        </div>
      ))}
    </div>
  )
}
