import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { CountryScore } from './types'
import { Entry } from '@/types/Room'
import { updateRoomState } from '@/services/rooms'
import confetti from 'canvas-confetti'

interface ResultsModalProps {
  isOpen: boolean
  onClose: () => void
  countryScores: CountryScore[]
  entries: Entry[]
  roomId: string
  roomState: string
}

export function ResultsModal({ isOpen, onClose, countryScores, entries, roomId, roomState }: ResultsModalProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const topScores = [...countryScores]
    .slice(0, 5)
    .reverse()

  const topScoresWithDetails = topScores.map(score => {
    const entry = entries.find(entry => entry.id === score.entry_id)
    return {
      ...score,
      song: entry?.song || '',
      artist: entry?.artist || ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      setVisibleCount(0)
      const delays = [800, 1600, 2400, 3200, 4000]

      delays.forEach((delay, index) => {
        setTimeout(() => {
          setVisibleCount(index + 1)

          if (index === 4) {
            triggerConfetti()
          }
        }, delay)
      })

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen])

  const triggerConfetti = () => {
    const count = 200
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 }

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

    const duration = 10 * 1000
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
    }, 200)
  }

  const handleClose = () => {
    document.body.style.overflow = '';

    // Update room state to "completed" when the modal is closed
    if (roomState !== 'completed') {
      updateRoomState(roomId, 'completed').catch(error => {
        console.error('Error updating room state to completed:', error);
      });
    }
    onClose();
  };

  // Use createPortal to render at the root level of the document
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: "easeInOut"
            }}
            className="fixed inset-0 flex items-center justify-center"
            style={{
              backgroundColor: '#F5FA00',
              boxShadow: 'inset 0 0 50px 10px rgba(255, 215, 0, 0.5)',
              zIndex: 10000
            }}
          >
            <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 py-8">
              <div className="">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={visibleCount === 5 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                    className="mt-3 mb-7 text-center h-[110px]"
                  >
                    <h1 className="text-2xl sm:text-4xl font-bold text-black mb-1">
                      <span className='font-swiss italic'>¡{topScoresWithDetails[topScoresWithDetails.length - 1].country_name} ha ganado!</span>
                    </h1>
                    <div className="text-lg sm:text-2xl text-black">
                      <span className='font-bold'>{topScoresWithDetails[topScoresWithDetails.length - 1].song}</span> - {topScoresWithDetails[topScoresWithDetails.length - 1].artist}
                    </div>
                    <p className="text-sm sm:text-md text-black mt-2">
                      Con un total de <span className='font-bold'>{topScoresWithDetails[topScoresWithDetails.length - 1].points}</span> puntos
                    </p>
                  </motion.div>

                  <div className="flex flex-col-reverse gap-2">
                    {topScoresWithDetails.map((score, index) => {
                      const position = 5 - index;
                      const isVisible = index < visibleCount;

                      return (
                        <motion.div
                          key={score.entry_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          transition={{
                            duration: 0.5,
                            delay: isVisible ? 0.1 : 0
                          }}
                          className={`flex items-center shadow-sm relative overflow-hidden bg-[#1F1F1F] h-[56px]`}
                        >
                          <div className="flex-shrink-0 flex items-center justify-center font-bold text-lg px-3">
                            {(position).toString().padStart(2, '0')}
                          </div>
                          <div className="flex-shrink-0 mr-2">
                            <img
                              src={score.flag_square}
                              alt={score.country_name}
                              className="relative w-15 h-14 object-cover shadow-sm z-10"
                            />
                          </div>
                          <div className="flex-grow p-2">
                            <div className="font-bold font-swiss italic">{score.country_name}</div>
                            <div className="text-xs">
                              <span className='font-bold'>{score.song}</span> - {score.artist}
                            </div>
                          </div>
                          <div
                            className={`
                              relative z-10 flex items-center justify-center font-bold text-xl min-w-15 min-h-14
                              ${position === 1
                                ? 'bg-[#00F7FF] text-black'
                                : 'bg-[#FF0000] text-white'
                              }
                            `}
                          >
                            {score.points}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={visibleCount === 5 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                    className="mt-6 text-center h-[40px]"
                  >
                    {visibleCount === 5 && (
                      <Button onClick={handleClose} variant="default">Cerrar</Button>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
