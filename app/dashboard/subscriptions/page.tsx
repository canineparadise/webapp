'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CalendarDaysIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubscriptionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [tiers, setTiers] = useState<any[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      // Check auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Get subscription tiers
      const { data: tiersData } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('days_included', { ascending: true })

      setTiers(tiersData || [])

      // Get current active subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*, subscription_tiers(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (subData) {
        setCurrentSubscription(subData)
      }

    } catch (error) {
      console.error('Init error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseSubscription = async (tierId: string, price: number, days: number) => {
    setPurchasing(true)
    setSelectedTier(tierId)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId,
          userId: user.id,
          price,
          days
        })
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId })
        if (stripeError) {
          throw stripeError
        }
      }

    } catch (error: any) {
      console.error('Purchase error:', error)
      toast.error(error.message || 'Failed to start checkout')
      setPurchasing(false)
      setSelectedTier(null)
    }
  }

  const handleBuyExtraDays = async (numDays: number) => {
    if (!currentSubscription) {
      toast.error('Please purchase a subscription first')
      return
    }

    setPurchasing(true)

    try {
      // Calculate price: use current tier's per-day rate
      const pricePerDay = currentSubscription.price_per_day
      const totalPrice = numDays * pricePerDay

      // Create Stripe checkout for extra days
      const response = await fetch('/api/create-extra-days-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: currentSubscription.id,
          userId: user.id,
          numDays,
          pricePerDay,
          totalPrice
        })
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId })
        if (stripeError) {
          throw stripeError
        }
      }

    } catch (error: any) {
      console.error('Extra days purchase error:', error)
      toast.error(error.message || 'Failed to purchase extra days')
    } finally {
      setPurchasing(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return

    if (!confirm('Are you sure you want to cancel your subscription? This will take effect at the end of your billing period.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          auto_renew: false,
          is_active: false
        })
        .eq('id', currentSubscription.id)

      if (error) throw error

      toast.success('Subscription cancelled successfully')
      await init() // Refresh
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-canine-gold hover:text-canine-light-gold mb-4 inline-flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-display font-bold text-canine-navy flex items-center gap-3">
              <CreditCardIcon className="h-10 w-10 text-canine-gold" />
              Manage Subscription
            </h1>
            <p className="text-gray-600 mt-2">
              Choose a plan that fits your pup's schedule
            </p>
          </div>

          {/* Current Subscription */}
          {currentSubscription && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-bold text-green-900">Active Subscription</h2>
                  </div>
                  <p className="text-2xl font-bold text-canine-navy mb-1">
                    {currentSubscription.subscription_tiers?.name || 'Custom Plan'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    <span>£{parseFloat(currentSubscription.monthly_price).toFixed(2)}/month</span>
                    <span>•</span>
                    <span>{currentSubscription.days_remaining}/{currentSubscription.days_included} days remaining</span>
                    <span>•</span>
                    <span>£{parseFloat(currentSubscription.price_per_day).toFixed(2)}/day</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Renews on {new Date(currentSubscription.end_date).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Cancel Plan
                </button>
              </div>
            </motion.div>
          )}

          {/* Buy Extra Days */}
          {currentSubscription && currentSubscription.days_remaining < 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Running Low on Days?</h3>
              <p className="text-sm text-amber-800 mb-4">
                Purchase extra days at your current rate of £{parseFloat(currentSubscription.price_per_day).toFixed(2)}/day
              </p>
              <div className="flex gap-3">
                {[1, 2, 5, 10].map(days => (
                  <button
                    key={days}
                    onClick={() => handleBuyExtraDays(days)}
                    disabled={purchasing}
                    className="flex-1 bg-white border-2 border-amber-300 hover:border-canine-gold text-canine-navy px-4 py-3 rounded-lg font-semibold transition-all hover:shadow-md disabled:opacity-50"
                  >
                    <div className="text-sm text-gray-600">+{days} {days === 1 ? 'Day' : 'Days'}</div>
                    <div className="text-lg font-bold">£{(days * parseFloat(currentSubscription.price_per_day)).toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Subscription Tiers */}
          <div>
            <h2 className="text-2xl font-bold text-canine-navy mb-6">
              {currentSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {tiers.map((tier, index) => {
                const isCurrentTier = currentSubscription?.tier_id === tier.id
                const isBestValue = tier.price_per_day <= 36

                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl
                      ${isCurrentTier
                        ? 'border-green-500 shadow-lg'
                        : isBestValue
                          ? 'border-canine-gold shadow-lg'
                          : 'border-gray-200 hover:border-canine-gold'
                      }
                    `}
                  >
                    {isBestValue && !isCurrentTier && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-canine-gold text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <SparklesIcon className="h-3 w-3" />
                          BEST VALUE
                        </span>
                      </div>
                    )}

                    {isCurrentTier && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircleIcon className="h-3 w-3" />
                          CURRENT PLAN
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <h3 className="text-lg font-bold text-canine-navy mb-1">
                        {tier.name.split(' - ')[0]}
                      </h3>
                      <div className="text-3xl font-bold text-canine-gold mb-2">
                        £{parseFloat(tier.monthly_price).toFixed(0)}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">per month</p>

                      <div className="bg-canine-cream rounded-lg p-3 mb-4">
                        <div className="text-2xl font-bold text-canine-navy">{tier.days_included}</div>
                        <div className="text-xs text-gray-600">days per month</div>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <div className="font-semibold text-canine-navy">£{parseFloat(tier.price_per_day).toFixed(2)}/day</div>
                        <div className="text-xs mt-1">{tier.description}</div>
                      </div>

                      <ul className="text-xs text-left space-y-2 mb-6">
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Full day care (7 AM - 7 PM)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Socialization & enrichment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Live updates & photos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircleIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500">Days don't roll over</span>
                        </li>
                      </ul>

                      <button
                        onClick={() => handlePurchaseSubscription(tier.id, tier.monthly_price, tier.days_included)}
                        disabled={purchasing || isCurrentTier}
                        className={`
                          w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                          ${isCurrentTier
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : isBestValue
                              ? 'bg-canine-gold text-white hover:bg-canine-light-gold shadow-md'
                              : 'bg-canine-navy text-white hover:bg-canine-gold'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {purchasing && selectedTier === tier.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </>
                        ) : isCurrentTier ? (
                          'Current Plan'
                        ) : (
                          <>
                            <CreditCardIcon className="h-4 w-4" />
                            {currentSubscription ? 'Upgrade' : 'Subscribe'}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Subscriptions are billed monthly</li>
              <li>• Unused days do not roll over to the next month</li>
              <li>• Extra days can be purchased at your current per-day rate</li>
              <li>• Cancel anytime - no long-term commitments</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
