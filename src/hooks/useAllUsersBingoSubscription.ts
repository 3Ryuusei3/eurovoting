import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { BingoCellWithStatus } from '@/types/Bingo'
import { getAllUsersBingoCards } from '@/services/bingo'
import { UserBingo } from '@/components/room/Bingo/types'

interface UseAllUsersBingoSubscriptionProps {
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

export function useAllUsersBingoSubscription({ roomId }: UseAllUsersBingoSubscriptionProps) {
  const [allCards, setAllCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    async function loadAllBingoCards() {
      if (!roomId) {
        console.log('Missing roomId, skipping all bingo cards load')
        return
      }
      
      console.log(`Loading all bingo cards for room ${roomId}`)
      setLoading(true)
      try {
        const cards = await getAllUsersBingoCards(roomId)
        console.log(`Loaded ${cards.length} bingo cards for all users`)
        setAllCards(cards)
      } catch (error) {
        console.error('Error loading all bingo cards:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllBingoCards()
  }, [roomId])

  // Set up realtime subscription
  useEffect(() => {
    if (!roomId) {
      console.log('Missing roomId, skipping realtime subscription')
      return
    }

    console.log(`Setting up realtime subscription for all users in room ${roomId}`)
    
    // Subscribe to changes in the bingo_cards table for this room
    const subscription = supabase
      .channel('all_bingo_cards_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bingo_cards',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // When a change is detected, update the specific card
          const updatedCard = payload.new as BingoCardUpdatePayload
          console.log(`Received realtime update for card ${updatedCard.id}, checked: ${updatedCard.checked}`)

          setAllCards(prevCards => {
            const updatedCards = prevCards.map(card => 
              card.id === updatedCard.id 
                ? { ...card, checked: updatedCard.checked } 
                : card
            )
            console.log(`Updated all cards after realtime update: ${updatedCards.length}`)
            return updatedCards
          })
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up realtime subscription for all users')
      supabase.removeChannel(subscription)
    }
  }, [roomId])

  // Process the cards into UserBingo objects
  const userBingos = useMemo(() => {
    if (allCards.length === 0) return []

    // Group cards by user
    const userCardsMap: Record<string, any[]> = {}
    
    allCards.forEach(card => {
      const userId = card.user_id.toString()
      if (!userCardsMap[userId]) {
        userCardsMap[userId] = []
      }
      userCardsMap[userId].push(card)
    })

    // Convert to UserBingo objects
    return Object.entries(userCardsMap).map(([userId, cards]) => {
      // Get user info from the first card
      const firstCard = cards[0]
      const user = firstCard.users || { id: userId, name: 'Usuario' }
      
      // Convert cards to BingoCellWithStatus
      const bingoCards: BingoCellWithStatus[] = cards.map(card => ({
        id: card.cell_id,
        cell: card.bingo?.cell || '',
        created_at: card.created_at,
        checked: card.checked,
        card_id: card.id,
        position: card.position
      })).sort((a, b) => a.position - b.position)

      // Count completed cells
      const completedCount = bingoCards.filter(cell => cell.checked).length

      return {
        user_id: userId,
        user_name: user.name,
        color: user.color,
        text_color: user.text_color,
        cells: bingoCards,
        completedCount
      } as UserBingo
    }).sort((a, b) => b.completedCount - a.completedCount) // Sort by completion count
  }, [allCards])

  return {
    userBingos,
    loading
  }
}
