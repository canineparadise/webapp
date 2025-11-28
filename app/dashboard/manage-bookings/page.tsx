'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import toast from 'react-hot-toast'
import BackButton from '@/components/BackButton'
import {
  CalendarIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'

interface Booking {
  id: string
  booking_date: string
  session_type: string
  status: string
  dog_id?: string
  user_id: string
  created_at: string
  cancelled_at?: string
  cancellation_reason?: string
  refund_status?: string
  amount?: number
  payment_method?: string
  check_in_time?: string
  check_out_time?: string
  dogs?: {
    id: string
    name: string
    breed: string
    photo_url?: string
  }
  booking_type: 'subscription' | 'individual_day'
}

interface Credit {
  id: string
  amount: number
  reason: string
  is_used: boolean
  created_at: string
  original_booking_date?: string
}

export default function ManageBookingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [pastBookings, setPastBookings] = useState<Booking[]>([])
  const [credits, setCredits] = useState<Credit[]>([])
  const [totalCredits, setTotalCredits] = useState(0)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'subscription'>('upcoming')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [cancellationAction, setCancellationAction] = useState<'refund' | 'credit' | ''>('')
  const [cancellationReason, setCancellationReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*, subscription_tiers:tier_id(name, price_per_day)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      setSubscription(subData)

      // Fetch all bookings
      const today = new Date().toISOString().split('T')[0]

      // Subscription bookings
      const { data: subscriptionBookings } = await supabase
        .from('bookings')
        .select('*, dogs:dog_id(id, name, breed, photo_url)')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })

      // Individual day bookings
      const { data: individualBookings } = await supabase
        .from('individual_day_bookings')
        .select('*, dogs:dog_id(id, name, breed, photo_url)')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })

      // Combine and categorize bookings
      const allBookings: Booking[] = [
        ...(subscriptionBookings || []).map(b => ({ ...b, booking_type: 'subscription' as const })),
        ...(individualBookings || []).map(b => ({ ...b, booking_type: 'individual_day' as const }))
      ]

      const upcoming = allBookings.filter(b =>
        b.booking_date >= today &&
        b.status === 'confirmed' &&
        !b.cancelled_at
      ).sort((a, b) => a.booking_date.localeCompare(b.booking_date))

      const past = allBookings.filter(b =>
        b.booking_date < today ||
        b.status === 'cancelled' ||
        b.cancelled_at
      ).sort((a, b) => b.booking_date.localeCompare(a.booking_date))

      setUpcomingBookings(upcoming)
      setPastBookings(past)

      // Fetch credits
      const { data: creditsData } = await supabase
        .from('booking_credits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_used', false)
        .order('created_at', { ascending: false })

      setCredits(creditsData || [])
      const total = (creditsData || []).reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0)
      setTotalCredits(total)

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const canCancelBooking = (booking: Booking): boolean => {
    const bookingDate = new Date(booking.booking_date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return bookingDate > tomorrow && booking.status === 'confirmed' && !booking.cancelled_at
  }

  const handleCancelClick = (booking: Booking) => {
    if (!canCancelBooking(booking)) {
      toast.error('Bookings can only be cancelled more than 24 hours in advance')
      return
    }
    setSelectedBooking(booking)
    setShowCancelModal(true)
    setCancellationAction('')
    setCancellationReason('')
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    if (selectedBooking.booking_type === 'individual_day' && !cancellationAction) {
      toast.error('Please select refund or credit option')
      return
    }

    setProcessing(true)

    try {
      const tableName = selectedBooking.booking_type === 'subscription' ? 'bookings' : 'individual_day_bookings'

      // Update booking status
      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancellationReason || 'User requested cancellation',
          refund_status: selectedBooking.booking_type === 'individual_day'
            ? (cancellationAction === 'refund' ? 'requested' : 'credited')
            : 'none'
        })
        .eq('id', selectedBooking.id)

      if (updateError) throw updateError

      // Handle subscription booking - return day to days_remaining
      if (selectedBooking.booking_type === 'subscription' && subscription) {
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            days_remaining: subscription.days_remaining + 1,
            days_used: Math.max(0, subscription.days_used - 1)
          })
          .eq('id', subscription.id)

        if (subError) throw subError
      }

      // Handle individual booking cancellation
      if (selectedBooking.booking_type === 'individual_day') {
        if (cancellationAction === 'credit') {
          // Create credit
          const { error: creditError } = await supabase
            .from('booking_credits')
            .insert({
              user_id: user.id,
              amount: selectedBooking.amount || 0,
              original_booking_id: selectedBooking.id,
              original_booking_date: selectedBooking.booking_date,
              reason: `Cancelled booking for ${new Date(selectedBooking.booking_date).toLocaleDateString()}`,
              is_used: false
            })

          if (creditError) throw creditError

          toast.success('Booking cancelled and credit added to your account')
        } else if (cancellationAction === 'refund') {
          // Create refund request
          const { error: refundError } = await supabase
            .from('refund_requests')
            .insert({
              user_id: user.id,
              booking_id: selectedBooking.id,
              booking_type: 'individual_day',
              booking_date: selectedBooking.booking_date,
              amount: selectedBooking.amount || 0,
              dog_id: selectedBooking.dog_id,
              payment_method: selectedBooking.payment_method || 'unknown',
              status: 'pending',
              reason: cancellationReason || 'User requested cancellation'
            })

          if (refundError) throw refundError

          toast.success('Booking cancelled and refund request submitted')
        }
      } else {
        toast.success('Booking cancelled - day returned to your subscription')
      }

      setShowCancelModal(false)
      setSelectedBooking(null)
      fetchData() // Refresh data

    } catch (error: any) {
      console.error('Error cancelling booking:', error)
      toast.error(error.message || 'Failed to cancel booking')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canine-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <BackButton href="/dashboard" />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">Manage Bookings</h1>
          <p className="text-gray-600">Cancel, reschedule, and manage your daycare bookings</p>
        </div>
        {/* Credits Banner */}
        {totalCredits > 0 && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <BanknotesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Account Credits</h3>
                  <p className="text-sm text-gray-600">Available to use on future bookings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCredits)}</p>
                <p className="text-sm text-gray-600">{credits.length} credit{credits.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 px-4 font-semibold transition-colors relative ${
                activeTab === 'upcoming'
                  ? 'text-canine-navy border-b-2 border-canine-navy'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming Bookings
              {upcomingBookings.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-canine-gold text-white rounded-full">
                  {upcomingBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'past'
                  ? 'text-canine-navy border-b-2 border-canine-navy'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Past Bookings
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'subscription'
                  ? 'text-canine-navy border-b-2 border-canine-navy'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Subscription
            </button>
          </div>
        </div>

        {/* Upcoming Bookings Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
                <p className="text-gray-600 mb-4">You don't have any upcoming daycare bookings</p>
                <Link
                  href="/dashboard/booking"
                  className="inline-block px-6 py-2 bg-canine-gold text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Book Days
                </Link>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {booking.dogs?.photo_url && (
                        <img
                          src={booking.dogs.photo_url}
                          alt={booking.dogs.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.dogs?.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            booking.booking_type === 'subscription'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {booking.booking_type === 'subscription' ? 'Subscription' : 'Individual Day'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(booking.booking_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            <span className="capitalize">{booking.session_type.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {canCancelBooking(booking) ? (
                        <button
                          onClick={() => handleCancelClick(booking)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors text-sm font-medium"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-500">
                          <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                          Cannot cancel
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Past Bookings Tab */}
        {activeTab === 'past' && (
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No past bookings</h3>
                <p className="text-gray-600">Your booking history will appear here</p>
              </div>
            ) : (
              pastBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {booking.dogs?.photo_url && (
                        <img
                          src={booking.dogs.photo_url}
                          alt={booking.dogs.name}
                          className="w-16 h-16 rounded-full object-cover grayscale"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.dogs?.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            booking.cancelled_at
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.cancelled_at ? 'Cancelled' : 'Completed'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(booking.booking_date)}</span>
                          </div>
                          {booking.cancelled_at && booking.cancellation_reason && (
                            <p className="text-xs text-gray-500 italic">Reason: {booking.cancellation_reason}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {subscription ? (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
                      <p className="text-3xl font-bold text-canine-navy">{subscription.days_remaining}</p>
                      <p className="text-xs text-gray-500">out of {subscription.days_included} days/month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Monthly Price</p>
                      <p className="text-3xl font-bold text-canine-navy">{formatCurrency(subscription.monthly_price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Next Billing</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(subscription.next_billing_date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Link
                      href="/dashboard/subscriptions"
                      className="px-6 py-2 bg-canine-navy text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      Upgrade Subscription
                    </Link>
                    <Link
                      href="/dashboard/subscriptions"
                      className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel Subscription
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                <p className="text-gray-600 mb-4">Subscribe to get regular daycare days at a discounted rate</p>
                <Link
                  href="/dashboard/subscriptions"
                  className="inline-block px-6 py-2 bg-canine-gold text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  View Subscription Plans
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancel Booking</h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Booking Date</p>
              <p className="font-semibold text-gray-900">{formatDate(selectedBooking.booking_date)}</p>
              <p className="text-sm text-gray-600 mt-2">Dog</p>
              <p className="font-semibold text-gray-900">{selectedBooking.dogs?.name}</p>
            </div>

            {selectedBooking.booking_type === 'individual_day' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to do?
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setCancellationAction('credit')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      cancellationAction === 'credit'
                        ? 'border-canine-gold bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BanknotesIcon className="h-6 w-6 text-canine-gold" />
                      <div>
                        <p className="font-semibold text-gray-900">Credit My Account</p>
                        <p className="text-sm text-gray-600">Use the credit for future bookings</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setCancellationAction('refund')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      cancellationAction === 'refund'
                        ? 'border-canine-gold bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCardIcon className="h-6 w-6 text-canine-gold" />
                      <div>
                        <p className="font-semibold text-gray-900">Request Refund</p>
                        <p className="text-sm text-gray-600">Submit refund request to admin</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {selectedBooking.booking_type === 'subscription' && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                  The day will be returned to your subscription days remaining for this month.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-canine-gold"
                rows={3}
                placeholder="Let us know why you're cancelling..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedBooking(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={processing}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={processing || (selectedBooking.booking_type === 'individual_day' && !cancellationAction)}
              >
                {processing ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
