'use client'

import { motion } from 'framer-motion'
import {
  UserPlusIcon,
  DocumentTextIcon,
  CameraIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  HeartIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const steps = [
  {
    icon: UserPlusIcon,
    title: 'Sign Up',
    description: 'Create your account with a secure password to get started on your journey with us.',
    color: 'bg-canine-sky',
  },
  {
    icon: DocumentTextIcon,
    title: 'Complete Documentation',
    description: 'Fill out all necessary forms about your dog\'s needs, preferences, and special requirements.',
    color: 'bg-canine-cream',
  },
  {
    icon: CameraIcon,
    title: 'Upload Requirements',
    description: 'Submit a photo of your dog and their up-to-date vaccination records for our files.',
    color: 'bg-canine-gold/20',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Book Assessment Day',
    description: 'Schedule your dog\'s assessment visit to meet our team and ensure they\'re a great fit.',
    color: 'bg-canine-sky',
  },
  {
    icon: CheckBadgeIcon,
    title: 'Await Approval',
    description: 'After the assessment, we\'ll notify you within 24 hours about your approval status.',
    color: 'bg-canine-cream',
  },
  {
    icon: HeartIcon,
    title: 'Start Booking',
    description: 'Once approved, you can book your dog\'s daycare sessions anytime through your account!',
    color: 'bg-canine-gold/20',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-canine-cream to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-canine-navy mb-3 sm:mb-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6 px-4">
            Getting started with Aldenham Doggy Day Care is simple and straightforward
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-canine-gold text-white rounded-full shadow-lg"
          >
            <span className="font-bold text-lg sm:text-xl">
              From £160/month
            </span>
          </motion.div>
        </motion.div>

        {/* Timeline style layout */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-canine-gold/20 via-canine-gold/40 to-canine-gold/20"></div>

          <div className="space-y-6 sm:space-y-8 md:space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className="flex-1 lg:px-12">
                  <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 hover:shadow-xl transition-shadow ${
                    index % 2 === 0 ? 'lg:mr-12' : 'lg:ml-12'
                  }`}>
                    {/* Step header */}
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-canine-gold text-white rounded-full font-bold text-base sm:text-lg mr-3 sm:mr-4 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className={`${step.color} p-2 sm:p-3 rounded-lg sm:rounded-xl mr-2 sm:mr-4 flex-shrink-0`}>
                        <step.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-canine-navy" />
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-canine-navy">
                        {step.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed ml-0 sm:ml-14 md:ml-16">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center dot for timeline */}
                <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-canine-gold rounded-full border-4 border-white shadow-lg z-10"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}