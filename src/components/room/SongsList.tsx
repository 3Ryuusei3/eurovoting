import { useState } from 'react'

import { Play } from 'lucide-react';
import { EntryInfo } from './EntryInfo';
import { YouTubeDialog } from './YouTubeDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Entry } from '@/types/Room'

interface SongsListProps {
  entries: Entry[]
}

export function SongsList({ entries }: SongsListProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  return (
    <Card className=''>
      <CardHeader>
        <CardTitle>Canciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-primary/5 cursor-pointer">
            <div className='flex justify-between items-center w-full'>
              <EntryInfo entry={entry} />
              <Button
                variant='ghost'
                className='size-8'
                onClick={() => {
                  console.log('Selected entry:', entry);
                  setSelectedEntry(entry);
                }}
              >
                <Play className="h-6 w-6" strokeWidth={2} />
              </Button>
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
