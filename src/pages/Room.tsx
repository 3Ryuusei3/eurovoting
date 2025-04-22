import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from "lucide-react"

import { getRoomData } from '@/services/rooms'
import { getUserRoleForRoom } from '@/services/users'
import { useStore } from '@/store/useStore'
import { RoomData } from '@/types/Room'

import { ParticipantsList } from '@/components/room/ParticipantsList'
import { SongsList } from '@/components/room/SongsList'
import { VotingTable } from '@/components/room/VotingTable'
import { VotesList } from '@/components/room/VotesList'
// import { VotesMatrix } from '@/components/room/VotesMatrix'
import { RoomInfo } from '@/components/room/RoomInfo'
import { useRoomSubscription } from '@/hooks/useRoomSubscription'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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
    <div className="container max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <div className="flex flex-col sm:flex-shrink-0 md:max-w-[280px]">
        <RoomInfo roomData={roomData} isDisplayRole={isDisplayRole} />
        <ParticipantsList users={roomData.users} currentUserId={user?.id} roomId={roomId} />
        {isDisplayRole && (
          <Button>
            <span><span className="font-swiss italic">Cerrar</span> las votaciones</span>
          </Button>
        )}
      </div>
      <div className="flex flex-col flex-1">
        {isDisplayRole ? (
          <Tabs defaultValue="songs" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="songs">Canciones</TabsTrigger>
              <TabsTrigger value="votes">Votos</TabsTrigger>
            </TabsList>
            <TabsContent value="songs">
              <SongsList entries={roomData.entries} />
            </TabsContent>
            <TabsContent value="votes">
              <VotesList
                roomId={roomId}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <VotingTable entries={roomData.entries} />
        )}
      </div>
    </div>
  )
}
