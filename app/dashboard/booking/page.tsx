'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function BookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dogs, setDogs] = useState<any[]>([])
  const [selectedDogs, setSelectedDogs] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [subscription, setSubscription] = useState<any>(null)
  const [bookedDates, setBookedDates] = useState<string[]>([])

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Load dogs (all dogs, not just approved)
      const { data: dogsData } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', user.id)

      setDogs(dogsData || [])

      // Load subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      setSubscription(subData)

      // Load existing bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('booking_date')
        .eq('user_id', user.id)
        .gte('booking_date', new Date().toISOString().split('T')[0])

      const booked = bookingsData?.map(b => b.booking_date) || []
      setBookedDates(booked)

    } catch (error) {
      console.error('Error loading data:', error)
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

  const isDateAvailable = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if date is in the past
    if (date < today) return false

    // Check if it's a weekend
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return false

    // Check if already booked
    if (bookedDates.includes(dateString)) return false

    return true
  }

  const toggleDate = (dateString: string) => {
    if (!isDateAvailable(dateString)) return

    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(d => d !== dateString))
    } else {
      setSelectedDates([...selectedDates, dateString])
    }
  }

  const toggleDog = (dogId: string) => {
    if (selectedDogs.includes(dogId)) {
      setSelectedDogs(selectedDogs.filter(id => id !== dogId))
    } else {
      setSelectedDogs([...selectedDogs, dogId])
    }
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleSubmit = async () => {
    if (selectedDogs.length === 0) {
      toast.error('Please select at least one dog')
      return
    }

    if (selectedDates.length === 0) {
      toast.error('Please select at least one date')
      return
    }

    if (!subscription) {
      toast.error('You need an active subscription to book days')
      return
    }

    // Check if user has enough days remaining
    const daysRemaining = subscription.days_remaining || 0
    if (selectedDates.length > daysRemaining) {
      toast.error(`You only have ${daysRemaining} days remaining in your subscription`)
      return
    }

    setSubmitting(true)

    try {
      // Create bookings for each selected date
      const bookings = selectedDates.map(date => ({
        user_id: user.id,
        dog_ids: selectedDogs,
        booking_date: date,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }))

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert(bookings)

      if (bookingError) throw bookingError

      // Update subscription days remaining
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          days_remaining: daysRemaining - selectedDates.length,
          days_used: (subscription.days_used || 0) + selectedDates.length
        })
        .eq('id', subscription.id)

      if (subError) throw subError

      toast.success(`Successfully booked ${selectedDates.length} day${selectedDates.length > 1 ? 's' : ''}! 🎉`)

      // Refresh data
      setSelectedDates([])
      setSelectedDogs([])
      checkAuthAndLoadData()

    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error('Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canine-cream to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-canine-gold border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading booking calendar...</p>
        </div>
      </div>
    )
  }

  const hasApprovedDogs = dogs.some(dog => dog.is_approved)
  const canBook = hasApprovedDogs && subscription

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysRemaining = subscription.days_remaining || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-12">
      <div className="max-w-6xl mx-auto px-4">

        <Link href="/dashboard" className="inline-flex items-center text-canine-gold hover:text-canine-navy mb-8 font-medium transition-colors group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Warning Banners */}
        {!canBook && (
          <div className="mb-8 space-y-4">
            {dogs.length === 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-amber-900">Add Your Dog First</h3>
                    <p className="text-amber-700 mt-1">You need to register at least one dog before booking daycare days.</p>
                    <Link href="/dashboard/add-dog" className="mt-3 inline-block btn-primary">
                      Add Your First Dog
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {dogs.length > 0 && !hasApprovedDogs && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-blue-900">Dog Approval Pending</h3>
                    <p className="text-blue-700 mt-1">Your dog needs to be approved before you can purchase a subscription and book daycare days. We'll review your dog's profile and approve them soon!</p>
                  </div>
                </div>
              </div>
            )}

            {hasApprovedDogs && !subscription && (
              <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-purple-900">Purchase a Subscription</h3>
                    <p className="text-purple-700 mt-1">You need an active subscription to book daycare days. Choose a plan that works for you!</p>
                    <Link href="/dashboard/subscriptions" className="mt-3 inline-block btn-primary">
                      View Subscription Plans
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-display font-bold text-canine-navy flex items-center gap-3">
                  <CalendarIcon className="h-8 w-8 text-canine-gold" />
                  Book Daycare Days
                </h1>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-canine-navy to-blue-900 text-white rounded-xl p-4">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold">{monthName}</h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square"></div>
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const isAvailable = isDateAvailable(dateString)
                    const isSelected = selectedDates.includes(dateString)
                    const isBooked = bookedDates.includes(dateString)
                    const date = new Date(dateString)
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6

                    return (
                      <motion.button
                        key={day}
                        type="button"
                        whileHover={isAvailable && canBook ? { scale: 1.05 } : {}}
                        whileTap={isAvailable && canBook ? { scale: 0.95 } : {}}
                        onClick={() => canBook && toggleDate(dateString)}
                        disabled={!isAvailable || !canBook}
                        className={`aspect-square rounded-xl flex items-center justify-center font-semibold text-lg transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-canine-gold to-amber-400 text-white shadow-lg ring-4 ring-canine-gold/30'
                            : isBooked
                            ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                            : isWeekend
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isAvailable && canBook
                            ? 'bg-gray-50 hover:bg-canine-sky text-gray-700 border-2 border-gray-200 hover:border-canine-gold'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {day}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-canine-gold to-amber-400"></div>
                  <span className="text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100"></div>
                  <span className="text-gray-600">Already Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-100"></div>
                  <span className="text-gray-600">Unavailable</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Selection Summary */}
          <div className="space-y-6">
            {/* Subscription Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-canine-navy to-blue-900 text-white rounded-3xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold mb-4">
                {subscription ? 'Your Subscription' : 'Subscription Required'}
              </h3>
              {subscription ? (
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="text-sm text-blue-200 mb-1">Plan</p>
                    <p className="text-2xl font-bold">{subscription.tier_name}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="text-sm text-blue-200 mb-1">Days Remaining</p>
                    <p className="text-3xl font-bold">{daysRemaining}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="text-sm text-blue-200 mb-1">Days Selected</p>
                    <p className="text-3xl font-bold text-canine-gold">{selectedDates.length}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-blue-100 mb-4">Purchase a subscription to start booking daycare days!</p>
                  <Link href="/dashboard/subscriptions" className="btn-primary bg-canine-gold hover:bg-canine-light-gold">
                    View Plans
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Select Dogs */}
            {dogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-xl p-6"
              >
                <h3 className="text-xl font-bold text-canine-navy mb-4">Select Dogs</h3>
                {hasApprovedDogs ? (
                  <div className="space-y-3">
                    {dogs.filter(dog => dog.is_approved).map(dog => (
                      <label
                        key={dog.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          canBook
                            ? `cursor-pointer ${selectedDogs.includes(dog.id)
                                ? 'border-canine-gold bg-canine-gold/10'
                                : 'border-gray-200 hover:border-canine-gold/50'
                              }`
                            : 'cursor-not-allowed border-gray-200 opacity-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDogs.includes(dog.id)}
                          onChange={() => canBook && toggleDog(dog.id)}
                          disabled={!canBook}
                          className="w-5 h-5 text-canine-gold focus:ring-canine-gold rounded disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{dog.name}</p>
                          <p className="text-sm text-gray-600">{dog.breed}</p>
                        </div>
                        {selectedDogs.includes(dog.id) && (
                          <CheckCircleIcon className="h-6 w-6 text-canine-gold" />
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-blue-700 text-sm">
                      No approved dogs yet. Your dogs will appear here once approved!
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Selected Dates Summary */}
            {selectedDates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl p-6"
              >
                <h3 className="text-xl font-bold text-canine-navy mb-4">Selected Dates</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedDates.sort().map(date => (
                    <div
                      key={date}
                      className="flex items-center justify-between bg-canine-sky p-3 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <button
                        onClick={() => toggleDate(date)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Book Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedDates.length === 0 || selectedDogs.length === 0}
              className="w-full bg-gradient-to-r from-canine-gold to-amber-400 hover:from-canine-light-gold hover:to-amber-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-6 w-6" />
                  Confirm Booking ({selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
