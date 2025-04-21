import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from '@/store/useStore'
import { getRoomsWithPollNamesForUser } from '@/services/rooms'
import { Room } from '@/types/Room'
import { Loader2 } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [roomsWithPolls, setRoomsWithPolls] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadRoomsWithPollsForUser() {
      if (!user) return;

      setLoading(true);
      try {
        const roomsWithPollNamesForUser = await getRoomsWithPollNamesForUser(user.id);
        setRoomsWithPolls(roomsWithPollNamesForUser);
      } catch (error) {
        console.error('Error loading rooms with poll names:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRoomsWithPollsForUser();
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 gap-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Bienvenido a <span className="font-swiss italic">Euro</span>Voting</CardTitle>
          <CardDescription>Crea una nueva sala o únete a una existente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => navigate('/create')}>
            <span><span className="font-swiss italic">Crear</span> una sala</span>
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate('/join')}>
            <span><span className="font-swiss italic">Unirse</span> a una sala</span>
          </Button>
        </CardContent>
      </Card>

      {user && roomsWithPolls.length > 0 && (
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Tus salas</CardTitle>
            <CardDescription>Salas a las que te han invitado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : roomsWithPolls.length > 0 ? (
              roomsWithPolls.map((room) => (
                <Button
                  key={room.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate(`/room?id=${room.id}`)}
                >
                  <span>{room?.polls?.name} - {room.code}</span>
                  <span className="text-muted-foreground">→</span>
                </Button>
              ))
            ) : (
              roomsWithPolls.map((room) => (
                <Button
                  key={room.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate(`/room?id=${room.id}`)}
                >
                  <span>Sala {room.code}</span>
                  <span className="text-muted-foreground">→</span>
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
