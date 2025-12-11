'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import BackButton from '@/components/BackButton'
import {
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CalendarDaysIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  TicketIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Dog {
  id: string
  name: string
  breed: string
  photo_url: string | null
}

interface DogSubscriptionSelection {
  dogId: string
  tierId: string | null
  tierName: string | null
  daysIncluded: number | null
  pricePerDay: number | null
  monthlyPrice: number | null
  sessionType: 'full_day' | 'half_day'
  isFirstDog?: boolean
}

export default function SubscribeDogsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [dogs, setDogs] = useState<Dog[]>([])
  const [tiers, setTiers] = useState<any[]>([])
  const [existingSubscriptions, setExistingSubscriptions] = useState<any[]>([])

  // Track selection for each dog
  const [dogSelections, setDogSelections] = useState<Record<string, DogSubscriptionSelection>>({})

  // Discount code
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [validatingCode, setValidatingCode] = useState(false)

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  // Pause modal state
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [subscriptionToPause, setSubscriptionToPause] = useState<any>(null)
  const [pauseWeeks, setPauseWeeks] = useState(1)
  const [pauseReason, setPauseReason] = useState('')
  const [pausing, setPausing] = useState(false)
  const [resuming, setResuming] = useState(false)

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
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserProfile(profileData)

      // Check approval status
      if (profileData?.approval_status !== 'approved') {
        toast.error('You must be approved after your assessment day before you can subscribe')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      // Get all approved dogs for this user
      const { data: dogsData } = await supabase
        .from('dogs')
        .select('id, name, breed, photo_url')
        .eq('owner_id', user.id)
        .eq('is_approved', true)
        .eq('is_draft', false)

      if (!dogsData || dogsData.length === 0) {
        toast.error('No approved dogs found. Please complete your dog assessment first.')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      setDogs(dogsData)

      // Get subscription tiers
      const { data: tiersData } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('days_included', { ascending: true })

      setTiers(tiersData || [])

      // Get existing active subscriptions for these dogs
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_tiers:tier_id(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('dog_id', dogsData.map(d => d.id))

      setExistingSubscriptions(subsData || [])

      // Initialize selections for dogs without active subscriptions
      const initialSelections: Record<string, DogSubscriptionSelection> = {}
      dogsData.forEach(dog => {
        const existingSub = subsData?.find(s => s.dog_id === dog.id)
        if (!existingSub) {
          initialSelections[dog.id] = {
            dogId: dog.id,
            tierId: null,
            tierName: null,
            daysIncluded: null,
            pricePerDay: null,
            monthlyPrice: null,
            sessionType: 'full_day',
          }
        }
      })
      setDogSelections(initialSelections)

    } catch (error) {
      console.error('Init error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTierSelection = (dogId: string, tier: any, sessionType: 'full_day' | 'half_day') => {
    // Count how many dogs already have a tier selected (excluding current dog)
    const dogsWithTierSelected = Object.values(dogSelections).filter(
      selection => selection.tierId !== null && selection.dogId !== dogId
    ).length

    // Base price per day
    let basePricePerDay = tier.price_per_day

    // Apply session type discount (half day is same price structure)
    // Note: Half-day pricing is typically handled by different tier selection
    const pricePerDay = basePricePerDay

    // Multi-dog discount: First dog = full price, 2nd+ dogs get 5% off
    // If this is the first dog being selected (no other dogs have tiers), no discount
    // If there are already dogs with tiers selected, this dog gets 5% off
    const isFirstDog = dogsWithTierSelected === 0
    const discountMultiplier = isFirstDog ? 1.0 : 0.95 // 5% off for dogs 2+
    const discountedPricePerDay = pricePerDay * discountMultiplier

    const monthlyPrice = discountedPricePerDay * tier.days_included

    setDogSelections(prev => ({
      ...prev,
      [dogId]: {
        dogId,
        tierId: tier.id,
        tierName: tier.name,
        daysIncluded: tier.days_included,
        pricePerDay: discountedPricePerDay,
        monthlyPrice,
        sessionType,
        isFirstDog,
      }
    }))
  }

  const handleValidateDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code')
      return
    }

    setValidatingCode(true)
    try {
      const totalAmount = calculateTotal()

      const { data, error } = await supabase
        .rpc('validate_discount_code', {
          p_code: discountCode.toUpperCase(),
          p_user_id: user.id,
          p_applies_to: 'subscription',
          p_amount: totalAmount
        })

      if (error) throw error

      const result = data[0]
      if (!result.is_valid) {
        toast.error(result.error_message || 'Invalid discount code')
        setAppliedDiscount(null)
        return
      }

      // Calculate discount amount
      const { data: discountData } = await supabase
        .rpc('calculate_discount_amount', {
          p_original_amount: totalAmount,
          p_discount_type: result.discount_type,
          p_discount_value: result.discount_value
        })

      setAppliedDiscount({
        code: discountCode.toUpperCase(),
        discountCodeId: result.discount_code_id,
        type: result.discount_type,
        value: result.discount_value,
        discountAmount: discountData,
      })

      toast.success(`Discount code applied! -£${discountData.toFixed(2)}`)
    } catch (error: any) {
      console.error('Error validating discount code:', error)
      toast.error(error.message || 'Failed to validate discount code')
      setAppliedDiscount(null)
    } finally {
      setValidatingCode(false)
    }
  }

  const calculateTotal = () => {
    return Object.values(dogSelections).reduce((sum, selection) => {
      return sum + (selection.monthlyPrice || 0)
    }, 0)
  }

  const calculateFinalAmount = () => {
    const total = calculateTotal()
    if (appliedDiscount) {
      return total - appliedDiscount.discountAmount
    }
    return total
  }

  const handleCheckout = async () => {
    // Validate selections
    const selectedDogs = Object.values(dogSelections).filter(s => s.tierId !== null)
    if (selectedDogs.length === 0) {
      toast.error('Please select a subscription tier for at least one dog')
      return
    }

    setPurchasing(true)
    try {
      const finalAmount = calculateFinalAmount()

      // Get auth token for API calls
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Please log in to continue')
      }

      // If final amount is 0, create subscriptions directly without payment
      if (finalAmount === 0) {
        const response = await fetch('/api/create-free-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            dogSubscriptions: selectedDogs,
            discountCode: appliedDiscount?.code || null,
            discountCodeId: appliedDiscount?.discountCodeId || null,
            totalAmount: calculateTotal(),
            discountAmount: appliedDiscount?.discountAmount || 0,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Subscription creation failed:', errorData)
          throw new Error(errorData.error || 'Failed to create subscription')
        }

        toast.success('Subscription created successfully!')
        router.push('/dashboard/subscriptions/success?free=true')
        return
      }

      // Create Stripe checkout session with per-dog subscriptions
      const response = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          dogSubscriptions: selectedDogs,
          discountCode: appliedDiscount?.code || null,
          discountCodeId: appliedDiscount?.discountCodeId || null,
          totalAmount: calculateTotal(),
          discountAmount: appliedDiscount?.discountAmount || 0,
          finalAmount: finalAmount,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      // Redirect to Stripe checkout
      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Failed to start checkout')
      setPurchasing(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscriptionToCancel) return

    setCancelling(true)
    try {
      // Update subscription in database
      // Keep is_active: true during notice period, just disable auto_renew
      const { error } = await supabase
        .from('subscriptions')
        .update({
          auto_renew: false,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancelReason.trim() || null,
        })
        .eq('id', subscriptionToCancel.id)

      if (error) {
        console.error('Database error cancelling subscription:', error)
        throw error
      }

      toast.success('Subscription cancelled. Auto-renewal disabled. Your subscription will remain active until the end of the current billing period.')

      // Refresh subscriptions list
      await init()

      // Close modal and reset state
      setShowCancelModal(false)
      setSubscriptionToCancel(null)
      setCancelReason('')
    } catch (error: any) {
      console.error('Cancellation error:', error)
      toast.error(error.message || 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  const handlePauseSubscription = async () => {
    if (!subscriptionToPause) return

    setPausing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Please log in to continue')
      }

      const response = await fetch('/api/pause-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscriptionToPause.id,
          pauseWeeks,
          pauseReason: pauseReason.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pause subscription')
      }

      toast.success(data.message || `Subscription paused for ${pauseWeeks} week(s)`)

      // Refresh subscriptions list
      await init()

      // Close modal and reset state
      setShowPauseModal(false)
      setSubscriptionToPause(null)
      setPauseWeeks(1)
      setPauseReason('')
    } catch (error: any) {
      console.error('Pause error:', error)
      toast.error(error.message || 'Failed to pause subscription')
    } finally {
      setPausing(false)
    }
  }

  const handleResumeSubscription = async (subscription: any) => {
    setResuming(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Please log in to continue')
      }

      const response = await fetch('/api/resume-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resume subscription')
      }

      toast.success(data.message || 'Subscription resumed successfully')

      // Refresh subscriptions list
      await init()
    } catch (error: any) {
      console.error('Resume error:', error)
      toast.error(error.message || 'Failed to resume subscription')
    } finally {
      setResuming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-gold mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  const dogsWithoutSubs = dogs.filter(dog =>
    !existingSubscriptions.some(sub => sub.dog_id === dog.id)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <BackButton href="/dashboard" />

          <motion.div
            className="mt-4 bg-white rounded-2xl shadow-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-canine-gold rounded-2xl p-3">
                <CreditCardIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-canine-navy">
                  Subscribe Your Dogs
                </h1>
                <p className="text-gray-600 mt-1">
                  Choose a subscription plan for each of your dogs
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Existing Subscriptions */}
        {existingSubscriptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6" />
              Active Subscriptions
            </h2>

            {/* Cancellation Policy Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Cancellation Policy</p>
                  <p>Cancelled subscriptions will remain active until the end of the current billing period. No refunds are provided for partial months.</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {existingSubscriptions.map(sub => {
                const dog = dogs.find(d => d.id === sub.dog_id)
                const isCancelled = sub.cancelled_at !== null
                const isPaused = sub.is_paused === true
                return (
                  <div key={sub.id} className={`bg-white rounded-xl p-4 border-2 ${
                    isCancelled ? 'border-red-300' :
                    isPaused ? 'border-yellow-300' :
                    'border-green-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <HeartIcon className={`h-5 w-5 ${
                          isCancelled ? 'text-red-600' :
                          isPaused ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
                        <span className="font-bold text-gray-900">{dog?.name}</span>
                      </div>
                      {isCancelled && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                          CANCELLED
                        </span>
                      )}
                      {isPaused && !isCancelled && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                          PAUSED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {sub.subscription_tiers.name} - {sub.subscription_tiers.days_included} days/month
                    </p>
                    <p className="text-sm text-gray-600">
                      Days remaining: {sub.days_remaining} / {sub.subscription_tiers.days_included}
                    </p>

                    {isPaused && sub.pause_end_date && (
                      <p className="text-sm text-yellow-600 font-semibold mt-2">
                        Paused until: {new Date(sub.pause_end_date).toLocaleDateString()}
                      </p>
                    )}

                    {isCancelled ? (
                      <p className="text-sm text-red-600 font-semibold mt-2">
                        Ends on: {new Date(sub.next_billing_date).toLocaleDateString()}
                      </p>
                    ) : !isPaused && (
                      <p className="text-xs text-gray-500 mt-2">
                        Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}
                      </p>
                    )}

                    {!isCancelled && (
                      <div className="mt-3 space-y-2">
                        {isPaused ? (
                          <button
                            onClick={() => handleResumeSubscription(sub)}
                            disabled={resuming}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            {resuming ? 'Resuming...' : 'Resume'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSubscriptionToPause(sub)
                              setShowPauseModal(true)
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors"
                          >
                            <ClockIcon className="h-4 w-4" />
                            Pause
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSubscriptionToCancel(sub)
                            setShowCancelModal(true)
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* No Dogs to Subscribe */}
        {dogsWithoutSubs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <CheckCircleIcon className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Dogs Subscribed!</h2>
            <p className="text-gray-600">All your dogs have active subscriptions.</p>
          </div>
        )}

        {/* Subscribe New Dogs */}
        {dogsWithoutSubs.length > 0 && (
          <>
            {/* Dog Cards with Tier Selection */}
            <div className="grid gap-8 mb-8">
              {dogsWithoutSubs.map((dog, index) => (
                <motion.div
                  key={dog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl p-8"
                >
                  {/* Dog Header */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                    {dog.photo_url ? (
                      <img
                        src={dog.photo_url}
                        alt={dog.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-canine-gold"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-canine-gold flex items-center justify-center">
                        <HeartIcon className="h-10 w-10 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{dog.name}</h3>
                      <p className="text-gray-600">{dog.breed}</p>
                    </div>
                  </div>

                  {/* Session Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Session Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          const currentSelection = dogSelections[dog.id]
                          if (currentSelection?.tierId && tiers.find(t => t.id === currentSelection.tierId)) {
                            const tier = tiers.find(t => t.id === currentSelection.tierId)
                            handleTierSelection(dog.id, tier, 'full_day')
                          } else {
                            setDogSelections(prev => ({
                              ...prev,
                              [dog.id]: { ...prev[dog.id], sessionType: 'full_day' }
                            }))
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          dogSelections[dog.id]?.sessionType === 'full_day'
                            ? 'border-canine-gold bg-canine-gold/10'
                            : 'border-gray-200 hover:border-canine-gold/50'
                        }`}
                      >
                        <p className="font-bold text-gray-900">Full Day</p>
                        <p className="text-sm text-gray-600">7 AM - 7 PM</p>
                      </button>
                      <button
                        onClick={() => {
                          const currentSelection = dogSelections[dog.id]
                          if (currentSelection?.tierId && tiers.find(t => t.id === currentSelection.tierId)) {
                            const tier = tiers.find(t => t.id === currentSelection.tierId)
                            handleTierSelection(dog.id, tier, 'half_day')
                          } else {
                            setDogSelections(prev => ({
                              ...prev,
                              [dog.id]: { ...prev[dog.id], sessionType: 'half_day' }
                            }))
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          dogSelections[dog.id]?.sessionType === 'half_day'
                            ? 'border-canine-gold bg-canine-gold/10'
                            : 'border-gray-200 hover:border-canine-gold/50'
                        }`}
                      >
                        <p className="font-bold text-gray-900">Half Day</p>
                        <p className="text-sm text-gray-600">10 AM - 3 PM</p>
                      </button>
                    </div>
                  </div>

                  {/* Tier Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Subscription Tier
                    </label>
                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {tiers
                        .filter(tier => {
                          const sessionType = dogSelections[dog.id]?.sessionType || 'full_day'
                          // Filter tiers based on session type - use the tier's session_type column
                          return tier.session_type === sessionType
                        })
                        .map((tier, tierIndex) => {
                        const isSelected = dogSelections[dog.id]?.tierId === tier.id
                        const sessionType = dogSelections[dog.id]?.sessionType || 'full_day'

                        // Calculate dog index for multi-dog discount
                        const dogIndex = dogsWithoutSubs.findIndex(d => d.id === dog.id)

                        // Base price with multi-dog discount
                        const discountMultiplier = dogIndex === 0 ? 1.0 : 0.95
                        const basePricePerDay = tier.price_per_day * discountMultiplier
                        const monthlyPrice = basePricePerDay * tier.days_included

                        return (
                          <button
                            key={tier.id}
                            onClick={() => handleTierSelection(dog.id, tier, sessionType)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'border-canine-gold bg-canine-gold/10 shadow-lg'
                                : 'border-gray-200 hover:border-canine-gold/50 hover:shadow'
                            }`}
                          >
                            <div className="mb-2">
                              <span className="font-bold text-2xl text-gray-900">
                                {tier.days_included}
                              </span>
                              <span className="text-sm text-gray-600 ml-1">days</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              £{basePricePerDay.toFixed(2)}/day
                              {dogIndex > 0 && (
                                <span className="ml-1 text-green-600 font-semibold">(5% off)</span>
                              )}
                            </p>
                            <p className="font-bold text-lg text-canine-navy">
                              £{monthlyPrice.toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-500">per month</p>
                            {isSelected && (
                              <CheckCircleIcon className="h-5 w-5 text-canine-gold mt-2" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Discount Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <TicketIcon className="h-6 w-6 text-canine-gold" />
                <h3 className="text-xl font-bold text-gray-900">Discount Code</h3>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none font-mono"
                  disabled={appliedDiscount !== null}
                />
                {appliedDiscount ? (
                  <button
                    onClick={() => {
                      setAppliedDiscount(null)
                      setDiscountCode('')
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleValidateDiscountCode}
                    disabled={validatingCode || !discountCode.trim()}
                    className="px-6 py-3 bg-canine-gold text-white rounded-xl font-semibold hover:bg-canine-light-gold disabled:opacity-50"
                  >
                    {validatingCode ? 'Checking...' : 'Apply'}
                  </button>
                )}
              </div>
              {appliedDiscount && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                    Code <strong>{appliedDiscount.code}</strong> applied!
                    {appliedDiscount.type === 'percentage'
                      ? ` ${appliedDiscount.value}% off`
                      : ` £${appliedDiscount.value} off`
                    } = <strong>-£{appliedDiscount.discountAmount.toFixed(2)}</strong>
                  </p>
                </div>
              )}
            </motion.div>


            {/* Summary & Checkout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-canine-navy to-canine-gold rounded-2xl shadow-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-4">Subscription Summary</h3>
              <div className="space-y-2 mb-6">
                {Object.values(dogSelections)
                  .filter(s => s.tierId !== null)
                  .map(selection => {
                    const dog = dogs.find(d => d.id === selection.dogId)
                    return (
                      <div key={selection.dogId} className="flex justify-between items-center">
                        <span>
                          {dog?.name} - {selection.tierName} ({selection.sessionType === 'full_day' ? 'Full Day' : 'Half Day'})
                        </span>
                        <span className="font-bold">£{selection.monthlyPrice?.toFixed(2)}</span>
                      </div>
                    )
                  })}
                <div className="border-t border-white/30 pt-2 mt-2">
                  <div className="flex justify-between items-center text-lg">
                    <span>Subtotal:</span>
                    <span className="font-bold">£{calculateTotal().toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between items-center text-green-300">
                      <span>Discount:</span>
                      <span className="font-bold">-£{appliedDiscount.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-2xl mt-2">
                    <span>Total:</span>
                    <span className="font-bold">£{calculateFinalAmount().toFixed(2)}/month</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={purchasing || Object.values(dogSelections).filter(s => s.tierId !== null).length === 0}
                className="w-full bg-white text-canine-navy py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-canine-navy border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="h-6 w-6" />
                    Proceed to Checkout
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}

        {/* Cancellation Modal */}
        <AnimatePresence>
          {showCancelModal && subscriptionToCancel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                if (!cancelling) {
                  setShowCancelModal(false)
                  setSubscriptionToCancel(null)
                  setCancelReason('')
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
              >
                {/* Warning Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-red-100 rounded-full p-3">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Cancel Subscription?</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Dog:</span>{' '}
                    {dogs.find(d => d.id === subscriptionToCancel.dog_id)?.name}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Plan:</span>{' '}
                    {subscriptionToCancel.subscription_tiers.name} ({subscriptionToCancel.subscription_tiers.days_included} days/month)
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Days Remaining:</span>{' '}
                    {subscriptionToCancel.days_remaining} of {subscriptionToCancel.subscription_tiers.days_included}
                  </p>
                </div>

                {/* Warning Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-900">
                      <p className="font-semibold mb-1">Important:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your subscription will remain active until {new Date(subscriptionToCancel.next_billing_date).toLocaleDateString()}</li>
                        <li>You will lose your remaining {subscriptionToCancel.days_remaining} day(s)</li>
                        <li>No refunds will be issued for partial months</li>
                        <li>You can resubscribe anytime after cancellation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Optional Cancellation Reason */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Help us improve by letting us know why you're cancelling..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 outline-none resize-none"
                    disabled={cancelling}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your feedback helps us improve our service
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false)
                      setSubscriptionToCancel(null)
                      setCancelReason('')
                    }}
                    disabled={cancelling}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {cancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-5 w-5" />
                        Yes, Cancel Subscription
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause Modal */}
        <AnimatePresence>
          {showPauseModal && subscriptionToPause && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                if (!pausing) {
                  setShowPauseModal(false)
                  setSubscriptionToPause(null)
                  setPauseWeeks(1)
                  setPauseReason('')
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-yellow-100 rounded-full p-3">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Pause Subscription</h3>
                    <p className="text-sm text-gray-600">Temporarily pause billing and days</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">How Pause Works:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>No charges during pause period (max 4 weeks)</li>
                        <li>Your days remain frozen - no days deducted</li>
                        <li>Billing resumes automatically after pause ends</li>
                        <li>You can resume anytime before pause ends</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pause Duration
                  </label>
                  <select
                    value={pauseWeeks}
                    onChange={(e) => setPauseWeeks(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 outline-none"
                    disabled={pausing}
                  >
                    <option value={1}>1 Week</option>
                    <option value={2}>2 Weeks</option>
                    <option value={3}>3 Weeks</option>
                    <option value={4}>4 Weeks (Maximum)</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    value={pauseReason}
                    onChange={(e) => setPauseReason(e.target.value)}
                    placeholder="Going on holiday, temporary break, etc..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 outline-none resize-none"
                    disabled={pausing}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPauseModal(false)
                      setSubscriptionToPause(null)
                      setPauseWeeks(1)
                      setPauseReason('')
                    }}
                    disabled={pausing}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePauseSubscription}
                    disabled={pausing}
                    className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {pausing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Pausing...
                      </>
                    ) : (
                      <>
                        <ClockIcon className="h-5 w-5" />
                        Pause for {pauseWeeks} Week{pauseWeeks > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
