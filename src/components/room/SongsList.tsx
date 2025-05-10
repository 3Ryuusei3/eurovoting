import { useState } from 'react'

import { EntryInfo } from './EntryInfo';
import { YouTubeDialog } from './YouTubeDialog'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Entry } from '@/types/Room'

interface SongsListProps {
  entries: Entry[]
}

export function SongsList({ entries }: SongsListProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  return (
    <Card blurred={true}>
      <CardHeader>
        <CardTitle main>Canciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-center space-x-4 hover:bg-primary/5 cursor-pointer bg-[#1F1F1F]">
            <div
              className='flex justify-between items-center w-full'
              onClick={() => {
                  setSelectedEntry(entry);
                }}
              >
              <EntryInfo entry={entry} />
            </div>
          </div>
        ))}

        <YouTubeDialog
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          entry={selectedEntry}
        />
      </div>
      </CardContent>
    </Card>
  )
}
