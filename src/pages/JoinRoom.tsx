import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from "@/components/ui/button"
import { Label } from '@/components/ui/label'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { joinRoom } from "@/services/users"
import { useStore } from '@/store/useStore'

import { getContrastTextColor } from '@/utils'
import { ColorPaletteSelector } from '@/components/ui/color-palette-selector'
import { extendedColorPalette } from '@/constants'
import { getRoomByCode } from '@/services/rooms'
import { supabase } from '@/lib/supabase'
import { User } from '@/types/User'

export function JoinRoom() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: currentUser, setUser, addRoom } = useStore()
  const [userName, setUserName] = useState(currentUser?.name || "")
  const [roomCode, setRoomCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string>(extendedColorPalette[0])

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setRoomCode(code.toUpperCase())
    }
  }, [searchParams])

  const handleJoinRoom = async () => {
    if (!roomCode || (!userName && !currentUser)) return

    setLoading(true)
    setError(null)

    try {
      const room = await getRoomByCode(roomCode)

      if (!room) throw new Error('Sala no encontrada')

      let user: User | null = null

      if (currentUser) {
        const { error: insertError } = await supabase
          .from('user_rooms')
          .insert([
            {
              user_id: currentUser.id,
              room_id: room.id,
              role_id: 4
            }
          ])

        if (insertError) {
          console.error('Error inserting user_room:', insertError)
          throw insertError
        }
        user = currentUser
      } else {
        // Use the color selected by the user
        const text_color = getContrastTextColor(selectedColor)
        user = await joinRoom(userName, roomCode, selectedColor, text_color, 4)
      }

      addRoom(room)
      setUser(user)

      navigate(`/room?id=${room.id}`)
    } catch (err) {
      console.error('Error joining room:', err)
      setError(err instanceof Error ? err.message : 'Error al unirse a la sala')
    } finally {
      setLoading(false)
    }
  }

  const disabledButton = loading || !roomCode || !userName

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card blurred>
        <CardHeader>
          <CardTitle main className="text-2xl">Unirse a una sala</CardTitle>
          <CardDescription>Ingresa el código de la sala para unirte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 my-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-code">Código de acceso de la sala</Label>
              <Input
                id="room-code"
                placeholder="Ingresa el código de la sala"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-name">Nickname</Label>
              {currentUser ? (
                <Input
                  id="user-name"
                  placeholder="Ingresa tu nickname"
                  value={currentUser?.name}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={!!currentUser}
                />
              ) : (
                <Input
                  id="user-name"
                  placeholder="Ingresa tu nickname"
                  value={userName || ""}
                  onChange={(e) => setUserName(e.target.value)}
                />
              )}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            {!currentUser && (
              <div className="space-y-2">
                <Label>Elige un color de la paleta</Label>
                <ColorPaletteSelector
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                  showPreview={!!userName}
                  previewText={userName}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 mt-8">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Volver
            </Button>
            <Button
              className="w-full"
              onClick={handleJoinRoom}
              disabled={disabledButton}
            >
              {loading ? 'Uniéndose...' : <span><span className="font-swiss italic">Unirse</span> a la sala</span>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
