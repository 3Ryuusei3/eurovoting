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

  if (!roomData || !roomData.room || !roomData.poll) {
    return null
  }

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
      <Card className="p-4">
        <div className={`flex flex-col justify-between items-center sm:items-center text-center sm:text-left gap-4`}>
          <div className={`flex flex-col gap-2 items-center`}>
            <CardTitle>{roomData.poll.name}</CardTitle>
            <CardDescription>{roomData.poll.description}</CardDescription>
            <Button variant="secondary" className="w-fit mt-2" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
              {roomData.room.code}
            </Button>
          </div>

          {isDisplayRole && (
            <div
              className="cursor-pointer hover:bg-accent/50 transition-colors"
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
