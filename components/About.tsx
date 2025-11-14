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
    <section id="about" className="py-20 bg-gradient-to-br from-canine-cream to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-canine-navy mb-6">
              From Africa to Elstree
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Claire and Andrew's journey began in Africa, where both grew up surrounded by wildlife, open landscapes, and endless adventure. Claire, born to a British father and Zimbabwean mother, spent her childhood exploring the bush, climbing trees, and even escaping the occasional warthog. Animals were always part of their world — from dogs and cats to birds, tortoises, and even a cheeky monkey.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              The pair met at Claire's brother's 21st birthday party, where it was love at first sight. After marrying in 1998 and moving to England, Claire began working as a dog walker in 2005, embracing the freedom of an "outdoor office." Andrew soon joined her, leaving behind a corporate IT background to work with dogs full-time.
            </p>
            <p className="text-lg text-gray-700 mb-8">
              In 2010, as they welcomed their daughter Emmalee, they expanded their passion into a full-time family venture. Over the years, their dedication, love for animals, and hands-on experience shaped a caring, nurturing environment for dogs. Today, with their children Emmalee and Seth — along with their own four dogs and four cats — Claire and Andrew continue to create a place where every dog feels safe, loved, and truly at home.
            </p>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <CheckCircleIcon className="h-6 w-6 text-canine-gold mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
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