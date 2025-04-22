import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { getVotesMatrix, UserVoteMatrix } from '@/services/rooms'
import { getPointTextColor } from '@/utils'

// Using the types from services/rooms.ts

interface VotesMatrixProps {
  pollId: string
}

export function VotesMatrix({ pollId }: VotesMatrixProps) {
  const [votesMatrix, setVotesMatrix] = useState<UserVoteMatrix[]>([])
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Points array for column headers
  const pointsArray = ['12', '10', '8', '7', '6', '5', '4', '3', '2', '1']

  useEffect(() => {
    const loadVotesMatrix = async () => {
      setLoading(true)
      try {
        const data = await getVotesMatrix(pollId)
        setVotesMatrix(data)
      } catch (error) {
        console.error('Error loading votes matrix:', error)
      } finally {
        setLoading(false)
      }
    }

    if (pollId) {
      loadVotesMatrix()
    }
  }, [pollId])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Paginate the votes matrix
  const totalItems = votesMatrix.length
  const startIndex = (currentPage - 1) * pageSize
  const paginatedVotesMatrix = pageSize === -1
    ? votesMatrix
    : votesMatrix.slice(startIndex, startIndex + pageSize)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matriz de votos</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (votesMatrix.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matriz de votos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Aún no hay votos para esta encuesta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de votos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Usuario</TableHead>
                {pointsArray.map(point => (
                  <TableHead key={point} className={`text-center ${getPointTextColor(parseInt(point))}`}>
                    {point}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVotesMatrix.map(userVote => (
                <TableRow key={userVote.user_id}>
                  <TableCell className="font-medium">{userVote.user_name}</TableCell>
                  {pointsArray.map(point => {
                    const vote = userVote.points[point as keyof typeof userVote.points]
                    return (
                      <TableCell key={point} className="text-center p-2">
                        {vote ? (
                          <div className="flex flex-col items-center gap-1">
                            <img
                              src={vote.country_flag}
                              alt={vote.country_name}
                              className="w-8 h-5 object-cover rounded shadow-sm"
                            />
                            <span className="text-xs">{vote.country_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4">
          <Pagination
            totalItems={totalItems}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, -1]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
