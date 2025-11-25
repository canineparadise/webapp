'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  HeartIcon,
  SparklesIcon,
  AcademicCapIcon,
  TrophyIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function AboutUs() {
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
              About Us
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover our passion for providing a safe, enriching environment where every dog feels at home.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission and Philosophy */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-6">
              Our Mission & Philosophy
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Here at Aldenham Doggy Day Care we have passion to provide a safe, enriching environment for our four legged friends. Whilst dogs are encouraged to be dogs, with playful behaviour among each other, using positive reinforcement, that builds trust amongst each canine and each member of staff too.
            </p>

            <h2 className="text-4xl font-display font-bold text-canine-navy mb-6 mt-12">
              Our Staff & Team
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              You must love dogs when you work here. With front of house staff and behind the scenes staff we have over 30 years experience working with dogs, from starting out as dog walkers, to running doggy day cares we have plenty experience amongst us to strive forward to try to be the best doggy day care. Staff are qualified and first aid trained with on going in house training provided. We strive to create and environment of fun and enjoyment for both staff and dogs.
            </p>

            <h2 className="text-4xl font-display font-bold text-canine-navy mb-6 mt-12">
              Facility & Environment
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Dogs are separated in two areas. Medium to large dogs and small to medium dogs. Each area has its own weatherproof indoor space equipped with heating for winter and fans for summer with plenty of space for dogs to rest and relax. Each area has its own large outdoor space where dogs get to have fun with their friends.
            </p>
            <p className="text-lg text-gray-700 mb-8">
              Large dog areas indoors space is 11 meter x 3 meter with an outdoor space of 35 meters x 18 meter. The Smaller dog areas indoors space space is 9 meter x 3 meter with an outdoor space of 14 meter by 30 meter. Plenty of space for our dogs to enjoy.
            </p>

            <h2 className="text-4xl font-display font-bold text-canine-navy mb-6 mt-12">
              Daily Activities
            </h2>
            <p className="text-lg text-gray-700 mb-4">A typical day would include:</p>
            <ul className="list-disc list-inside text-lg text-gray-700 mb-8 space-y-2">
              <li>Playtime and socialisation with other dogs</li>
              <li>Enrichment activities with toys and games</li>
              <li>Quiet time for naps or relaxation</li>
            </ul>

            <h2 className="text-4xl font-display font-bold text-canine-navy mb-6 mt-12">
              Services & Features
            </h2>
            <ul className="list-disc list-inside text-lg text-gray-700 mb-8 space-y-2">
              <li>Full-day or half-day options</li>
              <li>Special care for puppies or older dogs: The puppies get plenty more rest during the day and the older dogs can roam at their own pace and relax indoors or out doors</li>
            </ul>

            <h2 className="text-4xl font-display font-bold text-canine-navy mb-6 mt-12">
              Peace of Mind
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              We will keep you updated on our App with up coming events, specials and information. Monthly photos and birthday parties will be found on our social media pages.
            </p>

            <h2 className="text-4xl font-display font-bold text-canine-navy mb-6 mt-12">
              Our Values
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Our goal is to give you the peace of mind that when you drop your dogs off, that they return home with happy wagging tails.
            </p>
          </motion.div>
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
            <div className="flex justify-center">
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