'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  CheckCircleIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(true)
  const [success, setSuccess] = useState(false)
  const [assessmentDate, setAssessmentDate] = useState('')

  useEffect(() => {
    processAssessmentBooking()
  }, [])

  const processAssessmentBooking = async () => {
    try {
      const sessionId = searchParams.get('session_id')
      const date = searchParams.get('date')
      const slotId = searchParams.get('slot_id')
      const dogIdsParam = searchParams.get('dog_ids')

      if (!sessionId || (!date && !slotId) || !dogIdsParam) {
        toast.error('Invalid booking parameters')
        router.push('/dashboard/assessment/schedule')
        return
      }

      const dogIds = dogIdsParam.split(',')

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      // Handle slot-based or date-based booking
      if (slotId) {
        // New slot-based system
        const { data: slot } = await supabase
          .from('assessment_slots')
          .select('*')
          .eq('id', slotId)
          .single()

        if (!slot) {
          toast.error('Assessment slot not found')
          router.push('/dashboard/assessment/book-slot')
          return
        }

        // Check if bookings already exist
        const { data: existingBookings } = await supabase
          .from('assessment_bookings')
          .select('id')
          .eq('user_id', user.id)
          .eq('slot_id', slotId)
          .eq('booking_status', 'confirmed')

        if (existingBookings && existingBookings.length > 0) {
          setAssessmentDate(slot.assessment_date)
          setSuccess(true)
          setProcessing(false)
          return
        }

        // Get dog details
        const { data: dogs } = await supabase
          .from('dogs')
          .select('id, name')
          .in('id', dogIds)
          .eq('owner_id', user.id)

        if (!dogs || dogs.length === 0) {
          toast.error('Dogs not found')
          router.push('/dashboard/assessment/book-slot')
          return
        }

        // Create bookings for each dog
        const bookingPromises = dogs.map(dog =>
          supabase
            .from('assessment_bookings')
            .insert({
              slot_id: slotId,
              dog_id: dog.id,
              user_id: user.id,
              booking_status: 'confirmed',
            })
        )

        const results = await Promise.all(bookingPromises)
        const hasError = results.some(r => r.error)

        if (hasError) {
          throw new Error('Failed to create assessment bookings')
        }

        // Mark slot as booked by this user (1 user per slot)
        await supabase
          .from('assessment_slots')
          .update({
            booked_by_user_id: user.id,
            is_available: false
          })
          .eq('id', slotId)

        // Update dogs with assessment info
        await Promise.all(
          dogs.map(dog =>
            supabase
              .from('dogs')
              .update({
                assessment_date: slot.assessment_date,
                assessment_slot_id: slotId
              })
              .eq('id', dog.id)
          )
        )

        setAssessmentDate(slot.assessment_date)
        setSuccess(true)
        toast.success(`Assessment booked successfully for ${dogs.length} dog(s)!`)

        // Send confirmation email
        try {
          await fetch('/api/send-assessment-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              slotId: slotId,
              dogIds: dogs.map(d => d.id),
              amountPaid: 0, // Will be calculated from Stripe metadata if needed
            }),
          })
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
          // Don't fail the booking if email fails
        }
      } else if (date) {
        // Old date-based system (for backward compatibility)
        const { data: existingAssessments } = await supabase
          .from('assessment_schedule')
          .select('id')
          .eq('user_id', user.id)
          .eq('requested_date', date)
          .in('status', ['pending', 'confirmed'])

        if (existingAssessments && existingAssessments.length > 0) {
          setAssessmentDate(date)
          setSuccess(true)
          setProcessing(false)
          return
        }

        const { data: dogs } = await supabase
          .from('dogs')
          .select('id, name')
          .in('id', dogIds)
          .eq('owner_id', user.id)

        if (!dogs || dogs.length === 0) {
          toast.error('Dogs not found')
          router.push('/dashboard/assessment/schedule')
          return
        }

        const assessmentPromises = dogs.map(dog =>
          supabase
            .from('assessment_schedule')
            .insert({
              user_id: user.id,
              dog_id: dog.id,
              requested_date: date,
              confirmed_date: date,
              status: 'confirmed',
              staff_notes: `Assessment for ${dog.name} - ${dogs.length} dog(s) total - Paid via Stripe`,
              stripe_session_id: sessionId,
              payment_status: 'completed'
            })
        )

        const results = await Promise.all(assessmentPromises)
        const hasError = results.some(r => r.error)

        if (hasError) {
          throw new Error('Failed to create assessment records')
        }

        await Promise.all(
          dogs.map(dog =>
            supabase
              .from('dogs')
              .update({ assessment_date: date })
              .eq('id', dog.id)
          )
        )

        setAssessmentDate(date)
        setSuccess(true)
        toast.success(`Assessment booked successfully for ${dogs.length} dog(s)!`)
      }

    } catch (error: any) {
      console.error('Assessment booking error:', error)
      toast.error('Failed to confirm assessment booking. Please contact support.')
    } finally {
      setProcessing(false)
    }
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-canine-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-display font-semibold text-canine-navy">
            Processing your booking...
          </p>
        </motion.div>
      </div>
    )
  }

  if (!success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-canine-navy mb-4">
            Booking Failed
          </h1>
          <p className="text-gray-600 mb-6">
            There was an issue processing your assessment booking. Please try again or contact support.
          </p>
          <Link
            href="/dashboard/assessment/schedule"
            className="inline-flex items-center px-6 py-3 bg-canine-gold text-white rounded-xl font-semibold hover:bg-canine-light-gold transition-all"
          >
            Try Again
          </Link>
        </motion.div>
      </div>
    )
  }

  const formattedDate = new Date(assessmentDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircleIcon className="w-12 h-12 text-green-600" />
        </motion.div>

        {/* Success Message */}
        <h1 className="text-3xl font-display font-bold text-canine-navy text-center mb-4">
          Assessment Booked Successfully! 🎉
        </h1>

        <p className="text-lg text-gray-700 text-center mb-8">
          Your assessment has been confirmed and paid for.
        </p>

        {/* Assessment Details */}
        <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center space-x-3 text-white">
            <CalendarDaysIcon className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Assessment Day</p>
              <p className="text-xl font-bold">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-canine-cream rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-display font-bold text-canine-navy mb-4">
            What Happens Next?
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-canine-gold mr-3 mt-0.5 flex-shrink-0" />
              <span>You'll receive a confirmation email shortly with all the details</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-canine-gold mr-3 mt-0.5 flex-shrink-0" />
              <span>We'll send you a reminder 12 hours before your assessment</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-canine-gold mr-3 mt-0.5 flex-shrink-0" />
              <span>Bring your dog(s) to Aldenham Doggy Day Care on the scheduled day</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-canine-gold mr-3 mt-0.5 flex-shrink-0" />
              <span>After approval, you'll be able to book daycare sessions and subscriptions</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center px-6 py-4 bg-canine-gold text-white rounded-xl font-semibold hover:bg-canine-light-gold transition-all"
          >
            Go to Dashboard
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
          <Link
            href="/dashboard/assessment/view"
            className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-canine-navy text-canine-navy rounded-xl font-semibold hover:bg-canine-cream transition-all"
          >
            View Assessment Details
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function AssessmentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-canine-gold border-t-transparent"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
