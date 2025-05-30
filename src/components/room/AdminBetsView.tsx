import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { BetSummary } from '@/types/Bet'
import { getInitial } from '@/utils'
import { EntryInfo } from './EntryInfo'
import { betSummaryToEntry } from '@/utils/betOptionToEntry'

interface AdminBetsViewProps {
  roomId: string
  pollId: string
}

interface UserBet {
  user_id: number
  user_name: string
  color: string
  text_color: string
  amount: number
}

interface BetSummaryWithOdds extends BetSummary {
  odds: number
  percentage: number
  users: UserBet[]
}

export function AdminBetsView({ roomId, pollId }: AdminBetsViewProps) {
  const [betsSummary, setBetsSummary] = useState<BetSummaryWithOdds[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const loadBetsSummary = useCallback(async () => {
    setLoading(true)
    try {
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select(`
          id,
          user_id,
          room_id,
          entry_id,
          amount,
          created_at,
          users:user_id(
            id,
            name,
            color,
            text_color
          )
        `)
        .eq('room_id', roomId)

      if (betsError) throw betsError

      if (!betsData || betsData.length === 0) {
        setBetsSummary([])
        setLoading(false)
        return
      }

      const entryIds = [...new Set(betsData.map((bet) => bet.entry_id))]
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('id, song, artist, country_id')
        .in('id', entryIds)

      if (entriesError) throw entriesError

      const countryIds = entriesData.map(entry => entry.country_id)
      const { data: countriesData, error: countriesError } = await supabase
        .from('countries')
        .select('id, name_es, flag, flag_square')
        .in('id', countryIds)

      if (countriesError) throw countriesError

      const entriesWithCountries = entriesData.map(entry => {
        const country = countriesData.find(country => country.id === entry.country_id)
        return {
          ...entry,
          country
        }
      })

      const usersByEntry: Record<number, UserBet[]> = {}

      betsData.forEach((bet) => {
        if (!usersByEntry[bet.entry_id]) {
          usersByEntry[bet.entry_id] = []
        }

        const user = bet.users && !Array.isArray(bet.users) ? bet.users : null;

        if (user) {
          usersByEntry[bet.entry_id].push({
            user_id: bet.user_id,
            user_name: user.name,
            color: user.color || '#333',
            text_color: user.text_color || '#fff',
            amount: bet.amount
          })
        }
      })

      const summary: Record<number, BetSummary> = {}
      let totalPoints = 0

      betsData.forEach((bet) => {
        if (!summary[bet.entry_id]) {
          const entry = entriesWithCountries.find((e) => e.id === bet.entry_id)
          if (!entry || !entry.country) return

          summary[bet.entry_id] = {
            entry_id: bet.entry_id,
            country_name: entry.country.name_es,
            country_flag: entry.country.flag,
            country_squared: entry.country.flag_square,
            song: entry.song,
            artist: entry.artist,
            total_bets: 0,
            total_points: 0
          }
        }

        summary[bet.entry_id].total_bets += 1
        summary[bet.entry_id].total_points += bet.amount
        totalPoints += bet.amount
      })

      const summaryWithOdds: Record<number, BetSummaryWithOdds> = {}

      Object.entries(summary).forEach(([entryId, betSummary]) => {
        const percentage = (betSummary.total_points / totalPoints) * 100

        const odds = totalPoints / betSummary.total_points

        summaryWithOdds[Number(entryId)] = {
          ...betSummary,
          odds: parseFloat(odds.toFixed(2)),
          percentage: parseFloat(percentage.toFixed(1)),
          users: usersByEntry[Number(entryId)] || []
        }
      })

      const sortedSummary = Object.values(summaryWithOdds).sort((a, b) => b.total_points - a.total_points)
      setBetsSummary(sortedSummary)
    } catch (error) {
      console.error('Error loading bets summary:', error)
      toast.error('Error al cargar el resumen de apuestas')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    if (!roomId) return

    loadBetsSummary()

    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }

    const channelName = `admin_bets_changes_${roomId}_${Date.now()}`

    const getUsersWithBets = async () => {
      try {
        const { data: bettingUsers, error } = await supabase
          .from('bets')
          .select('user_id')
          .eq('room_id', roomId)
          .order('user_id')

        if (error) {
          throw error
        }

        const userIds = [...new Set(bettingUsers?.map(bet => bet.user_id) || [])]

        if (userIds.length === 0) {
          return
        }

        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bets',
              filter: `room_id=eq.${roomId}`
            },
            () => {
              loadBetsSummary()
              getUsersWithBets()
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=in.(${userIds.join(',')})`
            },
            () => {
              loadBetsSummary()
            }
          )
          .subscribe()

          channelRef.current = channel
      } catch (error) {
        console.error(`Error setting up realtime subscription:`, error)

        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bets',
              filter: `room_id=eq.${roomId}`
            },
            () => loadBetsSummary()
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users'
            },
            () => loadBetsSummary()
          )
          .subscribe()

        channelRef.current = channel
      }
    }

    getUsersWithBets()

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [roomId, pollId, loadBetsSummary])

  return (
    <Card blurred>
      <CardHeader>
        <CardTitle main>Pronóstico de Apuestas</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : betsSummary.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay apuestas realizadas todavía.
          </div>
        ) : (
          <div className="space-y-2">
            {betsSummary.map((bet, index) => (
              <div key={bet.entry_id} className="space-y-1">
                <div className="flex flex-col bg-input/50 p-3 pe-4">
                  <div className='flex items-center gap-3'>
                    <div className="font-bold text-lg w-8 text-center">{index + 1}</div>
                    <div className="flex-1">
                      <EntryInfo entry={betSummaryToEntry(bet)} />
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-bold text-lg">
                        {bet.odds}x <span className="text-sm font-normal text-muted-foreground">({bet.percentage}%)</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{bet.total_bets} apuesta{bet .total_bets === 1 ? '' : 's'}</div>
                    </div>
                  </div>
                  {/* Mostrar los usuarios que han apostado por este país */}
                  {bet.users.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2 justify-end">
                      {bet.users.map((user) => (
                        <div
                          key={`${bet.entry_id}-${user.user_id}-${user.amount}`}
                          className="w-6 h-6 flex items-center justify-center text-xs font-medium transition"
                          style={{
                            backgroundColor: user.color,
                            color: user.text_color,
                            border: `1.5px solid ${user.text_color}`,
                            boxShadow: `0 0 0px 2px ${user.color}`
                          }}
                          title={`${user.user_name} (x${user.amount})`}
                        >
                          {getInitial(user.user_name)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
