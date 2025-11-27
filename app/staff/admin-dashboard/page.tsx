'use client'
// Admin Dashboard - Business Settings & Management
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  CalendarIcon,
  UserGroupIcon,
  CurrencyPoundIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  BeakerIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  PlusCircleIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
  BuildingOfficeIcon,
  Cog8ToothIcon,
  HomeIcon,
  ArrowRightIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
  DocumentArrowDownIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TicketIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleLeftIcon as QuoteIcon } from '@heroicons/react/24/solid'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Dog {
  id: string
  name: string
  breed: string
  age_years?: number
  age_months?: number
  gender?: string
  size?: string
  weight?: number
  color?: string
  photo_url?: string
  owner_id: string
  owner?: {
    first_name: string
    last_name: string
    phone: string
    email: string
    address?: string
    city?: string
    postcode?: string
  }
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  medical_conditions?: string
  medications?: string
  allergies?: string
  dietary_requirements?: string
  special_dietary_requirements?: string
  feeding_instructions?: string
  feeding_times?: string
  behavioral_notes?: string
  special_instructions?: string
  photo_permission?: boolean
  is_approved?: boolean
  assessment_completed?: boolean
  assessment_date?: string
  assessment_notes?: string
  vet_name?: string
  vet_phone?: string
  vaccinated?: boolean
  vaccination_expiry?: string
  neutered?: boolean
  microchipped?: boolean
  energy_level?: string
  good_with_dogs?: boolean
  good_with_puppies?: boolean
  good_with_people?: boolean
  authorized_dropoff_people?: string[]
  authorized_pickup_people?: string[]
  checkout_password?: string
  booking_id?: string
  checked_in?: boolean
  checked_out?: boolean
  checked_in_at?: string
  checked_out_at?: string
  dropped_off_by?: string
  picked_up_by?: string
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  dogs_count?: number
  subscription_status?: string
  created_at?: string
}

interface Assessment {
  id: string
  user_id: string
  requested_date: string
  status: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

interface StaffUser {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: string
  created_at: string
}

interface PlayGroup {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  max_dogs: number
  notes?: string
  active: boolean
  dog_play_groups?: Array<{
    dog_id: string
    priority: number
  }>
}

interface LegalAgreement {
  id: string
  user_id: string
  terms_agreed: boolean
  injury_waiver_agreed: boolean
  photo_permission_agreed: boolean
  recurring_billing_agreed: boolean
  password_policy_agreed: boolean
  signed_at: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

interface DogMedication {
  id: string
  dog_id: string
  medication_name: string
  dosage: string
  frequency: string
  start_date: string
  end_date?: string
  notes?: string
  dogs?: {
    name: string
    breed: string
    owner_id: string
  }
}

interface Incident {
  id: string
  booking_id: string
  dog_id: string
  incident_type: string
  description: string
  severity: string
  reported_by: string
  occurred_at: string
  created_at: string
}

interface FinancialTransaction {
  id: string
  user_id: string
  booking_id?: string
  stripe_payment_id?: string
  amount: number
  transaction_type: string
  status: string
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface DiscountUsage {
  id: string
  discount_code_id: string
  user_id: string
  used_for: string
  original_amount: number
  discount_amount: number
  final_amount: number
  created_at: string
  discount_codes?: {
    code: string
    discount_type: string
    discount_value: number
  }
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface StaffActivityLog {
  id: string
  staff_id: string
  action_type: 'approval' | 'decline' | 'check_in' | 'check_out' | 'booking_created'
  dog_id?: string
  dog_name?: string
  booking_id?: string
  user_id?: string
  user_name?: string
  notes?: string
  timestamp: string
  staff_name?: string
}

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
  user_id: string
  price?: number
  total_amount?: number
  payment_status?: string
  status: string
  profiles?: {
    first_name: string
    last_name: string
    phone: string
    email: string
  }
  dogs?: Dog[]
}

interface StaffAssignment {
  id: string
  assignment_date: string
  staff_id: string
  area_type: 'playground_1' | 'playground_2' | 'playground_3' | 'indoor_play' | 'reception' | 'feeding_area' | 'grooming' | 'other'
  area_name?: string
  shift_start: string
  shift_end: string
  assignment_notes?: string
  assigned_by_admin_id?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  checked_in_at?: string
  checked_out_at?: string
  created_at: string
  updated_at: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

interface StaffTask {
  id: string
  task_date: string
  task_title: string
  task_description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to_staff_id: string
  assigned_by_admin_id: string
  due_time?: string
  estimated_duration_minutes?: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completed_at?: string
  completion_notes?: string
  created_at: string
  updated_at: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

type TabType = 'dashboard' | 'checkin' | 'schedule' | 'dogs_today' | 'assessments' | 'all_dogs' | 'all_clients' | 'all_bookings' | 'staff_users' | 'staff_activity' | 'staff_performance' | 'staff_schedule' | 'legal' | 'medications' | 'incidents' | 'documents' | 'transactions' | 'monthly_revenue' | 'subscriptions' | 'cancellations' | 'business_settings' | 'playgroups' | 'pricing' | 'discounts' | 'newsletter'

export default function AdminDashboard() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [adminName, setAdminName] = useState('Admin')
  const [loading, setLoading] = useState(true)

  // Dropdown menu state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Stats
  const [totalDogs, setTotalDogs] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [dogsToday, setDogsToday] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [assessmentRevenue, setAssessmentRevenue] = useState(0)
  const [bookingRevenue, setBookingRevenue] = useState(0)
  const [recurringRevenue, setRecurringRevenue] = useState(0)
  const [pendingAssessments, setPendingAssessments] = useState(0)
  const [activeSubscriptions, setActiveSubscriptions] = useState(0)
  const [weeklyStats, setWeeklyStats] = useState<{
    day: string
    date: string
    fullDay: number
    halfDay: number
    total: number
  }[]>([])
  const [todayFullDay, setTodayFullDay] = useState(0)
  const [todayHalfDay, setTodayHalfDay] = useState(0)

  // Capacity tracking
  const [todayCapacity, setTodayCapacity] = useState({
    small: { current: 0, total: 20, available: 20 },
    large: { current: 0, total: 30, available: 30 }
  })

  // Schedule tab
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [scheduleBookings, setScheduleBookings] = useState<any[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)

  // Data
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<Dog[]>([])

  // Assessment calendar state
  const [assessmentCalendarMonth, setAssessmentCalendarMonth] = useState(new Date())
  const [scheduledAssessments, setScheduledAssessments] = useState<{date: string, dogs: Dog[]}[]>([])
  const [allDogs, setAllDogs] = useState<Dog[]>([])
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([])
  const [dogSearchQuery, setDogSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
  const [staffActivityLog, setStaffActivityLog] = useState<StaffActivityLog[]>([])
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [bookingSearchQuery, setBookingSearchQuery] = useState('')
  const [legalAgreements, setLegalAgreements] = useState<LegalAgreement[]>([])
  const [dogMedications, setDogMedications] = useState<DogMedication[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([])
  const [discountUsages, setDiscountUsages] = useState<DiscountUsage[]>([])

  // Business Settings accordion state - all sections open by default
  const [openSections, setOpenSections] = useState({
    assessment: true,
    hours: true,
    pricing: true,
    discounts: true,
    closedDays: true,
    sections: true,
    tiers: true
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Settings state
  const [settings, setSettings] = useState({
    assessment_fee: 40,
    assessment_day: '5', // 5 = Friday (default)
    max_dogs_per_day: 20,
    opening_time: '07:00',
    closing_time: '19:00',
    individual_day_price: 50,
    daily_dog_limit: 50,
    enable_individual_bookings: true,
  })

  // Subscription tiers from database
  const [subscriptionTiers, setSubscriptionTiers] = useState<any[]>([])

  // Cancelled subscriptions state
  const [cancelledSubscriptions, setCancelledSubscriptions] = useState<any[]>([])
  const [cancelledSubsFilter, setCancelledSubsFilter] = useState<'7days' | '30days' | '3months' | 'all'>('all')
  const [cancelledSubsSearch, setCancelledSubsSearch] = useState('')

  // Play Groups state
  const [playGroups, setPlayGroups] = useState<PlayGroup[]>([])
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<PlayGroup | null>(null)
  const [showAssignDogsModal, setShowAssignDogsModal] = useState(false)
  const [assigningToGroup, setAssigningToGroup] = useState<PlayGroup | null>(null)
  const [selectedDogsForGroup, setSelectedDogsForGroup] = useState<string[]>([])

  // Sections state
  const [sections, setSections] = useState<any[]>([])
  const [newSectionName, setNewSectionName] = useState('')
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionName, setEditingSectionName] = useState('')

  // Closed days state
  const [closedDays, setClosedDays] = useState<any[]>([])
  const [newClosedDate, setNewClosedDate] = useState('')
  const [newClosedReason, setNewClosedReason] = useState('')
  const [addingClosedDay, setAddingClosedDay] = useState(false)

  // Modal states
  const [showDogModal, setShowDogModal] = useState(false)
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)
  const [showClientDocsModal, setShowClientDocsModal] = useState(false)
  const [selectedClientForDocs, setSelectedClientForDocs] = useState<User | null>(null)

  // Recurring assessment slots state
  const [recurringSlots, setRecurringSlots] = useState<{
    id: string
    day_of_week: number
    start_time: string
    end_time: string
    is_active: boolean
  }[]>([])
  const [clientDogs, setClientDogs] = useState<Dog[]>([])
  const [clientLegalAgreement, setClientLegalAgreement] = useState<LegalAgreement | null>(null)

  // Newsletter state
  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [newsletterRecipients, setNewsletterRecipients] = useState<'all' | 'individual'>('all')
  const [selectedUserForEmail, setSelectedUserForEmail] = useState('')

  // Staff creation state
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffPassword, setNewStaffPassword] = useState('')
  const [newStaffFirstName, setNewStaffFirstName] = useState('')
  const [newStaffLastName, setNewStaffLastName] = useState('')
  const [newStaffPhone, setNewStaffPhone] = useState('')
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'admin'>('staff')
  const [staffPermissions, setStaffPermissions] = useState({
    can_view_today: true,
    can_check_in: true,
    can_check_out: true,
    can_approve_assessments: false,
    can_manage_playgroups: false,
    can_view_medications: true,
    can_feed_dogs: true,
    can_view_schedule: true,
    can_view_reports: false,
    can_manage_staff: false
  })

  // Staff Schedule & Assignment state
  const [staffMembers, setStaffMembers] = useState<StaffUser[]>([])
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([])
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>([])
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<StaffAssignment | null>(null)
  const [editingTask, setEditingTask] = useState<StaffTask | null>(null)
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0])
  const [assignmentFormData, setAssignmentFormData] = useState({
    staff_id: '',
    area_type: 'playground_1' as StaffAssignment['area_type'],
    area_name: '',
    shift_start: '07:00',
    shift_end: '19:00',
    assignment_notes: ''
  })
  const [taskFormData, setTaskFormData] = useState({
    assigned_to_staff_id: '',
    task_title: '',
    task_description: '',
    priority: 'medium' as StaffTask['priority'],
    due_time: '',
    estimated_duration_minutes: 0
  })
  const [assignmentFilterArea, setAssignmentFilterArea] = useState<string>('all')
  const [taskFilterStaff, setTaskFilterStaff] = useState<string>('all')
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>('all')
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchAdminProfile()
    fetchDashboardData()
    fetchPlayGroups()
    fetchSubscriptionTiers()
    fetchCancelledSubscriptions()
    fetchSettings()
    fetchRecurringSlots()
    fetchSections()
    fetchClosedDays()
    fetchLegalAgreements()
    fetchDogMedications()
    fetchIncidents()
    fetchFinancialTransactions()
    fetchAllBookings()
    fetchStaffActivityLog()
    fetchDiscountUsages()
  }, [])

