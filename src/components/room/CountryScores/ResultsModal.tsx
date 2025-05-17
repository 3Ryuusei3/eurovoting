import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { CountryScore } from './types'
import { Entry } from '@/types/Room'
import { updateRoomState } from '@/services/rooms'
import confetti from 'canvas-confetti'
import { extendedColorPalette } from '@/constants'

interface ResultsModalProps {
  isOpen: boolean
  onClose: () => void
  countryScores: CountryScore[]
  entries: Entry[]
  roomId: string
  roomState: string
}

// Separate component for score items to better control animations
interface ScoreItemProps {
  score: CountryScore & { song: string; artist: string };
  position: number;
  isVisible: boolean;
}

const ScoreItem = ({ score, position, isVisible }: ScoreItemProps) => {
  // Use a ref to track if this item has been shown
  const hasBeenShown = useRef(false);

  // Once visible, always stay visible
  if (isVisible) {
    hasBeenShown.current = true;
  }

  return (
    <motion.div
      key={score.entry_id}
      initial={{ opacity: 0, y: 20 }}
      animate={hasBeenShown.current ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.5,
        delay: 0.1,
        type: "spring",
        stiffness: 100
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
          className="relative w-14 h-14 object-cover shadow-sm z-10"
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
};

// Separate component for winner announcement to better control animations
interface WinnerAnnouncementProps {
  winner: CountryScore & { song: string; artist: string };
  isVisible: boolean;
}

const WinnerAnnouncement = ({ winner, isVisible }: WinnerAnnouncementProps) => {
  // Use a ref to track if this announcement has been shown
  const hasBeenShown = useRef(false);

  // Once visible, always stay visible
  if (isVisible) {
    hasBeenShown.current = true;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={hasBeenShown.current ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{
        duration: 0.8,
        delay: 0.5,
        type: "spring",
        stiffness: 100
      }}
      className="mt-3 mb-7 text-center h-[110px]"
    >
      <h1 className="text-2xl sm:text-4xl font-bold text-black mb-1">
        <span className='font-swiss italic'>¡{winner.country_name} ha ganado!</span>
      </h1>
      <div className="text-lg sm:text-2xl text-black">
        <span className='font-bold'>{winner.song}</span> - {winner.artist}
      </div>
      <p className="text-sm sm:text-md text-black mt-2">
        Con un total de <span className='font-bold'>{winner.points}</span> puntos
      </p>
    </motion.div>
  );
};

// Separate component for close button to better control animations
interface CloseButtonProps {
  isVisible: boolean;
  onClose: () => void;
}

const CloseButton = ({ isVisible, onClose }: CloseButtonProps) => {
  // Use a ref to track if this button has been shown
  const hasBeenShown = useRef(false);

  // Once visible, always stay visible
  if (isVisible) {
    hasBeenShown.current = true;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={hasBeenShown.current ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{
        duration: 0.5,
        delay: 0.5,
        type: "spring",
        stiffness: 100
      }}
      className="mt-6 text-center h-[40px]"
    >
      {hasBeenShown.current && (
        <Button onClick={onClose} variant="default">Cerrar</Button>
      )}
    </motion.div>
  );
};

export function ResultsModal({ isOpen, onClose, countryScores, entries, roomId, roomState }: ResultsModalProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  // Track if animation sequence has started
  const animationStarted = useRef(false)
  // Track if confetti has been triggered
  const confettiTriggered = useRef(false)
  // Track timeouts to clear them if needed
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

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
    // Clear any existing timeouts when component unmounts or modal closes
    return () => {
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Reset animation state when modal opens
      setVisibleCount(0)
      animationStarted.current = false
      confettiTriggered.current = false

      // Clear any existing timeouts
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];

      // Use longer delays between items
      const delays = [800, 1600, 2400, 3200, 4000]

      // Start animation sequence with a small initial delay
      const initialDelay = setTimeout(() => {
        animationStarted.current = true;

        // Show each position with appropriate delay
        delays.forEach((delay, index) => {
          const timeoutId = setTimeout(() => {
            setVisibleCount(index + 1)

            // Trigger confetti only after the last item is shown
            if (index === 4 && !confettiTriggered.current) {
              const confettiDelay = setTimeout(() => {
                triggerConfetti()
                confettiTriggered.current = true
              }, 700)
              timeoutsRef.current.push(confettiDelay)
            }
          }, delay)
          timeoutsRef.current.push(timeoutId)
        })
      }, 200)
      timeoutsRef.current.push(initialDelay)

      return () => {
        document.body.style.overflow = '';
        // Clear all timeouts when effect cleanup runs
        timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        timeoutsRef.current = [];
      };
    }
  }, [isOpen])

  const triggerConfetti = () => {
    // Only trigger confetti if it hasn't been triggered yet
    if (confettiTriggered.current) return;

    const count = 200
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 }

    // Initial burst of confetti with colors from extendedColorPalette
    confetti({
      ...defaults,
      particleCount: count,
      origin: { x: 0.2, y: 0.5 },
      colors: extendedColorPalette
    })
    confetti({
      ...defaults,
      particleCount: count,
      origin: { x: 0.8, y: 0.5 },
      colors: extendedColorPalette
    })

    // Set up continuous confetti with a shorter duration
    const duration = 16 * 1000
    const animationEnd = Date.now() + duration

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    // Use a lower frequency for the interval to reduce CPU usage
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      // Reduce particle count for better performance
      const particleCount = 50 * (timeLeft / duration)

      // Only fire confetti if we're still in the first part of the animation
      if (timeLeft > duration / 2) {
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: extendedColorPalette
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: extendedColorPalette
        })
      }
    }, 300)

    // Store the interval ID so we can clear it if needed
    timeoutsRef.current.push(interval as unknown as NodeJS.Timeout)
  }

  const handleClose = async () => {
    document.body.style.overflow = '';

    // Clear all timeouts and intervals
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutsRef.current = [];

    // Reset animation state
    animationStarted.current = false;
    confettiTriggered.current = false;
    setVisibleCount(0);

    if (roomState !== 'completed') {
      try {
        await updateRoomState(roomId, 'completed');
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error updating room state to completed:', error);
      }
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
                  <WinnerAnnouncement
                    winner={topScoresWithDetails[topScoresWithDetails.length - 1]}
                    isVisible={visibleCount === 5}
                  />

                  <div className="flex flex-col-reverse gap-2">
                    {topScoresWithDetails.map((score, index) => {
                      const position = 5 - index;
                      const isVisible = index < visibleCount;

                      return (
                        <ScoreItem
                          key={score.entry_id}
                          score={score}
                          position={position}
                          isVisible={isVisible}
                        />
                      );
                    })}
                  </div>
                  <CloseButton
                    isVisible={visibleCount === 5}
                    onClose={handleClose}
                  />
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
