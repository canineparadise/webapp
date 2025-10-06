'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  CreditCardIcon,
  ClockIcon,
  HeartIcon,
  StarIcon,
  ArrowRightIcon,
  SparklesIcon,
  CameraIcon,
  DocumentIcon,
  CalendarDaysIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  GiftIcon,
  TrophyIcon,
  SunIcon,
  MapPinIcon,
  PhoneIcon,
  BeakerIcon,
  ChartBarIcon,
  CurrencyPoundIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid, StarIcon as StarSolid, SunIcon as SunSolid } from '@heroicons/react/24/solid'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [dogs, setDogs] = useState<any[]>([])
  const [legalAgreements, setLegalAgreements] = useState<any>(null)
  const [assessmentSchedule, setAssessmentSchedule] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [docsUploaded, setDocsUploaded] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedDogs, setSelectedDogs] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [sessionType, setSessionType] = useState<'full_day' | 'half_day'>('full_day')

  useEffect(() => {
    fetchDashboardData()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch all data in parallel for speed
      const [
        profileRes,
        legalRes,
        scheduleRes,
        dogsRes,
        docsRes,
        subscriptionRes,
        bookingsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('legal_agreements').select('*').eq('user_id', user.id).single(),
        supabase.from('assessment_schedule').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('dogs').select('*').eq('owner_id', user.id).order('created_at', { ascending: true }),
        supabase.from('documents').select('*, dogs!inner(owner_id)').eq('dogs.owner_id', user.id),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('is_active', true).single(),
        supabase.from('bookings').select('*').eq('user_id', user.id).gte('booking_date', new Date().toISOString().split('T')[0]).order('booking_date', { ascending: true }).limit(5)
      ])

      setProfile(profileRes.data)
      setLegalAgreements(legalRes.data)
      setAssessmentSchedule(scheduleRes.data)
      setDogs(dogsRes.data || [])
      setDocsUploaded(docsRes.data || [])
      setSubscription(subscriptionRes.data)
      setUpcomingBookings(bookingsRes.data || [])

      // Load booked dates for calendar
      const booked = bookingsRes.data?.map(b => b.booking_date) || []
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canine-cream to-white">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-gold mx-auto"></div>
            <HeartSolid className="h-6 w-6 text-canine-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600">Getting your pup's paradise ready...</p>
        </div>
      </div>
    )
  }

  // Calculate real onboarding status
  const firstName = profile?.first_name || 'Friend'
  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 18 ? 'Good Afternoon' : 'Good Evening'
  const emailVerified = user?.email_confirmed_at !== null
  const profileComplete = profile?.first_name && profile?.last_name && profile?.email && profile?.phone && profile?.emergency_contact_name && profile?.emergency_contact_phone
  const hasAddedDogs = dogs.length > 0
  const hasSignedAgreements = !!legalAgreements?.terms_accepted
  const hasUploadedVaccinations = hasAddedDogs && dogs.length > 0 && dogs.every(dog =>
    dog.has_vaccination_docs || docsUploaded.some(doc => doc.dog_id === dog.id && doc.type === 'vaccination')
  )
  const hasScheduledAssessment = !!assessmentSchedule?.confirmed_date
  const isApproved = dogs.some(dog => dog.is_approved)

  // Onboarding steps (vaccination upload removed - now part of add dog form)
  const steps = [
    { id: 'signup', label: 'Sign Up', completed: true, icon: CheckCircleIcon },
    { id: 'verify', label: 'Verify Email', completed: emailVerified, icon: CheckCircleIcon },
    { id: 'profile', label: 'Complete Profile', completed: profileComplete, icon: UserIcon },
    { id: 'dogs', label: 'Add Dog(s) + Vaccinations', completed: hasAddedDogs && hasUploadedVaccinations, icon: HeartIcon },
    { id: 'agreements', label: 'Sign Legal Agreements', completed: hasSignedAgreements, icon: ShieldCheckIcon },
    { id: 'schedule', label: 'Schedule Assessment', completed: hasScheduledAssessment, icon: CalendarDaysIcon },
    { id: 'approved', label: 'Get Approved', completed: isApproved, icon: StarIcon },
  ]

  const completedSteps = steps.filter(s => s.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100
  const canBook = isApproved && hasAddedDogs && hasUploadedVaccinations
  const isFullySetUp = completedSteps === steps.length

  // Get next action
  const getNextAction = () => {
    if (!emailVerified) return { label: 'Verify Your Email', link: null, icon: CheckCircleIcon }
    if (!profileComplete) return { label: 'Complete Your Profile', link: '/dashboard/profile', icon: UserIcon }
    if (!hasAddedDogs) return { label: 'Add Your Dog', link: '/dashboard/add-dog', icon: HeartIcon }
    if (!hasUploadedVaccinations) return { label: 'Upload Vaccination Docs', link: '/dashboard/add-dog', icon: DocumentIcon }
    if (!hasSignedAgreements) return { label: 'Sign Legal Agreements', link: '/dashboard/legal-agreements', icon: ShieldCheckIcon }
    if (!hasScheduledAssessment) return { label: 'Schedule Assessment', link: '/dashboard/assessment/schedule', icon: CalendarDaysIcon }
    if (!isApproved) return { label: 'Awaiting Approval', link: null, icon: ClockIcon }
    return { label: 'Book Your First Day!', link: '/dashboard/booking', icon: StarIcon }
  }

  const nextAction = getNextAction()

  // Fun facts and tips
  const tips = [
    "Did you know? Dogs need 12-14 hours of sleep per day!",
    "Tip: Bring your dog's favorite toy for their first day!",
    "Fun fact: Playing with other dogs helps with socialization!",
    "Remember: Always update us if your dog's behavior changes",
    "Pro tip: Book early for Friday assessments - they fill up fast!"
  ]
  const currentTip = tips[Math.floor(Date.now() / 10000) % tips.length]

  // Booking Calendar Functions
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

    // Check if past
    if (date < today) return 'past'

    // Check if weekend
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend'

    // Check if fully booked (this would need to be enhanced with capacity tracking)
    // For now, we'll show booked dates differently but still as "available" to view
    if (bookedDates.includes(dateString)) return 'available' // Still show as available, just indicate it's booked by this user

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
      // Calculate pricing based on session type and subscription tier
      const tier = subscription.tier
      const isFullDay = sessionType === 'full_day'

      // Pricing based on tier (will need to fetch from pricing_config in production)
      const pricingMap: any = {
        '4_days': { full_day: 40, half_day: 30 },
        '8_days': { full_day: 38, half_day: 28.50 },
        '12_days': { full_day: 37, half_day: 27.75 },
        '16_days': { full_day: 36, half_day: 27 },
        '20_days': { full_day: 35, half_day: 25 },
      }

      const dailyRate = pricingMap[tier]?.[sessionType] || (isFullDay ? 40 : 30)
      const totalDogsCount = selectedDogs.length
      const totalAmount = dailyRate * totalDogsCount

      const sessionTimes = isFullDay
        ? { start: '07:00', end: '19:00' }
        : { start: '10:00', end: '14:00' }

      const bookings = selectedDates.map(date => ({
        user_id: user.id,
        dog_ids: selectedDogs,
        booking_date: date,
        total_dogs: totalDogsCount,
        session_type: sessionType,
        session_start_time: sessionTimes.start,
        session_end_time: sessionTimes.end,
        daily_rate: dailyRate,
        total_amount: totalAmount,
        status: 'confirmed',
        payment_status: 'paid',
        created_at: new Date().toISOString()
      }))

      const { error: bookingError } = await supabase.from('bookings').insert(bookings)
      if (bookingError) throw bookingError

      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          days_remaining: daysRemaining - selectedDates.length,
          days_used: (subscription.days_used || 0) + selectedDates.length
        })
        .eq('id', subscription.id)

      if (subError) throw subError

      toast.success(`Successfully booked ${selectedDates.length} day${selectedDates.length > 1 ? 's' : ''}! 🎉`)
      setSelectedDates([])
      setSelectedDogs([])
      fetchDashboardData()
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error('Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  const hasApprovedDogs = dogs.some(dog => dog.is_approved)
  const canBookDays = hasApprovedDogs && subscription
  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-canine-cream to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Header with Time */}
          <div className="relative bg-gradient-to-r from-canine-gold via-amber-400 to-canine-light-gold rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 animate-pulse delay-75"></div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-4 right-8"
            >
              <SunSolid className="h-16 w-16 text-yellow-300/30" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute bottom-4 left-8"
            >
              <StarSolid className="h-10 w-10 text-white/30" />
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <HeartSolid className="h-20 w-20 text-red-300/10" />
            </motion.div>

            <div className="relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <motion.h1
                    className="text-5xl font-display font-bold text-white flex items-center flex-wrap gap-3 mb-2"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    {greeting}, {firstName}!
                  </motion.h1>
                  <div className="flex items-center gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5" />
                      <span className="font-medium">
                        {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span className="font-medium">
                        {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Fun Animation Text */}
                  <motion.p
                    className="text-white/80 mt-3 text-sm italic"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    💡 {currentTip}
                  </motion.p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-white/70 hover:text-white text-sm bg-white/20 px-3 py-1 rounded-lg"
                >
                  Sign Out
                </button>
              </div>

              {/* Progress Section */}
              {!isFullySetUp && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-white">Your Journey Progress</span>
                    <span className="text-sm font-medium text-white/90">
                      {completedSteps}/{steps.length} steps
                    </span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-6 shadow-inner overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full relative flex items-center justify-end pr-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    >
                      <span className="text-xs text-white font-bold">{Math.round(progressPercentage)}%</span>
                    </motion.div>
                  </div>

                  {/* Next Step CTA */}
                  {nextAction.link && (
                    <Link href={nextAction.link}>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-4 bg-white text-canine-gold px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                      >
                        <nextAction.icon className="h-5 w-5" />
                        {nextAction.label}
                        <ArrowRightIcon className="h-4 w-4" />
                      </motion.button>
                    </Link>
                  )}
                </div>
              )}

              {/* Success State */}
              {isFullySetUp && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white rounded-full p-3">
                      <TrophyIcon className="h-8 w-8 text-canine-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white">
                        Welcome to Paradise! 🎉
                      </h3>
                      <p className="text-white/90 mt-1">
                        Your pups are all set for amazing adventures
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.08, y: -5, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-4 border-2 border-purple-200 cursor-pointer relative overflow-hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 opacity-10"
              >
                <HeartSolid className="h-20 w-20 text-purple-600" />
              </motion.div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-purple-600 text-xs font-semibold">My Dogs 🐕</p>
                  <p className="text-3xl font-bold text-purple-900">{dogs.length}<span className="text-lg text-purple-500">/4</span></p>
                </div>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <HeartSolid className="h-10 w-10 text-purple-500" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.08, y: -5, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-4 border-2 border-green-200 cursor-pointer relative overflow-hidden"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-4 -right-4 opacity-10"
              >
                <ChartBarIcon className="h-20 w-20 text-green-600" />
              </motion.div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-green-600 text-xs font-semibold">Total Visits 🎉</p>
                  <p className="text-3xl font-bold text-green-900">
                    {dogs.reduce((acc, dog) => acc + (dog.total_visits || 0), 0)}
                  </p>
                </div>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ChartBarIcon className="h-10 w-10 text-green-500" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.08, y: -5, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-4 border-2 border-blue-200 cursor-pointer relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 opacity-10"
              >
                <CalendarIcon className="h-20 w-20 text-blue-600" />
              </motion.div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-blue-600 text-xs font-semibold">Next Visit 📅</p>
                  <p className="text-xl font-bold text-blue-900">
                    {upcomingBookings[0]
                      ? new Date(upcomingBookings[0].booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                      : 'None'}
                  </p>
                </div>
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <CalendarIcon className="h-10 w-10 text-blue-500" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.08, y: -5, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-4 border-2 border-amber-200 cursor-pointer relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 opacity-10"
              >
                <CreditCardIcon className="h-20 w-20 text-amber-600" />
              </motion.div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-amber-600 text-xs font-semibold">Package 💳</p>
                  <p className="text-xl font-bold text-amber-900">
                    {subscription ? `${subscription.days_remaining} days` : 'None'}
                  </p>
                </div>
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <CreditCardIcon className="h-10 w-10 text-amber-500" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Dogs & Actions */}
            <div className="lg:col-span-2 space-y-6">

              {/* My Pups Section - Enhanced */}
              {dogs.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border-2 border-canine-gold/20"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-canine-navy flex items-center gap-2">
                      <HeartSolid className="h-7 w-7 text-red-500 animate-pulse" />
                      My Amazing Pups
                    </h2>
                    {dogs.length < 4 && (
                      <Link href="/dashboard/add-dog">
                        <motion.button
                          whileHover={{ scale: 1.05, rotate: 2 }}
                          className="bg-gradient-to-r from-canine-gold to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl flex items-center gap-1"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add Dog
                        </motion.button>
                      </Link>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {dogs.map((dog, index) => (
                      <motion.div
                        key={dog.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 cursor-pointer shadow-lg hover:shadow-2xl transition-all border-2 border-purple-100"
                        onClick={() => router.push(`/dashboard/dogs/${dog.id}`)}
                      >
                        {/* Fun Badge */}
                        {dog.total_visits > 10 && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-bold shadow-md">
                            ⭐ Regular
                          </div>
                        )}

                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-canine-gold/20 to-amber-100 flex items-center justify-center overflow-hidden shadow-md">
                              {dog.photo_url ? (
                                <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                              ) : (
                                <CameraIcon className="h-10 w-10 text-canine-gold" />
                              )}
                            </div>
                            {dog.is_approved && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1"
                              >
                                <CheckCircleIcon className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-canine-navy flex items-center gap-2">
                              {dog.name}
                              {dog.gender === 'male' ? '♂️' : '♀️'}
                            </h3>
                            <p className="text-gray-600 text-sm">{dog.breed}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {dog.age_years}y {dog.age_months}m • {dog.size.replace('_', ' ')}
                            </p>

                            <div className="flex items-center gap-2 mt-3">
                              {dog.vaccinated && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                  💉 Vaccinated
                                </span>
                              )}
                              {dog.total_visits > 0 && (
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                                  {dog.total_visits} visits
                                </span>
                              )}
                            </div>
                          </div>

                          <ArrowRightIcon className="h-5 w-5 text-purple-400 mt-1" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <Link href="/dashboard/add-dog">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 rounded-3xl shadow-xl p-12 cursor-pointer border-3 border-dashed border-amber-300 overflow-hidden"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-10 -right-10 opacity-10"
                    >
                      <HeartIcon className="h-64 w-64 text-amber-600" />
                    </motion.div>
                    <div className="text-center relative z-10">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <HeartIcon className="h-20 w-20 text-amber-500 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-canine-navy mb-2">Add Your First Pup!</h3>
                      <p className="text-gray-600">Let's get your furry friend registered</p>
                      <p className="text-amber-600 font-semibold mt-4">Click to start →</p>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/dashboard/profile">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white rounded-2xl shadow-xl p-6 cursor-pointer overflow-hidden group"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity"
                    >
                      <UserIcon className="h-24 w-24" />
                    </motion.div>
                    <div className="relative z-10">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-3">
                        <UserIcon className="h-8 w-8" />
                      </div>
                      <h3 className="font-bold text-lg">My Profile 👤</h3>
                      <p className="text-sm text-white/90 mt-1">Update your info</p>
                    </div>
                  </motion.div>
                </Link>

                {hasAddedDogs && !hasSignedAgreements && (
                  <Link href="/dashboard/legal-agreements">
                    <motion.div
                      whileHover={{ scale: 1.08, y: -8 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white rounded-2xl shadow-xl p-6 cursor-pointer overflow-hidden group"
                    >
                      <div className="absolute -top-1 -right-1 z-20">
                        <span className="flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                        </span>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity"
                      >
                        <ShieldCheckIcon className="h-24 w-24" />
                      </motion.div>
                      <div className="relative z-10">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-3">
                          <ShieldCheckIcon className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg">Sign Waivers! 📝</h3>
                        <p className="text-sm text-white/90 mt-1">Required to continue</p>
                      </div>
                    </motion.div>
                  </Link>
                )}

                {hasAddedDogs && (
                  <Link href="/dashboard/documents">
                    <motion.div
                      whileHover={{ scale: 1.08, y: -8 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 text-white rounded-2xl shadow-xl p-6 cursor-pointer overflow-hidden group"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity"
                      >
                        <DocumentIcon className="h-24 w-24" />
                      </motion.div>
                      <div className="relative z-10">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-3">
                          <DocumentIcon className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg">Documents 📄</h3>
                        <p className="text-sm text-white/90 mt-1">View vaccinations</p>
                      </div>
                    </motion.div>
                  </Link>
                )}

                {hasAddedDogs && (
                  <Link href="/dashboard/medications">
                    <motion.div
                      whileHover={{ scale: 1.08, y: -8 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 text-white rounded-2xl shadow-xl p-6 cursor-pointer overflow-hidden group"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity"
                      >
                        <BeakerIcon className="h-24 w-24" />
                      </motion.div>
                      <div className="relative z-10">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-3">
                          <BeakerIcon className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg">Medications 💊</h3>
                        <p className="text-sm text-white/90 mt-1">Track & manage</p>
                      </div>
                    </motion.div>
                  </Link>
                )}

                {canBook && (
                  <Link href="/dashboard/booking">
                    <motion.div
                      whileHover={{ scale: 1.08, y: -8 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-600 text-white rounded-2xl shadow-xl p-6 cursor-pointer overflow-hidden group"
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -top-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity"
                      >
                        <CalendarIcon className="h-24 w-24" />
                      </motion.div>
                      <div className="relative z-10">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-3">
                          <CalendarIcon className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg">Book Days 📅</h3>
                        <p className="text-sm text-white/90 mt-1">Schedule playtime</p>
                      </div>
                    </motion.div>
                  </Link>
                )}

                <Link href="/dashboard/assessment/schedule">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 text-white rounded-2xl shadow-xl p-6 cursor-pointer overflow-hidden group"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -top-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity"
                    >
                      <CalendarDaysIcon className="h-24 w-24" />
                    </motion.div>
                    <div className="relative z-10">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-3">
                        <CalendarDaysIcon className="h-8 w-8" />
                      </div>
                      <h3 className="font-bold text-lg">Assessment 🎯</h3>
                      <p className="text-sm text-white/90 mt-1">£40 • Book now</p>
                    </div>
                  </motion.div>
                </Link>

                <Link href="/dashboard/subscriptions">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-br from-pink-500 via-rose-600 to-red-600 text-white rounded-2xl shadow-xl p-6 cursor-pointer overflow-hidden group"
                  >
                    <motion.div
                      animate={{ x: [0, 5, -5, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity }}
                      className="absolute -top-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity"
                    >
                      <CreditCardIcon className="h-24 w-24" />
                    </motion.div>
                    <div className="relative z-10">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-3">
                        <CreditCardIcon className="h-8 w-8" />
                      </div>
                      <h3 className="font-bold text-lg">Subscriptions 💳</h3>
                      <p className="text-sm text-white/90 mt-1">View all packages</p>
                    </div>
                  </motion.div>
                </Link>

                {hasSignedAgreements && (
                  <Link href="/dashboard/view-agreements">
                    <motion.div
                      whileHover={{ scale: 1.08, y: -8 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative bg-gradient-to-br from-slate-500 via-gray-600 to-zinc-600 text-white rounded-2xl shadow-xl p-6 cursor-pointer overflow-hidden group"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity"
                      >
                        <DocumentTextIcon className="h-24 w-24" />
                      </motion.div>
                      <div className="relative z-10">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-3">
                          <DocumentTextIcon className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg">View Waivers 📋</h3>
                        <p className="text-sm text-white/90 mt-1">Legal documents</p>
                      </div>
                    </motion.div>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column - Status & Info */}
            <div className="space-y-6">

              {/* Important Notices */}
              {!profileComplete && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-xl"
                >
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-6 w-6 mt-0.5 mr-3" />
                    <div className="flex-1">
                      <h3 className="font-bold">Complete Your Profile</h3>
                      <p className="text-sm text-white/90 mt-1">
                        We need your contact info
                      </p>
                      <Link href="/dashboard/profile">
                        <button className="bg-white text-amber-600 px-3 py-1 rounded-lg text-sm font-bold mt-3">
                          Complete Now →
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Fun Welcome Package */}
              {!subscription && canBook && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 text-white overflow-hidden"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-10 -right-10 opacity-20"
                  >
                    <GiftIcon className="h-32 w-32" />
                  </motion.div>

                  <div className="relative z-10">
                    <SparklesIcon className="h-12 w-12 mb-3 animate-pulse" />
                    <h3 className="text-xl font-bold mb-2">
                      Special Offer!
                    </h3>
                    <p className="text-sm text-white/90 mb-4">
                      Save up to £5/day with our monthly packages
                    </p>
                    <Link href="/dashboard/subscription">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="w-full bg-white text-purple-600 py-3 rounded-lg font-bold shadow-lg"
                      >
                        View Packages →
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Subscription Status */}
              {subscription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200"
                >
                  <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    Active Subscription
                  </h2>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-gray-600">Package</p>
                      <p className="font-bold text-green-900">
                        {subscription.days_included} days/month
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-gray-600">Days Remaining</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((subscription.days_remaining || 0) / subscription.days_included) * 100}%` }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                          />
                        </div>
                        <span className="text-sm font-bold text-green-900">
                          {subscription.days_remaining}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100"
                >
                  <h2 className="text-lg font-bold text-canine-navy mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-6 w-6 text-blue-600 animate-bounce" />
                    Upcoming Fun Days
                  </h2>
                  <div className="space-y-2">
                    {upcomingBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200"
                      >
                        <p className="font-bold text-gray-900">
                          {new Date(booking.booking_date).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                        <p className="text-xs text-gray-600">
                          Drop-off: {booking.drop_off_time}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Fun Paradise Info */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-canine-gold/20 to-amber-100 rounded-2xl shadow-lg p-6"
              >
                <h3 className="font-bold text-canine-navy mb-4 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-canine-gold" />
                  Canine Paradise
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-600" />
                    <span>Mon-Fri: 7:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-600" />
                    <span>07947 576128</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-4 w-4 text-amber-500" />
                    <span>14+ Years Experience</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-300">
                  <p className="text-xs text-gray-600 font-medium">
                    Assessment: £40
                  </p>
                </div>
              </motion.div>

              {/* Booking Calendar */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-2xl shadow-xl p-6 mt-6"
              >
                <h3 className="font-bold text-canine-navy mb-4 flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-6 w-6 text-canine-gold" />
                  Book Daycare Days
                </h3>

                {/* Warning Banners */}
                {!canBookDays && (
                  <div className="mb-4">
                    {dogs.length === 0 && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 text-sm">
                        <p className="font-semibold text-amber-900">Add Your Dog First</p>
                        <p className="text-amber-700 mt-1">Register at least one dog before booking.</p>
                        <Link href="/dashboard/add-dog" className="text-amber-900 underline font-medium mt-2 inline-block">
                          Add Dog →
                        </Link>
                      </div>
                    )}
                    {dogs.length > 0 && !hasApprovedDogs && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 text-sm">
                        <p className="font-semibold text-blue-900">Approval Pending</p>
                        <p className="text-blue-700 mt-1">Your dog needs approval before you can purchase a subscription.</p>
                      </div>
                    )}
                    {hasApprovedDogs && !subscription && (
                      <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 text-sm">
                        <p className="font-semibold text-purple-900">Purchase Subscription</p>
                        <p className="text-purple-700 mt-1">Get a subscription to start booking!</p>
                        <Link href="/dashboard/subscriptions" className="text-purple-900 underline font-medium mt-2 inline-block">
                          View Plans →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-canine-navy to-blue-900 text-white rounded-xl p-3">
                  <button onClick={previousMonth} className="p-1 hover:bg-white/10 rounded">
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <h4 className="text-lg font-bold">{monthName}</h4>
                  <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded">
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="mb-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center font-semibold text-gray-600 text-xs py-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const dateStatus = getDateStatus(dateString)
                      const isSelected = selectedDates.includes(dateString)
                      const isBooked = bookedDates.includes(dateString)
                      const date = new Date(dateString)
                      const isPast = dateStatus === 'past'
                      const isWeekend = dateStatus === 'weekend'
                      const isAvailableDate = dateStatus === 'available'

                      // Determine styling
                      let buttonClass = 'aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all '

                      if (isSelected) {
                        // User has selected this date
                        buttonClass += 'bg-gradient-to-br from-canine-gold to-amber-400 text-white shadow-md'
                      } else if (isBooked) {
                        // User already has this booked
                        buttonClass += 'bg-blue-100 text-blue-600 border-2 border-blue-300 text-xs font-bold'
                      } else if (isPast) {
                        // Past date
                        buttonClass += 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      } else if (isWeekend) {
                        // Weekend (closed)
                        buttonClass += 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      } else if (isAvailableDate) {
                        // Available weekday - show as available even if user can't book
                        if (canBookDays) {
                          buttonClass += 'bg-green-50 hover:bg-canine-sky text-gray-700 border border-green-200 hover:border-canine-gold cursor-pointer'
                        } else {
                          buttonClass += 'bg-green-50 text-gray-700 border border-green-200 cursor-not-allowed'
                        }
                      } else {
                        buttonClass += 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => canBookDays && isAvailableDate && !isBooked && toggleDate(dateString)}
                          disabled={!canBookDays || !isAvailableDate || isBooked}
                          className={buttonClass}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 text-xs mb-4 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-4 h-4 rounded bg-gradient-to-br from-canine-gold to-amber-400"
                    ></motion.div>
                    <span className="font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
                    <span className="font-medium">Booked</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-green-50 border border-green-200"></div>
                    <span className="font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-gray-100"></div>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>

                {/* Selected Info & Dogs */}
                {canBookDays && (
                  <div className="space-y-3">
                    {subscription && (
                      <div className="bg-canine-sky rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Days Remaining:</span>
                          <span className="font-bold text-canine-navy">{subscription.days_remaining || 0}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-700">Days Selected:</span>
                          <span className="font-bold text-canine-gold">{selectedDates.length}</span>
                        </div>
                      </div>
                    )}

                    {/* Dog Selection */}
                    {hasApprovedDogs && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Select Dogs:</p>
                        <div className="space-y-2">
                          {dogs.filter(dog => dog.is_approved).map(dog => (
                            <label key={dog.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="checkbox"
                                checked={selectedDogs.includes(dog.id)}
                                onChange={() => toggleDog(dog.id)}
                                className="text-canine-gold focus:ring-canine-gold rounded"
                              />
                              <span className="text-sm font-medium text-gray-800">{dog.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Session Type Selection */}
                    {selectedDates.length > 0 && selectedDogs.length > 0 && (
                      <div className="bg-white rounded-xl border-2 border-canine-gold p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Choose Session Type:</p>
                        <div className="space-y-3">
                          {/* Full Day Option */}
                          <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            sessionType === 'full_day'
                              ? 'border-canine-gold bg-amber-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="sessionType"
                              value="full_day"
                              checked={sessionType === 'full_day'}
                              onChange={() => setSessionType('full_day')}
                              className="mt-1 text-canine-gold focus:ring-canine-gold"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-canine-navy">Full Day</span>
                                <SunIcon className="h-5 w-5 text-amber-500" />
                              </div>
                              <p className="text-xs text-gray-600 mt-1">7:00 AM - 7:00 PM</p>
                              <p className="text-sm font-semibold text-canine-gold mt-2">
                                £{subscription?.tier ? ({'4_days': 40, '8_days': 38, '12_days': 37, '16_days': 36, '20_days': 35}[subscription.tier] || 40) : 40}/day
                              </p>
                            </div>
                          </label>

                          {/* Half Day Option */}
                          <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            sessionType === 'half_day'
                              ? 'border-canine-gold bg-amber-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="sessionType"
                              value="half_day"
                              checked={sessionType === 'half_day'}
                              onChange={() => setSessionType('half_day')}
                              className="mt-1 text-canine-gold focus:ring-canine-gold"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-canine-navy">Half Day</span>
                                <ClockIcon className="h-5 w-5 text-blue-500" />
                              </div>
                              <p className="text-xs text-gray-600 mt-1">10:00 AM - 2:00 PM</p>
                              <p className="text-sm font-semibold text-canine-gold mt-2">
                                £{subscription?.tier ? ({'4_days': 30, '8_days': 28.50, '12_days': 27.75, '16_days': 27, '20_days': 25}[subscription.tier] || 30) : 30}/day
                              </p>
                            </div>
                          </label>
                        </div>

                        {/* Pricing Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{selectedDates.length} day(s) × {selectedDogs.length} dog(s)</span>
                            <span className="font-bold text-canine-navy">
                              £{(
                                (sessionType === 'full_day'
                                  ? (subscription?.tier ? ({'4_days': 40, '8_days': 38, '12_days': 37, '16_days': 36, '20_days': 35}[subscription.tier] || 40) : 40)
                                  : (subscription?.tier ? ({'4_days': 30, '8_days': 28.50, '12_days': 27.75, '16_days': 27, '20_days': 25}[subscription.tier] || 30) : 30)
                                ) * selectedDogs.length
                              ).toFixed(2)} per day
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    {selectedDates.length > 0 && selectedDogs.length > 0 && (
                      <motion.button
                        onClick={handleBooking}
                        disabled={submitting}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-canine-gold via-amber-400 to-canine-light-gold hover:from-amber-500 hover:to-yellow-400 text-white py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all relative overflow-hidden"
                      >
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {submitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                              />
                              Booking...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="h-5 w-5" />
                              Confirm Booking ({selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''}) 🎉
                            </>
                          )}
                        </span>
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Fun Tip Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-xl p-6 mt-6 text-white relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 opacity-20"
                >
                  <SparklesIcon className="h-32 w-32" />
                </motion.div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      💡
                    </motion.div>
                    Did You Know?
                  </h3>
                  <p className="text-sm text-white/90">{currentTip}</p>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}