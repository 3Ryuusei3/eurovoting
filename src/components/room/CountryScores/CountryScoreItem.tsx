import { motion } from 'framer-motion'
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
      className={`flex gap-3 items-center shadow-sm relative overflow-hidden bg-[#1F1F1F]`}
    >
      <div className="flex-shrink-0 w-5 text-center font-medium py-1 px-2">
        {(index + 1).toString().padStart(2, '0')}
      </div>
      <div className="flex-shrink-0 py-1 px-2">
        <img
          src={score.country_flag}
          alt={score.country_name}
          className="relative w-9 h-6 object-cover shadow-sm z-10"
        />
      </div>
      <div className="flex-grow py-1 px-2">
        {score.country_name}
      </div>
      <div className="flex items-center gap-2">
        {/* Show points given by current user if this entry was voted by them */}
        {isVotedByCurrentUser && pointsGiven && (
          <div className="text-sm font-medium px-1.5 py-0.5 bg-[#414141]">
            +{pointsGiven}
          </div>
        )}
        <div className={`flex-shrink-0 text-center font-bold text-lg min-w-10 ${isVotedByCurrentUser ? 'bg-[#FF0000]' : 'bg-[#414141]'}  text-white py-1 px-2`}>
          {score.points}
        </div>
      </div>
    </motion.div>
  )
}
