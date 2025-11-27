'use client'

import { motion } from 'framer-motion'
import {
  HeartIcon,
  AcademicCapIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const teamMembers = [
  {
    name: 'Claire',
    role: 'Founder & Director',
    description: 'Born in Africa and raised with a deep love for animals, Claire has always been inspired by the outdoors and the companionship of pets. Starting her journey as a dog walker in 2005, she gradually turned her passion into a warm, welcoming haven for dogs. She brings the spirit of African adventure and a lifetime of animal care to her work, creating a nurturing environment where every dog feels happy, safe, and loved.',
    specialties: ['Business Management', 'Canine Behavior', 'Emergency Care'],
    icon: HeartIcon,
    image: 'https://via.placeholder.com/300x300/e8f4f8/1a3a52?text=Claire',
  },
  {
    name: 'Mark Thompson',
    role: 'Senior Dog Care Specialist',
    description: 'Mark brings 8 years of hands-on experience with dogs of all sizes and temperaments. He specializes in socialization and enrichment activities.',
    specialties: ['Dog Socialization', 'Activity Planning', 'Large Breed Care'],
    icon: SparklesIcon,
    image: 'https://via.placeholder.com/300x300/f5f2e8/1a3a52?text=Mark+Thompson',
  },
  {
    name: 'Emma Davis',
    role: 'Certified Dog Trainer',
    description: 'Emma is a certified professional dog trainer who helps with basic obedience and behavioral guidance during daycare sessions.',
    specialties: ['Obedience Training', 'Behavioral Support', 'Puppy Care'],
    icon: AcademicCapIcon,
    image: 'https://via.placeholder.com/300x300/e8f4f8/1a3a52?text=Emma+Davis',
  },
  {
    name: 'James Wilson',
    role: 'Safety & Wellness Coordinator',
    description: 'James ensures all safety protocols are followed and monitors the health and wellbeing of every dog in our care.',
    specialties: ['Safety Protocols', 'Health Monitoring', 'Emergency Response'],
    icon: ShieldCheckIcon,
    image: 'https://via.placeholder.com/300x300/f5f2e8/1a3a52?text=James+Wilson',
  },
]

export default function Team() {
  return (
    <section id="team" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-canine-navy mb-3 sm:mb-4">
            Meet Our Pack
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Our experienced and passionate team members who make Aldenham Doggy Day Care special
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="card group"
            >
              <div className="flex items-start space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-canine-gold/20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-canine-navy mb-1">
                    {member.name}
                  </h3>
                  <p className="text-canine-gold font-medium text-xs sm:text-sm">
                    {member.role}
                  </p>
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-canine-gold/20 mt-2">
                    <member.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-canine-gold" />
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                {member.description}
              </p>

              <div>
                <p className="text-xs sm:text-sm font-medium text-canine-navy mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {member.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-canine-sky text-canine-navy text-xs font-medium rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="card bg-gradient-to-br from-canine-sky to-canine-cream text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-canine-navy mb-3 sm:mb-4">
              Why Our Team Makes the Difference
            </h3>
            <p className="text-sm sm:text-base text-gray-700 mb-5 sm:mb-6">
              Every member of our team is carefully selected for their love of dogs, professional
              qualifications, and commitment to providing exceptional care. We believe that happy,
              well-trained staff create the best environment for your furry friends.
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-canine-navy mb-1 sm:mb-2">100+</div>
                <div className="text-xs sm:text-sm text-gray-600">Hours of Training</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-canine-navy mb-1 sm:mb-2">14+</div>
                <div className="text-xs sm:text-sm text-gray-600">Years Experience</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-canine-navy mb-1 sm:mb-2">5★</div>
                <div className="text-xs sm:text-sm text-gray-600">Customer Rating</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}