'use client'

import { motion } from 'framer-motion'

interface GoldenPawBadgeProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  className?: string
}

export default function GoldenPawBadge({
  size = 'medium',
  showText = true,
  className = ''
}: GoldenPawBadgeProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      {/* Golden Paw Icon */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        className="relative"
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 blur-md opacity-50`} />

        {/* Paw print */}
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full"
          >
            {/* Main pad */}
            <ellipse
              cx="12"
              cy="16"
              rx="4"
              ry="5"
              className="fill-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600"
              fill="url(#goldGradient)"
            />

            {/* Top left toe */}
            <ellipse
              cx="7"
              cy="9"
              rx="2"
              ry="3"
              fill="url(#goldGradient)"
            />

            {/* Top middle toe */}
            <ellipse
              cx="12"
              cy="7"
              rx="2"
              ry="3"
              fill="url(#goldGradient)"
            />

            {/* Top right toe */}
            <ellipse
              cx="17"
              cy="9"
              rx="2"
              ry="3"
              fill="url(#goldGradient)"
            />

            {/* Fourth toe */}
            <ellipse
              cx="15"
              cy="12"
              rx="1.5"
              ry="2.5"
              fill="url(#goldGradient)"
            />

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Sparkle effects */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            delay: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-amber-300 rounded-full"
        />
      </motion.div>

      {/* Badge Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            GOLDEN PAW
          </span>
          <span className={`text-xs ${size === 'small' ? 'text-[10px]' : ''} font-semibold text-amber-700 -mt-0.5`}>
            VIP Founders Club
          </span>
        </div>
      )}
    </motion.div>
  )
}
