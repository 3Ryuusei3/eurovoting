import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BingoCellWithStatus } from '@/types/Bingo'
import { getUserBingoCard } from '@/services/bingo'

interface UseBingoSubscriptionProps {
  userId: string
  roomId: string
}

// Tipo para el payload de la actualización de bingo_cards
interface BingoCardUpdatePayload {
  id: number
  user_id: number
  room_id: number
  checked: boolean
  position: number
  cell_id: number
  created_at: string
}

export function useBingoSubscription({ userId, roomId }: UseBingoSubscriptionProps) {
  const [cells, setCells] = useState<BingoCellWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    async function loadBingoCard() {
      if (!userId || !roomId) {
        return;
      }

      setLoading(true)
      try {
        const bingoCard = await getUserBingoCard(userId, roomId)
        setCells(bingoCard)
      } catch (error) {
        console.error('Error loading bingo card:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBingoCard()
  }, [userId, roomId])

  // Set up realtime subscription
  useEffect(() => {
    if (!userId || !roomId) {
      return;
    }

    // Subscribe to changes in the bingo_cards table for this user and room
    const subscription = supabase
      .channel('bingo_cards_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bingo_cards',
          filter: `user_id=eq.${userId} AND room_id=eq.${roomId}`
        },
        async (payload) => {
          // When a change is detected, update the specific cell
          const updatedCard = payload.new as BingoCardUpdatePayload

          setCells(prevCells => {
            const updatedCells = prevCells.map(cell =>
              cell.card_id === updatedCard.id
                ? {
                    ...cell,
                    checked: updatedCard.checked,
                    position: updatedCard.position
                  }
                : cell
            );
            return updatedCells;
          });
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId, roomId])

  return {
    cells,
    loading,
    setCells
  }
}
