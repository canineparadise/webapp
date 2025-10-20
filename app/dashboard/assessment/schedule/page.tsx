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

      // Filter to only show slots that are not booked (booked_by_user_id is null)
      const availableSlots = slots || []

      setAvailableSlots(availableSlots)
    } catch (error) {
      console.error('Error fetching slots:', error)
      toast.error('Failed to load available assessment slots')
    }
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

      // Create Stripe checkout session for assessment payment (£40 per dog)
      const response = await fetch('/api/create-assessment-checkout', {
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error('No checkout URL returned')
      }

      // Redirect to Stripe checkout
      window.location.href = url

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

          {/* Available Slots */}
          {!existingAssessment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-2">
                  <CalendarDaysIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Select Assessment Time Slot
                </h2>
              </div>

              {availableSlots.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold mb-2">No assessment slots available</p>
                  <p className="text-sm">Please check back later or contact us for more information.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    availableSlots.reduce((acc: any, slot: any) => {
                      if (!acc[slot.assessment_date]) {
                        acc[slot.assessment_date] = []
                      }
                      acc[slot.assessment_date].push(slot)
                      return acc
                    }, {})
                  ).map(([date, dateSlots]: [string, any], dateIndex) => (
                    <div key={date} className="border-2 border-gray-100 rounded-xl p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <CalendarDaysIcon className="h-5 w-5 text-amber-500" />
                        {new Date(date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {dateSlots.map((slot: any, index: number) => (
                          <motion.div
                            key={slot.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + dateIndex * 0.1 + index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`
                              p-4 rounded-xl border-2 cursor-pointer transition-all shadow relative overflow-hidden
                              ${selectedSlot === slot.id
                                ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg'
                                : 'border-gray-200 hover:border-amber-400 bg-white hover:shadow-md'
                              }
                            `}
                          >
                            {selectedSlot === slot.id && (
                              <div className="absolute top-2 right-2">
                                <CheckCircleIcon className="h-6 w-6 text-amber-500" />
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-5 w-5 text-amber-500" />
                              <span className="font-bold text-gray-900">
                                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                          Proceed to Checkout (£{assessmentFee * selectedDogIds.length})
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
