import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from "lucide-react"

import { getRoomData, updateRoomState } from '@/services/rooms'
import { getUserRoleForRoom } from '@/services/users'
import { useStore } from '@/store/useStore'
import { RoomData, RoomState } from '@/types/Room'
import { toast } from 'sonner'
import { useCheckUserInRoom } from '@/hooks/useCheckUserInRoom'

import { ParticipantsList } from '@/components/room/ParticipantsList'
import { SongsList } from '@/components/room/SongsList'
import { VotingTable } from '@/components/room/VotingTable'
import { VotesList } from '@/components/room/VotesList'
import { VotingScreen } from '@/components/room/VotingScreen'
import { RoomInfo } from '@/components/room/RoomInfo'
import { BingoView, AdminBingoView } from '@/components/room/Bingo'
import { AdminQuestionsView, UserQuestionsView } from '@/components/room/Questions'
import { BetsView } from '@/components/room/BetsView'
import { AdminBetsView } from '@/components/room/AdminBetsView'
import { useRoomSubscription } from '@/hooks/useRoomSubscription'
import { useQuestionsSubscription } from '@/hooks/useQuestionsSubscription'
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
      // Show appropriate toast message based on the new state
      if (data.room.state === 'voting') {
        toast.info('El estado de la sala ha cambiado a: Votación abierta')

        // If room state changed to voting and we're on scores tab, switch to songs tab
        if (activeTab === 'scores') {
          setActiveTab('songs')
        }
      } else if (data.room.state === 'finished') {
        toast.info('El estado de la sala ha cambiado a: Votación cerrada')
      } else if (data.room.state === 'completed') {
        toast.info('El estado de la sala ha cambiado a: Resultados disponibles')

        // If room state changed to completed, switch to scores tab
        setActiveTab('scores')
      }
    }

    setRoomData(data)
  }, [roomData, activeTab])

  useRoomSubscription({ roomId, onRoomDataUpdate: handleRoomDataUpdate })

  // Use questions subscription hook
  const {
    questions,
    userAnswers,
    loading: questionsLoading
  } = useQuestionsSubscription({ roomId })



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

  // Check if the current user is still in the participants list
  useCheckUserInRoom({ roomData, loading, userRole })

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
    <div className={`container max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row  ${activeTab === 'scores' ? 'gap-7 md:gap-0' : 'gap-7'}`}>
      <div
        className={`flex flex-col gap-7 sm:flex-shrink-0 md:max-w-[280px] transition-all duration-500 ease-in-out ${activeTab === 'scores' ? 'md:w-0 md:opacity-0 md:overflow-hidden md:max-w-0 md:invisible' : 'md:opacity-100 md:max-w-[280px]'} relative z-100`}
      >
        <RoomInfo roomData={roomData} isDisplayRole={isDisplayRole} />
        <ParticipantsList users={roomData.users} currentUserId={user?.id} roomId={roomId} isAdmin={isDisplayRole} />
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
          variant='secondary'
        >
          <span>
            {roomState === 'voting' ? (
              'Cerrar las votaciones'
            ) : (
              'Abrir las votaciones'
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
            <TabsList className={`grid w-full ${roomState === 'finished' || roomState === 'completed' ? 'grid-cols-6' : 'grid-cols-5'} mb-4`}>
              <TabsTrigger value="songs">Canciones</TabsTrigger>
              <TabsTrigger value="votes">Votos</TabsTrigger>
              <TabsTrigger value="bingo">Bingo</TabsTrigger>
              <TabsTrigger value="questions">Quiz</TabsTrigger>
              <TabsTrigger value="bets">Apuestas</TabsTrigger>
              {/* Show scores tab when room state is finished or completed */}
              {(roomState === 'finished' || roomState === 'completed') && (
                <TabsTrigger value="scores">Televoto</TabsTrigger>
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
            <TabsContent value="bingo">
              {isDisplayRole ? (
                <AdminBingoView roomId={roomId} />
              ) : (
                <BingoView roomId={roomId} />
              )}
            </TabsContent>
            <TabsContent value="questions">
              <AdminQuestionsView
                questions={questions}
                loading={questionsLoading}
              />
            </TabsContent>
            <TabsContent value="bets">
              <AdminBetsView
                roomId={roomId}
                pollId={roomData.poll.id.toString()}
              />
            </TabsContent>
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
          <Tabs
            defaultValue="voting"
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className={`grid w-full ${roomState === 'completed' ? 'grid-cols-5' : 'grid-cols-4'} mb-4`}>
              <TabsTrigger value="voting">Votos</TabsTrigger>
              <TabsTrigger value="bingo">Bingo</TabsTrigger>
              <TabsTrigger value="questions">Quiz</TabsTrigger>
              <TabsTrigger value="bets">Apuestas</TabsTrigger>
              {/* Show scores tab for normal users only when room state is completed */}
              {roomState === 'completed' && (
                <TabsTrigger value="scores">Televoto</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="voting">
              <VotingTable entries={roomData.entries} roomState={roomState} />
            </TabsContent>
            <TabsContent value="bingo">
              {isDisplayRole ? (
                <AdminBingoView roomId={roomId} />
              ) : (
                <BingoView roomId={roomId} />
              )}
            </TabsContent>
            <TabsContent value="questions">
              <UserQuestionsView
                questions={questions}
                userAnswers={userAnswers}
                loading={questionsLoading}
              />
            </TabsContent>
            <TabsContent value="bets">
              <BetsView
                roomId={roomId}
                pollId={roomData.poll.id.toString()}
                roomState={roomState}
              />
            </TabsContent>
            {/* Add scores tab content for normal users when room state is completed */}
            {roomState === 'completed' && (
              <TabsContent value="scores">
                <VotingScreen
                  roomId={roomId}
                  entries={roomData.entries}
                  isAdmin={false}
                  roomState={roomState}
                />
              </TabsContent>
            )}

          </Tabs>
        )}
      </div>
    </div>
  )
}
