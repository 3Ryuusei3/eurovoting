import { useState, useEffect } from 'react'
import { UserAnswer } from '@/types/Question'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInitial } from '@/utils'

interface PlayerScore {
  user_id: number
  user_name: string
  color: string
  text_color: string
  total_answers: number
  correct_answers: number
  score: number
}

interface PlayerScoresViewProps {
  roomId: number
  questionIds: number[]
  userAnswers: UserAnswer[]
}

export function PlayerScoresView({ userAnswers }: PlayerScoresViewProps) {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([])
  const [topPlayerId, setTopPlayerId] = useState<number | null>(null)

  useEffect(() => {
    // Calculate player scores from user answers
    const scoresByUser: Record<number, PlayerScore> = {}

    userAnswers.forEach(answer => {
      const userId = answer.user_id

      // Initialize user score if not exists
      if (!scoresByUser[userId]) {
        scoresByUser[userId] = {
          user_id: userId,
          user_name: answer.user_name || 'Unknown',
          color: answer.color || '#333',
          text_color: answer.text_color || 'white',
          total_answers: 0,
          correct_answers: 0,
          score: 0
        }
      }

      // Update user score
      scoresByUser[userId].total_answers += 1

      // Check if answer is correct
      if (answer.is_correct) {
        scoresByUser[userId].correct_answers += 1
        scoresByUser[userId].score += 10 // 10 points per correct answer
      }
    })

    // Convert to array and sort by score (highest first)
    const scoresArray = Object.values(scoresByUser).sort((a, b) => b.score - a.score)

    // Find the player with the most correct answers
    let maxCorrectAnswers = 0
    let topPlayer = null

    for (const player of scoresArray) {
      if (player.correct_answers > maxCorrectAnswers) {
        maxCorrectAnswers = player.correct_answers
        topPlayer = player.user_id
      }
    }

    setPlayerScores(scoresArray)
    setTopPlayerId(topPlayer)
  }, [userAnswers])

  if (playerScores.length === 0) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          No hay respuestas de jugadores todavía.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Puntuaciones de los jugadores basadas en sus respuestas correctas. Cada respuesta correcta vale 10 puntos.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Pos.</TableHead>
            <TableHead>Jugador</TableHead>
            <TableHead className="text-center">Respuestas</TableHead>
            <TableHead className="text-center">Correctas</TableHead>
            <TableHead className="text-right">Puntos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playerScores.map((player, index) => (
            <TableRow
              key={player.user_id}
              className={player.user_id === topPlayerId ? 'bg-[#F5FA00] hover:bg-[#F5FA00] text-black' : ''}
            >
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor: player.color,
                      color: player.text_color,
                      border: `1.5px solid ${player.text_color}`,
                      boxShadow: `0 0 0px 2px ${player.color}`
                    }}
                  >
                    {getInitial(player.user_name)}
                  </div>
                  <span>{player.user_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">{player.total_answers}</TableCell>
              <TableCell className="text-center">{player.correct_answers}</TableCell>
              <TableCell className="text-right font-bold">{player.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
