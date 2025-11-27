'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  UserIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CameraIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackButton from '@/components/BackButton'

type ViewType = 'calendar' | 'approvals'

interface AssessmentBooking {
  id: string
  user_id: string
  slot_id: string
  dog_ids: string[]
  booking_date: string
  start_time: string
  end_time: string
  status: string
  created_at: string
  profiles: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    address: string
    city: string
    postcode: string
    approval_status: string
  }
  dogs: {
    id: string
    name: string
    breed: string
    age_years: number
    age_months: number
    gender: string
    size: string
    weight: number
    photo_url: string
    energy_level: string
    good_with_dogs: boolean
    good_with_puppies: boolean
    good_with_people: boolean
    medical_conditions: string
    medications: string
    allergies: string
    behavioral_notes: string
    special_instructions: string
    is_approved: boolean
    assessment_completed: boolean
    assessment_notes: string
  }[]
}

export default function StaffAssessmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewType>('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [assessmentBookings, setAssessmentBookings] = useState<AssessmentBooking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<AssessmentBooking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [declineNotes, setDeclineNotes] = useState('')
  const [processingApproval, setProcessingApproval] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchAssessments()
    }
  }, [currentMonth, loading])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'staff' && profile?.role !== 'admin') {
      router.push('/dashboard')
      toast.error('Access denied: Staff only')
      return
    }

    setLoading(false)
  }

  const fetchAssessments = async () => {
    try {
      // Fetch all assessment bookings with user and dog details
      const { data, error } = await supabase
        .from('assessment_bookings')
        .select(`
          id,
          user_id,
          slot_id,
          dog_ids,
          booking_date,
          start_time,
          end_time,
          status,
          created_at,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            postcode,
            approval_status
          )
        `)
        .eq('status', 'confirmed')
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) {
        console.error('Error fetching assessments:', error)
        return
      }

      // Fetch dogs for each booking
      const bookingsWithDogs = await Promise.all(
        (data || []).map(async (booking: any) => {
          if (!booking.dog_ids || booking.dog_ids.length === 0) {
            return { ...booking, dogs: [] }
          }

          const { data: dogs } = await supabase
            .from('dogs')
            .select('*')
            .in('id', booking.dog_ids)

          return { ...booking, dogs: dogs || [] }
        })
      )

      setAssessmentBookings(bookingsWithDogs)
    } catch (error) {
      console.error('Error fetching assessments:', error)
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

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return assessmentBookings.filter(booking => booking.booking_date === dateStr)
  }

  const isPastAssessment = (booking: AssessmentBooking) => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.end_time}`)
    return bookingDateTime < new Date()
  }

  const handleViewBooking = (booking: AssessmentBooking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  const handleApproveClick = (booking: AssessmentBooking) => {
    setSelectedBooking(booking)
    setShowApprovalModal(true)
  }

  const handleApproveAll = async () => {
    if (!selectedBooking) return

    setProcessingApproval(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Approve all dogs
      for (const dog of selectedBooking.dogs) {
        const { error: dogError } = await supabase
          .from('dogs')
          .update({
            is_approved: true,
            assessment_completed: true,
            assessment_notes: approvalNotes || 'Approved for daycare'
          })
          .eq('id', dog.id)

        if (dogError) {
          console.error('Error approving dog:', dogError)
          toast.error(`Failed to approve ${dog.name}`)
          setProcessingApproval(false)
          return
        }
      }

      // Update user's approval status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', selectedBooking.user_id)

      if (profileError) {
        console.error('Failed to update profile approval status:', profileError)
      }

      // Send approval email
      try {
        await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: selectedBooking.profiles.email,
            userName: `${selectedBooking.profiles.first_name} ${selectedBooking.profiles.last_name}`,
            dogNames: selectedBooking.dogs.map(d => d.name).join(', '),
            notes: approvalNotes
          })
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
      }

      toast.success('All dogs approved successfully!')
      setShowApprovalModal(false)
      setApprovalNotes('')
      setSelectedBooking(null)
      fetchAssessments()
    } catch (error) {
      console.error('Error approving dogs:', error)
      toast.error('Failed to approve dogs')
    }
    setProcessingApproval(false)
  }

  const handleDenyAll = async () => {
    if (!selectedBooking || !declineNotes.trim()) {
      toast.error('Please provide a reason for denial')
      return
    }

    setProcessingApproval(true)
    try {
      // Decline all dogs
      for (const dog of selectedBooking.dogs) {
        const { error: dogError } = await supabase
          .from('dogs')
          .update({
            is_approved: false,
            assessment_completed: true,
            assessment_notes: declineNotes
          })
          .eq('id', dog.id)

        if (dogError) {
          console.error('Error declining dog:', dogError)
          toast.error(`Failed to decline ${dog.name}`)
          setProcessingApproval(false)
          return
        }
      }

      // Update user's approval status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ approval_status: 'declined' })
        .eq('id', selectedBooking.user_id)

      if (profileError) {
        console.error('Failed to update profile approval status:', profileError)
      }

      // Send decline email
      try {
        await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: selectedBooking.profiles.email,
            userName: `${selectedBooking.profiles.first_name} ${selectedBooking.profiles.last_name}`,
            dogNames: selectedBooking.dogs.map(d => d.name).join(', '),
            status: 'declined',
            notes: declineNotes
          })
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
      }

      toast.success('Assessment declined')
      setShowApprovalModal(false)
      setDeclineNotes('')
      setSelectedBooking(null)
      fetchAssessments()
    } catch (error) {
      console.error('Error declining assessment:', error)
      toast.error('Failed to decline assessment')
    }
    setProcessingApproval(false)
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const upcomingAssessments = assessmentBookings.filter(b => !isPastAssessment(b))
  const pastAssessments = assessmentBookings.filter(b => isPastAssessment(b) && !b.dogs.every(d => d.assessment_completed))

  if (loading) {
    return (
      <div className="min-h-screen bg-canine-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-navy mx-auto mb-4"></div>
          <p className="text-canine-navy font-display text-xl">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canine-cream">
      {/* Header */}
      <header className="bg-gradient-to-r from-canine-navy via-canine-navy to-[#2a5a7a] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="mb-2">
                <BackButton href="/staff/dashboard" />
              </div>
              <h1 className="text-3xl font-display font-bold">Assessment Management</h1>
              <p className="text-canine-sky">View and approve dog assessments</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-t-xl font-semibold transition-all ${
                activeView === 'calendar'
                  ? 'bg-canine-cream text-canine-navy'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <CalendarDaysIcon className="h-5 w-5" />
              <span>Calendar View</span>
              <span className="bg-canine-gold text-white text-xs font-bold rounded-full px-2 py-1">
                {upcomingAssessments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveView('approvals')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-t-xl font-semibold transition-all ${
                activeView === 'approvals'
                  ? 'bg-canine-cream text-canine-navy'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ClipboardDocumentCheckIcon className="h-5 w-5" />
              <span>Pending Approvals</span>
              {pastAssessments.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                  {pastAssessments.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* CALENDAR VIEW */}
          {activeView === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                    className="p-2 hover:bg-canine-sky rounded-lg transition-colors"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-canine-navy" />
                  </button>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">
                    {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                    className="p-2 hover:bg-canine-sky rounded-lg transition-colors"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-canine-navy" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-canine-navy py-2">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg"></div>
                  ))}

                  {/* Calendar Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const date = new Date(year, month, day)
                    const bookings = getBookingsForDate(date)
                    const isToday = date.toDateString() === new Date().toDateString()

                    return (
                      <div
                        key={day}
                        className={`h-24 border-2 rounded-lg p-2 transition-all ${
                          isToday
                            ? 'border-canine-gold bg-canine-gold/10'
                            : 'border-gray-200 hover:border-canine-gold/50'
                        }`}
                      >
                        <div className="font-semibold text-canine-navy mb-1">{day}</div>
                        <div className="space-y-1">
                          {bookings.map(booking => (
                            <button
                              key={booking.id}
                              onClick={() => handleViewBooking(booking)}
                              className="w-full text-left bg-canine-navy text-white text-xs px-2 py-1 rounded hover:bg-canine-gold transition-colors"
                            >
                              {booking.start_time.slice(0, 5)} - {booking.profiles.first_name} ({booking.dogs.length})
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* APPROVALS VIEW */}
          {activeView === 'approvals' && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {pastAssessments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <ClipboardDocumentCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                    No Pending Approvals
                  </h3>
                  <p className="text-gray-600">
                    All past assessments have been processed
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastAssessments.map(booking => (
                    <div key={booking.id} className="bg-white rounded-2xl shadow-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <UserIcon className="h-6 w-6 text-canine-navy" />
                            <h3 className="text-xl font-bold text-canine-navy">
                              {booking.profiles.first_name} {booking.profiles.last_name}
                            </h3>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Assessment Date:</span>{' '}
                                {new Date(booking.booking_date).toLocaleDateString('en-GB')}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Time:</span> {booking.start_time} - {booking.end_time}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Email:</span> {booking.profiles.email}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Phone:</span> {booking.profiles.phone}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Number of Dogs:</span> {booking.dogs.length}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Dogs:</span>{' '}
                                {booking.dogs.map(d => d.name).join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="px-4 py-2 bg-canine-navy text-white rounded-xl hover:bg-canine-gold transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleApproveClick(booking)}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                          >
                            Approve/Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl my-8"
            >
              <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-t-3xl">
                <h2 className="text-2xl font-display font-bold">Assessment Details</h2>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {/* User Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-canine-navy mb-4 flex items-center">
                    <UserIcon className="h-6 w-6 mr-2" />
                    Owner Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 bg-canine-sky/20 rounded-xl p-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-semibold">{selectedBooking.profiles.first_name} {selectedBooking.profiles.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold">{selectedBooking.profiles.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-semibold">{selectedBooking.profiles.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="font-semibold">
                        {selectedBooking.profiles.address}, {selectedBooking.profiles.city}, {selectedBooking.profiles.postcode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Assessment Date & Time</p>
                      <p className="font-semibold">
                        {new Date(selectedBooking.booking_date).toLocaleDateString('en-GB')} at {selectedBooking.start_time} - {selectedBooking.end_time}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Approval Status</p>
                      <p className={`font-semibold ${
                        selectedBooking.profiles.approval_status === 'approved' ? 'text-green-600' :
                        selectedBooking.profiles.approval_status === 'declined' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {selectedBooking.profiles.approval_status || 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dogs Information */}
                <div>
                  <h3 className="text-xl font-bold text-canine-navy mb-4 flex items-center">
                    <HeartIcon className="h-6 w-6 mr-2" />
                    Dogs ({selectedBooking.dogs.length})
                  </h3>
                  <div className="space-y-6">
                    {selectedBooking.dogs.map(dog => (
                      <div key={dog.id} className="border-2 border-canine-gold/30 rounded-xl p-6">
                        <div className="flex items-start space-x-6">
                          {/* Dog Photo */}
                          <div className="flex-shrink-0">
                            {dog.photo_url ? (
                              <img
                                src={dog.photo_url}
                                alt={dog.name}
                                className="w-32 h-32 rounded-xl object-cover border-4 border-canine-gold"
                              />
                            ) : (
                              <div className="w-32 h-32 rounded-xl bg-gray-200 flex items-center justify-center border-4 border-canine-gold">
                                <CameraIcon className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Dog Details */}
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold text-canine-navy mb-3">{dog.name}</h4>
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Breed</p>
                                <p className="font-semibold text-sm">{dog.breed}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Age</p>
                                <p className="font-semibold text-sm">{dog.age_years}y {dog.age_months}m</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Gender</p>
                                <p className="font-semibold text-sm">{dog.gender}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Size</p>
                                <p className="font-semibold text-sm">{dog.size}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Weight</p>
                                <p className="font-semibold text-sm">{dog.weight} kg</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Energy Level</p>
                                <p className="font-semibold text-sm">{dog.energy_level}</p>
                              </div>
                            </div>

                            {/* Behavior */}
                            <div className="mb-4">
                              <p className="text-xs text-gray-600 mb-2">Behavior</p>
                              <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  dog.good_with_dogs ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {dog.good_with_dogs ? '✓' : '✗'} Good with Dogs
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  dog.good_with_puppies ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {dog.good_with_puppies ? '✓' : '✗'} Good with Puppies
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  dog.good_with_people ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {dog.good_with_people ? '✓' : '✗'} Good with People
                                </span>
                              </div>
                            </div>

                            {/* Medical & Special Notes */}
                            {(dog.medical_conditions || dog.medications || dog.allergies || dog.behavioral_notes || dog.special_instructions) && (
                              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                                  <p className="font-bold text-yellow-800">Important Information</p>
                                </div>
                                {dog.medical_conditions && (
                                  <p className="text-sm mb-2"><span className="font-semibold">Medical:</span> {dog.medical_conditions}</p>
                                )}
                                {dog.medications && (
                                  <p className="text-sm mb-2"><span className="font-semibold">Medications:</span> {dog.medications}</p>
                                )}
                                {dog.allergies && (
                                  <p className="text-sm mb-2"><span className="font-semibold">Allergies:</span> {dog.allergies}</p>
                                )}
                                {dog.behavioral_notes && (
                                  <p className="text-sm mb-2"><span className="font-semibold">Behavior Notes:</span> {dog.behavioral_notes}</p>
                                )}
                                {dog.special_instructions && (
                                  <p className="text-sm"><span className="font-semibold">Special Instructions:</span> {dog.special_instructions}</p>
                                )}
                              </div>
                            )}

                            {/* Assessment Status */}
                            {dog.assessment_completed && (
                              <div className="mt-4">
                                <p className={`text-sm font-semibold ${dog.is_approved ? 'text-green-600' : 'text-red-600'}`}>
                                  {dog.is_approved ? '✓ Approved' : '✗ Not Approved'}
                                </p>
                                {dog.assessment_notes && (
                                  <p className="text-sm text-gray-600 mt-1">Notes: {dog.assessment_notes}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approval/Denial Modal */}
      <AnimatePresence>
        {showApprovalModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowApprovalModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl"
            >
              <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-t-3xl">
                <h2 className="text-2xl font-display font-bold">Approve or Deny Assessment</h2>
                <p className="text-canine-sky">
                  {selectedBooking.profiles.first_name} {selectedBooking.profiles.last_name} - {selectedBooking.dogs.length} dog(s)
                </p>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">
                    Approval Notes (optional)
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add any notes about the assessment (e.g., dog behavior observations)..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">
                    Denial Reason (required if denying)
                  </label>
                  <textarea
                    value={declineNotes}
                    onChange={(e) => setDeclineNotes(e.target.value)}
                    placeholder="Provide a reason for denial if you choose to deny..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-red-300 focus:border-red-500 outline-none"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleApproveAll}
                    disabled={processingApproval}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                    <span>{processingApproval ? 'Approving...' : 'Approve All Dogs'}</span>
                  </button>
                  <button
                    onClick={handleDenyAll}
                    disabled={processingApproval}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircleIcon className="h-6 w-6" />
                    <span>{processingApproval ? 'Denying...' : 'Deny Assessment'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
