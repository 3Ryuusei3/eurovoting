import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RoomUser } from "@/types/Room"

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  user: RoomUser | null
}

export function DeleteUserDialog({ isOpen, onClose, onConfirm, user }: DeleteUserDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar a <strong>{user.name}</strong> de la sala?
            Esta acción eliminará al usuario de la sala, sus votos y sus tarjetas de bingo.
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
