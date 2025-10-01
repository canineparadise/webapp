'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  CalendarDaysIcon,
  CurrencyPoundIcon,
  ClockIcon,
  ArrowRightIcon,
  HeartIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

export default function PricingPage() {
  const [selectedPackage, setSelectedPackage] = useState<number>(8)

  const packages = [
    {
      days: 4,
      name: 'Starter',
      pricePerDay: 40,
      totalPrice: 160,
      addOnDayPrice: 40,
      color: 'from-blue-500 to-cyan-500',
      popular: false,
    },
    {
      days: 8,
      name: 'Popular',
      pricePerDay: 38,
      totalPrice: 304,
      addOnDayPrice: 38,
      color: 'from-purple-500 to-pink-500',
      popular: true,
    },
    {
      days: 16,
      name: 'Premium',
      pricePerDay: 36,
      totalPrice: 576,
      addOnDayPrice: 36,
      color: 'from-amber-500 to-orange-500',
      popular: false,
    },
    {
      days: 20,
      name: 'Ultimate',
      pricePerDay: 35,
      totalPrice: 700,
      addOnDayPrice: 35,
      color: 'from-green-500 to-emerald-500',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-canine-navy to-canine-dark-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Link href="/" className="inline-block mb-6">
              <img
                src="/logo.jpeg"
                alt="Canine Paradise"
                className="h-16 w-auto mx-auto rounded-lg shadow-lg"
              />
            </Link>
            <h1 className="text-5xl font-display font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Choose the perfect package for your pup. All packages require a minimum commitment of 4 days per month.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 border-y-2 border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-3">
            <SparklesIcon className="h-6 w-6 text-amber-600" />
            <p className="text-amber-800 font-semibold">
              FREE Assessment Day Every Friday! • No Single Day Bookings • Unused Days Don't Roll Over
            </p>
            <SparklesIcon className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.days}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                  pkg.popular ? 'ring-4 ring-purple-400 ring-opacity-50' : ''
                }`}
                onMouseEnter={() => setSelectedPackage(pkg.days)}
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${pkg.color} p-6 text-white`}>
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">£{pkg.totalPrice}</span>
                    <span className="ml-2 text-white/80">/month</span>
                  </div>
                  <div className="mt-2 text-white/90">
                    <span className="text-lg">£{pkg.pricePerDay}/day</span>
                    <span className="ml-2">• {pkg.days} days</span>
                  </div>
                </div>

                {/* Simple Info */}
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">{pkg.days} days</p>
                    <p className="text-gray-600">per month</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-center text-gray-700">
                      Add extra days at <span className="font-bold text-lg">£{pkg.addOnDayPrice}</span> per day
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="p-6 pt-0">
                  <Link href="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${pkg.color} hover:shadow-lg transition-all duration-300`}
                    >
                      Get Started
                      <ArrowRightIcon className="inline-block ml-2 h-4 w-4" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add-on Days Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-display font-bold text-canine-navy mb-6 text-center">
            Need Extra Days?
          </h2>
          <p className="text-gray-600 text-center mb-8">
            You can add extra days to any package at your package's add-on rate
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.days}
                className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${
                  selectedPackage === pkg.days
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <h4 className="font-semibold text-lg mb-2">{pkg.name} Package</h4>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  £{pkg.addOnDayPrice}
                </p>
                <p className="text-sm text-gray-600 mt-1">per extra day</p>
              </div>
            ))}
          </div>
        </motion.div>


        {/* Important Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 bg-gradient-to-r from-canine-navy to-canine-dark-blue rounded-2xl p-8 text-white"
        >
          <h2 className="text-3xl font-display font-bold mb-8 text-center">
            Important Information
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-2 text-canine-gold">Assessment Day</h3>
              <p className="text-white/90">FREE assessment every Friday</p>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-canine-gold">Minimum Booking</h3>
              <p className="text-white/90">4 days per month required</p>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-canine-gold">Unused Days</h3>
              <p className="text-white/90">Do not roll over to next month</p>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-canine-gold">Opening Hours</h3>
              <p className="text-white/90">7 AM - 7 PM</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-display font-bold text-canine-navy mb-4">
            Ready to Join the Pack?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start with a FREE assessment day this Friday. No commitment required!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-canine-gold to-canine-light-gold text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Book Free Assessment
                <ArrowRightIcon className="inline-block ml-2 h-5 w-5" />
              </motion.button>
            </Link>

            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-canine-navy font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-canine-navy"
              >
                Contact Us
                <ArrowRightIcon className="inline-block ml-2 h-5 w-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}