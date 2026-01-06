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
  HomeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ChevronDownIcon,
  TicketIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid, StarIcon as StarSolid, StarIcon } from '@heroicons/react/24/solid'

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
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [todaysBookings, setTodaysBookings] = useState<any[]>([])
  const [dogMedications, setDogMedications] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [bookMenuOpen, setBookMenuOpen] = useState(false)

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

      const today = new Date().toISOString().split('T')[0]

      // First fetch dogs to get their IDs for filtering medications
      const dogsRes = await supabase.from('dogs').select('*').eq('owner_id', user.id).order('created_at', { ascending: true })
      const userDogIds = (dogsRes.data || []).map(d => d.id)

      const [
        profileRes,
        legalRes,
        subscriptionRes,
        allBookingsRes,
        allIndividualDayBookingsRes,
        assessmentBookingsRes,
        todaysBookingsRes,
        todaysIndividualBookingsRes,
        medicationsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('legal_agreements').select('*').eq('user_id', user.id).maybeSingle(),
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
        `).eq('user_id', user.id).in('booking_status', ['confirmed', 'pending']).order('booked_at', { ascending: false }),
        // Today's subscription bookings with check-in/out and feeding info
        supabase.from('bookings').select(`
          *,
          dog_ids
        `).eq('user_id', user.id).eq('booking_date', today).neq('status', 'cancelled'),
        // Today's individual day bookings
        supabase.from('individual_day_bookings').select('*').eq('user_id', user.id).eq('booking_date', today).neq('status', 'cancelled'),
        // Active medications for user's dogs only
        userDogIds.length > 0
          ? supabase.from('dog_medications').select('*').eq('is_active', true).in('dog_id', userDogIds)
          : Promise.resolve({ data: [] })
      ])

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

      const activeSubs = subscriptionRes.data || []
      setSubscriptions(activeSubs)

      if (activeSubs.length > 0) {
        const totalDaysRemaining = activeSubs.reduce((sum, sub) => sum + (sub.days_remaining || 0), 0)
        const totalDaysIncluded = activeSubs.reduce((sum, sub) => sum + (sub.days_included || 0), 0)
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

      const allBookingsCombined = [
        ...(allBookingsRes.data || []),
        ...(allIndividualDayBookingsRes.data || [])
      ].sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())

      setUpcomingBookings([...upcomingSubscriptionBookings, ...upcomingIndividualBookings])
      setAllBookings(allBookingsCombined)

      // Set today's bookings (combine subscription and individual day bookings)
      const allTodaysBookings = [
        ...(todaysBookingsRes.data || []),
        ...(todaysIndividualBookingsRes.data || []).map(b => ({ ...b, is_individual: true }))
      ]
      setTodaysBookings(allTodaysBookings)

      // Set medications (already filtered by dog_id at query level)
      setDogMedications(medicationsRes.data || [])

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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-canine-gold/30 border-t-canine-gold mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const firstName = profile?.first_name || 'Friend'
  const lastName = profile?.last_name || ''
  const isApproved = profile?.approval_status === 'approved'
  const hasSignedAgreements = !!legalAgreements?.terms_accepted

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : profile?.first_name
    ? profile.first_name[0].toUpperCase()
    : 'U'

  const today = new Date().toISOString().split('T')[0]
  const upcomingBookingsList = allBookings.filter(b => b.booking_date >= today)

  const hasFilledProfile = profile?.first_name && profile?.last_name && profile?.phone && profile?.address
  const hasAddedDogs = dogs.length > 0
  const hasBookedAssessment = assessmentBookings.length > 0 || dogs.some(dog => dog.assessment_completed || dog.assessment_date || dog.assessment_slot_id)

  // Get the primary dog to feature
  const primaryDog = dogs.find(d => d.is_approved) || dogs[0]

  // Generate calendar data
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  // Check which days have bookings
  const bookedDays = upcomingBookingsList.map(b => {
    const date = new Date(b.booking_date)
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      return date.getDate()
    }
    return null
  }).filter(Boolean)

  // Get next action for user
  const getNextAction = () => {
    if (!hasFilledProfile) return { label: 'Complete Your Profile', href: '/dashboard/profile', icon: '📝' }
    if (!hasAddedDogs) return { label: 'Add Your Dog', href: '/dashboard/add-dog?new=true', icon: '🐕' }
    if (!hasBookedAssessment) return { label: 'Book Assessment', href: '/dashboard/assessment/schedule', icon: '📅' }
    if (!isApproved) return { label: 'Awaiting Approval', href: null, icon: '⏳' }
    return null
  }
  const nextAction = getNextAction()

  // Navigation items
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: HomeIcon, active: true },
    { label: 'My Dogs', href: '/dashboard/add-dog', icon: HeartIcon },
    { label: 'Assessments', href: '/dashboard/assessment/book-slot', icon: ClipboardDocumentListIcon },
    { label: 'Bookings', href: '/dashboard/manage-bookings', icon: CalendarDaysIcon },
    { label: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon },
    { label: 'Profile', href: '/dashboard/profile', icon: UserIcon },
  ]

  return (
    <div className="min-h-screen bg-canine-cream flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-canine-navy text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}>
        {/* Logo with close button on mobile */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between lg:justify-center">
          <Link href="/" className="flex-shrink-0">
            <img
              src="/Logo-footer.png"
              alt="Aldenham Doggy Day Care"
              className="h-16 lg:h-20 w-auto object-contain"
            />
          </Link>
          {/* Close button - mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setSidebarOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.active
                  ? 'bg-canine-gold text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}

          {/* VIP Badge - right after nav items */}
          {profile?.is_vip_member && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link href="/dashboard/vip-benefits" onClick={() => setSidebarOpen(false)}>
                <div className="flex items-center gap-3 bg-canine-gold/20 rounded-xl p-3 cursor-pointer transition-all hover:bg-canine-gold/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-canine-gold/20 group">
                  <img src="/VIP.png" alt="VIP" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-canine-gold font-bold text-sm">Golden Paw VIP</p>
                    <p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors">10% off all bookings</p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-canine-gold/50 group-hover:text-canine-gold group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile bottom padding for safe area */}
        <div className="lg:hidden h-6" />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {firstName}!</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* BOOK NOW Dropdown - Main booking action */}
              <div className="relative">
                <button
                  onClick={() => setBookMenuOpen(!bookMenuOpen)}
                  className="flex items-center gap-2 bg-canine-gold hover:bg-canine-light-gold text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Book Now</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${bookMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Book Menu Dropdown */}
                {bookMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setBookMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-bold text-canine-navy">Book Daycare</p>
                        <p className="text-xs text-gray-500">Choose how you'd like to book</p>
                      </div>

                      {/* Individual Days */}
                      <Link href="/dashboard/individual-days" onClick={() => setBookMenuOpen(false)}>
                        <div className="flex items-start gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-50">
                          <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CalendarDaysIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Book Individual Days</p>
                            <p className="text-xs text-gray-500">Pay per day - from £38/day</p>
                          </div>
                        </div>
                      </Link>

                      {/* Subscriptions */}
                      <Link href="/dashboard/subscriptions" onClick={() => setBookMenuOpen(false)}>
                        <div className="flex items-start gap-3 px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-50">
                          <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCardIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Get a Subscription</p>
                            <p className="text-xs text-gray-500">Save up to 20% with monthly plans</p>
                          </div>
                        </div>
                      </Link>

                      {/* Use Subscription Days - only if they have a subscription */}
                      {subscription && (
                        <Link href="/dashboard/booking" onClick={() => setBookMenuOpen(false)}>
                          <div className="flex items-start gap-3 px-4 py-3 hover:bg-canine-gold/10 cursor-pointer border-b border-gray-50">
                            <div className="h-10 w-10 bg-canine-gold rounded-lg flex items-center justify-center flex-shrink-0">
                              <TicketIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">Use Subscription Days</p>
                              <p className="text-xs text-canine-gold font-medium">{subscription.days_remaining || 0} days remaining</p>
                            </div>
                          </div>
                        </Link>
                      )}

                      {/* Assessment */}
                      <Link href="/dashboard/assessment/book-slot" onClick={() => setBookMenuOpen(false)}>
                        <div className="flex items-start gap-3 px-4 py-3 hover:bg-teal-50 cursor-pointer">
                          <div className="h-10 w-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Book Assessment</p>
                            <p className="text-xs text-gray-500">Required for new dogs - £40</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <BellIcon className="h-6 w-6 text-gray-600" />
                {nextAction && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-canine-gold rounded-full" />
                )}
              </button>

              {/* User avatar with dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-canine-gold flex items-center justify-center text-white font-bold">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-800">{firstName} {lastName}</p>
                    {profile?.is_vip_member && (
                      <p className="text-xs text-canine-gold flex items-center gap-1">
                        <StarSolid className="h-3 w-3" /> VIP Member
                      </p>
                    )}
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-gray-500 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{firstName} {lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-700">My Profile</span>
                        </div>
                      </Link>
                      <Link href="/dashboard/add-dog" onClick={() => setUserMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <HeartIcon className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-700">My Dogs</span>
                        </div>
                      </Link>
                      <Link href="/dashboard/manage-bookings" onClick={() => setUserMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-700">My Bookings</span>
                        </div>
                      </Link>
                      <Link href="/dashboard/subscriptions" onClick={() => setUserMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <CreditCardIcon className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-700">Manage Subscriptions</span>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            handleSignOut()
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer w-full text-left"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
                          <span className="text-sm text-red-600 font-medium">Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Hero Card */}
              <div className={`bg-gradient-to-r from-canine-navy to-[#2a5a6a] rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-white relative overflow-hidden ${profile?.is_vip_member ? 'ring-[6px] ring-canine-gold shadow-[0_0_30px_rgba(166,135,86,0.5)]' : ''}`}>

                  <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-canine-gold/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-canine-gold/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex flex-col lg:flex-row gap-4 sm:gap-6 items-center">
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Your Pup's Home</h2>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-canine-gold mb-3 sm:mb-4">Away From Home</h2>
                    <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">Welcome back, {firstName}! Your trusted daycare in the heart of Aldenham Country Park.</p>

                    {nextAction && nextAction.href ? (
                      <Link href={nextAction.href}>
                        <button className="bg-canine-gold hover:bg-canine-light-gold text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                          {nextAction.icon} {nextAction.label}
                          <ArrowRightIcon className="h-5 w-5" />
                        </button>
                      </Link>
                    ) : nextAction ? (
                      <div className="inline-flex items-center gap-2 bg-canine-gold/20 text-canine-light-gold py-3 px-6 rounded-xl">
                        {nextAction.icon} {nextAction.label}
                      </div>
                    ) : (
                      <Link href="/dashboard/subscriptions">
                        <button className="group bg-gradient-to-r from-canine-gold to-[#b8965f] hover:from-[#b8965f] hover:to-canine-gold text-white font-bold py-3.5 px-7 rounded-xl inline-flex items-center gap-2 transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(166,135,86,0.4)] hover:scale-105">
                          <CreditCardIcon className="h-5 w-5 group-hover:animate-pulse" /> Get a Subscription
                          <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    )}
                  </div>

                  {/* VIP Badge - Between text and dog image */}
                  {profile?.is_vip_member && (
                    <div className="flex flex-col items-center justify-center px-2 sm:px-4">
                      <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-transparent via-canine-gold to-transparent hidden lg:block"></div>
                      <span className="text-canine-gold font-bold text-lg sm:text-xl tracking-widest py-2">VIP</span>
                      <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-transparent via-canine-gold to-transparent hidden lg:block"></div>
                    </div>
                  )}

                  {/* Featured Dog Image */}
                  {primaryDog && (
                    <div className="relative">
                      <div className="h-28 w-28 sm:h-40 sm:w-40 lg:h-48 lg:w-48 rounded-xl sm:rounded-2xl overflow-hidden border-3 sm:border-4 border-white/20 shadow-2xl">
                        {primaryDog.photo_url ? (
                          <img
                            src={primaryDog.photo_url}
                            alt={primaryDog.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-canine-gold to-canine-light-gold flex items-center justify-center">
                            <span className="text-4xl sm:text-6xl font-bold text-white/80">{primaryDog.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 shadow-lg">
                        <p className="text-xs sm:text-sm font-bold text-gray-800">{primaryDog.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription Stats Strip - Elegant at-a-glance bar */}
              <div className="bg-canine-navy/[0.03] rounded-2xl px-6 sm:px-10 lg:px-12 py-5 sm:py-6">
                <div className="flex items-center justify-center">
                  {/* Desktop: horizontal row with dividers | Mobile: 2x2 grid */}
                  <div className="hidden sm:flex items-center justify-center gap-0 divide-x divide-canine-navy/10">
                    {/* Next Visit */}
                    <div className="flex items-center gap-3 px-8 lg:px-10 group cursor-default" title={upcomingBookings.length > 0 ? `Booked for ${new Date(upcomingBookings[0].booking_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}` : 'No upcoming bookings'}>
                      <CalendarIcon className="h-5 w-5 text-canine-gold" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">Next Visit</p>
                        <p className="text-base font-semibold text-canine-navy">
                          {upcomingBookings.length > 0
                            ? new Date(upcomingBookings[0].booking_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                            : '—'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Days Remaining */}
                    <div className="flex items-center gap-3 px-8 lg:px-10 group cursor-default" title={subscription?.current_period_end ? `Resets on ${new Date(subscription.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'No active subscription'}>
                      <TicketIcon className="h-5 w-5 text-canine-gold" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">Days Left</p>
                        <p className="text-base font-semibold text-canine-navy">
                          {subscription ? `${subscription.days_remaining || 0} this month` : '—'}
                        </p>
                      </div>
                    </div>

                    {/* VIP Savings or Subscription Status */}
                    {profile?.is_vip_member ? (
                      <div className="flex items-center gap-3 px-8 lg:px-10 group cursor-default" title="10% off all bookings applied automatically">
                        <StarIcon className="h-5 w-5 text-canine-gold" />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">VIP Savings</p>
                          <p className="text-base font-semibold text-canine-gold">10% Active</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 px-8 lg:px-10 group cursor-default">
                        <CreditCardIcon className="h-5 w-5 text-canine-gold" />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">Plan</p>
                          <p className="text-base font-semibold text-canine-navy">
                            {subscription?.subscription_tiers?.name || 'No Plan'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-3 px-8 lg:px-10 group cursor-default">
                      <div className={`h-2.5 w-2.5 rounded-full ${subscription?.is_active && !subscription?.is_paused ? 'bg-green-500' : subscription?.is_paused ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">Status</p>
                        <p className={`text-base font-semibold ${subscription?.is_active && !subscription?.is_paused ? 'text-green-600' : subscription?.is_paused ? 'text-amber-600' : 'text-gray-500'}`}>
                          {subscription?.is_active && !subscription?.is_paused ? 'Active' : subscription?.is_paused ? 'Paused' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile: 2x2 grid */}
                  <div className="sm:hidden grid grid-cols-2 gap-5 w-full">
                    {/* Next Visit */}
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-canine-gold flex-shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">Next Visit</p>
                        <p className="text-sm font-semibold text-canine-navy">
                          {upcomingBookings.length > 0
                            ? new Date(upcomingBookings[0].booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                            : '—'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Days Remaining */}
                    <div className="flex items-center gap-3">
                      <TicketIcon className="h-5 w-5 text-canine-gold flex-shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">Days Left</p>
                        <p className="text-sm font-semibold text-canine-navy">
                          {subscription ? `${subscription.days_remaining || 0}` : '—'}
                        </p>
                      </div>
                    </div>

                    {/* VIP or Plan */}
                    {profile?.is_vip_member ? (
                      <div className="flex items-center gap-3">
                        <StarIcon className="h-5 w-5 text-canine-gold flex-shrink-0" />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">VIP</p>
                          <p className="text-sm font-semibold text-canine-gold">10% Off</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <CreditCardIcon className="h-5 w-5 text-canine-gold flex-shrink-0" />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">Plan</p>
                          <p className="text-sm font-semibold text-canine-navy truncate">
                            {subscription?.subscription_tiers?.name || 'None'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${subscription?.is_active && !subscription?.is_paused ? 'bg-green-500' : subscription?.is_paused ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-0.5">Status</p>
                        <p className={`text-sm font-semibold ${subscription?.is_active && !subscription?.is_paused ? 'text-green-600' : subscription?.is_paused ? 'text-amber-600' : 'text-gray-500'}`}>
                          {subscription?.is_active && !subscription?.is_paused ? 'Active' : subscription?.is_paused ? 'Paused' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Dogs - Circular Profile Design */}
              {dogs.length > 0 && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <HeartSolid className="h-5 w-5 text-canine-gold" />
                      <h3 className="font-bold text-canine-navy text-lg">My Dogs</h3>
                    </div>
                    <Link href="/dashboard/add-dog?new=true">
                      <button className="bg-canine-gold hover:bg-canine-light-gold text-white text-sm font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-sm">
                        <PlusIcon className="h-4 w-4" /> Add Dog
                      </button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 sm:gap-10 py-4">
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
                        className="group flex flex-col items-center cursor-pointer px-2"
                      >
                        {/* Circular Photo with Gold Ring */}
                        <div className="relative mb-3">
                          <div className="p-1 rounded-full bg-gradient-to-br from-canine-gold to-canine-light-gold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                            {dog.photo_url ? (
                              <img
                                src={dog.photo_url}
                                alt={dog.name}
                                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-2 border-white"
                              />
                            ) : (
                              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-canine-cream border-2 border-white flex items-center justify-center">
                                <span className="text-2xl sm:text-3xl font-bold text-canine-navy">{dog.name[0]}</span>
                              </div>
                            )}
                          </div>
                          {/* Status Badge */}
                          {dog.is_approved ? (
                            <div className="absolute -bottom-1 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white shadow-sm">
                              <CheckCircleIcon className="h-3.5 w-3.5 text-white" />
                            </div>
                          ) : dog.is_draft ? (
                            <div className="absolute -bottom-1 right-0 bg-orange-400 rounded-full p-1.5 border-2 border-white shadow-sm">
                              <ClockIcon className="h-3.5 w-3.5 text-white" />
                            </div>
                          ) : (
                            <div className="absolute -bottom-1 right-0 bg-canine-gold rounded-full p-1.5 border-2 border-white shadow-sm">
                              <ClockIcon className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Dog Name & Breed */}
                        <p className="font-bold text-canine-navy text-center text-sm sm:text-base group-hover:text-canine-gold transition-colors">
                          {dog.name}
                        </p>
                        <p className="text-xs text-gray-500 text-center truncate max-w-[100px]">
                          {dog.breed}
                        </p>
                        {dog.is_approved ? (
                          <span className="text-xs font-medium text-green-600 mt-1">Approved</span>
                        ) : dog.is_draft ? (
                          <span className="text-xs font-medium text-orange-500 mt-1">Draft</span>
                        ) : (
                          <span className="text-xs font-medium text-canine-gold mt-1">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscription Summary - Show each dog's subscription */}
              {subscriptions.length > 0 && (
                <div className="space-y-4">
                  {subscriptions.map((sub: any) => (
                    <div key={sub.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-canine-gold rounded-xl flex items-center justify-center">
                            <CreditCardIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-canine-navy text-lg">{sub.subscription_tiers?.name || 'Subscription'}</h3>
                            <p className="text-gray-500 text-sm">For {sub.dogs?.name || 'your dog'}</p>
                          </div>
                        </div>
                        {sub.is_paused ? (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-full">Paused</span>
                        ) : (
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1.5 rounded-full">Active</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between bg-canine-gold/10 rounded-xl p-4">
                        <div className="text-center flex-1">
                          <p className="text-3xl font-bold text-canine-gold">{sub.days_remaining || 0}</p>
                          <p className="text-gray-600 text-xs">days left</p>
                        </div>
                        <div className="h-10 w-px bg-canine-gold/20"></div>
                        <div className="text-center flex-1">
                          <p className="text-3xl font-bold text-canine-navy">{sub.days_included || 0}</p>
                          <p className="text-gray-600 text-xs">per month</p>
                        </div>
                        <div className="h-10 w-px bg-canine-gold/20"></div>
                        <div className="text-center flex-1">
                          <p className="text-3xl font-bold text-canine-navy">£{sub.monthly_price || 0}</p>
                          <p className="text-gray-600 text-xs">monthly</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming Visits */}
              {upcomingBookingsList.length > 0 && (
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-gray-800">Upcoming Visits</h3>
                    <Link href="/dashboard/manage-bookings">
                      <button className="text-canine-gold hover:text-canine-light-gold text-sm font-medium">View All</button>
                    </Link>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {upcomingBookingsList.slice(0, 3).map((booking) => {
                      const bookingDate = new Date(booking.booking_date)
                      return (
                        <div key={booking.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 border border-green-100 rounded-xl">
                          <div className="h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm flex-shrink-0">
                            <p className="text-lg sm:text-xl font-bold text-green-600">{bookingDate.getDate()}</p>
                            <p className="text-xs text-gray-500 uppercase">{bookingDate.toLocaleDateString('en-GB', { month: 'short' })}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{bookingDate.toLocaleDateString('en-GB', { weekday: 'long' })}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{booking.total_dogs || 1} dog{(booking.total_dogs || 1) > 1 ? 's' : ''}</p>
                          </div>
                          <span className="bg-green-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex-shrink-0">Confirmed</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="space-y-4 sm:space-y-6">

              {/* Calendar Widget */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 sm:mb-4">{monthName}</h3>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-xs font-medium text-gray-400 py-2">{day}</div>
                  ))}
                  {calendarDays.map((day, index) => {
                    const isToday = day === currentDate.getDate()
                    const hasBooking = bookedDays.includes(day)
                    return (
                      <div
                        key={index}
                        className={`aspect-square flex items-center justify-center text-sm rounded-lg relative ${
                          day === null ? '' :
                          isToday ? 'text-white font-bold' :
                          hasBooking ? 'bg-green-100 text-green-700 font-medium' :
                          'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {/* Paw print background for today */}
                        {isToday && day !== null && (
                          <img src="/pawprint.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[95%] h-[95%] object-contain" />
                        )}
                        <span className={isToday ? 'relative z-10 translate-y-[3px]' : ''}>{day}</span>
                        {hasBooking && !isToday && (
                          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-1 bg-green-500 rounded-full" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Today's Bookings - Shows dogs booked today with check-in/out status */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 sm:mb-4">Today's Visit</h3>
                {todaysBookings.length > 0 ? (
                  <div className="space-y-3">
                    {todaysBookings.map((booking) => {
                      // Get dogs for this booking
                      const bookingDogIds = booking.dog_ids || (booking.dog_id ? [booking.dog_id] : [])
                      const bookingDogs = dogs.filter(d => bookingDogIds.includes(d.id))

                      // Get medications for these dogs
                      const dogsWithMeds = bookingDogs.map(dog => ({
                        ...dog,
                        medications: dogMedications.filter(m => m.dog_id === dog.id)
                      }))

                      return (
                        <div key={booking.id} className="space-y-2">
                          {dogsWithMeds.map((dog) => (
                            <div key={dog.id} className="p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-3 mb-2">
                                {/* Dog photo */}
                                <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-canine-gold">
                                  {dog.photo_url ? (
                                    <img src={dog.photo_url} alt={dog.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full bg-canine-gold/20 flex items-center justify-center">
                                      <span className="text-sm font-bold text-canine-gold">{dog.name[0]}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-canine-navy text-sm">{dog.name}</p>
                                  <p className="text-xs text-gray-500">{booking.is_individual ? 'Individual Day' : 'Subscription'}</p>
                                </div>
                              </div>

                              {/* Check-in/Check-out Status */}
                              <div className="flex items-center gap-2 mb-2">
                                {booking.checked_in ? (
                                  <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    <CheckCircleIcon className="h-3.5 w-3.5" />
                                    <span>Checked in {booking.checked_in_at ? new Date(booking.checked_in_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                    <ClockIcon className="h-3.5 w-3.5" />
                                    <span>Awaiting drop-off</span>
                                  </div>
                                )}
                                {booking.checked_out && (
                                  <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    <CheckCircleIcon className="h-3.5 w-3.5" />
                                    <span>Picked up {booking.checked_out_at ? new Date(booking.checked_out_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                  </div>
                                )}
                              </div>

                              {/* Feeding info */}
                              {(booking.needs_breakfast || booking.needs_lunch || booking.needs_dinner) && (
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-gray-500">Feeding:</span>
                                  {booking.needs_breakfast && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${booking.breakfast_completed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                      Breakfast {booking.breakfast_completed && '✓'}
                                    </span>
                                  )}
                                  {booking.needs_lunch && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${booking.lunch_completed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                      Lunch {booking.lunch_completed && '✓'}
                                    </span>
                                  )}
                                  {booking.needs_dinner && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${booking.dinner_completed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                      Dinner {booking.dinner_completed && '✓'}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Medications */}
                              {dog.medications && dog.medications.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <span className="text-xs text-gray-500">Meds:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {dog.medications.map((med: any) => (
                                      <span key={med.id} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                        {med.medication_name} ({med.dosage})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-gray-500 text-sm">
                      No bookings today for {dogs.length > 0 ? dogs.map(d => d.name).join(dogs.length === 2 ? ' & ' : ', ') : 'your pups'}
                    </p>
                  </div>
                )}
              </div>

              {/* Assessment Booking */}
              {assessmentBookings.length > 0 && (() => {
                const upcomingAssessment = assessmentBookings.find(b => b.assessment_slots)
                if (!upcomingAssessment?.assessment_slots) return null

                const slot = upcomingAssessment.assessment_slots
                const assessmentDate = new Date(slot.assessment_date)
                const todayDate = new Date()
                todayDate.setHours(0, 0, 0, 0)

                if (assessmentDate < todayDate) return null

                return (
                  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 sm:mb-4">Assessment Booked</h3>
                    <div className="p-3 sm:p-4 bg-teal-50 border border-teal-100 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CalendarIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm sm:text-base">
                            {assessmentDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">at {slot.start_time.slice(0, 5)}</p>
                        </div>
                      </div>
                      <Link href="/dashboard/assessment/view">
                        <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 rounded-lg transition-all text-sm">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })()}

              {/* Documents Needed */}
              {(!hasSignedAgreements || dogs.some(d => !d.has_vaccination_docs && !d.is_draft)) && (
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3 sm:mb-4">Action Needed</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {!hasSignedAgreements && (
                      <Link href="/dashboard/legal-agreements">
                        <div className="flex items-center gap-3 p-3 bg-canine-gold/10 border border-canine-gold/30 rounded-xl cursor-pointer hover:bg-canine-gold/20 transition-all">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 bg-canine-gold rounded-lg flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm">Sign Agreement</p>
                            <p className="text-xs text-gray-500">Terms & conditions</p>
                          </div>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </Link>
                    )}
                    {dogs.filter(d => !d.has_vaccination_docs && !d.is_draft).slice(0, 2).map((dog) => (
                      <Link key={dog.id} href={`/dashboard/dogs/${dog.id}`}>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{dog.name}'s Vaccines</p>
                            <p className="text-xs text-gray-500">Upload records</p>
                          </div>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Card */}
              <div className="bg-canine-navy rounded-2xl p-4 sm:p-6 text-white">
                <h3 className="font-bold mb-2 sm:mb-3">Need Help?</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">We're here Monday to Friday, 7am - 7pm</p>
                <div className="space-y-2 sm:space-y-3">
                  <a href="tel:07963656556" className="flex items-center gap-2 text-sm hover:text-canine-gold transition-colors">
                    <span>📞</span>
                    <span>07963 656556</span>
                  </a>
                  <a href="mailto:admin@aldenhamdoggydaycare.com" className="flex items-center gap-2 text-xs sm:text-sm hover:text-canine-gold transition-colors">
                    <span>📧</span>
                    <span className="break-all">admin@aldenhamdoggydaycare.com</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
