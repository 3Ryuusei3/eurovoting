import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Entry } from '@/types/Room'

interface YouTubeDialogProps {
  isOpen: boolean
  onClose: () => void
  entry: Entry | null
}

export function YouTubeDialog({ isOpen, onClose, entry }: YouTubeDialogProps) {
  if (!entry) return null

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getVideoId(entry.youtube)
  if (!videoId) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{entry.song} - {entry.artist}</DialogTitle>
          <DialogDescription>{entry.running_order.toString().padStart(2, '0')} - {entry.country.name_es}</DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            title="YouTube video player"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
