import { BingoCellWithStatus } from '@/types/Bingo'
import { BingoGrid } from './BingoGrid'

interface UserBingoGridProps {
  cells: BingoCellWithStatus[]
}

export function UserBingoGrid({ cells }: UserBingoGridProps) {
  const handleCellToggle = () => {}

  return (
    <BingoGrid
      cells={cells}
      onCellToggle={handleCellToggle}
      disabled={true}
    />
  )
}
