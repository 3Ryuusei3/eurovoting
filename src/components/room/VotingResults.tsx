import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { EntryInfo } from "./EntryInfo"
import { TopVotedEntry } from "@/types/Room"
interface VotingResultsProps {
  topEntries: TopVotedEntry[]
  title?: string
  description?: string
  showCard?: boolean
}

export function VotingResults({
  topEntries,
  title = "Votación cerrada",
  description = "La votación ha sido cerrada por el administrador. Ya no es posible emitir votos. Estos son los resultados de tu votación:",
  showCard = true,
}: VotingResultsProps) {
  console.log(topEntries)
  const content = (
    <div className={`flex flex-col gap-1 overflow-y-auto hide-scrollbar py-2`}>
      {topEntries.length > 0 ? (
        topEntries.map((entry) => (
          <div key={entry.id} className="flex gap-4 items-center justify-between bg-[#1F1F1F]">
            <div className="flex items-center gap-2 p-2">
              <EntryInfo entry={entry} score categoryAvg={entry.categoryAvg} />
            </div>
            <div className="flex flex-col items-center justify-center min-w-12 text-center bg-[#FF0000] h-full py-2">
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
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
