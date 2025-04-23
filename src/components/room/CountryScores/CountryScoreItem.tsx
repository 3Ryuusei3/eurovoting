import { motion } from 'framer-motion'
import { getOverlayStyles, getPositionTextColor } from '@/utils'
import { CountryScore } from './types'

interface CountryScoreItemProps {
  score: CountryScore
  index: number
  isVotedByCurrentUser: boolean
  pointsGiven?: string
  yDelta: number
}

export function CountryScoreItem({
  score,
  index,
  isVotedByCurrentUser,
  pointsGiven,
  yDelta
}: CountryScoreItemProps) {
  return (
    <motion.div
      key={score.entry_id}
      layout
      initial={{ y: yDelta < 0 ? yDelta : 0, opacity: yDelta < 0 ? 0 : 1 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 35, damping: 11, duration: 3 }}
      className={`flex gap-3 items-center py-1 px-2 border rounded-md shadow-sm relative overflow-hidden bg-primary-foreground
        ${isVotedByCurrentUser ? 'border-primary/70' : ''}`}
    >
      {score.points > 0 && index < 3 && (
        <div className={`absolute ${getOverlayStyles(score.points, false, index)}`}></div>
      )}
      <div className="flex-shrink-0 w-5 text-center font-medium">
        {(index + 1).toString().padStart(2, '0')}
      </div>
      <div className="flex-shrink-0">
        <img
          src={score.country_flag}
          alt={score.country_name}
          className="relative w-9 h-6 object-cover rounded shadow-sm z-10"
        />
      </div>
      <div className="flex-grow">
        {score.country_name}
      </div>
      <div className="flex items-center gap-2">
        {/* Show points given by current user if this entry was voted by them */}
        {isVotedByCurrentUser && pointsGiven && (
          <div className="text-sm font-medium px-1.5 py-0.5 rounded-md bg-muted">
            +{pointsGiven}
          </div>
        )}
        <div className={`flex-shrink-0 text-right font-bold text-lg ${score.points !== 0 ? getPositionTextColor(index) : ''}`}>
          {score.points}
        </div>
      </div>
    </motion.div>
  )
}
