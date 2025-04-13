import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { getRoomData } from '@/services/rooms'
import { useStore } from '@/store/useStore'

import { getInitial } from '@/utils'
import { RoomData } from '@/types/Room'

import playIcon from '@/assets/icons/play-icon.svg'

export function Room() {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')
  const { user } = useStore()

  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRoomData() {
      if (!roomId) return

      try {
        const data = await getRoomData(roomId)
        setRoomData(data)
      } catch (err) {
        console.error('Error loading room data:', err)
        setError('Error al cargar los datos de la sala')
      } finally {
        setLoading(false)
      }
    }

    loadRoomData()
  }, [roomId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !roomData) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Sala no encontrada'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sala: {roomData.room.code}</CardTitle>
          <CardDescription>Código de acceso</CardDescription>
        </CardHeader>
      </Card>

      <Card className="mb-6 gap-3">
        <CardHeader>
          <CardTitle>Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roomData.users.map(u => {
              const isCurrentUser = u.id === user?.id;
              return (
                <div
                  key={u.id}
                  title={u.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition
                    ${isCurrentUser ? 'outline-2 outline-black dark:outline-white shadow-lg' : ''}`}
                  style={{
                    backgroundColor: u.color || '#cccccc',
                    color: u.text_color || '#000000'
                  }}
                >
                  {getInitial(u.name)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>


      <Card className="gap-3">
        <CardHeader>
          <CardTitle>Canciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roomData.entries.map(entry => (
              <div key={entry.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-primary/5 cursor-pointer">
                <img
                  src={entry.country.flag}
                  alt={entry.country.name_es}
                  className="w-12 h-8 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{entry.song} - {entry.artist}</p>
                  <p className="text-sm text-muted-foreground">{entry.running_order.toString().padStart(2, '0')} - {entry.country.name_es} {entry.year}</p>
                </div>
                <Link className="ml-auto" to={entry.youtube} target="_blank">
                  <img src={playIcon} alt="Play" width={32} height={32} className="dark:invert" />
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
