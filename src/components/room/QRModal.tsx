import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { QRCodeSVG } from 'qrcode.react'
import { useStore } from "@/store/useStore"

interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
}

export function QRModal({ isOpen, onClose, url }: QRModalProps) {
  const { theme } = useStore()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Código de la sala
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Escanea el código QR para unirte a la sala
        </DialogDescription>
        <div className="flex justify-center p-4">
          <QRCodeSVG
            value={url}
            size={200}
            bgColor={theme === 'dark' ? '#000' : '#fff'}
            fgColor={theme === 'dark' ? '#fff' : '#000'}
            level="M"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
