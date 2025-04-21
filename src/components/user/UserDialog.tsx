import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from '@/types/User'
import { useStore } from '@/store/useStore'
import { getInitial } from '@/utils'
import { updateUser } from '@/services/users'
import { toast } from 'sonner'
import { ColorPicker } from '@/components/ui/color-picker'

interface UserDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function UserDialog({ isOpen, onClose }: UserDialogProps) {
  const { user, setUser } = useStore()
  const [name, setName] = useState(user?.name || '')
  const [color, setColor] = useState(user?.color || '#cccccc')
  const [textColor, setTextColor] = useState(user?.text_color || '#000000')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !user) return

    setIsLoading(true)
    try {
      const updatedUser: User = {
        ...user,
        name: name.trim(),
        color,
        text_color: textColor
      }

      const savedUser = await updateUser(updatedUser)
      setUser(savedUser)
      toast.success('Perfil actualizado')
      onClose()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Perfil de usuario</DialogTitle>
          <DialogDescription>
            Personaliza tu nombre y aspecto de fondo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium border-2 border-black dark:border-white shadow-md"
              style={{
                backgroundColor: color,
                color: textColor
              }}
            >
              {getInitial(name)}
            </div>
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nickname</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Introduce tu nickname"
                  autoFocus={false}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="space-y-2 w-full sm:w-48">
                  <Label htmlFor="color">Color de fondo</Label>
                  <ColorPicker
                    id="color"
                    value={color}
                    onChange={setColor}
                  />
                </div>
                <div className="space-y-2 w-full sm:w-48">
                  <Label htmlFor="textColor">Color de texto</Label>
                  <ColorPicker
                    id="textColor"
                    value={textColor}
                    onChange={setTextColor}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cerrar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
