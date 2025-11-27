'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  CakeIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  DocumentArrowUpIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

type TabType = 'today' | 'rollcall' | 'schedule' | 'assessments' | 'feeding' | 'medications' | 'incidents' | 'playgroups'
type AssessmentView = 'calendar' | 'approvals'

interface Dog {
  id: string
  name: string
  breed: string
  photo_url?: string
  owner_id: string
  owner?: {
    first_name: string
    last_name: string
    phone: string
    email: string
  }
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_conditions?: string
  medications?: string
  allergies?: string
  dietary_requirements?: string
  behavioral_notes?: string
  special_instructions?: string
  photo_permission?: boolean
  feeding_schedule?: string
  assessment_date?: string
  assessment_time?: string
  assessment_end_time?: string
  assessment_completed?: boolean
  assessment_notes?: string
  assessment_video_url?: string
  is_approved?: boolean
}

interface DogWithBooking extends Dog {
  booking_id: string
  check_in_time?: string
  check_out_time?: string
}

interface PlayGroup {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  max_dogs: number
  notes?: string
  dogs: Dog[]
}

interface Medication {
  id: string
  dog_id: string
  medication_name: string
  dosage: string
  frequency: string
  time_of_day?: string
  notes?: string
  dogs: Dog
}

interface Incident {
  id: string
  incident_type: string
  severity: string
  title: string
  description: string
  dog_id?: string
  reported_by_staff_id?: string
  occurred_at: string
  location?: string
  action_taken?: string
  vet_notified: boolean
  owner_notified: boolean
  owner_notified_at?: string
  requires_follow_up: boolean
  follow_up_notes?: string
  resolved: boolean
  resolved_at?: string
  created_at: string
  updated_at: string
  dogs?: Dog
  reported_by_staff?: {
    first_name: string
    last_name: string
  }
}

interface WeeklyBooking {
  date: string
  dog_count: number
  dogs: {
    name: string
    breed: string
    owner_name: string
    photo_url?: string
  }[]
}

interface FeedingDog {
  dog_id: string
  dog_name: string
  dog_photo_url?: string
  owner_name: string
  booking_id: string
  feeding_schedule?: string
  dietary_requirements?: string
  breakfast_completed?: boolean
  breakfast_completed_at?: string
  lunch_completed?: boolean
  lunch_completed_at?: string
  dinner_completed?: boolean
  dinner_completed_at?: string
}

interface RollCall {
  id: string
  date: string
  time: '11am' | '5pm'
  status: 'not_started' | 'in_progress' | 'completed'
  conducted_by_staff_id?: string
  conducted_by_staff_name?: string
  started_at?: string
  completed_at?: string
  dogs_expected: string[]
  dogs_present: string[]
  dogs_missing: string[]
  notes?: string
  section?: string
  dog_count?: number
  actual_time?: string
}

interface StaffAssignment {
  id: string
  staff_id: string
  date: string
  area: string
  shift_start: string
  shift_end: string
  checked_in: boolean
  checked_in_at?: string
  checked_out: boolean
  checked_out_at?: string
  notes?: string
}

interface StaffTask {
  id: string
  staff_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string
  due_time?: string
  completed: boolean
  completed_at?: string
}

