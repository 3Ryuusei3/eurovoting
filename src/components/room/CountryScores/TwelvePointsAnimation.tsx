import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TwelvePointsAnimationProps {
  isVisible: boolean
  countryName: string
  userName: string
  onAnimationComplete: () => void
}

export function TwelvePointsAnimation({
  isVisible,
  countryName,
  userName,
  onAnimationComplete
}: TwelvePointsAnimationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onAnimationComplete()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onAnimationComplete])

  const textVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0 }
  }

  const characterAnimation = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-1000"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
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
            }}
          >
            <div className="flex flex-col items-center justify-center w-full px-4">
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 0.5,
                  delay: 0.5,
                  ease: "easeOut"
                }}
                className="text-2xl md:text-3xl font-medium mb-4 text-black text-center"
              >
                Los 12 puntos de {userName} son para...
              </motion.div>

              <motion.div
                className="text-6xl md:text-8xl font-bold font-swiss italic text-black overflow-hidden"
                style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.3)' }}
              >
                {countryName.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    variants={characterAnimation}
                    initial="hidden"
                    animate="visible"
                    transition={{
                      duration: 0.3,
                      delay: 0.7 + index * 0.05,
                      type: "spring",
                      stiffness: 200
                    }}
                    style={{ display: 'inline-block' }}
                  >
                    {char === ' ' ? '\u00A0' : char.toUpperCase()}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
