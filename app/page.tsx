'use client'

import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <About />
        <Services />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </motion.div>
    </div>
  )
}