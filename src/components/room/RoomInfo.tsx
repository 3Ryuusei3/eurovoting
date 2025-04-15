import { useState } from 'react'
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { RoomData } from '@/types/Room'
import { QRCodeSVG } from 'qrcode.react'
import { useStore } from "@/store/useStore"
import { toast } from "sonner"
import { QRModal } from './QRModal'

interface RoomInfoProps {
  roomData: RoomData
  isDisplayRole: boolean
}

export function RoomInfo({ roomData, isDisplayRole }: RoomInfoProps) {
  const { theme } = useStore()
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const joinUrl = `${window.location.origin}/join?code=${roomData.room.code}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl)
      toast.success("Código copiado al portapapeles", {
        duration: 5000,
        position: "bottom-right"
      })
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      toast.error("No se pudo copiar el código al portapapeles")
    }
  }

  return (
    <>
      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center text-center sm:text-left gap-4">
          <div className="flex flex-col gap-2 items-center sm:items-start">
            <CardTitle className="text-xl font-bold">{roomData.poll.name}</CardTitle>
            <CardDescription>{roomData.poll.description}</CardDescription>
            <Button variant="outline" className="w-fit" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
              {roomData.room.code}
            </Button>
          </div>

          {isDisplayRole && (
            <div
              className="p-3 border rounded-xl cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setIsQRModalOpen(true)}
          >
            <QRCodeSVG
              value={joinUrl}
              size={90}
              bgColor={theme === 'dark' ? '#171717' : '#fff'}
              fgColor={theme === 'dark' ? '#fff' : '#171717'}
                level="M"
              />
            </div>
          )}
        </div>
      </Card>

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        url={joinUrl}
      />
    </>
  )
}
