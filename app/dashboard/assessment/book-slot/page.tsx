'use client'

import { useState, useEffect, useCallback } from 'react'
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
  ChevronLeftIcon,
  ChevronRightIcon,
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
  const [assessmentFee, setAssessmentFee] = useState<number>(40)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [validatingCode, setValidatingCode] = useState(false)

  const fetchAvailableSlots = useCallback(async () => {
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
  }, [])

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
  }, [fetchAvailableSlots])

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getSlotsForDate = (dateString: string) => {
    return slots.filter(slot => slot.assessment_date === dateString)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
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

  // Render calendar
  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dateSlots = getSlotsForDate(dateString)
      const isPast = date < today
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      days.push(
        <motion.div
          key={day}
          whileHover={!isPast && dateSlots.length > 0 ? { scale: 1.05 } : {}}
          className={`p-3 border rounded-lg min-h-[100px] transition-all ${
            isPast
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isWeekend
              ? 'bg-gray-50 text-gray-400'
              : dateSlots.length > 0
              ? 'bg-green-50 border-green-300 cursor-pointer hover:bg-green-100'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="font-bold mb-1">{day}</div>
          {!isPast && dateSlots.length > 0 && (
            <div className="space-y-1">
              {dateSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`w-full text-xs p-2 rounded transition-all ${
                    selectedSlot === slot.id
                      ? 'bg-canine-gold text-white font-bold'
                      : 'bg-white border border-green-400 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{slot.start_time.slice(0, 5)}</span>
                  </div>
                  <div className="text-[10px] mt-0.5">
                    {slot.max_dogs - slot.booked_count} spots
                  </div>
                </button>
              ))}
            </div>
          )}
          {!isPast && isWeekend && (
            <div className="text-xs text-gray-400 mt-1">Closed</div>
          )}
        </motion.div>
      )
    }

    return days
  }

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
      <div className="max-w-7xl mx-auto">
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
                Select a time slot for your dog's assessment (typically Fridays)
              </p>
            </div>
            <div className="bg-canine-gold text-white px-6 py-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <CurrencyPoundIcon className="h-6 w-6" />
                <span className="text-2xl font-bold">£{assessmentFee}</span>
              </div>
              <p className="text-xs opacity-90">Per dog</p>
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

        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-canine-navy">
              Available Assessment Dates
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={previousMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6 text-canine-navy" />
              </button>
              <span className="text-lg font-semibold text-canine-navy min-w-[200px] text-center">
                {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRightIcon className="h-6 w-6 text-canine-navy" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
              <span>Available slots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
              <span>Weekend (Closed)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <span>Past date</span>
            </div>
          </div>

          {/* Book Button */}
          {selectedSlot && selectedDogs.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBookSlot}
                disabled={booking}
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
// Force Vercel cache clear - Thu Nov 27 11:15:00 SAST 2025
