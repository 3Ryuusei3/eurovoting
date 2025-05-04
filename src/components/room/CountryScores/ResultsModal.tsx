import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { CountryScore } from './types'
import { Entry } from '@/types/Room'
import confetti from 'canvas-confetti'

interface ResultsModalProps {
  isOpen: boolean
  onClose: () => void
  countryScores: CountryScore[]
  entries: Entry[]
}

export function ResultsModal({ isOpen, onClose, countryScores, entries }: ResultsModalProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  // Get top 5 scores and reverse them to show 5th to 1st
  const topScores = [...countryScores]
    .slice(0, 5)
    .reverse() // Reverse to get 5th to 1st

  // Find the corresponding entry data for each country score
  const topScoresWithDetails = topScores.map(score => {
    const entry = entries.find(entry => entry.id === score.entry_id)
    return {
      ...score,
      song: entry?.song || '',
      artist: entry?.artist || ''
    }
  })

  // Reset visible count when modal opens
  useEffect(() => {
    if (isOpen) {
      setVisibleCount(0)

      // Start revealing countries one by one with increasing delays
      // This creates a more dramatic effect as we get closer to the winner
      // We're revealing from 5th to 1st place, but displaying in reverse order
      const delays = [800, 1200, 1600, 2000, 2500] // Increasing delays in ms

      // Schedule each reveal with its own timeout
      delays.forEach((delay, index) => {
        setTimeout(() => {
          setVisibleCount(index + 1)

          // If we've revealed the winner (last one), trigger confetti
          if (index === 4) { // 5th item (index 4)
            triggerConfetti()
          }
        }, delay)
      })
    }
  }, [isOpen])

  const triggerConfetti = () => {
    // First, fire a big burst of confetti
    const count = 200
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    // Fire from multiple positions for a more dramatic effect
    confetti({
      ...defaults,
      particleCount: count,
      origin: { x: 0.2, y: 0.5 }
    })
    confetti({
      ...defaults,
      particleCount: count,
      origin: { x: 0.8, y: 0.5 }
    })

    // Then continue with a sustained confetti effect
    const duration = 15 * 1000 // 15 seconds duration
    const animationEnd = Date.now() + duration

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 200) // Fire more frequently
  }

  // Custom close handler
  const handleClose = () => {
    // Just close the modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>

          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <div className="space-y-2">
          {visibleCount === 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                className="mt-3 mb-7 text-center"
              >
                <h1 className="text-3xl font-bold">
                  <span className='font-swiss italic'>¡{topScoresWithDetails[topScoresWithDetails.length - 1].country_name} ha ganado!</span>
                </h1>
                <div className="text-2xl">
                  {topScoresWithDetails[topScoresWithDetails.length - 1].song} - {topScoresWithDetails[topScoresWithDetails.length - 1].artist}
                </div>
                <p className="text-muted-foreground mt-2">
                  Con un total de <span className='font-bold'>{topScoresWithDetails[topScoresWithDetails.length - 1].points}</span> puntos
                </p>
              </motion.div>
            )}

            <div className="flex flex-col-reverse gap-2">
              <AnimatePresence>
                {[...topScoresWithDetails]
                  .slice(0, visibleCount)
                  .map((score, index) => {

                  const position = 5 - index

                return (
                  <motion.div
                    key={score.entry_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`flex items-center gap-3 shadow-sm relative overflow-hidden bg-[#1F1F1F]`}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center font-bold text-lg p-3 pr-0">
                      {position}
                    </div>
                    <div className="flex-shrink-0 p-3">
                      <img
                        src={score.country_flag}
                        alt={score.country_name}
                        className="relative w-12 h-8 object-cover shadow-sm z-10"
                      />
                    </div>
                    <div className="flex-grow p-3">
                      <div className="font-medium">{score.country_name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {score.song} - {score.artist}
                      </div>
                    </div>
                    <div
                      className={`
                        relative z-10 text-right font-bold text-xl min-w-10 p-4
                        ${position === 1
                          ? 'bg-[#F5FA00] text-black'
                          : 'bg-[#FF0000] text-white'
                        }
                      `}
                    >
                      {score.points}
                    </div>
                  </motion.div>
                )
              })}
              </AnimatePresence>
            </div>
            {visibleCount === 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                className="mt-6 text-center"
              >
                <Button onClick={handleClose}>Cerrar</Button>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
