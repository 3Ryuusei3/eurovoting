import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { EntryInfo } from "./EntryInfo"
import { TopVotedEntry } from "@/types/Room"
import { Info } from "lucide-react"
interface VotingResultsProps {
  topEntries: TopVotedEntry[]
  title?: string
  description?: string
  showCard?: boolean
  hasVoted?: boolean
}

export function VotingResults({
  hasVoted,
  topEntries,
  title = "Votación cerrada",
  description = hasVoted ? "La votación ha concluido, ya no es posible emitir votos. Estos son los resultados de tu votación:" : "La votación ha concluido, pero no has emitido tus votos. Estos habrían sido los resultados de tu votación:",
  showCard = true,
}: VotingResultsProps) {
  const content = (
    <div className={`flex flex-col gap-2 overflow-y-auto hide-scrollbar py-2`}>
      {topEntries.length > 0 ? (
        topEntries.map((entry, index) => (
          <div key={entry.id} className="flex gap-4 items-top justify-between bg-[#1F1F1F]">
            <div className="flex items-center gap-2">
              <EntryInfo entry={entry} score categoryAvg={entry.categoryAvg} />
            </div>
            <div className={`flex flex-col items-center justify-center min-w-13 min-h-12 sm:min-w-14 sm:min-h-13 text-center ${index === 0 ? 'bg-[#F5FA00] text-black' : 'bg-[#FF0000] text-white'}`}>
              <div className={`font-bold text-xl`}>
                {entry.finalPoints}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          No has emitido votos para esta encuesta.
        </p>
      )}
    </div>
  )

  if (!showCard) {
    return content
  }

  return (
    <Card blurred={true}>
      <CardHeader>
        {title && <CardTitle main>{title}</CardTitle>}
        {description && (
          <CardDescription>
          <Alert className="mt-2 bg-red-50 dark:bg-red-950/60 border-0">
            <Info className="h-4 w-4 dark:text-red-500" />
            <AlertDescription className="text-red-800 dark:text-red-400">
              {description}
            </AlertDescription>
          </Alert>
        </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
