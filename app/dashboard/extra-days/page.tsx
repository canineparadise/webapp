'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import BackButton from '@/components/BackButton'
import {
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  HeartIcon,
  TicketIcon,
  PlusIcon,
  MinusIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface DogWithSubscription {
  id: string
  name: string
  breed: string
  photo_url: string | null
  subscription: {
    id: string
    tier_id: string
    tier_name: string
    days_included: number
    days_used: number
    days_remaining: number
    price_per_day: number
    session_type: 'full_day' | 'half_day'
    subscription_tiers: {
      extra_day_price: number
      half_day_extra_day_price: number
    }
  } | null
}

export default function BuyExtraDaysPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dogs, setDogs] = useState<DogWithSubscription[]>([])

  // Track quantity for each dog
  const [dogQuantities, setDogQuantities] = useState<Record<string, number>>({})

  // Discount code
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [validatingCode, setValidatingCode] = useState(false)

  // Session and VIP status
  const [session, setSession] = useState<any>(null)
  const [isVipMember, setIsVipMember] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      // Get session for auth token
      const { data: { session: userSession } } = await supabase.auth.getSession()
      if (userSession) {
        setSession(userSession)
      }

      // Check auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Check if user is a Golden Paw VIP member
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_vip_member')
        .eq('id', user.id)
        .single()

      if (profileData?.is_vip_member) {
        setIsVipMember(true)
        console.log('User is a Golden Paw VIP member - 10% discount applies')
      }

      // Get all dogs with active subscriptions
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select(`
          id,
          name,
          breed,
          photo_url
        `)
        .eq('owner_id', user.id)
        .eq('is_approved', true)
        .eq('is_draft', false)

      if (dogsError) throw dogsError

      // Get active subscriptions for these dogs
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select(`
          id,
          dog_id,
          tier_id,
          days_included,
          days_used,
          days_remaining,
          price_per_day,
          session_type,
          subscription_tiers (
            name,
            extra_day_price,
            half_day_extra_day_price
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('dog_id', (dogsData || []).map((d: any) => d.id))

      // Combine dogs with their subscriptions
      const dogsWithSubs: DogWithSubscription[] = (dogsData || []).map((dog: any) => {
        const sub = subsData?.find((s: any) => s.dog_id === dog.id)
        const tierData: any = sub?.subscription_tiers
        const tierName = (Array.isArray(tierData) ? tierData[0]?.name : tierData?.name) || 'Unknown'

        return {
          ...dog,
          subscription: sub ? {
            ...sub,
            tier_name: tierName
          } : null
        }
      })

      // Only show dogs with active subscriptions
      const subsOnly = dogsWithSubs.filter(d => d.subscription !== null)

      if (subsOnly.length === 0) {
        toast.error('You need an active subscription to buy extra days')
        setTimeout(() => router.push('/dashboard/subscriptions'), 2000)
        return
      }

      setDogs(subsOnly)

      // Initialize quantities to 0
      const initialQuantities: Record<string, number> = {}
      subsOnly.forEach(dog => {
        initialQuantities[dog.id] = 0
      })
      setDogQuantities(initialQuantities)

    } catch (error) {
      console.error('Init error:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (dogId: string, delta: number) => {
    setDogQuantities(prev => ({
      ...prev,
      [dogId]: Math.max(0, Math.min(50, (prev[dogId] || 0) + delta)) // Max 50 extra days
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
          p_applies_to: 'extra_days',
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
    return dogs.reduce((sum, dog) => {
      const quantity = dogQuantities[dog.id] || 0
      if (quantity === 0 || !dog.subscription) return sum

      const pricePerDay = dog.subscription.session_type === 'full_day'
        ? dog.subscription.subscription_tiers.extra_day_price
        : dog.subscription.subscription_tiers.half_day_extra_day_price

      return sum + (pricePerDay * quantity)
    }, 0)
  }

  const calculateFinalAmount = () => {
    const total = calculateTotal()
    let finalAmount = total

    // Apply discount code if present
    if (appliedDiscount) {
      finalAmount = finalAmount - appliedDiscount.discountAmount
    }

    // Apply VIP 10% discount if applicable
    if (isVipMember) {
      finalAmount = finalAmount - (total * 0.10)
    }

    return Math.max(0, finalAmount)
  }

  const handleCheckout = async () => {
    // Validate at least one dog has quantity > 0
    const selectedDogs = dogs.filter(dog => (dogQuantities[dog.id] || 0) > 0)
    if (selectedDogs.length === 0) {
      toast.error('Please select at least one extra day to purchase')
      return
    }

    if (!session?.access_token) {
      toast.error('Session expired. Please refresh the page.')
      return
    }

    setPurchasing(true)
    try {
      const extraDaysPurchases = selectedDogs.map(dog => {
        const quantity = dogQuantities[dog.id]
        const pricePerDay = dog.subscription!.session_type === 'full_day'
          ? dog.subscription!.subscription_tiers.extra_day_price
          : dog.subscription!.subscription_tiers.half_day_extra_day_price

        return {
          dogId: dog.id,
          dogName: dog.name,
          subscriptionId: dog.subscription!.id,
          quantity,
          pricePerDay,
          totalPrice: pricePerDay * quantity,
          sessionType: dog.subscription!.session_type,
        }
      })

      // Calculate VIP discount
      const total = calculateTotal()
      const vipDiscountAmount = isVipMember ? total * 0.10 : 0
      const codeDiscountAmount = appliedDiscount?.discountAmount || 0
      const totalDiscount = codeDiscountAmount + vipDiscountAmount

      // Create checkout session
      const response = await fetch('/api/create-extra-days-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          extraDaysPurchases,
          discountCode: appliedDiscount?.code || null,
          discountCodeId: appliedDiscount?.discountCodeId || null,
          totalAmount: total,
          discountAmount: totalDiscount,
          finalAmount: calculateFinalAmount(),
          isVipMember: isVipMember,
          vipDiscountAmount: vipDiscountAmount,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Failed to start checkout')
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-gold mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-4">
            <BackButton href="/dashboard" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-canine-gold rounded-2xl p-3">
                <CalendarDaysIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-canine-navy">
                  Buy Extra Days
                </h1>
                <p className="text-gray-600 mt-1">
                  Purchase additional daycare days for your dogs
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dog Cards */}
        <div className="grid gap-6 mb-8">
          {dogs.map((dog, index) => {
            const quantity = dogQuantities[dog.id] || 0
            const pricePerDay = dog.subscription!.session_type === 'full_day'
              ? dog.subscription!.subscription_tiers.extra_day_price
              : dog.subscription!.subscription_tiers.half_day_extra_day_price
            const totalPrice = pricePerDay * quantity

            return (
              <motion.div
                key={dog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {dog.photo_url ? (
                      <img
                        src={dog.photo_url}
                        alt={dog.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-canine-gold"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-canine-gold flex items-center justify-center">
                        <HeartIcon className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{dog.name}</h3>
                      <p className="text-sm text-gray-600">{dog.breed}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {dog.subscription!.tier_name}
                        </span>
                        <span className="text-xs text-gray-600">
                          {dog.subscription!.days_remaining} / {dog.subscription!.days_included} days left
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Extra day price: <span className="font-bold text-canine-navy">£{pricePerDay.toFixed(2)}</span>
                        {' '}({dog.subscription!.session_type === 'full_day' ? 'Full Day' : 'Half Day'})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(dog.id, -1)}
                        disabled={quantity === 0}
                        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MinusIcon className="h-5 w-5 text-gray-700" />
                      </button>
                      <span className="text-2xl font-bold text-canine-navy w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(dog.id, 1)}
                        className="p-2 rounded-lg bg-canine-gold hover:bg-canine-light-gold text-white"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {quantity > 0 && (
                      <p className="text-sm font-bold text-canine-navy">
                        £{totalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
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
          <h3 className="text-2xl font-bold mb-4">Purchase Summary</h3>
          <div className="space-y-2 mb-6">
            {dogs
              .filter(dog => (dogQuantities[dog.id] || 0) > 0)
              .map(dog => {
                const quantity = dogQuantities[dog.id]
                const pricePerDay = dog.subscription!.session_type === 'full_day'
                  ? dog.subscription!.subscription_tiers.extra_day_price
                  : dog.subscription!.subscription_tiers.half_day_extra_day_price
                const total = pricePerDay * quantity

                return (
                  <div key={dog.id} className="flex justify-between items-center">
                    <span>
                      {dog.name} - {quantity} extra day{quantity > 1 ? 's' : ''}
                    </span>
                    <span className="font-bold">£{total.toFixed(2)}</span>
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
                  <span>Discount ({appliedDiscount.code}):</span>
                  <span className="font-bold">-£{appliedDiscount.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {isVipMember && calculateTotal() > 0 && (
                <div className="flex justify-between items-center text-amber-300">
                  <span>🏆 Golden Paw VIP (10%):</span>
                  <span className="font-bold">-£{(calculateTotal() * 0.10).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-2xl mt-2">
                <span>Total:</span>
                <span className="font-bold">£{calculateFinalAmount().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={purchasing || calculateTotal() === 0}
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
      </div>
    </div>
  )
}
