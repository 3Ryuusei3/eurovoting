import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { TopVotedEntry } from "./VotingTable"
import { EntryInfo } from "./EntryInfo"
import { getPointTextColor } from "@/utils"
import { useSearchParams } from "react-router-dom"
import { useStore } from "@/store/useStore"

interface VotingConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  topVotedEntries: TopVotedEntry[]
}

export function VotingConfirmationDialog({ isOpen, onClose, topVotedEntries }: VotingConfirmationDialogProps) {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')
  const { savePoints, getPoints } = useStore()

  const handleConfirm = () => {
    if (!roomId) return

    // Get current points
    const currentPoints = getPoints(roomId) || {}
    const updatedPoints = { ...currentPoints }

    // First, set all main scores to 0
    Object.keys(updatedPoints).forEach(entryId => {
      if (updatedPoints[entryId]) {
        updatedPoints[entryId] = {
          ...updatedPoints[entryId],
          main: 0
        }
      }
    })

    // Then update the top 10 with their Eurovision points
    topVotedEntries.forEach(entry => {
      updatedPoints[entry.id] = {
        ...updatedPoints[entry.id] || {},
        main: entry.finalPoints
      }
    })

    // Save the updated points
    savePoints(roomId, updatedPoints)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar votos</DialogTitle>
          <DialogDescription>
            Estos son los 10 países que has elegido que recibirán puntos. Se han ordenado según tus votos, y en caso de empate, por la media de puntos en categorías y después por su orden de aparición.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto hide-scrollbar py-2">
          {topVotedEntries.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium w-6 text-center">{index + 1}.</div>
                <EntryInfo entry={entry} />
              </div>
              <div className="flex items-center gap-2">
                <div className={`font-bold text-lg ${getPointTextColor(entry.finalPoints)}`}>
                  {entry.finalPoints}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <p className="text-sm text-center sm:text-left text-muted-foreground pb-2">
            Al emitir los votos se actualizarán tus puntuaciones para concordar con los votos emitidos. Los países que no aparezcan en la lista pasarán a tener 0 puntos.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              <span><span className="font-swiss italic">Revisar</span> votos</span>
            </Button>
            <Button onClick={handleConfirm}>
              <span><span className="font-swiss italic">Emitir</span> votos</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