export default function StaffDashboard() {
  const router = useRouter()
  const [staffName, setStaffName] = useState('Staff')
  const [staffId, setStaffId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [assessmentView, setAssessmentView] = useState<AssessmentView>('calendar')
  const [showAssessmentDropdown, setShowAssessmentDropdown] = useState(false)
  const assessmentDropdownRef = useRef<HTMLDivElement>(null)

  // Dashboard data
  const [playGroups, setPlayGroups] = useState<PlayGroup[]>([])
  const [unassignedDogs, setUnassignedDogs] = useState<Dog[]>([])
  const [medicationsToday, setMedicationsToday] = useState<Medication[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [allDogs, setAllDogs] = useState<Dog[]>([])
  const [totalDogsToday, setTotalDogsToday] = useState(0)

  // New data states
  const [todayDogs, setTodayDogs] = useState<{
    notCheckedIn: DogWithBooking[]
    checkedIn: DogWithBooking[]
    checkedOut: DogWithBooking[]
  }>({
    notCheckedIn: [],
    checkedIn: [],
    checkedOut: []
  })
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyBooking[]>([])
  const [scheduledAssessments, setScheduledAssessments] = useState<Dog[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<Dog[]>([])
  const [feedingSchedule, setFeedingSchedule] = useState<{
    breakfast: FeedingDog[]
    lunch: FeedingDog[]
    dinner: FeedingDog[]
  }>({
    breakfast: [],
    lunch: [],
    dinner: []
  })

  // Roll call states
  const [rollCalls, setRollCalls] = useState<RollCall[]>([])
  const [currentRollCall, setCurrentRollCall] = useState<RollCall | null>(null)
  const [showRollCallModal, setShowRollCallModal] = useState(false)
  const [rollCallTimeSlot, setRollCallTimeSlot] = useState<'11am' | '5pm'>('11am')
  const [rollCallSection, setRollCallSection] = useState('')
  const [rollCallDogCount, setRollCallDogCount] = useState('')
  const [rollCallActualTime, setRollCallActualTime] = useState('')
  const [sections, setSections] = useState<any[]>([])
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([])
  const [myTasks, setMyTasks] = useState<StaffTask[]>([])
  const [rollCallDogPresence, setRollCallDogPresence] = useState<Record<string, boolean>>({})
  const [rollCallNotes, setRollCallNotes] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Modal states
  const [showDogModal, setShowDogModal] = useState(false)
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  const [showMedicationsModal, setShowMedicationsModal] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [selectedBookingDog, setSelectedBookingDog] = useState<DogWithBooking | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [declineNotes, setDeclineNotes] = useState('')
  const [assessmentVideoFile, setAssessmentVideoFile] = useState<File | null>(null)

  // Incident modal states
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [incidentFormData, setIncidentFormData] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    incident_time: new Date().toTimeString().slice(0, 5),
    incident_type: '',
    severity: '',
    title: '',
    description: '',
    dog_id: '',
    location: '',
    action_taken: '',
    vet_notified: false,
    owner_notified: false,
    notification_time: '',
    notification_method: '',
    requires_follow_up: false,
    follow_up_notes: ''
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assessmentDropdownRef.current && !assessmentDropdownRef.current.contains(event.target as Node)) {
        setShowAssessmentDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchStaffProfile()
  }, [])

  useEffect(() => {
    if (staffId) {
      fetchTodayData()
    }
  }, [currentDate, staffId])

  useEffect(() => {
    if (activeTab === 'schedule' && staffId) {
      fetchWeeklySchedule()
    } else if (activeTab === 'assessments' && staffId) {
      if (assessmentView === 'calendar') {
        fetchScheduledAssessments()
      } else {
        fetchPendingApprovals()
      }
    } else if (activeTab === 'feeding' && staffId) {
      fetchFeedingSchedule()
    } else if (activeTab === 'incidents' && staffId) {
      fetchIncidents()
    } else if (activeTab === 'rollcall' && staffId) {
      fetchRollCalls()
      fetchSections()
      fetchMyAssignments()
      fetchMyTasks()
    }
  }, [activeTab, assessmentView, currentDate, staffId])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  const fetchStaffProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setStaffId(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        setStaffName(`${profile.first_name} ${profile.last_name}`)
      }
    }
  }

  const fetchTodayData = async () => {
    setLoading(true)
    try {
      // Get today's bookings from both tables (OLD SCHEMA: bookings has dog_id singular, not dog_ids array)
      const [{ data: bookingsData }, { data: individualDayBookingsData }] = await Promise.all([
        supabase
          .from('bookings')
          .select('dog_id')
          .eq('booking_date', currentDate)
          .eq('status', 'confirmed'),
        supabase
          .from('individual_day_bookings')
          .select('dog_id')
          .eq('booking_date', currentDate)
          .eq('status', 'confirmed')
      ])

      const subscriptionDogIds = bookingsData?.map(b => b.dog_id) || []
      const individualDayDogIds = individualDayBookingsData?.map(b => b.dog_id) || []
      const todayDogIds = Array.from(new Set([...subscriptionDogIds, ...individualDayDogIds])) // Remove duplicates

      setTotalDogsToday(todayDogIds.length)

      if (todayDogIds.length === 0) {
        setPlayGroups([])
        setUnassignedDogs([])
        setMedicationsToday([])
        setTodayDogs({ notCheckedIn: [], checkedIn: [], checkedOut: [] })
        setLoading(false)
        return
      }

      // Get all dogs attending today with full details
      const { data: dogsData } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name, phone, email)
        `)
        .in('id', todayDogIds)

      // Get bookings with check-in/out times from both tables
      const [{ data: bookingsWithTimes }, { data: individualBookingsWithTimes }] = await Promise.all([
        supabase
          .from('bookings')
          .select('*')
          .eq('booking_date', currentDate)
          .eq('status', 'confirmed'),
        supabase
          .from('individual_day_bookings')
          .select('*')
          .eq('booking_date', currentDate)
          .eq('status', 'confirmed')
      ])

      // Organize dogs by check-in/out status
      const notCheckedIn: DogWithBooking[] = []
      const checkedIn: DogWithBooking[] = []
      const checkedOut: DogWithBooking[] = []

      // Process subscription bookings (OLD SCHEMA: one booking per dog, not dog_ids array)
      bookingsWithTimes?.forEach(booking => {
        const dog = dogsData?.find(d => d.id === booking.dog_id)
        if (dog) {
          const dogWithBooking: DogWithBooking = {
            ...dog,
            booking_id: booking.id,
            check_in_time: booking.check_in_time,
            check_out_time: booking.check_out_time,
            special_instructions: booking.special_instructions
          }

          if (booking.check_out_time) {
            checkedOut.push(dogWithBooking)
          } else if (booking.check_in_time) {
            checkedIn.push(dogWithBooking)
          } else {
            notCheckedIn.push(dogWithBooking)
          }
        }
      })

      // Process individual day bookings
      individualBookingsWithTimes?.forEach(booking => {
        const dog = dogsData?.find(d => d.id === booking.dog_id)
        if (dog) {
          const dogWithBooking: DogWithBooking = {
            ...dog,
            booking_id: booking.id,
            check_in_time: booking.check_in_time,
            check_out_time: booking.check_out_time,
            special_instructions: booking.special_instructions || booking.notes
          }

          if (booking.check_out_time) {
            checkedOut.push(dogWithBooking)
          } else if (booking.check_in_time) {
            checkedIn.push(dogWithBooking)
          } else {
            notCheckedIn.push(dogWithBooking)
          }
        }
      })

      setTodayDogs({ notCheckedIn, checkedIn, checkedOut })

      // Get play groups with their assigned dogs
      const { data: playGroupsData } = await supabase
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
        .order('name', { ascending: true })

      // Organize dogs into their groups (only if they're attending today)
      const groupsWithDogs: PlayGroup[] = (playGroupsData || []).map(group => {
        const groupDogIds = group.dog_play_groups?.map((dpg: any) => dpg.dog_id) || []
        const dogsInGroup = (dogsData || []).filter(dog =>
          groupDogIds.includes(dog.id)
        )
        return {
          ...group,
          dogs: dogsInGroup
        }
      }).filter(group => group.dogs.length > 0)

      setPlayGroups(groupsWithDogs)

      // Find dogs not assigned to any group
      const assignedDogIds = groupsWithDogs.flatMap(g => g.dogs.map(d => d.id))
      const unassigned = (dogsData || []).filter(dog => !assignedDogIds.includes(dog.id))
      setUnassignedDogs(unassigned)

      // Get medications for today's dogs
      const { data: medsData } = await supabase
        .from('dog_medications')
        .select(`
          *,
          dogs:dog_id (
            id, name, photo_url,
            owner:profiles!dogs_owner_id_fkey (first_name, last_name, phone)
          )
        `)
        .in('dog_id', todayDogIds)
        .or(`end_date.is.null,end_date.gte.${currentDate}`)
        .order('time_of_day', { ascending: true })

      setMedicationsToday(medsData || [])

    } catch (error) {
      console.error('Error fetching today data:', error)
      toast.error('Failed to load today\'s data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWeeklySchedule = async () => {
    try {
      const startDate = new Date(currentDate)
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + 6)

      // Query both subscription bookings and individual day bookings (OLD SCHEMA: dog_id not dog_ids)
      const [{ data: bookingsData }, { data: individualDayBookingsData }] = await Promise.all([
        supabase
          .from('bookings')
          .select(`
            booking_date,
            dog_id,
            status
          `)
          .gte('booking_date', currentDate)
          .lte('booking_date', endDate.toISOString().split('T')[0])
          .eq('status', 'confirmed')
          .order('booking_date', { ascending: true }),
        supabase
          .from('individual_day_bookings')
          .select(`
            booking_date,
            dog_id,
            status
          `)
          .gte('booking_date', currentDate)
          .lte('booking_date', endDate.toISOString().split('T')[0])
          .eq('status', 'confirmed')
          .order('booking_date', { ascending: true })
      ])

      if (!bookingsData && !individualDayBookingsData) {
        setWeeklySchedule([])
        return
      }

      // Get all unique dog IDs from the week (from both sources)
      const subscriptionDogIds = bookingsData?.map(b => b.dog_id) || []
      const individualDayDogIds = individualDayBookingsData?.map(b => b.dog_id) || []
      const allDogIds = Array.from(new Set([...subscriptionDogIds, ...individualDayDogIds]))

      // Fetch dog details
      const { data: dogsData } = await supabase
        .from('dogs')
        .select(`
          id,
          name,
          breed,
          photo_url,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name)
        `)
        .in('id', allDogIds)

      // Group bookings by date
      const scheduleMap = new Map<string, WeeklyBooking>()

      // Process subscription bookings (OLD SCHEMA: one booking per dog)
      bookingsData?.forEach(booking => {
        const existing: WeeklyBooking = scheduleMap.get(booking.booking_date) || {
          date: booking.booking_date,
          dog_count: 0,
          dogs: []
        }

        const dog = dogsData?.find(d => d.id === booking.dog_id)
        if (dog && !existing.dogs.some(d => d.name === dog.name)) {
          const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
          existing.dogs.push({
            name: dog.name,
            breed: dog.breed,
            owner_name: `${owner?.first_name || ''} ${owner?.last_name || ''}`.trim(),
            photo_url: dog.photo_url
          })
        }

        existing.dog_count = existing.dogs.length
        scheduleMap.set(booking.booking_date, existing)
      })

      // Process individual day bookings
      individualDayBookingsData?.forEach(booking => {
        const existing: WeeklyBooking = scheduleMap.get(booking.booking_date) || {
          date: booking.booking_date,
          dog_count: 0,
          dogs: []
        }

        const dog = dogsData?.find(d => d.id === booking.dog_id)
        if (dog && !existing.dogs.some(d => d.name === dog.name)) {
          const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
          existing.dogs.push({
            name: dog.name,
            breed: dog.breed,
            owner_name: `${owner?.first_name || ''} ${owner?.last_name || ''}`.trim(),
            photo_url: dog.photo_url
          })
        }

        existing.dog_count = existing.dogs.length
        scheduleMap.set(booking.booking_date, existing)
      })

      // Create array for 7 days
      const schedule: WeeklyBooking[] = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]

        schedule.push(scheduleMap.get(dateStr) || {
          date: dateStr,
          dog_count: 0,
          dogs: []
        })
      }

      setWeeklySchedule(schedule)
    } catch (error) {
      console.error('Error fetching weekly schedule:', error)
      toast.error('Failed to load weekly schedule')
    }
  }

  const fetchScheduledAssessments = async () => {
    try {
      console.log('🔍 Fetching assessments for date:', currentDate)

      // Query assessment_bookings with joins to get all needed data
      const { data: bookingsData, error } = await supabase
        .from('assessment_bookings')
        .select(`
          id,
          booking_status,
          booked_at,
          slot_id,
          dog_id,
          user_id
        `)
        .eq('booking_status', 'confirmed')

      console.log('📊 Total bookings found:', bookingsData?.length || 0, bookingsData)

      if (error) {
        console.error('❌ Error fetching bookings:', error)
        throw error
      }

      // Fetch related data for each booking
      const enrichedData = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const [slotRes, dogRes] = await Promise.all([
            supabase.from('assessment_slots').select('*').eq('id', booking.slot_id).single(),
            supabase.from('dogs').select(`
              *,
              owner:profiles!dogs_owner_id_fkey (first_name, last_name, phone, email)
            `).eq('id', booking.dog_id).single()
          ])

          console.log('📅 Slot data:', slotRes.data)
          console.log('🐕 Dog data:', dogRes.data)

          return {
            ...dogRes.data,
            assessment_date: slotRes.data?.assessment_date,
            assessment_time: slotRes.data?.start_time,
            assessment_end_time: slotRes.data?.end_time,
            booking_id: booking.id,
            booking_status: booking.booking_status
          }
        })
      )

      console.log('📋 Enriched assessments:', enrichedData)

      // Filter for future dates and sort
      const futureAssessments = enrichedData
        .filter(a => {
          const passes = a.assessment_date && a.assessment_date >= currentDate
          console.log(`✓ ${a.name}: ${a.assessment_date} >= ${currentDate} = ${passes}`)
          return passes
        })
        .sort((a, b) => (a.assessment_date || '').localeCompare(b.assessment_date || ''))

      console.log('✅ Final future assessments:', futureAssessments.length, futureAssessments)
      setScheduledAssessments(futureAssessments)
    } catch (error) {
      console.error('❌ Error in fetchScheduledAssessments:', error)
      toast.error('Failed to load scheduled assessments')
    }
  }

  const fetchPendingApprovals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data: dogsData } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name, phone, email)
        `)
        .not('assessment_date', 'is', null)
        .lte('assessment_date', today)
        .eq('assessment_completed', false)
        .order('assessment_date', { ascending: true })

      setPendingApprovals(dogsData || [])
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
      toast.error('Failed to load pending approvals')
    }
  }

  const fetchFeedingSchedule = async () => {
    try {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id,
          dog_ids,
          needs_breakfast,
          needs_lunch,
          needs_dinner,
          breakfast_completed,
          breakfast_completed_at,
          lunch_completed,
          lunch_completed_at,
          dinner_completed,
          dinner_completed_at
        `)
        .eq('booking_date', currentDate)
        .eq('status', 'confirmed')
        .or('needs_breakfast.eq.true,needs_lunch.eq.true,needs_dinner.eq.true')

      if (!bookingsData || bookingsData.length === 0) {
        setFeedingSchedule({ breakfast: [], lunch: [], dinner: [] })
        return
      }

      // Get all dog IDs that need feeding
      const allDogIds = Array.from(new Set(bookingsData.flatMap(b => b.dog_ids)))

      const { data: dogsData } = await supabase
        .from('dogs')
        .select(`
          id,
          name,
          photo_url,
          feeding_schedule,
          dietary_requirements,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name)
        `)
        .in('id', allDogIds)

      const breakfast: FeedingDog[] = []
      const lunch: FeedingDog[] = []
      const dinner: FeedingDog[] = []

      bookingsData.forEach(booking => {
        booking.dog_ids.forEach((dogId: string) => {
          const dog = dogsData?.find(d => d.id === dogId)
          if (!dog) return

          const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
          const feedingDog: FeedingDog = {
            dog_id: dog.id,
            dog_name: dog.name,
            dog_photo_url: dog.photo_url,
            owner_name: `${owner?.first_name} ${owner?.last_name}`,
            booking_id: booking.id,
            feeding_schedule: dog.feeding_schedule,
            dietary_requirements: dog.dietary_requirements,
            breakfast_completed: booking.breakfast_completed,
            breakfast_completed_at: booking.breakfast_completed_at,
            lunch_completed: booking.lunch_completed,
            lunch_completed_at: booking.lunch_completed_at,
            dinner_completed: booking.dinner_completed,
            dinner_completed_at: booking.dinner_completed_at
          }

          if (booking.needs_breakfast) breakfast.push(feedingDog)
          if (booking.needs_lunch) lunch.push(feedingDog)
          if (booking.needs_dinner) dinner.push(feedingDog)
        })
      })

      setFeedingSchedule({ breakfast, lunch, dinner })
    } catch (error) {
      console.error('Error fetching feeding schedule:', error)
      toast.error('Failed to load feeding schedule')
    }
  }

  const fetchIncidents = async () => {
    try {
      const { data: incidentsData, error } = await supabase
        .from('incidents')
        .select(`
          *,
          dogs:dog_id (
            id,
            name,
            breed,
            photo_url,
            owner:profiles!dogs_owner_id_fkey (first_name, last_name)
          ),
          reported_by_staff:profiles!incidents_reported_by_staff_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('occurred_at', { ascending: false })

      if (error) throw error

      setIncidents(incidentsData || [])

      // Also fetch all dogs for the dropdown
      const { data: dogsData } = await supabase
        .from('dogs')
        .select('id, name, breed')
        .eq('is_approved', true)
        .order('name', { ascending: true })

      setAllDogs((dogsData as any) || [])
    } catch (error) {
      console.error('Error fetching incidents:', error)
      toast.error('Failed to load incidents')
    }
  }

  const fetchRollCalls = async () => {
    try {
      const { data: rollCallsData, error } = await supabase
        .from('roll_calls')
        .select(`
          *,
          conducted_by_staff:profiles!roll_calls_conducted_by_staff_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('date', currentDate)
        .order('time', { ascending: true })

      if (error) throw error

      const formattedRollCalls = (rollCallsData || []).map(rc => ({
        ...rc,
        conducted_by_staff_name: rc.conducted_by_staff
          ? `${rc.conducted_by_staff.first_name} ${rc.conducted_by_staff.last_name}`
          : undefined
      }))

      setRollCalls(formattedRollCalls)
    } catch (error) {
      console.error('Error fetching roll calls:', error)
      toast.error('Failed to load roll calls')
    }
  }

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
      // Silently fail - not critical
    }
  }

  const fetchMyAssignments = async () => {
    if (!staffId) return

    try {
      const { data: assignmentsData, error } = await supabase
        .from('staff_assignments')
        .select('*')
        .eq('staff_id', staffId)
        .eq('date', currentDate)
        .order('shift_start', { ascending: true })

      if (error) throw error

      setStaffAssignments(assignmentsData || [])
    } catch (error) {
      console.error('Error fetching staff assignments:', error)
      // Silently fail - not critical
    }
  }

  const fetchMyTasks = async () => {
    if (!staffId) return

    try {
      const { data: tasksData, error } = await supabase
        .from('staff_tasks')
        .select('*')
        .eq('staff_id', staffId)
        .eq('due_date', currentDate)
        .order('priority', { ascending: false })
        .order('due_time', { ascending: true })

      if (error) throw error

      setMyTasks(tasksData || [])
    } catch (error) {
      console.error('Error fetching your tasks:', error)
      // Silently fail - not critical
    }
  }

  const handleCheckIn = async () => {
    if (!selectedBookingDog || !staffId) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          check_in_time: new Date().toISOString()
        })
        .eq('id', selectedBookingDog.booking_id)

      if (error) throw error

      toast.success(`${selectedBookingDog.name} checked in successfully!`)
      setShowCheckInModal(false)
      setSelectedBookingDog(null)
      fetchTodayData()
    } catch (error) {
      console.error('Error checking in:', error)
      toast.error('Failed to check in')
    }
  }

  const handleCheckOut = async () => {
    if (!selectedBookingDog || !staffId) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          check_out_time: new Date().toISOString()
        })
        .eq('id', selectedBookingDog.booking_id)

      if (error) throw error

      toast.success(`${selectedBookingDog.name} checked out successfully!`)
      setShowCheckOutModal(false)
      setSelectedBookingDog(null)
      fetchTodayData()
    } catch (error) {
      console.error('Error checking out:', error)
      toast.error('Failed to check out')
    }
  }

  const handleApproveDog = async () => {
    if (!selectedDog || !staffId) return

    try {
      // Upload video if provided
      let videoUrl = selectedDog.assessment_video_url

      if (assessmentVideoFile) {
        const fileExt = assessmentVideoFile.name.split('.').pop()
        const fileName = `${selectedDog.id}-${Date.now()}.${fileExt}`
        const filePath = `${selectedDog.owner_id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('assessment-videos')
          .upload(filePath, assessmentVideoFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('assessment-videos')
          .getPublicUrl(filePath)

        videoUrl = urlData.publicUrl
      }

      const { error } = await supabase
        .from('dogs')
        .update({
          is_approved: true,
          assessment_completed: true,
          approved_by: staffId,
          approved_at: new Date().toISOString(),
          assessment_notes: approvalNotes,
          assessment_video_url: videoUrl
        })
        .eq('id', selectedDog.id)

      if (error) {
        console.error('Supabase error details:', error)
        console.error('Error message:', error.message)
        console.error('Error code:', error.code)
        console.error('Error details:', error.details)
        throw error
      }

      // Update user's profile approval status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', selectedDog.owner_id)

      if (profileError) {
        console.error('Failed to update profile approval status:', profileError)
        // Don't fail the approval if profile update fails
      }

      // Send approval email to owner
      try {
        await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedDog.owner_id,
            dogName: selectedDog.name,
            assessmentNotes: approvalNotes
          })
        })
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
        // Don't fail the approval if email fails
      }

      toast.success(`${selectedDog.name} has been approved!`)
      setShowApprovalModal(false)
      setSelectedDog(null)
      setApprovalNotes('')
      setAssessmentVideoFile(null)
      fetchPendingApprovals()
    } catch (error) {
      console.error('Error approving dog:', error)
      toast.error('Failed to approve dog')
    }
  }

  const handleDeclineDog = async () => {
    if (!selectedDog || !staffId || !declineNotes.trim()) {
      toast.error('Please provide notes for declining')
      return
    }

    try {
      const { error } = await supabase
        .from('dogs')
        .update({
          is_approved: false,
          assessment_completed: true,
          assessment_notes: declineNotes
        })
        .eq('id', selectedDog.id)

      if (error) throw error

      toast.success(`Assessment declined for ${selectedDog.name}`)
      setShowDeclineModal(false)
      setSelectedDog(null)
      setDeclineNotes('')
      fetchPendingApprovals()
    } catch (error) {
      console.error('Error declining dog:', error)
      toast.error('Failed to decline dog')
    }
  }

  const handleMarkMealComplete = async (mealType: 'breakfast' | 'lunch' | 'dinner', bookingId: string) => {
    if (!staffId) return

    try {
      const updateData: any = {}
      updateData[`${mealType}_completed`] = true
      updateData[`${mealType}_completed_at`] = new Date().toISOString()
      updateData[`${mealType}_completed_by_staff_id`] = staffId

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)

      if (error) throw error

      toast.success(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} marked as complete!`)
      fetchFeedingSchedule()
    } catch (error) {
      console.error('Error marking meal complete:', error)
      toast.error('Failed to mark meal as complete')
    }
  }

  const handleCreateIncident = async () => {
    if (!staffId) {
      toast.error('Staff ID not found')
      return
    }

    // Validation
    if (!incidentFormData.incident_type || !incidentFormData.severity || !incidentFormData.title || !incidentFormData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Combine date and time
      const occurredAt = new Date(`${incidentFormData.incident_date}T${incidentFormData.incident_time}:00`)

      const incidentData: any = {
        incident_type: incidentFormData.incident_type,
        severity: incidentFormData.severity,
        title: incidentFormData.title,
        description: incidentFormData.description,
        location: incidentFormData.location || null,
        occurred_at: occurredAt.toISOString(),
        action_taken: incidentFormData.action_taken || null,
        vet_notified: incidentFormData.vet_notified,
        owner_notified: incidentFormData.owner_notified,
        requires_follow_up: incidentFormData.requires_follow_up,
        follow_up_notes: incidentFormData.follow_up_notes || null,
        reported_by_staff_id: staffId,
        resolved: false
      }

      // Add dog_id if selected
      if (incidentFormData.dog_id) {
        incidentData.dog_id = incidentFormData.dog_id
      }

      // Add owner notification time if owner was notified
      if (incidentFormData.owner_notified && incidentFormData.notification_time) {
        const notificationDateTime = new Date(`${incidentFormData.incident_date}T${incidentFormData.notification_time}:00`)
        incidentData.owner_notified_at = notificationDateTime.toISOString()
      }

      const { error } = await supabase
        .from('incidents')
        .insert([incidentData])

      if (error) throw error

      toast.success('Incident report created successfully')
      setShowIncidentModal(false)

      // Reset form
      setIncidentFormData({
        incident_date: new Date().toISOString().split('T')[0],
        incident_time: new Date().toTimeString().slice(0, 5),
        incident_type: '',
        severity: '',
        title: '',
        description: '',
        dog_id: '',
        location: '',
        action_taken: '',
        vet_notified: false,
        owner_notified: false,
        notification_time: '',
        notification_method: '',
        requires_follow_up: false,
        follow_up_notes: ''
      })

      // Refresh incidents list
      fetchIncidents()
    } catch (error) {
      console.error('Error creating incident:', error)
      toast.error('Failed to create incident report')
    }
  }

  const handleDogClick = async (dog: Dog) => {
    try {
      const { data: fullDogData } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleAssessmentTabClick = () => {
    setActiveTab('assessments')
    setShowAssessmentDropdown(!showAssessmentDropdown)
  }

  // Roll call handlers - MODAL VERSION
  const handleStartRollCall = (timeSlot: '11am' | '5pm') => {
    if (!staffId) return

    // Set current time automatically
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    setRollCallActualTime(`${hours}:${minutes}`)

    setRollCallTimeSlot(timeSlot)
    setShowRollCallModal(true)
  }

  const handleSubmitRollCall = async () => {
    if (!staffId) return

    // Validate inputs
    if (!rollCallSection.trim()) {
      toast.error('Please select a section')
      return
    }

    const dogCount = parseInt(rollCallDogCount)
    if (isNaN(dogCount) || dogCount < 0) {
      toast.error('Please enter a valid dog count')
      return
    }

    if (!rollCallActualTime.trim()) {
      toast.error('Please enter the time')
      return
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(rollCallActualTime)) {
      toast.error('Invalid time format. Please use HH:MM (e.g., 11:05)')
      return
    }

    try {
      const { error } = await supabase
        .from('roll_calls')
        .insert({
          date: currentDate,
          time: rollCallTimeSlot,
          actual_time: rollCallActualTime,
          section: rollCallSection,
          dog_count: dogCount,
          status: 'completed',
          conducted_by_staff_id: staffId,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          notes: `Section: ${rollCallSection}, Count: ${dogCount} dogs at ${rollCallActualTime}`
        })

      if (error) throw error

      toast.success(`Roll call recorded: ${dogCount} dogs in ${rollCallSection} at ${rollCallActualTime}`)

      // Reset form
      setRollCallSection('')
      setRollCallDogCount('')
      setRollCallActualTime('')
      setShowRollCallModal(false)

      fetchRollCalls()
    } catch (error) {
      console.error('Error recording roll call:', error)
      toast.error('Failed to record roll call')
    }
  }

  const handleCompleteRollCall = async () => {
    // Not needed with simplified version
    setShowRollCallModal(false)
  }

  const handleCheckInAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('staff_assignments')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString()
        })
        .eq('id', assignmentId)

      if (error) throw error

      toast.success('Checked in to assignment!')
      fetchMyAssignments()
    } catch (error) {
      console.error('Error checking in:', error)
      toast.error('Failed to check in')
    }
  }

  const handleCheckOutAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('staff_assignments')
        .update({
          checked_out: true,
          checked_out_at: new Date().toISOString()
        })
        .eq('id', assignmentId)

      if (error) throw error

      toast.success('Checked out of assignment!')
      fetchMyAssignments()
    } catch (error) {
      console.error('Error checking out:', error)
      toast.error('Failed to check out')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('staff_tasks')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error

      toast.success('Task completed!')
      fetchMyTasks()
    } catch (error) {
      console.error('Error completing task:', error)
      toast.error('Failed to complete task')
    }
  }

  // Helper function to check if roll call is due or available
  const getRollCallStatus = (time: '11am' | '5pm') => {
    const now = currentTime
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentMinutes = hours * 60 + minutes

    const rollCall = rollCalls.find(rc => rc.time === time)

    if (rollCall) {
      return {
        status: rollCall.status,
        rollCall,
        canStart: false,
        message: rollCall.status === 'completed'
          ? `Completed by ${rollCall.conducted_by_staff_name}`
          : 'In progress'
      }
    }

    // Roll call is ALWAYS AVAILABLE unless already completed
    // No time restrictions - staff can do roll call anytime
    return {
      status: 'not_started',
      rollCall: null,
      canStart: true,
      message: 'Ready to start'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canine-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-canine-navy mx-auto mb-4"></div>
          <p className="text-canine-navy font-display text-xl">Loading today's schedule...</p>
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
        className="bg-gradient-to-r from-canine-navy via-canine-navy to-[#2a5a7a] text-white shadow-xl sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Title and Logout */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold mb-1">Staff Dashboard</h1>
              <p className="text-canine-sky">Welcome, {staffName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>

          {/* Stats Grid - 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Date Picker Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
              <label className="block text-sm text-canine-sky mb-2 font-medium">Date</label>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-white/10 text-white font-semibold outline-none focus:border-canine-gold transition-all"
              />
            </div>

            {/* Dogs Today Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20 hover:border-canine-gold/50 transition-all">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-canine-sky font-medium">Dogs Today</p>
                <Squares2X2Icon className="h-5 w-5 text-canine-gold" />
              </div>
              <p className="text-4xl font-bold">{totalDogsToday}</p>
            </div>

            {/* Play Groups Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20 hover:border-canine-gold/50 transition-all">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-canine-sky font-medium">Play Groups</p>
                <UserGroupIcon className="h-5 w-5 text-canine-gold" />
              </div>
              <p className="text-4xl font-bold">{playGroups.length}</p>
            </div>

            {/* Medications Card */}
            <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 transition-all ${
              medicationsToday.length > 0 ? 'border-red-400 bg-red-500/20' : 'border-white/20'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-canine-sky font-medium">Medications</p>
                <BeakerIcon className={`h-5 w-5 ${medicationsToday.length > 0 ? 'text-red-400' : 'text-canine-gold'}`} />
              </div>
              <p className="text-4xl font-bold">{medicationsToday.length}</p>
            </div>
          </div>

          {/* Tab Navigation Bar */}
          <div className="border-b-2 border-white/20">
            <div className="flex items-end space-x-1">
              {/* Today */}
              <button
                onClick={() => setActiveTab('today')}
                className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all relative ${
                  activeTab === 'today'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
                <span>Today</span>
                {activeTab === 'today' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-canine-gold rounded-t-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Roll Call */}
              <button
                onClick={() => setActiveTab('rollcall')}
                className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all relative ${
                  activeTab === 'rollcall'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                <ClipboardDocumentCheckIcon className="h-5 w-5" />
                <span>Roll Call</span>
                {(() => {
                  const morningStatus = getRollCallStatus('11am')
                  const eveningStatus = getRollCallStatus('5pm')
                  const isOverdue = (morningStatus.status === 'overdue' && morningStatus.canStart === false) ||
                                   (eveningStatus.status === 'overdue' && eveningStatus.canStart === false)
                  const canStart = morningStatus.canStart || eveningStatus.canStart
                  const allCompleted = morningStatus.status === 'completed' && eveningStatus.status === 'completed'

                  return (
                    <>
                      {isOverdue && !allCompleted && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                      {canStart && !allCompleted && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                      )}
                      {allCompleted && (
                        <CheckCircleIcon className="h-4 w-4 text-green-400 absolute -top-1 -right-1" />
                      )}
                    </>
                  )
                })()}
                {activeTab === 'rollcall' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-canine-gold rounded-t-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Schedule */}
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all relative ${
                  activeTab === 'schedule'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                <CalendarDaysIcon className="h-5 w-5" />
                <span>Schedule</span>
                {activeTab === 'schedule' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-canine-gold rounded-t-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Assessments with Dropdown */}
              <div className="relative" ref={assessmentDropdownRef}>
                <button
                  onClick={handleAssessmentTabClick}
                  className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all relative ${
                    activeTab === 'assessments'
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                >
                  <ClipboardDocumentCheckIcon className="h-5 w-5" />
                  <span>Assessments</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAssessmentDropdown ? 'rotate-180' : ''}`} />
                  {activeTab === 'assessments' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-canine-gold rounded-t-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showAssessmentDropdown && activeTab === 'assessments' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl overflow-hidden min-w-[200px] z-50"
                    >
                      <button
                        onClick={() => {
                          setAssessmentView('calendar')
                          setShowAssessmentDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center space-x-2 transition-all ${
                          assessmentView === 'calendar'
                            ? 'bg-canine-navy text-white'
                            : 'text-canine-navy hover:bg-canine-sky'
                        }`}
                      >
                        <CalendarIcon className="h-5 w-5" />
                        <span className="font-semibold">Calendar View</span>
                      </button>
                      <button
                        onClick={() => {
                          setAssessmentView('approvals')
                          setShowAssessmentDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center space-x-2 transition-all ${
                          assessmentView === 'approvals'
                            ? 'bg-canine-navy text-white'
                            : 'text-canine-navy hover:bg-canine-sky'
                        }`}
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        <span className="font-semibold">Pending Approvals</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Feeding */}
              <button
                onClick={() => setActiveTab('feeding')}
                className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all relative ${
                  activeTab === 'feeding'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                <CakeIcon className="h-5 w-5" />
                <span>Feeding</span>
                {activeTab === 'feeding' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-canine-gold rounded-t-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Medications */}
              <button
                onClick={() => setActiveTab('medications')}
                className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all relative ${
                  activeTab === 'medications'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                <BeakerIcon className="h-5 w-5" />
                <span>Medications</span>
                {medicationsToday.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-1">
                    {medicationsToday.length}
                  </span>
                )}
                {activeTab === 'medications' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-canine-gold rounded-t-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Incidents */}
              <button
                onClick={() => setActiveTab('incidents')}
                className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all relative ${
                  activeTab === 'incidents'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Incidents</span>
                {incidents.filter(i => !i.resolved).length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-1 animate-pulse">
                    {incidents.filter(i => !i.resolved).length}
                  </span>
                )}
                {activeTab === 'incidents' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-canine-gold rounded-t-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Play Groups */}
              <button
                onClick={() => setActiveTab('playgroups')}
                className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all relative ${
                  activeTab === 'playgroups'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                <UserGroupIcon className="h-5 w-5" />
                <span>Play Groups</span>
                {activeTab === 'playgroups' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-canine-gold rounded-t-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Today's Dogs Tab */}
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {totalDogsToday === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
                  <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-canine-navy mb-2">No Dogs Scheduled</h2>
                  <p className="text-gray-600">No dogs are booked for {new Date(currentDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-display font-bold text-canine-navy mb-2">
                      Today's Dogs - {new Date(currentDate).toLocaleDateString()}
                    </h2>
                    <p className="text-gray-600">
                      Total: {totalDogsToday} | Not Checked In: {todayDogs.notCheckedIn.length} | Checked In: {todayDogs.checkedIn.length} | Checked Out: {todayDogs.checkedOut.length}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Not Checked In */}
                    <div className="bg-yellow-50 rounded-2xl p-6 border-4 border-yellow-400">
                      <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
                        <ClockIcon className="h-6 w-6 mr-2" />
                        Not Checked In ({todayDogs.notCheckedIn.length})
                      </h3>
                      <div className="space-y-3">
                        {todayDogs.notCheckedIn.map(dog => {
                          const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
                          return (
                          <motion.div
                            key={dog.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-xl p-4 shadow-sm border-2 border-yellow-200 cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3" onClick={() => handleDogClick(dog)}>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 overflow-hidden flex-shrink-0">
                                  {dog.photo_url ? (
                                    <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-xl">🐕</div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-canine-navy">{dog.name}</h4>
                                  <p className="text-sm text-gray-600">{dog.breed}</p>
                                  <p className="text-xs text-gray-500">{owner?.first_name} {owner?.last_name}</p>
                                  <p className="text-xs text-gray-500">📞 {owner?.phone}</p>
                                </div>
                              </div>
                            </div>
                            {dog.special_instructions && (
                              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs font-semibold text-blue-900 mb-1">Special Instructions:</p>
                                <p className="text-sm text-blue-800 whitespace-pre-wrap">{dog.special_instructions}</p>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setSelectedBookingDog(dog)
                                setShowCheckInModal(true)
                              }}
                              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                            >
                              <ArrowRightIcon className="h-4 w-4" />
                              <span>Check In</span>
                            </button>
                          </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Checked In */}
                    <div className="bg-green-50 rounded-2xl p-6 border-4 border-green-400">
                      <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                        <CheckCircleIcon className="h-6 w-6 mr-2" />
                        Checked In ({todayDogs.checkedIn.length})
                      </h3>
                      <div className="space-y-3">
                        {todayDogs.checkedIn.map(dog => {
                          const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
                          return (
                          <motion.div
                            key={dog.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-xl p-4 shadow-sm border-2 border-green-200 cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3" onClick={() => handleDogClick(dog)}>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-200 to-green-400 overflow-hidden flex-shrink-0">
                                  {dog.photo_url ? (
                                    <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-xl">🐕</div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-canine-navy">{dog.name}</h4>
                                  <p className="text-sm text-gray-600">{dog.breed}</p>
                                  <p className="text-xs text-gray-500">{owner?.first_name} {owner?.last_name}</p>
                                  <p className="text-xs text-gray-500">📞 {owner?.phone}</p>
                                  {dog.check_in_time && (
                                    <p className="text-xs text-green-700 font-semibold">
                                      In: {new Date(dog.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            {dog.special_instructions && (
                              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs font-semibold text-blue-900 mb-1">Special Instructions:</p>
                                <p className="text-sm text-blue-800 whitespace-pre-wrap">{dog.special_instructions}</p>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setSelectedBookingDog(dog)
                                setShowCheckOutModal(true)
                              }}
                              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                            >
                              <ArrowRightIcon className="h-4 w-4" />
                              <span>Check Out</span>
                            </button>
                          </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Checked Out */}
                    <div className="bg-gray-50 rounded-2xl p-6 border-4 border-gray-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <CheckCircleIcon className="h-6 w-6 mr-2" />
                        Checked Out ({todayDogs.checkedOut.length})
                      </h3>
                      <div className="space-y-3">
                        {todayDogs.checkedOut.map(dog => {
                          const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
                          return (
                          <motion.div
                            key={dog.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleDogClick(dog)}
                            className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-200 cursor-pointer"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 overflow-hidden flex-shrink-0">
                                {dog.photo_url ? (
                                  <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-xl">🐕</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-canine-navy">{dog.name}</h4>
                                <p className="text-sm text-gray-600">{dog.breed}</p>
                                <p className="text-xs text-gray-500">{owner?.first_name} {owner?.last_name}</p>
                                <p className="text-xs text-gray-500">📞 {owner?.phone}</p>
                                {dog.check_out_time && (
                                  <p className="text-xs text-gray-700 font-semibold">
                                    Out: {new Date(dog.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                            </div>
                            {dog.special_instructions && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs font-semibold text-blue-900 mb-1">Special Instructions:</p>
                                <p className="text-sm text-blue-800 whitespace-pre-wrap">{dog.special_instructions}</p>
                              </div>
                            )}
                          </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Roll Call Tab */}
          {activeTab === 'rollcall' && (
            <motion.div
              key="rollcall"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                {/* Current Time Display */}
                <div className="bg-white rounded-xl p-4 shadow-md border-2 border-canine-gold/20 text-center">
                  <p className="text-sm text-gray-600 mb-1">Current Time</p>
                  <p className="text-3xl font-bold text-canine-navy">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Roll Call Status Cards */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-canine-gold/20">
                  <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center">
                    <ClipboardDocumentCheckIcon className="h-8 w-8 mr-3 text-canine-gold" />
                    Daily Roll Calls
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 11am Roll Call Card */}
                    {(() => {
                      const status = getRollCallStatus('11am')
                      const bgColor = status.status === 'completed' ? 'bg-green-50 border-green-300' :
                                     status.status === 'in_progress' ? 'bg-yellow-50 border-yellow-300' :
                                     status.canStart ? 'bg-blue-50 border-blue-300' :
                                     status.status === 'overdue' ? 'bg-red-50 border-red-300' :
                                     'bg-gray-50 border-gray-300'

                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`rounded-xl p-6 border-2 ${bgColor}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-canine-navy">11:00 AM Roll Call</h3>
                            {status.status === 'completed' && (
                              <CheckCircleIcon className="h-10 w-10 text-green-500" />
                            )}
                            {status.status === 'in_progress' && (
                              <ClockIcon className="h-10 w-10 text-yellow-500 animate-pulse" />
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                              <span className="text-gray-700 font-medium">Status:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                status.status === 'completed' ? 'bg-green-200 text-green-800' :
                                status.status === 'in_progress' ? 'bg-yellow-200 text-yellow-800' :
                                status.canStart ? 'bg-blue-200 text-blue-800' :
                                status.status === 'overdue' ? 'bg-red-200 text-red-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {status.status === 'completed' ? 'COMPLETED' :
                                 status.status === 'in_progress' ? 'IN PROGRESS' :
                                 status.canStart ? 'READY TO START' :
                                 status.status === 'overdue' ? 'OVERDUE' :
                                 'NOT STARTED'}
                              </span>
                            </div>

                            {status.rollCall && (
                              <>
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-gray-700">Section:</span>
                                  <span className="text-lg font-bold text-canine-navy">
                                    {status.rollCall.section || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-gray-700">Dog Count:</span>
                                  <span className="text-lg font-bold text-canine-navy">
                                    {status.rollCall.dog_count || 0}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-gray-700">Time Counted:</span>
                                  <span className="text-lg font-bold text-canine-navy">
                                    {status.rollCall.actual_time || 'N/A'}
                                  </span>
                                </div>
                                {status.status === 'completed' && (
                                  <div className="py-2">
                                    <p className="text-sm text-gray-600">Conducted by:</p>
                                    <p className="font-semibold text-canine-navy">{status.rollCall.conducted_by_staff_name || 'Staff'}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {status.rollCall.completed_at ? new Date(status.rollCall.completed_at).toLocaleString() : ''}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}

                            {!status.rollCall && (
                              <p className="text-sm text-gray-600 py-2">{status.message}</p>
                            )}

                            {status.canStart && (
                              <button
                                onClick={() => handleStartRollCall('11am')}
                                className="w-full mt-4 bg-canine-navy hover:bg-canine-navy/90 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                              >
                                <ClipboardDocumentCheckIcon className="h-6 w-6 inline mr-2" />
                                Start 11am Roll Call
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )
                    })()}

                    {/* 5pm Roll Call Card */}
                    {(() => {
                      const status = getRollCallStatus('5pm')
                      const bgColor = status.status === 'completed' ? 'bg-green-50 border-green-300' :
                                     status.status === 'in_progress' ? 'bg-yellow-50 border-yellow-300' :
                                     status.canStart ? 'bg-blue-50 border-blue-300' :
                                     status.status === 'overdue' ? 'bg-red-50 border-red-300' :
                                     'bg-gray-50 border-gray-300'

                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className={`rounded-xl p-6 border-2 ${bgColor}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-canine-navy">5:00 PM Roll Call</h3>
                            {status.status === 'completed' && (
                              <CheckCircleIcon className="h-10 w-10 text-green-500" />
                            )}
                            {status.status === 'in_progress' && (
                              <ClockIcon className="h-10 w-10 text-yellow-500 animate-pulse" />
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                              <span className="text-gray-700 font-medium">Status:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                status.status === 'completed' ? 'bg-green-200 text-green-800' :
                                status.status === 'in_progress' ? 'bg-yellow-200 text-yellow-800' :
                                status.canStart ? 'bg-blue-200 text-blue-800' :
                                status.status === 'overdue' ? 'bg-red-200 text-red-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {status.status === 'completed' ? 'COMPLETED' :
                                 status.status === 'in_progress' ? 'IN PROGRESS' :
                                 status.canStart ? 'READY TO START' :
                                 status.status === 'overdue' ? 'OVERDUE' :
                                 'NOT STARTED'}
                              </span>
                            </div>

                            {status.rollCall && (
                              <>
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-gray-700">Section:</span>
                                  <span className="text-lg font-bold text-canine-navy">
                                    {status.rollCall.section || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-gray-700">Dog Count:</span>
                                  <span className="text-lg font-bold text-canine-navy">
                                    {status.rollCall.dog_count || 0}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-gray-700">Time Counted:</span>
                                  <span className="text-lg font-bold text-canine-navy">
                                    {status.rollCall.actual_time || 'N/A'}
                                  </span>
                                </div>
                                {status.status === 'completed' && (
                                  <div className="py-2">
                                    <p className="text-sm text-gray-600">Conducted by:</p>
                                    <p className="font-semibold text-canine-navy">{status.rollCall.conducted_by_staff_name || 'Staff'}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {status.rollCall.completed_at ? new Date(status.rollCall.completed_at).toLocaleString() : ''}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}

                            {!status.rollCall && (
                              <p className="text-sm text-gray-600 py-2">{status.message}</p>
                            )}

                            {status.canStart && (
                              <button
                                onClick={() => handleStartRollCall('5pm')}
                                className="w-full mt-4 bg-canine-navy hover:bg-canine-navy/90 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                              >
                                <ClipboardDocumentCheckIcon className="h-6 w-6 inline mr-2" />
                                Start 5pm Roll Call
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )
                    })()}
                  </div>
                </div>

                {/* My Assignments Today */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-canine-gold/20">
                  <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center">
                    <UserGroupIcon className="h-8 w-8 mr-3 text-canine-gold" />
                    My Assignments Today
                  </h2>

                  {staffAssignments.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No assignments for today</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {staffAssignments.map((assignment, index) => (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-xl p-6 border-2 ${
                            assignment.checked_out ? 'bg-gray-50 border-gray-300' :
                            assignment.checked_in ? 'bg-green-50 border-green-300' :
                            'bg-blue-50 border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-canine-navy">{assignment.area}</h3>
                            {assignment.checked_out && (
                              <CheckCircleIcon className="h-8 w-8 text-gray-500" />
                            )}
                            {assignment.checked_in && !assignment.checked_out && (
                              <CheckCircleIcon className="h-8 w-8 text-green-500" />
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-700">
                              <ClockIcon className="h-5 w-5 mr-2" />
                              <span>{assignment.shift_start} - {assignment.shift_end}</span>
                            </div>
                          </div>

                          {assignment.checked_in && (
                            <div className="mb-4 p-3 bg-white rounded-lg">
                              <p className="text-sm text-gray-600">Checked in at:</p>
                              <p className="font-semibold text-canine-navy">
                                {new Date(assignment.checked_in_at!).toLocaleTimeString()}
                              </p>
                            </div>
                          )}

                          {assignment.checked_out && (
                            <div className="mb-4 p-3 bg-white rounded-lg">
                              <p className="text-sm text-gray-600">Checked out at:</p>
                              <p className="font-semibold text-canine-navy">
                                {new Date(assignment.checked_out_at!).toLocaleTimeString()}
                              </p>
                            </div>
                          )}

                          {!assignment.checked_in && (
                            <button
                              onClick={() => handleCheckInAssignment(assignment.id)}
                              className="w-full bg-canine-navy hover:bg-canine-navy/90 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                            >
                              Check In
                            </button>
                          )}

                          {assignment.checked_in && !assignment.checked_out && (
                            <button
                              onClick={() => handleCheckOutAssignment(assignment.id)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                            >
                              Check Out
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* My Tasks Today */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-canine-gold/20">
                  <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center">
                    <ClipboardDocumentCheckIcon className="h-8 w-8 mr-3 text-canine-gold" />
                    My Tasks Today
                  </h2>

                  {myTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No tasks assigned for today</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-xl p-5 border-2 ${
                            task.completed ? 'bg-gray-50 border-gray-300 opacity-75' : 'bg-white border-canine-gold/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  task.priority === 'urgent' ? 'bg-red-500 text-white animate-pulse' :
                                  task.priority === 'high' ? 'bg-orange-500 text-white' :
                                  task.priority === 'medium' ? 'bg-blue-500 text-white' :
                                  'bg-gray-400 text-white'
                                }`}>
                                  {task.priority.toUpperCase()}
                                </span>
                                {task.due_time && (
                                  <span className="flex items-center text-sm text-gray-600">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {task.due_time}
                                  </span>
                                )}
                                {task.completed && (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                              <h3 className={`text-lg font-bold mb-2 ${task.completed ? 'line-through text-gray-500' : 'text-canine-navy'}`}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                              )}
                              {task.completed && task.completed_at && (
                                <p className="text-xs text-gray-500">
                                  Completed at {new Date(task.completed_at).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                            {!task.completed && (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className="ml-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all whitespace-nowrap"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Weekly Schedule Tab */}
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-canine-gold/20">
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center">
                  <CalendarDaysIcon className="h-8 w-8 mr-3 text-canine-gold" />
                  Weekly Schedule
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  {weeklySchedule.map((day, index) => {
                    const date = new Date(day.date)
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                    const dayNum = date.getDate()
                    const isToday = day.date === currentDate

                    return (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl p-4 border-2 ${
                          isToday
                            ? 'bg-canine-navy text-white border-canine-gold'
                            : 'bg-canine-cream border-canine-gold/20'
                        }`}
                      >
                        <div className="text-center mb-3">
                          <p className={`text-sm font-semibold ${isToday ? 'text-canine-gold' : 'text-gray-600'}`}>{dayName}</p>
                          <p className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-canine-navy'}`}>{dayNum}</p>
                        </div>

                        <div className={`text-center py-3 rounded-lg ${isToday ? 'bg-white/20' : 'bg-white'}`}>
                          <p className={`text-3xl font-bold ${isToday ? 'text-white' : 'text-canine-navy'}`}>
                            {day.dog_count}
                          </p>
                          <p className={`text-xs ${isToday ? 'text-white/80' : 'text-gray-600'}`}>
                            {day.dog_count === 1 ? 'dog' : 'dogs'}
                          </p>
                        </div>

                        {day.dogs.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {day.dogs.slice(0, 3).map((dog, i) => (
                              <div key={i} className={`text-xs p-2 rounded ${isToday ? 'bg-white/10' : 'bg-white'}`}>
                                <p className={`font-semibold truncate ${isToday ? 'text-white' : 'text-canine-navy'}`}>
                                  {dog.name}
                                </p>
                                <p className={`text-xs truncate ${isToday ? 'text-white/70' : 'text-gray-500'}`}>
                                  {dog.owner_name}
                                </p>
                              </div>
                            ))}
                            {day.dogs.length > 3 && (
                              <p className={`text-xs text-center ${isToday ? 'text-white/70' : 'text-gray-500'}`}>
                                +{day.dogs.length - 3} more
                              </p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Assessments Tab */}
          {activeTab === 'assessments' && (
            <motion.div
              key="assessments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-canine-gold/20">
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center">
                  <ClipboardDocumentCheckIcon className="h-8 w-8 mr-3 text-canine-gold" />
                  Assessments - {assessmentView === 'calendar' ? 'Calendar View' : 'Pending Approvals'}
                </h2>

                {assessmentView === 'calendar' ? (
                  <div>
                    {scheduledAssessments.length === 0 ? (
                      <div className="text-center py-12">
                        <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No upcoming assessments scheduled</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {scheduledAssessments.map(dog => {
                          const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
                          return (
                          <motion.div
                            key={dog.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden flex-shrink-0">
                                  {dog.photo_url ? (
                                    <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-2xl">🐕</div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-bold text-2xl text-blue-900">{dog.name}</h3>
                                  <p className="text-gray-600">{dog.breed}</p>
                                  <p className="text-sm text-gray-500">{owner?.first_name} {owner?.last_name}</p>
                                  <p className="text-sm text-gray-500">{owner?.phone}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="bg-blue-500 text-white px-4 py-2 rounded-xl">
                                  <p className="text-sm font-semibold">Assessment Date</p>
                                  <p className="text-lg font-bold">
                                    {dog.assessment_date ? new Date(dog.assessment_date).toLocaleDateString() : 'Not scheduled'}
                                  </p>
                                  {dog.assessment_time && dog.assessment_end_time && (
                                    <p className="text-sm mt-1">
                                      {dog.assessment_time.slice(0, 5)} - {dog.assessment_end_time.slice(0, 5)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {pendingApprovals.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No pending approvals</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingApprovals.map(dog => {
                          const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
                          return (
                          <motion.div
                            key={dog.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-orange-50 rounded-xl p-6 border-2 border-orange-300"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden flex-shrink-0">
                                  {dog.photo_url ? (
                                    <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-2xl">🐕</div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-bold text-2xl text-orange-900">{dog.name}</h3>
                                  <p className="text-gray-600">{dog.breed}</p>
                                  <p className="text-sm text-gray-500">{owner?.first_name} {owner?.last_name}</p>
                                  <p className="text-sm text-gray-500">{owner?.phone}</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedDog(dog)
                                    setShowApprovalModal(true)
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center space-x-2"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDog(dog)
                                    setShowDeclineModal(true)
                                  }}
                                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center space-x-2"
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                  <span>Decline</span>
                                </button>
                              </div>
                            </div>
                            {dog.assessment_notes && (
                              <div className="bg-white rounded-lg p-3">
                                <p className="text-sm font-semibold text-orange-800 mb-1">Assessment Notes</p>
                                <p className="text-gray-700">{dog.assessment_notes}</p>
                              </div>
                            )}
                          </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Feeding Schedule Tab */}
          {activeTab === 'feeding' && (
            <motion.div
              key="feeding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-canine-gold/20">
                  <h2 className="text-2xl font-display font-bold text-canine-navy mb-2 flex items-center">
                    <CakeIcon className="h-8 w-8 mr-3 text-canine-gold" />
                    Feeding Schedule - {new Date(currentDate).toLocaleDateString()}
                  </h2>
                  <p className="text-gray-600">
                    Breakfast: {feedingSchedule.breakfast.length} | Lunch: {feedingSchedule.lunch.length} | Dinner: {feedingSchedule.dinner.length}
                  </p>
                </div>

                {feedingSchedule.breakfast.length === 0 && feedingSchedule.lunch.length === 0 && feedingSchedule.dinner.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
                    <CakeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-canine-navy mb-2">No Feeding Required</h3>
                    <p className="text-gray-600">No dogs need meals for {new Date(currentDate).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <>
                    {/* Breakfast */}
                    {feedingSchedule.breakfast.length > 0 && (
                      <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-400">
                        <h3 className="text-xl font-bold text-yellow-900 mb-4">Breakfast ({feedingSchedule.breakfast.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {feedingSchedule.breakfast.map(dog => (
                            <motion.div
                              key={dog.dog_id}
                              whileHover={{ scale: 1.02 }}
                              className={`rounded-xl p-4 border-2 ${
                                dog.breakfast_completed
                                  ? 'bg-green-100 border-green-400'
                                  : 'bg-white border-yellow-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 overflow-hidden flex-shrink-0">
                                  {dog.dog_photo_url ? (
                                    <img src={dog.dog_photo_url} alt={dog.dog_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-xl">🐕</div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-bold text-canine-navy">{dog.dog_name}</h4>
                                  <p className="text-xs text-gray-600">{dog.owner_name}</p>
                                </div>
                              </div>

                              {dog.feeding_schedule && (
                                <p className="text-sm text-gray-700 mb-2">{dog.feeding_schedule}</p>
                              )}

                              {dog.dietary_requirements && (
                                <div className="bg-blue-100 rounded-lg p-2 mb-2">
                                  <p className="text-xs text-blue-800 font-semibold">Diet: {dog.dietary_requirements}</p>
                                </div>
                              )}

                              {dog.breakfast_completed ? (
                                <div className="bg-green-500 text-white rounded-lg p-2 text-center">
                                  <p className="text-sm font-bold">Completed</p>
                                  {dog.breakfast_completed_at && (
                                    <p className="text-xs">
                                      {new Date(dog.breakfast_completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleMarkMealComplete('breakfast', dog.booking_id)}
                                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                                >
                                  Mark Complete
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lunch */}
                    {feedingSchedule.lunch.length > 0 && (
                      <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-400">
                        <h3 className="text-xl font-bold text-orange-900 mb-4">Lunch ({feedingSchedule.lunch.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {feedingSchedule.lunch.map(dog => (
                            <motion.div
                              key={dog.dog_id}
                              whileHover={{ scale: 1.02 }}
                              className={`rounded-xl p-4 border-2 ${
                                dog.lunch_completed
                                  ? 'bg-green-100 border-green-400'
                                  : 'bg-white border-orange-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 overflow-hidden flex-shrink-0">
                                  {dog.dog_photo_url ? (
                                    <img src={dog.dog_photo_url} alt={dog.dog_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-xl">🐕</div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-bold text-canine-navy">{dog.dog_name}</h4>
                                  <p className="text-xs text-gray-600">{dog.owner_name}</p>
                                </div>
                              </div>

                              {dog.feeding_schedule && (
                                <p className="text-sm text-gray-700 mb-2">{dog.feeding_schedule}</p>
                              )}

                              {dog.dietary_requirements && (
                                <div className="bg-blue-100 rounded-lg p-2 mb-2">
                                  <p className="text-xs text-blue-800 font-semibold">Diet: {dog.dietary_requirements}</p>
                                </div>
                              )}

                              {dog.lunch_completed ? (
                                <div className="bg-green-500 text-white rounded-lg p-2 text-center">
                                  <p className="text-sm font-bold">Completed</p>
                                  {dog.lunch_completed_at && (
                                    <p className="text-xs">
                                      {new Date(dog.lunch_completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleMarkMealComplete('lunch', dog.booking_id)}
                                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                                >
                                  Mark Complete
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dinner */}
                    {feedingSchedule.dinner.length > 0 && (
                      <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-400">
                        <h3 className="text-xl font-bold text-purple-900 mb-4">Dinner ({feedingSchedule.dinner.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {feedingSchedule.dinner.map(dog => (
                            <motion.div
                              key={dog.dog_id}
                              whileHover={{ scale: 1.02 }}
                              className={`rounded-xl p-4 border-2 ${
                                dog.dinner_completed
                                  ? 'bg-green-100 border-green-400'
                                  : 'bg-white border-purple-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 overflow-hidden flex-shrink-0">
                                  {dog.dog_photo_url ? (
                                    <img src={dog.dog_photo_url} alt={dog.dog_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-xl">🐕</div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-bold text-canine-navy">{dog.dog_name}</h4>
                                  <p className="text-xs text-gray-600">{dog.owner_name}</p>
                                </div>
                              </div>

                              {dog.feeding_schedule && (
                                <p className="text-sm text-gray-700 mb-2">{dog.feeding_schedule}</p>
                              )}

                              {dog.dietary_requirements && (
                                <div className="bg-blue-100 rounded-lg p-2 mb-2">
                                  <p className="text-xs text-blue-800 font-semibold">Diet: {dog.dietary_requirements}</p>
                                </div>
                              )}

                              {dog.dinner_completed ? (
                                <div className="bg-green-500 text-white rounded-lg p-2 text-center">
                                  <p className="text-sm font-bold">Completed</p>
                                  {dog.dinner_completed_at && (
                                    <p className="text-xs">
                                      {new Date(dog.dinner_completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleMarkMealComplete('dinner', dog.booking_id)}
                                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                                >
                                  Mark Complete
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <motion.div
              key="medications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-canine-gold/20">
                  <h2 className="text-2xl font-display font-bold text-canine-navy mb-4 flex items-center">
                    <BeakerIcon className="h-8 w-8 mr-3 text-canine-gold" />
                    Today's Medications ({medicationsToday.length})
                  </h2>
                </div>

                {medicationsToday.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
                    <BeakerIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-canine-navy mb-2">No Medications Today</h3>
                    <p className="text-gray-600">No dogs require medications for {new Date(currentDate).toLocaleDateString()}</p>
                  </div>
                ) : (
                  medicationsToday.map((med) => (
                    <motion.div
                      key={med.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-orange-50 rounded-xl p-6 border-2 border-orange-300 shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-400 overflow-hidden flex-shrink-0">
                            {med.dogs.photo_url ? (
                              <img src={med.dogs.photo_url} alt={med.dogs.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-2xl">🐕</div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-2xl text-orange-900">{med.dogs.name}</h3>
                            <p className="text-gray-600">{med.dogs.owner?.first_name} {med.dogs.owner?.last_name}</p>
                            <p className="text-sm text-gray-500">{med.dogs.owner?.phone}</p>
                          </div>
                        </div>
                        {med.time_of_day && (
                          <div className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2">
                            <ClockIcon className="h-5 w-5" />
                            <span className="font-bold">{med.time_of_day}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg p-4">
                        <div>
                          <p className="text-sm text-orange-700 mb-1">Medication</p>
                          <p className="font-bold text-lg">{med.medication_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-700 mb-1">Dosage</p>
                          <p className="font-bold text-lg">{med.dosage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-700 mb-1">Frequency</p>
                          <p className="font-bold text-lg">{med.frequency}</p>
                        </div>
                      </div>

                      {med.notes && (
                        <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                          <p className="text-sm font-semibold text-yellow-800 mb-1">Important Notes</p>
                          <p className="text-gray-700">{med.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Incidents Tab */}
          {activeTab === 'incidents' && (
            <motion.div
              key="incidents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                {/* Report New Incident Button */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display font-bold mb-2">Incident Reporting</h2>
                      <p className="text-white/90">Document any incidents that occur during daycare operations</p>
                    </div>
                    <button
                      onClick={() => setShowIncidentModal(true)}
                      className="bg-white text-red-600 hover:bg-red-50 font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <ExclamationTriangleIcon className="h-6 w-6" />
                      <span>Report New Incident</span>
                    </button>
                  </div>
                </div>

                {/* Incident History */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-canine-gold/20">
                  <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center">
                    <ClipboardDocumentCheckIcon className="h-8 w-8 mr-3 text-canine-gold" />
                    Incident History ({incidents.length})
                  </h2>

                  {incidents.length === 0 ? (
                    <div className="text-center py-12">
                      <ExclamationTriangleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-canine-navy mb-2">No Incidents Recorded</h3>
                      <p className="text-gray-600">All incidents will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {incidents.map((incident) => {
                        const getSeverityColor = (severity: string) => {
                          switch (severity) {
                            case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300'
                            case 'serious': return 'bg-red-100 text-red-800 border-red-300'
                            case 'critical': return 'bg-red-200 text-red-900 border-red-400'
                            default: return 'bg-gray-100 text-gray-800 border-gray-300'
                          }
                        }

                        return (
                          <motion.div
                            key={incident.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                              !incident.resolved ? 'bg-red-50/50 border-red-200 animate-pulse-slow' : 'bg-white border-gray-200'
                            }`}
                            onClick={() => setSelectedIncident(incident)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getSeverityColor(incident.severity)}`}>
                                    {incident.severity.toUpperCase()}
                                  </span>
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border-2 border-gray-200">
                                    {incident.incident_type.replace('_', ' ').toUpperCase()}
                                  </span>
                                  {!incident.resolved && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                                      UNRESOLVED
                                    </span>
                                  )}
                                  {incident.resolved && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white flex items-center">
                                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                                      RESOLVED
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-canine-navy mb-1">{incident.title}</h3>
                                <p className="text-gray-700 mb-2">{incident.description}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 text-xs font-semibold mb-1">Date & Time</p>
                                <p className="text-gray-900 font-medium">
                                  {new Date(incident.occurred_at).toLocaleDateString()}<br />
                                  {new Date(incident.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {incident.dogs && (
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold mb-1">Dog Involved</p>
                                  <p className="text-gray-900 font-medium">{incident.dogs.name}</p>
                                </div>
                              )}
                              {incident.location && (
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold mb-1">Location</p>
                                  <p className="text-gray-900 font-medium">{incident.location}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-500 text-xs font-semibold mb-1">Reported By</p>
                                <p className="text-gray-900 font-medium">
                                  {incident.reported_by_staff ?
                                    `${incident.reported_by_staff.first_name} ${incident.reported_by_staff.last_name}` :
                                    'Unknown'
                                  }
                                </p>
                              </div>
                            </div>

                            {incident.action_taken && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-gray-500 text-xs font-semibold mb-1">Action Taken</p>
                                <p className="text-gray-900">{incident.action_taken}</p>
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              {incident.vet_notified && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                                  Vet Notified
                                </span>
                              )}
                              {incident.owner_notified && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                                  Owner Notified
                                </span>
                              )}
                              {incident.requires_follow_up && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                                  Requires Follow-up
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Play Groups Tab */}
          {activeTab === 'playgroups' && (
            <motion.div
              key="playgroups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {totalDogsToday === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
                  <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-canine-navy mb-2">No Play Groups Today</h2>
                  <p className="text-gray-600">No dogs are scheduled for {new Date(currentDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Play Groups */}
                  {playGroups.map((group) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-lg border-2 overflow-hidden"
                      style={{ borderColor: group.color + '40' }}
                    >
                      {/* Group Header */}
                      <div
                        className="p-6 text-white"
                        style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}dd)` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-4xl">{group.icon}</span>
                            <div>
                              <h2 className="text-2xl font-display font-bold">{group.name}</h2>
                              {group.description && (
                                <p className="text-white/80 text-sm mt-1">{group.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold">{group.dogs.length}</p>
                            <p className="text-sm text-white/80">of {group.max_dogs} max</p>
                          </div>
                        </div>
                        {group.notes && (
                          <div className="mt-4 bg-white/20 rounded-xl p-3">
                            <p className="text-sm"><strong>Note:</strong> {group.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Dogs in Group */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.dogs.map((dog) => {
                            const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
                            return (
                            <motion.div
                              key={dog.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => handleDogClick(dog)}
                              className="bg-canine-cream rounded-xl p-4 border-2 border-canine-gold/20 hover:border-canine-gold cursor-pointer transition-all"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-canine-sky to-canine-cream overflow-hidden flex-shrink-0">
                                  {dog.photo_url ? (
                                    <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-2xl">🐕</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-canine-navy truncate">{dog.name}</h3>
                                  <p className="text-sm text-gray-600 truncate">{dog.breed}</p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {owner?.first_name} {owner?.last_name}
                                  </p>
                                </div>
                              </div>

                              {/* Quick Alert Badges */}
                              <div className="mt-3 flex flex-wrap gap-1">
                                {dog.medical_conditions && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
                                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                    Medical
                                  </span>
                                )}
                                {dog.medications && (
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center">
                                    <BeakerIcon className="h-3 w-3 mr-1" />
                                    Meds
                                  </span>
                                )}
                                {dog.allergies && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    Allergies
                                  </span>
                                )}
                                {dog.dietary_requirements && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Diet
                                  </span>
                                )}
                                {dog.photo_permission === false && (
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                    No Photos
                                  </span>
                                )}
                              </div>
                            </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Unassigned Dogs */}
                  {unassignedDogs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-lg border-2 border-gray-300 overflow-hidden"
                    >
                      <div className="bg-gray-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-4xl">📋</span>
                            <div>
                              <h2 className="text-2xl font-display font-bold">Unassigned Dogs</h2>
                              <p className="text-white/80 text-sm mt-1">Dogs not yet assigned to a play group</p>
                            </div>
                          </div>
                          <p className="text-3xl font-bold">{unassignedDogs.length}</p>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {unassignedDogs.map((dog) => {
                            const owner = Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
                            return (
                            <motion.div
                              key={dog.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => handleDogClick(dog)}
                              className="bg-canine-cream rounded-xl p-4 border-2 border-canine-gold/20 hover:border-canine-gold cursor-pointer transition-all"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-canine-sky to-canine-cream overflow-hidden flex-shrink-0">
                                  {dog.photo_url ? (
                                    <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-2xl">🐕</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-canine-navy truncate">{dog.name}</h3>
                                  <p className="text-sm text-gray-600 truncate">{dog.breed}</p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {owner?.first_name} {owner?.last_name}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-1">
                                {dog.medical_conditions && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
                                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                    Medical
                                  </span>
                                )}
                                {dog.medications && (
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center">
                                    <BeakerIcon className="h-3 w-3 mr-1" />
                                    Meds
                                  </span>
                                )}
                              </div>
                            </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dog Details Modal */}
      <AnimatePresence>
        {showDogModal && selectedDog && (() => {
          const owner = Array.isArray(selectedDog.owner) ? selectedDog.owner[0] : selectedDog.owner
          return (
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
              <div className="sticky top-0 bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-t-3xl z-10">
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
                {/* Emergency Contact - FIRST AND PROMINENT */}
                <div className="bg-red-50 rounded-xl p-6 border-4 border-red-500">
                  <h3 className="font-bold text-2xl mb-4 flex items-center text-red-900">
                    <PhoneIcon className="h-7 w-7 mr-2" />
                    Emergency Contacts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-red-700 mb-1">Owner</p>
                      <p className="font-bold text-xl text-red-900">{owner?.first_name} {owner?.last_name}</p>
                      <p className="font-bold text-2xl text-red-900 mt-2">{owner?.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">{owner?.email}</p>
                    </div>
                    {selectedDog.emergency_contact_name && (
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-red-700 mb-1">Emergency Contact</p>
                        <p className="font-bold text-xl text-red-900">{selectedDog.emergency_contact_name}</p>
                        <p className="font-bold text-2xl text-red-900 mt-2">{selectedDog.emergency_contact_phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Alerts */}
                {(selectedDog.medical_conditions || selectedDog.medications || selectedDog.allergies) && (
                  <div className="bg-orange-50 rounded-xl p-6 border-4 border-orange-400">
                    <h3 className="font-bold text-2xl mb-4 flex items-center text-orange-900">
                      <ExclamationTriangleIcon className="h-7 w-7 mr-2" />
                      Medical Alerts
                    </h3>
                    <div className="space-y-3">
                      {selectedDog.medical_conditions && (
                        <div className="bg-white rounded-lg p-4">
                          <p className="font-semibold text-orange-800 mb-1">Medical Conditions</p>
                          <p className="text-gray-900 text-lg">{selectedDog.medical_conditions}</p>
                        </div>
                      )}
                      {selectedDog.medications && (
                        <div className="bg-white rounded-lg p-4">
                          <p className="font-semibold text-orange-800 mb-1">Medications</p>
                          <p className="text-gray-900 text-lg">{selectedDog.medications}</p>
                        </div>
                      )}
                      {selectedDog.allergies && (
                        <div className="bg-white rounded-lg p-4">
                          <p className="font-semibold text-orange-800 mb-1">Allergies</p>
                          <p className="text-gray-900 text-lg">{selectedDog.allergies}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {(selectedDog.dietary_requirements || selectedDog.behavioral_notes || selectedDog.special_instructions) && (
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300">
                    <h3 className="font-bold text-xl mb-4 text-blue-900">Important Information</h3>
                    <div className="space-y-3">
                      {selectedDog.dietary_requirements && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-semibold text-blue-800 text-sm mb-1">Dietary Requirements</p>
                          <p className="text-gray-700">{selectedDog.dietary_requirements}</p>
                        </div>
                      )}
                      {selectedDog.behavioral_notes && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-semibold text-blue-800 text-sm mb-1">Behavioral Notes</p>
                          <p className="text-gray-700">{selectedDog.behavioral_notes}</p>
                        </div>
                      )}
                      {selectedDog.special_instructions && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-semibold text-blue-800 text-sm mb-1">Special Instructions</p>
                          <p className="text-gray-700">{selectedDog.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Photo Permission */}
                {selectedDog.photo_permission !== undefined && (
                  <div className={`rounded-xl p-4 border-2 ${selectedDog.photo_permission ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <p className="font-semibold text-center">
                      {selectedDog.photo_permission ? 'Photo Permission Granted' : 'No Photo Permission - Do Not Photograph'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Check In Modal */}
      <AnimatePresence>
        {showCheckInModal && selectedBookingDog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCheckInModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl"
            >
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-t-3xl">
                <h2 className="text-2xl font-display font-bold">Check In</h2>
              </div>
              <div className="p-6">
                <p className="text-lg mb-4">Check in <strong>{selectedBookingDog.name}</strong>?</p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCheckIn}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Confirm Check In
                  </button>
                  <button
                    onClick={() => setShowCheckInModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check Out Modal */}
      <AnimatePresence>
        {showCheckOutModal && selectedBookingDog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCheckOutModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl"
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-3xl">
                <h2 className="text-2xl font-display font-bold">Check Out</h2>
              </div>
              <div className="p-6">
                <p className="text-lg mb-4">Check out <strong>{selectedBookingDog.name}</strong>?</p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCheckOut}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Confirm Check Out
                  </button>
                  <button
                    onClick={() => setShowCheckOutModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && selectedDog && (
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
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-3xl sticky top-0">
                <h2 className="text-2xl font-display font-bold">Approve {selectedDog.name}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Approval Notes (Optional)
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none"
                    placeholder="Add any notes about the assessment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Assessment Video (Optional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setAssessmentVideoFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none"
                  />
                  {assessmentVideoFile && (
                    <p className="text-sm text-gray-600 mt-2">Selected: {assessmentVideoFile.name}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleApproveDog}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Approve Dog
                  </button>
                  <button
                    onClick={() => {
                      setShowApprovalModal(false)
                      setApprovalNotes('')
                      setAssessmentVideoFile(null)
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decline Modal */}
      <AnimatePresence>
        {showDeclineModal && selectedDog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeclineModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-3xl">
                <h2 className="text-2xl font-display font-bold">Decline {selectedDog.name}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Decline Reason (Required)
                  </label>
                  <textarea
                    value={declineNotes}
                    onChange={(e) => setDeclineNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                    placeholder="Please provide a reason for declining..."
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleDeclineDog}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Decline Assessment
                  </button>
                  <button
                    onClick={() => {
                      setShowDeclineModal(false)
                      setDeclineNotes('')
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incident Report Modal */}
      <AnimatePresence>
        {showIncidentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIncidentModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-3xl sticky top-0 z-10">
                <h2 className="text-3xl font-display font-bold">Report New Incident</h2>
                <p className="text-white/90 mt-1">Document any incidents that occurred during daycare operations</p>
              </div>

              <div className="p-8 space-y-6">
                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Incident Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={incidentFormData.incident_date}
                      onChange={(e) => setIncidentFormData({ ...incidentFormData, incident_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Incident Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={incidentFormData.incident_time}
                      onChange={(e) => setIncidentFormData({ ...incidentFormData, incident_time: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Incident Type and Severity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Incident Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={incidentFormData.incident_type}
                      onChange={(e) => setIncidentFormData({ ...incidentFormData, incident_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                      required
                    >
                      <option value="">Select type...</option>
                      <option value="injury">Injury</option>
                      <option value="illness">Illness</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="dog_fight">Dog Fight</option>
                      <option value="escape_attempt">Escape Attempt</option>
                      <option value="property_damage">Property Damage</option>
                      <option value="bite">Bite</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Severity Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={incidentFormData.severity}
                      onChange={(e) => setIncidentFormData({ ...incidentFormData, severity: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                      required
                    >
                      <option value="">Select severity...</option>
                      <option value="minor">Minor</option>
                      <option value="moderate">Moderate</option>
                      <option value="serious">Serious</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Incident Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={incidentFormData.title}
                    onChange={(e) => setIncidentFormData({ ...incidentFormData, title: e.target.value })}
                    placeholder="Brief summary of the incident"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={incidentFormData.description}
                    onChange={(e) => setIncidentFormData({ ...incidentFormData, description: e.target.value })}
                    rows={5}
                    placeholder="Provide a detailed description of what happened, including context and circumstances..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                    required
                  />
                </div>

                {/* Dog Involved and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dog Involved (Optional)
                    </label>
                    <select
                      value={incidentFormData.dog_id}
                      onChange={(e) => setIncidentFormData({ ...incidentFormData, dog_id: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                    >
                      <option value="">None / Not Applicable</option>
                      {allDogs.map(dog => (
                        <option key={dog.id} value={dog.id}>{dog.name} ({dog.breed})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={incidentFormData.location}
                      onChange={(e) => setIncidentFormData({ ...incidentFormData, location: e.target.value })}
                      placeholder="e.g., Indoor play area, Outdoor yard, Reception"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                {/* Immediate Action Taken */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Immediate Action Taken
                  </label>
                  <textarea
                    value={incidentFormData.action_taken}
                    onChange={(e) => setIncidentFormData({ ...incidentFormData, action_taken: e.target.value })}
                    rows={3}
                    placeholder="Describe what actions were taken immediately following the incident..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                  />
                </div>

                {/* Notifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incidentFormData.vet_notified}
                        onChange={(e) => setIncidentFormData({ ...incidentFormData, vet_notified: e.target.checked })}
                        className="w-5 h-5 text-red-500 border-2 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-gray-700 font-semibold">Veterinarian Notified</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incidentFormData.owner_notified}
                        onChange={(e) => setIncidentFormData({ ...incidentFormData, owner_notified: e.target.checked })}
                        className="w-5 h-5 text-red-500 border-2 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-gray-700 font-semibold">Owner Notified</span>
                    </label>
                  </div>

                  {incidentFormData.owner_notified && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Owner Notification Time
                      </label>
                      <input
                        type="time"
                        value={incidentFormData.notification_time}
                        onChange={(e) => setIncidentFormData({ ...incidentFormData, notification_time: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Follow-up */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incidentFormData.requires_follow_up}
                      onChange={(e) => setIncidentFormData({ ...incidentFormData, requires_follow_up: e.target.checked })}
                      className="w-5 h-5 text-red-500 border-2 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-gray-700 font-semibold">Requires Follow-up</span>
                  </label>

                  {incidentFormData.requires_follow_up && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Follow-up Notes
                      </label>
                      <textarea
                        value={incidentFormData.follow_up_notes}
                        onChange={(e) => setIncidentFormData({ ...incidentFormData, follow_up_notes: e.target.value })}
                        rows={3}
                        placeholder="Describe what follow-up actions are needed..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleCreateIncident}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Submit Incident Report
                  </button>
                  <button
                    onClick={() => {
                      setShowIncidentModal(false)
                      // Reset form
                      setIncidentFormData({
                        incident_date: new Date().toISOString().split('T')[0],
                        incident_time: new Date().toTimeString().slice(0, 5),
                        incident_type: '',
                        severity: '',
                        title: '',
                        description: '',
                        dog_id: '',
                        location: '',
                        action_taken: '',
                        vet_notified: false,
                        owner_notified: false,
                        notification_time: '',
                        notification_method: '',
                        requires_follow_up: false,
                        follow_up_notes: ''
                      })
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-6 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roll Call Modal - SIMPLE VERSION */}
      <AnimatePresence>
        {showRollCallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRollCallModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-canine-navy to-canine-navy/80 text-white p-6 rounded-t-3xl">
                <div className="flex items-center">
                  <ClipboardDocumentCheckIcon className="h-8 w-8 mr-3" />
                  <div>
                    <h2 className="text-2xl font-display font-bold">{rollCallTimeSlot.toUpperCase()} Roll Call</h2>
                    <p className="text-canine-sky text-sm">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Simple Form Content */}
              <div className="p-8 space-y-6">
                {/* Section Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Section / Area
                  </label>
                  <select
                    value={rollCallSection}
                    onChange={(e) => setRollCallSection(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-canine-gold/30 rounded-xl focus:border-canine-gold outline-none text-lg bg-white"
                  >
                    <option value="">Select your section...</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.name}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dog Count */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Number of Dogs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rollCallDogCount}
                    onChange={(e) => setRollCallDogCount(e.target.value)}
                    placeholder="Enter dog count"
                    className="w-full px-4 py-3 border-2 border-canine-gold/30 rounded-xl focus:border-canine-gold outline-none text-lg"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Time of Count
                  </label>
                  <input
                    type="time"
                    value={rollCallActualTime}
                    onChange={(e) => setRollCallActualTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-canine-gold/30 rounded-xl focus:border-canine-gold outline-none text-lg"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-6 rounded-b-3xl flex items-center justify-between border-t-2 border-gray-200">
                <button
                  onClick={() => setShowRollCallModal(false)}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmitRollCall}
                  className="px-8 py-3 bg-canine-navy hover:bg-canine-navy/90 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                  Submit Roll Call
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
