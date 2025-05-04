import { Loader2, Music, Mic, Theater, Clapperboard } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
      <Card blurred={true}>
        <CardHeader>
          <CardTitle main>Votos de los participantes</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (votes.length === 0) {
    return (
      <Card blurred={true}>
        <CardHeader>
          <CardTitle main>Votos de los participantes</CardTitle>
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
    <Card blurred={true}>
      <CardHeader>
        <CardTitle main>Votos de los participantes</CardTitle>
      </CardHeader>
      <CardContent className="px-1 sm:px-4">
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="min-w-[800px] w-full">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10"></TableHead>
                {pointsArray.map(point => (
                  <TableHead key={point} className={`text-center text-xl bg-[white] text-black`}>
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
                                    className="w-8 h-5 object-cover"
                                  />
                                  {/* <span className="text-xs">{vote.country_name}</span> */}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-bold mb-1">{vote.country_name}</p>
                                  {vote.song && (
                                    <p className="flex items-center gap-1">
                                      <Music className="h-3 w-3" strokeWidth={2} />
                                      <span>Canción: {vote.song}</span>
                                    </p>
                                  )}
                                  {vote.singing && (
                                    <p className="flex items-center gap-1">
                                      <Mic className="h-3 w-3" strokeWidth={2} />
                                      <span>Voz: {vote.singing}</span>
                                    </p>
                                  )}
                                  {vote.performance && (
                                    <p className="flex items-center gap-1">
                                      <Theater className="h-3 w-3" strokeWidth={2} />
                                      <span>Interpretación: {vote.performance}</span>
                                    </p>
                                  )}
                                  {vote.staging && (
                                    <p className="flex items-center gap-1">
                                      <Clapperboard className="h-3 w-3" strokeWidth={2} />
                                      <span>Puesta en escena: {vote.staging}</span>
                                    </p>
                                  )}
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
