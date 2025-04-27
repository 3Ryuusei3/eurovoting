import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ResetScoresDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ResetScoresDialog({ isOpen, onClose, onConfirm }: ResetScoresDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reiniciar puntuaciones</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres reiniciar todas tus puntuaciones? Esta acción eliminará todos tus votos actuales y no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Reiniciar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
