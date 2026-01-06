'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircleIcon, CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

function ExtraDaysSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Auto-redirect after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard/booking')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-canine-gold/20 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircleIcon className="h-12 w-12 text-canine-gold" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-display font-bold text-canine-navy mb-3">
          Extra Days Purchased!
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Your extra days have been added to your subscription. You can now book additional daycare sessions using your new days.
        </p>

        {/* Info Box */}
        <div className="bg-canine-cream rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-canine-navy">
            <CalendarDaysIcon className="h-5 w-5" />
            <span className="font-medium">Your days are ready to use!</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Link href="/dashboard/booking">
            <button className="w-full bg-canine-gold text-white py-3 px-6 rounded-xl font-semibold hover:bg-canine-light-gold transition-all flex items-center justify-center gap-2">
              Book Your Days Now
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all">
              Return to Dashboard
            </button>
          </Link>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-sm text-gray-500 mt-6">
          Redirecting to booking page in {countdown} seconds...
        </p>
      </motion.div>
    </div>
  )
}

export default function ExtraDaysSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canine-cream flex items-center justify-center">
        <div className="text-canine-navy">Loading...</div>
      </div>
    }>
      <ExtraDaysSuccessContent />
    </Suspense>
  )
}
