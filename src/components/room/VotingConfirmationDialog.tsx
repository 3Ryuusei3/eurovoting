import { useSearchParams } from "react-router-dom"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TopVotedEntry } from "./VotingTable"
import { Button } from "../ui/button"
import { VotingResults } from "./VotingResults"

import { useStore } from "@/store/useStore"
import { saveVotesToDatabase, getRoomData } from "@/services/rooms"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface VotingConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  topVotedEntries: TopVotedEntry[]
  onConfirm?: (updatedPoints: Record<string, Record<string, number>>) => void
  onVotesSubmitted?: () => void
}

export function VotingConfirmationDialog({ isOpen, onClose, topVotedEntries, onConfirm, onVotesSubmitted }: VotingConfirmationDialogProps) {
  const [isVotingClosed, setIsVotingClosed] = useState(false)
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')
  const { savePoints, getPoints } = useStore()

  // Check if voting is closed when dialog opens
  useEffect(() => {
    if (isOpen && roomId) {
      const checkRoomState = async () => {
        try {
          const roomData = await getRoomData(roomId)
          setIsVotingClosed(roomData.room.state === 'finished' || roomData.room.state === 'completed')
        } catch (error) {
          console.error('Error checking room state:', error)
        }
      }

      checkRoomState()
    }
  }, [isOpen, roomId])

  const handleConfirm = async () => {
    if (!roomId || isVotingClosed) return

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
      <DialogContent className="overflow-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Confirmar votos</DialogTitle>
          <DialogDescription className="leading-4">
            Estos son los 10 países que has elegido que recibirán puntos. Se han ordenado según su puntuación principal y, en caso de empate, por la media de puntos en categorías y, después, por su orden de aparición.
          </DialogDescription>
        </DialogHeader>

        <VotingResults
          topEntries={topVotedEntries}
          showCard={false}
        />
        <div className="flex flex-col gap-4">
          <p className="text-sm text-left font-light sm:text-left text-muted-foreground pb-1 leading-4">
            Al emitir los votos se actualizarán tus puntuaciones principales para concordar con los votos emitidos. Los países que no aparezcan en la lista pasarán a tener 0 puntos en la puntuación principal.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Revisar votos
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isVotingClosed}
            >
              <span>
                {isVotingClosed ? (
                  'Votación cerrada'
                ) : (
                  'Emitir votos'
                )}
              </span>
            </Button>
            {isVotingClosed && (
              <p className="text-sm text-red-500 mt-2 text-center">
                La votación ha sido cerrada por el administrador.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
