'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { CalendarIcon, CheckCircleIcon, XCircleIcon, CreditCardIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Dog {
  id: string
  name: string
  size: 'small' | 'medium' | 'large'
}

interface CapacityInfo {
  date: string
  available_spots: number
  is_available: boolean
}

interface Booking {
  id: string
  booking_date: string
  dog_id: string
  dog_name: string
  price: number
  payment_status: string
  status: string
}

function IndividualDaysContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<any>(null)
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDog, setSelectedDog] = useState<string>('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [availabilityMap, setAvailabilityMap] = useState<Map<string, CapacityInfo>>(new Map())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pricePerDay, setPricePerDay] = useState<number>(50)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [loading, setLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [closedDays, setClosedDays] = useState<Set<string>>(new Set())

  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [discountCodeId, setDiscountCodeId] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | null>(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  const [discountError, setDiscountError] = useState('')

  // Generate next 60 days for calendar grouped by month
  const generateCalendarDates = () => {
    const dates: Date[] = []
    const today = new Date()
    for (let i = 0; i < 60; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const calendarDates = generateCalendarDates()

  // Group dates by month
  const datesByMonth = calendarDates.reduce((acc, date) => {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(date)
    return acc
  }, {} as Record<string, Date[]>)

  useEffect(() => {
    loadUserAndDogs()
    loadSettings()
    loadBookings()
    loadClosedDays()

    // Handle payment success/cancel
    const success = searchParams.get('success')
    const paymentMethodParam = searchParams.get('payment_method')

    if (success === 'true') {
      toast.success('Booking confirmed! Your payment was successful.')
      router.replace('/dashboard/individual-days')
      loadBookings()
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedDog) {
      checkAvailability()
    }
  }, [selectedDog])

  // Recalculate discount when dates change
  useEffect(() => {
    if (discountCodeId && discountType) {
      validateDiscountCode()
    }
  }, [selectedDates.length])

  const loadUserAndDogs = async () => {
    console.log('=== loadUserAndDogs CALLED ===')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Got user:', user?.id)
      if (user) {
        setUser(user)

        // Load user's dogs (only approved dogs)
        console.log('Fetching dogs for user:', user.id)
        const { data: dogsData, error } = await supabase
          .from('dogs')
          .select('id, name, size')
          .eq('owner_id', user.id)
          .eq('is_draft', false)
          .eq('is_approved', true)

        console.log('Individual days - Loading dogs for user:', user.id)
        console.log('Individual days - Dogs query result:', { dogsData, error })

        if (error) throw error
        setDogs(dogsData || [])
        console.log('Set dogs state to:', dogsData)
      } else {
        console.log('NO USER FOUND')
      }
    } catch (error) {
      console.error('Error loading user and dogs:', error)
      toast.error('Failed to load your dogs')
    }
  }

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'individual_day_price')
        .single()

      if (error) throw error
      if (data) {
        setPricePerDay(parseFloat(data.setting_value))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadClosedDays = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('closed_days')
        .select('closed_date')
        .gte('closed_date', today)

      if (error) throw error
      if (data) {
        const closedDatesSet = new Set(data.map(d => d.closed_date))
        setClosedDays(closedDatesSet)
      }
    } catch (error) {
      console.error('Error loading closed days:', error)
    }
  }

  const loadBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('individual_day_bookings')
        .select(`
          id,
          booking_date,
          dog_id,
          price,
          payment_status,
          status,
          dogs (name)
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true })

      if (error) throw error

      const formattedBookings = (data || []).map((booking: any) => ({
        id: booking.id,
        booking_date: booking.booking_date,
        dog_id: booking.dog_id,
        dog_name: booking.dogs?.name || 'Unknown',
        price: booking.price,
        payment_status: booking.payment_status,
        status: booking.status
      }))

      setBookings(formattedBookings)
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  const checkAvailability = async () => {
    if (!selectedDog) return

    setCheckingAvailability(true)
    try {
      const dog = dogs.find(d => d.id === selectedDog)
      if (!dog) return

      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 60)

      const { data, error } = await supabase
        .rpc('get_date_range_availability', {
          p_start_date: startDate.toISOString().split('T')[0],
          p_end_date: endDate.toISOString().split('T')[0],
          p_dog_size: dog.size
        })

      if (error) throw error

      const availMap = new Map<string, CapacityInfo>()
      data.forEach((item: any) => {
        availMap.set(item.booking_date, {
          date: item.booking_date,
          available_spots: item.available_spots,
          is_available: item.is_available
        })
      })

      setAvailabilityMap(availMap)
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error('Failed to check availability')
    } finally {
      setCheckingAvailability(false)
    }
  }

  const toggleDateSelection = (dateStr: string) => {
    const availability = availabilityMap.get(dateStr)

    if (!availability?.is_available) {
      toast.error('This date is fully booked')
      return
    }

    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr)
      } else {
        return [...prev, dateStr].sort()
      }
    })
  }

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('')
      setDiscountCodeId(null)
      setDiscountAmount(0)
      setDiscountType(null)
      return
    }

    setIsValidatingDiscount(true)
    setDiscountError('')

    try {
      const totalBeforeDiscount = selectedDates.length * pricePerDay

      const { data, error } = await supabase.rpc('validate_discount_code', {
        p_code: discountCode.trim(),
        p_user_id: user.id,
        p_applies_to: 'individual_days',
        p_amount: totalBeforeDiscount
      })

      if (error) throw error

      // RPC returns a single row, but might be in an array
      const result = Array.isArray(data) ? data[0] : data

      if (!result.is_valid) {
        setDiscountError(result.error_message || 'Invalid discount code')
        setDiscountCodeId(null)
        setDiscountAmount(0)
        setDiscountType(null)
        return
      }

      // Calculate actual discount amount based on type
      let calculatedDiscountAmount = 0
      if (result.discount_type === 'percentage') {
        calculatedDiscountAmount = (totalBeforeDiscount * result.discount_value) / 100
      } else {
        // fixed amount
        calculatedDiscountAmount = result.discount_value
      }

      setDiscountCodeId(result.discount_code_id)
      setDiscountAmount(calculatedDiscountAmount)
      setDiscountType(result.discount_type)
      toast.success(`Discount applied: ${result.discount_type === 'percentage' ? `${result.discount_value}%` : `£${result.discount_value}`} off`)
    } catch (error: any) {
      console.error('Error validating discount code:', error)
      setDiscountError('Failed to validate discount code')
      setDiscountCodeId(null)
      setDiscountAmount(0)
      setDiscountType(null)
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  const handleCheckout = async () => {
    if (!selectedDog || selectedDates.length === 0) {
      toast.error('Please select a dog and at least one date')
      return
    }

    setLoading(true)
    try {
      const apiEndpoint = paymentMethod === 'stripe'
        ? '/api/create-individual-day-checkout'
        : '/api/create-individual-day-checkout-paypal'

      const totalBeforeDiscount = selectedDates.length * pricePerDay
      const finalAmount = totalBeforeDiscount - discountAmount

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          dogId: selectedDog,
          dates: selectedDates,
          pricePerDay: pricePerDay,
          discountCode: discountCode || undefined,
          discountCodeId: discountCodeId || undefined,
          totalAmount: totalBeforeDiscount,
          discountAmount: discountAmount,
          finalAmount: finalAmount
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      if (paymentMethod === 'stripe') {
        const stripe = await stripePromise
        if (!stripe) throw new Error('Stripe not loaded')

        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        })

        if (error) throw error
      } else {
        // Redirect to PayPal approval URL
        if (data.approvalUrl) {
          window.location.href = data.approvalUrl
        } else {
          throw new Error('No approval URL received from PayPal')
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Failed to start checkout')
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const isDateBooked = (dateStr: string) => {
    return bookings.some(b =>
      b.booking_date === dateStr &&
      b.dog_id === selectedDog &&
      b.status === 'confirmed'
    )
  }

  const totalPrice = selectedDates.length * pricePerDay
  const finalPrice = totalPrice - discountAmount

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-canine-navy hover:text-canine-gold transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
            Book Individual Days
          </h1>
          <p className="text-gray-600">
            Select dates for individual day care at £{pricePerDay} per day
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            {/* Dog Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg mb-6"
            >
              <h2 className="text-xl font-semibold text-canine-navy mb-4">
                Select Your Dog
              </h2>
              <select
                value={selectedDog}
                onChange={(e) => {
                  setSelectedDog(e.target.value)
                  setSelectedDates([])
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
              >
                <option value="">Choose a dog...</option>
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name} ({dog.size})
                  </option>
                ))}
              </select>
              {dogs.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Please register a dog first to book individual days
                </p>
              )}
            </motion.div>

            {/* Calendar */}
            {selectedDog && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-canine-navy">
                    Select Dates
                  </h2>
                  {checkingAvailability && (
                    <span className="text-sm text-gray-500">
                      Checking availability...
                    </span>
                  )}
                </div>

                {/* Render each month separately */}
                <div className="space-y-8">
                  {Object.entries(datesByMonth).map(([monthKey, monthDates]) => {
                    const firstDate = monthDates[0]
                    const monthName = firstDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

                    return (
                      <div key={monthKey}>
                        {/* Month Header */}
                        <h3 className="text-lg font-semibold text-canine-navy mb-3 border-b pb-2">
                          {monthName}
                        </h3>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="text-xs font-semibold text-gray-500 text-center">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-2">
                          {/* Add empty cells for days before the first date of the month */}
                          {monthDates[0].getDate() === 1 && Array.from({ length: (monthDates[0].getDay() + 6) % 7 }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}

                          {monthDates.map((date) => {
                            const dateStr = date.toISOString().split('T')[0]
                            const availability = availabilityMap.get(dateStr)
                            const isSelected = selectedDates.includes(dateStr)
                            const isBooked = isDateBooked(dateStr)
                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                            const isClosed = closedDays.has(dateStr)
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6
                            const isAvailable = availability?.is_available && !isBooked && !isPast && !isClosed && !isWeekend

                            return (
                              <button
                                key={dateStr}
                                onClick={() => isAvailable && toggleDateSelection(dateStr)}
                                disabled={!isAvailable || checkingAvailability}
                                className={`
                                  p-2 rounded-lg text-sm transition-all
                                  ${isSelected ? 'bg-canine-gold text-white font-semibold' : ''}
                                  ${!isSelected && isAvailable ? 'bg-gray-100 hover:bg-canine-sky text-gray-700' : ''}
                                  ${isClosed ? 'bg-red-100 text-red-600 cursor-not-allowed' : ''}
                                  ${isWeekend ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                                  ${!isAvailable && !isClosed && !isWeekend ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : ''}
                                  ${isBooked ? 'bg-blue-100 text-blue-600' : ''}
                                `}
                              >
                                <div className="font-semibold">{date.getDate()}</div>
                                {isClosed ? (
                                  <div className="text-xs mt-1">✗</div>
                                ) : isWeekend ? (
                                  <div className="text-xs mt-1">Closed</div>
                                ) : availability && (
                                  <div className="text-xs mt-1">
                                    {isBooked ? '✓' : availability.is_available ? '✓' : '✗'}
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-canine-gold rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-50 rounded"></div>
                    <span>Full</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 rounded"></div>
                    <span>Closed</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg sticky top-6"
            >
              <h2 className="text-xl font-semibold text-canine-navy mb-4">
                Booking Summary
              </h2>

              {selectedDates.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selected dates:</span>
                      <span className="font-semibold">{selectedDates.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per day:</span>
                      <span className="font-semibold">£{pricePerDay}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">£{totalPrice}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discountCode}):</span>
                        <span className="font-semibold">-£{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-canine-navy">Total:</span>
                        <span className="font-bold text-xl text-canine-gold">
                          £{finalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Discount Code Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Code (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent text-sm"
                      />
                      <button
                        onClick={validateDiscountCode}
                        disabled={isValidatingDiscount || !discountCode.trim()}
                        className="px-4 py-2 bg-canine-navy text-white rounded-lg hover:bg-canine-navy/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isValidatingDiscount ? '...' : 'Apply'}
                      </button>
                    </div>
                    {discountError && (
                      <p className="text-xs text-red-600 mt-1">{discountError}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          paymentMethod === 'stripe'
                            ? 'border-canine-gold bg-canine-gold/10'
                            : 'border-gray-200 hover:border-canine-gold/50'
                        }`}
                      >
                        <CreditCardIcon className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs font-medium">Card</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-canine-gold bg-canine-gold/10'
                            : 'border-gray-200 hover:border-canine-gold/50'
                        }`}
                      >
                        <div className="text-lg font-bold text-[#0070ba] mb-1">PayPal</div>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading || !selectedDog}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : `Pay £${finalPrice.toFixed(2)}`}
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  Select dates to see booking summary
                </p>
              )}
            </motion.div>

            {/* Your Bookings */}
            {bookings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-lg mt-6"
              >
                <h2 className="text-xl font-semibold text-canine-navy mb-4">
                  Your Bookings
                </h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div>
                        <div className="font-medium">{booking.dog_name}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(booking.booking_date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-canine-gold">
                          £{booking.price}
                        </div>
                        {booking.status === 'confirmed' && (
                          <CheckCircleIcon className="h-4 w-4 text-green-600 inline" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IndividualDaysPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canine-cream flex items-center justify-center"><div className="text-canine-navy">Loading...</div></div>}>
      <IndividualDaysContent />
    </Suspense>
  )
}
