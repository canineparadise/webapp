'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/DashboardHeader'
import toast from 'react-hot-toast'
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface AssessmentSlot {
  id: string
  assessment_date: string
  start_time: string
  end_time: string
  is_available: boolean
  max_dogs: number
}

interface CurrentBooking {
  slotId: string
  date: string
  startTime: string
  endTime: string
  dogNames: string[]
}

function RescheduleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slotId = searchParams.get('slotId')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<CurrentBooking | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AssessmentSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')

  useEffect(() => {
    if (slotId) {
      fetchData()
    } else {
      router.push('/dashboard/assessment/view')
    }
  }, [slotId])

  const fetchData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      // Get current booking details
      const { data: bookings } = await supabase
        .from('assessment_bookings')
        .select(`
          *,
          assessment_slots (
            id,
            assessment_date,
            start_time,
            end_time
          ),
          dogs (
            name
          )
        `)
        .eq('slot_id', slotId)
        .eq('user_id', user.id)
        .eq('booking_status', 'confirmed')

      if (!bookings || bookings.length === 0) {
        toast.error('Assessment booking not found')
        router.push('/dashboard/assessment/view')
        return
      }

      const slot = bookings[0].assessment_slots
      const dogNames = bookings.map(b => b.dogs?.name).filter(Boolean)

      setCurrentBooking({
        slotId: slotId!,
        date: slot.assessment_date,
        startTime: slot.start_time,
        endTime: slot.end_time,
        dogNames,
      })

      // Get available slots (future dates only, excluding current slot)
      const today = new Date().toISOString().split('T')[0]
      const { data: slots } = await supabase
        .from('assessment_slots')
        .select('*')
        .eq('is_available', true)
        .gte('assessment_date', today)
        .neq('id', slotId)
        .order('assessment_date', { ascending: true })
        .order('start_time', { ascending: true })

      setAvailableSlots(slots || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load reschedule options')
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!selectedSlot || !currentBooking) {
      toast.error('Please select a new date and time')
      return
    }

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Please log in to continue')
      }

      const response = await fetch('/api/client-reschedule-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          oldSlotId: currentBooking.slotId,
          newSlotId: selectedSlot,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule assessment')
      }

      toast.success(`Assessment rescheduled to ${data.newDate} at ${data.newTime}`)
      router.push('/dashboard/assessment/view')
    } catch (error: any) {
      console.error('Reschedule error:', error)
      toast.error(error.message || 'Failed to reschedule assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (time: string) => time.slice(0, 5)

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.assessment_date]) {
      acc[slot.assessment_date] = []
    }
    acc[slot.assessment_date].push(slot)
    return acc
  }, {} as Record<string, AssessmentSlot[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold"></div>
      </div>
    )
  }

  if (!currentBooking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <DashboardHeader
              title="Reschedule Assessment"
              subtitle="Choose a new date and time for your assessment"
              backButtonHref="/dashboard/assessment/view"
              backButtonLabel="Back to Assessment"
            />
          </div>

          {/* Current Booking */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">Current Assessment</h3>
                <p className="text-amber-800 mt-1">
                  <strong>{formatDate(currentBooking.date)}</strong> at {formatTime(currentBooking.startTime)} - {formatTime(currentBooking.endTime)}
                </p>
                <p className="text-amber-700 text-sm mt-1">
                  Dogs: {currentBooking.dogNames.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Available Slots */}
          {availableSlots.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Available Slots</h3>
              <p className="text-gray-600 mb-6">
                There are currently no available assessment slots. Please check back later or contact us directly.
              </p>
              <Link href="/dashboard/assessment/view">
                <button className="bg-canine-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
                  Back to Assessment
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-canine-navy mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6 text-canine-gold" />
                  Select New Date & Time
                </h2>

                <div className="space-y-6">
                  {Object.entries(slotsByDate).map(([date, slots]) => (
                    <div key={date} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <h3 className="font-medium text-canine-navy mb-3">
                        {formatDate(date)}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {slots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              selectedSlot === slot.id
                                ? 'border-canine-gold bg-canine-gold/10 text-canine-navy'
                                : 'border-gray-200 hover:border-canine-gold/50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <ClockIcon className="h-4 w-4" />
                              <span className="font-medium">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </span>
                            </div>
                            {selectedSlot === slot.id && (
                              <CheckCircleIcon className="h-5 w-5 text-canine-gold mx-auto mt-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <Link href="/dashboard/assessment/view">
                  <button className="text-gray-600 hover:text-gray-800 font-medium">
                    Cancel
                  </button>
                </Link>

                <button
                  onClick={handleReschedule}
                  disabled={!selectedSlot || submitting}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                    selectedSlot && !submitting
                      ? 'bg-canine-gold text-white hover:bg-canine-light-gold'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Rescheduling...
                    </>
                  ) : (
                    <>
                      Confirm Reschedule
                      <ArrowRightIcon className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function RescheduleAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold"></div>
      </div>
    }>
      <RescheduleContent />
    </Suspense>
  )
}
