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
  const [availableFridays, setAvailableFridays] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [existingAssessment, setExistingAssessment] = useState<any>(null)

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

      // Check if user already has an assessment scheduled
      const { data: existingData } = await supabase
        .from('assessment_schedule')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .single()

      if (existingData) {
        setExistingAssessment(existingData)
      }

      // Generate next 8 Fridays
      await generateFridays(user.id)
    } catch (error) {
      console.error('Init error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateFridays = async (userId: string) => {
    const fridays = []
    const today = new Date()
    let currentDate = new Date(today)

    // Find next Friday
    const daysUntilFriday = (5 - currentDate.getDay() + 7) % 7
    currentDate.setDate(currentDate.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday))

    // Generate 8 Fridays
    for (let i = 0; i < 8; i++) {
      const dateStr = currentDate.toISOString().split('T')[0]

      // Check if this Friday is already booked by another user
      const { data: bookings } = await supabase
        .from('assessment_schedule')
        .select('id, user_id')
        .eq('requested_date', dateStr)
        .in('status', ['pending', 'confirmed'])

      const isBooked = bookings && bookings.length > 0 && !bookings.some(b => b.user_id === userId)
      const isMyBooking = bookings && bookings.some(b => b.user_id === userId)

      fridays.push({
        date: dateStr,
        display: currentDate.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        available: !isBooked,
        isMyBooking,
        bookedBy: isBooked ? 'another user' : null
      })

      // Move to next Friday
      currentDate.setDate(currentDate.getDate() + 7)
    }

    setAvailableFridays(fridays)
  }

  const handleBookAssessment = async () => {
    if (!selectedDate) {
      toast.error('Please select a Friday')
      return
    }

    if (!user || dogs.length === 0) {
      toast.error('Invalid booking data')
      return
    }

    setBooking(true)

    try {
      // Double-check availability
      const { data: existingBookings } = await supabase
        .from('assessment_schedule')
        .select('id, user_id')
        .eq('requested_date', selectedDate)
        .in('status', ['pending', 'confirmed'])

      if (existingBookings && existingBookings.length > 0 && !existingBookings.some(b => b.user_id === user.id)) {
        toast.error('Sorry, this date has just been booked by someone else. Please select another Friday.')
        await generateFridays(user.id) // Refresh
        return
      }

      // Book all user's dogs for this assessment
      const assessmentPromises = dogs.map(dog =>
        supabase
          .from('assessment_schedule')
          .insert({
            user_id: user.id,
            dog_id: dog.id,
            requested_date: selectedDate,
            status: 'pending',
            notes: `Assessment for ${dog.name} - ${dogs.length} dog(s) total`
          })
      )

      const results = await Promise.all(assessmentPromises)
      const hasError = results.some(r => r.error)

      if (hasError) {
        throw new Error('Failed to book assessment for one or more dogs')
      }

      toast.success(`Assessment booked for ${selectedDate}! We'll see ${dogs.length} dog(s) on this day.`)

      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error(error.message || 'Failed to book assessment')
    } finally {
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
      await generateFridays(user.id)
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
                      <span className="font-bold text-xl">£40</span>
                      <span className="text-white/80">one-time</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2 text-white">
                      <ClockIcon className="h-5 w-5" />
                      <span className="font-semibold">9:00 AM Start</span>
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
                    <span><strong>Cost:</strong> £40 one-time assessment fee (all your dogs together)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 font-bold">•</span>
                    <span><strong>When:</strong> 9:00 AM start time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 font-bold">•</span>
                    <span><strong>Exclusive:</strong> Only ONE client per day - you get our full attention!</span>
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

          {/* Dog List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Your Pups for Assessment ({dogs.length})
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {dogs.map((dog, index) => (
                <motion.div
                  key={dog.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                    {dog.photo_url ? (
                      <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-white font-bold text-xl">{dog.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{dog.name}</p>
                    <p className="text-sm text-gray-600">{dog.breed}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Available Fridays */}
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
                  Select Your Friday
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {availableFridays.map((friday, index) => (
                  <motion.div
                    key={friday.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={friday.available ? { scale: 1.03, y: -4 } : {}}
                    whileTap={friday.available ? { scale: 0.98 } : {}}
                    onClick={() => friday.available && setSelectedDate(friday.date)}
                    className={`
                      p-5 rounded-xl border-2 cursor-pointer transition-all shadow-lg relative overflow-hidden
                      ${selectedDate === friday.date
                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl'
                        : friday.available
                          ? 'border-gray-200 hover:border-amber-400 bg-white hover:shadow-xl'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                      }
                    `}
                  >
                    {selectedDate === friday.date && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-8 -right-8 opacity-10"
                      >
                        <CheckCircleIcon className="h-24 w-24 text-amber-500" />
                      </motion.div>
                    )}

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className={`h-6 w-6 ${friday.available ? 'text-amber-500' : 'text-gray-400'}`} />
                          <span className="font-bold text-gray-900">{friday.display.split(',')[0]}</span>
                        </div>
                        {friday.available ? (
                          <div className="bg-green-100 rounded-full p-1">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="bg-red-100 rounded-full p-1">
                            <XCircleIcon className="h-5 w-5 text-red-600" />
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{friday.display.split(',').slice(1).join(',')}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <ClockIcon className="h-4 w-4" />
                        <span>9:00 AM</span>
                      </div>

                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        friday.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {friday.available ? '✓ Available' : '✗ Fully Booked'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Book Button */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-6 border-t-2 border-gray-100"
                >
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <SparklesIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-900 font-semibold">
                          You're reserving the entire day!
                        </p>
                        <p className="text-sm text-amber-800 mt-1">
                          All {dogs.length} of your dog(s) will be assessed together on this exclusive assessment day.
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
                          Confirm Assessment Booking 🎉
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
