'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'

interface Dog {
  id: string
  name: string
  breed: string
  photo_url?: string
  owner?: {
    first_name: string
    last_name: string
    phone: string
  }
  booking_id?: string
  checked_in?: boolean
  checked_out?: boolean
  checked_in_at?: string
  checked_out_at?: string
  dropped_off_by?: string
  picked_up_by?: string
  checked_in_by_staff_id?: string
  checked_out_by_staff_id?: string
  checked_in_by_staff?: {
    first_name: string
    last_name: string
  }
  checked_out_by_staff?: {
    first_name: string
    last_name: string
  }
  needs_breakfast?: boolean
  needs_lunch?: boolean
  needs_dinner?: boolean
  breakfast_completed?: boolean
  lunch_completed?: boolean
  dinner_completed?: boolean
}

export default function AdminCheckInOut() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [todayDogs, setTodayDogs] = useState<Dog[]>([])

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    fetchTodayDogs()
  }, [currentDate])

  const checkAdminAuth = async () => {
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

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      toast.error('Access denied: Admin only')
    }
  }

  const fetchTodayDogs = async () => {
    setLoading(true)
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          dog_ids,
          checked_in,
          checked_out,
          checked_in_at,
          checked_out_at,
          dropped_off_by,
          picked_up_by,
          checked_in_by_staff_id,
          checked_out_by_staff_id,
          needs_breakfast,
          needs_lunch,
          needs_dinner,
          breakfast_completed,
          lunch_completed,
          dinner_completed
        `)
        .eq('booking_date', currentDate)
        .eq('status', 'confirmed')

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
        return
      }

      const todayDogIds = bookingsData?.flatMap(b => b.dog_ids || []).filter(id => id) || []

      if (todayDogIds.length > 0) {
        const { data: dogsData } = await supabase
          .from('dogs')
          .select(`
            *,
            owner:profiles!dogs_owner_id_fkey (first_name, last_name, phone)
          `)
          .in('id', todayDogIds)

        // Fetch staff names for check-in/check-out
        const staffIds = bookingsData
          ?.flatMap(b => [b.checked_in_by_staff_id, b.checked_out_by_staff_id])
          .filter(id => id) || []

        let staffMap: Record<string, { first_name: string, last_name: string }> = {}

        if (staffIds.length > 0) {
          const { data: staffData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', staffIds)

          staffMap = (staffData || []).reduce((acc, staff) => {
            acc[staff.id] = { first_name: staff.first_name, last_name: staff.last_name }
            return acc
          }, {} as Record<string, { first_name: string, last_name: string }>)
        }

        // Attach booking info to each dog
        const dogsWithBookingInfo = (dogsData || []).map(dog => {
          const booking = bookingsData?.find(b => b.dog_ids?.includes(dog.id))
          return {
            ...dog,
            booking_id: booking?.id,
            checked_in: booking?.checked_in || false,
            checked_out: booking?.checked_out || false,
            checked_in_at: booking?.checked_in_at,
            checked_out_at: booking?.checked_out_at,
            dropped_off_by: booking?.dropped_off_by,
            picked_up_by: booking?.picked_up_by,
            checked_in_by_staff_id: booking?.checked_in_by_staff_id,
            checked_out_by_staff_id: booking?.checked_out_by_staff_id,
            checked_in_by_staff: booking?.checked_in_by_staff_id
              ? staffMap[booking.checked_in_by_staff_id]
              : undefined,
            checked_out_by_staff: booking?.checked_out_by_staff_id
              ? staffMap[booking.checked_out_by_staff_id]
              : undefined,
            needs_breakfast: booking?.needs_breakfast || false,
            needs_lunch: booking?.needs_lunch || false,
            needs_dinner: booking?.needs_dinner || false,
            breakfast_completed: booking?.breakfast_completed || false,
            lunch_completed: booking?.lunch_completed || false,
            dinner_completed: booking?.dinner_completed || false,
          }
        })

        setTodayDogs(dogsWithBookingInfo)
      } else {
        setTodayDogs([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load check-in/check-out data')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const notCheckedInDogs = todayDogs.filter(dog => !dog.checked_in)
  const checkedInDogs = todayDogs.filter(dog => dog.checked_in && !dog.checked_out)
  const checkedOutDogs = todayDogs.filter(dog => dog.checked_out)

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="mb-4">
            <BackButton href="/staff/admin-dashboard" />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
                Check-In / Check-Out Overview
              </h1>
              <p className="text-gray-600">View-only admin view of today's attendance</p>
            </div>
            <div className="flex items-center space-x-4">
              <CalendarIcon className="h-6 w-6 text-canine-gold" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-canine-navy to-blue-800 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Expected</p>
                  <p className="text-3xl font-bold mt-1">{todayDogs.length}</p>
                </div>
                <UserIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Not Checked In</p>
                  <p className="text-3xl font-bold mt-1">{notCheckedInDogs.length}</p>
                </div>
                <XCircleIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Currently In</p>
                  <p className="text-3xl font-bold mt-1">{checkedInDogs.length}</p>
                </div>
                <CheckCircleIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Checked Out</p>
                  <p className="text-3xl font-bold mt-1">{checkedOutDogs.length}</p>
                </div>
                <CheckCircleIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attendance data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Not Checked In */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-display font-bold text-orange-600 mb-4 flex items-center">
                <XCircleIcon className="h-6 w-6 mr-2" />
                Not Checked In ({notCheckedInDogs.length})
              </h2>
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                {notCheckedInDogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">All dogs checked in!</p>
                ) : (
                  notCheckedInDogs.map(dog => (
                    <div key={dog.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div className="flex items-start space-x-3">
                        {dog.photo_url && (
                          <img
                            src={dog.photo_url}
                            alt={dog.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{dog.name}</h3>
                          <p className="text-sm text-gray-600">{dog.breed}</p>
                          <p className="text-sm text-gray-600">
                            Owner: {dog.owner?.first_name} {dog.owner?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{dog.owner?.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Currently In */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-display font-bold text-green-600 mb-4 flex items-center">
                <CheckCircleIcon className="h-6 w-6 mr-2" />
                Currently In ({checkedInDogs.length})
              </h2>
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                {checkedInDogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No dogs currently in</p>
                ) : (
                  checkedInDogs.map(dog => (
                    <div key={dog.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-start space-x-3">
                        {dog.photo_url && (
                          <img
                            src={dog.photo_url}
                            alt={dog.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{dog.name}</h3>
                          <p className="text-sm text-gray-600">{dog.breed}</p>
                          <p className="text-sm text-gray-600">
                            Owner: {dog.owner?.first_name} {dog.owner?.last_name}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs text-gray-700">
                              <ClockIcon className="h-4 w-4 mr-1 text-green-600" />
                              In: {formatTime(dog.checked_in_at)}
                            </div>
                            {dog.dropped_off_by && (
                              <p className="text-xs text-gray-700">
                                By: {dog.dropped_off_by}
                              </p>
                            )}
                            {dog.checked_in_by_staff && (
                              <p className="text-xs text-gray-600">
                                Staff: {dog.checked_in_by_staff.first_name} {dog.checked_in_by_staff.last_name}
                              </p>
                            )}
                            {/* Meal indicators */}
                            {(dog.needs_breakfast || dog.needs_lunch || dog.needs_dinner) && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {dog.needs_breakfast && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${dog.breakfast_completed ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                    🍳 Breakfast {dog.breakfast_completed ? '✓' : ''}
                                  </span>
                                )}
                                {dog.needs_lunch && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${dog.lunch_completed ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                    🍱 Lunch {dog.lunch_completed ? '✓' : ''}
                                  </span>
                                )}
                                {dog.needs_dinner && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${dog.dinner_completed ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                    🍽️ Dinner {dog.dinner_completed ? '✓' : ''}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Checked Out */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-display font-bold text-purple-600 mb-4 flex items-center">
                <CheckCircleIcon className="h-6 w-6 mr-2" />
                Checked Out ({checkedOutDogs.length})
              </h2>
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                {checkedOutDogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No dogs checked out yet</p>
                ) : (
                  checkedOutDogs.map(dog => (
                    <div key={dog.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex items-start space-x-3">
                        {dog.photo_url && (
                          <img
                            src={dog.photo_url}
                            alt={dog.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{dog.name}</h3>
                          <p className="text-sm text-gray-600">{dog.breed}</p>
                          <p className="text-sm text-gray-600">
                            Owner: {dog.owner?.first_name} {dog.owner?.last_name}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs text-gray-700">
                              <ClockIcon className="h-4 w-4 mr-1 text-green-600" />
                              In: {formatTime(dog.checked_in_at)}
                            </div>
                            <div className="flex items-center text-xs text-gray-700">
                              <ClockIcon className="h-4 w-4 mr-1 text-purple-600" />
                              Out: {formatTime(dog.checked_out_at)}
                            </div>
                            {dog.picked_up_by && (
                              <p className="text-xs text-gray-700">
                                Picked up by: {dog.picked_up_by}
                              </p>
                            )}
                            {dog.checked_out_by_staff && (
                              <p className="text-xs text-gray-600">
                                Staff: {dog.checked_out_by_staff.first_name} {dog.checked_out_by_staff.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
