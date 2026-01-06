'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    const sendConfirmationEmail = async () => {
      const sessionId = searchParams.get('session_id')
      if (!sessionId || emailSent) return

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Get user's active subscriptions (just created)
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select(`
            *,
            dogs:dog_id (
              id,
              name
            ),
            subscription_tiers:tier_id (
              name,
              days_per_week,
              price_per_month
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5) // Get recently created subscriptions

        if (!subscriptions || subscriptions.length === 0) return

        // Calculate total amount
        const totalAmount = subscriptions.reduce((sum, sub) => sum + parseFloat(sub.monthly_price), 0)

        // Get subscription IDs
        const subscriptionIds = subscriptions.map(sub => sub.id)

        // Send confirmation email
        await fetch('/api/send-subscription-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            subscriptionIds,
            totalAmount,
          }),
        })

        setEmailSent(true)
      } catch (error) {
        console.error('Failed to send confirmation email:', error)
        // Don't fail the success page if email fails
      }
    }

    sendConfirmationEmail()
  }, [searchParams, emailSent])

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
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-gray-100"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-canine-gold/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircleIcon className="h-12 w-12 text-canine-gold" />
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

export default function SubscriptionSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
