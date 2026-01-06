'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircleIcon, ArrowUpCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'

function UpgradeSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard/subscriptions')
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
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative mx-auto mb-6"
        >
          <div className="h-24 w-24 bg-gradient-to-br from-canine-gold to-canine-light-gold rounded-full flex items-center justify-center mx-auto">
            <ArrowUpCircleIcon className="h-12 w-12 text-white" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            className="absolute -top-2 -right-2 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center"
          >
            <CheckCircleIcon className="h-6 w-6 text-white" />
          </motion.div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upgrade Successful!
          </h1>
          <div className="flex items-center justify-center gap-2 text-canine-gold mb-4">
            <SparklesIcon className="h-5 w-5" />
            <span className="font-semibold">Your subscription has been upgraded</span>
            <SparklesIcon className="h-5 w-5" />
          </div>
          <p className="text-gray-600 mb-6">
            Your new subscription tier is now active. You'll see your updated days on the subscription page.
          </p>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-canine-gold/10 rounded-xl p-4 mb-6"
        >
          <h3 className="font-semibold text-gray-900 mb-2">What happens now?</h3>
          <ul className="text-sm text-gray-600 text-left space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Your extra days have been added to your balance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Future billing will be at your new tier price</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>You can start booking more days right away!</span>
            </li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Link href="/dashboard/subscriptions" className="block">
            <button className="w-full bg-canine-gold hover:bg-canine-light-gold text-white font-bold py-3 px-6 rounded-xl transition-colors">
              View My Subscriptions
            </button>
          </Link>
          <Link href="/dashboard" className="block">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors">
              Go to Dashboard
            </button>
          </Link>
        </motion.div>

        {/* Auto-redirect notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-gray-400"
        >
          Redirecting in {countdown} seconds...
        </motion.p>
      </motion.div>
    </div>
  )
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-canine-gold"></div>
      </div>
    }>
      <UpgradeSuccessContent />
    </Suspense>
  )
}
