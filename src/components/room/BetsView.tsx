import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Loader2 } from "lucide-react"
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'
import { BetsConfirmationDialog } from './BetsConfirmationDialog'
import { BetOption } from '@/types/Bet'
import { EntryInfo } from './EntryInfo'
import { betOptionToEntry } from '@/utils/betOptionToEntry'

interface BetsViewProps {
  roomId: string
  pollId: string
  roomState: string
}

export function BetsView({ roomId, pollId, roomState }: BetsViewProps) {
  const [options, setOptions] = useState<BetOption[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBets, setSelectedBets] = useState<{
    x5: number | null,
    x3: number | null,
    x1: number | null
  }>({
    x5: null,
    x3: null,
    x1: null
  })
  // Definimos un tipo más flexible para las apuestas
  type BetRecord = {
    id?: number
    user_id: number | string
    room_id: number | string
    entry_id: number
    amount: number
    created_at?: string
  }

  const [existingBets, setExistingBets] = useState<BetRecord[]>([])
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const { user } = useStore()

  // Función para cargar las apuestas del usuario
  const loadUserBets = useCallback(async () => {
    if (!user?.id || !roomId) return

    try {
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .eq('room_id', roomId)

      if (betsError) {
        throw betsError
      }

      if (betsData && betsData.length > 0) {
        setExistingBets(betsData)

        // Pre-fill selections if bets exist
        const x5Bet = betsData.find(bet => bet.amount === 5)
        const x3Bet = betsData.find(bet => bet.amount === 3)
        const x1Bet = betsData.find(bet => bet.amount === 1)

        setSelectedBets({
          x5: x5Bet?.entry_id || null,
          x3: x3Bet?.entry_id || null,
          x1: x1Bet?.entry_id || null
        })
      } else {
        // Si no hay apuestas, limpiamos el estado
        setExistingBets([])
      }
    } catch (error) {
      console.error('Error loading user bets:', error)
    }
  }, [user?.id, roomId, setExistingBets, setSelectedBets])

  // Load bet options and existing bets
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Get bet options
        const { data: optionsData, error: optionsError } = await supabase
          .rpc('get_bets_options', { poll_id_param: parseInt(pollId, 10) })

        if (optionsError) {
          throw optionsError
        }

        setOptions(optionsData || [])

        // Cargar las apuestas del usuario
        await loadUserBets()
      } catch (error) {
        console.error('Error loading bet data:', error)
        toast.error('Error al cargar las opciones de apuestas')
      } finally {
        setLoading(false)
      }
    }

    if (roomId && pollId) {
      loadData()
    }
  }, [roomId, pollId, user?.id, loadUserBets])

  // Suscripción a cambios en las apuestas
  useEffect(() => {
    if (!roomId || !user?.id) return

    // Crear un canal para escuchar cambios en las apuestas
    const betsChannel = supabase
      .channel(`bets_${roomId}_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'bets',
          filter: `user_id=eq.${user.id} AND room_id=eq.${roomId}`
        },
        () => {
          // Recargar las apuestas cuando haya cambios
          loadUserBets()
        }
      )
      .subscribe()

    // Limpiar la suscripción al desmontar
    return () => {
      betsChannel.unsubscribe()
    }
  }, [roomId, user?.id, loadUserBets])

  const handleBetChange = (value: string, multiplier: 'x5' | 'x3' | 'x1') => {
    setSelectedBets(prev => ({
      ...prev,
      [multiplier]: parseInt(value, 10)
    }))
  }

  const handleSubmitBets = async () => {
    if (!user?.id) {
      toast.error('Debes iniciar sesión para realizar apuestas')
      return
    }

    try {
      // Create array of bet objects
      const betsToInsert = [
        { user_id: user.id, room_id: roomId, entry_id: selectedBets.x5, amount: 5 },
        { user_id: user.id, room_id: roomId, entry_id: selectedBets.x3, amount: 3 },
        { user_id: user.id, room_id: roomId, entry_id: selectedBets.x1, amount: 1 }
      ]

      // Si el usuario ya tiene apuestas, primero las eliminamos
      if (existingBets.length > 0) {
        const { error: deleteError } = await supabase
          .from('bets')
          .delete()
          .eq('user_id', user.id)
          .eq('room_id', roomId)

        if (deleteError) throw deleteError

        // Insertar las nuevas apuestas
        const { error } = await supabase
          .from('bets')
          .insert(betsToInsert)

        if (error) throw error

        toast.success('Apuestas actualizadas correctamente')
      } else {
        // Insertar las nuevas apuestas
        const { error } = await supabase
          .from('bets')
          .insert(betsToInsert)

        if (error) throw error

        toast.success('Apuestas enviadas correctamente')
      }

      setExistingBets(betsToInsert)
      setIsConfirmDialogOpen(false)
    } catch (error) {
      console.error('Error submitting bets:', error)
      toast.error('Error al enviar las apuestas')
    }
  }

  const allBetsSelected = selectedBets.x5 !== null && selectedBets.x3 !== null && selectedBets.x1 !== null
  const hasBetsSubmitted = existingBets.length > 0
  const isVotingClosed = roomState === 'finished' || roomState === 'completed'

  return (
    <Card blurred>
      <CardHeader>
        <CardTitle main>Apuestas</CardTitle>
        <CardDescription>
          Selecciona los países que crees que ganarán el festival. Cada apuesta tiene un multiplicador diferente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isVotingClosed && (
          <Alert className="mt-2 mb-4 bg-red-50 dark:bg-red-950/60 border-0">
            <Info className="h-4 w-4 dark:text-red-500" />
            <AlertDescription className="text-red-800 dark:text-red-400">
              {hasBetsSubmitted
                ? "La votación está cerrada. Estas son tus apuestas finales:"
                : "La votación está cerrada y no has realizado ninguna apuesta."}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {hasBetsSubmitted && isVotingClosed && (
              <div className="bg-muted p-4">
                <h3 className="font-bold text-lg mb-4">Tus apuestas</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#F5FA00] text-primary-foreground font-bold px-2.5 py-2">x5</div>
                    <div className="flex-1">
                      {selectedBets.x5 && options.find(opt => opt.id === selectedBets.x5) && (
                        <EntryInfo entry={betOptionToEntry(options.find(opt => opt.id === selectedBets.x5))!} size="sm" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FF0000] text-white font-bold px-2.5 py-2">x3</div>
                    <div className="flex-1">
                      {selectedBets.x3 && options.find(opt => opt.id === selectedBets.x3) && (
                        <EntryInfo entry={betOptionToEntry(options.find(opt => opt.id === selectedBets.x3))!} size="sm" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground font-bold px-2.5 py-2">x1</div>
                    <div className="flex-1">
                      {selectedBets.x1 && options.find(opt => opt.id === selectedBets.x1) && (
                        <EntryInfo entry={betOptionToEntry(options.find(opt => opt.id === selectedBets.x1))!} size="sm" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isVotingClosed && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium">
                      <span>El favorito para ganar</span>
                    </label>
                    <div className='flex items-center gap-2'>
                      <span className="bg-[#F5FA00] text-primary-foreground font-bold px-2.5 py-2">x5</span>
                      <Select
                        value={selectedBets.x5?.toString() || ''}
                        onValueChange={(value) => handleBetChange(value, 'x5')}
                      >
                        <SelectTrigger flagSelector>
                          <SelectValue placeholder="Selecciona un país" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map(option => (
                            <SelectItem
                              key={`x5-${option.id}`}
                              value={option.id.toString()}
                              disabled={selectedBets.x3 === option.id || selectedBets.x1 === option.id}
                            >
                              <div className="flex items-center gap-2">
                                <EntryInfo entry={betOptionToEntry(option)!} size="sm" />
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium">
                      <span>El segundo favorito para ganar</span>
                    </label>
                    <div className='flex items-center gap-2'>
                      <span className="bg-[#FF0000] text-white font-bold px-2.5 py-2">x3</span>
                      <Select
                        value={selectedBets.x3?.toString() || ''}
                        onValueChange={(value) => handleBetChange(value, 'x3')}
                      >
                        <SelectTrigger flagSelector>
                          <SelectValue placeholder="Selecciona un país" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map(option => (
                            <SelectItem
                              key={`x3-${option.id}`}
                              value={option.id.toString()}
                              disabled={selectedBets.x5 === option.id || selectedBets.x1 === option.id}
                            >
                              <div className="flex items-center gap-2">
                                <EntryInfo entry={betOptionToEntry(option)!} size="sm" />
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium">
                      <span>El tercer favorito para ganar</span>
                    </label>
                    <div className='flex items-center gap-2'>
                      <span className="bg-primary text-primary-foreground font-bold px-2.5 py-2">x1</span>
                      <Select
                        value={selectedBets.x1?.toString() || ''}
                        onValueChange={(value) => handleBetChange(value, 'x1')}
                      >
                        <SelectTrigger flagSelector>
                          <SelectValue placeholder="Selecciona un país" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map(option => (
                            <SelectItem
                              key={`x1-${option.id}`}
                              value={option.id.toString()}
                              disabled={selectedBets.x5 === option.id || selectedBets.x3 === option.id}
                            >
                              <div className="flex items-center gap-2">
                                <EntryInfo entry={betOptionToEntry(option)!} size="sm" />
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <Button
                    onClick={() => setIsConfirmDialogOpen(true)}
                    disabled={!allBetsSelected}
                  >
                    {hasBetsSubmitted ? 'Actualizar apuestas' : 'Enviar apuestas'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <BetsConfirmationDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handleSubmitBets}
          selectedBets={{
            x5: options.find(opt => opt.id === selectedBets.x5),
            x3: options.find(opt => opt.id === selectedBets.x3),
            x1: options.find(opt => opt.id === selectedBets.x1)
          }}
        />
      </CardContent>
    </Card>
  )
}
