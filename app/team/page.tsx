'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  HeartIcon,
  SparklesIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/solid'

export default function MeetTheTeam() {
  const founders = [
    {
      name: 'Claire',
      role: 'Founder & Director',
      bio: 'Born in Africa and raised with a love for animals, Claire transformed her passion into Canine Paradise. From walking dogs in 2005 to creating a daycare haven, she brings African adventure spirit to English countryside dog care.',
      funFact: 'Was once chased by a warthog and a wild donkey in Africa!',
      qualifications: ['Professional Dog Walker since 2005', 'Canine Behavior Expert', 'Business Owner for 14+ years'],
    },
    {
      name: 'Andrew',
      role: 'Operations Director',
      bio: 'Andrew is more than just the Operations Director - he\'s wherever he\'s needed. With his Yorkshire roots and African upbringing, he brings both business acumen and genuine love for animals to Canine Paradise.',
      funFact: 'Left his corporate IT career to work with dogs',
      qualifications: ['Business Management', 'IT & Operations Expert', 'Animal Care Specialist'],
    },
  ]

  const teamValues = [
    {
      icon: HeartIcon,
      title: 'Passionate Care',
      description: 'Every member of our team is handpicked for their genuine love of dogs and dedication to their wellbeing.',
    },
    {
      icon: AcademicCapIcon,
      title: 'Expert Training',
      description: 'Our staff are trained in canine behavior, first aid, and safety protocols to ensure the best care for your furry friend.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safety First',
      description: 'We maintain the highest safety standards and protocols, with staff trained to handle any situation with care and professionalism.',
    },
    {
      icon: ClockIcon,
      title: 'Years of Experience',
      description: 'With over 14 years of experience in doggy daycare, our team knows how to make every dog feel at home.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-canine-navy to-canine-gold">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-canine-gold rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Meet Our Team
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Led by Claire and Andrew, our passionate team is dedicated to making
              Canine Paradise the happiest place for your furry friends.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-4">
              Our Founders
            </h2>
            <p className="text-xl text-gray-700">
              The heart and soul behind Canine Paradise
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow"
              >
                <h3 className="text-3xl font-bold text-canine-navy mb-2">
                  {founder.name}
                </h3>
                <p className="text-canine-gold font-semibold mb-4 text-lg">
                  {founder.role}
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {founder.bio}
                </p>

                {/* Fun Fact */}
                <div className="bg-canine-sky rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <SparklesIcon className="h-5 w-5 text-canine-gold mr-2" />
                    <span className="font-semibold text-canine-navy">Fun Fact</span>
                  </div>
                  <p className="text-gray-700 text-sm">{founder.funFact}</p>
                </div>

                {/* Qualifications */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-canine-navy mb-3">Qualifications:</p>
                  <div className="flex flex-wrap gap-2">
                    {founder.qualifications.map((qual, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-canine-gold/10 text-canine-navy px-3 py-1 rounded-full"
                      >
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 bg-gradient-to-br from-canine-sky to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <UserGroupIcon className="h-16 w-16 text-canine-gold mx-auto mb-4" />
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-4">
              Our Caring Team
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Behind every wagging tail is a dedicated team member who genuinely loves what they do.
              Our staff are carefully selected for their passion, experience, and commitment to providing
              the best possible care for your furry family members.
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each team member is trained in canine behavior, safety protocols, and first aid.
              Together, we create a safe, fun, and nurturing environment where every dog can thrive.
            </p>
          </motion.div>

          {/* Team Values Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {teamValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg text-center"
              >
                <div className="w-14 h-14 bg-canine-gold/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <value.icon className="h-7 w-7 text-canine-gold" />
                </div>
                <h3 className="text-lg font-semibold text-canine-navy mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <SparklesIcon className="h-12 w-12 text-canine-gold mx-auto mb-4" />
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-4">
              Ready to Meet Us in Person?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              We'd love to show you around and introduce you to our wonderful team.
              Come see why dogs and their owners love Canine Paradise!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="btn-primary inline-flex items-center justify-center"
              >
                Get In Touch
              </Link>
              <Link
                href="/about"
                className="btn-outline inline-flex items-center justify-center"
              >
                Learn More About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
