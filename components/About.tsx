'use client'

import { motion } from 'framer-motion'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function About() {
  const features = [
    'Certified canine behavior specialists on staff',
    'Spacious indoor and outdoor adventure zones',
    'Tailored playgroups matched by size and temperament',
    'Live photo updates throughout your pup\'s day',
    'Flexible drop-off and pick-up times (7AM-7PM)',
    'Veterinary support on call',
  ]

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-canine-cream to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-canine-navy mb-4 sm:mb-6">
              Why Choose Aldenham Doggy Day Care?
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
              At Aldenham Doggy Day Care, we provide a safe, engaging, and loving environment where your furry friend can play, socialize, and thrive. Our dedicated team ensures every dog receives personalized attention and care tailored to their unique needs.
            </p>
            <ul className="space-y-2.5 sm:space-y-3">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-canine-gold mr-2.5 sm:mr-3 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="/about-dogs.jpeg"
              alt="Happy dogs playing at daycare"
              className="rounded-2xl shadow-xl w-full object-cover h-64 sm:h-80 md:h-96 lg:h-[500px]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}