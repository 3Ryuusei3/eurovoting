import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Loader2, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { getPolls } from '@/services/polls'
import { createRoom } from '@/services/rooms'
import { createUser } from '@/services/users'
import { useStore } from '@/store/useStore'

import { generateRandomColor, getContrastTextColor, generateRoomCode } from '@/utils'
import { Poll } from '@/types/Poll'


export function CreateRoom() {
  const navigate = useNavigate()
  const { setUser, addRoom } = useStore()
  const [selectedPoll, setSelectedPoll] = useState<string>("")
  const [roomCode, setRoomCode] = useState<string>(generateRoomCode())
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPolls() {
      try {
        const data = await getPolls()
        setPolls(data)
      } catch (err) {
        setError("Error al cargar las encuestas. Por favor, inténtelo de nuevo más tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPolls()
  }, [])

  const handleRegenerateCode = () => {
    setRoomCode(generateRoomCode())
  }

  const handleCreateRoom = async () => {
    if (!selectedPoll || !roomCode) return;

    try {
      const room = await createRoom(roomCode, selectedPoll);
      const color = generateRandomColor()
      const text_color = getContrastTextColor(color)

      const user = await createUser("display", 2, room.id, color, text_color);

      addRoom(room);
      setUser(user);

      navigate(`/room?id=${room.id}`);
    } catch (err) {
      console.error("Error al crear la sala:", err);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Crear una nueva sala</CardTitle>
          <CardDescription>Elige una encuesta y crea tu sala</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 mt-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">Código de acceso de la sala</Label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 p-1 border rounded-md bg-muted font-mono text-md text-center">
                {roomCode}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRegenerateCode}
                title="Generar nuevo código"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="pb-2">Elige una encuesta</Label>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : polls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay encuestas disponibles</p>
            ) : (
              <RadioGroup value={selectedPoll} onValueChange={setSelectedPoll} className="space-y-4">
                {polls.map((poll) => (
                  <div key={poll.id} className="flex items-start gap-3 mb-1">
                    <RadioGroupItem value={String(poll.id)} id={`poll-${poll.id}`} className="mt-1" />
                    <div className="grid gap-1 leading-tight">
                      <Label htmlFor={`poll-${poll.id}`} className="text-base font-medium">
                        {poll.name}
                        {!poll.active && (
                          <span className="ml-2 text-sm text-muted-foreground">(Inactiva)</span>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {poll.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleCreateRoom}
            disabled={!selectedPoll}
          >
            <span><span className="font-swiss italic">Crear</span> sala</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
