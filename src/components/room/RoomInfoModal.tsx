import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Info } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star } from 'lucide-react';
import { useStore } from "@/store/useStore"

interface RoomInfoModalProps {
  buttonPosition?: 'header' | 'inline'
}

export function RoomInfoModal({ buttonPosition = 'header' }: RoomInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')
  const { getInfoModalShown, setInfoModalShown } = useStore()

  // Mostrar el modal automáticamente la primera vez
  useEffect(() => {
    if (roomId && !getInfoModalShown(roomId)) {
      setIsOpen(true)
      setInfoModalShown(roomId, true)
    }
  }, [roomId, getInfoModalShown, setInfoModalShown])

  const handleClose = () => {
    setIsOpen(false)
  }

  const renderButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsOpen(true)}
      className={buttonPosition === 'header' ? "ml-2" : ""}
    >
      <Info className="h-5 w-5" />
      <span className="sr-only">Información</span>
    </Button>
  )

  return (
    <>
      {renderButton()}

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Funcionamiento
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-4">
            <p>
              Aquí aparecerán la lista de países a los que puedes votar. Puedes otorgar tus votos de manera general o puedes hacerlo por categorías <Star className="inline-block pb-0.5" strokeWidth={2} size={16} /> y puntuar las que desees. Podrás actualizar tu puntuación principal en base a tus categorías o mantenerla.
            </p>
            <p>
              Al emitir tus votos, se ordenarán según su puntuación principal y, en caso de empate, por la media de puntos en categorías y, después, por su orden de aparición.
            </p>
            <p>
              Tras emitir los votos se actualizarán tus puntuaciones principales para concordar con los votos emitidos. Los países que no aparezcan en la lista pasarán a tener 0 puntos en la puntuación principal. Puedes volver a emitir votos mientras el administrador no cierre la votación.
            </p>
            <p>
              Cuando todos los usuarios hayan votado, se procederá a mostrar los resultados de todos los participantes.
            </p>

          </DialogDescription>
          <DialogFooter>
            <Button onClick={handleClose}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
