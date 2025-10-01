'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function SubscriptionSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const type = searchParams.get('type')
  const isExtraDays = type === 'extra_days'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircleIcon className="h-12 w-12 text-green-600" />
        </motion.div>

        <h1 className="text-3xl font-display font-bold text-canine-navy mb-4">
          {isExtraDays ? 'Days Added!' : 'Subscription Active!'}
        </h1>

        <p className="text-gray-600 mb-6">
          {isExtraDays
            ? 'Your extra days have been added to your account and are ready to use.'
            : 'Your subscription has been successfully activated. You can now start booking daycare days for your pup!'}
        </p>

        <div className="bg-canine-cream rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Redirecting to dashboard in <span className="font-bold text-canine-gold">{countdown}</span> seconds...
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard" className="block w-full bg-canine-gold text-white py-3 rounded-lg font-semibold hover:bg-canine-light-gold transition-colors">
            Go to Dashboard Now
          </Link>
          <Link href="/dashboard/subscriptions" className="block w-full text-canine-gold hover:text-canine-light-gold font-medium">
            View Subscription Details
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
