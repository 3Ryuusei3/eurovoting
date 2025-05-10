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
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
