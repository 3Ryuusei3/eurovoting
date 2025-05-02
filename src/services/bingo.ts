import { supabase } from '@/lib/supabase'
import { BingoCell, BingoCard, BingoCellWithStatus } from '@/types/Bingo'
import { toast } from 'sonner'

// Tipo para los datos que devuelve la consulta de bingo_cards con join a bingo
interface BingoCardWithCell extends BingoCard {
  bingo: {
    cell: string
  }
  users?: {
    id: string
    name: string
    color: string
    text_color: string
  }
}

/**
 * Get all bingo cells
 */
export async function getBingoCells(): Promise<BingoCell[]> {
  try {
    const { data, error } = await supabase
      .from('bingo')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching bingo cells:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getBingoCells:', error)
    return []
  }
}

/**
 * Get a user's bingo card for a specific room
 */
export async function getUserBingoCard(userId: string, roomId: string): Promise<BingoCellWithStatus[]> {
  try {
    // First get all bingo cells
    const cells = await getBingoCells()

    // Then get the user's bingo card entries
    const { data: cardData, error: cardError } = await supabase
      .from('bingo_cards')
      .select('*')
      .eq('user_id', parseInt(userId, 10))
      .eq('room_id', parseInt(roomId, 10))

    if (cardError) {
      console.error('Error fetching user bingo card:', cardError)
      return []
    }

    // If the user doesn't have any bingo cards yet, create them
    if (!cardData || cardData.length === 0) {
      return await createUserBingoCards(userId, roomId, cells)
    }

    // Create an array of cells with their positions and checked status
    const result: BingoCellWithStatus[] = []

    // Process each card entry
    for (const card of cardData) {
      // Find the corresponding cell
      const cell = cells.find(c => c.id === card.cell_id)
      if (cell) {
        result.push({
          ...cell,
          checked: card.checked,
          card_id: card.id,
          position: card.position
        })
      }
    }

    // Sort by position
    return result.sort((a, b) => a.position - b.position)
  } catch (error) {
    console.error('Error in getUserBingoCard:', error)
    return []
  }
}

/**
 * Create bingo cards for a user in a room
 */
async function createUserBingoCards(userId: string, roomId: string, cells: BingoCell[]): Promise<BingoCellWithStatus[]> {
  try {
    // Verificar si ya existen tarjetas para este usuario en esta sala
    const { data: existingCards, error: checkError } = await supabase
      .from('bingo_cards')
      .select('*')
      .eq('user_id', parseInt(userId, 10))
      .eq('room_id', parseInt(roomId, 10));

    if (checkError) {
      console.error('Error checking existing bingo cards:', checkError);
    } else if (existingCards && existingCards.length > 0) {
      // Si ya existen tarjetas, no crear nuevas y devolver las celdas con estado
      return cells.map(cell => {
        const cardEntry = existingCards.find(card => card.cell_id === cell.id);
        return {
          ...cell,
          checked: cardEntry ? cardEntry.checked : false,
          card_id: cardEntry ? cardEntry.id : undefined,
          position: cardEntry ? cardEntry.position : 0
        };
      }).filter(cell => cell.position > 0).sort((a, b) => a.position - b.position);
    }

    // Shuffle the cells to create a random bingo card
    const shuffledCells = [...cells].sort(() => Math.random() - 0.5);

    // Take only the first 16 cells for a 4x4 grid
    const selectedCells = shuffledCells.slice(0, 16);

    // Create a bingo card entry for each cell with a position (1-16)
    const cardsToInsert = selectedCells.map((cell, index) => ({
      user_id: parseInt(userId, 10),
      room_id: parseInt(roomId, 10),
      cell_id: cell.id,
      position: index + 1, // Position from 1 to 16
      checked: false
    }));

    const { data, error } = await supabase
      .from('bingo_cards')
      .insert(cardsToInsert)
      .select();

    if (error) {
      console.error('Error creating user bingo cards:', error);
      return selectedCells.map((cell, index) => ({
        ...cell,
        checked: false,
        position: index + 1
      }));
    }

    // Map the cells to include the checked status, card_id, and position
    return selectedCells.map((cell, index) => {
      const cardEntry = data.find(card => card.cell_id === cell.id);
      return {
        ...cell,
        checked: false,
        card_id: cardEntry ? cardEntry.id : undefined,
        position: index + 1
      }
    });
  } catch (error) {
    console.error('Error in createUserBingoCards:', error)
    return cells.slice(0, 16).map((cell, index) => ({
      ...cell,
      checked: false,
      position: index + 1
    }))
  }
}

/**
 * Toggle the checked status of a bingo card
 */
export async function toggleBingoCardChecked(cardId: number, checked: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bingo_cards')
      .update({ checked })
      .eq('id', cardId)

    if (error) {
      console.error('Error updating bingo card:', error)
      toast.error('Error al actualizar la tarjeta de bingo')
      return false
    }

    return true
  } catch (error) {
    console.error('Error in toggleBingoCardChecked:', error)
    toast.error('Error al actualizar la tarjeta de bingo')
    return false
  }
}

/**
 * Create a new bingo cell
 */
export async function createBingoCell(cellText: string): Promise<BingoCell | null> {
  try {
    const { data, error } = await supabase
      .from('bingo')
      .insert({ cell: cellText })
      .select()
      .single()

    if (error) {
      console.error('Error creating bingo cell:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createBingoCell:', error)
    return null
  }
}

/**
 * Get all bingo cards for a user in a room
 */
export async function getBingoCards(userId: string, roomId: string): Promise<BingoCardWithCell[]> {
  try {
    const { data, error } = await supabase
      .from('bingo_cards')
      .select('*, bingo(cell)')
      .eq('user_id', parseInt(userId, 10))
      .eq('room_id', parseInt(roomId, 10))
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching bingo cards:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getBingoCards:', error)
    return []
  }
}

/**
 * Get all users' bingo cards for a room
 */
export async function getAllUsersBingoCards(roomId: string): Promise<BingoCardWithCell[]> {
  try {
    const { data, error } = await supabase
      .from('bingo_cards')
      .select('*, bingo(cell), users(id, name, color, text_color)')
      .eq('room_id', parseInt(roomId, 10))
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching all users bingo cards:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllUsersBingoCards:', error)
    return []
  }
}
