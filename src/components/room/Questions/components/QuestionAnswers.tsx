import { Answer, UserAnswer } from '@/types/Question'
import { getInitial } from '@/utils'

interface QuestionAnswersProps {
  answers: Answer[]
  userAnswer?: UserAnswer | null
  showCorrectAnswers?: boolean
  userAnswers?: UserAnswer[]
}

export function QuestionAnswers({
  answers,
  userAnswer,
  showCorrectAnswers = false,
  userAnswers = []
}: QuestionAnswersProps) {
  // Group user answers by answer_id
  const usersByAnswer = userAnswers.reduce((acc, ua) => {
    if (!acc[ua.answer_id]) {
      acc[ua.answer_id] = [];
    }
    acc[ua.answer_id].push(ua);
    return acc;
  }, {} as Record<number, UserAnswer[]>);

  return (
    <div className="grid grid-cols-1 gap-2">
      {answers.map((answer) => {
        const isUserAnswer = userAnswer?.answer_id === answer.id;
        const answerUsers = usersByAnswer[answer.id] || [];
        const hasUsers = answerUsers.length > 0;

        return (
          <div
            key={answer.id}
            className={`p-3 flex flex-col sm:flex-row flex-wrap sm:items-center justify-between text-sm ${
              answer.is_correct && showCorrectAnswers
                ? 'bg-[#2EFD79] text-black'
                : isUserAnswer && !answer.is_correct && showCorrectAnswers
                  ? 'bg-[#FF0000] text-white'
                  : 'bg-input/50'
            }`}
          >
            <div className="py-1">{answer.name}</div>

            {showCorrectAnswers && hasUsers && (
              <div className="ml-auto flex flex-wrap gap-1">
                {answerUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="w-6 h-6 flex items-center justify-center text-xs font-medium transition"
                    style={{
                      backgroundColor: user.color || '#333',
                      color: user.text_color || 'white',
                      border: `1.5px solid ${user.text_color || 'white'}`,
                      boxShadow: `0 0 0px 2px ${user.color || '#333'}`
                    }}
                    title={user.user_name}
                  >
                    {user.user_name ? getInitial(user.user_name) : '?'}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
