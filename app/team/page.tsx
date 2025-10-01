'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  HeartIcon,
  SparklesIcon,
  AcademicCapIcon,
  TrophyIcon,
  StarIcon,
  CakeIcon
} from '@heroicons/react/24/solid'

export default function MeetTheTeam() {
  const teamMembers = [
    {
      name: 'Claire',
      role: 'Founder & Director',
      image: 'https://via.placeholder.com/400x400/e8f4f8/1a3a52?text=Claire',
      bio: 'Born in Africa and raised with a love for animals, Claire transformed her passion into Canine Paradise. From walking dogs in 2005 to creating a daycare haven, she brings African adventure spirit to English countryside dog care.',
      funFact: 'Was once chased by a warthog and a wild donkey in Africa!',
      qualifications: ['Professional Dog Walker since 2005', 'Canine Behavior Expert', 'Business Owner for 14+ years'],
      favoriteBreed: 'All breeds deserve love!',
      yearsWithUs: '14',
    },
    {
      name: 'Andrew',
      role: 'Operations Director',
      image: 'https://via.placeholder.com/400x400/f5f2e8/1a3a52?text=Andrew',
      bio: 'Andrew is more than just the Operations Director - he\'s wherever he\'s needed. With his Yorkshire roots and African upbringing, he brings both business acumen and genuine love for animals to Canine Paradise.',
      funFact: 'Left his corporate IT career to work with dogs',
      qualifications: ['Business Management', 'IT & Operations Expert', 'Animal Care Specialist'],
      favoriteBreed: 'The adventurous ones',
      yearsWithUs: '14',
    },
    {
      name: 'Team Leader',
      role: 'Head of Day Care Operations',
      image: 'https://via.placeholder.com/400x400/e8f4f8/1a3a52?text=Team+Leader',
      bio: 'Our experienced team leader ensures smooth daily operations and maintains the high standards of care that Canine Paradise is known for. They coordinate activities and ensure every dog has the perfect day.',
      funFact: 'Can calm any anxious pup within minutes',
      qualifications: ['Dog Behavior Specialist', 'Team Management', 'First Aid Certified'],
      favoriteBreed: 'The nervous ones who need extra love',
      yearsWithUs: '5',
    },
    {
      name: 'Emma Davis',
      role: 'Puppy Specialist & Trainer',
      image: 'https://via.placeholder.com/400x400/e8f4f8/1a3a52?text=Emma+Davis',
      bio: 'Emma has a magical touch with puppies! She runs our puppy socialization programs and helps young dogs build confidence. Her gentle approach has helped hundreds of puppies become well-adjusted adult dogs.',
      funFact: 'Has fostered over 50 puppies',
      qualifications: ['Certified Professional Dog Trainer', 'Puppy Development Specialist', 'Fear Free Certified'],
      favoriteBreed: 'Golden Retrievers',
      yearsWithUs: '6',
    },
    {
      name: 'James Wilson',
      role: 'Safety Coordinator & Wellness Expert',
      image: 'https://via.placeholder.com/400x400/f5f2e8/1a3a52?text=James+Wilson',
      bio: 'James ensures every dog stays safe and healthy during their stay. With a background in veterinary care, he\'s our go-to for health checks and making sure every pup is feeling their best.',
      funFact: 'Makes homemade dog treats every weekend',
      qualifications: ['Veterinary Assistant', 'Pet Safety Certified', 'Animal Nutrition Specialist'],
      favoriteBreed: 'Bulldogs',
      yearsWithUs: '5',
    },
    {
      name: 'Lucy Chen',
      role: 'Customer Relations & Pup Photographer',
      image: 'https://via.placeholder.com/400x400/e8f4f8/1a3a52?text=Lucy+Chen',
      bio: 'Lucy captures all those precious moments and keeps parents updated throughout the day. She knows every dog by name and their favorite treats! Her photos bring smiles to hundreds of pet parents.',
      funFact: 'Has taken over 100,000 photos of dogs',
      qualifications: ['Customer Service Excellence', 'Pet Photography Certified', 'Social Media Management'],
      favoriteBreed: 'Dachshunds',
      yearsWithUs: '4',
    },
    {
      name: 'Tom Richards',
      role: 'Senior Day Care Specialist',
      image: 'https://via.placeholder.com/400x400/f5f2e8/1a3a52?text=Tom+Richards',
      bio: 'Tom ensures every dog has the perfect day at daycare. He\'s known for his calming presence and ability to make even the most nervous dogs feel comfortable. His expertise helps maintain our safe, fun environment.',
      funFact: 'Has a special song for every regular dog',
      qualifications: ['Animal Care Level 3', 'Canine Behavior Specialist', 'Canine Comfort Expert'],
      favoriteBreed: 'Great Danes',
      yearsWithUs: '7',
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
              Meet Our Pack Leaders
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              The passionate, certified, and slightly dog-obsessed humans who make
              Canine Paradise the happiest place on earth for your furry friends.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
              >
                {/* Image */}
                <div className="relative h-64">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-canine-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {member.yearsWithUs} years
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-canine-navy mb-1">
                    {member.name}
                  </h3>
                  <p className="text-canine-gold font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {member.bio}
                  </p>

                  {/* Fun Fact */}
                  <div className="bg-canine-sky rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <SparklesIcon className="h-5 w-5 text-canine-gold mr-2" />
                      <span className="font-semibold text-canine-navy">Fun Fact</span>
                    </div>
                    <p className="text-gray-700 text-sm">{member.funFact}</p>
                  </div>

                  {/* Favorite Breed */}
                  <div className="flex items-center mb-4">
                    <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm text-gray-700">
                      Favorite: <span className="font-semibold">{member.favoriteBreed}</span>
                    </span>
                  </div>

                  {/* Qualifications */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-canine-navy mb-2">Qualifications:</p>
                    <div className="flex flex-wrap gap-2">
                      {member.qualifications.map((qual, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-canine-gold/10 text-canine-navy px-2 py-1 rounded-full"
                        >
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Photo Section */}
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
              Our Whole Pack
            </h2>
            <p className="text-xl text-gray-700">
              Together, we create magic every day
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <img
              src="https://via.placeholder.com/600x400/e8f4f8/1a3a52?text=Team+Photo+1"
              alt="Team working with dogs"
              className="rounded-2xl shadow-lg w-full h-80 object-cover"
            />
            <img
              src="https://via.placeholder.com/600x400/f5f2e8/1a3a52?text=Team+Photo+2"
              alt="Team celebration"
              className="rounded-2xl shadow-lg w-full h-80 object-cover"
            />
            <img
              src="https://via.placeholder.com/600x400/f5f2e8/1a3a52?text=Team+Training"
              alt="Team training session"
              className="rounded-2xl shadow-lg w-full h-80 object-cover"
            />
            <img
              src="https://via.placeholder.com/600x400/e8f4f8/1a3a52?text=Team+Fun+Day"
              alt="Team fun day with dogs"
              className="rounded-2xl shadow-lg w-full h-80 object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-20 bg-gradient-to-br from-canine-sky to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <CakeIcon className="h-12 w-12 text-canine-gold mx-auto mb-4" />
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-4">
              Want to Join Our Team?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              We're always looking for passionate dog lovers to join our pack.
              If you think you have what it takes to make tails wag, we'd love to hear from you!
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