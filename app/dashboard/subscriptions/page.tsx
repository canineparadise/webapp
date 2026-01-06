'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import DashboardHeader from '@/components/DashboardHeader'
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
  ArrowUpCircleIcon,
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

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [subscriptionToUpgrade, setSubscriptionToUpgrade] = useState<any>(null)
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<any>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [proRataAmount, setProRataAmount] = useState(0)
  const [isEndOfBillingPeriod, setIsEndOfBillingPeriod] = useState(false)

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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Please log in to continue')
      }

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscriptionToCancel.id,
          cancellationReason: cancelReason.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      toast.success(data.message || 'Subscription cancelled. Your remaining days are still available until the billing period ends.')

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

  // Calculate pro-rata amount for upgrade
  const calculateProRataUpgrade = (subscription: any, newTier: any) => {
    const currentTier = subscription.subscription_tiers
    const nextBillingDate = new Date(subscription.next_billing_date)
    const today = new Date()

    // Calculate days remaining in current billing period
    const billingPeriodDays = 30 // Assume 30-day billing cycle
    const msPerDay = 24 * 60 * 60 * 1000
    const daysUntilBilling = Math.max(0, Math.ceil((nextBillingDate.getTime() - today.getTime()) / msPerDay))

    // If 3 days or less until billing, consider it end of billing period - no pro-rata needed
    const isEndOfPeriod = daysUntilBilling <= 3
    setIsEndOfBillingPeriod(isEndOfPeriod)

    if (isEndOfPeriod) {
      setProRataAmount(0)
      return 0
    }

    // Calculate the price difference per day
    const currentMonthlyPrice = currentTier.price_per_day * currentTier.days_included
    const newMonthlyPrice = newTier.price_per_day * newTier.days_included
    const priceDifferencePerMonth = newMonthlyPrice - currentMonthlyPrice

    // Pro-rata for remaining days
    const proRataFraction = daysUntilBilling / billingPeriodDays
    const proRataCharge = Math.max(0, priceDifferencePerMonth * proRataFraction)

    setProRataAmount(proRataCharge)
    return proRataCharge
  }

  // Open upgrade modal
  const openUpgradeModal = (subscription: any) => {
    setSubscriptionToUpgrade(subscription)
    setSelectedUpgradeTier(null)
    setProRataAmount(0)
    setIsEndOfBillingPeriod(false)
    setShowUpgradeModal(true)
  }

  // Handle tier selection in upgrade modal
  const handleUpgradeTierSelect = (tier: any) => {
    setSelectedUpgradeTier(tier)
    if (subscriptionToUpgrade) {
      calculateProRataUpgrade(subscriptionToUpgrade, tier)
    }
  }

  // Handle upgrade subscription
  const handleUpgradeSubscription = async () => {
    if (!subscriptionToUpgrade || !selectedUpgradeTier) return

    setUpgrading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Please log in to continue')
      }

      // If end of billing period, just update the tier for next billing cycle
      if (isEndOfBillingPeriod) {
        const response = await fetch('/api/upgrade-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            subscriptionId: subscriptionToUpgrade.id,
            newTierId: selectedUpgradeTier.id,
            proRataAmount: 0,
            isEndOfBillingPeriod: true,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upgrade subscription')
        }

        toast.success('Subscription will upgrade on your next billing date!')
        setShowUpgradeModal(false)
        setSubscriptionToUpgrade(null)
        setSelectedUpgradeTier(null)
        await init()
        return
      }

      // Mid-month upgrade - need to pay pro-rata via Stripe
      const response = await fetch('/api/upgrade-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscriptionToUpgrade.id,
          newTierId: selectedUpgradeTier.id,
          proRataAmount: proRataAmount,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create upgrade checkout')
      }

      const data = await response.json()

      // Redirect to Stripe checkout
      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (error: any) {
      console.error('Upgrade error:', error)
      toast.error(error.message || 'Failed to upgrade subscription')
      setUpgrading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky">
      {/* Header with dropdown */}
      <DashboardHeader
        title="Manage Subscriptions"
        subtitle="Choose a subscription plan for each of your dogs"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Existing Subscriptions */}
        {existingSubscriptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
          >
            <h2 className="text-xl font-display font-bold text-canine-navy mb-4 flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-canine-gold" />
              Active Subscriptions
            </h2>

            {/* Cancellation Policy Info */}
            <div className="bg-canine-cream/50 border border-canine-gold/20 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-canine-gold flex-shrink-0 mt-0.5" />
                <div className="text-sm text-canine-navy">
                  <p className="font-semibold mb-1">Cancellation Policy</p>
                  <p className="text-gray-600">Cancelled subscriptions will remain active until the end of the current billing period. No refunds are provided for partial months.</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {existingSubscriptions.map(sub => {
                const dog = dogs.find(d => d.id === sub.dog_id)
                const isCancelled = sub.cancelled_at !== null
                const isPaused = sub.is_paused === true
                return (
                  <div key={sub.id} className={`bg-gradient-to-br rounded-xl p-5 border-2 ${
                    isCancelled ? 'from-red-50 to-white border-red-200' :
                    isPaused ? 'from-amber-50 to-white border-amber-200' :
                    'from-canine-cream to-canine-sky/30 border-canine-gold/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {dog?.photo_url ? (
                          <img src={dog.photo_url} alt={dog.name} className="w-12 h-12 rounded-full object-cover border-2 border-canine-gold" />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCancelled ? 'bg-red-100' :
                            isPaused ? 'bg-amber-100' :
                            'bg-canine-gold/20'
                          }`}>
                            <HeartIcon className={`h-6 w-6 ${
                              isCancelled ? 'text-red-600' :
                              isPaused ? 'text-amber-600' :
                              'text-canine-gold'
                            }`} />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-canine-navy text-lg">{dog?.name}</span>
                          <p className="text-sm text-gray-500">{dog?.breed}</p>
                        </div>
                      </div>
                      {isCancelled && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                          CANCELLED
                        </span>
                      )}
                      {isPaused && !isCancelled && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                          PAUSED
                        </span>
                      )}
                      {!isCancelled && !isPaused && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="bg-white/60 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-canine-navy">
                        {sub.subscription_tiers.name}
                      </p>
                      <p className="text-xs text-gray-500">{sub.subscription_tiers.days_included} days/month</p>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Days Remaining</p>
                        <p className="text-2xl font-bold text-canine-gold">{sub.days_remaining}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">of</p>
                        <p className="text-lg font-semibold text-canine-navy">{sub.subscription_tiers.days_included}</p>
                      </div>
                    </div>

                    {isPaused && sub.pause_end_date && (
                      <p className="text-sm text-amber-600 font-semibold mb-3 bg-amber-50 rounded-lg p-2 text-center">
                        Paused until: {new Date(sub.pause_end_date).toLocaleDateString()}
                      </p>
                    )}

                    {isCancelled ? (
                      <p className="text-sm text-red-600 font-semibold mb-3 bg-red-50 rounded-lg p-2 text-center">
                        Ends on: {new Date(sub.next_billing_date).toLocaleDateString()}
                      </p>
                    ) : !isPaused && (
                      <p className="text-xs text-gray-500 mb-3 text-center">
                        Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}
                      </p>
                    )}

                    {!isCancelled && (
                      <div className="space-y-2">
                        {isPaused ? (
                          <button
                            onClick={() => handleResumeSubscription(sub)}
                            disabled={resuming}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-canine-gold text-white rounded-xl text-sm font-semibold hover:bg-canine-light-gold transition-colors disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            {resuming ? 'Resuming...' : 'Resume Subscription'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openUpgradeModal(sub)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-canine-navy text-white rounded-xl text-sm font-semibold hover:bg-canine-navy/90 transition-colors"
                            >
                              <ArrowUpCircleIcon className="h-4 w-4" />
                              Upgrade Plan
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSubscriptionToPause(sub)
                                  setShowPauseModal(true)
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
                              >
                                <ClockIcon className="h-4 w-4" />
                                Pause
                              </button>
                              <button
                                onClick={() => {
                                  setSubscriptionToCancel(sub)
                                  setShowCancelModal(true)
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-300 transition-colors"
                              >
                                <XCircleIcon className="h-4 w-4" />
                                Cancel
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* No Dogs to Subscribe */}
        {dogsWithoutSubs.length === 0 && existingSubscriptions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="bg-canine-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-10 w-10 text-canine-gold" />
            </div>
            <h2 className="text-2xl font-display font-bold text-canine-navy mb-2">All Dogs Subscribed!</h2>
            <p className="text-gray-600">All your dogs have active subscriptions. Manage them above.</p>
          </div>
        )}

        {/* Subscribe New Dogs */}
        {dogsWithoutSubs.length > 0 && (
          <>
            {/* Section Header */}
            {existingSubscriptions.length > 0 && (
              <h2 className="text-xl font-display font-bold text-canine-navy mb-4 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-canine-gold" />
                Add New Subscription
              </h2>
            )}

            {/* Dog Cards with Tier Selection */}
            <div className="grid gap-8 mb-8">
              {dogsWithoutSubs.map((dog, index) => (
                <motion.div
                  key={dog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                >
                  {/* Dog Header */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-canine-gold/20">
                    {dog.photo_url ? (
                      <img
                        src={dog.photo_url}
                        alt={dog.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-canine-gold shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-canine-gold to-canine-light-gold flex items-center justify-center shadow-lg">
                        <HeartIcon className="h-10 w-10 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-display font-bold text-canine-navy">{dog.name}</h3>
                      <p className="text-gray-600">{dog.breed}</p>
                    </div>
                  </div>

                  {/* Session Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-canine-navy mb-3">
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
                    <label className="block text-sm font-semibold text-canine-navy mb-3">
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
              className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-canine-gold/10 p-2 rounded-xl">
                  <TicketIcon className="h-6 w-6 text-canine-gold" />
                </div>
                <h3 className="text-xl font-display font-bold text-canine-navy">Discount Code</h3>
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
                      <div className="flex items-center gap-2">
                        {appliedDiscount.code === 'FIRST50' && (
                          <img src="/VIP.png" alt="VIP" className="h-6 w-6 object-contain" />
                        )}
                        <span>Discount ({appliedDiscount.code}):</span>
                      </div>
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
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-gray-100"
              >
                {/* Warning Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-red-100 rounded-xl p-3">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-canine-navy">Cancel Subscription?</h3>
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
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-amber-100 rounded-xl p-3">
                    <ClockIcon className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-canine-navy">Pause Subscription</h3>
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

        {/* Upgrade Modal */}
        <AnimatePresence>
          {showUpgradeModal && subscriptionToUpgrade && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                if (!upgrading) {
                  setShowUpgradeModal(false)
                  setSubscriptionToUpgrade(null)
                  setSelectedUpgradeTier(null)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-canine-gold/20 rounded-xl p-3">
                    <ArrowUpCircleIcon className="h-8 w-8 text-canine-gold" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-canine-navy">Upgrade Subscription</h3>
                    <p className="text-sm text-gray-600">
                      {dogs.find(d => d.id === subscriptionToUpgrade.dog_id)?.name} - Currently on {subscriptionToUpgrade.subscription_tiers.name}
                    </p>
                  </div>
                </div>

                {/* Current Plan Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Current Plan:</span>{' '}
                    {subscriptionToUpgrade.subscription_tiers.name} - {subscriptionToUpgrade.subscription_tiers.days_included} days/month
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Monthly Price:</span>{' '}
                    £{(subscriptionToUpgrade.subscription_tiers.price_per_day * subscriptionToUpgrade.subscription_tiers.days_included).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Next Billing:</span>{' '}
                    {new Date(subscriptionToUpgrade.next_billing_date).toLocaleDateString()}
                  </p>
                </div>

                {/* Select New Tier */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select New Plan
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tiers
                      .filter(tier => {
                        // Only show tiers that are higher than current
                        const currentTier = subscriptionToUpgrade.subscription_tiers
                        return tier.session_type === currentTier.session_type &&
                               tier.days_included > currentTier.days_included
                      })
                      .map((tier) => {
                        const isSelected = selectedUpgradeTier?.id === tier.id
                        const monthlyPrice = tier.price_per_day * tier.days_included
                        return (
                          <button
                            key={tier.id}
                            onClick={() => handleUpgradeTierSelect(tier)}
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
                              £{tier.price_per_day.toFixed(2)}/day
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
                  {tiers.filter(tier => {
                    const currentTier = subscriptionToUpgrade.subscription_tiers
                    return tier.session_type === currentTier.session_type &&
                           tier.days_included > currentTier.days_included
                  }).length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      You're already on the highest tier for this session type.
                    </p>
                  )}
                </div>

                {/* Pro-rata Payment Info */}
                {selectedUpgradeTier && (
                  <div className={`rounded-xl p-4 mb-6 ${isEndOfBillingPeriod ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="flex gap-2">
                      <ExclamationTriangleIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isEndOfBillingPeriod ? 'text-green-600' : 'text-blue-600'}`} />
                      <div className={`text-sm ${isEndOfBillingPeriod ? 'text-green-900' : 'text-blue-900'}`}>
                        {isEndOfBillingPeriod ? (
                          <>
                            <p className="font-semibold mb-1">No Pro-rata Charge!</p>
                            <p>Your billing date is within 3 days. The upgrade will take effect on your next billing cycle.</p>
                            <p className="mt-2 font-semibold">
                              New monthly price: £{(selectedUpgradeTier.price_per_day * selectedUpgradeTier.days_included).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold mb-1">Pro-rata Payment Required</p>
                            <p>Since you're upgrading mid-billing cycle, you'll pay a pro-rated amount for the remaining days.</p>
                            <div className="mt-3 space-y-1">
                              <p>
                                <span className="font-medium">Pro-rata charge today:</span>{' '}
                                <span className="font-bold text-canine-gold">£{proRataAmount.toFixed(2)}</span>
                              </p>
                              <p>
                                <span className="font-medium">New monthly price (from next billing):</span>{' '}
                                <span className="font-bold">£{(selectedUpgradeTier.price_per_day * selectedUpgradeTier.days_included).toFixed(2)}</span>
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false)
                      setSubscriptionToUpgrade(null)
                      setSelectedUpgradeTier(null)
                    }}
                    disabled={upgrading}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpgradeSubscription}
                    disabled={upgrading || !selectedUpgradeTier}
                    className="flex-1 px-6 py-3 bg-canine-gold text-white rounded-xl font-semibold hover:bg-canine-light-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {upgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpCircleIcon className="h-5 w-5" />
                        {isEndOfBillingPeriod ? 'Schedule Upgrade' : `Pay £${proRataAmount.toFixed(2)} & Upgrade`}
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
