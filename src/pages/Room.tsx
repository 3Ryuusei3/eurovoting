import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { getRoomData } from '@/services/rooms'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { RoomData } from '@/types/Room'

import { ParticipantsList } from '@/components/room/ParticipantsList'
import { SongsList } from '@/components/room/SongsList'
import { VotingTable } from '@/components/room/VotingTable'
import { RoomInfo } from '@/components/room/RoomInfo'

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

  useEffect(() => {
    if (!roomId) return

    const channel = supabase
      .channel('room_users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          try {
            const data = await getRoomData(roomId)
            setRoomData(data)
          } catch (err) {
            console.error('Error reloading room data:', err)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
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

  const isDisplayRole = user?.role_id === 2

  return (
    <div className="container max-w-2xl mx-auto px-2 py-6">
      <RoomInfo roomData={roomData} isDisplayRole={isDisplayRole} />

      <ParticipantsList users={roomData.users} currentUserId={user?.id} />

      <Card className="gap-3">
        <CardHeader>
          <CardTitle>{isDisplayRole ? "Canciones" : "Votaciones"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isDisplayRole ? (
            <SongsList entries={roomData.entries} />
          ) : (
            <VotingTable entries={roomData.entries} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
