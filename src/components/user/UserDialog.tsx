import { useState, useEffect } from 'react'
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
import { getContrastTextColor } from '@/utils'
import { updateUser } from '@/services/users'
import { toast } from 'sonner'
import { ColorPaletteSelector } from '@/components/ui/color-palette-selector'
import { UserAvatar } from '@/components/ui/user-avatar'

interface UserDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function UserDialog({ isOpen, onClose }: UserDialogProps) {
  const { user, setUser } = useStore()
  const [name, setName] = useState(user?.name || '')
  const [color, setColor] = useState(user?.color || '#cccccc')
  const [isLoading, setIsLoading] = useState(false)

  // Update local state when user changes in the store or dialog opens
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name)
      setColor(user.color)
    }
  }, [isOpen, user])

  const handleSave = async () => {
    if (!name.trim() || !user) return

    setIsLoading(true)
    try {
      const text_color = getContrastTextColor(color)
      const updatedUser: User = {
        ...user,
        name: name.trim(),
        color,
        text_color
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
        <div className="space-y-3 py-4">
          <div className="flex items-start gap-4">
            <UserAvatar
              name={name}
              color={color}
              size="lg"
              isCurrentUser={true}
            />
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
              <div className="space-y-2">
                <Label>Elige un color</Label>
                <ColorPaletteSelector
                  selectedColor={color}
                  onColorSelect={setColor}
                  showPreview={!!name}
                  previewText={name}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
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
