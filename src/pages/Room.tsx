import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { getRoomData } from '@/services/rooms'
import { getUserRoleForRoom } from '@/services/users'
import { useStore } from '@/store/useStore'
import { RoomData } from '@/types/Room'

import { ParticipantsList } from '@/components/room/ParticipantsList'
import { SongsList } from '@/components/room/SongsList'
import { VotingTable } from '@/components/room/VotingTable'
import { RoomInfo } from '@/components/room/RoomInfo'
import { useRoomSubscription } from '@/hooks/useRoomSubscription'

export function Room() {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('id')
  const { user } = useStore()

  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<number | null>(null)

  const handleRoomDataUpdate = useCallback((data: RoomData) => {
    setRoomData(data)
  }, [])

  useRoomSubscription({ roomId, onRoomDataUpdate: handleRoomDataUpdate })

  useEffect(() => {
    async function loadRoomData() {
      if (!roomId) return

      try {
        const data = await getRoomData(roomId)
        setRoomData(data)

        if (user) {
          const roleId = await getUserRoleForRoom(user.id, roomId)
          if (roleId !== null) {
            setUserRole(roleId)
          }
        }
      } catch (err) {
        console.error('Error loading room data:', err)
        setRoomData(null)
      } finally {
        setLoading(false)
      }
    }

    loadRoomData()
  }, [roomId, user])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!roomData || !roomData.room || !roomData.poll || !roomData.users || !roomData.entries) {
    return null
  }

  const isDisplayRole = userRole === 2

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