  useEffect(() => {
    fetchScheduleForDate(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    const filtered = allDogs.filter(dog =>
      dog.name.toLowerCase().includes(dogSearchQuery.toLowerCase()) ||
      dog.breed.toLowerCase().includes(dogSearchQuery.toLowerCase())
    )
    setFilteredDogs(filtered)
  }, [dogSearchQuery, allDogs])

  useEffect(() => {
    const filtered = allUsers.filter(user =>
      user.first_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [userSearchQuery, allUsers])

  useEffect(() => {
    const filtered = allBookings.filter(booking =>
      booking.profiles?.first_name.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      booking.profiles?.last_name.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      booking.booking_date.includes(bookingSearchQuery)
    )
    setFilteredBookings(filtered)
  }, [bookingSearchQuery, allBookings])

  useEffect(() => {
    fetchAssessmentCalendar(assessmentCalendarMonth)
  }, [assessmentCalendarMonth])

  // Close dropdown when activeTab changes
  useEffect(() => {
    setOpenDropdown(null)
  }, [activeTab])

  // NEW TAB STRUCTURE with Dropdown Menus
  const menuStructure = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Squares2X2Icon,
      type: 'single' as const
    },
    {
      id: 'daily_operations',
      name: 'Daily Operations',
      icon: ClockIcon,
      type: 'dropdown' as const,
      items: [
        { id: 'checkin', name: "Today's Check-In/Out", icon: CheckCircleIcon },
        { id: 'dogs_today', name: 'Dogs Attending Today', icon: HeartIcon, badge: dogsToday },
      ]
    },
    {
      id: 'assessments',
      name: 'Assessments & Approvals',
      icon: ClipboardDocumentCheckIcon,
      type: 'single' as const,
      badge: pendingAssessments
    },
    {
      id: 'database',
      name: 'Database',
      icon: Squares2X2Icon,
      type: 'dropdown' as const,
      items: [
        { id: 'all_dogs', name: 'All Dogs', icon: HeartIcon },
        { id: 'all_clients', name: 'All Clients', icon: UserGroupIcon },
        { id: 'all_bookings', name: 'All Bookings History', icon: CalendarDaysIcon },
      ]
    },
    {
      id: 'staff_management',
      name: 'Staff Management',
      icon: UsersIcon,
      type: 'dropdown' as const,
      items: [
        { id: 'staff_users', name: 'Staff Users', icon: UserIcon },
        { id: 'staff_schedule', name: 'Staff Schedule & Assignments', icon: CalendarDaysIcon },
        { id: 'staff_activity', name: 'Staff Activity Log', icon: ClockIcon },
        { id: 'staff_performance', name: 'Performance', icon: ChartBarIcon },
      ]
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: ShieldCheckIcon,
      type: 'dropdown' as const,
      items: [
        { id: 'legal', name: 'Legal Agreements', icon: DocumentTextIcon },
        { id: 'medications', name: 'Medications', icon: BeakerIcon },
        { id: 'incidents', name: 'Incidents', icon: ExclamationTriangleIcon },
        { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
      ]
    },
    {
      id: 'financial',
      name: 'Business & Finance',
      icon: BanknotesIcon,
      type: 'dropdown' as const,
      items: [
        { id: 'business_settings', name: 'Business Settings', icon: BuildingOfficeIcon },
        { id: 'pricing', name: 'Pricing Tiers', icon: BanknotesIcon },
        { id: 'discounts', name: 'Discount Usage', icon: TicketIcon },
        { id: 'transactions', name: 'Transactions', icon: CurrencyPoundIcon },
        { id: 'monthly_revenue', name: 'Monthly Revenue', icon: ChartBarIcon },
        { id: 'subscriptions', name: 'Subscriptions', icon: CreditCardIcon },
        { id: 'analytics', name: 'Revenue & Attendance', icon: ChartBarIcon, link: '/staff/admin-dashboard/analytics' },
        { id: 'cancellations', name: 'Cancellation Reasons', icon: ExclamationCircleIcon },
        { id: 'notice_period', name: 'Notice Period Tracking', icon: ClockIcon, link: '/staff/admin-dashboard/notice-period' },
      ]
    },
    {
      id: 'settings',
      name: 'Other',
      icon: Cog6ToothIcon,
      type: 'dropdown' as const,
      items: [
        { id: 'playgroups', name: 'Play Groups', icon: UserGroupIcon },
        { id: 'newsletter', name: 'Newsletter', icon: PaperAirplaneIcon },
      ]
    },
  ]

  const fetchAdminProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        setAdminName(`${profile.first_name} ${profile.last_name}`)
      }
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

      // Total dogs in system - ALL DOGS (approved and pending)
      const { count: dogsCount } = await supabase
        .from('dogs')
        .select('*', { count: 'exact', head: true })
      setTotalDogs(dogsCount || 0)

      // Total users (excluding staff and admin)
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')
      setTotalUsers(usersCount || 0)

      // Dogs attending today - fetch both subscription and individual bookings
      const { data: todaySubscriptionBookings } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (first_name, last_name, phone)
        `)
        .eq('booking_date', today)
        .eq('status', 'confirmed')

      const { data: todayIndividualBookings } = await supabase
        .from('individual_day_bookings')
        .select(`
          *,
          profiles:user_id (first_name, last_name, phone),
          dogs!individual_day_bookings_dog_id_fkey (id, name, breed, photo_url, owner_id, owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone))
        `)
        .eq('booking_date', today)
        .eq('status', 'confirmed')

      // Process subscription bookings
      const subscriptionWithDogs = await Promise.all(
        (todaySubscriptionBookings || []).map(async (booking) => {
          const { data: dogsData } = await supabase
            .from('dogs')
            .select(`
              id, name, breed, photo_url, owner_id,
              owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone)
            `)
            .in('id', booking.dog_ids)

          return { ...booking, dogs: dogsData || [], booking_type: 'subscription' }
        })
      )

      // Transform individual bookings
      const individualWithDogs = (todayIndividualBookings || []).map((booking: any) => ({
        ...booking,
        dogs: booking.dogs ? [booking.dogs] : [],
        booking_type: 'individual',
        session_type: 'full_day' // Individual bookings are always full day
      }))

      // Combine both types
      const allTodayBookings = [...subscriptionWithDogs, ...individualWithDogs]
      setTodayBookings(allTodayBookings)
      const totalDogsToday = allTodayBookings.reduce((sum, b) => sum + (b.dogs?.length || 0), 0)
      setDogsToday(totalDogsToday)

      // Calculate today's full day vs half day
      const fullDayToday = allTodayBookings.filter(b => b.session_type === 'full_day').reduce((sum, b) => sum + (b.dogs?.length || 0), 0)
      const halfDayToday = allTodayBookings.filter(b => b.session_type === 'half_day').reduce((sum, b) => sum + (b.dogs?.length || 0), 0)
      setTodayFullDay(fullDayToday)
      setTodayHalfDay(halfDayToday)

      // Fetch today's unified capacity (no longer separated by dog size)
      const { data: capacityData } = await supabase
        .rpc('check_daily_capacity', { p_date: today, p_dog_size: 'medium' })

      if (capacityData) {
        // Store in the same structure but both small/large will have the same unified data
        setTodayCapacity({
          small: {
            current: capacityData.current_bookings || 0,
            total: capacityData.total_capacity || settings.daily_dog_limit || 50,
            available: capacityData.available_spots || 0
          },
          large: {
            current: 0, // Set to 0 so it doesn't double count
            total: 0,
            available: 0
          }
        })
      }

      // Calculate weekly stats (next 7 days) - include both booking types
      const weeklyData = []
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' })

        // Get subscription bookings
        const { data: daySubscriptionBookings } = await supabase
          .from('bookings')
          .select('session_type, dog_ids')
          .eq('booking_date', dateStr)
          .eq('status', 'confirmed')

        // Get individual bookings
        const { data: dayIndividualBookings } = await supabase
          .from('individual_day_bookings')
          .select('id')
          .eq('booking_date', dateStr)
          .eq('status', 'confirmed')

        const subFullDay = daySubscriptionBookings?.filter(b => b.session_type === 'full_day').reduce((sum, b) => sum + (b.dog_ids?.length || 0), 0) || 0
        const subHalfDay = daySubscriptionBookings?.filter(b => b.session_type === 'half_day').reduce((sum, b) => sum + (b.dog_ids?.length || 0), 0) || 0
        const indFullDay = dayIndividualBookings?.length || 0 // Each individual booking is 1 dog

        weeklyData.push({
          day: dayName,
          date: dateStr,
          fullDay: subFullDay + indFullDay,
          halfDay: subHalfDay,
          total: subFullDay + indFullDay + subHalfDay
        })
      }
      setWeeklyStats(weeklyData)

      // Monthly revenue - Calculate from booking amount (including assessments and individual days)
      try {
        // Get subscription bookings revenue
        const { data: revenueData, error } = await supabase
          .from('bookings')
          .select('amount')
          .gte('booking_date', firstDayOfMonth)
          .lte('booking_date', lastDayOfMonth)
          .in('status', ['confirmed', 'completed'])

        // Get individual day bookings revenue - only count non-free bookings
        const { data: individualRevenueData } = await supabase
          .from('individual_day_bookings')
          .select('price')
          .gte('booking_date', firstDayOfMonth)
          .lte('booking_date', lastDayOfMonth)
          .eq('payment_status', 'paid')
          .gt('price', 0) // Exclude 100% discount (free) bookings

        // Get assessment bookings with discount info
        const { data: assessmentRevenueData } = await supabase
          .from('assessment_bookings')
          .select('id, slot_id, booked_at, user_id')
          .eq('booking_status', 'confirmed')
          .gte('booked_at', firstDayOfMonth)
          .lte('booked_at', lastDayOfMonth)

        // Get discount usage for all bookings this month
        const { data: discountUsageData } = await supabase
          .from('discount_code_usage')
          .select('used_for, final_amount, user_id, created_at')
          .gte('created_at', firstDayOfMonth)
          .lte('created_at', lastDayOfMonth)

        if (!error && revenueData) {
          // Subscription revenue - use amount from bookings table (already includes Stripe discount)
          // For extra accuracy, we could also verify against discount_code_usage but Stripe handles this
          const subscriptionRev = revenueData.reduce((sum, b) => sum + (b.amount || 0), 0) || 0

          // Individual day revenue from paid bookings (already excludes free ones with price > 0 filter)
          const individualRev = individualRevenueData?.reduce((sum, b) => sum + (b.price || 0), 0) || 0

          const bookingsRev = subscriptionRev + individualRev

          // Calculate assessment revenue with discounts
          let assessmentsRev = 0
          if (assessmentRevenueData) {
            for (const assessment of assessmentRevenueData) {
              // Check if this assessment had a discount applied
              const discount = discountUsageData?.find(d =>
                d.used_for === 'assessment' &&
                d.user_id === assessment.user_id &&
                new Date(d.created_at).toDateString() === new Date(assessment.booked_at).toDateString()
              )

              if (discount) {
                // Use final amount after discount (excluding 100% discount which is £0)
                if (discount.final_amount > 0) {
                  assessmentsRev += discount.final_amount
                }
              } else {
                // No discount, use full assessment fee
                assessmentsRev += (settings.assessment_fee || 40)
              }
            }
          }

          const totalRevenue = bookingsRev + assessmentsRev
          setMonthlyRevenue(totalRevenue)
          setBookingRevenue(bookingsRev)
          setAssessmentRevenue(assessmentsRev)
          console.log('📊 Revenue breakdown:', { subscriptionRev, individualRev, bookingRevenue: bookingsRev, assessmentRevenue: assessmentsRev, totalRevenue })
        } else {
          console.log('Revenue query issue:', error?.message)
          setMonthlyRevenue(0)
          setBookingRevenue(0)
          setAssessmentRevenue(0)
        }
      } catch (e) {
        console.log('Revenue calculation failed')
        setMonthlyRevenue(0)
      }

      // Pending approvals - Users who have booked assessments and are awaiting approval
      // Count unique users who have confirmed assessment bookings but aren't approved yet
      const { data: pendingAssessmentUsers } = await supabase
        .from('assessment_bookings')
        .select(`
          user_id,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            approval_status
          )
        `)
        .eq('booking_status', 'confirmed')
        .not('profiles.approval_status', 'eq', 'approved')

      // Get unique users from assessment bookings
      const uniquePendingUsers = pendingAssessmentUsers
        ? Array.from(new Set(pendingAssessmentUsers.map(b => b.user_id)))
        : []

      // Also get dogs awaiting approval (completed assessment but not approved)
      const { data: pendingApprovalsData } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone, address, city, postcode)
        `)
        .eq('is_approved', false)
        .eq('assessment_completed', true)
        .order('assessment_date', { ascending: true })

      const totalPendingCount = uniquePendingUsers.length

      setPendingApprovals(pendingApprovalsData || [])
      setPendingAssessments(totalPendingCount)

      // Scheduled assessments (from old assessment_schedule table if it exists)
      const { data: assessmentsData } = await supabase
        .from('assessment_schedule')
        .select(`
          *,
          profiles:user_id (first_name, last_name, email, phone)
        `)
        .eq('status', 'pending')
        .order('requested_date', { ascending: true })

      setAssessments(assessmentsData || [])

      // Active subscriptions - uses is_active boolean and calculate MRR
      const { data: activeSubsData, count: subsCount } = await supabase
        .from('subscriptions')
        .select('monthly_price', { count: 'exact' })
        .eq('is_active', true)

      setActiveSubscriptions(subsCount || 0)

      // Calculate Monthly Recurring Revenue from active subscriptions
      const mrr = (activeSubsData || []).reduce((sum, sub) => sum + (sub.monthly_price || 0), 0)
      setRecurringRevenue(mrr)

      // All dogs - Get BOTH approved and unapproved for compliance checking
      // (We'll filter to approved-only in the "All Dogs" tab display)
      const { data: allDogsData } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone)
        `)
        .order('name', { ascending: true })
      setAllDogs(allDogsData || [])

      // For the "All Dogs" tab, only show approved dogs
      setFilteredDogs((allDogsData || []).filter(dog => dog.is_approved === true))

      // All users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, role')
        .eq('role', 'user')
        .order('first_name', { ascending: true })

      const usersWithCounts = await Promise.all(
        (usersData || []).map(async (user) => {
          const { count: dogsCount } = await supabase
            .from('dogs')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', user.id)

          // Check subscription status - uses is_active boolean and tier_id
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('tier_id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle()

          if (subError) {
            console.log('❌ Subscription query error for user', user.first_name, user.last_name, ':', subError.message)
          }

          let subscriptionStatus = 'None'
          if (subscription) {
            // Active subscription found - show tier_id or just 'Active'
            subscriptionStatus = subscription.tier_id || 'Active'
          }

          return {
            ...user,
            dogs_count: dogsCount || 0,
            subscription_status: subscriptionStatus
          }
        })
      )

      setAllUsers(usersWithCounts)
      setFilteredUsers(usersWithCounts)

      // Staff users
      const { data: staffData } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, phone, role, created_at')
        .in('role', ['staff', 'admin'])
        .order('created_at', { ascending: false })
      setStaffUsers(staffData || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchLegalAgreements = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_agreements')
        .select(`
          *,
          profiles (first_name, last_name, email, phone)
        `)
        .order('signed_at', { ascending: false })

      if (error) {
        console.error('Error fetching legal agreements:', error)
        return
      }
      setLegalAgreements(data || [])
    } catch (error) {
      console.error('Error fetching legal agreements:', error)
    }
  }

  const fetchDogMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('dog_medications')
        .select('*, dogs:dog_id(name, breed, owner_id)')
        .order('start_date', { ascending: false })

      if (error) throw error
      setDogMedications(data || [])
    } catch (error) {
      console.error('Error fetching dog medications:', error)
      toast.error('Failed to load dog medications')
    }
  }

  const fetchIncidents = async () => {
    try {
      const { data, error} = await supabase
        .from('incidents')
        .select('*')
        .order('occurred_at', { ascending: false })

      if (error) {
        // Table doesn't exist yet - silently skip
        console.log('Incidents table not found (optional feature)')
        return
      }
      setIncidents(data || [])
    } catch (error) {
      console.log('Error fetching incidents:', error)
    }
  }

  const fetchFinancialTransactions = async () => {
    try {
      // Fetch assessment bookings as transactions
      const { data: assessmentBookings } = await supabase
        .from('assessment_bookings')
        .select(`
          id,
          user_id,
          booked_at,
          booking_status,
          profiles!assessment_bookings_user_id_fkey (first_name, last_name, email)
        `)
        .eq('booking_status', 'confirmed')
        .order('booked_at', { ascending: false })

      // Transform assessment bookings into transaction format
      const assessmentTransactions: FinancialTransaction[] = (assessmentBookings || []).map(booking => ({
        id: booking.id,
        user_id: booking.user_id,
        booking_id: booking.id,
        stripe_payment_id: undefined,
        amount: Math.round((settings.assessment_fee || 40) * 100), // Assessment fee (stored in pence)
        transaction_type: 'assessment',
        status: 'completed',
        created_at: booking.booked_at,
        profiles: Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles
      }))

      // Fetch regular bookings with amount as transactions
      const { data: regularBookings } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          amount,
          booking_date,
          status,
          profiles!bookings_user_id_fkey (first_name, last_name, email)
        `)
        .in('status', ['confirmed', 'completed'])
        .not('amount', 'is', null)
        .order('booking_date', { ascending: false })

      // Transform regular bookings into transaction format
      const bookingTransactions: FinancialTransaction[] = (regularBookings || []).map(booking => ({
        id: booking.id,
        user_id: booking.user_id,
        booking_id: booking.id,
        stripe_payment_id: undefined,
        amount: booking.amount,
        transaction_type: 'booking',
        status: booking.status,
        created_at: booking.booking_date,
        profiles: Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles
      }))

      // Combine and sort all transactions by date
      const allTransactions = [...assessmentTransactions, ...bookingTransactions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setFinancialTransactions(allTransactions)
    } catch (error) {
      console.error('Error fetching financial transactions:', error)
    }
  }

  const fetchDiscountUsages = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_code_usage')
        .select(`
          *,
          discount_codes:discount_code_id (code, discount_type, discount_value),
          profiles:user_id (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setDiscountUsages(data || [])
    } catch (error) {
      console.error('Error fetching discount usages:', error)
      toast.error('Failed to load discount usage data')
    }
  }

  const fetchAllBookings = async () => {
    try {
      // Fetch subscription bookings
      const { data: subscriptionBookings, error: subError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (first_name, last_name, phone, email)
        `)
        .order('booking_date', { ascending: false })
        .limit(500)

      if (subError) throw subError

      // Fetch individual day bookings
      const { data: individualBookings, error: indError } = await supabase
        .from('individual_day_bookings')
        .select(`
          *,
          profiles:user_id (first_name, last_name, phone, email),
          dogs!individual_day_bookings_dog_id_fkey (id, name, breed, photo_url)
        `)
        .order('booking_date', { ascending: false })
        .limit(500)

      if (indError) throw indError

      // Fetch dogs for subscription bookings
      const subscriptionWithDogs = await Promise.all(
        (subscriptionBookings || []).map(async (booking) => {
          const { data: dogsData } = await supabase
            .from('dogs')
            .select('id, name, breed, photo_url')
            .in('id', booking.dog_ids || [])

          return {
            ...booking,
            dogs: dogsData || [],
            booking_type: 'subscription',
            dog_count: dogsData?.length || 0
          }
        })
      )

      // Transform individual bookings to match subscription format
      const individualWithDogs = (individualBookings || []).map((booking: any) => ({
        id: booking.id,
        booking_date: booking.booking_date,
        user_id: booking.user_id,
        profiles: booking.profiles,
        dogs: booking.dogs ? [booking.dogs] : [],
        booking_type: 'individual',
        dog_count: 1,
        price: booking.price,
        payment_status: booking.payment_status,
        payment_method: booking.payment_method,
        status: booking.status,
        notes: booking.notes,
        checked_in: !!booking.checked_in_at,
        checked_out: !!booking.checked_out_at
      }))

      // Combine and sort by date
      const allBookingsData = [...subscriptionWithDogs, ...individualWithDogs].sort(
        (a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
      )

      setAllBookings(allBookingsData)
      setFilteredBookings(allBookingsData)
    } catch (error) {
      console.error('Error fetching all bookings:', error)
      toast.error('Failed to load booking history')
    }
  }

  const fetchStaffActivityLog = async () => {
    try {
      // Fetch approval/decline activities from dogs table
      const { data: dogActivities } = await supabase
        .from('dogs')
        .select(`
          id, name, is_approved, assessment_completed, assessment_notes, assessment_date,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name)
        `)
        .eq('assessment_completed', true)
        .not('assessment_date', 'is', null)
        .order('assessment_date', { ascending: false })
        .limit(100)

      // Fetch check-in/out activities from bookings
      const { data: bookingActivities } = await supabase
        .from('bookings')
        .select(`
          id, booking_date, checked_in, checked_out, checked_in_at, checked_out_at,
          dropped_off_by, picked_up_by, dog_ids,
          profiles:user_id (first_name, last_name)
        `)
        .or('checked_in.eq.true,checked_out.eq.true')
        .order('booking_date', { ascending: false })
        .limit(100)

      // Transform into activity log format
      const activities: StaffActivityLog[] = []

      // Add dog approval/decline activities
      dogActivities?.forEach((dog: any) => {
        if (dog.assessment_date) {
          const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
          activities.push({
            id: `dog-${dog.id}-${dog.assessment_date}`,
            staff_id: 'unknown',
            action_type: dog.is_approved ? 'approval' : 'decline',
            dog_id: dog.id,
            dog_name: dog.name,
            user_name: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown Owner',
            notes: dog.assessment_notes || '',
            timestamp: dog.assessment_date,
            staff_name: 'Staff'
          })
        }
      })

      // Add booking check-in/out activities
      bookingActivities?.forEach((booking: any) => {
        const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles
        const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User'

        if (booking.checked_in_at) {
          activities.push({
            id: `booking-checkin-${booking.id}`,
            staff_id: 'unknown',
            action_type: 'check_in',
            booking_id: booking.id,
            user_name: userName,
            notes: `Dropped off by: ${booking.dropped_off_by || 'Unknown'}`,
            timestamp: booking.checked_in_at,
            staff_name: 'Staff'
          })
        }
        if (booking.checked_out_at) {
          activities.push({
            id: `booking-checkout-${booking.id}`,
            staff_id: 'unknown',
            action_type: 'check_out',
            booking_id: booking.id,
            user_name: userName,
            notes: `Picked up by: ${booking.picked_up_by || 'Unknown'}`,
            timestamp: booking.checked_out_at,
            staff_name: 'Staff'
          })
        }
      })

      // Sort by timestamp descending
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setStaffActivityLog(activities)
    } catch (error) {
      console.error('Error fetching staff activity log:', error)
      toast.error('Failed to load staff activity log')
    }
  }

  const fetchScheduleForDate = async (date: string) => {
    setLoadingSchedule(true)
    try {
      // Fetch subscription bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (first_name, last_name, email, phone)
        `)
        .eq('booking_date', date)
        .eq('status', 'confirmed')

      // Fetch individual day bookings
      const { data: individualBookingsData } = await supabase
        .from('individual_day_bookings')
        .select(`
          *,
          profiles:user_id (first_name, last_name, email, phone),
          dogs!individual_day_bookings_dog_id_fkey (
            id, name, breed, size, photo_url, owner_id,
            owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone, address)
          )
        `)
        .eq('booking_date', date)
        .eq('status', 'confirmed')

      // Process subscription bookings
      const subscriptionBookingsWithDogs = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: dogsData } = await supabase
            .from('dogs')
            .select(`
              *,
              owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone, address)
            `)
            .in('id', booking.dog_ids)

          return {
            ...booking,
            dogs: dogsData || [],
            booking_type: 'subscription'
          }
        })
      )

      // Transform individual bookings to match format
      const individualBookingsWithDogs = (individualBookingsData || []).map((booking: any) => ({
        id: booking.id,
        booking_date: booking.booking_date,
        user_id: booking.user_id,
        profiles: booking.profiles,
        dogs: booking.dogs ? [booking.dogs] : [],
        booking_type: 'individual',
        session_type: 'full_day', // Individual bookings are always full day
        price: booking.price,
        payment_status: booking.payment_status,
        payment_method: booking.payment_method,
        status: booking.status,
        checked_in: !!booking.checked_in_at,
        checked_out: !!booking.checked_out_at,
        notes: booking.notes
      }))

      // Combine both types and sort by session type (full day first)
      const allBookings = [...subscriptionBookingsWithDogs, ...individualBookingsWithDogs].sort(
        (a, b) => {
          // Full day bookings first
          if (a.session_type === 'full_day' && b.session_type !== 'full_day') return -1
          if (a.session_type !== 'full_day' && b.session_type === 'full_day') return 1
          return 0
        }
      )

      setScheduleBookings(allBookings)
    } catch (error) {
      console.error('Error fetching schedule:', error)
      toast.error('Failed to load schedule')
    } finally {
      setLoadingSchedule(false)
    }
  }

  const fetchAssessmentCalendar = async (month: Date) => {
    try {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

      // Fetch assessment bookings with slots and dogs
      const { data: bookingsData } = await supabase
        .from('assessment_bookings')
        .select(`
          id,
          booking_status,
          slot_id,
          dog_id,
          user_id
        `)
        .eq('booking_status', 'confirmed')

      // Fetch related data for each booking
      const enrichedData = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const [slotRes, dogRes] = await Promise.all([
            supabase.from('assessment_slots').select('*').eq('id', booking.slot_id).single(),
            supabase.from('dogs').select(`
              *,
              owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone)
            `).eq('id', booking.dog_id).single()
          ])

          return {
            ...dogRes.data,
            assessment_date: slotRes.data?.assessment_date,
            assessment_time: slotRes.data?.start_time,
            booking_id: booking.id
          }
        })
      )

      // Filter for the selected month
      const dogsInMonth = enrichedData.filter(dog =>
        dog.assessment_date &&
        dog.assessment_date >= startOfMonth.toISOString().split('T')[0] &&
        dog.assessment_date <= endOfMonth.toISOString().split('T')[0]
      )

      // Group dogs by assessment date
      const grouped: { [date: string]: Dog[] } = {}
      dogsInMonth.forEach((dog) => {
        if (dog.assessment_date) {
          if (!grouped[dog.assessment_date]) {
            grouped[dog.assessment_date] = []
          }
          grouped[dog.assessment_date].push(dog)
        }
      })

      const assessmentsList = Object.keys(grouped).map(date => ({
        date,
        dogs: grouped[date]
      }))

      setScheduledAssessments(assessmentsList)
    } catch (error) {
      console.error('Error fetching assessment calendar:', error)
    }
  }

  const handleDogClick = async (dog: Dog) => {
    // Fetch full dog details including all fields
    try {
      const { data: fullDogData } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone, address)
        `)
        .eq('id', dog.id)
        .single()

      if (fullDogData) {
        setSelectedDog(fullDogData)
        setShowDogModal(true)
      }
    } catch (error) {
      console.error('Error fetching dog details:', error)
      toast.error('Failed to load dog details')
    }
  }

  const handleApproveAssessment = async (assessmentId: string) => {
    try {
      const { error } = await supabase
        .from('assessment_schedule')
        .update({ status: 'approved' })
        .eq('id', assessmentId)

      if (error) throw error

      toast.success('Assessment approved! ✅')
      fetchDashboardData()
    } catch (error) {
      console.error('Error approving assessment:', error)
      toast.error('Failed to approve assessment')
    }
  }

  const handleRejectAssessment = async (assessmentId: string) => {
    try {
      const { error } = await supabase
        .from('assessment_schedule')
        .update({ status: 'rejected' })
        .eq('id', assessmentId)

      if (error) throw error

      toast.success('Assessment rejected')
      fetchDashboardData()
    } catch (error) {
      console.error('Error rejecting assessment:', error)
      toast.error('Failed to reject assessment')
    }
  }

  const handleCreateStaff = async () => {
    if (!newStaffEmail || !newStaffPassword || !newStaffFirstName || !newStaffLastName) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please log in again')
        return
      }

      // Call admin API to create staff user
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: newStaffEmail,
          password: newStaffPassword,
          firstName: newStaffFirstName,
          lastName: newStaffLastName,
          phone: newStaffPhone,
          role: newStaffRole,
          permissions: newStaffRole === 'staff' ? staffPermissions : {
            can_view_today: true,
            can_check_in: true,
            can_check_out: true,
            can_approve_assessments: true,
            can_manage_playgroups: true,
            can_view_medications: true,
            can_feed_dogs: true,
            can_view_schedule: true,
            can_view_reports: true,
            can_manage_staff: true
          }
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      toast.success(`${newStaffRole === 'admin' ? 'Admin' : 'Staff'} account created successfully!`)
      setShowStaffModal(false)
      setNewStaffEmail('')
      setNewStaffPassword('')
      setNewStaffFirstName('')
      setNewStaffLastName('')
      setNewStaffPhone('')
      setNewStaffRole('staff')
      setStaffPermissions({
        can_view_today: true,
        can_check_in: true,
        can_check_out: true,
        can_approve_assessments: false,
        can_manage_playgroups: false,
        can_view_medications: true,
        can_feed_dogs: true,
        can_view_schedule: true,
        can_view_reports: false,
        can_manage_staff: false
      })

      // Refresh staff list
      fetchDashboardData()
    } catch (error: any) {
      console.error('Error creating staff:', error)
      toast.error('Failed to create staff account')
    }
  }

  const fetchPlayGroups = async () => {
    try {
      const { data } = await supabase
        .from('play_groups')
        .select(`
          *,
          dog_play_groups (
            dog_id,
            priority,
            notes
          )
        `)
        .eq('active', true)
        .order('name')

      setPlayGroups(data || [])
    } catch (error) {
      console.error('Error fetching play groups:', error)
      toast.error('Failed to load play groups')
    }
  }

  const fetchSubscriptionTiers = async () => {
    try {
      const { data } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('days_included')

      setSubscriptionTiers(data || [])
    } catch (error) {
      console.error('Error fetching subscription tiers:', error)
      toast.error('Failed to load subscription tiers')
    }
  }

  const fetchCancelledSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          dogs:dog_id (
            id,
            name
          ),
          profiles:user_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('is_active', false)
        .not('cancellation_date', 'is', null)
        .order('cancellation_date', { ascending: false })

      if (error) {
        console.error('Error fetching cancelled subscriptions:', error)
        toast.error('Failed to load cancelled subscriptions')
        return
      }

      setCancelledSubscriptions(data || [])
    } catch (error) {
      console.error('Error fetching cancelled subscriptions:', error)
      toast.error('Failed to load cancelled subscriptions')
    }
  }

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('*')

      if (data) {
        const settingsObj: any = {}
        data.forEach((setting: any) => {
          if (setting.setting_type === 'number') {
            settingsObj[setting.setting_key] = parseFloat(setting.setting_value)
          } else {
            settingsObj[setting.setting_key] = setting.setting_value
          }
        })

        setSettings({
          assessment_fee: settingsObj.assessment_fee || 40,
          assessment_day: settingsObj.assessment_day || '5',
          max_dogs_per_day: settingsObj.max_dogs_per_day || 40,
          opening_time: settingsObj.business_hours_start || '07:00',
          closing_time: settingsObj.business_hours_end || '19:00',
          individual_day_price: settingsObj.individual_day_price || 50,
          daily_dog_limit: settingsObj.daily_dog_limit || 50,
          enable_individual_bookings: settingsObj.enable_individual_bookings === 'true' || settingsObj.enable_individual_bookings === true,
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    }
  }

  const fetchRecurringSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_recurring_slots')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setRecurringSlots(data || [])
    } catch (error) {
      console.error('Error fetching recurring slots:', error)
    }
  }

  const handleAddSlot = async (dayOfWeek: number, dayLabel: string) => {
    const startTime = prompt(`Add time slot for ${dayLabel}\n\nStart time (e.g., 09:00):`)
    if (!startTime) return

    const endTime = prompt('End time (e.g., 12:00):')
    if (!endTime) return

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      toast.error('Invalid time format. Please use HH:MM format (e.g., 09:00)')
      return
    }

    try {
      const { error } = await supabase
        .from('assessment_recurring_slots')
        .insert({
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_active: true
        })

      if (error) throw error

      toast.success(`${dayLabel}: ${startTime}-${endTime} slot added!`)
      fetchRecurringSlots() // Refresh the list
    } catch (error: any) {
      console.error('Error adding slot:', error)
      if (error.code === '23505') {
        toast.error('This time slot already exists for this day')
      } else {
        toast.error('Failed to add time slot')
      }
    }
  }

  const handleDeleteSlot = async (slotId: string, dayLabel: string, timeRange: string) => {
    if (!confirm(`Delete ${dayLabel} ${timeRange} slot?`)) return

    try {
      const { error } = await supabase
        .from('assessment_recurring_slots')
        .update({ is_active: false })
        .eq('id', slotId)

      if (error) throw error

      toast.success(`${dayLabel} ${timeRange} slot deleted`)
      fetchRecurringSlots() // Refresh the list
    } catch (error) {
      console.error('Error deleting slot:', error)
      toast.error('Failed to delete time slot')
    }
  }

  // Sections Management Functions
  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setSections(data || [])
    } catch (error) {
      console.error('Error fetching sections:', error)
      toast.error('Failed to load sections')
    }
  }

  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      toast.error('Please enter a section name')
      return
    }

    try {
      const { error } = await supabase
        .from('sections')
        .insert({
          name: newSectionName.trim(),
          display_order: sections.length + 1
        })

      if (error) throw error

      toast.success(`Section "${newSectionName}" added`)
      setNewSectionName('')
      fetchSections()
    } catch (error: any) {
      console.error('Error adding section:', error)
      if (error.code === '23505') {
        toast.error('This section already exists')
      } else {
        toast.error('Failed to add section')
      }
    }
  }

  const handleUpdateSection = async (id: string) => {
    if (!editingSectionName.trim()) {
      toast.error('Please enter a section name')
      return
    }

    try {
      const { error } = await supabase
        .from('sections')
        .update({ name: editingSectionName.trim() })
        .eq('id', id)

      if (error) throw error

      toast.success('Section updated')
      setEditingSectionId(null)
      setEditingSectionName('')
      fetchSections()
    } catch (error: any) {
      console.error('Error updating section:', error)
      if (error.code === '23505') {
        toast.error('This section name already exists')
      } else {
        toast.error('Failed to update section')
      }
    }
  }

  const handleDeleteSection = async (id: string, name: string) => {
    if (!confirm(`Delete section "${name}"? This cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from('sections')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      toast.success(`Section "${name}" deleted`)
      fetchSections()
    } catch (error) {
      console.error('Error deleting section:', error)
      toast.error('Failed to delete section')
    }
  }

  // Closed Days Management Functions
  const fetchClosedDays = async () => {
    try {
      const { data, error } = await supabase
        .from('closed_days')
        .select('*')
        .gte('closed_date', new Date().toISOString().split('T')[0])
        .order('closed_date', { ascending: true })

      if (error) throw error
      setClosedDays(data || [])
    } catch (error) {
      console.error('Error fetching closed days:', error)
      toast.error('Failed to load closed days')
    }
  }

  const handleAddClosedDay = async () => {
    if (!newClosedDate) {
      toast.error('Please select a date')
      return
    }

    // Check if date is in the past
    const selectedDate = new Date(newClosedDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      toast.error('Cannot add closed days in the past')
      return
    }

    // Check if date already exists
    const dateExists = closedDays.some(day => day.closed_date === newClosedDate)
    if (dateExists) {
      toast.error('This date is already marked as closed')
      return
    }

    setAddingClosedDay(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('closed_days')
        .insert({
          closed_date: newClosedDate,
          reason: newClosedReason.trim() || null,
          created_by: user?.id
        })

      if (error) throw error

      toast.success('Closed day added successfully')
      setNewClosedDate('')
      setNewClosedReason('')
      fetchClosedDays()
    } catch (error: any) {
      console.error('Error adding closed day:', error)
      if (error.code === '23505') {
        toast.error('This date is already marked as closed')
      } else {
        toast.error('Failed to add closed day')
      }
    } finally {
      setAddingClosedDay(false)
    }
  }

  const handleDeleteClosedDay = async (id: string) => {
    if (!confirm('Remove this closed day? Users will be able to book this date again.')) return

    try {
      const { error } = await supabase
        .from('closed_days')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Closed day removed')
      fetchClosedDays()
    } catch (error) {
      console.error('Error deleting closed day:', error)
      toast.error('Failed to remove closed day')
    }
  }

  // Staff Schedule & Assignment Functions
  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, phone, role, created_at')
        .in('role', ['staff', 'admin'])
        .order('first_name', { ascending: true })

      if (error) throw error
      setStaffMembers(data || [])
    } catch (error) {
      console.error('Error fetching staff members:', error)
      toast.error('Failed to load staff members')
    }
  }

  const fetchStaffAssignments = async (date?: string) => {
    try {
      const targetDate = date || assignmentDate
      const { data, error } = await supabase
        .from('staff_assignments')
        .select('*')
        .eq('assignment_date', targetDate)
        .order('shift_start', { ascending: true })

      if (error) throw error

      // Fetch profiles for all staff members
      if (data && data.length > 0) {
        const staffIds = data.map(a => a.staff_id)
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone')
          .in('id', staffIds)

        // Merge profiles into assignments
        const assignmentsWithProfiles = data.map(assignment => ({
          ...assignment,
          profiles: profilesData?.find(p => p.id === assignment.staff_id)
        }))

        setStaffAssignments(assignmentsWithProfiles)
      } else {
        setStaffAssignments([])
      }
    } catch (error) {
      console.error('Error fetching staff assignments:', error)
      toast.error('Failed to load staff assignments')
    }
  }

  const fetchStaffTasks = async (date?: string) => {
    try {
      const targetDate = date || assignmentDate
      const { data, error } = await supabase
        .from('staff_tasks')
        .select('*')
        .eq('task_date', targetDate)
        .order('priority', { ascending: false })

      if (error) throw error

      // Fetch profiles for all assigned staff members
      if (data && data.length > 0) {
        const staffIds = data.map(t => t.assigned_to_staff_id)
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone')
          .in('id', staffIds)

        // Merge profiles into tasks
        const tasksWithProfiles = data.map(task => ({
          ...task,
          profiles: profilesData?.find(p => p.id === task.assigned_to_staff_id)
        }))

        setStaffTasks(tasksWithProfiles)
      } else {
        setStaffTasks([])
      }
    } catch (error) {
      console.error('Error fetching staff tasks:', error)
      toast.error('Failed to load staff tasks')
    }
  }

  const handleSaveSettings = async () => {
    const savingToast = toast.loading('Saving settings...')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update admin_settings
      const settingsToUpdate = [
        { key: 'assessment_fee', value: settings.assessment_fee.toString(), type: 'number' },
        { key: 'assessment_day', value: settings.assessment_day, type: 'text' },
        { key: 'max_dogs_per_day', value: settings.max_dogs_per_day.toString(), type: 'number' },
        { key: 'business_hours_start', value: settings.opening_time, type: 'text' },
        { key: 'business_hours_end', value: settings.closing_time, type: 'text' },
        { key: 'individual_day_price', value: settings.individual_day_price.toString(), type: 'number' },
        { key: 'daily_dog_limit', value: settings.daily_dog_limit.toString(), type: 'number' },
        { key: 'enable_individual_bookings', value: settings.enable_individual_bookings.toString(), type: 'boolean' },
      ]

      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert({
            setting_key: setting.key,
            setting_value: setting.value,
            setting_type: setting.type,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          }, { onConflict: 'setting_key' })

        if (error) {
          console.error('Error updating setting:', setting.key, error)
          throw error
        }
      }

      // Update subscription tiers
      for (const tier of subscriptionTiers) {
        const { error } = await supabase
          .from('subscription_tiers')
          .update({
            monthly_price: tier.monthly_price,
            price_per_day: tier.price_per_day,
            updated_at: new Date().toISOString()
          })
          .eq('id', tier.id)

        if (error) {
          console.error('Error updating tier:', tier.id, error)
          throw error
        }
      }

      toast.success('Business settings saved successfully! ✅', { id: savingToast })
      await fetchSettings()
      await fetchSubscriptionTiers()
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings. Please try again.', { id: savingToast })
    }
  }

  const handleCreateGroup = async () => {
    if (!editingGroup?.name) {
      toast.error('Please enter a group name')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (editingGroup.id) {
        // Update existing group
        const { error } = await supabase
          .from('play_groups')
          .update({
            name: editingGroup.name,
            description: editingGroup.description,
            color: editingGroup.color,
            icon: editingGroup.icon,
            max_dogs: editingGroup.max_dogs,
            notes: editingGroup.notes
          })
          .eq('id', editingGroup.id)

        if (error) throw error
        toast.success('Play group updated! ✅')
      } else {
        // Create new group
        const { error } = await supabase
          .from('play_groups')
          .insert({
            name: editingGroup.name,
            description: editingGroup.description,
            color: editingGroup.color,
            icon: editingGroup.icon,
            max_dogs: editingGroup.max_dogs,
            notes: editingGroup.notes,
            created_by: user?.id
          })

        if (error) throw error
        toast.success('Play group created! 🎉')
      }

      setShowGroupModal(false)
      setEditingGroup(null)
      fetchPlayGroups()
    } catch (error) {
      console.error('Error saving group:', error)
      toast.error('Failed to save play group')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this play group?')) return

    try {
      const { error } = await supabase
        .from('play_groups')
        .update({ active: false })
        .eq('id', groupId)

      if (error) throw error
      toast.success('Play group deleted')
      fetchPlayGroups()
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Failed to delete play group')
    }
  }

  const handleAssignDogs = async () => {
    if (!assigningToGroup) return

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // First, remove all current assignments
      await supabase
        .from('dog_play_groups')
        .delete()
        .eq('play_group_id', assigningToGroup.id)

      // Then add new assignments
      if (selectedDogsForGroup.length > 0) {
        const assignments = selectedDogsForGroup.map(dogId => ({
          dog_id: dogId,
          play_group_id: assigningToGroup.id,
          priority: 1,
          added_by: user?.id
        }))

        const { error } = await supabase
          .from('dog_play_groups')
          .insert(assignments)

        if (error) throw error
      }

      toast.success('Dogs assigned to group! 🐕')
      setShowAssignDogsModal(false)
      setAssigningToGroup(null)
      setSelectedDogsForGroup([])
      fetchPlayGroups()
    } catch (error) {
      console.error('Error assigning dogs:', error)
      toast.error('Failed to assign dogs')
    }
  }

  const handleSendNewsletter = async () => {
    if (!newsletterSubject || !newsletterMessage) {
      toast.error('Please fill in subject and message')
      return
    }

    if (newsletterRecipients === 'individual' && !selectedUserForEmail) {
      toast.error('Please select a recipient')
      return
    }

    try {
      // This would require an email service integration (SendGrid, AWS SES, etc.)
      toast.success('Newsletter feature requires email service setup. Contact developer.')

      console.log('Would send newsletter:', {
        subject: newsletterSubject,
        message: newsletterMessage,
        recipients: newsletterRecipients,
        to: newsletterRecipients === 'individual' ? selectedUserForEmail : 'all users'
      })

      setShowNewsletterModal(false)
      setNewsletterSubject('')
      setNewsletterMessage('')
      setSelectedUserForEmail('')
    } catch (error) {
      console.error('Error sending newsletter:', error)
      toast.error('Failed to send newsletter')
    }
  }

  const handleApproveDog = async (dogId: string) => {
    try {
      // Get dog details with owner info
      const { data: dog } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name, email)
        `)
        .eq('id', dogId)
        .single()

      if (!dog) throw new Error('Dog not found')

      // Update dog to approved
      const { error: updateError } = await supabase
        .from('dogs')
        .update({ is_approved: true })
        .eq('id', dogId)

      if (updateError) throw updateError

      // Send approval email to owner
      try {
        await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerEmail: dog.owner?.email,
            ownerName: `${dog.owner?.first_name} ${dog.owner?.last_name}`,
            dogName: dog.name
          })
        })
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
        // Don't fail the whole operation if email fails
      }

      toast.success(`${dog.name} approved successfully! Owner will be notified by email.`)
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error approving dog:', error)
      toast.error('Failed to approve dog')
    }
  }

  const handleDeclineDog = async (dogId: string) => {
    const notes = prompt('Please provide a reason for declining this dog:')
    if (!notes) {
      toast.error('Decline reason is required')
      return
    }

    try {
      const { error } = await supabase
        .from('dogs')
        .update({
          is_approved: false,
          assessment_notes: notes
        })
        .eq('id', dogId)

      if (error) throw error

      toast.success('Dog declined with notes saved')
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error declining dog:', error)
      toast.error('Failed to decline dog')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Check-in/Check-out Handler
  const handleCheckInOut = async (bookingId: string, bookingType: 'subscription' | 'individual', action: 'check_in' | 'check_out') => {
    try {
      const now = new Date().toISOString()

      if (bookingType === 'subscription') {
        // Handle subscription booking check-in/out
        const updateData = action === 'check_in'
          ? { checked_in: true, checked_in_at: now }
          : { checked_out: true, checked_out_at: now }

        const { error } = await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', bookingId)

        if (error) throw error

        toast.success(action === 'check_in' ? 'Dog(s) checked in successfully! 🐕' : 'Dog(s) checked out successfully! 👋')
      } else {
        // Handle individual day booking check-in/out
        const updateData = action === 'check_in'
          ? { checked_in_at: now, status: 'checked_in' }
          : { checked_out_at: now, status: 'checked_out' }

        const { error } = await supabase
          .from('individual_day_bookings')
          .update(updateData)
          .eq('id', bookingId)

        if (error) throw error

        toast.success(action === 'check_in' ? 'Dog checked in successfully! 🐕' : 'Dog checked out successfully! 👋')
      }

      // Refresh today's bookings
      fetchDashboardData()
    } catch (error: any) {
      console.error(`Error during ${action}:`, error)
      toast.error(error.message || `Failed to ${action.replace('_', ' ')}`)
    }
  }

  // Staff Schedule & Assignment Handlers
  const handleCreateAssignment = async () => {
    try {
      if (!assignmentFormData.staff_id) {
        toast.error('Please select a staff member')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      const newAssignment = {
        assignment_date: assignmentDate,
        staff_id: assignmentFormData.staff_id,
        area_type: assignmentFormData.area_type,
        area_name: assignmentFormData.area_type === 'other' ? assignmentFormData.area_name : null,
        shift_start: assignmentFormData.shift_start,
        shift_end: assignmentFormData.shift_end,
        assignment_notes: assignmentFormData.assignment_notes || null,
        assigned_by_admin_id: user?.id,
        status: 'scheduled'
      }

      if (editingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('staff_assignments')
          .update(newAssignment)
          .eq('id', editingAssignment.id)

        if (error) throw error
        toast.success('Assignment updated successfully')
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('staff_assignments')
          .insert([newAssignment])

        if (error) throw error
        toast.success('Assignment created successfully')
      }

      // Reset form and refresh
      setShowAssignmentModal(false)
      setEditingAssignment(null)
      setAssignmentFormData({
        staff_id: '',
        area_type: 'playground_1',
        area_name: '',
        shift_start: '07:00',
        shift_end: '19:00',
        assignment_notes: ''
      })
      fetchStaffAssignments()
    } catch (error) {
      console.error('Error creating assignment:', error)
      toast.error('Failed to create assignment')
    }
  }

  const handleEditAssignment = (assignment: StaffAssignment) => {
    setEditingAssignment(assignment)
    setAssignmentFormData({
      staff_id: assignment.staff_id,
      area_type: assignment.area_type,
      area_name: assignment.area_name || '',
      shift_start: assignment.shift_start,
      shift_end: assignment.shift_end,
      assignment_notes: assignment.assignment_notes || ''
    })
    setShowAssignmentModal(true)
  }

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const { error } = await supabase
        .from('staff_assignments')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Assignment deleted successfully')
      fetchStaffAssignments()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast.error('Failed to delete assignment')
    }
  }

  const handleCreateTask = async () => {
    try {
      if (!taskFormData.assigned_to_staff_id) {
        toast.error('Please select a staff member')
        return
      }

      if (!taskFormData.task_title.trim()) {
        toast.error('Please enter a task title')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      const newTask = {
        task_date: assignmentDate,
        task_title: taskFormData.task_title,
        task_description: taskFormData.task_description || null,
        priority: taskFormData.priority,
        assigned_to_staff_id: taskFormData.assigned_to_staff_id,
        assigned_by_admin_id: user?.id,
        due_time: taskFormData.due_time || null,
        estimated_duration_minutes: taskFormData.estimated_duration_minutes || null,
        status: 'pending'
      }

      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from('staff_tasks')
          .update(newTask)
          .eq('id', editingTask.id)

        if (error) throw error
        toast.success('Task updated successfully')
      } else {
        // Create new task
        const { error } = await supabase
          .from('staff_tasks')
          .insert([newTask])

        if (error) throw error
        toast.success('Task created successfully')
      }

      // Reset form and refresh
      setShowTaskModal(false)
      setEditingTask(null)
      setTaskFormData({
        assigned_to_staff_id: '',
        task_title: '',
        task_description: '',
        priority: 'medium',
        due_time: '',
        estimated_duration_minutes: 0
      })
      fetchStaffTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleEditTask = (task: StaffTask) => {
    setEditingTask(task)
    setTaskFormData({
      assigned_to_staff_id: task.assigned_to_staff_id,
      task_title: task.task_title,
      task_description: task.task_description || '',
      priority: task.priority,
      due_time: task.due_time || '',
      estimated_duration_minutes: task.estimated_duration_minutes || 0
    })
    setShowTaskModal(true)
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('staff_tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Task deleted successfully')
      fetchStaffTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleAssignmentDateChange = (newDate: string) => {
    setAssignmentDate(newDate)
    fetchStaffAssignments(newDate)
    fetchStaffTasks(newDate)
  }

  // CSV Export for Cancelled Subscriptions
  const generateCancelledSubsCSV = () => {
    const now = new Date()
    const filterDate =
      cancelledSubsFilter === '7days' ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) :
      cancelledSubsFilter === '30days' ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) :
      cancelledSubsFilter === '3months' ? new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) :
      new Date(0)

    const filteredCancellations = cancelledSubscriptions
      .filter(sub => new Date(sub.cancellation_date) >= filterDate)
      .filter(sub => {
        if (!cancelledSubsSearch) return true
        const searchLower = cancelledSubsSearch.toLowerCase()
        const userName = `${sub.profiles?.first_name || ''} ${sub.profiles?.last_name || ''}`.toLowerCase()
        const dogName = sub.dogs?.name?.toLowerCase() || ''
        return userName.includes(searchLower) || dogName.includes(searchLower)
      })

    const headers = [
      'Cancelled Date',
      'User Name',
      'Email',
      'Dog Name',
      'Subscription Plan',
      'Days Included',
      'Half-Days Included',
      'Days Remaining',
      'Next Billing Date',
      'Monthly Price',
      'Cancellation Reason'
    ]

    const rows = filteredCancellations.map(sub => [
      new Date(sub.cancellation_date).toLocaleDateString('en-GB'),
      `${sub.profiles?.first_name || ''} ${sub.profiles?.last_name || ''}`,
      sub.profiles?.email || '',
      sub.dogs?.name || 'N/A',
      sub.tier || 'N/A',
      sub.days_included || 0,
      0, // half_day_sessions_included not in use
      sub.days_remaining || 0,
      sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString('en-GB') : 'N/A',
      `£${sub.monthly_price || 0}`,
      sub.cancellation_reason ? `"${sub.cancellation_reason.replace(/"/g, '""')}"` : 'No reason provided'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    return csvContent
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canine-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-navy mx-auto mb-4"></div>
          <p className="text-canine-navy font-display text-xl">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canine-cream">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-canine-navy via-canine-navy to-[#2a5a7a] text-white shadow-xl sticky top-0 z-40 overflow-visible"
        style={{ overflow: 'visible' }}
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-32">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-1">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-canine-sky">Welcome back, {adminName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 bg-white/10 hover:bg-white/20 px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline font-semibold">Logout</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mb-1" />
              <p className="text-xl sm:text-2xl font-bold">{totalDogs}</p>
              <p className="text-xs text-canine-sky">Total Dogs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mb-1" />
              <p className="text-xl sm:text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-canine-sky">Clients</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mb-1" />
              <p className="text-xl sm:text-2xl font-bold">{dogsToday}</p>
              <p className="text-xs text-canine-sky">Today</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <CurrencyPoundIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mb-1" />
              <p className="text-xl sm:text-2xl font-bold">£{monthlyRevenue.toFixed(0)}</p>
              <p className="text-xs text-canine-sky">Revenue</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mb-1" />
              <p className="text-xl sm:text-2xl font-bold">{pendingAssessments}</p>
              <p className="text-xs text-canine-sky">Pending</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mb-1" />
              <p className="text-xl sm:text-2xl font-bold">{activeSubscriptions}</p>
              <p className="text-xs text-canine-sky">Subs</p>
            </div>
          </div>

          {/* Tab Navigation with Dropdowns */}
          <div className="border-t border-white/20 pt-3 sm:pt-4" style={{ overflow: 'visible' }}>
            <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide pb-2" style={{ position: 'relative', zIndex: 50, overflow: 'visible' }}>
              {menuStructure.map((menu) => (
                <div key={menu.id} className="relative">
                  {menu.type === 'single' ? (
                    <button
                      onClick={() => {
                        setActiveTab(menu.id as TabType)
                        setOpenDropdown(null)
                      }}
                      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap transition-all rounded-t-xl ${
                        activeTab === menu.id
                          ? 'bg-canine-cream text-canine-navy'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <menu.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">{menu.name}</span>
                      <span className="sm:hidden">{menu.name.split(' ')[0]}</span>
                      {menu.badge !== undefined && menu.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {menu.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => {
                          const newState = openDropdown === menu.id ? null : menu.id
                          console.log('🔽 DROPDOWN CLICKED:', menu.id, '| Current:', openDropdown, '| New:', newState)
                          setOpenDropdown(newState)
                        }}
                        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap transition-all rounded-t-xl ${
                          menu.items?.some(item => item.id === activeTab)
                            ? 'bg-canine-cream text-canine-navy'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <menu.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">{menu.name}</span>
                        <span className="sm:hidden">{menu.name.split(' ')[0]}</span>
                        {openDropdown === menu.id ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </button>
                      {openDropdown === menu.id && (
                        <div
                          className="absolute top-full left-0 mt-0 bg-gradient-to-b from-canine-navy to-[#2a5a7a] rounded-b-xl shadow-2xl border-t border-white/20 min-w-[250px] py-2 z-[9999]"
                          style={{
                            maxHeight: '400px',
                            overflowY: 'auto'
                          }}
                        >
                          {menu.items?.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                if ('link' in item && item.link) {
                                  router.push(item.link)
                                } else {
                                  setActiveTab(item.id as TabType)
                                }
                                setOpenDropdown(null)
                              }}
                              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors border-b border-white/10 last:border-b-0 ${
                                activeTab === item.id
                                  ? 'bg-canine-gold text-white font-semibold'
                                  : 'text-white hover:bg-white/20'
                              }`}
                            >
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                              <span className="text-left">{item.name}</span>
                              {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          {/* DASHBOARD TAB - Completely Redesigned with Charts */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-display font-bold text-canine-navy">Dashboard Overview</h2>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Attendance Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-canine-gold/20">
                  <h3 className="text-xl font-display font-bold text-canine-navy mb-6 flex items-center gap-2">
                    <ChartBarIcon className="h-6 w-6 text-canine-gold" />
                    Weekly Attendance
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a3a52', border: 'none', borderRadius: '8px', color: 'white' }}
                      />
                      <Legend />
                      <Bar dataKey="fullDay" fill="#a68756" name="Full Day" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="halfDay" fill="#c4a874" name="Half Day" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Subscription Distribution Pie Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-canine-gold/20">
                  <h3 className="text-xl font-display font-bold text-canine-navy mb-6 flex items-center gap-2">
                    <CreditCardIcon className="h-6 w-6 text-canine-gold" />
                    Active Subscriptions
                  </h3>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-6xl font-bold text-canine-navy mb-2">{activeSubscriptions}</p>
                      <p className="text-gray-600">Active Members</p>
                      <p className="text-sm text-canine-gold font-semibold mt-2">MRR: £{recurringRevenue.toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                      <p className="text-xs text-gray-600">Total Users</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{totalDogs}</p>
                      <p className="text-xs text-gray-600">Total Dogs</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{pendingAssessments}</p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] rounded-2xl p-6 shadow-xl text-white">
                <h3 className="text-xl font-display font-bold mb-6">Revenue Breakdown This Month</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm opacity-75 mb-2">Assessment Revenue</p>
                    <p className="text-4xl font-bold">£{assessmentRevenue.toFixed(0)}</p>
                    <div className="mt-2 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full"
                        style={{ width: `${monthlyRevenue > 0 ? (assessmentRevenue / monthlyRevenue * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-75 mb-2">Booking Revenue</p>
                    <p className="text-4xl font-bold">£{bookingRevenue.toFixed(0)}</p>
                    <div className="mt-2 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ width: `${monthlyRevenue > 0 ? (bookingRevenue / monthlyRevenue * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-75 mb-2">Monthly Recurring Revenue</p>
                    <p className="text-4xl font-bold">£{recurringRevenue.toFixed(0)}</p>
                    <p className="text-xs opacity-75 mt-1">{activeSubscriptions} active subscriptions</p>
                  </div>
                </div>
              </div>

              {/* Today's Capacity Widget - Unified */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-canine-gold/20">
                <h3 className="text-xl font-display font-bold text-canine-navy mb-4 flex items-center gap-2">
                  <ChartBarIcon className="h-6 w-6 text-canine-gold" />
                  Today's Capacity
                </h3>
                <div className="space-y-4">
                  {/* Unified Total Capacity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-700">Total Dogs (All Sizes)</h4>
                      <span className={`text-2xl font-bold ${
                        todayCapacity.small.available + todayCapacity.large.available === 0
                          ? 'text-red-600'
                          : todayCapacity.small.available + todayCapacity.large.available <= 10
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}>
                        {todayCapacity.small.current + todayCapacity.large.current}/{todayCapacity.small.total + todayCapacity.large.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-6 rounded-full transition-all duration-500 ${
                          todayCapacity.small.available + todayCapacity.large.available === 0
                            ? 'bg-red-500'
                            : todayCapacity.small.available + todayCapacity.large.available <= 10
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${((todayCapacity.small.current + todayCapacity.large.current) / (todayCapacity.small.total + todayCapacity.large.total)) * 100}%` }}
                      />
                    </div>
                    <p className="text-lg text-gray-600 text-center">
                      <span className="font-bold text-2xl">{todayCapacity.small.available + todayCapacity.large.available}</span> spots available
                    </p>
                  </div>
                </div>

                {/* Alert if near capacity */}
                {(todayCapacity.small.available + todayCapacity.large.available === 0) && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Capacity Full</p>
                      <p className="text-xs text-red-600">
                        Daily dog limit has been reached. No more bookings can be accepted for today.
                      </p>
                    </div>
                  </div>
                )}
                {(todayCapacity.small.available + todayCapacity.large.available > 0 && todayCapacity.small.available + todayCapacity.large.available <= 10) && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Near Capacity</p>
                      <p className="text-xs text-amber-600">
                        Only {todayCapacity.small.available + todayCapacity.large.available} spots remaining for today.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('schedule')}
                  className="bg-white border-2 border-canine-gold/30 hover:border-canine-gold rounded-xl p-6 shadow-lg transition-all"
                >
                  <CalendarDaysIcon className="h-10 w-10 text-canine-gold mx-auto mb-3" />
                  <p className="font-bold text-canine-navy">View Schedule</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('assessments')}
                  className="bg-white border-2 border-canine-gold/30 hover:border-canine-gold rounded-xl p-6 shadow-lg transition-all"
                >
                  <ShieldCheckIcon className="h-10 w-10 text-canine-gold mx-auto mb-3" />
                  <p className="font-bold text-canine-navy">Assessments</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('all_dogs')}
                  className="bg-white border-2 border-canine-gold/30 hover:border-canine-gold rounded-xl p-6 shadow-lg transition-all"
                >
                  <HeartIcon className="h-10 w-10 text-canine-gold mx-auto mb-3" />
                  <p className="font-bold text-canine-navy">All Dogs</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('business_settings')}
                  className="bg-white border-2 border-canine-gold/30 hover:border-canine-gold rounded-xl p-6 shadow-lg transition-all"
                >
                  <Cog6ToothIcon className="h-10 w-10 text-canine-gold mx-auto mb-3" />
                  <p className="font-bold text-canine-navy">Settings</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold text-canine-navy">Daycare Schedule</h2>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none font-semibold text-canine-navy"
                  />
                  <div className="bg-canine-navy text-white px-6 py-3 rounded-xl font-bold">
                    {scheduleBookings.reduce((sum, b) => sum + (b.dogs?.length || 0), 0)} Dogs
                  </div>
                </div>
              </div>

              {loadingSchedule ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-canine-navy mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading schedule...</p>
                </div>
              ) : scheduleBookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
                  <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">No dogs booked for {new Date(selectedDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {scheduleBookings.map((booking) => (
                    booking.dogs?.map((dog: Dog) => (
                      <motion.div
                        key={dog.id}
                        whileHover={{ scale: 1.03, y: -5 }}
                        onClick={() => handleDogClick(dog)}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer border-2 border-canine-gold/20 hover:border-canine-gold transition-all"
                      >
                        <div className="aspect-square bg-gradient-to-br from-canine-sky to-canine-cream relative">
                          {dog.photo_url ? (
                            <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-6xl">🐕</div>
                          )}
                          {/* Booking Type Badge */}
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-canine-gold text-white">
                              Booking
                            </span>
                          </div>
                          {/* Session Type Badge */}
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              booking.session_type === 'full_day'
                                ? 'bg-green-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}>
                              {booking.session_type === 'full_day' ? 'Full Day' : 'Half Day'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-canine-navy mb-1">{dog.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{dog.breed}</p>
                          <p className="text-xs text-gray-500">
                            Owner: {dog.owner?.first_name} {dog.owner?.last_name}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* CHECK-IN/CHECK-OUT TAB (NEW - READ-ONLY VIEW) */}
          {activeTab === 'checkin' && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">Today's Check-In/Out Status</h2>

              {todayBookings.length === 0 ? (
                <div className="bg-white rounded-xl p-8 shadow-lg text-center border-2 border-canine-gold/20">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">No dogs scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-canine-navy">
                              {booking.profiles?.first_name} {booking.profiles?.last_name}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {booking.session_type === 'full_day' ? 'Full Day' : 'Half Day'}
                              {booking.session_start_time && ` (${booking.session_start_time} - ${booking.session_end_time})`}
                            </p>
                          </div>
                          <div>
                            {booking.checked_out ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                <CheckCircleIcon className="h-4 w-4" />
                                Completed
                              </span>
                            ) : booking.checked_in ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                <CheckCircleIcon className="h-4 w-4" />
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                                <ClockIcon className="h-4 w-4" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Dogs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                          {booking.dogs && booking.dogs.length > 0 ? booking.dogs.map((dog: Dog) => (
                            <div key={dog.id} className="bg-canine-cream rounded-lg p-2 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-canine-sky overflow-hidden flex-shrink-0">
                                {dog.photo_url ? (
                                  <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-sm">🐕</div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-canine-navy text-sm">{dog.name}</p>
                                <p className="text-xs text-gray-600">{dog.breed}</p>
                              </div>
                            </div>
                          )) : (
                            <p className="text-sm text-gray-500 col-span-2">No dogs listed - {booking.dog_ids?.length || 0} dog(s)</p>
                          )}
                        </div>

                        {/* Check-in/out times and action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex gap-4 text-xs text-gray-600">
                            {booking.checked_in_at && (
                              <div>
                                <span className="text-gray-500">In:</span>
                                <span className="ml-1 font-semibold text-green-700">
                                  {new Date(booking.checked_in_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                            {booking.checked_out_at && (
                              <div>
                                <span className="text-gray-500">Out:</span>
                                <span className="ml-1 font-semibold text-blue-700">
                                  {new Date(booking.checked_out_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                            {!booking.checked_in_at && !booking.checked_out_at && (
                              <span className="text-gray-400">Not checked in yet</span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {!booking.checked_in_at && (
                              <button
                                onClick={() => handleCheckInOut(booking.id, 'subscription', 'check_in')}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                Check In
                              </button>
                            )}
                            {booking.checked_in_at && !booking.checked_out_at && (
                              <button
                                onClick={() => handleCheckInOut(booking.id, 'subscription', 'check_out')}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                Check Out
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* DOGS TODAY TAB */}
          {activeTab === 'dogs_today' && (
            <motion.div
              key="dogs_today"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">Dogs Attending Today ({dogsToday})</h2>

              {todayBookings.length === 0 ? (
                <div className="bg-white rounded-xl p-8 shadow-lg text-center border-2 border-canine-gold/20">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">No dogs attending today</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border-2 border-canine-gold/20 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-canine-navy text-white">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Dog Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Breed</th>
                        <th className="text-center py-3 px-4 font-semibold">Session</th>
                        <th className="text-left py-3 px-4 font-semibold">Owner Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Owner Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayBookings.flatMap((booking) => {
                        const sessionType = booking.session_type === 'full_day' ? 'Full Day' : 'Half Day'

                        return (booking.dogs || []).map((dog: Dog, index: number) => (
                          <tr
                            key={`${booking.id}-${dog.id}`}
                            className={`border-b border-gray-100 hover:bg-canine-sky/20 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <td className="py-3 px-4 font-semibold text-canine-navy">{dog.name}</td>
                            <td className="py-3 px-4 text-gray-600">{dog.breed}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                sessionType === 'Full Day'
                                  ? 'bg-canine-gold/20 text-canine-navy'
                                  : 'bg-canine-sky/40 text-canine-navy'
                              }`}>
                                {sessionType}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {dog.owner?.first_name} {dog.owner?.last_name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">{dog.owner?.phone || 'N/A'}</td>
                          </tr>
                        ))
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ASSESSMENTS TAB - WITH CALENDAR AND APPROVALS */}
          {activeTab === 'assessments' && (
            <motion.div
              key="assessments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy">Assessments & Approvals</h2>

              {/* Assessment Calendar */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-canine-gold/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-canine-navy">Scheduled Assessments</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssessmentCalendarMonth(new Date(assessmentCalendarMonth.getFullYear(), assessmentCalendarMonth.getMonth() - 1, 1))}
                      className="p-2 hover:bg-canine-sky/20 rounded-lg transition-colors"
                    >
                      <ChevronLeftIcon className="h-5 w-5 text-canine-navy" />
                    </button>
                    <span className="text-lg font-semibold text-canine-navy min-w-[150px] text-center">
                      {assessmentCalendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setAssessmentCalendarMonth(new Date(assessmentCalendarMonth.getFullYear(), assessmentCalendarMonth.getMonth() + 1, 1))}
                      className="p-2 hover:bg-canine-sky/20 rounded-lg transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5 text-canine-navy" />
                    </button>
                  </div>
                </div>

                {scheduledAssessments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No assessments scheduled this month</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scheduledAssessments.map((assessment) => (
                      <div key={assessment.date} className="bg-canine-cream rounded-lg p-4 border-2 border-canine-gold/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-canine-navy">
                            {new Date(assessment.date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })}
                          </h4>
                          <span className="bg-canine-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {assessment.dogs.length} dog{assessment.dogs.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {assessment.dogs.map((dog) => (
                            <div key={dog.id} className="bg-white rounded-lg p-2 text-sm">
                              <p className="font-semibold text-canine-navy">{dog.name}</p>
                              <p className="text-xs text-gray-600">{dog.owner?.first_name} {dog.owner?.last_name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Approvals Section */}
              <div>
                <h3 className="text-xl font-display font-bold text-canine-navy mb-4">
                  Dogs Awaiting Approval ({pendingAssessments})
                </h3>
                <p className="text-gray-600 mb-4 text-sm">These dogs have completed their assessments and are awaiting your approval to join daycare.</p>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">All assessments have been reviewed!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingApprovals.map((dog) => (
                    <motion.div
                      key={dog.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-2xl shadow-xl border-2 border-orange-300 overflow-hidden"
                    >
                      {/* Dog Header */}
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 rounded-full bg-white overflow-hidden">
                              {dog.photo_url ? (
                                <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-4xl">🐕</div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold">{dog.name}</h3>
                              <p className="text-white/90">{dog.breed}</p>
                              {dog.assessment_date && (
                                <p className="text-sm text-white/80 mt-1">
                                  Assessment: {new Date(dog.assessment_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleApproveDog(dog.id)}
                              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleDeclineDog(dog.id)}
                              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
                            >
                              ✗ Decline
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Dog Details */}
                      <div className="p-6 space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-canine-cream rounded-lg p-3">
                            <p className="text-xs text-gray-600">Age</p>
                            <p className="font-bold text-canine-navy">{dog.age_years || 0}y {dog.age_months || 0}m</p>
                          </div>
                          <div className="bg-canine-cream rounded-lg p-3">
                            <p className="text-xs text-gray-600">Gender</p>
                            <p className="font-bold text-canine-navy">{dog.gender || 'Unknown'}</p>
                          </div>
                          <div className="bg-canine-cream rounded-lg p-3">
                            <p className="text-xs text-gray-600">Size</p>
                            <p className="font-bold text-canine-navy">{dog.size || 'Unknown'}</p>
                          </div>
                          <div className="bg-canine-cream rounded-lg p-3">
                            <p className="text-xs text-gray-600">Weight</p>
                            <p className="font-bold text-canine-navy">{dog.weight || '?'} kg</p>
                          </div>
                        </div>

                        {/* Owner Contact */}
                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                          <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2" />
                            Owner Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-blue-700 font-semibold">
                                {dog.owner?.first_name} {dog.owner?.last_name}
                              </p>
                              <p className="text-blue-600">{dog.owner?.email}</p>
                            </div>
                            <div>
                              <p className="text-blue-700 font-semibold flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {dog.owner?.phone}
                              </p>
                              {dog.owner?.address && (
                                <p className="text-blue-600 text-xs mt-1">
                                  {dog.owner.address}, {dog.owner.city} {dog.owner.postcode}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        {dog.emergency_contact_name && (
                          <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                            <h4 className="font-bold text-red-900 mb-2">Emergency Contact</h4>
                            <p className="text-red-700 font-semibold">{dog.emergency_contact_name}</p>
                            <p className="text-red-600">{dog.emergency_contact_phone}</p>
                          </div>
                        )}

                        {/* Medical Info */}
                        {(dog.medical_conditions || dog.medications || dog.allergies) && (
                          <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                            <h4 className="font-bold text-orange-900 mb-2 flex items-center">
                              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                              Medical Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              {dog.medical_conditions && dog.medical_conditions.toLowerCase() !== 'none' && (
                                <div>
                                  <span className="font-semibold text-orange-800">Conditions:</span>
                                  <span className="ml-2 text-gray-700">{dog.medical_conditions}</span>
                                </div>
                              )}
                              {dog.medications && dog.medications.toLowerCase() !== 'none' && (
                                <div>
                                  <span className="font-semibold text-orange-800">Medications:</span>
                                  <span className="ml-2 text-gray-700">{dog.medications}</span>
                                </div>
                              )}
                              {dog.allergies && dog.allergies.toLowerCase() !== 'none' && (
                                <div>
                                  <span className="font-semibold text-orange-800">Allergies:</span>
                                  <span className="ml-2 text-gray-700">{dog.allergies}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Vet Info */}
                        {dog.vet_name && (
                          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                            <h4 className="font-bold text-green-900 mb-2">Veterinary Information</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600">Veterinarian</p>
                                <p className="font-semibold text-green-900">{dog.vet_name}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Phone</p>
                                <p className="font-semibold text-green-900">{dog.vet_phone}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Behavioral Info */}
                        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                          <h4 className="font-bold text-purple-900 mb-2">Behavioral Information</h4>
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">With Dogs</p>
                              <p className="text-2xl">{dog.good_with_dogs ? '✅' : '❌'}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">With Puppies</p>
                              <p className="text-2xl">{dog.good_with_puppies ? '✅' : '❌'}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">With People</p>
                              <p className="text-2xl">{dog.good_with_people ? '✅' : '❌'}</p>
                            </div>
                          </div>
                          {dog.energy_level && (
                            <p className="text-sm">
                              <span className="font-semibold text-purple-800">Energy Level:</span>
                              <span className="ml-2 capitalize text-gray-700">{dog.energy_level.replace('_', ' ')}</span>
                            </p>
                          )}
                          {dog.behavioral_notes && (
                            <p className="text-sm mt-2">
                              <span className="font-semibold text-purple-800">Notes:</span>
                              <span className="ml-2 text-gray-700">{dog.behavioral_notes}</span>
                            </p>
                          )}
                        </div>

                        {/* Special Instructions */}
                        {dog.special_instructions && (
                          <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                            <h4 className="font-bold text-yellow-900 mb-2">Special Instructions</h4>
                            <p className="text-gray-700">{dog.special_instructions}</p>
                          </div>
                        )}

                        {/* Assessment Notes */}
                        {dog.assessment_notes && (
                          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2">Assessment Notes</h4>
                            <p className="text-gray-700">{dog.assessment_notes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ALL DOGS TAB */}
          {activeTab === 'all_dogs' && (
            <motion.div
              key="dogs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold text-canine-navy">Dogs Database ({totalDogs})</h2>
                <div className="relative">
                  <input
                    type="text"
                    value={dogSearchQuery}
                    onChange={(e) => setDogSearchQuery(e.target.value)}
                    placeholder="Search dogs..."
                    className="pl-10 pr-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none w-80"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-canine-gold/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-canine-navy text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Photo</th>
                        <th className="px-6 py-4 text-left font-semibold">Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Breed</th>
                        <th className="px-6 py-4 text-left font-semibold">Age</th>
                        <th className="px-6 py-4 text-left font-semibold">Gender</th>
                        <th className="px-6 py-4 text-left font-semibold">Owner</th>
                        <th className="px-6 py-4 text-left font-semibold">Phone</th>
                        <th className="px-6 py-4 text-center font-semibold">Status</th>
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDogs.map((dog, index) => (
                        <tr
                          key={dog.id}
                          className={`border-t border-gray-200 hover:bg-canine-cream transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4">
                            {dog.photo_url ? (
                              <img
                                src={dog.photo_url}
                                alt={dog.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-canine-sky flex items-center justify-center text-2xl">
                                🐕
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-canine-navy">
                            {dog.name}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {dog.breed}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {dog.age_years !== undefined ? `${dog.age_years}y ${dog.age_months || 0}m` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {dog.gender ? dog.gender.charAt(0).toUpperCase() + dog.gender.slice(1) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {dog.owner?.first_name} {dog.owner?.last_name}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {dog.owner?.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {dog.is_approved ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDogClick(dog)}
                              className="inline-flex items-center px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold transition-colors font-semibold"
                            >
                              View
                              <ArrowRightIcon className="h-4 w-4 ml-2" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredDogs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <UserGroupIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No dogs found</p>
                    {dogSearchQuery && (
                      <p className="text-sm mt-2">Try adjusting your search</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ALL CLIENTS TAB */}
          {activeTab === 'all_clients' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold text-canine-navy">Clients ({totalUsers})</h2>
                <div className="relative">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search clients..."
                    className="pl-10 pr-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none w-80"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-canine-gold/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-canine-navy text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Email</th>
                        <th className="px-6 py-4 text-left font-semibold">Phone</th>
                        <th className="px-6 py-4 text-left font-semibold">Dogs</th>
                        <th className="px-6 py-4 text-left font-semibold">Subscription</th>
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`border-t border-gray-200 hover:bg-canine-cream transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 font-semibold text-canine-navy">
                            {user.first_name} {user.last_name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                          <td className="px-6 py-4">
                            <span className="bg-canine-gold/20 text-canine-navy px-3 py-1 rounded-full text-sm font-semibold">
                              {user.dogs_count} dog{user.dogs_count !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user.subscription_status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.subscription_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={async () => {
                                setSelectedClientForDocs(user)
                                // Fetch client's dogs
                                const { data: dogsData } = await supabase
                                  .from('dogs')
                                  .select('*')
                                  .eq('owner_id', user.id)
                                setClientDogs(dogsData || [])
                                // Fetch client's legal agreement
                                const { data: agreementData } = await supabase
                                  .from('legal_agreements')
                                  .select('*')
                                  .eq('user_id', user.id)
                                  .single()
                                setClientLegalAgreement(agreementData)
                                setShowClientDocsModal(true)
                              }}
                              className="px-4 py-2 bg-canine-navy text-white rounded-lg hover:bg-canine-gold transition-colors font-semibold text-sm flex items-center space-x-1 mx-auto"
                            >
                              <DocumentTextIcon className="h-4 w-4" />
                              <span>View Docs</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ALL BOOKINGS HISTORY TAB */}
          {activeTab === 'all_bookings' && (
            <motion.div
              key="all_bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold text-canine-navy">All Bookings History ({allBookings.length})</h2>
                <div className="relative">
                  <input
                    type="text"
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    placeholder="Search by client name or date..."
                    className="pl-10 pr-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none w-96"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-canine-gold/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-canine-navy text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Date</th>
                        <th className="px-6 py-4 text-left font-semibold">Client</th>
                        <th className="px-6 py-4 text-left font-semibold">Dogs</th>
                        <th className="px-6 py-4 text-left font-semibold">Booking Type</th>
                        <th className="px-6 py-4 text-left font-semibold">Status</th>
                        <th className="px-6 py-4 text-left font-semibold">Check-in</th>
                        <th className="px-6 py-4 text-left font-semibold">Check-out</th>
                        <th className="px-6 py-4 text-right font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                            No bookings found
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((booking, index) => (
                          <tr
                            key={booking.id}
                            className={`border-t border-gray-200 hover:bg-canine-cream transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="px-6 py-4 font-semibold text-canine-navy">
                              {new Date(booking.booking_date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {booking.profiles?.first_name} {booking.profiles?.last_name}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-1">
                                {booking.dogs?.map((dog) => (
                                  <span key={dog.id} className="text-sm text-gray-600">
                                    {dog.name}
                                  </span>
                                )) || (
                                  <span className="text-sm text-gray-400">{booking.dog_ids?.length || 0} dog(s)</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-canine-gold/20 text-canine-navy">
                                Booking
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {booking.checked_in_at
                                ? new Date(booking.checked_in_at).toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {booking.checked_out_at
                                ? new Date(booking.checked_out_at).toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '-'}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-canine-navy">
                              £{(booking.price || booking.total_amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAFF USERS TAB */}
          {activeTab === 'staff_users' && (
            <motion.div
              key="staff_users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold text-canine-navy">Staff Management</h2>
                <button
                  onClick={() => setShowStaffModal(true)}
                  className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:shadow-xl transition-all"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  <span>Create Staff Account</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-canine-gold/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-canine-navy text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Email</th>
                        <th className="px-6 py-4 text-left font-semibold">Phone</th>
                        <th className="px-6 py-4 text-left font-semibold">Role</th>
                        <th className="px-6 py-4 text-left font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffUsers.map((staff, index) => (
                        <tr
                          key={staff.id}
                          className={`border-t border-gray-200 hover:bg-canine-cream transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 font-semibold text-canine-navy">
                            {staff.first_name} {staff.last_name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{staff.email}</td>
                          <td className="px-6 py-4 text-gray-600">{staff.phone}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              staff.role === 'admin'
                                ? 'bg-canine-gold/30 text-canine-navy'
                                : 'bg-canine-sky text-canine-navy'
                            }`}>
                              {staff.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(staff.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAFF ACTIVITY LOG TAB */}
          {activeTab === 'staff_activity' && (
            <motion.div
              key="staff_activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold text-canine-navy">Staff Activity Log</h2>
                <button
                  onClick={fetchStaffActivityLog}
                  className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold font-semibold"
                >
                  Refresh
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-canine-gold/20">
                <div className="p-6 space-y-4">
                  {staffActivityLog.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No activity recorded yet
                    </div>
                  ) : (
                    staffActivityLog
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-4 p-4 rounded-xl hover:bg-canine-cream transition-colors border border-gray-100"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {activity.action_type === 'approval' && (
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                              </div>
                            )}
                            {activity.action_type === 'decline' && (
                              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircleIcon className="h-6 w-6 text-red-600" />
                              </div>
                            )}
                            {(activity.action_type === 'check_in' || activity.action_type === 'check_out') && (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <ClockIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            )}
                            {activity.action_type === 'booking_created' && (
                              <div className="w-10 h-10 rounded-full bg-canine-gold/20 flex items-center justify-center">
                                <CalendarIcon className="h-6 w-6 text-canine-navy" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-canine-navy">
                                {activity.action_type === 'approval' && 'Dog Approved'}
                                {activity.action_type === 'decline' && 'Dog Declined'}
                                {activity.action_type === 'check_in' && 'Dog Checked In'}
                                {activity.action_type === 'check_out' && 'Dog Checked Out'}
                                {activity.action_type === 'booking_created' && 'Booking Created'}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {new Date(activity.timestamp).toLocaleString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-semibold">{activity.staff_name || 'Staff'}</span>
                              {' '}
                              {activity.action_type === 'approval' && 'approved'}
                              {activity.action_type === 'decline' && 'declined'}
                              {activity.action_type === 'check_in' && 'checked in'}
                              {activity.action_type === 'check_out' && 'checked out'}
                              {activity.action_type === 'booking_created' && 'created booking for'}
                              {' '}
                              {activity.dog_name && (
                                <span className="font-semibold text-canine-navy">{activity.dog_name}</span>
                              )}
                              {activity.user_name && (
                                <span> ({activity.user_name})</span>
                              )}
                            </p>
                            {activity.notes && (
                              <p className="text-xs text-gray-500 italic mt-1">
                                Note: {activity.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STAFF PERFORMANCE TAB */}
          {activeTab === 'staff_performance' && (
            <motion.div
              key="staff_performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-3xl font-display font-bold text-canine-navy">Staff Performance Overview</h2>
                <p className="text-gray-600 mt-2">Activity statistics for all staff members</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-canine-gold/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-canine-navy text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Staff Member</th>
                        <th className="px-6 py-4 text-center font-semibold">Approvals</th>
                        <th className="px-6 py-4 text-center font-semibold">Declines</th>
                        <th className="px-6 py-4 text-center font-semibold">Check-ins</th>
                        <th className="px-6 py-4 text-center font-semibold">Check-outs</th>
                        <th className="px-6 py-4 text-center font-semibold">Total Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No staff members found
                          </td>
                        </tr>
                      ) : (
                        staffUsers.map((staff, index) => {
                          const staffActivities = staffActivityLog.filter(
                            (activity) => activity.staff_id === staff.id
                          )
                          const approvals = staffActivities.filter((a) => a.action_type === 'approval').length
                          const declines = staffActivities.filter((a) => a.action_type === 'decline').length
                          const checkIns = staffActivities.filter((a) => a.action_type === 'check_in').length
                          const checkOuts = staffActivities.filter((a) => a.action_type === 'check_out').length
                          const totalActions = staffActivities.length

                          return (
                            <tr
                              key={staff.id}
                              className={`border-t border-gray-200 hover:bg-canine-cream transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-canine-navy">
                                    {staff.first_name} {staff.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500">{staff.email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 font-bold">
                                  {approvals}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-800 font-bold">
                                  {declines}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-800 font-bold">
                                  {checkIns}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-800 font-bold">
                                  {checkOuts}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-canine-gold/30 text-canine-navy font-bold">
                                  {totalActions}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* LEGAL AGREEMENTS TAB */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Client Compliance</h2>
                  <p className="text-gray-600">View client agreements, vaccinations, assessments, and subscriptions</p>
                </div>
                <button
                  onClick={() => {
                    fetchLegalAgreements()
                    fetchDashboardData()
                  }}
                  className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold"
                >
                  Refresh
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-canine-navy text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Client Name</th>
                      <th className="px-4 py-3 text-center">Waivers Signed</th>
                      <th className="px-4 py-3 text-center">Dog Photo</th>
                      <th className="px-4 py-3 text-center">Vaccinated</th>
                      <th className="px-4 py-3 text-center">Assessment Done</th>
                      <th className="px-4 py-3 text-center">Subscription</th>
                      <th className="px-4 py-3 text-left">Cancellation Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => {
                      // Find legal agreement for this user
                      const agreement = legalAgreements.find(a => a.user_id === user.id)

                      // Check if essential waivers are signed (terms and injury waiver are required)
                      const allWaiversSigned = agreement ? (
                        agreement.terms_agreed &&
                        agreement.injury_waiver_agreed
                      ) : false

                      // Find ALL user's dogs (not just approved ones) for compliance check
                      const userDogs = allDogs.filter(dog => dog.owner_id === user.id)

                      // Check if ANY dog has a photo (check both photo_url exists and is not empty)
                      const hasPhoto = userDogs.some(dog => dog.photo_url && dog.photo_url.trim() !== '')

                      // Check if ALL dogs are vaccinated
                      const allVaccinated = userDogs.length > 0 && userDogs.every(dog => dog.vaccinated === true)

                      // Check if ANY dog has COMPLETED assessment (only check assessment_completed, NOT assessment_date)
                      // assessment_date just means it's booked, not completed
                      const hasAssessment = userDogs.some(dog => dog.assessment_completed === true)

                      // Check subscription status
                      const hasActiveSubscription = user.subscription_status && user.subscription_status !== 'None'

                      // Debug logging for first user
                      if (user.email === 'user@test.com') {
                        console.log('🔍 Compliance Debug for', user.first_name, user.last_name, ':', {
                          userDogs: userDogs.length,
                          dogDetails: userDogs.map(d => ({
                            name: d.name,
                            photo_url: d.photo_url,
                            vaccinated: d.vaccinated,
                            assessment_completed: d.assessment_completed,
                            assessment_date: d.assessment_date,
                            is_approved: d.is_approved
                          })),
                          hasPhoto,
                          allVaccinated,
                          hasAssessment,
                          allWaiversSigned,
                          agreement
                        })
                      }

                      return (
                        <tr key={user.id} className="border-b hover:bg-canine-cream">
                          <td className="px-4 py-3 font-medium">
                            {user.first_name} {user.last_name}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {allWaiversSigned ? (
                              <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {hasPhoto ? (
                              <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {allVaccinated ? (
                              <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {hasAssessment ? (
                              <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {hasActiveSubscription ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                {user.subscription_status}
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                None
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            -
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MEDICATIONS TAB */}
          {activeTab === 'medications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Dog Medications</h2>
                  <p className="text-gray-600">Track medications for all dogs</p>
                </div>
                <button
                  onClick={fetchDogMedications}
                  className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold"
                >
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dogMedications.map((med) => (
                  <div key={med.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-canine-navy">{med.dogs?.name}</h3>
                        <p className="text-sm text-gray-600">{med.dogs?.breed}</p>
                      </div>
                      <BeakerIcon className="h-6 w-6 text-blue-500" />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Medication</p>
                        <p className="font-semibold text-canine-navy">{med.medication_name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Dosage</p>
                          <p className="font-medium">{med.dosage}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Frequency</p>
                          <p className="font-medium">{med.frequency}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Period</p>
                        <p className="text-sm">
                          {new Date(med.start_date).toLocaleDateString()} -
                          {med.end_date ? new Date(med.end_date).toLocaleDateString() : 'Ongoing'}
                        </p>
                      </div>

                      {med.notes && (
                        <div>
                          <p className="text-xs text-gray-500">Notes</p>
                          <p className="text-sm">{med.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {dogMedications.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <BeakerIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No medications recorded</p>
                </div>
              )}
            </div>
          )}

          {/* INCIDENTS TAB */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Incident Reports</h2>
                  <p className="text-gray-600">View all reported incidents</p>
                </div>
                <button
                  onClick={fetchIncidents}
                  className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                          <h3 className="font-bold text-lg text-canine-navy">{incident.incident_type}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            incident.severity === 'high' ? 'bg-red-100 text-red-800' :
                            incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(incident.occurred_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{incident.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Reported by: <strong>{incident.reported_by}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {incidents.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <ExclamationTriangleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No incidents reported</p>
                </div>
              )}
            </div>
          )}

          {/* STAFF SCHEDULE & ASSIGNMENTS TAB */}
          {activeTab === 'staff_schedule' && (
            <div className="space-y-6">
              {/* Header with Date Selector */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Staff Schedule & Assignments</h2>
                  <p className="text-gray-600">Manage staff assignments and tasks</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={assignmentDate}
                    onChange={(e) => handleAssignmentDateChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold"
                  />
                  <button
                    onClick={() => {
                      fetchStaffMembers()
                      fetchStaffAssignments()
                      fetchStaffTasks()
                    }}
                    className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Staff Today</p>
                      <p className="text-3xl font-bold mt-1">{staffAssignments.length}</p>
                    </div>
                    <UsersIcon className="h-12 w-12 text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Assignments</p>
                      <p className="text-3xl font-bold mt-1">{staffAssignments.length}</p>
                    </div>
                    <CalendarDaysIcon className="h-12 w-12 text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Pending Tasks</p>
                      <p className="text-3xl font-bold mt-1">{staffTasks.filter(t => t.status === 'pending').length}</p>
                    </div>
                    <ClockIcon className="h-12 w-12 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-canine-navy mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setEditingAssignment(null)
                      setAssignmentFormData({
                        staff_id: '',
                        area_type: 'playground_1',
                        area_name: '',
                        shift_start: '07:00',
                        shift_end: '19:00',
                        assignment_notes: ''
                      })
                      setShowAssignmentModal(true)
                      fetchStaffMembers()
                    }}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all"
                  >
                    <PlusCircleIcon className="h-6 w-6" />
                    <span className="font-semibold">Create Staff Assignment</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingTask(null)
                      setTaskFormData({
                        assigned_to_staff_id: '',
                        task_title: '',
                        task_description: '',
                        priority: 'medium',
                        due_time: '',
                        estimated_duration_minutes: 0
                      })
                      setShowTaskModal(true)
                      fetchStaffMembers()
                    }}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-canine-gold to-canine-light-gold text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all"
                  >
                    <PlusCircleIcon className="h-6 w-6" />
                    <span className="font-semibold">Create Staff Task</span>
                  </button>
                </div>
              </div>

              {/* Today's Staff Assignments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-canine-navy">Staff Assignments</h3>
                  <select
                    value={assignmentFilterArea}
                    onChange={(e) => setAssignmentFilterArea(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Areas</option>
                    <option value="playground_1">Playground 1</option>
                    <option value="playground_2">Playground 2</option>
                    <option value="playground_3">Playground 3</option>
                    <option value="indoor_play">Indoor Play Area</option>
                    <option value="reception">Reception</option>
                    <option value="feeding_area">Feeding Area</option>
                    <option value="grooming">Grooming</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {staffAssignments.filter(a => assignmentFilterArea === 'all' || a.area_type === assignmentFilterArea).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-canine-navy text-white">
                        <tr>
                          <th className="px-4 py-3 text-left">Staff Name</th>
                          <th className="px-4 py-3 text-left">Area</th>
                          <th className="px-4 py-3 text-left">Shift Start</th>
                          <th className="px-4 py-3 text-left">Shift End</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffAssignments
                          .filter(a => assignmentFilterArea === 'all' || a.area_type === assignmentFilterArea)
                          .map((assignment) => (
                          <tr key={assignment.id} className="border-b hover:bg-canine-cream">
                            <td className="px-4 py-3 font-medium">
                              {assignment.profiles?.first_name} {assignment.profiles?.last_name}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                assignment.area_type === 'playground_1' ? 'bg-blue-100 text-blue-800' :
                                assignment.area_type === 'playground_2' ? 'bg-green-100 text-green-800' :
                                assignment.area_type === 'playground_3' ? 'bg-purple-100 text-purple-800' :
                                assignment.area_type === 'indoor_play' ? 'bg-yellow-100 text-yellow-800' :
                                assignment.area_type === 'reception' ? 'bg-pink-100 text-pink-800' :
                                assignment.area_type === 'feeding_area' ? 'bg-orange-100 text-orange-800' :
                                assignment.area_type === 'grooming' ? 'bg-teal-100 text-teal-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {assignment.area_type === 'other' && assignment.area_name ? assignment.area_name : assignment.area_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{assignment.shift_start}</td>
                            <td className="px-4 py-3 text-sm">{assignment.shift_end}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                assignment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                assignment.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                                assignment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {assignment.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditAssignment(assignment)}
                                  className="text-canine-gold hover:text-canine-light-gold"
                                >
                                  <Cog6ToothIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No assignments for this date</p>
                  </div>
                )}
              </div>

              {/* Today's Staff Tasks */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-canine-navy">Staff Tasks</h3>
                  <div className="flex gap-2">
                    <select
                      value={taskFilterPriority}
                      onChange={(e) => setTaskFilterPriority(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select
                      value={taskFilterStatus}
                      onChange={(e) => setTaskFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {staffTasks
                  .filter(t => (taskFilterPriority === 'all' || t.priority === taskFilterPriority) && (taskFilterStatus === 'all' || t.status === taskFilterStatus))
                  .length > 0 ? (
                  <div className="space-y-3">
                    {staffTasks
                      .filter(t => (taskFilterPriority === 'all' || t.priority === taskFilterPriority) && (taskFilterStatus === 'all' || t.status === taskFilterStatus))
                      .map((task) => (
                      <div key={task.id} className={`border-l-4 rounded-lg p-4 shadow ${
                        task.priority === 'urgent' ? 'border-red-500 bg-red-50' :
                        task.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                        task.priority === 'medium' ? 'border-blue-500 bg-blue-50' :
                        'border-gray-500 bg-gray-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-canine-navy">{task.task_title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                task.priority === 'urgent' ? 'bg-red-100 text-red-800 animate-pulse' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.priority}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                task.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{task.task_description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4" />
                                {task.profiles?.first_name} {task.profiles?.last_name}
                              </span>
                              {task.due_time && (
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-4 w-4" />
                                  Due: {task.due_time}
                                </span>
                              )}
                              {task.estimated_duration_minutes && (
                                <span>Est. {task.estimated_duration_minutes} mins</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-canine-gold hover:text-canine-light-gold"
                            >
                              <Cog6ToothIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No tasks for this date</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Client Documents</h2>
                  <p className="text-gray-600">View all client legal agreements and documents</p>
                </div>
                <button
                  onClick={fetchLegalAgreements}
                  className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold"
                >
                  Refresh
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-canine-navy text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Client Name</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-center">Terms</th>
                      <th className="px-6 py-4 text-center">Waiver</th>
                      <th className="px-6 py-4 text-center">Photo</th>
                      <th className="px-6 py-4 text-center">Billing</th>
                      <th className="px-6 py-4 text-center">Password</th>
                      <th className="px-6 py-4 text-left">Signed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {legalAgreements.map((agreement) => (
                      <tr key={agreement.id} className="border-b hover:bg-canine-cream">
                        <td className="px-6 py-4 font-medium">
                          {agreement.profiles?.first_name} {agreement.profiles?.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{agreement.profiles?.email}</td>
                        <td className="px-6 py-4 text-center">
                          {agreement.terms_agreed ? (
                            <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {agreement.injury_waiver_agreed ? (
                            <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {agreement.photo_permission_agreed ? (
                            <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {agreement.recurring_billing_agreed ? (
                            <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {agreement.password_policy_agreed ? (
                            <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(agreement.signed_at).toLocaleDateString('en-GB')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {legalAgreements.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No documents found</p>
                </div>
              )}
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Financial Transactions</h2>
                  <p className="text-gray-600">View all payment transactions</p>
                </div>
                <button
                  onClick={fetchFinancialTransactions}
                  className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold"
                >
                  Refresh
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-canine-navy text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">User</th>
                      <th className="px-6 py-4 text-left">Type</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-left">Stripe ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-canine-cream">
                        <td className="px-6 py-4 text-sm">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                        </td>
                        <td className="px-6 py-4 capitalize">{transaction.transaction_type}</td>
                        <td className="px-6 py-4 text-right font-semibold">
                          £{(transaction.amount / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600 font-mono">
                          {transaction.stripe_payment_id || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {financialTransactions.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <CurrencyPoundIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No transactions found</p>
                </div>
              )}
            </div>
          )}

          {/* DISCOUNT USAGE TAB */}
          {activeTab === 'discounts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Discount Usage</h2>
                  <p className="text-gray-600">Track all discount code usage and savings</p>
                </div>
                <button
                  onClick={fetchDiscountUsages}
                  className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold"
                >
                  Refresh
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Discounts Used</h3>
                  <p className="text-3xl font-bold text-purple-600">{discountUsages.length}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Savings</h3>
                  <p className="text-3xl font-bold text-green-600">
                    £{discountUsages.reduce((sum, usage) => sum + usage.discount_amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Original Amount</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    £{discountUsages.reduce((sum, usage) => sum + usage.original_amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-canine-gold/30">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Revenue After Discounts</h3>
                  <p className="text-3xl font-bold text-canine-navy">
                    £{discountUsages.reduce((sum, usage) => sum + usage.final_amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Discount Usage Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-canine-navy text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">User</th>
                      <th className="px-6 py-4 text-left">Code</th>
                      <th className="px-6 py-4 text-left">Type</th>
                      <th className="px-6 py-4 text-left">Used For</th>
                      <th className="px-6 py-4 text-right">Original Amount</th>
                      <th className="px-6 py-4 text-right">Discount</th>
                      <th className="px-6 py-4 text-right">Final Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discountUsages.map((usage) => {
                      const discountCode = Array.isArray(usage.discount_codes)
                        ? usage.discount_codes[0]
                        : usage.discount_codes
                      const profile = Array.isArray(usage.profiles)
                        ? usage.profiles[0]
                        : usage.profiles

                      return (
                        <tr key={usage.id} className="border-b hover:bg-canine-cream">
                          <td className="px-6 py-4 text-sm">
                            {new Date(usage.created_at).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold">{profile?.first_name} {profile?.last_name}</p>
                              <p className="text-xs text-gray-500">{profile?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                              {discountCode?.code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm">
                              {discountCode?.discount_type === 'percentage'
                                ? `${discountCode.discount_value}%`
                                : `£${discountCode?.discount_value}`}
                            </span>
                          </td>
                          <td className="px-6 py-4 capitalize">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              usage.used_for === 'assessment' ? 'bg-teal-100 text-teal-700' :
                              usage.used_for === 'subscription' ? 'bg-blue-100 text-blue-700' :
                              usage.used_for === 'individual_days' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {usage.used_for.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            £{usage.original_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-green-600 font-semibold">
                            -£{usage.discount_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-canine-navy">
                            £{usage.final_amount.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {discountUsages.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No discount codes have been used yet</p>
                </div>
              )}
            </div>
          )}

          {/* MONTHLY REVENUE TAB */}
          {activeTab === 'monthly_revenue' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Monthly Revenue</h2>
                  <p className="text-gray-600">Revenue breakdown by month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-canine-gold/20">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">This Month</h3>
                  <p className="text-3xl font-bold text-canine-navy">£{monthlyRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-canine-gold/20">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Subscriptions</h3>
                  <p className="text-3xl font-bold text-canine-gold">{activeSubscriptions}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-canine-gold/20">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Clients</h3>
                  <p className="text-3xl font-bold text-canine-navy">{totalUsers}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-display font-bold text-canine-navy mb-4">Revenue by Source</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-canine-cream rounded-lg">
                    <div>
                      <p className="font-semibold text-canine-navy">Assessment Bookings</p>
                      <p className="text-sm text-gray-600">Initial assessment fees</p>
                    </div>
                    <p className="text-2xl font-bold text-canine-gold">£{assessmentRevenue.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-canine-cream rounded-lg">
                    <div>
                      <p className="font-semibold text-canine-navy">Daycare Bookings</p>
                      <p className="text-sm text-gray-600">Daily bookings revenue</p>
                    </div>
                    <p className="text-2xl font-bold text-canine-navy">£{bookingRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS TAB */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Subscription Management</h2>
                  <p className="text-gray-600">View all active subscriptions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-canine-gold/20">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Subscriptions</h3>
                  <p className="text-3xl font-bold text-canine-navy">{activeSubscriptions}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-canine-gold/20">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Monthly Recurring Revenue</h3>
                  <p className="text-3xl font-bold text-canine-gold">£{recurringRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-canine-gold/20">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Average per Customer</h3>
                  <p className="text-3xl font-bold text-canine-navy">
                    £{activeSubscriptions > 0 ? (recurringRevenue / activeSubscriptions).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-canine-navy text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Client Name</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Tier</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-left">Start Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.filter(u => u.subscription_status !== 'None').map((user) => (
                      <tr key={user.id} className="border-b hover:bg-canine-cream">
                        <td className="px-6 py-4 font-medium">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-canine-gold/20 text-canine-navy rounded-full text-sm font-semibold">
                            {user.subscription_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {allUsers.filter(u => u.subscription_status !== 'None').length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No active subscriptions</p>
                </div>
              )}
            </div>
          )}

          {/* CANCELLED SUBSCRIPTIONS TAB */}
          {activeTab === 'cancellations' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Cancelled Subscriptions</h2>
                  <p className="text-gray-600">View cancelled subscriptions and customer feedback</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={cancelledSubsFilter}
                    onChange={(e) => setCancelledSubsFilter(e.target.value as any)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="all">All Time</option>
                  </select>
                  <button
                    onClick={() => {
                      const csv = generateCancelledSubsCSV()
                      const blob = new Blob([csv], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `cancelled-subscriptions-${new Date().toISOString().split('T')[0]}.csv`
                      a.click()
                      toast.success('CSV exported successfully!')
                    }}
                    className="bg-canine-navy text-white px-4 py-2 rounded-xl font-semibold hover:bg-canine-navy/90 transition-all flex items-center space-x-2"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              {(() => {
                const now = new Date()
                const filterDate =
                  cancelledSubsFilter === '7days' ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) :
                  cancelledSubsFilter === '30days' ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) :
                  cancelledSubsFilter === '3months' ? new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) :
                  new Date(0)

                const filteredCancellations = cancelledSubscriptions.filter(sub =>
                  new Date(sub.cancellation_date) >= filterDate
                )

                const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                const cancellationsThisMonth = cancelledSubscriptions.filter(sub =>
                  new Date(sub.cancellation_date) >= thisMonthStart
                ).length

                const reasonsProvided = filteredCancellations.filter(sub => sub.cancellation_reason && sub.cancellation_reason.trim()).length
                const reasonsCount: {[key: string]: number} = {}

                filteredCancellations.forEach(sub => {
                  if (sub.cancellation_reason && sub.cancellation_reason.trim()) {
                    const reason = sub.cancellation_reason.toLowerCase()
                    if (reason.includes('expensive') || reason.includes('price') || reason.includes('cost') || reason.includes('afford')) {
                      reasonsCount['Price/Cost'] = (reasonsCount['Price/Cost'] || 0) + 1
                    }
                    if (reason.includes('moving') || reason.includes('relocat')) {
                      reasonsCount['Relocation'] = (reasonsCount['Relocation'] || 0) + 1
                    }
                    if (reason.includes('behavioral') || reason.includes('behaviour') || reason.includes('aggress')) {
                      reasonsCount['Behavioral Issues'] = (reasonsCount['Behavioral Issues'] || 0) + 1
                    }
                    if (reason.includes('health') || reason.includes('sick') || reason.includes('medical')) {
                      reasonsCount['Health Issues'] = (reasonsCount['Health Issues'] || 0) + 1
                    }
                    if (reason.includes('schedule') || reason.includes('time') || reason.includes('hours')) {
                      reasonsCount['Schedule/Hours'] = (reasonsCount['Schedule/Hours'] || 0) + 1
                    }
                    if (reason.includes('service') || reason.includes('quality') || reason.includes('unsatisfied')) {
                      reasonsCount['Service Quality'] = (reasonsCount['Service Quality'] || 0) + 1
                    }
                  }
                })

                const mostCommonReason = Object.entries(reasonsCount).sort((a, b) => b[1] - a[1])[0]
                const totalRevenueLost = filteredCancellations.reduce((sum, sub) =>
                  sum + (sub.subscription_tiers?.price_monthly || 0), 0
                )

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-600">Total Cancellations</h3>
                          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                        </div>
                        <p className="text-3xl font-bold text-red-600">{filteredCancellations.length}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {cancelledSubsFilter === 'all' ? 'All time' :
                           cancelledSubsFilter === '7days' ? 'Last 7 days' :
                           cancelledSubsFilter === '30days' ? 'Last 30 days' : 'Last 3 months'}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-600">This Month</h3>
                          <CalendarIcon className="h-6 w-6 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-orange-600">{cancellationsThisMonth}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-600">Feedback Rate</h3>
                          <ChatBubbleLeftRightIcon className="h-6 w-6 text-amber-500" />
                        </div>
                        <p className="text-3xl font-bold text-amber-600">
                          {filteredCancellations.length > 0
                            ? Math.round((reasonsProvided / filteredCancellations.length) * 100)
                            : 0}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {reasonsProvided} of {filteredCancellations.length} provided reason
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-rose-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-600">Revenue Lost</h3>
                          <BanknotesIcon className="h-6 w-6 text-rose-500" />
                        </div>
                        <p className="text-3xl font-bold text-rose-600">£{totalRevenueLost.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">Monthly recurring revenue</p>
                      </div>
                    </div>

                    {mostCommonReason && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200 mb-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-amber-500 rounded-full p-3">
                            <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-amber-900 mb-1">Most Common Cancellation Reason</h3>
                            <p className="text-amber-800 text-xl font-semibold">{mostCommonReason[0]}</p>
                            <p className="text-sm text-amber-700 mt-1">
                              Mentioned in {mostCommonReason[1]} cancellation{mostCommonReason[1] > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                      <input
                        type="text"
                        value={cancelledSubsSearch}
                        onChange={(e) => setCancelledSubsSearch(e.target.value)}
                        placeholder="Search by user name or dog name..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      />
                    </div>

                    {/* Cancellations Table/Cards */}
                    {filteredCancellations
                      .filter(sub => {
                        const searchLower = cancelledSubsSearch.toLowerCase()
                        const userName = `${sub.profiles?.first_name || ''} ${sub.profiles?.last_name || ''}`.toLowerCase()
                        const dogName = sub.dogs?.name?.toLowerCase() || ''
                        return userName.includes(searchLower) || dogName.includes(searchLower)
                      })
                      .length > 0 ? (
                      <div className="space-y-4">
                        {filteredCancellations
                          .filter(sub => {
                            const searchLower = cancelledSubsSearch.toLowerCase()
                            const userName = `${sub.profiles?.first_name || ''} ${sub.profiles?.last_name || ''}`.toLowerCase()
                            const dogName = sub.dogs?.name?.toLowerCase() || ''
                            return userName.includes(searchLower) || dogName.includes(searchLower)
                          })
                          .map((sub) => {
                            const cancelledDate = new Date(sub.cancellation_date)
                            const isRecent = (now.getTime() - cancelledDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
                            const nextBillingDate = sub.next_billing_date ? new Date(sub.next_billing_date) : null

                            // Calculate days remaining at cancellation
                            const daysRemaining = sub.days_remaining || 0
                            const monthlyPrice = sub.subscription_tiers?.price_monthly || 0

                            // Highlight keywords in reason
                            const reason = sub.cancellation_reason || ''
                            const keywords = ['expensive', 'price', 'cost', 'afford', 'moving', 'relocat', 'behavioral', 'behaviour', 'aggress', 'health', 'sick', 'medical', 'schedule', 'time', 'hours', 'service', 'quality', 'unsatisfied']

                            return (
                              <div
                                key={sub.id}
                                className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
                                  isRecent ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                                }`}
                              >
                                {isRecent && (
                                  <div className="mb-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                      Recent Cancellation (Last 7 Days)
                                    </span>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h3 className="font-bold text-xl text-canine-navy mb-3">
                                      {sub.profiles?.first_name} {sub.profiles?.last_name}
                                    </h3>

                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500 w-32">Dog:</span>
                                        <span className="font-semibold text-canine-navy">{sub.dogs?.name || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500 w-32">Cancelled:</span>
                                        <span className="font-semibold text-red-600">
                                          {cancelledDate.toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500 w-32">Subscription Plan:</span>
                                        <span className="font-semibold">
                                          {sub.tier || 'N/A'} - {sub.days_included || 0} days
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500 w-32">Days Remaining:</span>
                                        <span className={`font-bold ${daysRemaining > 5 ? 'text-orange-600' : 'text-gray-600'}`}>
                                          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                                        </span>
                                      </div>
                                      {nextBillingDate && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-500 w-32">Next billing was:</span>
                                          <span className="text-gray-700">
                                            {nextBillingDate.toLocaleDateString('en-GB')}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500 w-32">Revenue Lost:</span>
                                        <span className="font-bold text-rose-600">£{monthlyPrice.toFixed(2)}/month</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-bold text-sm text-gray-700 mb-2">Cancellation Reason:</h4>
                                    {reason && reason.trim() ? (
                                      <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                                        <div className="relative">
                                          <QuoteIcon className="absolute -top-2 -left-2 h-6 w-6 text-gray-300" />
                                          <p className="text-gray-800 italic pl-6">
                                            {keywords.reduce((text, keyword) => {
                                              const regex = new RegExp(`(${keyword})`, 'gi')
                                              return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
                                            }, reason).split(/<mark class="bg-yellow-200 px-1 rounded">|<\/mark>/).map((part: string, i: number) => {
                                              if (keywords.some(kw => part.toLowerCase().includes(kw.toLowerCase()))) {
                                                return <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark>
                                              }
                                              return part
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200 text-center">
                                        <p className="text-gray-400 italic">No reason provided</p>
                                      </div>
                                    )}

                                    <div className="mt-3">
                                      <a
                                        href={`mailto:${sub.profiles?.email}?subject=We'd love to hear from you about your cancellation`}
                                        className="inline-flex items-center text-sm text-canine-navy hover:text-canine-gold transition-colors gap-1"
                                      >
                                        <EnvelopeIcon className="h-4 w-4" />
                                        Follow up: {sub.profiles?.email}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl p-12 text-center">
                        <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-semibold">
                          {cancelledSubsSearch ? 'No cancellations match your search' : 'No cancelled subscriptions yet!'}
                        </p>
                        {!cancelledSubsSearch && (
                          <p className="text-gray-500 mt-2">Keep up the great work!</p>
                        )}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* PRICING TIERS TAB */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">Pricing Tiers</h2>
                  <p className="text-gray-600">Manage subscription pricing tiers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionTiers.map((tier) => (
                  <div key={tier.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-canine-gold/20 hover:border-canine-gold transition-all">
                    <h3 className="text-2xl font-display font-bold text-canine-navy mb-2">{tier.name}</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold text-canine-gold">
                        £{tier.monthly_price || tier.price_monthly || 0}
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-gray-600">
                        <strong>Days included:</strong> {tier.days_included || tier.days_per_month || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Price per day:</strong> £{tier.price_per_day || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Session type:</strong> {tier.session_type || 'Full Day'}
                      </p>
                    </div>
                    {tier.description && (
                      <p className="text-sm text-gray-700 border-t pt-4">
                        {tier.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {subscriptionTiers.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No pricing tiers configured</p>
                </div>
              )}
            </div>
          )}

          {/* PLAY GROUPS TAB */}
          {activeTab === 'playgroups' && (
            <motion.div
              key="playgroups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-display font-bold text-canine-navy">Play Groups</h2>
                <button
                  onClick={() => {
                    setEditingGroup({
                      id: '',
                      name: '',
                      description: '',
                      color: '#3b82f6',
                      icon: '🐕',
                      max_dogs: 10,
                      notes: '',
                      active: true
                    })
                    setShowGroupModal(true)
                  }}
                  className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Create New Group</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playGroups.map(group => {
                  const assignedDogIds = group.dog_play_groups?.map(dpg => dpg.dog_id) || []
                  const assignedDogsCount = assignedDogIds.length

                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-canine-gold/20 hover:shadow-xl transition-all"
                      style={{ borderLeftColor: group.color, borderLeftWidth: '6px' }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-4xl">{group.icon}</span>
                          <div>
                            <h3 className="font-bold text-xl text-canine-navy">{group.name}</h3>
                            <p className="text-sm text-gray-600">{group.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Dogs Assigned:</span>
                          <span className="font-bold text-canine-navy">
                            {assignedDogsCount} / {group.max_dogs}
                          </span>
                        </div>
                        {group.notes && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">{group.notes}</p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setAssigningToGroup(group)
                            setSelectedDogsForGroup(assignedDogIds)
                            setShowAssignDogsModal(true)
                          }}
                          className="flex-1 bg-canine-gold text-white py-2 rounded-lg font-semibold hover:bg-canine-light-gold transition-all text-sm"
                        >
                          Assign Dogs
                        </button>
                        <button
                          onClick={() => {
                            setEditingGroup(group)
                            setShowGroupModal(true)
                          }}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="bg-red-100 text-red-600 px-3 py-2 rounded-lg font-semibold hover:bg-red-200 transition-all"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {playGroups.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl">
                    <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No play groups created yet</p>
                    <p className="text-gray-400 text-sm">Create your first group to organize dogs during daycare</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* NEWSLETTER TAB */}
          {activeTab === 'newsletter' && (
            <motion.div
              key="newsletter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-display font-bold text-canine-navy mb-6">Send Newsletter</h2>

              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-canine-gold/20 max-w-3xl mx-auto">
                <div className="space-y-6">
                  {/* Recipients */}
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Recipients</label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setNewsletterRecipients('all')}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          newsletterRecipients === 'all'
                            ? 'bg-canine-navy text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All Clients ({totalUsers})
                      </button>
                      <button
                        onClick={() => setNewsletterRecipients('individual')}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          newsletterRecipients === 'individual'
                            ? 'bg-canine-navy text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Individual Client
                      </button>
                    </div>
                  </div>

                  {/* Individual User Selector */}
                  {newsletterRecipients === 'individual' && (
                    <div>
                      <label className="block text-sm font-semibold text-canine-navy mb-2">Select Client</label>
                      <select
                        value={selectedUserForEmail}
                        onChange={(e) => setSelectedUserForEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                      >
                        <option value="">Choose a client...</option>
                        {allUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Subject</label>
                    <input
                      type="text"
                      value={newsletterSubject}
                      onChange={(e) => setNewsletterSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Message</label>
                    <textarea
                      value={newsletterMessage}
                      onChange={(e) => setNewsletterMessage(e.target.value)}
                      placeholder="Write your message here..."
                      rows={10}
                      className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none resize-none"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendNewsletter}
                    className="w-full bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <PaperAirplaneIcon className="h-6 w-6" />
                    <span>Send Newsletter</span>
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Note: Email service integration required for this feature to function
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* BUSINESS SETTINGS TAB */}
          {activeTab === 'business_settings' && (
            <motion.div
              key="business_settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-display font-bold text-canine-navy">Business Settings</h2>
                <button
                  onClick={() => {
                    const allOpen = Object.values(openSections).every(v => v)
                    setOpenSections({
                      assessment: !allOpen,
                      hours: !allOpen,
                      pricing: !allOpen,
                      discounts: !allOpen,
                      closedDays: !allOpen,
                      sections: !allOpen,
                      tiers: !allOpen
                    })
                  }}
                  className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-light-gold transition-all font-semibold text-sm flex items-center gap-2"
                >
                  {Object.values(openSections).every(v => v) ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4" />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4" />
                      Expand All
                    </>
                  )}
                </button>
              </div>

              <div className="max-w-5xl mx-auto space-y-6">

                {/* Section 1: Assessment Scheduling */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-xl border-2 border-blue-300">
                  <button
                    onClick={() => toggleSection('assessment')}
                    className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <CalendarDaysIcon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-display font-bold text-canine-navy">Assessment Scheduling</h3>
                        <p className="text-sm text-gray-600">Configure assessment fees and availability</p>
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-6 w-6 text-blue-500 transition-transform ${openSections.assessment ? 'rotate-180' : ''}`} />
                  </button>

                  {/* ASSESSMENT SLOT MANAGEMENT LINK */}
                  <div className="mb-6">
                    <Link
                      href="/staff/admin-dashboard/assessment-slots"
                      className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <CalendarDaysIcon className="h-6 w-6" />
                            <h4 className="text-xl font-bold">Assessment Slot Management</h4>
                          </div>
                          <p className="text-sm text-white/90">Create manual slots for specific dates OR recurring templates for the full year (1 user per slot)</p>
                        </div>
                        <ChevronRightIcon className="h-6 w-6" />
                      </div>
                    </Link>
                  </div>

                  <div className={`transition-all duration-300 ${openSections.assessment ? 'block' : 'hidden'}`}>
                  <div className="bg-white rounded-xl p-6 mb-6 border-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                          <CurrencyPoundIcon className="h-4 w-4 text-canine-gold" />
                          Assessment Fee (£)
                        </label>
                        <input
                          type="number"
                          value={settings.assessment_fee}
                          onChange={(e) => setSettings({...settings, assessment_fee: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none font-semibold text-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">One-time fee per assessment</p>
                      </div>
                    </div>
                  </div>

                  {/* Day-by-Day Time Slots */}
                  <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ClockIcon className="h-5 w-5 text-blue-500" />
                      <h4 className="text-lg font-semibold text-canine-navy">Weekly Time Slots</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">Configure specific time slots for each day of the week (1 assessment per slot)</p>

                    <div className="space-y-3">
                      {[
                        { day: 1, label: 'Monday', color: 'border-l-4 border-l-blue-500 bg-blue-50/50' },
                        { day: 2, label: 'Tuesday', color: 'border-l-4 border-l-green-500 bg-green-50/50' },
                        { day: 3, label: 'Wednesday', color: 'border-l-4 border-l-purple-500 bg-purple-50/50' },
                        { day: 4, label: 'Thursday', color: 'border-l-4 border-l-orange-500 bg-orange-50/50' },
                        { day: 5, label: 'Friday', color: 'border-l-4 border-l-pink-500 bg-pink-50/50' },
                        { day: 6, label: 'Saturday', color: 'border-l-4 border-l-yellow-500 bg-yellow-50/50' },
                        { day: 0, label: 'Sunday', color: 'border-l-4 border-l-red-500 bg-red-50/50' },
                      ].map(({ day, label, color }) => {
                        const daySlots = recurringSlots.filter(slot => slot.day_of_week === day)

                        return (
                          <div key={day} className={`${color} border-2 border-gray-200 rounded-xl p-4 transition-all hover:shadow-md`}>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-canine-navy text-base">{label}</h5>
                              <button
                                onClick={() => handleAddSlot(day, label)}
                                className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-gold/90 text-sm font-semibold flex items-center gap-1 transition-all hover:scale-105"
                              >
                                <PlusIcon className="h-4 w-4" />
                                Add Slot
                              </button>
                            </div>

                            {/* Show actual slots from database */}
                            <div className="space-y-2">
                              {daySlots.length > 0 ? (
                                daySlots.map(slot => (
                                  <div key={slot.id} className="bg-white p-3 rounded-lg flex items-center justify-between text-sm shadow-sm border border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <ClockIcon className="h-4 w-4 text-canine-gold" />
                                      <span className="font-semibold text-canine-navy">
                                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteSlot(slot.id, label, `${slot.start_time.substring(0, 5)}-${slot.end_time.substring(0, 5)}`)}
                                      className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-1 hover:scale-105 transition-all"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      Delete
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-400 italic py-2 text-center">No slots configured</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  </div>
                </div>

                {/* Section 2: Business Hours */}
                <div className="bg-gradient-to-br from-canine-gold/10 to-white rounded-2xl p-8 shadow-xl border-2 border-canine-gold/30">
                  <button
                    onClick={() => toggleSection('hours')}
                    className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-canine-gold p-3 rounded-xl">
                        <ClockIcon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-display font-bold text-canine-navy">Business Hours</h3>
                        <p className="text-sm text-gray-600">Set your daycare operating hours</p>
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-6 w-6 text-canine-gold transition-transform ${openSections.hours ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`transition-all duration-300 ${openSections.hours ? 'block' : 'hidden'}`}>
                  <div className="bg-white rounded-xl p-6 border-2 border-canine-gold/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-canine-gold" />
                          Opening Time
                        </label>
                        <input
                          type="time"
                          value={settings.opening_time}
                          onChange={(e) => setSettings({...settings, opening_time: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none font-semibold text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-canine-gold" />
                          Closing Time
                        </label>
                        <input
                          type="time"
                          value={settings.closing_time}
                          onChange={(e) => setSettings({...settings, closing_time: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none font-semibold text-lg"
                        />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Section 2.25: Pricing & Capacity Management - Individual Day Price & Daily Capacity */}
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 shadow-xl border-2 border-purple-300">
                  <button
                    onClick={() => toggleSection('pricing')}
                    className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500 p-3 rounded-xl">
                        <CurrencyPoundIcon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-display font-bold text-canine-navy">Pricing & Capacity</h3>
                        <p className="text-sm text-gray-600">Configure individual day booking prices and daily capacity limits</p>
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-6 w-6 text-purple-500 transition-transform ${openSections.pricing ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`transition-all duration-300 ${openSections.pricing ? 'block' : 'hidden'}`}>
                  <div className="bg-white rounded-xl p-6 mb-6 border-2 border-purple-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                          <CurrencyPoundIcon className="h-4 w-4 text-canine-gold" />
                          Individual Day Price (£)
                        </label>
                        <input
                          type="number"
                          value={settings.individual_day_price}
                          onChange={(e) => setSettings({...settings, individual_day_price: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none font-semibold text-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Price per individual day booking</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                          <UserGroupIcon className="h-4 w-4 text-canine-gold" />
                          Daily Dog Limit
                        </label>
                        <input
                          type="number"
                          value={settings.daily_dog_limit}
                          onChange={(e) => setSettings({...settings, daily_dog_limit: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none font-semibold text-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum total dogs per day (subscriptions + individual bookings)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-canine-gold" />
                          Enable Individual Bookings
                        </label>
                        <select
                          value={settings.enable_individual_bookings ? 'true' : 'false'}
                          onChange={(e) => setSettings({...settings, enable_individual_bookings: e.target.value === 'true'})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none font-semibold text-lg"
                        >
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Allow customers to book individual days</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <ExclamationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">Real-time Capacity Management</p>
                        <p>The system automatically tracks bookings and prevents overbooking by checking capacity in real-time. Separate capacity limits are maintained for small dogs vs medium/large dogs.</p>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Section 2.3: Discount Codes Management */}
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-8 shadow-xl border-2 border-amber-300">
                  <button
                    onClick={() => toggleSection('discounts')}
                    className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-500 p-3 rounded-xl">
                        <TicketIcon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-display font-bold text-canine-navy">Discount Codes</h3>
                        <p className="text-sm text-gray-600">Create and manage promotional discount codes for purchases</p>
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-6 w-6 text-amber-500 transition-transform ${openSections.discounts ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`transition-all duration-300 ${openSections.discounts ? 'block' : 'hidden'}`}>
                  <div className="bg-white rounded-xl p-6 border-2 border-amber-200">
                    <p className="text-gray-700 mb-4">
                      Manage voucher codes that customers can use during checkout to receive discounts on subscriptions, extra days, assessments, and individual day bookings.
                    </p>
                    <Link
                      href="/staff/admin-dashboard/discount-codes"
                      className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      <TicketIcon className="h-6 w-6" />
                      <span>Manage Discount Codes</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mt-4">
                    <div className="flex items-start gap-3">
                      <ExclamationCircleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-900">
                        <p className="font-semibold mb-1">Discount Code Features</p>
                        <p>Create percentage or fixed amount discounts, set expiration dates, usage limits, and control which purchase types the codes apply to. Codes work with both Stripe and PayPal payments.</p>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Section 2.4: Closed Days Management */}
                <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-8 shadow-xl border-2 border-red-300">
                  <button
                    onClick={() => toggleSection('closedDays')}
                    className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500 p-3 rounded-xl">
                        <XCircleIcon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-display font-bold text-canine-navy">Closed Days</h3>
                        <p className="text-sm text-gray-600">Manage dates when the business is closed</p>
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-6 w-6 text-red-500 transition-transform ${openSections.closedDays ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`transition-all duration-300 ${openSections.closedDays ? 'block' : 'hidden'}`}>
                    {/* Add New Closed Day */}
                    <div className="bg-white rounded-xl p-6 mb-6 border-2 border-red-200">
                      <h4 className="text-lg font-semibold text-canine-navy mb-4 flex items-center gap-2">
                        <PlusIcon className="h-5 w-5 text-red-500" />
                        Add Closed Day
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            value={newClosedDate}
                            onChange={(e) => setNewClosedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border-2 border-red-300 focus:border-red-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason (Optional)
                          </label>
                          <input
                            type="text"
                            value={newClosedReason}
                            onChange={(e) => setNewClosedReason(e.target.value)}
                            placeholder="e.g., Christmas Day, Staff Training"
                            className="w-full px-4 py-3 rounded-xl border-2 border-red-300 focus:border-red-500 outline-none"
                          />
                        </div>
                        <button
                          onClick={handleAddClosedDay}
                          disabled={!newClosedDate || addingClosedDay}
                          className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {addingClosedDay ? 'Adding...' : 'Add Closed Day'}
                        </button>
                      </div>
                    </div>

                    {/* Existing Closed Days List */}
                    <div className="bg-white rounded-xl p-6 border-2 border-red-200">
                      <h4 className="text-lg font-semibold text-canine-navy mb-4">Upcoming Closed Days ({closedDays.length})</h4>

                      {closedDays.length === 0 ? (
                        <div className="text-center py-8">
                          <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No closed days scheduled. Add closed days above to prevent bookings on specific dates.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {closedDays.map((closedDay: any) => (
                            <div
                              key={closedDay.id}
                              className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200"
                            >
                              <div className="flex items-center gap-3">
                                <CalendarIcon className="h-5 w-5 text-red-600" />
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {new Date(closedDay.closed_date).toLocaleDateString('en-GB', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  {closedDay.reason && (
                                    <p className="text-sm text-gray-600">{closedDay.reason}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteClosedDay(closedDay.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-semibold"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-red-50 rounded-xl p-4 border border-red-200 mt-4">
                      <div className="flex items-start gap-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-900">
                          <p className="font-semibold mb-1">Closed Days Information</p>
                          <p>Dates marked as closed will be automatically blocked on all booking pages (assessments, subscriptions, individual days). Users will not be able to select or book these dates.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2.5: Sections Management */}
                <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 shadow-xl border-2 border-green-300">
                  <button
                    onClick={() => toggleSection('sections')}
                    className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-3 rounded-xl">
                        <BuildingOfficeIcon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-display font-bold text-canine-navy">Sections Management</h3>
                        <p className="text-sm text-gray-600">Manage roll call sections/areas</p>
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-6 w-6 text-green-500 transition-transform ${openSections.sections ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`transition-all duration-300 ${openSections.sections ? 'block' : 'hidden'}`}>
                  {/* Add New Section */}
                  <div className="bg-white rounded-xl p-6 mb-6 border-2 border-green-200">
                    <h4 className="text-lg font-semibold text-canine-navy mb-4 flex items-center gap-2">
                      <PlusIcon className="h-5 w-5 text-green-500" />
                      Add New Section
                    </h4>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                        placeholder="Section name (e.g., Playground 1, Inside Area)"
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                      />
                      <button
                        onClick={handleAddSection}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all transform hover:scale-105"
                      >
                        <PlusIcon className="h-5 w-5 inline mr-1" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Existing Sections List */}
                  <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                    <h4 className="text-lg font-semibold text-canine-navy mb-4">Existing Sections ({sections.length})</h4>

                    {sections.length === 0 ? (
                      <div className="text-center py-8">
                        <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No sections yet. Add your first section above!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sections.map((section) => (
                          <div
                            key={section.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all"
                          >
                            {editingSectionId === section.id ? (
                              // Edit Mode
                              <div className="flex gap-3 flex-1">
                                <input
                                  type="text"
                                  value={editingSectionName}
                                  onChange={(e) => setEditingSectionName(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateSection(section.id)}
                                  className="flex-1 px-4 py-2 rounded-lg border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateSection(section.id)}
                                  className="px-4 py-2 bg-canine-gold text-white rounded-lg hover:bg-canine-gold/90 font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSectionId(null)
                                    setEditingSectionName('')
                                  }}
                                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              // View Mode
                              <>
                                <div className="flex items-center gap-3">
                                  <BuildingOfficeIcon className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-canine-navy">{section.name}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingSectionId(section.id)
                                      setEditingSectionName(section.name)
                                    }}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSection(section.id, section.name)}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-sm"
                                  >
                                    <TrashIcon className="h-4 w-4 inline" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  </div>
                </div>

                {/* Section 3: Subscription Tiers */}
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 shadow-xl border-2 border-purple-300">
                  <button
                    onClick={() => toggleSection('tiers')}
                    className="w-full flex items-center justify-between mb-6 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500 p-3 rounded-xl">
                        <CreditCardIcon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-display font-bold text-canine-navy">Subscription Tiers Pricing</h3>
                        <p className="text-sm text-gray-600">Configure monthly prices and extra day rates</p>
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-6 w-6 text-purple-500 transition-transform ${openSections.tiers ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`transition-all duration-300 ${openSections.tiers ? 'block' : 'hidden'}`}>
                  <p className="text-sm text-gray-600 mb-6 bg-white rounded-lg p-4 border-l-4 border-purple-400">
                    💡 <strong>Tip:</strong> The extra day price is what customers pay when they purchase additional days beyond their subscription allowance.
                  </p>

                  <div className="space-y-4">
                    {subscriptionTiers.map((tier, index) => (
                      <div key={tier.id} className="bg-white p-6 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-canine-navy text-lg">{tier.name}</h4>
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {tier.days_included} days/month
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <label className="block text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                              <CurrencyPoundIcon className="h-4 w-4 text-canine-gold" />
                              Monthly Subscription Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={tier.monthly_price}
                              onChange={(e) => {
                                const updated = [...subscriptionTiers]
                                updated[index].monthly_price = parseFloat(e.target.value)
                                setSubscriptionTiers(updated)
                              }}
                              className="w-full px-4 py-3 rounded-lg border-2 border-canine-gold/30 focus:border-canine-gold outline-none font-semibold text-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Total monthly subscription cost</p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                              <BanknotesIcon className="h-4 w-4 text-canine-gold" />
                              Extra Day Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={tier.price_per_day}
                              onChange={(e) => {
                                const updated = [...subscriptionTiers]
                                updated[index].price_per_day = parseFloat(e.target.value)
                                setSubscriptionTiers(updated)
                              }}
                              className="w-full px-4 py-3 rounded-lg border-2 border-canine-gold/30 focus:border-canine-gold outline-none font-semibold text-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Price per additional day</p>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            <strong>Customer Value:</strong> £{(parseFloat(tier.monthly_price) / tier.days_included).toFixed(2)} per day when using all {tier.days_included} days
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-3"
                >
                  <CheckCircleIcon className="h-6 w-6" />
                  Save All Settings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dog Details Modal */}
      <AnimatePresence>
        {showDogModal && selectedDog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDogModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-bold">{selectedDog.name}</h2>
                  <button
                    onClick={() => setShowDogModal(false)}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Dog Photo & Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedDog.photo_url && (
                    <div className="aspect-square rounded-2xl overflow-hidden border-4 border-canine-gold/30">
                      <img src={selectedDog.photo_url} alt={selectedDog.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="bg-canine-cream rounded-xl p-4 border-2 border-canine-gold/20">
                      <p className="text-xs text-gray-500 mb-3 font-bold">BASIC INFORMATION</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">Breed:</span>
                          <span className="font-semibold text-canine-navy">{selectedDog.breed || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-semibold text-canine-navy">
                            {selectedDog.age_years ? `${selectedDog.age_years}y ${selectedDog.age_months || 0}m` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-semibold text-canine-navy">{selectedDog.gender || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-semibold text-canine-navy">{selectedDog.size || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">Weight:</span>
                          <span className="font-semibold text-canine-navy">{selectedDog.weight ? `${selectedDog.weight} kg` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">Color:</span>
                          <span className="font-semibold text-canine-navy">{selectedDog.color || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">Neutered:</span>
                          <span className="font-semibold text-canine-navy">
                            {selectedDog.neutered !== undefined ? (selectedDog.neutered ? 'Yes ✓' : 'No ✗') : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">Microchipped:</span>
                          <span className="font-semibold text-canine-navy">
                            {selectedDog.microchipped !== undefined ? (selectedDog.microchipped ? 'Yes ✓' : 'No ✗') : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-600">Energy Level:</span>
                          <span className="font-semibold text-canine-navy">{selectedDog.energy_level || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="space-y-2">
                      {selectedDog.is_approved !== undefined && (
                        <div className={`rounded-xl p-3 border-2 ${selectedDog.is_approved ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                          <p className="text-sm font-semibold">{selectedDog.is_approved ? '✅ Approved for Daycare' : '⏳ Pending Approval'}</p>
                        </div>
                      )}
                      {selectedDog.photo_permission !== undefined && (
                        <div className={`rounded-xl p-3 border-2 ${selectedDog.photo_permission ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <p className="text-sm font-semibold">{selectedDog.photo_permission ? '📸 Photo Permission Granted' : '🚫 No Photo Permission'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white rounded-xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center">
                    <UserIcon className="h-6 w-6 mr-2" />
                    OWNER INFORMATION
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-canine-sky text-xs mb-1 font-semibold">FULL NAME</p>
                      <p className="font-bold text-lg">{selectedDog.owner?.first_name || 'N/A'} {selectedDog.owner?.last_name || ''}</p>
                    </div>
                    <div>
                      <p className="text-canine-sky text-xs mb-1 font-semibold">EMAIL</p>
                      <p className="font-semibold">{selectedDog.owner?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-canine-sky text-xs mb-1 font-semibold">PHONE</p>
                      <p className="font-semibold text-lg">{selectedDog.owner?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-canine-sky text-xs mb-1 font-semibold">CITY</p>
                      <p className="font-semibold">{selectedDog.owner?.city || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-canine-sky text-xs mb-1 font-semibold">POSTCODE</p>
                      <p className="font-semibold">{selectedDog.owner?.postcode || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-1">
                      <p className="text-canine-sky text-xs mb-1 font-semibold">ADDRESS</p>
                      <p className="font-semibold">{selectedDog.owner?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-orange-900">
                    <PhoneIcon className="h-6 w-6 mr-2" />
                    EMERGENCY CONTACT
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-orange-700 mb-1 font-semibold">NAME</p>
                      <p className="font-bold text-lg text-orange-900">{selectedDog.emergency_contact_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-700 mb-1 font-semibold">PHONE</p>
                      <p className="font-bold text-lg text-orange-900">{selectedDog.emergency_contact_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-700 mb-1 font-semibold">RELATIONSHIP</p>
                      <p className="font-bold text-lg text-orange-900">{selectedDog.emergency_contact_relationship || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Medical & Health Information */}
                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-red-900">
                    <BeakerIcon className="h-6 w-6 mr-2" />
                    MEDICAL & HEALTH INFORMATION
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1 font-semibold">VACCINATED</p>
                      <p className="font-bold text-canine-navy text-lg">
                        {selectedDog.vaccinated !== undefined ? (selectedDog.vaccinated ? '✅ Yes' : '❌ No') : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1 font-semibold">VACCINATION EXPIRY</p>
                      <p className="font-bold text-canine-navy text-lg">
                        {selectedDog.vaccination_expiry ? new Date(selectedDog.vaccination_expiry).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-bold text-red-800 mb-2">⚠️ MEDICAL CONDITIONS</p>
                      <p className="text-gray-700">{selectedDog.medical_conditions || 'None reported'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-bold text-red-800 mb-2">💊 MEDICATIONS</p>
                      <p className="text-gray-700">{selectedDog.medications || 'None'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-bold text-red-800 mb-2">🚨 ALLERGIES</p>
                      <p className="text-gray-700">{selectedDog.allergies || 'None reported'}</p>
                    </div>
                  </div>
                </div>

                {/* Veterinarian */}
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-blue-900">
                    <HeartIcon className="h-6 w-6 mr-2" />
                    VETERINARIAN
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-700 mb-1 font-semibold">VET NAME</p>
                      <p className="font-bold text-lg text-blue-900">{selectedDog.vet_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 mb-1 font-semibold">VET PHONE</p>
                      <p className="font-bold text-lg text-blue-900">{selectedDog.vet_phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Feeding Information */}
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-green-900">
                    🍖 FEEDING INFORMATION
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-bold text-green-800 mb-2">DIETARY REQUIREMENTS</p>
                      <p className="text-gray-700">{selectedDog.dietary_requirements || 'None specified'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-bold text-green-800 mb-2">SPECIAL DIETARY REQUIREMENTS</p>
                      <p className="text-gray-700">{selectedDog.special_dietary_requirements || 'None'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-bold text-green-800 mb-2">FEEDING INSTRUCTIONS</p>
                      <p className="text-gray-700">{selectedDog.feeding_instructions || 'Standard feeding'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-bold text-green-800 mb-2">FEEDING TIMES</p>
                      <p className="text-gray-700">{selectedDog.feeding_times || 'Standard schedule'}</p>
                    </div>
                  </div>
                </div>

                {/* Behavioral & Socialization */}
                <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-yellow-900">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                    BEHAVIORAL & SOCIALIZATION
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-yellow-700 mb-1 font-semibold">GOOD WITH DOGS</p>
                      <p className="font-bold text-lg text-yellow-900">
                        {selectedDog.good_with_dogs !== undefined ? (selectedDog.good_with_dogs ? '✅ Yes' : '❌ No') : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-yellow-700 mb-1 font-semibold">GOOD WITH PUPPIES</p>
                      <p className="font-bold text-lg text-yellow-900">
                        {selectedDog.good_with_puppies !== undefined ? (selectedDog.good_with_puppies ? '✅ Yes' : '❌ No') : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-yellow-700 mb-1 font-semibold">GOOD WITH PEOPLE</p>
                      <p className="font-bold text-lg text-yellow-900">
                        {selectedDog.good_with_people !== undefined ? (selectedDog.good_with_people ? '✅ Yes' : '❌ No') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-bold text-yellow-800 mb-2">BEHAVIORAL NOTES</p>
                      <p className="text-gray-700">{selectedDog.behavioral_notes || 'None reported'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-bold text-yellow-800 mb-2">SPECIAL INSTRUCTIONS</p>
                      <p className="text-gray-700">{selectedDog.special_instructions || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Assessment Information */}
                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-purple-900">
                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                    ASSESSMENT INFORMATION
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-purple-700 mb-1 font-semibold">ASSESSMENT COMPLETED</p>
                      <p className="font-bold text-lg text-purple-900">
                        {selectedDog.assessment_completed !== undefined ? (selectedDog.assessment_completed ? '✅ Yes' : '❌ No') : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-purple-700 mb-1 font-semibold">ASSESSMENT DATE</p>
                      <p className="font-bold text-lg text-purple-900">
                        {selectedDog.assessment_date ? new Date(selectedDog.assessment_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-bold text-purple-800 mb-2">ASSESSMENT NOTES</p>
                    <p className="text-gray-700">{selectedDog.assessment_notes || 'No notes available'}</p>
                  </div>
                </div>

                {/* Pickup & Dropoff Authorization */}
                <div className="bg-cyan-50 rounded-xl p-6 border-2 border-cyan-200">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-cyan-900">
                    <UserGroupIcon className="h-6 w-6 mr-2" />
                    PICKUP & DROPOFF AUTHORIZATION
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs font-bold text-cyan-800 mb-3">AUTHORIZED DROPOFF PEOPLE</p>
                      {selectedDog.authorized_dropoff_people && selectedDog.authorized_dropoff_people.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {selectedDog.authorized_dropoff_people.map((person, idx) => (
                            <li key={idx} className="text-gray-700">{person}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">None specified</p>
                      )}
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs font-bold text-cyan-800 mb-3">AUTHORIZED PICKUP PEOPLE</p>
                      {selectedDog.authorized_pickup_people && selectedDog.authorized_pickup_people.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {selectedDog.authorized_pickup_people.map((person, idx) => (
                            <li key={idx} className="text-gray-700">{person}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">None specified</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 bg-white rounded-lg p-3">
                    <p className="text-xs font-bold text-cyan-800 mb-2">CHECKOUT PASSWORD</p>
                    <p className="text-gray-700 font-mono text-lg">{selectedDog.checkout_password || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Creation Modal */}
      <AnimatePresence>
        {showStaffModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStaffModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-t-3xl sticky top-0 z-10">
                <h2 className="text-2xl font-display font-bold">Create Staff Account</h2>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">First Name *</label>
                    <input
                      type="text"
                      value={newStaffFirstName}
                      onChange={(e) => setNewStaffFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={newStaffLastName}
                      onChange={(e) => setNewStaffLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Email *</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Password *</label>
                  <input
                    type="password"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Role *</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setNewStaffRole('staff')}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        newStaffRole === 'staff'
                          ? 'bg-canine-navy text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Staff
                    </button>
                    <button
                      onClick={() => setNewStaffRole('admin')}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        newStaffRole === 'admin'
                          ? 'bg-canine-navy text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                {newStaffRole === 'staff' && (
                  <div className="border-2 border-canine-gold/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-canine-navy mb-4">Staff Permissions</h3>
                    <p className="text-sm text-gray-600 mb-4">Select which features this staff member can access</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'can_view_today', label: 'View Today\'s Dogs' },
                        { key: 'can_check_in', label: 'Check In Dogs' },
                        { key: 'can_check_out', label: 'Check Out Dogs' },
                        { key: 'can_feed_dogs', label: 'Mark Meals Complete' },
                        { key: 'can_view_schedule', label: 'View Schedule' },
                        { key: 'can_view_medications', label: 'View Medications' },
                        { key: 'can_approve_assessments', label: 'Approve/Deny Assessments' },
                        { key: 'can_manage_playgroups', label: 'Manage Playgroups' },
                        { key: 'can_view_reports', label: 'View Reports & Analytics' },
                        { key: 'can_manage_staff', label: 'Manage Other Staff' },
                      ].map((perm) => (
                        <label key={perm.key} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={staffPermissions[perm.key as keyof typeof staffPermissions]}
                            onChange={(e) => setStaffPermissions({
                              ...staffPermissions,
                              [perm.key]: e.target.checked
                            })}
                            className="h-5 w-5 text-canine-gold focus:ring-canine-gold rounded"
                          />
                          <span className="text-sm text-gray-700">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowStaffModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateStaff}
                    className="flex-1 bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
                  >
                    Create Account
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Note: Server-side API required for account creation
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Play Group Modal */}
      <AnimatePresence>
        {showGroupModal && editingGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGroupModal(false)}
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
                <h2 className="text-2xl font-display font-bold">
                  {editingGroup.id ? 'Edit Play Group' : 'Create Play Group'}
                </h2>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Group Name *</label>
                  <input
                    type="text"
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                    placeholder="e.g., Big Dogs Morning"
                    className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Description</label>
                  <input
                    type="text"
                    value={editingGroup.description || ''}
                    onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})}
                    placeholder="e.g., High-energy large dogs"
                    className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Color</label>
                    <input
                      type="color"
                      value={editingGroup.color}
                      onChange={(e) => setEditingGroup({...editingGroup, color: e.target.value})}
                      className="w-full h-12 rounded-xl border-2 border-canine-gold/30 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Icon (Emoji)</label>
                    <input
                      type="text"
                      value={editingGroup.icon}
                      onChange={(e) => setEditingGroup({...editingGroup, icon: e.target.value})}
                      placeholder="🐕"
                      maxLength={2}
                      className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none text-2xl text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Max Dogs</label>
                  <input
                    type="number"
                    value={editingGroup.max_dogs}
                    onChange={(e) => setEditingGroup({...editingGroup, max_dogs: parseInt(e.target.value)})}
                    min={1}
                    max={50}
                    className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Notes</label>
                  <textarea
                    value={editingGroup.notes || ''}
                    onChange={(e) => setEditingGroup({...editingGroup, notes: e.target.value})}
                    placeholder="Any special instructions or notes about this group..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none resize-none"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowGroupModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    className="flex-1 bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
                  >
                    {editingGroup.id ? 'Update Group' : 'Create Group'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Dogs to Group Modal */}
      <AnimatePresence>
        {showAssignDogsModal && assigningToGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAssignDogsModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-t-3xl">
                <h2 className="text-2xl font-display font-bold">
                  Assign Dogs to {assigningToGroup.name}
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  Select dogs to add to this play group (max: {assigningToGroup.max_dogs})
                </p>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allDogs.map(dog => {
                    const isSelected = selectedDogsForGroup.includes(dog.id)
                    return (
                      <button
                        key={dog.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDogsForGroup(selectedDogsForGroup.filter(id => id !== dog.id))
                          } else {
                            if (selectedDogsForGroup.length < assigningToGroup.max_dogs) {
                              setSelectedDogsForGroup([...selectedDogsForGroup, dog.id])
                            } else {
                              toast.error(`Maximum ${assigningToGroup.max_dogs} dogs allowed in this group`)
                            }
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-canine-gold bg-canine-gold/10'
                            : 'border-gray-200 hover:border-canine-gold/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {dog.photo_url ? (
                            <img src={dog.photo_url} alt={dog.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-canine-gold to-canine-light-gold flex items-center justify-center text-white font-bold text-lg">
                              {dog.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-canine-navy">{dog.name}</p>
                            <p className="text-sm text-gray-600">{dog.breed}</p>
                          </div>
                          {isSelected && (
                            <CheckIcon className="h-6 w-6 text-canine-gold ml-auto" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {allDogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No dogs found in the system
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 rounded-b-3xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-bold text-canine-navy">{selectedDogsForGroup.length}</span> / {assigningToGroup.max_dogs}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAssignDogsModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignDogs}
                    className="flex-1 bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
                  >
                    Save Assignments
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLIENT DOCUMENTS MODAL */}
      <AnimatePresence>
        {showClientDocsModal && selectedClientForDocs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowClientDocsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-canine-navy to-[#2a5a7a] rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">
                      Client Documents
                    </h3>
                    <p className="text-canine-cream text-sm mt-1">
                      {selectedClientForDocs.first_name} {selectedClientForDocs.last_name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowClientDocsModal(false)}
                    className="text-white hover:text-canine-gold transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Client Information */}
                <div className="bg-canine-cream rounded-xl p-4">
                  <h4 className="font-semibold text-canine-navy mb-2 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-semibold text-gray-700">{selectedClientForDocs.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-700">{selectedClientForDocs.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Legal Agreements */}
                <div className="bg-white border-2 border-canine-gold/20 rounded-xl p-4">
                  <h4 className="font-semibold text-canine-navy mb-3 flex items-center">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                    Legal Agreements
                  </h4>
                  {clientLegalAgreement ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Terms & Conditions</span>
                        {clientLegalAgreement.terms_agreed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Injury Waiver</span>
                        {clientLegalAgreement.injury_waiver_agreed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Photo Permission</span>
                        {clientLegalAgreement.photo_permission_agreed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Recurring Billing</span>
                        {clientLegalAgreement.recurring_billing_agreed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Password Policy</span>
                        {clientLegalAgreement.password_policy_agreed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Signed on: {new Date(clientLegalAgreement.signed_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-sm">No legal agreements signed yet</p>
                    </div>
                  )}
                </div>

                {/* Client's Dogs */}
                <div className="bg-white border-2 border-canine-gold/20 rounded-xl p-4">
                  <h4 className="font-semibold text-canine-navy mb-3 flex items-center">
                    <HeartIcon className="h-5 w-5 mr-2" />
                    Registered Dogs ({clientDogs.length})
                  </h4>
                  {clientDogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {clientDogs.map((dog) => (
                        <div
                          key={dog.id}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-canine-cream hover:bg-canine-gold/10 transition-colors"
                        >
                          {dog.photo_url ? (
                            <img src={dog.photo_url} alt={dog.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-canine-gold to-canine-light-gold flex items-center justify-center text-white font-bold">
                              {dog.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-grow">
                            <p className="font-semibold text-canine-navy">{dog.name}</p>
                            <p className="text-sm text-gray-600">{dog.breed}</p>
                          </div>
                          <div>
                            {dog.is_approved ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No dogs registered yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-b-3xl">
                <button
                  onClick={() => setShowClientDocsModal(false)}
                  className="w-full bg-canine-navy text-white py-3 rounded-xl font-semibold hover:bg-canine-gold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAFF ASSIGNMENT MODAL */}
      <AnimatePresence>
        {showAssignmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAssignmentModal(false)
              setEditingAssignment(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] p-6 rounded-t-3xl">
                <h2 className="text-2xl font-display font-bold text-white">
                  {editingAssignment ? 'Edit Staff Assignment' : 'Create Staff Assignment'}
                </h2>
                <p className="text-white/80 text-sm mt-1">Assign staff member to an area for a shift</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Assignment Date */}
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Assignment Date</label>
                  <input
                    type="date"
                    value={assignmentDate}
                    onChange={(e) => setAssignmentDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                </div>

                {/* Staff Member */}
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Staff Member *</label>
                  <select
                    value={assignmentFormData.staff_id}
                    onChange={(e) => setAssignmentFormData({...assignmentFormData, staff_id: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    required
                  >
                    <option value="">Select staff member...</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area/Location */}
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Area/Location *</label>
                  <select
                    value={assignmentFormData.area_type}
                    onChange={(e) => setAssignmentFormData({...assignmentFormData, area_type: e.target.value as StaffAssignment['area_type']})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    required
                  >
                    <option value="playground_1">Playground 1</option>
                    <option value="playground_2">Playground 2</option>
                    <option value="playground_3">Playground 3</option>
                    <option value="indoor_play">Indoor Play Area</option>
                    <option value="reception">Reception</option>
                    <option value="feeding_area">Feeding Area</option>
                    <option value="grooming">Grooming</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Custom Area Name (if Other selected) */}
                {assignmentFormData.area_type === 'other' && (
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Custom Area Name</label>
                    <input
                      type="text"
                      value={assignmentFormData.area_name}
                      onChange={(e) => setAssignmentFormData({...assignmentFormData, area_name: e.target.value})}
                      placeholder="Enter custom area name..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>
                )}

                {/* Shift Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Shift Start *</label>
                    <input
                      type="time"
                      value={assignmentFormData.shift_start}
                      onChange={(e) => setAssignmentFormData({...assignmentFormData, shift_start: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Shift End *</label>
                    <input
                      type="time"
                      value={assignmentFormData.shift_end}
                      onChange={(e) => setAssignmentFormData({...assignmentFormData, shift_end: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Assignment Notes */}
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Assignment Notes (Optional)</label>
                  <textarea
                    value={assignmentFormData.assignment_notes}
                    onChange={(e) => setAssignmentFormData({...assignmentFormData, assignment_notes: e.target.value})}
                    placeholder="Any special instructions or notes..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-b-3xl flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignmentModal(false)
                    setEditingAssignment(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssignment}
                  className="flex-1 bg-canine-navy text-white py-3 rounded-xl font-semibold hover:bg-canine-gold transition-all"
                >
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAFF TASK MODAL */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowTaskModal(false)
              setEditingTask(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-canine-gold to-canine-light-gold p-6 rounded-t-3xl">
                <h2 className="text-2xl font-display font-bold text-white">
                  {editingTask ? 'Edit Staff Task' : 'Create Staff Task'}
                </h2>
                <p className="text-white/80 text-sm mt-1">Assign a task to a staff member</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Task Date */}
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Task Date</label>
                  <input
                    type="date"
                    value={assignmentDate}
                    onChange={(e) => setAssignmentDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                </div>

                {/* Assign To */}
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Assign To *</label>
                  <select
                    value={taskFormData.assigned_to_staff_id}
                    onChange={(e) => setTaskFormData({...taskFormData, assigned_to_staff_id: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    required
                  >
                    <option value="">Select staff member...</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Title */}
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Task Title *</label>
                  <input
                    type="text"
                    value={taskFormData.task_title}
                    onChange={(e) => setTaskFormData({...taskFormData, task_title: e.target.value})}
                    placeholder="e.g., Clean reception area"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    required
                  />
                </div>

                {/* Task Description */}
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Task Description</label>
                  <textarea
                    value={taskFormData.task_description}
                    onChange={(e) => setTaskFormData({...taskFormData, task_description: e.target.value})}
                    placeholder="Detailed description of the task..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent resize-none"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">Priority *</label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({...taskFormData, priority: e.target.value as StaffTask['priority']})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Due Time & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Due Time (Optional)</label>
                    <input
                      type="time"
                      value={taskFormData.due_time}
                      onChange={(e) => setTaskFormData({...taskFormData, due_time: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-canine-navy mb-2">Est. Duration (mins)</label>
                    <input
                      type="number"
                      value={taskFormData.estimated_duration_minutes}
                      onChange={(e) => setTaskFormData({...taskFormData, estimated_duration_minutes: parseInt(e.target.value) || 0})}
                      placeholder="30"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-b-3xl flex gap-3">
                <button
                  onClick={() => {
                    setShowTaskModal(false)
                    setEditingTask(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="flex-1 bg-canine-gold text-white py-3 rounded-xl font-semibold hover:bg-canine-light-gold transition-all"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
