import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/store/useStore'
import { BingoGrid } from './BingoGrid'
import { Loader2 } from 'lucide-react'
import { useBingoSubscription } from '@/hooks/useBingoSubscription'

interface BingoViewProps {
  roomId: string
}

export function BingoView({ roomId }: BingoViewProps) {
  const { user } = useStore()

  const { cells, loading, setCells } = useBingoSubscription({
    userId: user?.id || '',
    roomId
  })

  const handleCellToggle = (cellId: number, checked: boolean) => {
    setCells(prevCells =>
      prevCells.map(cell =>
        cell.id === cellId ? { ...cell, checked } : cell
      )
    )
  }

  if (loading) {
    return (
      <Card blurred>
        <CardHeader>
          <CardTitle main>Bingo</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card blurred>
      <CardHeader>
        <CardTitle main>Bingo</CardTitle>
      </CardHeader>
      <CardContent>
        <BingoGrid
          cells={cells}
          onCellToggle={handleCellToggle}
        />
      </CardContent>
    </Card>
  )
}
