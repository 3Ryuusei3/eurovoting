import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from "lucide-react"

import { getRoomData, updateRoomState } from '@/services/rooms'
import { getUserRoleForRoom } from '@/services/users'
import { useStore } from '@/store/useStore'
import { RoomData, RoomState } from '@/types/Room'
import { toast } from 'sonner'

import { ParticipantsList } from '@/components/room/ParticipantsList'
import { SongsList } from '@/components/room/SongsList'
import { VotingTable } from '@/components/room/VotingTable'
import { VotesList } from '@/components/room/VotesList'
import { VotingScreen } from '@/components/room/VotingScreen'
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
  const [activeTab, setActiveTab] = useState("songs")

  const handleRoomDataUpdate = useCallback((data: RoomData) => {
    // Check if the room state has changed
    if (roomData && roomData.room && data.room && roomData.room.state !== data.room.state) {
      toast.info(`El estado de la sala ha cambiado a: ${data.room.state === 'voting' ? 'Votación abierta' : 'Votación cerrada'}`)

      // If room state changed to voting and we're on scores tab, switch to songs tab
      if (data.room.state === 'voting' && activeTab === 'scores') {
        setActiveTab('songs')
      }
    }

    setRoomData(data)
  }, [roomData, activeTab])

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
  const roomState = roomData.room.state || 'voting'

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <div
        className={`flex flex-col gap-6 sm:flex-shrink-0 md:max-w-[280px] transition-all duration-500 ease-in-out ${activeTab === 'scores' ? 'md:w-0 md:opacity-0 md:overflow-hidden md:max-w-0 md:invisible' : 'md:opacity-100 md:max-w-[280px]'}`}
      >
        <RoomInfo roomData={roomData} isDisplayRole={isDisplayRole} />
        <ParticipantsList users={roomData.users} currentUserId={user?.id} roomId={roomId} />
        {isDisplayRole && (
          <Button
          onClick={async () => {
            try {
              const newState: RoomState = roomState === 'voting' ? 'finished' : 'voting';
              await updateRoomState(roomId, newState);
              toast.success(`Votaciones ${newState === 'finished' ? 'cerradas' : 'abiertas'} correctamente`);
            } catch (error) {
              console.error('Error updating room state:', error);
              toast.error('Error al actualizar el estado de la sala');
            }
          }}
          variant={roomState === 'voting' ? 'destructive' : 'default'}
        >
          <span>
            {roomState === 'voting' ? (
              <><span className="font-swiss italic">Cerrar</span> las votaciones</>
            ) : (
              <><span className="font-swiss italic">Abrir</span> las votaciones</>
            )}
          </span>
        </Button>
        )}
      </div>
      {/* Columna derecha con clases para animación */}
      <div className={`flex flex-col flex-1 transition-all duration-500 ease-in-out ${activeTab === 'scores' ? 'md:w-full' : ''}`}>
        {isDisplayRole ? (
          <Tabs
            defaultValue="songs"
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className={`grid w-full ${roomState === 'finished' || roomState === 'completed' ? 'grid-cols-3' : 'grid-cols-2'} mb-4`}>
              <TabsTrigger value="songs">Canciones</TabsTrigger>
              <TabsTrigger value="votes">Votos</TabsTrigger>
              {/* Show scores tab when room state is finished or completed */}
              {(roomState === 'finished' || roomState === 'completed') && (
                <TabsTrigger value="scores">Puntuaciones</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="songs">
              <SongsList entries={roomData.entries} />
            </TabsContent>
            <TabsContent value="votes">
              <VotesList
                roomId={roomId}
              />
            </TabsContent>
            {/* Render scores content when room state is finished or completed */}
            {(roomState === 'finished' || roomState === 'completed') && (
              <TabsContent value="scores">
                <VotingScreen
                  roomId={roomId}
                  entries={roomData.entries}
                  isAdmin={isDisplayRole}
                  roomState={roomState}
                />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <VotingTable entries={roomData.entries} roomState={roomState} />
        )}
      </div>
    </div>
  )
}
