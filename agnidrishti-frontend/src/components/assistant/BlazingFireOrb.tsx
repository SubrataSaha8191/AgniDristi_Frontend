import { motion } from 'framer-motion'

interface BlazingFireOrbProps {
  isListening?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function BlazingFireOrb({ isListening = false, size = 'md' }: BlazingFireOrbProps) {
  const containerSizes = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const innerOrbSizes = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  }

  return (
    <div className={`relative flex items-center justify-center ${containerSizes[size]}`}>
      {/* Outer Fiery Wave Ring 1 */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.35, 1] : [1, 1.15, 1],
          opacity: isListening ? [0.4, 0.8, 0.4] : [0.3, 0.6, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: isListening ? 2 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 blur-md opacity-60"
      />

      {/* Outer Fiery Wave Ring 2 (Counter-rotating) */}
      <motion.div
        animate={{
          scale: isListening ? [1.2, 0.95, 1.2] : [1.1, 0.9, 1.1],
          opacity: isListening ? [0.6, 0.9, 0.6] : [0.4, 0.7, 0.4],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: isListening ? 2.5 : 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-1 rounded-full bg-gradient-to-tr from-red-600 via-yellow-500 to-orange-500 blur-sm opacity-70"
      />

      {/* Siri/Gemini Pulsing Wave Aura */}
      <motion.div
        animate={{
          scale: [0.85, 1.25, 0.85],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: isListening ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-2 rounded-full border-2 border-amber-400/60 bg-gradient-to-br from-orange-500/40 via-red-500/30 to-amber-300/40 blur-[2px]"
      />

      {/* Core Glowing Flame Center */}
      <motion.div
        animate={{
          scale: isListening ? [0.95, 1.1, 0.95] : [0.98, 1.04, 0.98],
          boxShadow: isListening
            ? [
                '0 0 20px rgba(255, 87, 34, 0.8), 0 0 40px rgba(255, 193, 7, 0.6)',
                '0 0 35px rgba(239, 68, 68, 0.9), 0 0 60px rgba(245, 158, 11, 0.8)',
                '0 0 20px rgba(255, 87, 34, 0.8), 0 0 40px rgba(255, 193, 7, 0.6)',
              ]
            : [
                '0 0 15px rgba(255, 87, 34, 0.6), 0 0 30px rgba(255, 193, 7, 0.4)',
                '0 0 25px rgba(245, 158, 11, 0.7), 0 0 45px rgba(239, 68, 68, 0.5)',
                '0 0 15px rgba(255, 87, 34, 0.6), 0 0 30px rgba(255, 193, 7, 0.4)',
              ],
        }}
        transition={{
          duration: isListening ? 1.2 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative z-10 flex items-center justify-center rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 text-white ${innerOrbSizes[size]}`}
      >
        {/* Flame Sparkle Core */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200/80 via-orange-500/40 to-transparent"
        />
      </motion.div>
    </div>
  )
}
