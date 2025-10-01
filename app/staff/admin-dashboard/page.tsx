'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Dog {
  id: string
  name: string
  breed: string
  age?: number
  weight?: number
  gender?: string
  color?: string
  photo_url?: string
  owner_id: string
  owner?: {
    first_name: string
    last_name: string
    email: string
    phone: string
    address?: string
  }
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  medical_conditions?: string
  medications?: string
  allergies?: string
  dietary_requirements?: string
  vaccinated?: boolean
  vaccination_expiry?: string
  neutered?: boolean
  behavioral_notes?: string
  special_instructions?: string
  vet_name?: string
  vet_phone?: string
  photo_permission?: boolean
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

type TabType = 'overview' | 'schedule' | 'assessments' | 'dogs' | 'users' | 'staff' | 'playgroups' | 'newsletter' | 'settings'

export default function AdminDashboard() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [adminName, setAdminName] = useState('Admin')
  const [loading, setLoading] = useState(true)

  // Stats
  const [totalDogs, setTotalDogs] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [dogsToday, setDogsToday] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [pendingAssessments, setPendingAssessments] = useState(0)
  const [activeSubscriptions, setActiveSubscriptions] = useState(0)

  // Schedule tab
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [scheduleBookings, setScheduleBookings] = useState<any[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)

  // Data
  const [todayBookings, setTodayBookings] = useState<any[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [allDogs, setAllDogs] = useState<Dog[]>([])
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([])
  const [dogSearchQuery, setDogSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])

  // Settings state
  const [settings, setSettings] = useState({
    assessment_fee: 40,
    assessment_day: '5', // 5 = Friday (default)
    max_dogs_per_day: 20,
    opening_time: '07:00',
    closing_time: '19:00',
  })

  // Subscription tiers from database
  const [subscriptionTiers, setSubscriptionTiers] = useState<any[]>([])

  // Play Groups state
  const [playGroups, setPlayGroups] = useState<PlayGroup[]>([])
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<PlayGroup | null>(null)
  const [showAssignDogsModal, setShowAssignDogsModal] = useState(false)
  const [assigningToGroup, setAssigningToGroup] = useState<PlayGroup | null>(null)
  const [selectedDogsForGroup, setSelectedDogsForGroup] = useState<string[]>([])

  // Modal states
  const [showDogModal, setShowDogModal] = useState(false)
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)

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

  useEffect(() => {
    fetchAdminProfile()
    fetchDashboardData()
    fetchPlayGroups()
    fetchSubscriptionTiers()
    fetchSettings()
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
      user.first_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [userSearchQuery, allUsers])

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

      // Total dogs in system
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

      // Dogs attending today
      const { data: todayBookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (first_name, last_name)
        `)
        .eq('booking_date', today)
        .eq('status', 'confirmed')

      const bookingsWithDogs = await Promise.all(
        (todayBookingsData || []).map(async (booking) => {
          const { data: dogsData } = await supabase
            .from('dogs')
            .select(`
              id, name, breed, photo_url, owner_id,
              owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone)
            `)
            .in('id', booking.dog_ids)

          return { ...booking, dogs: dogsData || [] }
        })
      )

      setTodayBookings(bookingsWithDogs)
      const totalDogsToday = bookingsWithDogs.reduce((sum, b) => sum + (b.dogs?.length || 0), 0)
      setDogsToday(totalDogsToday)

      // Monthly revenue
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_amount')
        .gte('booking_date', firstDayOfMonth)
        .lte('booking_date', lastDayOfMonth)
        .eq('payment_status', 'paid')

      const revenue = revenueData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
      setMonthlyRevenue(revenue)

      // Pending assessments
      const { data: assessmentsData } = await supabase
        .from('assessment_schedule')
        .select(`
          *,
          profiles:user_id (first_name, last_name, email, phone)
        `)
        .eq('status', 'pending')
        .order('requested_date', { ascending: true })

      setAssessments(assessmentsData || [])
      setPendingAssessments(assessmentsData?.length || 0)

      // Active subscriptions
      const { count: subsCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      setActiveSubscriptions(subsCount || 0)

      // All dogs
      const { data: allDogsData } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone)
        `)
        .order('name', { ascending: true })
      setAllDogs(allDogsData || [])
      setFilteredDogs(allDogsData || [])

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

          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

          return {
            ...user,
            dogs_count: dogsCount || 0,
            subscription_status: subscription ? 'Active' : 'None'
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

  const fetchScheduleForDate = async (date: string) => {
    setLoadingSchedule(true)
    try {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (first_name, last_name, email, phone)
        `)
        .eq('booking_date', date)
        .eq('status', 'confirmed')

      const bookingsWithDogs = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: dogsData } = await supabase
            .from('dogs')
            .select(`
              *,
              owner:profiles!dogs_owner_id_fkey (first_name, last_name, email, phone, address)
            `)
            .in('id', booking.dog_ids)

          return { ...booking, dogs: dogsData || [] }
        })
      )

      setScheduleBookings(bookingsWithDogs)
    } catch (error) {
      console.error('Error fetching schedule:', error)
      toast.error('Failed to load schedule')
    } finally {
      setLoadingSchedule(false)
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
      // Note: This requires admin privileges in Supabase
      // You may need to create a server-side API route for this
      toast.success('Staff account creation feature requires server-side setup. Contact developer.')

      // For now, we'll just show what would be created:
      console.log('Would create staff:', {
        email: newStaffEmail,
        first_name: newStaffFirstName,
        last_name: newStaffLastName,
        phone: newStaffPhone,
        role: newStaffRole
      })

      setShowStaffModal(false)
      setNewStaffEmail('')
      setNewStaffPassword('')
      setNewStaffFirstName('')
      setNewStaffLastName('')
      setNewStaffPhone('')
    } catch (error) {
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
          max_dogs_per_day: settingsObj.max_dogs_per_day || 20,
          opening_time: settingsObj.business_hours_start || '07:00',
          closing_time: settingsObj.business_hours_end || '19:00',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    }
  }

  const handleSaveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update admin_settings
      const settingsToUpdate = [
        { key: 'assessment_fee', value: settings.assessment_fee.toString(), type: 'number' },
        { key: 'assessment_day', value: settings.assessment_day, type: 'text' },
        { key: 'max_dogs_per_day', value: settings.max_dogs_per_day.toString(), type: 'number' },
        { key: 'business_hours_start', value: settings.opening_time, type: 'text' },
        { key: 'business_hours_end', value: settings.closing_time, type: 'text' },
      ]

      for (const setting of settingsToUpdate) {
        await supabase
          .from('admin_settings')
          .upsert({
            setting_key: setting.key,
            setting_value: setting.value,
            setting_type: setting.type,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          }, { onConflict: 'setting_key' })
      }

      // Update subscription tiers
      for (const tier of subscriptionTiers) {
        await supabase
          .from('subscription_tiers')
          .update({
            monthly_price: tier.monthly_price,
            price_per_day: tier.price_per_day,
            updated_at: new Date().toISOString()
          })
          .eq('id', tier.id)
      }

      toast.success('Settings saved successfully! ✅')
      fetchSettings()
      fetchSubscriptionTiers()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'schedule', name: 'Daycare Schedule', icon: CalendarIcon, badge: dogsToday },
    { id: 'assessments', name: 'Assessments', icon: ShieldCheckIcon, badge: pendingAssessments },
    { id: 'dogs', name: 'Dogs Database', icon: HeartIcon },
    { id: 'users', name: 'Clients', icon: UserGroupIcon },
    { id: 'staff', name: 'Staff Management', icon: UsersIcon },
    { id: 'playgroups', name: 'Play Groups', icon: UserGroupIcon },
    { id: 'newsletter', name: 'Newsletter', icon: PaperAirplaneIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
  ]

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
        className="bg-gradient-to-r from-canine-navy via-canine-navy to-[#2a5a7a] text-white shadow-xl sticky top-0 z-40"
      >
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold mb-1">Admin Dashboard</h1>
              <p className="text-canine-sky">Welcome back, {adminName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <HeartIcon className="h-8 w-8 text-canine-gold" />
              </div>
              <p className="text-3xl font-bold">{totalDogs}</p>
              <p className="text-sm text-canine-sky">Total Dogs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <UserGroupIcon className="h-8 w-8 text-canine-gold" />
              </div>
              <p className="text-3xl font-bold">{totalUsers}</p>
              <p className="text-sm text-canine-sky">Total Clients</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CalendarIcon className="h-8 w-8 text-canine-gold" />
              </div>
              <p className="text-3xl font-bold">{dogsToday}</p>
              <p className="text-sm text-canine-sky">Dogs Today</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CurrencyPoundIcon className="h-8 w-8 text-canine-gold" />
              </div>
              <p className="text-3xl font-bold">£{monthlyRevenue.toFixed(0)}</p>
              <p className="text-sm text-canine-sky">Monthly Revenue</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <ShieldCheckIcon className="h-8 w-8 text-canine-gold" />
              </div>
              <p className="text-3xl font-bold">{pendingAssessments}</p>
              <p className="text-sm text-canine-sky">Pending Assessments</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircleIcon className="h-8 w-8 text-canine-gold" />
              </div>
              <p className="text-3xl font-bold">{activeSubscriptions}</p>
              <p className="text-sm text-canine-sky">Active Subscriptions</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide border-t border-white/20 pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  relative flex items-center space-x-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-all rounded-t-xl
                  ${activeTab === tab.id
                    ? 'bg-canine-cream text-canine-navy'
                    : 'text-white hover:bg-white/10'
                  }
                `}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-canine-gold text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-display font-bold text-canine-navy mb-6">Business Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Dogs Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-canine-gold/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-canine-navy/10 p-3 rounded-xl">
                      <HeartIcon className="h-8 w-8 text-canine-navy" />
                    </div>
                    <span className="text-4xl">🐕</span>
                  </div>
                  <h3 className="text-3xl font-bold text-canine-navy mb-1">{totalDogs}</h3>
                  <p className="text-gray-600 font-semibold">Total Dogs Registered</p>
                  <p className="text-sm text-gray-500 mt-2">All dogs in the system</p>
                </motion.div>

                {/* Total Users Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-canine-gold/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-canine-navy/10 p-3 rounded-xl">
                      <UserGroupIcon className="h-8 w-8 text-canine-navy" />
                    </div>
                    <span className="text-4xl">👥</span>
                  </div>
                  <h3 className="text-3xl font-bold text-canine-navy mb-1">{totalUsers}</h3>
                  <p className="text-gray-600 font-semibold">Total Clients</p>
                  <p className="text-sm text-gray-500 mt-2">Active client accounts</p>
                </motion.div>

                {/* Dogs Today Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-canine-gold/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-canine-navy/10 p-3 rounded-xl">
                      <CalendarIcon className="h-8 w-8 text-canine-navy" />
                    </div>
                    <span className="text-4xl">📅</span>
                  </div>
                  <h3 className="text-3xl font-bold text-canine-navy mb-1">{dogsToday}</h3>
                  <p className="text-gray-600 font-semibold">Dogs Attending Today</p>
                  <p className="text-sm text-gray-500 mt-2">Current day bookings</p>
                </motion.div>

                {/* Revenue Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-canine-gold/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-canine-navy/10 p-3 rounded-xl">
                      <CurrencyPoundIcon className="h-8 w-8 text-canine-navy" />
                    </div>
                    <span className="text-4xl">💰</span>
                  </div>
                  <h3 className="text-3xl font-bold text-canine-navy mb-1">£{monthlyRevenue.toFixed(0)}</h3>
                  <p className="text-gray-600 font-semibold">This Month's Revenue</p>
                  <p className="text-sm text-gray-500 mt-2">Total confirmed bookings</p>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-canine-gold/20">
                <h3 className="text-2xl font-display font-bold text-canine-navy mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('staff')}
                    className="flex items-center space-x-4 bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-xl hover:shadow-xl transition-all"
                  >
                    <PlusCircleIcon className="h-8 w-8" />
                    <div className="text-left">
                      <p className="font-bold text-lg">Create Staff Account</p>
                      <p className="text-sm text-canine-sky">Add new team member</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('newsletter')}
                    className="flex items-center space-x-4 bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-xl hover:shadow-xl transition-all"
                  >
                    <PaperAirplaneIcon className="h-8 w-8" />
                    <div className="text-left">
                      <p className="font-bold text-lg">Send Newsletter</p>
                      <p className="text-sm text-canine-sky">Email clients</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('assessments')}
                    className="flex items-center space-x-4 bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-xl hover:shadow-xl transition-all"
                  >
                    <ShieldCheckIcon className="h-8 w-8" />
                    <div className="text-left">
                      <p className="font-bold text-lg">Review Assessments</p>
                      <p className="text-sm text-canine-sky">{pendingAssessments} pending</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              {todayBookings.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-canine-gold/20">
                  <h3 className="text-2xl font-display font-bold text-canine-navy mb-6">Today's Bookings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayBookings.slice(0, 6).map((booking) => (
                      <div key={booking.id} className="bg-canine-cream rounded-xl p-4 border-2 border-canine-gold/20">
                        <p className="font-semibold text-canine-navy mb-2">
                          {booking.profiles?.first_name} {booking.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{booking.dogs?.length || 0} dog(s)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

          {/* ASSESSMENTS TAB */}
          {activeTab === 'assessments' && (
            <motion.div
              key="assessments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-display font-bold text-canine-navy mb-6">Pending Assessments ({pendingAssessments})</h2>

              {assessments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
                  <CheckCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">No pending assessments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <motion.div
                      key={assessment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-canine-gold/20 hover:border-canine-gold transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-canine-navy mb-2">
                            {assessment.profiles?.first_name} {assessment.profiles?.last_name}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <EnvelopeIcon className="h-4 w-4 text-canine-gold" />
                              <span className="text-gray-600">{assessment.profiles?.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <PhoneIcon className="h-4 w-4 text-canine-gold" />
                              <span className="text-gray-600">{assessment.profiles?.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="h-4 w-4 text-canine-gold" />
                              <span className="text-gray-600">{new Date(assessment.requested_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-6">
                          <button
                            onClick={() => handleApproveAssessment(assessment.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectAssessment(assessment.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2"
                          >
                            <XCircleIcon className="h-5 w-5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* DOGS TAB */}
          {activeTab === 'dogs' && (
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDogs.map((dog) => (
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
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-canine-navy mb-1">{dog.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{dog.breed}</p>
                      <p className="text-xs text-gray-500">
                        Owner: {dog.owner?.first_name} {dog.owner?.last_name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAFF TAB */}
          {activeTab === 'staff' && (
            <motion.div
              key="staff"
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

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-display font-bold text-canine-navy mb-6">Business Settings</h2>

              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-canine-gold/20 max-w-3xl mx-auto">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-canine-navy mb-2">Assessment Fee (£)</label>
                      <input
                        type="number"
                        value={settings.assessment_fee}
                        onChange={(e) => setSettings({...settings, assessment_fee: parseFloat(e.target.value)})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-canine-navy mb-2">Assessment Day</label>
                      <select
                        value={settings.assessment_day || '5'}
                        onChange={(e) => setSettings({...settings, assessment_day: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                      >
                        <option value="0">Sunday</option>
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Day of the week for assessments</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-canine-navy mb-2">Max Dogs Per Day</label>
                      <input
                        type="number"
                        value={settings.max_dogs_per_day}
                        onChange={(e) => setSettings({...settings, max_dogs_per_day: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-canine-navy mb-2">Opening Time</label>
                      <input
                        type="time"
                        value={settings.opening_time}
                        onChange={(e) => setSettings({...settings, opening_time: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-canine-navy mb-2">Closing Time</label>
                      <input
                        type="time"
                        value={settings.closing_time}
                        onChange={(e) => setSettings({...settings, closing_time: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Subscription Tiers Section */}
                  <div className="border-t-2 border-canine-gold/20 pt-6 mt-6">
                    <h3 className="text-xl font-display font-bold text-canine-navy mb-4">Subscription Tiers Pricing</h3>
                    <p className="text-sm text-gray-600 mb-4">Edit the monthly subscription price and extra day price for each tier. The extra day price is what customers pay when they purchase additional days beyond their subscription allowance.</p>

                    <div className="space-y-4">
                      {subscriptionTiers.map((tier, index) => (
                        <div key={tier.id} className="bg-canine-cream/50 p-4 rounded-xl border border-canine-gold/20">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-canine-navy">{tier.name}</h4>
                            <span className="text-sm text-gray-600">{tier.days_included} days/month included</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-canine-navy mb-1">Monthly Subscription Price (£)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={tier.monthly_price}
                                onChange={(e) => {
                                  const updated = [...subscriptionTiers]
                                  updated[index].monthly_price = parseFloat(e.target.value)
                                  setSubscriptionTiers(updated)
                                }}
                                className="w-full px-3 py-2 rounded-lg border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                              />
                              <p className="text-xs text-gray-500 mt-1">Total monthly cost</p>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-canine-navy mb-1">Extra Day Price (£)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={tier.price_per_day}
                                onChange={(e) => {
                                  const updated = [...subscriptionTiers]
                                  updated[index].price_per_day = parseFloat(e.target.value)
                                  setSubscriptionTiers(updated)
                                }}
                                className="w-full px-3 py-2 rounded-lg border-2 border-canine-gold/30 focus:border-canine-gold outline-none"
                              />
                              <p className="text-xs text-gray-500 mt-1">Price per additional day</p>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mt-2">
                            💡 Value for customer: £{(parseFloat(tier.monthly_price) / tier.days_included).toFixed(2)} per day when using all {tier.days_included} days
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                  >
                    Save All Settings
                  </button>
                </div>
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
                      <p className="text-xs text-gray-500 mb-1">Basic Information</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-600">Breed:</span> <span className="font-semibold text-canine-navy">{selectedDog.breed}</span></div>
                        {selectedDog.age && <div><span className="text-gray-600">Age:</span> <span className="font-semibold text-canine-navy">{selectedDog.age} yrs</span></div>}
                        {selectedDog.weight && <div><span className="text-gray-600">Weight:</span> <span className="font-semibold text-canine-navy">{selectedDog.weight} kg</span></div>}
                        {selectedDog.gender && <div><span className="text-gray-600">Gender:</span> <span className="font-semibold text-canine-navy">{selectedDog.gender}</span></div>}
                        {selectedDog.color && <div><span className="text-gray-600">Color:</span> <span className="font-semibold text-canine-navy">{selectedDog.color}</span></div>}
                        {selectedDog.neutered !== undefined && <div><span className="text-gray-600">Neutered:</span> <span className="font-semibold text-canine-navy">{selectedDog.neutered ? 'Yes' : 'No'}</span></div>}
                      </div>
                    </div>
                    {selectedDog.photo_permission !== undefined && (
                      <div className={`rounded-xl p-3 border-2 ${selectedDog.photo_permission ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-sm font-semibold">{selectedDog.photo_permission ? '📸 Photo Permission Granted' : '🚫 No Photo Permission'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner Information */}
                <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white rounded-xl p-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center">
                    <UserGroupIcon className="h-6 w-6 mr-2" />
                    Owner Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-canine-sky text-sm mb-1">Name</p>
                      <p className="font-bold text-lg">{selectedDog.owner?.first_name} {selectedDog.owner?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-canine-sky text-sm mb-1">Email</p>
                      <p className="font-semibold">{selectedDog.owner?.email}</p>
                    </div>
                    <div>
                      <p className="text-canine-sky text-sm mb-1">Phone</p>
                      <p className="font-semibold text-lg">{selectedDog.owner?.phone}</p>
                    </div>
                    {selectedDog.owner?.address && (
                      <div>
                        <p className="text-canine-sky text-sm mb-1">Address</p>
                        <p className="font-semibold">{selectedDog.owner.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedDog.emergency_contact_name && (
                  <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                    <h3 className="font-bold text-xl mb-4 flex items-center text-orange-900">
                      <PhoneIcon className="h-6 w-6 mr-2" />
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-orange-700 mb-1">Name</p>
                        <p className="font-bold text-lg text-orange-900">{selectedDog.emergency_contact_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-orange-700 mb-1">Phone</p>
                        <p className="font-bold text-lg text-orange-900">{selectedDog.emergency_contact_phone}</p>
                      </div>
                      {selectedDog.emergency_contact_relationship && (
                        <div>
                          <p className="text-sm text-orange-700 mb-1">Relationship</p>
                          <p className="font-bold text-lg text-orange-900">{selectedDog.emergency_contact_relationship}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medical Information */}
                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                  <h3 className="font-bold text-xl mb-4 flex items-center text-red-900">
                    <BeakerIcon className="h-6 w-6 mr-2" />
                    Medical Information
                  </h3>
                  <div className="space-y-3">
                    {selectedDog.vaccination_expiry && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600 mb-1">Vaccination Status</p>
                        <p className="font-bold text-canine-navy">
                          {selectedDog.vaccinated ? '✅ Vaccinated' : '❌ Not Vaccinated'}
                        </p>
                        <p className="text-sm text-gray-600">Expires: {new Date(selectedDog.vaccination_expiry).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedDog.medical_conditions && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Medical Conditions</p>
                        <p className="text-gray-700">{selectedDog.medical_conditions}</p>
                      </div>
                    )}
                    {selectedDog.medications && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm font-semibold text-red-800 mb-1">💊 Medications</p>
                        <p className="text-gray-700">{selectedDog.medications}</p>
                      </div>
                    )}
                    {selectedDog.allergies && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm font-semibold text-red-800 mb-1">🚨 Allergies</p>
                        <p className="text-gray-700">{selectedDog.allergies}</p>
                      </div>
                    )}
                    {selectedDog.dietary_requirements && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">🍖 Dietary Requirements</p>
                        <p className="text-gray-700">{selectedDog.dietary_requirements}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Veterinarian */}
                {(selectedDog.vet_name || selectedDog.vet_phone) && (
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="font-bold text-xl mb-4 flex items-center text-blue-900">
                      <HeartIcon className="h-6 w-6 mr-2" />
                      Veterinarian
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDog.vet_name && (
                        <div>
                          <p className="text-sm text-blue-700 mb-1">Vet Name</p>
                          <p className="font-bold text-lg text-blue-900">{selectedDog.vet_name}</p>
                        </div>
                      )}
                      {selectedDog.vet_phone && (
                        <div>
                          <p className="text-sm text-blue-700 mb-1">Vet Phone</p>
                          <p className="font-bold text-lg text-blue-900">{selectedDog.vet_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Behavioral Notes & Special Instructions */}
                {(selectedDog.behavioral_notes || selectedDog.special_instructions) && (
                  <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
                    <h3 className="font-bold text-xl mb-4 flex items-center text-yellow-900">
                      <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                      Notes & Instructions
                    </h3>
                    {selectedDog.behavioral_notes && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Behavioral Notes</p>
                        <p className="text-gray-700">{selectedDog.behavioral_notes}</p>
                      </div>
                    )}
                    {selectedDog.special_instructions && (
                      <div>
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Special Instructions</p>
                        <p className="text-gray-700">{selectedDog.special_instructions}</p>
                      </div>
                    )}
                  </div>
                )}
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
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl"
            >
              <div className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white p-6 rounded-t-3xl">
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
    </div>
  )
}
