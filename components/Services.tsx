'use client'

import { motion } from 'framer-motion'
import {
  SunIcon,
  UserGroupIcon,
  AcademicCapIcon,
  HeartIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const services = [
  {
    icon: SunIcon,
    title: 'Full Day Care',
    description: 'Drop your pup off for a full day of fun, play, and socialization with other friendly dogs.',
    features: ['7:00 AM - 7:00 PM', 'Monday - Friday', 'Structured activities', 'Rest periods included'],
    image: '/fulldaycare.jpeg',
  },
  {
    icon: UserGroupIcon,
    title: 'Socialization Groups',
    description: 'Carefully supervised play groups matched by size, temperament, and energy level.',
    features: ['Size-matched groups', 'Supervised play', 'Social skill building'],
    image: '/socailizationgroups.jpeg',
  },
  {
    icon: AcademicCapIcon,
    title: 'Enrichment Activities',
    description: 'Mental stimulation through puzzles, training games, and interactive play.',
    features: ['Brain games', 'Basic training', 'Sensory activities'],
    image: '/enrichment.jpeg',
  },
  {
    icon: HeartIcon,
    title: 'Individual Attention',
    description: 'One-on-one cuddle time and care for dogs who prefer human companionship.',
    features: ['Personal care', 'Quiet time option', 'Extra TLC'],
    image: '/individualattention.jpeg',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Safety First',
    description: 'Fully licensed, insured, and staffed by trained professionals who love dogs.',
    features: ['Vetted staff', 'Secure facilities', '24/7 monitoring'],
    image: '/safetyfirst.jpeg',
  },
]

export default function Services() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-canine-navy mb-4">
            What We Offer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A complete day of joy, care, and adventure for your furry friend
          </p>
        </motion.div>

        {/* First row - 3 services */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {services.slice(0, 3).map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="card group overflow-hidden"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-canine-gold/20 group-hover:bg-canine-gold/30 transition-colors mb-4">
                <service.icon className="h-7 w-7 text-canine-gold" />
              </div>
              <h3 className="text-xl font-semibold text-canine-navy mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-500">
                    <span className="w-1.5 h-1.5 bg-canine-gold rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Second row - 2 services centered */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.slice(3, 5).map((service, index) => (
            <motion.div
              key={index + 3}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="card group overflow-hidden"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-canine-gold/20 group-hover:bg-canine-gold/30 transition-colors mb-4">
                <service.icon className="h-7 w-7 text-canine-gold" />
              </div>
              <h3 className="text-xl font-semibold text-canine-navy mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-500">
                    <span className="w-1.5 h-1.5 bg-canine-gold rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}