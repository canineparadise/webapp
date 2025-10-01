'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SparklesIcon, CalendarIcon } from '@heroicons/react/24/solid'

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-canine-navy via-canine-navy to-canine-gold relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-canine-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-canine-cream rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 bg-canine-gold/20 backdrop-blur-sm rounded-full mb-8 border border-canine-gold/30"
          >
            <SparklesIcon className="h-4 w-4 text-canine-gold mr-2" />
            <span className="text-canine-gold font-semibold">Limited Spaces Available</span>
          </motion.div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Give Your Dog Their
            <span className="block text-canine-gold mt-2">Best Day Ever!</span>
          </h2>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join our exclusive family where every dog enjoys personalized care and attention.
            Your pup's paradise adventure starts here.
          </p>

          {/* Pricing Feature */}
          <div className="flex justify-center mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl px-8 py-6 border border-white/20"
            >
              <span className="text-3xl font-bold text-canine-gold">From £160</span>
              <p className="text-white font-semibold text-lg mt-1">Per Month</p>
              <p className="text-white/80 text-sm mt-1">4 days/month subscription</p>
            </motion.div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/signup"
                className="bg-canine-gold text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:bg-canine-light-gold hover:shadow-2xl inline-flex items-center group"
              >
                <CalendarIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Book Assessment Day
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}