import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { BetOption } from "@/types/Bet"
import { EntryInfo } from "./EntryInfo"
import { betOptionToEntry } from "@/utils/betOptionToEntry"

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
            Estas son las apuestas que has seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="">
            <div className="space-y-3">
              {selectedBets.x5 && (
                <div className="flex items-start gap-2">
                  <div className="bg-[#F5FA00] text-primary-foreground font-bold px-3 py-2">x5</div>
                  <div className="flex-1">
                    {betOptionToEntry(selectedBets.x5) && (
                      <EntryInfo size="sm" entry={betOptionToEntry(selectedBets.x5)!} />
                    )}
                  </div>
                </div>
              )}

              {selectedBets.x3 && (
                <div className="flex items-start gap-2">
                  <div className="bg-[#FF0000] text-white font-bold px-3 py-2">x3</div>
                  <div className="flex-1">
                    {betOptionToEntry(selectedBets.x3) && (
                      <EntryInfo size="sm" entry={betOptionToEntry(selectedBets.x3)!} />
                    )}
                  </div>
                </div>
              )}

              {selectedBets.x1 && (
                <div className="flex items-start gap-2">
                  <div className="bg-primary text-primary-foreground font-bold px-3 py-2">x1</div>
                  <div className="flex-1">
                    {betOptionToEntry(selectedBets.x1) && (
                      <EntryInfo size="sm" entry={betOptionToEntry(selectedBets.x1)!} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-left font-light sm:text-left text-muted-foreground pb-1 leading-4">
            Podrás volver a modificar tus apuestas más tarde si la votación sigue abierta.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
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
