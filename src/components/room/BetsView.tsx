import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'
import { BetsConfirmationDialog } from './BetsConfirmationDialog'
import { BetOption } from '@/types/Bet'

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

        // Check if user already has bets
        if (user?.id) {
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
          }
        }
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
  }, [roomId, pollId, user?.id])

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

      const { error } = await supabase
        .from('bets')
        .insert(betsToInsert)

      if (error) throw error

      toast.success('Apuestas enviadas correctamente')
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

  // Helper function to get country name by entry id
  const getCountryName = (entryId: number | null) => {
    if (!entryId) return 'No seleccionado'
    const option = options.find(opt => opt.id === entryId)
    return option ? option.country_name : 'Desconocido'
  }

  return (
    <Card blurred>
      <CardHeader>
        <CardTitle main>Apuestas</CardTitle>
        <CardDescription>
          Selecciona los países que crees que ganarán el festival. Cada apuesta tiene un multiplicador diferente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : hasBetsSubmitted ? (
          <div className="space-y-6">
            <div className="bg-muted p-4">
              <h3 className="font-bold text-lg mb-4">Tus apuestas</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-[#F5FA00] text-primary-foreground font-bold px-3 py-1">x5</div>
                  <div className="flex items-center gap-2">
                    <img
                      src={options.find(opt => opt.id === selectedBets.x5)?.country_squared}
                      alt={getCountryName(selectedBets.x5)}
                      className="w-8 h-8 object-cover"
                    />
                    <span className='inline-block'>{getCountryName(selectedBets.x5)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#FF0000] text-white font-bold px-3 py-1">x3</div>
                  <div className="flex items-center gap-2">
                    <img
                      src={options.find(opt => opt.id === selectedBets.x3)?.country_squared}
                      alt={getCountryName(selectedBets.x3)}
                      className="w-8 h-8 object-cover"
                    />
                    <span>{getCountryName(selectedBets.x3)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground font-bold px-3 py-1">x1</div>
                  <div className="flex items-center gap-2">
                    <img
                      src={options.find(opt => opt.id === selectedBets.x1)?.country_squared}
                      alt={getCountryName(selectedBets.x1)}
                      className="w-8 h-8 object-cover"
                    />
                    <span>{getCountryName(selectedBets.x1)}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Las apuestas ya han sido enviadas y no pueden modificarse.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium">
                  <span className="bg-[#F5FA00] text-primary-foreground font-bold px-3 py-1">x5</span>
                  <span>El favorito para ganar</span>
                </label>
                <Select
                  value={selectedBets.x5?.toString() || ''}
                  onValueChange={(value) => handleBetChange(value, 'x5')}
                  disabled={isVotingClosed}
                >
                  <SelectTrigger>
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
                          <img src={option.country_squared} alt={option.country_name} className="w-6 h-6 object-cover" />
                          <span>{option.running_order}. {option.country_name} - {option.song}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium">
                  <span className="bg-[#FF0000] text-white font-bold px-3 py-1">x3</span>
                  <span>El segundo favorito para ganar</span>
                </label>
                <Select
                  value={selectedBets.x3?.toString() || ''}
                  onValueChange={(value) => handleBetChange(value, 'x3')}
                  disabled={isVotingClosed}
                >
                  <SelectTrigger>
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
                          <img src={option.country_squared} alt={option.country_name} className="w-6 h-6 object-cover" />
                          <span>{option.running_order}. {option.country_name} - {option.song}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium">
                  <span className="bg-primary text-primary-foreground font-bold px-3 py-1">x1</span>
                  <span>El tercer favorito para ganar</span>
                </label>
                <Select
                  value={selectedBets.x1?.toString() || ''}
                  onValueChange={(value) => handleBetChange(value, 'x1')}
                  disabled={isVotingClosed}
                >
                  <SelectTrigger>
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
                          <img src={option.country_squared} alt={option.country_name} className="w-6 h-6 object-cover" />
                          <span>{option.running_order}. {option.country_name} - {option.song}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={!allBetsSelected || isVotingClosed}
              >
                {isVotingClosed ? 'Votación cerrada' : 'Enviar apuestas'}
              </Button>
            </div>
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
