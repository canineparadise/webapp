'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  ArrowLeftIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  booking_date: string
  session_type: 'full_day' | 'half_day'
  session_start_time: string
  session_end_time: string
  checked_in: boolean
  checked_out: boolean
  checked_in_at: string | null
  checked_out_at: string | null
  dog_ids: string[]
  total_dogs: number
  user_id: string
  profiles: {
    first_name: string
    last_name: string
    phone: string
    email: string
  }
  dogs: Array<{
    id: string
    name: string
    breed: string
    photo_url?: string
  }>
}

export default function CheckInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [staffId, setStaffId] = useState<string>('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [checkOutNotes, setCheckOutNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (staffId) {
      fetchBookings()
    }
  }, [selectedDate, staffId])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is staff or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
      router.push('/dashboard')
      return
    }

    setStaffId(user.id)
  }

  const fetchBookings = async () => {
    setLoading(true)
    try {
      // Fetch today's bookings
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (first_name, last_name, phone, email)
        `)
        .eq('booking_date', selectedDate)
        .in('status', ['confirmed', 'checked_in', 'completed'])
        .order('session_start_time', { ascending: true })

      if (error) throw error

      // Fetch dog details for each booking
      const bookingsWithDogs = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: dogsData } = await supabase
            .from('dogs')
            .select('id, name, breed, photo_url')
            .in('id', booking.dog_ids)

          return {
            ...booking,
            dogs: dogsData || []
          }
        })
      )

      setBookings(bookingsWithDogs)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (bookingId: string) => {
    setProcessing(true)
    try {
      const { data, error } = await supabase.rpc('check_in_dog', {
        p_booking_id: bookingId,
        p_staff_id: staffId
      })

      if (error) throw error

      if (data.success) {
        toast.success(data.message)
        fetchBookings() // Refresh
      } else {
        toast.error(data.error)
      }
    } catch (error: any) {
      console.error('Check-in error:', error)
      toast.error(error.message || 'Failed to check in')
    } finally {
      setProcessing(false)
    }
  }

  const openCheckOutModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setCheckOutNotes('')
    setShowCheckOutModal(true)
  }

  const handleCheckOut = async () => {
    if (!selectedBooking) return

    setProcessing(true)
    try {
      const { data, error } = await supabase.rpc('check_out_dog', {
        p_booking_id: selectedBooking.id,
        p_staff_id: staffId,
        p_notes: checkOutNotes || null
      })

      if (error) throw error

      if (data.success) {
        toast.success(data.message)
        setShowCheckOutModal(false)
        setSelectedBooking(null)
        setCheckOutNotes('')
        fetchBookings() // Refresh
      } else {
        toast.error(data.error)
      }
    } catch (error: any) {
      console.error('Check-out error:', error)
      toast.error(error.message || 'Failed to check out')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (booking: Booking) => {
    if (booking.checked_out) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
          <CheckCircleIcon className="h-4 w-4" />
          Completed
        </span>
      )
    } else if (booking.checked_in) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          <CheckCircleIcon className="h-4 w-4" />
          Present
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
          <ClockIcon className="h-4 w-4" />
          Pending
        </span>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canine-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-navy mx-auto mb-4"></div>
          <p className="text-canine-navy font-display text-xl">Loading check-in data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canine-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link href="/staff/dashboard" className="inline-flex items-center text-canine-sky hover:text-white mb-2">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-display font-bold">Daily Check-In / Check-Out</h1>
              <p className="text-canine-sky mt-1">Manage dog arrivals and departures</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white font-semibold outline-none focus:border-canine-gold"
              />
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                <p className="text-sm text-canine-sky">Total Dogs</p>
                <p className="text-3xl font-bold">{bookings.reduce((sum, b) => sum + b.total_dogs, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-canine-navy mb-2">No Bookings</h2>
            <p className="text-gray-600">No dogs are scheduled for {new Date(selectedDate).toLocaleDateString()}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-canine-navy">
                            {booking.profiles.first_name} {booking.profiles.last_name}
                          </h3>
                          {getStatusBadge(booking)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <PhoneIcon className="h-4 w-4" />
                            {booking.profiles.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            {booking.session_type === 'full_day' ? (
                              <>
                                <SunIcon className="h-4 w-4" />
                                Full Day ({booking.session_start_time} - {booking.session_end_time})
                              </>
                            ) : (
                              <>
                                <ClockIcon className="h-4 w-4" />
                                Half Day ({booking.session_start_time} - {booking.session_end_time})
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!booking.checked_in && (
                        <button
                          onClick={() => handleCheckIn(booking.id)}
                          disabled={processing}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                          Check In
                        </button>
                      )}

                      {booking.checked_in && !booking.checked_out && (
                        <button
                          onClick={() => openCheckOutModal(booking)}
                          disabled={processing}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                          Check Out
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dogs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    {booking.dogs.map((dog) => (
                      <div key={dog.id} className="bg-canine-cream rounded-lg p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-canine-sky overflow-hidden flex-shrink-0">
                          {dog.photo_url ? (
                            <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xl">🐕</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-canine-navy">{dog.name}</p>
                          <p className="text-xs text-gray-600">{dog.breed}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Check-in/out times */}
                  {(booking.checked_in_at || booking.checked_out_at) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-6 text-sm">
                      {booking.checked_in_at && (
                        <div>
                          <span className="text-gray-600">Checked In:</span>
                          <span className="ml-2 font-semibold text-green-700">
                            {new Date(booking.checked_in_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      {booking.checked_out_at && (
                        <div>
                          <span className="text-gray-600">Checked Out:</span>
                          <span className="ml-2 font-semibold text-blue-700">
                            {new Date(booking.checked_out_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Check-Out Modal */}
      {showCheckOutModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-canine-navy mb-4">Check Out</h2>
            <p className="text-gray-600 mb-4">
              Checking out <strong>{selectedBooking.profiles.first_name} {selectedBooking.profiles.last_name}</strong>
            </p>

            <div className="mb-4">
              <p className="font-semibold text-gray-700 mb-2">Dogs:</p>
              <div className="space-y-1">
                {selectedBooking.dogs.map(dog => (
                  <div key={dog.id} className="text-sm text-gray-600">• {dog.name}</div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes about today (optional)
              </label>
              <textarea
                value={checkOutNotes}
                onChange={(e) => setCheckOutNotes(e.target.value)}
                placeholder="How was the dog today? Any incidents or special notes?"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-canine-gold focus:ring-2 focus:ring-canine-gold/20 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckOutModal(false)}
                disabled={processing}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOut}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Check-Out'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
