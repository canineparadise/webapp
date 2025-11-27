'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  CalendarDaysIcon,
  ClockIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CurrencyPoundIcon,
  TicketIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { CalendarDaysIcon as CalendarSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid'

export default function ScheduleAssessment() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dogs, setDogs] = useState<any[]>([])
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [existingAssessment, setExistingAssessment] = useState<any>(null)
  const [assessmentFee, setAssessmentFee] = useState<number>(40) // Default to £40, fetched from database
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [validatingCode, setValidatingCode] = useState(false)

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
          fetchAvailableSlots()
        }
      )
      .subscribe()

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

      // Get user's dogs that are ready for assessment (not drafts)
      const { data: dogsData } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_draft', false)

      setDogs(dogsData || [])

      // Auto-select all dogs for assessment
      if (dogsData && dogsData.length > 0) {
        setSelectedDogIds(dogsData.map(d => d.id))
      }

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

      // Verify all required waivers are signed (photo permission is optional)
      if (!agreements.injury_waiver_agreed ||
          !agreements.terms_accepted ||
          !agreements.vaccination_requirement_understood) {
        toast.error('Please sign all required waivers before booking an assessment')
        setTimeout(() => router.push('/dashboard/legal-agreements'), 2000)
        return
      }

      // Check if user already has an assessment scheduled
      const { data: existingData } = await supabase
        .from('assessment_schedule')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle()

      if (existingData) {
        setExistingAssessment(existingData)
      }

      // Fetch available assessment slots
      await fetchAvailableSlots()
    } catch (error) {
      console.error('Init error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      // Fetch all available assessment slots from admin configuration
      // 1 user per slot - check if booked_by_user_id is null
      const { data: slots, error } = await supabase
        .from('assessment_slots')
        .select(`
          id,
          assessment_date,
          start_time,
          end_time,
          booked_by_user_id,
          is_available
        `)
        .gte('assessment_date', new Date().toISOString().split('T')[0])
        .eq('is_available', true)
        .is('booked_by_user_id', null)
        .order('assessment_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      // Only show slots that haven't been booked (booked_by_user_id is null)
      setAvailableSlots(slots || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
      toast.error('Failed to load available assessment slots')
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
    return availableSlots.filter(slot => slot.assessment_date === dateString)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

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
          className={`p-3 border rounded-lg min-h-[120px] transition-all ${
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
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-white border border-green-400 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{slot.start_time.slice(0, 5)}</span>
                  </div>
                  <div className="text-[10px] mt-0.5">
                    Available
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

  const handleValidateDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code')
      return
    }

    setValidatingCode(true)

    try {
      const baseTotal = assessmentFee * selectedDogIds.length

      // Validate the discount code
      const { data: results, error } = await supabase
        .rpc('validate_discount_code', {
          p_code: discountCode.toUpperCase(),
          p_user_id: user.id,
          p_applies_to: 'assessment',
          p_amount: baseTotal
        })

      if (error) throw error

      // RPC returns array, get first result
      const result = results?.[0]
      if (!result || !result.is_valid) {
        toast.error(result?.error_message || 'Invalid discount code')
        setAppliedDiscount(null)
        return
      }

      // Calculate discount amount
      const { data: discountData } = await supabase
        .rpc('calculate_discount_amount', {
          p_original_amount: baseTotal,
          p_discount_type: result.discount_type,
          p_discount_value: result.discount_value
        })

      setAppliedDiscount({
        code: discountCode.toUpperCase(),
        discountCodeId: result.discount_code_id,
        type: result.discount_type,
        value: result.discount_value,
        discountAmount: discountData || 0
      })

      toast.success(`Code applied! £${discountData?.toFixed(2) || 0} discount`)
    } catch (error: any) {
      console.error('Error validating discount code:', error)
      toast.error(error.message || 'Failed to validate discount code')
    } finally {
      setValidatingCode(false)
    }
  }

  const calculateTotalPrice = () => {
    const baseTotal = assessmentFee * selectedDogIds.length
    if (appliedDiscount) {
      return Math.max(0, baseTotal - appliedDiscount.discountAmount)
    }
    return baseTotal
  }

  const handleBookAssessment = async () => {
    if (!selectedSlot) {
      toast.error('Please select an assessment time slot')
      return
    }

    if (selectedDogIds.length === 0) {
      toast.error('Please select at least one dog for assessment')
      return
    }

    if (!user) {
      toast.error('Invalid booking data')
      return
    }

    setBooking(true)

    try {
      // Get the selected slot details
      const slot = availableSlots.find(s => s.id === selectedSlot)
      if (!slot) {
        toast.error('Selected slot not found')
        setBooking(false)
        return
      }

      // Double-check availability (slot might have been booked by someone else)
      const { data: currentSlot } = await supabase
        .from('assessment_slots')
        .select('booked_by_user_id, is_available')
        .eq('id', selectedSlot)
        .single()

      if (!currentSlot || !currentSlot.is_available || currentSlot.booked_by_user_id !== null) {
        toast.error('Sorry, this slot has just been filled. Please select another time.')
        await fetchAvailableSlots() // Refresh
        setBooking(false)
        return
      }

      // Create checkout session (Stripe or PayPal)
      const apiEndpoint = paymentMethod === 'stripe'
        ? '/api/create-assessment-checkout'
        : '/api/create-assessment-checkout-paypal'

      const baseTotal = assessmentFee * selectedDogIds.length
      const finalTotal = calculateTotalPrice()

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          dogIds: selectedDogIds,
          slotId: selectedSlot,
          assessmentDate: slot.assessment_date,
          startTime: slot.start_time,
          endTime: slot.end_time,
          discountCode: appliedDiscount?.code || null,
          discountCodeId: appliedDiscount?.discountCodeId || null,
          totalAmount: baseTotal,
          discountAmount: appliedDiscount?.discountAmount || 0,
          finalAmount: finalTotal,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      const checkoutUrl = data.url || data.approvalUrl

      if (!checkoutUrl) {
        throw new Error('No checkout URL returned')
      }

      // Redirect to payment gateway
      window.location.href = checkoutUrl

    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error(error.message || 'Failed to initiate payment')
      setBooking(false)
    }
  }

  const handleCancelAssessment = async () => {
    if (!existingAssessment) return

    if (!confirm('Are you sure you want to cancel your assessment booking?')) return

    try {
      const { error } = await supabase
        .from('assessment_schedule')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed'])

      if (error) throw error

      toast.success('Assessment cancelled successfully')
      setExistingAssessment(null)
      await fetchAvailableSlots()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel assessment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-gold mx-auto"></div>
            <CalendarSolid className="h-6 w-6 text-canine-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading available dates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-amber-600 hover:text-amber-700 mb-4 inline-flex items-center font-medium group">
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>

            {/* Hero Header */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-3xl shadow-2xl p-8 mb-6 overflow-hidden"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 opacity-20"
              >
                <CalendarSolid className="h-40 w-40 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-10 -left-10 opacity-20"
              >
                <StarSolid className="h-32 w-32 text-white" />
              </motion.div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                    <CalendarDaysIcon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-display font-bold text-white">
                      Schedule Your Assessment 🎯
                    </h1>
                    <p className="text-white/90 text-lg mt-1">
                      First step to paradise - book your exclusive assessment slot
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-6 flex-wrap">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2 text-white">
                      <CurrencyPoundIcon className="h-5 w-5" />
                      <span className="font-bold text-xl">£{assessmentFee}</span>
                      <span className="text-white/80">one-time</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2 text-white">
                      <ClockIcon className="h-5 w-5" />
                      <span className="font-semibold">Multiple time slots available</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-start">
              <div className="bg-blue-500 rounded-xl p-2 mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-3">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 font-bold">•</span>
                    <span><strong>Cost:</strong> £{assessmentFee} per dog (select which dogs to assess below)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 font-bold">•</span>
                    <span><strong>When:</strong> Choose from available time slots below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 font-bold">•</span>
                    <span><strong>Limited spots:</strong> Each time slot has limited capacity - book early!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 font-bold">•</span>
                    <span><strong>Payment:</strong> Required before confirmation</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Existing Assessment */}
          {existingAssessment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-xl relative overflow-hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-8 -right-8 opacity-10"
              >
                <CheckCircleIcon className="h-32 w-32 text-green-600" />
              </motion.div>

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500 rounded-xl p-3">
                    <CheckCircleIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">Assessment Booked! 🎉</h3>
                    <p className="text-green-700 mb-3">
                      Your exclusive assessment day is scheduled for:
                    </p>
                    <div className="bg-white rounded-xl p-4 mb-3">
                      <p className="text-2xl font-bold text-green-900">
                        {new Date(existingAssessment.requested_date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-green-700">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>9:00 AM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <SparklesIcon className="h-4 w-4" />
                          <span className="capitalize">{existingAssessment.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelAssessment}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-colors"
                >
                  Cancel Booking
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Dog Selection List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Select Dogs for Assessment ({dogs.length} available)
                </h2>
              </div>
              {selectedDogIds.length > 0 && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-lg border-2 border-amber-300">
                  <p className="text-sm font-bold text-amber-900">
                    Total: £{assessmentFee * selectedDogIds.length}
                  </p>
                  <p className="text-xs text-amber-700">
                    {selectedDogIds.length} dog{selectedDogIds.length !== 1 ? 's' : ''} × £{assessmentFee}
                  </p>
                </div>
              )}
            </div>

            {dogs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-600 mb-2">All your dogs have completed their assessment!</p>
                <p className="text-sm text-gray-500">No dogs need assessment at this time.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {dogs.map((dog, index) => (
                  <motion.label
                    key={dog.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedDogIds.includes(dog.id)
                        ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400 shadow-md'
                        : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDogIds.includes(dog.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDogIds([...selectedDogIds, dog.id])
                        } else {
                          setSelectedDogIds(selectedDogIds.filter(id => id !== dog.id))
                        }
                      }}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
                    />
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg flex-shrink-0">
                      {dog.photo_url ? (
                        <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-white font-bold text-xl">{dog.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{dog.name}</p>
                      <p className="text-sm text-gray-600">{dog.breed}</p>
                      <p className="text-xs text-purple-600 font-medium mt-1">+£{assessmentFee}</p>
                    </div>
                    {selectedDogIds.includes(dog.id) && (
                      <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
                    )}
                  </motion.label>
                ))}
              </div>
            )}
          </motion.div>

          {/* Calendar View */}
          {!existingAssessment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-2">
                    <CalendarDaysIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Select Assessment Time Slot
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={previousMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-amber-600" />
                  </button>
                  <span className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                    {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-amber-600" />
                  </button>
                </div>
              </div>

              {availableSlots.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold mb-2">No assessment slots available</p>
                  <p className="text-sm">Please check back later or contact us for more information.</p>
                </div>
              ) : (
                <>
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
                </>
              )}

              {/* Book Button */}
              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-6 border-t-2 border-gray-100"
                >
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <SparklesIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-amber-900 font-semibold">
                          You're booking this time slot!
                        </p>
                        <p className="text-sm text-amber-800 mt-1">
                          {selectedDogIds.length} dog{selectedDogIds.length !== 1 ? 's' : ''} selected for assessment - Total: £{assessmentFee * selectedDogIds.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Discount Code Section */}
                  <div className="mb-6 bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <TicketIcon className="h-6 w-6 text-canine-gold" />
                      <h3 className="text-lg font-bold text-gray-900">Discount Code</h3>
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Enter discount code"
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-canine-gold focus:outline-none"
                        disabled={appliedDiscount !== null}
                      />
                      {appliedDiscount ? (
                        <button
                          onClick={() => {
                            setAppliedDiscount(null)
                            setDiscountCode('')
                            toast.success('Discount code removed')
                          }}
                          className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-bold"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={handleValidateDiscountCode}
                          disabled={validatingCode || !discountCode.trim()}
                          className="px-6 py-3 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {validatingCode ? 'Validating...' : 'Apply'}
                        </button>
                      )}
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
                              {' - '}
                              <strong>£{appliedDiscount.discountAmount.toFixed(2)} discount</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    {selectedDogIds.length > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-100">
                        <div className="space-y-2">
                          <div className="flex justify-between text-gray-700">
                            <span>Assessment Fee ({selectedDogIds.length} dog{selectedDogIds.length > 1 ? 's' : ''})</span>
                            <span>£{(assessmentFee * selectedDogIds.length).toFixed(2)}</span>
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
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6 bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'stripe'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <svg className="h-8 w-auto mb-2" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                            <path fill={paymentMethod === 'stripe' ? '#635BFF' : '#6772E5'} d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"/>
                          </svg>
                          <span className={`text-sm font-semibold ${paymentMethod === 'stripe' ? 'text-blue-600' : 'text-gray-600'}`}>
                            Card Payment
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <svg className="h-8 w-auto mb-2" viewBox="0 0 100 32" xmlns="http://www.w3.org/2000/svg">
                            <path fill={paymentMethod === 'paypal' ? '#003087' : '#0070BA'} d="M12 4.917h9.5c3.5 0 5.5 1.75 5.5 5.25 0 4.5-2.5 7.5-7 7.5h-3.5l-1 6.25h-3.5L12 4.917zM19.5 8.5h-3l-1.5 5.75h3c2 0 3.5-1 3.5-3.25 0-1.5-.75-2.5-2-2.5z"/>
                            <path fill={paymentMethod === 'paypal' ? '#0070BA' : '#003087'} d="M27 4.917h9.5c3.5 0 5.5 1.75 5.5 5.25 0 4.5-2.5 7.5-7 7.5h-3.5l-1 6.25h-3.5L27 4.917zM34.5 8.5h-3l-1.5 5.75h3c2 0 3.5-1 3.5-3.25 0-1.5-.75-2.5-2-2.5z"/>
                          </svg>
                          <span className={`text-sm font-semibold ${paymentMethod === 'paypal' ? 'text-blue-600' : 'text-gray-600'}`}>
                            PayPal
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookAssessment}
                    disabled={booking}
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 text-white py-5 rounded-xl font-bold text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      {booking ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-6 w-6 border-2 border-white border-t-transparent rounded-full"
                          />
                          Booking Your Spot...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-6 w-6" />
                          Proceed to Checkout (£{calculateTotalPrice().toFixed(2)})
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
