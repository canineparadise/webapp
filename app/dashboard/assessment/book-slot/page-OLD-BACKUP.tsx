'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  CalendarDaysIcon,
  ClockIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  CurrencyPoundIcon,
  TicketIcon,
} from '@heroicons/react/24/outline'

interface AssessmentSlot {
  id: string
  assessment_date: string
  start_time: string
  end_time: string
  max_dogs: number
  booked_count: number
  is_available: boolean
}

interface Dog {
  id: string
  name: string
  photo_url?: string
  has_vaccination_docs?: boolean
}

export default function BookAssessmentSlot() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dogs, setDogs] = useState<Dog[]>([])
  const [slots, setSlots] = useState<AssessmentSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [selectedDogs, setSelectedDogs] = useState<string[]>([])
  const [existingBooking, setExistingBooking] = useState<any>(null)
  const [assessmentFee, setAssessmentFee] = useState<number>(40) // Default to £40, fetched from database

  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [validatingCode, setValidatingCode] = useState(false)

  const fetchAvailableSlots = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('assessment_slots')
        .select('*')
        .eq('is_available', true)
        .gte('assessment_date', today)
        .order('assessment_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      // Filter slots that aren't full
      const availableSlots = (data || []).filter(
        slot => slot.booked_count < slot.max_dogs
      )

      setSlots(availableSlots)
    } catch (error) {
      console.error('Error fetching slots:', error)
      toast.error('Failed to load available slots')
    }
  }

  useEffect(() => {
    init()

    // Set up real-time subscription for assessment slots
    const slotsSubscription = supabase
      .channel('assessment_slots_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessment_slots'
        },
        (payload) => {
          console.log('Assessment slots changed:', payload)
          // Refresh available slots when any change occurs
          fetchAvailableSlots()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      slotsSubscription.unsubscribe()
    }
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

      // Fetch assessment fee from admin settings
      const { data: feeData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'assessment_fee')
        .maybeSingle()

      if (feeData?.setting_value) {
        setAssessmentFee(parseFloat(feeData.setting_value))
      }

      // Get user's dogs
      const { data: dogsData } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', user.id)

      setDogs(dogsData || [])

      if (!dogsData || dogsData.length === 0) {
        toast.error('Please add at least one dog before booking an assessment')
        setTimeout(() => router.push('/dashboard/add-dog'), 2000)
        return
      }

      // Check if all dogs have photos and vaccination documents
      for (const dog of dogsData) {
        if (!dog.photo_url) {
          toast.error(`Please upload a photo for ${dog.name} before booking an assessment`)
          setTimeout(() => router.push('/dashboard'), 2000)
          return
        }
        if (!dog.has_vaccination_docs) {
          toast.error(`Please upload vaccination records for ${dog.name} before booking an assessment`)
          setTimeout(() => router.push('/dashboard'), 2000)
          return
        }
      }

      // Check if user has signed legal agreements
      const { data: agreements } = await supabase
        .from('legal_agreements')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!agreements) {
        toast.error('Please sign all required legal agreements before booking an assessment')
        setTimeout(() => router.push('/dashboard/legal-agreements'), 2000)
        return
      }

      // Verify all required waivers are signed
      if (!agreements.liability_waiver_signed ||
          !agreements.photo_consent_signed ||
          !agreements.terms_accepted) {
        toast.error('Please sign all required waivers before booking an assessment')
        setTimeout(() => router.push('/dashboard/legal-agreements'), 2000)
        return
      }

      // Check if user already has an assessment booked
      const { data: existingData } = await supabase
        .from('assessment_bookings')
        .select(`
          *,
          slot:assessment_slots (*)
        `)
        .eq('user_id', user.id)
        .eq('booking_status', 'confirmed')
        .maybeSingle()

      if (existingData) {
        setExistingBooking(existingData)
      }

      // Fetch available slots
      await fetchAvailableSlots()
    } catch (error) {
      console.error('Init error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDogToggle = (dogId: string) => {
    if (selectedDogs.includes(dogId)) {
      setSelectedDogs(selectedDogs.filter(id => id !== dogId))
    } else {
      setSelectedDogs([...selectedDogs, dogId])
    }
  }

  const handleValidateDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code')
      return
    }

    setValidatingCode(true)
    try {
      const totalAmount = assessmentFee * selectedDogs.length

      const { data, error } = await supabase
        .rpc('validate_discount_code', {
          p_code: discountCode.toUpperCase(),
          p_user_id: user.id,
          p_applies_to: 'assessment',
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

  const calculateTotalPrice = () => {
    const baseTotal = assessmentFee * selectedDogs.length
    if (appliedDiscount) {
      return baseTotal - appliedDiscount.discountAmount
    }
    return baseTotal
  }

  const handleBookSlot = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }

    if (selectedDogs.length === 0) {
      toast.error('Please select at least one dog for assessment')
      return
    }

    setBooking(true)

    try {
      // Verify slot is still available
      const { data: slotData } = await supabase
        .from('assessment_slots')
        .select('*')
        .eq('id', selectedSlot)
        .single()

      if (!slotData || !slotData.is_available || slotData.booked_count >= slotData.max_dogs) {
        toast.error('Sorry, this slot is no longer available')
        await fetchAvailableSlots()
        setBooking(false)
        return
      }

      // Create Stripe checkout session for assessment payment
      const totalAmount = assessmentFee * selectedDogs.length
      const finalAmount = calculateTotalPrice()

      const response = await fetch('/api/create-assessment-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          slotId: selectedSlot,
          dogIds: selectedDogs,
          discountCode: appliedDiscount?.code || null,
          discountCodeId: appliedDiscount?.discountCodeId || null,
          totalAmount,
          discountAmount: appliedDiscount?.discountAmount || 0,
          finalAmount,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to book assessment. Please try again.')
      setBooking(false)
    }
  }

  const groupSlotsByDate = () => {
    const grouped: Record<string, AssessmentSlot[]> = {}
    slots.forEach(slot => {
      if (!grouped[slot.assessment_date]) {
        grouped[slot.assessment_date] = []
      }
      grouped[slot.assessment_date].push(slot)
    })
    return grouped
  }

  const groupedSlots = groupSlotsByDate()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-gold mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading assessment slots...</p>
        </div>
      </div>
    )
  }

  if (existingBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center">
              <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-display font-bold text-canine-navy mb-4">
                Assessment Already Scheduled
              </h1>
              <p className="text-gray-600 mb-2">
                You have an assessment booked for:
              </p>
              <p className="text-2xl font-bold text-canine-gold mb-6">
                {new Date(existingBooking.slot.assessment_date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                <br />
                {existingBooking.slot.start_time.slice(0, 5)} - {existingBooking.slot.end_time.slice(0, 5)}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-colors font-semibold"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Return to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-canine-navy hover:text-canine-gold mb-6 transition-colors font-semibold"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
                Book Assessment Slot
              </h1>
              <p className="text-gray-600">
                Select a time slot for your dog's assessment
              </p>
            </div>
            <div className="bg-canine-gold text-white px-6 py-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <CurrencyPoundIcon className="h-6 w-6" />
                <span className="text-2xl font-bold">£{assessmentFee}</span>
              </div>
              <p className="text-xs opacity-90">One-time fee</p>
            </div>
          </div>
        </motion.div>

        {/* Select Dogs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">
            Select Dogs for Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map(dog => (
              <div
                key={dog.id}
                onClick={() => handleDogToggle(dog.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedDogs.includes(dog.id)
                    ? 'border-canine-gold bg-canine-gold/10'
                    : 'border-gray-300 hover:border-canine-gold/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {dog.photo_url && (
                    <img
                      src={dog.photo_url}
                      alt={dog.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{dog.name}</p>
                  </div>
                  {selectedDogs.includes(dog.id) && (
                    <CheckCircleIcon className="h-6 w-6 text-canine-gold" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Discount Code Section */}
        {selectedDogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-8 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <TicketIcon className="h-6 w-6 text-canine-gold" />
              <h2 className="text-2xl font-display font-bold text-canine-navy">
                Discount Code
              </h2>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter discount code"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-canine-gold focus:outline-none"
              />
              <button
                onClick={handleValidateDiscountCode}
                disabled={validatingCode || !discountCode.trim()}
                className="px-6 py-3 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validatingCode ? 'Validating...' : 'Apply'}
              </button>
            </div>

            {appliedDiscount && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-bold text-green-900">Code Applied: {appliedDiscount.code}</p>
                    <p className="text-sm text-green-700">
                      {appliedDiscount.type === 'percentage'
                        ? `${appliedDiscount.value}% off`
                        : `£${appliedDiscount.value} off`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAppliedDiscount(null)
                    setDiscountCode('')
                    toast.success('Discount code removed')
                  }}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Price Breakdown */}
            {selectedDogs.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Assessment Fee ({selectedDogs.length} dog{selectedDogs.length > 1 ? 's' : ''})</span>
                    <span>£{(assessmentFee * selectedDogs.length).toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Discount</span>
                      <span>-£{appliedDiscount.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-canine-navy pt-2 border-t-2 border-gray-200">
                    <span>Total</span>
                    <span>£{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Available Slots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-display font-bold text-canine-navy mb-6">
            Available Time Slots
          </h2>

          {Object.keys(groupedSlots).length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-xl text-gray-600 mb-2">No slots available</p>
              <p className="text-gray-500">Please check back later for new assessment slots</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                <div key={date}>
                  <h3 className="text-xl font-display font-bold text-gray-800 mb-4">
                    {new Date(date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dateSlots.map(slot => (
                      <motion.div
                        key={slot.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSlot === slot.id
                            ? 'border-canine-gold bg-canine-gold/10'
                            : 'border-gray-300 hover:border-canine-gold/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-6 w-6 text-canine-gold" />
                            <span className="font-bold text-lg text-gray-900">
                              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </span>
                          </div>
                          {selectedSlot === slot.id && (
                            <CheckCircleIcon className="h-6 w-6 text-canine-gold" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {slot.max_dogs - slot.booked_count} spot{slot.max_dogs - slot.booked_count !== 1 ? 's' : ''} left
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {Object.keys(groupedSlots).length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBookSlot}
                disabled={!selectedSlot || selectedDogs.length === 0 || booking}
                className="w-full px-8 py-4 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {booking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-6 w-6" />
                    <span>Proceed to Payment (£{calculateTotalPrice().toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
