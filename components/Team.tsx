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
    name: 'Sarah Johnson',
    role: 'Owner & Head of Operations',
    description: 'Sarah founded Canine Paradise with over 10 years of experience in animal care. She holds certifications in canine behavior and first aid.',
    specialties: ['Business Management', 'Canine Behavior', 'Emergency Care'],
    icon: HeartIcon,
    image: 'https://via.placeholder.com/300x300/e8f4f8/1a3a52?text=Sarah+Johnson',
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
    <section id="team" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-canine-navy mb-4">
            Meet Our Pack
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our experienced and passionate team members who make Canine Paradise special
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
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
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-canine-gold/20"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-canine-navy mb-1">
                    {member.name}
                  </h3>
                  <p className="text-canine-gold font-medium text-sm">
                    {member.role}
                  </p>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-canine-gold/20 mt-2">
                    <member.icon className="h-4 w-4 text-canine-gold" />
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {member.description}
              </p>

              <div>
                <p className="text-sm font-medium text-canine-navy mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {member.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-canine-sky text-canine-navy text-xs font-medium rounded-full"
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
            <h3 className="text-2xl font-display font-bold text-canine-navy mb-4">
              Why Our Team Makes the Difference
            </h3>
            <p className="text-gray-700 mb-6">
              Every member of our team is carefully selected for their love of dogs, professional
              qualifications, and commitment to providing exceptional care. We believe that happy,
              well-trained staff create the best environment for your furry friends.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-canine-navy mb-2">100+</div>
                <div className="text-sm text-gray-600">Hours of Training</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-canine-navy mb-2">24/7</div>
                <div className="text-sm text-gray-600">Care & Supervision</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-canine-navy mb-2">5★</div>
                <div className="text-sm text-gray-600">Customer Rating</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}