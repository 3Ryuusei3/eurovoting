import { Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getPointTextColor } from '@/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { points } from '@/constants'
import { useVotesSubscription } from '@/hooks/useVotesSubscription'

interface VotesListProps {
  roomId: string
}

export function VotesList({ roomId }: VotesListProps) {
  // Use our custom hook for realtime votes data
  const { votes, loading } = useVotesSubscription({ roomId })

  // Points array for column headers - convert to strings and reverse to show highest points first
  const pointsArray = [...points].reverse().map(point => point.toString())

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Votos de los participantes</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (votes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Votos de los participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            No se encontraron votos para esta sala.
            <br />
            <small className="block mt-2">Si crees que debería haber votos, revisa la consola para más información.</small>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votos de los participantes</CardTitle>
      </CardHeader>
      <CardContent className="px-1 sm:px-4">
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="min-w-[800px] w-full">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10"></TableHead>
                {pointsArray.map(point => (
                  <TableHead key={point} className={`text-center text-lg ${getPointTextColor(parseInt(point))}`}>
                    {point}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {votes.map(userVote => (
                <TableRow key={userVote.user_id}>
                  <TableCell className="sticky left-0 z-10 font-medium">{userVote.user_name}</TableCell>
                  {pointsArray.map(point => {
                    const vote = userVote.points[point]
                    return (
                      <TableCell key={point} className="text-center p-2">
                        {vote ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col items-center gap-1 cursor-help">
                                  <img
                                    src={vote.country_flag}
                                    alt={vote.country_name}
                                    className="w-8 h-5 object-cover rounded shadow-sm"
                                  />
                                  {/* <span className="text-xs">{vote.country_name}</span> */}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-bold mb-1">{vote.country_name}</p>
                                  {vote.song && <p>Canción: {vote.song}</p>}
                                  {vote.singing && <p>Voz: {vote.singing}</p>}
                                  {vote.performance && <p>Performance: {vote.performance}</p>}
                                  {vote.staging && <p>Puesta en escena: {vote.staging}</p>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
        </div>
      </CardContent>
    </Card>
  )
}
