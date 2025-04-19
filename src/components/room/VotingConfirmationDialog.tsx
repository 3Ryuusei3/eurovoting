import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface VotingConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function VotingConfirmationDialog({ isOpen, onClose }: VotingConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar votos</DialogTitle>
          <DialogDescription>¿Estás seguro de querer emitir los votos?</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
