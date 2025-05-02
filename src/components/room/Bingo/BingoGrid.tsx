import { BingoCellWithStatus } from '@/types/Bingo'
import { BingoCell } from './BingoCell'

interface BingoGridProps {
  cells: BingoCellWithStatus[]
  onCellToggle: (cellId: number, checked: boolean) => void
  disabled?: boolean
}

export function BingoGrid({ cells, onCellToggle, disabled = false }: BingoGridProps) {
  // Create a 4x4 grid (16 cells)
  const gridSize = 16
  const gridCells: BingoCellWithStatus[] = Array(gridSize).fill(null)

  // Place cells in their correct positions
  cells.forEach(cell => {
    if (cell.position >= 1 && cell.position <= gridSize) {
      gridCells[cell.position - 1] = cell
    }
  })

  // Fill any empty slots with placeholder cells
  for (let i = 0; i < gridSize; i++) {
    if (!gridCells[i]) {
      gridCells[i] = {
        id: -(i + 1), // Use negative IDs for placeholder cells
        cell: '',
        created_at: '',
        checked: false,
        position: i + 1
      }
    }
  }

  return (
    <div className="grid grid-cols-4 gap-2 w-full mx-auto">
      {gridCells.map((cell) => (
        <BingoCell
          key={`${cell.id}-${cell.position}`}
          cell={cell}
          onToggle={onCellToggle}
          disabled={disabled || cell.id < 0}
        />
      ))}
    </div>
  )
}
