'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import DashboardHeader from '@/components/DashboardHeader'
import {
  CalendarDaysIcon,
  ClockIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  CurrencyPoundIcon,
  TicketIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'

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

  // Step wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

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

      setSlots(data || [])
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
          fetchAvailableSlots()
        }
      )
      .subscribe()

    return () => {
      slotsSubscription.unsubscribe()
    }
  }, [fetchAvailableSlots])

  const init = async () => {
    try {
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

      // Get user's dogs that haven't been approved yet (still need assessment)
      const { data: dogsData } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_approved', false)

      setDogs(dogsData || [])

      if (!dogsData || dogsData.length === 0) {
        // Check if user has any dogs at all
        const { data: allDogs } = await supabase
          .from('dogs')
          .select('id')
          .eq('owner_id', user.id)

        if (!allDogs || allDogs.length === 0) {
          toast.error('Please add at least one dog before booking an assessment')
          setTimeout(() => router.push('/dashboard/add-dog'), 2000)
        } else {
          // User has dogs but they're all already approved
          toast.success('All your dogs have already been assessed and approved!')
          setTimeout(() => router.push('/dashboard'), 2000)
        }
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
      const { data: agreements, error: agreementsError } = await supabase
        .from('legal_agreements')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (agreementsError) {
        console.error('Error fetching agreements:', agreementsError)
      }

      if (!agreements) {
        toast.error('Please sign all required legal agreements before booking an assessment')
        setTimeout(() => router.push('/dashboard/legal-agreements'), 2000)
        return
      }

      const allWaiversSigned = agreements.terms_accepted &&
          agreements.injury_waiver_agreed &&
          agreements.photo_permission_granted

      if (!allWaiversSigned) {
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

      toast.success(`Discount applied! You save £${discountData.toFixed(2)}`)
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please log in again')
        router.push('/login')
        return
      }

      const totalAmount = assessmentFee * selectedDogs.length
      const finalAmount = calculateTotalPrice()

      const response = await fetch('/api/create-assessment-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
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

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          toast.error(data.error || 'This slot is no longer available. Please select another time.')
          setSelectedSlot('')
          setCurrentStep(2)
          await fetchAvailableSlots()
        } else {
          throw new Error(data.error || 'Failed to create checkout session')
        }
        setBooking(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error(error.message || 'Failed to book assessment. Please try again.')
      setBooking(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Format time for display
  const formatTime = (time: string) => time.slice(0, 5)

  // Group slots by date for easier display
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.assessment_date]) {
      acc[slot.assessment_date] = []
    }
    acc[slot.assessment_date].push(slot)
    return acc
  }, {} as Record<string, AssessmentSlot[]>)

  // Get selected slot details
  const getSelectedSlotDetails = () => {
    return slots.find(s => s.id === selectedSlot)
  }

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToStep2 = selectedDogs.length > 0
  const canProceedToStep3 = selectedSlot !== ''

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-gold mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (existingBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-canine-navy mb-4">
                Assessment Already Booked
              </h1>
              <p className="text-gray-600 mb-6 text-lg">
                You already have an assessment scheduled:
              </p>
              <div className="bg-canine-cream rounded-xl p-6 mb-8">
                <p className="text-xl font-bold text-canine-navy">
                  {formatDate(existingBooking.slot.assessment_date)}
                </p>
                <p className="text-lg text-canine-gold font-semibold mt-2">
                  {formatTime(existingBooking.slot.start_time)} - {formatTime(existingBooking.slot.end_time)}
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-colors font-bold text-lg"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <DashboardHeader
            title="Book an Assessment"
            subtitle="Follow the simple steps below"
            backButtonHref="/dashboard"
            backButtonLabel="Back to Dashboard"
          />
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      currentStep >= step
                        ? 'bg-canine-gold text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step ? (
                      <CheckIcon className="h-6 w-6" />
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    currentStep >= step ? 'text-canine-navy' : 'text-gray-400'
                  }`}>
                    {step === 1 && 'Select Dogs'}
                    {step === 2 && 'Choose Date'}
                    {step === 3 && 'Confirm'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`w-12 sm:w-20 h-1 mx-2 rounded ${
                    currentStep > step ? 'bg-canine-gold' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Select Dogs */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-canine-gold/10 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-canine-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-canine-navy">
                    Which dogs need an assessment?
                  </h2>
                  <p className="text-gray-600">Tap to select your dog(s)</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {dogs.map(dog => (
                  <button
                    key={dog.id}
                    onClick={() => handleDogToggle(dog.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                      selectedDogs.includes(dog.id)
                        ? 'border-canine-gold bg-canine-gold/10'
                        : 'border-gray-200 hover:border-canine-gold/50'
                    }`}
                  >
                    {dog.photo_url ? (
                      <img
                        src={dog.photo_url}
                        alt={dog.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl">🐕</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">{dog.name}</p>
                      <p className="text-gray-500">£{assessmentFee} assessment fee</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedDogs.includes(dog.id)
                        ? 'border-canine-gold bg-canine-gold'
                        : 'border-gray-300'
                    }`}>
                      {selectedDogs.includes(dog.id) && (
                        <CheckIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedDogs.length > 0 && (
                <div className="bg-canine-cream rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      {selectedDogs.length} dog{selectedDogs.length > 1 ? 's' : ''} selected
                    </span>
                    <span className="font-bold text-canine-navy text-lg">
                      £{(assessmentFee * selectedDogs.length).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={goToNextStep}
                disabled={!canProceedToStep2}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  canProceedToStep2
                    ? 'bg-canine-gold text-white hover:bg-canine-light-gold'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Choose Date & Time */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-canine-gold/10 rounded-full flex items-center justify-center">
                  <CalendarDaysIcon className="h-6 w-6 text-canine-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-canine-navy">
                    Choose a date and time
                  </h2>
                  <p className="text-gray-600">Tap to select an available slot</p>
                </div>
              </div>

              {Object.keys(slotsByDate).length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Available Slots</h3>
                  <p className="text-gray-600">
                    There are no assessment slots available right now.<br />
                    Please check back later or contact us.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto">
                  {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                    <div key={date} className="border-b border-gray-100 pb-4 last:border-0">
                      <h3 className="font-semibold text-canine-navy mb-3 sticky top-0 bg-white py-2">
                        {formatDate(date)}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dateSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              selectedSlot === slot.id
                                ? 'border-canine-gold bg-canine-gold/10'
                                : 'border-gray-200 hover:border-canine-gold/50'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              selectedSlot === slot.id
                                ? 'bg-canine-gold'
                                : 'bg-gray-100'
                            }`}>
                              <ClockIcon className={`h-5 w-5 ${
                                selectedSlot === slot.id ? 'text-white' : 'text-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-bold text-gray-900">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </p>
                              <p className="text-sm text-green-600 font-medium">Available</p>
                            </div>
                            {selectedSlot === slot.id && (
                              <CheckCircleIcon className="h-6 w-6 text-canine-gold" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={goToPreviousStep}
                  className="flex-1 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={!canProceedToStep3}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    canProceedToStep3
                      ? 'bg-canine-gold text-white hover:bg-canine-light-gold'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Confirm & Pay */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-canine-gold/10 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-canine-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-canine-navy">
                    Review and confirm
                  </h2>
                  <p className="text-gray-600">Check everything looks correct</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-canine-cream rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-canine-navy mb-4">Your Assessment</h3>

                {/* Dogs */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Dogs</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDogs.map(dogId => {
                      const dog = dogs.find(d => d.id === dogId)
                      return dog ? (
                        <span key={dog.id} className="bg-white px-3 py-2 rounded-lg font-medium text-gray-900">
                          {dog.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Date & Time */}
                {getSelectedSlotDetails() && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Date & Time</p>
                    <div className="bg-white px-4 py-3 rounded-lg">
                      <p className="font-bold text-canine-navy">
                        {formatDate(getSelectedSlotDetails()!.assessment_date)}
                      </p>
                      <p className="text-canine-gold font-semibold">
                        {formatTime(getSelectedSlotDetails()!.start_time)} - {formatTime(getSelectedSlotDetails()!.end_time)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TicketIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Have a discount code?</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-canine-gold focus:outline-none text-lg"
                    disabled={!!appliedDiscount}
                  />
                  {appliedDiscount ? (
                    <button
                      onClick={() => {
                        setAppliedDiscount(null)
                        setDiscountCode('')
                      }}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handleValidateDiscountCode}
                      disabled={validatingCode || !discountCode.trim()}
                      className="px-6 py-3 bg-canine-gold text-white rounded-xl font-semibold hover:bg-canine-light-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {validatingCode ? '...' : 'Apply'}
                    </button>
                  )}
                </div>

                {appliedDiscount && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-800 font-medium">
                      Code "{appliedDiscount.code}" applied - saving £{appliedDiscount.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Assessment fee ({selectedDogs.length} dog{selectedDogs.length > 1 ? 's' : ''})</span>
                    <span>£{(assessmentFee * selectedDogs.length).toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>
                      <span>-£{appliedDiscount.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xl font-bold text-canine-navy">
                      <span>Total to pay</span>
                      <span>£{calculateTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={goToPreviousStep}
                  className="flex-1 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back
                </button>
                <button
                  onClick={handleBookSlot}
                  disabled={booking}
                  className="flex-1 py-4 rounded-xl font-bold text-lg bg-canine-gold text-white hover:bg-canine-light-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5" />
                      Pay Now
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                You will be redirected to our secure payment page
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
