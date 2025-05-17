interface QuestionStatusProps {
  state?: string
  isCorrect?: boolean
  hasAnswered?: boolean
  isAdmin?: boolean
}

export function QuestionStatus({ isCorrect, hasAnswered, isAdmin }: QuestionStatusProps) {
  if (isAdmin) {
    return
  }

  if (hasAnswered !== undefined) {
    return (
      <>
        {hasAnswered && (
          <div className="text-right text-xs text-gray-400">
            {`Has respondido ${isCorrect ? 'correctamente' : 'incorrectamente'}`}
          </div>
        )}
      </>
    )
  }

  return null
}
