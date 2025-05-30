import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { getPolls } from '@/services/polls'
import { createRoom } from '@/services/rooms'
import { joinRoom } from '@/services/users'
import { useStore } from '@/store/useStore'

import { generateRoomCode } from '@/utils'
import { Poll } from '@/types/Poll'
import { User } from '@/types/User'
import { supabase } from '@/lib/supabase'


export function CreateRoom() {
  const navigate = useNavigate()
  const { user: currentUser, setUser, addRoom } = useStore()
  const [selectedPoll, setSelectedPoll] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [roomCode] = useState<string>(generateRoomCode())
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

  const handleCreateRoom = async () => {
    if (!selectedPoll || !roomCode) return;

    try {
      const room = await createRoom(roomCode, selectedPoll);

      let user: User | null = null

      if (currentUser) {
        // User exists, add them to the room with display role
        const { error: insertError } = await supabase
          .from('user_rooms')
          .insert([
            {
              user_id: currentUser.id,
              room_id: room.id,
              role_id: 2
            }
          ])

        if (insertError) throw insertError
        user = currentUser
      } else {
        // No current user, create a new display user with white background and black text
        const color = '#FFFFFF' // White background
        const text_color = '#000000' // Black text
        user = await joinRoom((userName || currentUser?.name), roomCode, color, text_color, 2)
      }

      addRoom(room);
      setUser(user);
      navigate(`/room?id=${room.id}`);
    } catch (err) {
      console.error("Error al crear la sala:", err);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-10">
      <Card blurred>
        <CardHeader>
          <CardTitle main className="text-2xl">Crear una nueva sala</CardTitle>
          <CardDescription>Elige una encuesta y crea tu sala</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 my-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Nickname</Label>
            <Input
              id="room-name"
              placeholder="Ingresa tu nickname"
              value={userName || currentUser?.name}
              onChange={(e) => setUserName(e.target.value)}
              disabled={!!currentUser}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-code">Código de acceso de la sala</Label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 p-1 bg-muted font-mono text-md text-center">
                {roomCode}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Elige una encuesta</Label>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : polls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay encuestas disponibles</p>
            ) : (
              <RadioGroup value={selectedPoll} onValueChange={setSelectedPoll} className="space-y-2">
                {polls.map((poll) => (
                  <div key={poll.id} className="flex items-start gap-3 mb-1">
                    <RadioGroupItem value={String(poll.id)} id={`poll-${poll.id}`} className="mt-1" />
                    <div className="grid leading-tight">
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

          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Volver
            </Button>
            <Button
              className="w-full"
              onClick={handleCreateRoom}
              disabled={!selectedPoll}
            >
              <span><span className="font-swiss italic">Crear</span> sala</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
