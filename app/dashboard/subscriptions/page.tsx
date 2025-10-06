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
  ExclamationTriangleIcon,
  SunIcon,
  ClockIcon,
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
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [sessionType, setSessionType] = useState<'full_day' | 'half_day'>('full_day')
  const [userProfile, setUserProfile] = useState<any>(null)

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

      // Get user profile with approval status
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserProfile(profileData)

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

  const handleCancelSubscription = () => {
    setShowCancelModal(true)
  }

  const confirmCancellation = async () => {
    if (!currentSubscription) return

    setCancelling(true)

    try {
      // Call the database function for proper notice period handling
      const { data, error } = await supabase.rpc('request_subscription_cancellation', {
        p_subscription_id: currentSubscription.id,
        p_user_id: user.id
      })

      if (error) throw error

      if (data.success) {
        toast.success(data.message)
        setShowCancelModal(false)
        init() // Reload data to show cancellation status
      } else {
        toast.error(data.error || 'Failed to cancel subscription')
      }

    } catch (error: any) {
      console.error('Cancel error:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setCancelling(false)
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

          {/* Pending Approval Message */}
          {userProfile?.approval_status === 'pending' && !currentSubscription && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 bg-amber-50 border-2 border-amber-400 rounded-xl p-8 text-center"
            >
              <ClockIcon className="h-16 w-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-3">
                Approval Pending
              </h2>
              <p className="text-amber-800 mb-4 max-w-2xl mx-auto">
                Thank you for registering with Canine Paradise! Before you can subscribe to our daycare services, you need to:
              </p>
              <ol className="text-left text-amber-900 space-y-2 max-w-xl mx-auto mb-6">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Add your dog's details and photos in your dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Book an assessment day with us</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Attend the assessment day so we can meet your pup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Wait for our team to approve your application</span>
                </li>
              </ol>
              <p className="text-sm text-amber-700">
                Once approved, you'll be able to subscribe to our monthly daycare packages!
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-canine-gold text-white rounded-lg font-semibold hover:bg-canine-light-gold transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  Go to Dashboard
                </Link>
              </div>
            </motion.div>
          )}

          {/* Rejected Message */}
          {userProfile?.approval_status === 'rejected' && !currentSubscription && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 bg-red-50 border-2 border-red-400 rounded-xl p-8 text-center"
            >
              <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-3">
                Application Not Approved
              </h2>
              <p className="text-red-800 mb-4 max-w-2xl mx-auto">
                Unfortunately, we're unable to offer daycare services at this time.
              </p>
              {userProfile?.approval_notes && (
                <div className="bg-white border border-red-200 rounded-lg p-4 max-w-xl mx-auto mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Note from our team:</strong> {userProfile.approval_notes}
                  </p>
                </div>
              )}
              <p className="text-sm text-red-700">
                If you have questions, please contact us at wecare@canineparadise.com
              </p>
            </motion.div>
          )}

          {/* Show subscription options only if approved OR already has subscription */}
          {(userProfile?.approval_status === 'approved' || currentSubscription) && (
            <>
              {/* Session Type Toggle */}
          <div className="mb-8 bg-white rounded-xl border-2 border-gray-200 p-2 inline-flex gap-2">
            <button
              onClick={() => setSessionType('full_day')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2
                ${sessionType === 'full_day'
                  ? 'bg-canine-gold text-white shadow-md'
                  : 'text-gray-600 hover:text-canine-navy'
                }
              `}
            >
              <SunIcon className="h-5 w-5" />
              Full Day (7 AM - 7 PM)
            </button>
            <button
              onClick={() => setSessionType('half_day')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2
                ${sessionType === 'half_day'
                  ? 'bg-canine-gold text-white shadow-md'
                  : 'text-gray-600 hover:text-canine-navy'
                }
              `}
            >
              <ClockIcon className="h-5 w-5" />
              Half Day (10 AM - 2 PM)
            </button>
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

                // Calculate pricing based on session type
                const fullDayPricing = {
                  '4_days': { perDay: 40, monthly: 160 },
                  '8_days': { perDay: 38, monthly: 304 },
                  '12_days': { perDay: 37, monthly: 444 },
                  '16_days': { perDay: 36, monthly: 576 },
                  '20_days': { perDay: 35, monthly: 700 }
                } as Record<string, { perDay: number; monthly: number }>

                const halfDayPricing = {
                  '4_days': { perDay: 30, monthly: 120 },
                  '8_days': { perDay: 28.50, monthly: 228 },
                  '12_days': { perDay: 27.75, monthly: 333 },
                  '16_days': { perDay: 27, monthly: 432 },
                  '20_days': { perDay: 25, monthly: 500 }
                } as Record<string, { perDay: number; monthly: number }>

                const pricing = sessionType === 'full_day'
                  ? (fullDayPricing[tier.tier_name] || { perDay: tier.price_per_day, monthly: tier.monthly_price })
                  : (halfDayPricing[tier.tier_name] || { perDay: tier.price_per_day * 0.75, monthly: tier.monthly_price * 0.75 })

                const isBestValue = pricing.perDay <= (sessionType === 'full_day' ? 36 : 27)

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
                        £{pricing.monthly.toFixed(0)}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">per month</p>

                      <div className="bg-canine-cream rounded-lg p-3 mb-4">
                        <div className="text-2xl font-bold text-canine-navy">{tier.days_included}</div>
                        <div className="text-xs text-gray-600">
                          {sessionType === 'full_day' ? 'full days' : 'half days'} per month
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <div className="font-semibold text-canine-navy">£{pricing.perDay.toFixed(2)}/day</div>
                        <div className="text-xs mt-1">
                          {sessionType === 'full_day' ? '7 AM - 7 PM' : '10 AM - 2 PM'}
                        </div>
                      </div>

                      <ul className="text-xs text-left space-y-2 mb-4">
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>
                            {sessionType === 'full_day'
                              ? 'Full day care (7 AM - 7 PM)'
                              : 'Half day care (10 AM - 2 PM)'}
                          </span>
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

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                        <p className="text-xs text-blue-900 font-semibold mb-1">
                          Automatic Monthly Billing
                        </p>
                        <p className="text-xs text-blue-800">
                          Your card will be charged £{pricing.monthly.toFixed(2)} automatically on the same day each month until you cancel. Cancel anytime with 30 days notice.
                        </p>
                      </div>

                      <button
                        onClick={() => handlePurchaseSubscription(tier.id, pricing.monthly, tier.days_included)}
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
          <div className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h4 className="font-bold text-blue-900 mb-3 text-lg">Important Subscription Information</h4>
            <ul className="text-sm text-blue-900 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Automatic Monthly Billing:</strong> Your card will be charged automatically on the same day each month at the rate shown above. You only need to subscribe once.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Recurring Payment:</strong> Payments continue monthly until you cancel your subscription.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Days Reset Monthly:</strong> Unused days do not roll over to the next month. Your days refresh on your billing date.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Cancellation Policy:</strong> One full month (30 days) notice required for cancellation. You will be charged for one additional month after requesting cancellation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Extra Days:</strong> You can purchase additional days at your current per-day rate if needed.</span>
              </li>
            </ul>
          </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-amber-100 rounded-full p-3">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-canine-navy mb-2">
                  Cancel Subscription - One Month Notice Required
                </h2>
                <p className="text-gray-600">
                  Please read the cancellation policy carefully
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Important: 30-Day Notice Period
              </h3>
              <ul className="text-sm text-amber-900 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>You must provide <strong>one (1) full calendar month (30 days) notice</strong> to cancel your subscription.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Your cancellation will become effective <strong>30 days from today</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>You will be charged for one additional month at your current rate of <strong>£{parseFloat(currentSubscription?.monthly_price || 0).toFixed(2)}</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>You may continue to use your remaining days during the notice period.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>No refunds will be provided for unused days.</span>
                </li>
              </ul>

              <div className="mt-4 pt-4 border-t border-amber-300">
                <p className="text-sm font-bold text-amber-900">
                  Effective Cancellation Date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  Final Charge: £{parseFloat(currentSubscription?.monthly_price || 0).toFixed(2)} on {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>What happens next:</strong>
              </p>
              <ol className="text-sm text-gray-700 mt-2 space-y-1 ml-4 list-decimal">
                <li>Your subscription will remain active for the next 30 days</li>
                <li>You can continue booking and using your days as normal</li>
                <li>After 30 days, your subscription will automatically end</li>
                <li>No further charges will be applied after the notice period</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Keep My Subscription
              </button>
              <button
                onClick={confirmCancellation}
                disabled={cancelling}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By confirming, you acknowledge that you have read and understand the cancellation policy.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
