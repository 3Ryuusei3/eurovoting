import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { BetOption } from "@/types/Bet"

interface BetsConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedBets: {
    x5: BetOption | undefined
    x3: BetOption | undefined
    x1: BetOption | undefined
  }
}

export function BetsConfirmationDialog({ isOpen, onClose, onConfirm, selectedBets }: BetsConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Confirmar apuestas</DialogTitle>
          <DialogDescription className="leading-4">
            Estas son las apuestas que has seleccionado. Una vez enviadas, no podrás modificarlas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="bg-muted p-4">
            <div className="space-y-3">
              {selectedBets.x5 && (
                <div className="flex items-center gap-3">
                  <div className="bg-[#F5FA00] text-primary-foreground font-bold px-3 py-1">x5</div>
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedBets.x5.country_squared}
                      alt={selectedBets.x5.country_name}
                      className="w-8 h-8 object-cover"
                    />
                    <span>{selectedBets.x5.country_name}</span>
                  </div>
                </div>
              )}

              {selectedBets.x3 && (
                <div className="flex items-center gap-3">
                  <div className="bg-[#FF0000] text-white font-bold px-3 py-1">x3</div>
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedBets.x3.country_squared}
                      alt={selectedBets.x3.country_name}
                      className="w-8 h-8 object-cover"
                    />
                    <span>{selectedBets.x3.country_name}</span>
                  </div>
                </div>
              )}

              {selectedBets.x1 && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground font-bold px-3 py-1">x1</div>
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedBets.x1.country_squared}
                      alt={selectedBets.x1.country_name}
                      className="w-8 h-8 object-cover"
                    />
                    <span>{selectedBets.x1.country_name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-left font-light sm:text-left text-muted-foreground pb-1 leading-4">
            Una vez enviadas, las apuestas no podrán ser modificadas. ¿Estás seguro de que quieres continuar?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Revisar apuestas
            </Button>
            <Button onClick={onConfirm}>
              Confirmar apuestas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
