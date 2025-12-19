'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  CheckCircleIcon,
  PlusIcon,
  CalendarIcon,
  CreditCardIcon,
  ClockIcon,
  HeartIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import GoldenPawBadge from '@/components/GoldenPawBadge'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [dogs, setDogs] = useState<any[]>([])
  const [legalAgreements, setLegalAgreements] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [assessmentBookings, setAssessmentBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'dogs' | 'bookings' | 'documents'>('dogs')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedDogs, setSelectedDogs] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [mealOption, setMealOption] = useState<'provided' | 'own'>('provided')
  const [specialNotes, setSpecialNotes] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Optimized: Fetch bookings once instead of twice (removed duplicate upcoming queries)
      const today = new Date().toISOString().split('T')[0]
      const [
        profileRes,
        legalRes,
        dogsRes,
        subscriptionRes,
        allBookingsRes,
        allIndividualDayBookingsRes,
        assessmentBookingsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('legal_agreements').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('dogs').select('*').eq('owner_id', user.id).order('created_at', { ascending: true }),
        supabase.from('subscriptions').select('*, subscription_tiers:tier_id(name), dogs(name)').eq('user_id', user.id).eq('is_active', true),
        supabase.from('bookings').select('*').eq('user_id', user.id).neq('status', 'cancelled').order('booking_date', { ascending: false }).limit(100),
        supabase.from('individual_day_bookings').select('*').eq('user_id', user.id).neq('status', 'cancelled').order('booking_date', { ascending: false }).limit(100),
        supabase.from('assessment_bookings').select(`
          *,
          assessment_slots (
            assessment_date,
            start_time,
            end_time
          ),
          dogs (
            id,
            name,
            breed
          )
        `).eq('user_id', user.id).in('booking_status', ['confirmed', 'pending']).order('booked_at', { ascending: false })
      ])

      // Filter upcoming bookings from the full list (saves 2 database queries)
      const upcomingSubscriptionBookings = (allBookingsRes.data || [])
        .filter(b => b.booking_date >= today)
        .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
        .slice(0, 3)
      const upcomingIndividualBookings = (allIndividualDayBookingsRes.data || [])
        .filter(b => b.booking_date >= today)
        .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
        .slice(0, 3)

      setProfile(profileRes.data)
      setLegalAgreements(legalRes.data)
      setDogs(dogsRes.data || [])
      setAssessmentBookings(assessmentBookingsRes.data || [])

      // Handle multiple subscriptions (one per dog)
      const activeSubs = subscriptionRes.data || []
      setSubscriptions(activeSubs)

      // For display, aggregate total days remaining across all subscriptions
      if (activeSubs.length > 0) {
        const totalDaysRemaining = activeSubs.reduce((sum, sub) => sum + (sub.days_remaining || 0), 0)
        const totalDaysIncluded = activeSubs.reduce((sum, sub) => sum + (sub.days_included || 0), 0)

        // Use the first subscription for tier info and billing date
        const primarySub = activeSubs[0]
        setSubscription({
          ...primarySub,
          days_remaining: totalDaysRemaining,
          days_included: totalDaysIncluded,
          subscription_count: activeSubs.length
        })
      } else {
        setSubscription(null)
      }

      // Merge subscription bookings and individual day bookings
      const upcomingBookingsCombined = [
        ...upcomingSubscriptionBookings,
        ...upcomingIndividualBookings
      ].sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()).slice(0, 3)

      const allBookingsCombined = [
        ...(allBookingsRes.data || []),
        ...(allIndividualDayBookingsRes.data || [])
      ].sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())

      setUpcomingBookings(upcomingBookingsCombined)
      setAllBookings(allBookingsCombined)

      const booked = [
        ...upcomingSubscriptionBookings.map(b => b.booking_date),
        ...upcomingIndividualBookings.map(b => b.booking_date)
      ]
      setBookedDates(booked)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canine-cream">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-gold mx-auto"></div>
            <HeartSolid className="h-6 w-6 text-canine-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const firstName = profile?.first_name || 'Friend'
  const hasApprovedDogs = dogs.some(dog => dog.is_approved)
  const canBookDays = hasApprovedDogs && subscription
  const isApproved = profile?.approval_status === 'approved'
  const hasSignedAgreements = !!legalAgreements?.terms_accepted

  // Get user initials for avatar
  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : profile?.first_name
    ? profile.first_name[0].toUpperCase()
    : 'U'

  // Detect session type from subscription tier name
  const getSessionType = (): 'full_day' | 'half_day' => {
    if (!subscription?.subscription_tiers?.name) return 'full_day'
    const tierName = subscription.subscription_tiers.name.toLowerCase()
    return tierName.includes('half day') ? 'half_day' : 'full_day'
  }

  const sessionType = getSessionType()

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getDateStatus = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) return 'past'

    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend'

    if (bookedDates.includes(dateString)) return 'available'

    return 'available'
  }

  const isDateAvailable = (dateString: string) => {
    const status = getDateStatus(dateString)
    return status === 'available'
  }

  const toggleDate = (dateString: string) => {
    if (!isDateAvailable(dateString) || !canBookDays) return
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(d => d !== dateString))
    } else {
      setSelectedDates([...selectedDates, dateString])
    }
  }

  const toggleDog = (dogId: string) => {
    if (!canBookDays) return
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

  const handleBooking = async () => {
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

    const daysRemaining = subscription.days_remaining || 0
    if (selectedDates.length > daysRemaining) {
      toast.error(`You only have ${daysRemaining} days remaining in your subscription`)
      return
    }

    setSubmitting(true)
    try {
      const tier = subscription.tier
      const pricingMap: any = {
        '4_days': { full_day: 40, half_day: 30 },
        '8_days': { full_day: 38, half_day: 28.50 },
        '12_days': { full_day: 37, half_day: 27.75 },
        '16_days': { full_day: 36, half_day: 27 },
        '20_days': { full_day: 35, half_day: 25 },
      }

      const dailyRate = pricingMap[tier]?.[sessionType] || 40
      const totalAmount = dailyRate * selectedDogs.length

      const bookings = selectedDates.map(date => ({
        user_id: user.id,
        booking_date: date,
        dog_ids: selectedDogs,
        total_dogs: selectedDogs.length,
        daily_rate: dailyRate,
        total_amount: totalAmount,
        status: 'confirmed',
        payment_status: 'paid',
        subscription_id: subscription.id,
        is_subscription_booking: true,
        session_type: sessionType,
        meal_option: mealOption,
        special_notes: specialNotes || null
      }))

      const { error: bookingError } = await supabase.from('bookings').insert(bookings)
      if (bookingError) throw bookingError

      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          days_remaining: daysRemaining - selectedDates.length
        })
        .eq('id', subscription.id)

      if (subError) throw subError

      toast.success(`Successfully booked ${selectedDates.length} day${selectedDates.length > 1 ? 's' : ''}!`)
      setSelectedDates([])
      setSelectedDogs([])
      setMealOption('provided')
      setSpecialNotes('')
      fetchDashboardData()
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error('Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Get upcoming and past bookings
  const today = new Date().toISOString().split('T')[0]
  const upcomingBookingsList = allBookings.filter(b => b.booking_date >= today)
  const pastBookingsList = allBookings.filter(b => b.booking_date < today)

  // Onboarding checklist steps
  const hasFilledProfile = profile?.first_name && profile?.last_name && profile?.phone && profile?.address
  const hasAddedDogs = dogs.length > 0
  const hasBookedAssessment = assessmentBookings.length > 0 || dogs.some(dog => dog.assessment_completed || dog.assessment_date || dog.assessment_slot_id)
  const hasSubscription = !!subscription
  const hasBookedDays = upcomingBookingsList.length > 0

  const checklistSteps = [
    { id: 1, label: 'Create an account', completed: !!user },
    { id: 2, label: 'Complete My Profile', completed: hasFilledProfile },
    { id: 3, label: 'Add your dogs', completed: hasAddedDogs },
    { id: 4, label: 'Book assessment', completed: hasBookedAssessment },
    { id: 5, label: 'Get approved by staff', completed: isApproved },
    { id: 6, label: 'Book your first daycare days', completed: hasBookedDays },
  ]

  const allStepsCompleted = checklistSteps.every(step => step.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky">
      {/* Friendly Header with Gradient - Compact on mobile */}
      <header className="bg-gradient-to-r from-canine-navy to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              {/* Friendly Avatar with Border - Smaller on mobile */}
              <div className="h-9 w-9 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-canine-gold to-canine-light-gold flex items-center justify-center text-white font-bold text-sm sm:text-xl md:text-2xl shadow-lg border-2 sm:border-4 border-white/20 flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-2xl md:text-3xl font-display font-bold truncate">
                  Hi, {firstName}! 👋
                </h1>
                <p className="text-blue-100 mt-0.5 sm:mt-1 text-xs sm:text-sm hidden sm:block">
                  {profile?.is_vip_member ? "Thank you for being a VIP Founder! 🌟" : "We're happy to see you and your pups!"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Logout Button - Compact on mobile */}
              <button
                onClick={handleSignOut}
                className="text-white/90 hover:text-white text-[10px] sm:text-sm px-1.5 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* VIP Badge Banner - Right under navigation */}
      {profile?.is_vip_member && profile?.vip_badge_type === 'golden_paw_founders' && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-b-2 border-amber-200 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center gap-3">
              <GoldenPawBadge size="medium" showText={true} />
            </div>
          </div>
        </div>
      )}

      <div className="flex max-w-[1600px] mx-auto">
        {/* Left Sidebar Checklist - Only show if not all steps completed */}
        {!allStepsCompleted && (
          <aside className="hidden lg:block w-80 flex-shrink-0 px-4 py-8">
            <div className="sticky top-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border-2 border-canine-gold/20 p-6">
              <div className="text-center mb-4">
                <div className="inline-block p-3 bg-gradient-to-br from-canine-gold to-canine-light-gold rounded-full mb-2">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-canine-navy">Your Journey 🐾</h3>
                <p className="text-xs text-gray-600 mt-1">Let's get you all set up!</p>
              </div>

              <div className="space-y-3">
                {checklistSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-2 rounded-lg transition-all ${
                      step.completed ? 'opacity-60 bg-green-50' : 'bg-white/50 hover:bg-white'
                    }`}
                  >
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mt-0.5 transition-all ${
                      step.completed
                        ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-md'
                        : 'bg-gradient-to-br from-gray-200 to-gray-300'
                    }`}>
                      {step.completed && (
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className={`text-sm leading-snug ${
                      step.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-900 font-semibold'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-canine-gold/20">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-600 font-medium">You're doing great! 🎉</span>
                  <span className="font-bold text-canine-gold">
                    {checklistSteps.filter(s => s.completed).length}/{checklistSteps.length}
                  </span>
                </div>
                <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-canine-gold to-canine-light-gold h-3 rounded-full transition-all duration-500 shadow-md"
                    style={{
                      width: `${(checklistSteps.filter(s => s.completed).length / checklistSteps.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Quick Actions Bar - Fun & Friendly */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link href="/dashboard/assessment/schedule">
            <button className="group flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-teal-50 text-canine-navy hover:shadow-lg border border-teal-200/50 transition-all transform hover:scale-105 w-full">
              <ClockIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">Assessment</span>
            </button>
          </Link>

          <Link href="/dashboard/add-dog?new=true">
            <button className="group flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-green-50 text-canine-navy hover:shadow-lg border border-green-200/50 transition-all transform hover:scale-105 w-full">
              <PlusIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs sm:text-sm">Add Dog</span>
            </button>
          </Link>

          <button
            onClick={() => setActiveTab('dogs')}
            className={`group flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl transition-all transform hover:scale-105 ${
              activeTab === 'dogs'
                ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-xl shadow-pink-400/30'
                : 'bg-gradient-to-br from-white to-pink-50 text-canine-navy hover:shadow-lg border border-pink-200/50'
            }`}
          >
            <HeartIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-xs sm:text-sm">My Dogs</span>
          </button>

          <Link href="/dashboard/subscriptions">
            <button className="group flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-purple-50 text-canine-navy hover:shadow-lg border border-purple-200/50 transition-all transform hover:scale-105 w-full">
              <CreditCardIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs sm:text-sm">Subscription</span>
            </button>
          </Link>

          <Link href="/dashboard/individual-days">
            <button className="group flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-amber-50 text-canine-navy hover:shadow-lg border border-amber-200/50 transition-all transform hover:scale-105 w-full">
              <CalendarDaysIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs sm:text-sm">Individual Days</span>
            </button>
          </Link>

          <Link href="/dashboard/manage-bookings">
            <button className="group flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-blue-50 text-canine-navy hover:shadow-lg border border-blue-200/50 transition-all transform hover:scale-105 w-full">
              <ClipboardDocumentListIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs sm:text-sm">Manage Bookings</span>
            </button>
          </Link>

          <Link href="/dashboard/profile">
            <button className="group flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-orange-50 text-canine-navy hover:shadow-lg border border-orange-200/50 transition-all transform hover:scale-105 w-full">
              <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs sm:text-sm">My Profile</span>
            </button>
          </Link>
        </div>

        {/* Assessment Booking Banner - Show if user has upcoming assessment */}
        {assessmentBookings.length > 0 && (() => {
          // Get the first assessment booking with slot details
          const upcomingAssessment = assessmentBookings.find(b => b.assessment_slots)
          if (!upcomingAssessment?.assessment_slots) return null

          const slot = upcomingAssessment.assessment_slots
          const assessmentDate = new Date(slot.assessment_date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          // Only show if assessment is in the future
          if (assessmentDate < today) return null

          const formattedDate = assessmentDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })

          // Group dogs for this slot
          const dogsForSlot = assessmentBookings
            .filter(b => b.slot_id === upcomingAssessment.slot_id)
            .map(b => b.dogs?.name)
            .filter(Boolean)

          return (
            <div className="mb-6 sm:mb-8 bg-gradient-to-r from-canine-navy to-[#2a5a7a] rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-canine-gold/20 rounded-xl">
                    <CalendarDaysIcon className="h-8 w-8 text-canine-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Upcoming Assessment</h3>
                    <p className="text-2xl font-bold text-canine-gold">{formattedDate}</p>
                    <p className="text-white/80 mt-1">
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)} • {dogsForSlot.join(', ')}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/assessment/view">
                  <button className="w-full md:w-auto bg-canine-gold text-white px-6 py-3 rounded-xl font-semibold hover:bg-canine-light-gold transition-all flex items-center justify-center gap-2">
                    View Details
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </div>
          )
        })()}

        {/* At-a-Glance Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Subscription Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
              <CreditCardIcon className="h-6 w-6 text-canine-gold" />
            </div>

            {subscription ? (
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-canine-navy">{subscription.days_remaining}</p>
                  <p className="text-sm text-gray-600">Days remaining</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-canine-gold h-2 rounded-full transition-all"
                    style={{ width: `${((subscription.days_remaining || 0) / subscription.days_included) * 100}%` }}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600">Next billing</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(subscription.next_billing_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <Link href="/dashboard/manage-bookings">
                  <button className="w-full bg-canine-navy text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium">
                    Manage Subscription
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">No active subscription</p>
                <Link href="/dashboard/subscriptions">
                  <button className="w-full bg-canine-gold text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* My Dogs Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Dogs</h3>
              <HeartSolid className="h-6 w-6 text-red-500" />
            </div>

            {dogs.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-canine-navy">{dogs.length}</p>
                  <p className="text-sm text-gray-600">
                    {dogs.filter(d => d.is_approved).length} approved
                  </p>
                </div>

                <div className="flex -space-x-2">
                  {dogs.slice(0, 4).map((dog, i) => (
                    <div key={dog.id} className="relative">
                      {dog.photo_url ? (
                        <img
                          src={dog.photo_url}
                          alt={dog.name}
                          className="h-10 w-10 rounded-full border-2 border-white object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full border-2 border-white bg-canine-gold/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-canine-gold">
                            {dog.name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {dogs.length > 4 && (
                    <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">
                        +{dogs.length - 4}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('dogs')}
                  className="w-full bg-canine-navy text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                >
                  View All
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">No dogs added yet</p>
                <Link href="/dashboard/add-dog?new=true">
                  <button className="w-full bg-canine-gold text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium">
                    Add Your First Dog
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Visits Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Visits</h3>
              <CalendarIcon className="h-6 w-6 text-canine-gold" />
            </div>

            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.booking_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-xs text-gray-600">
                        {booking.total_dogs} dog{booking.total_dogs > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Confirmed
                    </span>
                  </div>
                ))}

                <Link href="/dashboard/booking">
                  <button className="w-full bg-canine-navy text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium mt-4">
                    Book Now
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">No upcoming visits</p>
                <Link href="/dashboard/individual-days">
                  <button className="w-full bg-canine-gold text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium">
                    Book Days
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area - Tabbed Interface */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('dogs')}
                className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors ${
                  activeTab === 'dogs'
                    ? 'text-canine-gold border-b-2 border-canine-gold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Dogs
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors ${
                  activeTab === 'bookings'
                    ? 'text-canine-gold border-b-2 border-canine-gold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors ${
                  activeTab === 'documents'
                    ? 'text-canine-gold border-b-2 border-canine-gold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Documents
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* My Dogs Tab */}
            {activeTab === 'dogs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-canine-navy mb-2">My Dogs</h2>
                    <p className="text-gray-600">Manage your registered dogs</p>
                  </div>
                  {dogs.length < 4 && (
                    <Link href="/dashboard/add-dog?new=true">
                      <button className="bg-canine-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium flex items-center gap-2">
                        <PlusIcon className="h-5 w-5" />
                        Add Dog
                      </button>
                    </Link>
                  )}
                </div>

                {dogs.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {dogs.map((dog) => (
                      <div
                        key={dog.id}
                        onClick={() => {
                          if (dog.is_draft) {
                            router.push(`/dashboard/add-dog?draft=${dog.id}`)
                          } else {
                            router.push(`/dashboard/dogs/${dog.id}`)
                          }
                        }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-4">
                          {dog.photo_url ? (
                            <img
                              src={dog.photo_url}
                              alt={dog.name}
                              className="h-20 w-20 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-xl bg-canine-gold/20 flex items-center justify-center">
                              <span className="text-2xl font-bold text-canine-gold">
                                {dog.name[0]}
                              </span>
                            </div>
                          )}

                          {dog.is_approved ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                              <CheckCircleIcon className="h-3 w-3" />
                              Approved
                            </span>
                          ) : dog.is_draft ? (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                              Draft
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                              Pending
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-canine-navy mb-1">{dog.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{dog.breed}</p>
                        <p className="text-xs text-gray-500">
                          {dog.age_years}y {dog.age_months}m • {dog.size?.replace('_', ' ')}
                        </p>

                        {dog.total_visits > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                              <span className="font-semibold text-canine-navy">{dog.total_visits}</span> visit{dog.total_visits !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-end text-canine-gold">
                          <span className="text-sm font-medium">View details</span>
                          <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    ))}

                    {dogs.length < 4 && (
                      <Link href="/dashboard/add-dog?new=true">
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-canine-gold hover:bg-canine-cream transition-all cursor-pointer flex flex-col items-center justify-center min-h-[280px]">
                          <PlusIcon className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="font-semibold text-gray-700">Add Another Dog</p>
                          <p className="text-sm text-gray-500 mt-1">Up to 4 dogs allowed</p>
                        </div>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No dogs yet</h3>
                    <p className="text-gray-500 mb-6">Add your first dog to get started</p>
                    <Link href="/dashboard/add-dog?new=true">
                      <button className="bg-canine-gold text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium">
                        Add Your First Dog
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-canine-navy mb-2">My Bookings</h2>
                  <p className="text-gray-600">View your upcoming and past bookings</p>
                </div>

                {/* Upcoming Bookings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming</h3>
                  {upcomingBookingsList.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingBookingsList.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-canine-navy">
                                {new Date(booking.booking_date).getDate()}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(booking.booking_date).toLocaleDateString('en-GB', { month: 'short' })}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {new Date(booking.booking_date).toLocaleDateString('en-GB', { weekday: 'long' })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {booking.total_dogs} dog{booking.total_dogs > 1 ? 's' : ''} • {booking.session_type === 'full_day' ? 'Full Day' : 'Half Day'}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                            Confirmed
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No upcoming bookings</p>
                    </div>
                  )}
                </div>

                {/* Past Bookings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Past Bookings</h3>
                  {pastBookingsList.length > 0 ? (
                    <div className="space-y-3">
                      {pastBookingsList.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-75">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-600">
                                {new Date(booking.booking_date).getDate()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(booking.booking_date).toLocaleDateString('en-GB', { month: 'short' })}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">
                                {new Date(booking.booking_date).toLocaleDateString('en-GB', { weekday: 'long' })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {booking.total_dogs} dog{booking.total_dogs > 1 ? 's' : ''} • {booking.session_type === 'full_day' ? 'Full Day' : 'Half Day'}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full font-medium">
                            Completed
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No past bookings</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-canine-navy mb-2">Documents</h2>
                  <p className="text-gray-600">Manage your legal agreements and dog documents</p>
                </div>

                <div className="space-y-4">
                  {/* Legal Agreements */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {hasSignedAgreements ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <DocumentTextIcon className="h-6 w-6 text-amber-600" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">Legal Agreements</p>
                          <p className="text-sm text-gray-600">
                            {hasSignedAgreements ? 'Signed and completed' : 'Not signed yet'}
                          </p>
                        </div>
                      </div>
                      {hasSignedAgreements ? (
                        <Link href="/dashboard/view-agreements">
                          <button className="flex items-center gap-1 text-canine-gold hover:text-canine-navy transition-colors text-sm font-medium">
                            View
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </button>
                        </Link>
                      ) : (
                        <Link href="/dashboard/legal-agreements">
                          <button className="bg-canine-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium">
                            Sign Now
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Dog Vaccination Documents */}
                  {dogs.map((dog) => (
                    <div key={dog.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {dog.has_vaccination_docs ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <DocumentTextIcon className="h-6 w-6 text-amber-600" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{dog.name} - Vaccination Records</p>
                            <p className="text-sm text-gray-600">
                              {dog.has_vaccination_docs ? 'Documents uploaded' : 'Documents required'}
                            </p>
                          </div>
                        </div>
                        <Link href={`/dashboard/dogs/${dog.id}`}>
                          <button className="flex items-center gap-1 text-canine-gold hover:text-canine-navy transition-colors text-sm font-medium">
                            {dog.has_vaccination_docs ? 'View' : 'Upload'}
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}

                  {dogs.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Add dogs to manage their documents</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
// Cache bust - Dec 19 2025 - Filter cancelled bookings fix
