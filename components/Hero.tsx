'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SparklesIcon, HeartIcon, CheckCircleIcon } from '@heroicons/react/24/solid'

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/hero-banner-outdoor.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-canine-navy/40 via-canine-navy/50 to-canine-navy/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-canine-gold/10 to-transparent"></div>
      </div>
      <div className="absolute inset-0 paw-pattern opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-canine-navy font-semibold text-sm border border-canine-gold/30">
              <SparklesIcon className="h-4 w-4 mr-2 text-canine-gold" />
              Welcome to Paradise
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg"
          >
            Where Every Dog
            <span className="block text-canine-gold mt-2 drop-shadow-lg">Finds Paradise</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/95 mb-10 max-w-3xl mx-auto drop-shadow-md"
          >
            Professional doggy day care services with a touch of love.
            Your furry friend deserves the best care while you're away!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login" className="bg-canine-gold text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-canine-light-gold hover:shadow-xl hover:scale-105 inline-flex items-center justify-center group">
              Book a Visit
              <HeartIcon className="h-5 w-5 ml-2 group-hover:animate-pulse" />
            </Link>
            <Link href="#about" className="bg-white/90 backdrop-blur-sm text-canine-navy px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 inline-flex items-center justify-center">
              Learn More
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { text: 'Licensed & Insured' },
            { text: '14+ Years Experience' },
            { text: '24/7 Emergency Support' },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center space-x-3 bg-white/90 backdrop-blur-sm rounded-xl py-4 px-6 border border-canine-gold/20"
            >
              <CheckCircleIcon className="h-6 w-6 text-canine-gold flex-shrink-0" />
              <span className="text-canine-navy font-semibold">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-20" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}