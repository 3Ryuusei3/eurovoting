import { useSearchParams } from "react-router-dom"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TopVotedEntry } from "./VotingTable"
import { EntryInfo } from "./EntryInfo"
import { Button } from "../ui/button"

import { getPointTextColor } from "@/utils"
import { useStore } from "@/store/useStore"
import { saveVotesToDatabase } from "@/services/rooms"
import { toast } from "sonner"

interface VotingConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  topVotedEntries: TopVotedEntry[]
  onConfirm?: (updatedPoints: Record<string, Record<string, number>>) => void
  onVotesSubmitted?: () => void
}

export function VotingConfirmationDialog({ isOpen, onClose, topVotedEntries, onConfirm, onVotesSubmitted }: VotingConfirmationDialogProps) {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')
  const { savePoints, getPoints } = useStore()

  const handleConfirm = async () => {
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

    // Save the updated points to local storage
    savePoints(roomId, updatedPoints)

    // Notify parent component about the updated points
    if (onConfirm) {
      onConfirm(updatedPoints)
    }

    // Get the poll ID from the room
    const { user } = useStore.getState()
    if (!user || !user.id) {
      toast.error('Error al guardar los votos: Usuario no encontrado')
      onClose()
      return
    }

    try {
      // Save the votes to the database
      await saveVotesToDatabase(user.id.toString(), roomId, updatedPoints)
      toast.success('Votos guardados correctamente')

      // Notify parent that votes have been submitted
      if (onVotesSubmitted) {
        onVotesSubmitted()
      }
    } catch (error) {
      console.error('Error saving votes to database:', error)
      toast.error('Error al guardar los votos en la base de datos')
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Confirmar votos</DialogTitle>
          <DialogDescription className="leading-4">
            Estos son los 10 países que has elegido que recibirán puntos. Se han ordenado según su puntuación principal y, en caso de empate, por la media de puntos en categorías y, después, por su orden de aparición.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[320px] overflow-y-auto hide-scrollbar py-2">
          {topVotedEntries.map((entry) => (
            <div key={entry.id} className="flex gap-4 items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center gap-2">
                <EntryInfo entry={entry} score userPoints={entry.userPoints} categoryAvg={entry.categoryAvg} />
              </div>
              <div className="flex flex-col items-end">
                <div className={`font-bold text-xl ${getPointTextColor(entry.finalPoints)}`}>
                  {entry.finalPoints}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-center sm:text-left text-muted-foreground pb-1 leading-4">
            Al emitir los votos se actualizarán tus puntuaciones principales para concordar con los votos emitidos. Los países que no aparezcan en la lista pasarán a tener 0 puntos.
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
