import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { createUser } from "@/services/users"
import { useStore } from '@/store/useStore'

import { generateRandomColor, getContrastTextColor } from '@/utils'
import { getRoomByCode } from '@/services/rooms'

export function JoinRoom() {
  const navigate = useNavigate()
  const { setUser, setRoom } = useStore()
  const [userName, setUserName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleJoinRoom = async () => {
    if (!roomCode || !userName) return

    setLoading(true)
    setError(null)

    try {
      const room = await getRoomByCode(roomCode)

      if (!room) throw new Error('Sala no encontrada')

      const color = generateRandomColor()
      const text_color = getContrastTextColor(color)

      const user = await createUser(userName, "4", room.id, color, text_color)

      setRoom(room)
      setUser(user)

      navigate(`/room?id=${room.id}`)
    } catch (err) {
      console.error('Error joining room:', err)
      setError(err instanceof Error ? err.message : 'Error al unirse a la sala')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Unirse a una sala</CardTitle>
          <CardDescription>Ingresa el código de la sala para unirte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Ingresa el código de la sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <Input
              placeholder="Ingresa tu nombre"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button
            className="w-full"
            onClick={handleJoinRoom}
            disabled={!roomCode || !userName || loading}
          >
            {loading ? 'Uniéndose...' : <span><span className="font-swiss italic">Unirse</span> a la sala</span>}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
