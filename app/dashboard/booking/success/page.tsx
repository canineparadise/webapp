'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/outline'

function BookingSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Countdown redirect to dashboard
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
          >
            <CheckCircleIcon className="h-16 w-16 text-green-600" />
          </motion.div>

          <h1 className="text-4xl font-display font-bold text-canine-navy mb-4">
            Booking Confirmed!
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Your extra daycare days have been successfully booked and paid for.
          </p>

          <div className="bg-canine-sky rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CalendarIcon className="h-6 w-6 text-canine-gold" />
              <h2 className="text-lg font-bold text-canine-navy">What's Next?</h2>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-canine-gold font-bold mt-1">✓</span>
                <span>Your bookings have been confirmed in our system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-canine-gold font-bold mt-1">✓</span>
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-canine-gold font-bold mt-1">✓</span>
                <span>View all your bookings in your dashboard</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="block w-full btn-primary text-center py-4 text-lg"
            >
              Go to Dashboard
            </Link>

            <Link
              href="/dashboard/booking"
              className="block w-full btn-outline text-center py-4 text-lg"
            >
              Book More Days
            </Link>

            <p className="text-sm text-gray-500">
              Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>

          {sessionId && (
            <p className="mt-6 text-xs text-gray-400">
              Session ID: {sessionId}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-canine-gold border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}
