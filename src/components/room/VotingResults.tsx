import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { EntryInfo } from "./EntryInfo"
import { getPointTextColor } from "@/utils"
import { TopVotedEntry } from "./VotingTable"

interface VotingResultsProps {
  topEntries: TopVotedEntry[]
  title?: string
  description?: string
  showCard?: boolean
  maxHeight?: string
}

export function VotingResults({
  topEntries,
  title = "Votación cerrada",
  description = "La votación ha sido cerrada por el administrador. Ya no es posible emitir votos. Estos son los resultados de tu votación:",
  showCard = true,
  maxHeight = "500px"
}: VotingResultsProps) {
  const content = (
    <div className={`overflow-y-auto hide-scrollbar py-2 ${maxHeight ? `max-h-${maxHeight}` : ""}`}>
      {topEntries.length > 0 ? (
        topEntries.map((entry) => (
          <div key={entry.id} className="flex gap-4 items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex items-center gap-2">
              <EntryInfo entry={entry} score userPoints={entry.userPoints} categoryAvg={entry.categoryAvg} />
            </div>
            <div className="flex flex-col items-end">
              <div className={`font-bold text-xl ${getPointTextColor(entry.finalPoints)}`}>
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
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
