'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  HeartIcon,
  SparklesIcon,
  AcademicCapIcon,
  TrophyIcon,
  UserGroupIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function AboutUs() {
  const milestones = [
    { year: '2005', event: 'Claire became a dog walker and loved the outdoor office space' },
    { year: '2010', event: 'Launched Canine Paradise Doggy Day Care in Chiswell Green' },
    { year: '2014', event: 'Moved to Fieldgrove Farm, transforming it with love and care' },
    { year: '2015', event: 'Introduced specialized puppy socialization programs' },
    { year: '2018', event: 'Won "Best Dog Daycare in Hertfordshire" award' },
    { year: '2020', event: 'Launched virtual check-ins for pet parents' },
    { year: '2025', event: 'Continuing our focus on exceptional daycare services' },
  ]

  const values = [
    {
      icon: HeartIcon,
      title: 'Love & Compassion',
      description: 'Every dog is treated with the same love and care we give our own pets. Your furry friend becomes part of our extended family.',
    },
    {
      icon: AcademicCapIcon,
      title: 'Expertise & Training',
      description: 'Our team undergoes continuous professional development to stay current with the latest in canine behavior and care techniques.',
    },
    {
      icon: UserGroupIcon,
      title: 'Community & Connection',
      description: 'We foster a warm community where dogs make lifelong friends and owners connect with fellow dog lovers.',
    },
    {
      icon: TrophyIcon,
      title: 'Excellence & Safety',
      description: 'Award-winning standards of safety and care, with protocols that exceed industry requirements.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-canine-navy/5 to-canine-gold/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-canine-navy mb-6">
              Our Story
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              From African adventures to creating Hertfordshire's most beloved dog daycare,
              discover how Canine Paradise became a second home for your furry friends.
            </p>
          </motion.div>

          {/* Hero Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://via.placeholder.com/1200x600/e8f4f8/1a3a52?text=Our+Beautiful+Facility"
              alt="Canine Paradise Facility"
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Our Beginning */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-display font-bold text-canine-navy mb-6">
                From Africa to Elstree
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                Claire and Andrew's story began in Africa, where they both grew up surrounded by
                animals and adventure. Claire, born to a British father and Zimbabwean mother,
                explored the African outback, climbed trees, and was even chased by warthogs!
                Their love for animals was evident from childhood, with pets ranging from dogs
                and cats to birds, tortoises, and even a monkey.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                They met at Claire's brother's 21st birthday party - it was love at first sight.
                After marrying in 1998 and moving to England, Claire became a dog walker in 2005,
                loving the 'outdoor office space.' Andrew soon joined her, leaving his corporate
                IT background behind for a life working with dogs.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                In 2010, as they welcomed their daughter Emmalee, they launched Canine Paradise
                in Chiswell Green. In 2014, they moved to Fieldgrove Farm, transforming a derelict
                property into a beautiful space filled with love and care. Today, with their
                children Emmalee and Seth, four dogs, and four cats, they continue to make
                Canine Paradise a special place where every dog feels at home.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <img
                src="https://via.placeholder.com/300x300/f5f2e8/1a3a52?text=Founder+with+Dogs"
                alt="Founder with dogs"
                className="rounded-lg shadow-lg"
              />
              <img
                src="https://via.placeholder.com/300x300/e8f4f8/1a3a52?text=Original+Facility"
                alt="Original facility"
                className="rounded-lg shadow-lg mt-8"
              />
              <img
                src="https://via.placeholder.com/300x300/e8f4f8/1a3a52?text=First+Dogs"
                alt="First dogs at daycare"
                className="rounded-lg shadow-lg"
              />
              <img
                src="https://via.placeholder.com/300x300/f5f2e8/1a3a52?text=Team+2010"
                alt="Original team"
                className="rounded-lg shadow-lg mt-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gradient-to-br from-canine-sky to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-4">
              What Drives Us
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our core values shape everything we do, from daily care to long-term relationships
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-canine-gold/20 rounded-full flex items-center justify-center mb-4">
                  <value.icon className="h-7 w-7 text-canine-gold" />
                </div>
                <h3 className="text-xl font-semibold text-canine-navy mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-700">
              14 years of tails, treats, and transformations
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-canine-gold/30"></div>

            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex items-center mb-8 ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <span className="text-canine-gold font-bold text-lg">{milestone.year}</span>
                    <p className="text-gray-700 mt-2">{milestone.event}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-canine-gold rounded-full border-4 border-white shadow"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="py-20 bg-gradient-to-br from-canine-navy to-canine-gold text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold mb-4">
              Fun Facts About Us
            </h2>
            <p className="text-xl text-white/90">
              Some pawsome numbers and quirky facts
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-canine-gold mb-2">50,000+</div>
              <p className="text-white">Belly rubs given</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-canine-gold mb-2">10,000+</div>
              <p className="text-white">Tennis balls thrown</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-canine-gold mb-2">260+</div>
              <p className="text-white">Days of fun per year</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-canine-gold mb-2">∞</div>
              <p className="text-white">Amount of love</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <SparklesIcon className="h-12 w-12 text-canine-gold mx-auto mb-4" />
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-4">
              Ready to Join Our Story?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Your dog's next chapter of adventures, friendships, and tail-wagging happiness starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/team"
                className="btn-outline inline-flex items-center justify-center"
              >
                Meet Our Team
              </Link>
              <Link
                href="/contact"
                className="btn-primary inline-flex items-center justify-center"
              >
                Get In Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}