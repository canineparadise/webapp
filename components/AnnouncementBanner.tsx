'use client'

import { motion } from 'framer-motion'
import { MapPinIcon, SparklesIcon } from '@heroicons/react/24/solid'

export default function AnnouncementBanner() {
  return (
    <div className="bg-gradient-to-r from-canine-gold to-canine-light-gold overflow-hidden">
      <div className="relative flex">
        <motion.div
          className="flex items-center space-x-8 whitespace-nowrap py-2 px-4"
          animate={{
            x: [0, -100 + '%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-8">
              <span className="flex items-center space-x-2 text-white font-semibold">
                <SparklesIcon className="h-4 w-4" />
                <span>🎉 Exciting News!</span>
              </span>
              <span className="flex items-center space-x-2 text-white">
                <MapPinIcon className="h-4 w-4" />
                <span>We're moving to a pawsome new location on November 1st, 2025!</span>
              </span>
              <span className="text-white">🐕 Bigger play areas!</span>
              <span className="text-white">🎾 More fun zones!</span>
              <span className="text-white">🏡 Same loving care!</span>
              <span className="text-white mx-8">•</span>
            </div>
          ))}
        </motion.div>
        <motion.div
          className="flex items-center space-x-8 whitespace-nowrap py-2 px-4 absolute"
          animate={{
            x: ['100%', 0],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-8">
              <span className="flex items-center space-x-2 text-white font-semibold">
                <SparklesIcon className="h-4 w-4" />
                <span>🎉 Exciting News!</span>
              </span>
              <span className="flex items-center space-x-2 text-white">
                <MapPinIcon className="h-4 w-4" />
                <span>We're moving to a pawsome new location on November 1st, 2025!</span>
              </span>
              <span className="text-white">🐕 Bigger play areas!</span>
              <span className="text-white">🎾 More fun zones!</span>
              <span className="text-white">🏡 Same loving care!</span>
              <span className="text-white mx-8">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}