import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from '@/types/User'
import { useStore } from '@/store/useStore'
import { getInitial } from '@/utils'
import { updateUser } from '@/services/users'
import { toast } from 'sonner'
import { ColorPicker } from '@/components/ui/color-picker'
import { useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

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
  const [isDisplayRole, setIsDisplayRole] = useState(false)
  const location = useLocation()
  const roomId = new URLSearchParams(location.search).get('id')

  useEffect(() => {
    async function checkUserRole() {
      if (!user || !roomId) {
        setIsDisplayRole(false)
        return
      }

      const { data, error } = await supabase
        .from('user_rooms')
        .select('role_id')
        .eq('user_id', user.id)
        .eq('room_id', roomId)
        .single()

      if (!error && data) {
        setIsDisplayRole(parseInt(data.role_id) === 2)
      } else {
        setIsDisplayRole(false)
      }
    }

    checkUserRole()
  }, [user, roomId])

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

  if (!user || isDisplayRole) {
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
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium"
              style={{
                backgroundColor: color,
                color: textColor
              }}
            >
              {getInitial(name)}
            </div>
            <div className="flex-1 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="color">Color de fondo</Label>
                  <ColorPicker
                    id="color"
                    value={color}
                    onChange={setColor}
                  />
                </div>
                <div className="space-y-2">
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
              Cancelar
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
