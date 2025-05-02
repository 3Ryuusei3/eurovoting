import { useState } from 'react'
import { BingoCellWithStatus } from '@/types/Bingo'
import { toggleBingoCardChecked } from '@/services/bingo'
import { cn } from '@/lib/utils'

interface BingoCellProps {
  cell: BingoCellWithStatus
  onToggle: (cellId: number, checked: boolean) => void
  disabled?: boolean
}

export function BingoCell({ cell, onToggle, disabled = false }: BingoCellProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async () => {
    if (disabled || isUpdating || !cell.card_id) return

    setIsUpdating(true)
    try {
      const newCheckedState = !cell.checked
      const success = await toggleBingoCardChecked(cell.card_id, newCheckedState)
      if (success) {
        onToggle(cell.id, newCheckedState)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center p-2 cursor-pointer transition-all",
        "min-h-[80px] text-center text-sm bingo-cell",
        cell.checked ? "bg-[#FF0000] text-white" : "bg-[#1F1F1F] hover:bg-[#2F2F2F]",
        isUpdating && "opacity-50",
        disabled && "cursor-not-allowed opacity-70"
      )}
      onClick={handleToggle}
    >
      {cell.cell}
    </div>
  )
}
