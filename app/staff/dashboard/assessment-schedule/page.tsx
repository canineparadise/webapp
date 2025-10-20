'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface AssessmentSlot {
  id: string
  assessment_date: string
  start_time: string
  end_time: string
  max_dogs: number
  booked_count: number
  bookings: {
    id: string
    dog: {
      name: string
      breed: string
      photo_url?: string
      owner: {
        first_name: string
        last_name: string
        phone: string
        email: string
      }
    }
  }[]
}

export default function StaffAssessmentSchedule() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<AssessmentSlot[]>([])

  useEffect(() => {
    checkStaffAuth()
    fetchSlots()
  }, [])

  const checkStaffAuth = async () => {
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
    }
  }

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('assessment_slots')
        .select(`
          *,
          bookings:assessment_bookings (
            id,
            dog:dogs (
              name,
              breed,
              photo_url,
              owner:profiles!dogs_owner_id_fkey (
                first_name,
                last_name,
                phone,
                email
              )
            )
          )
        `)
        .gte('assessment_date', today)
        .order('assessment_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      setSlots(data || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
      toast.error('Failed to load assessment schedule')
    } finally {
      setLoading(false)
    }
  }

  const groupSlotsByDate = () => {
    const grouped: Record<string, AssessmentSlot[]> = {}
    slots.forEach(slot => {
      if (!grouped[slot.assessment_date]) {
        grouped[slot.assessment_date] = []
      }
      grouped[slot.assessment_date].push(slot)
    })
    return grouped
  }

  const groupedSlots = groupSlotsByDate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
            Assessment Schedule
          </h1>
          <p className="text-gray-600">View upcoming assessment bookings</p>
        </motion.div>

        {/* Slots List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schedule...</p>
          </div>
        ) : Object.keys(groupedSlots).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <CalendarIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">No upcoming assessments</p>
            <p className="text-gray-500">Check back later</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, dateSlots]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">
                  {new Date(date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>

                <div className="space-y-4">
                  {dateSlots.map(slot => (
                    <div
                      key={slot.id}
                      className="border-2 border-canine-gold/30 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-6 w-6 text-canine-gold" />
                          <span className="font-bold text-xl text-canine-navy">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <span className="px-4 py-2 bg-canine-gold/20 text-canine-navy rounded-lg font-semibold">
                          {slot.booked_count} / {slot.max_dogs} booked
                        </span>
                      </div>

                      {slot.bookings && slot.bookings.length > 0 ? (
                        <div className="space-y-3">
                          {slot.bookings.map((booking: any) => (
                            <div
                              key={booking.id}
                              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                            >
                              {booking.dog.photo_url ? (
                                <img
                                  src={booking.dog.photo_url}
                                  alt={booking.dog.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-canine-sky flex items-center justify-center text-3xl">
                                  🐕
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">
                                  {booking.dog.name}
                                </h3>
                                <p className="text-sm text-gray-600">{booking.dog.breed}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-700">
                                  <div className="flex items-center space-x-1">
                                    <UserIcon className="h-4 w-4" />
                                    <span>
                                      {booking.dog.owner.first_name} {booking.dog.owner.last_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <PhoneIcon className="h-4 w-4" />
                                    <span>{booking.dog.owner.phone}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No bookings for this slot
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
