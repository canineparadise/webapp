'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface RecurringTemplate {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
}

interface GeneratedSlot {
  id: string
  assessment_date: string
  start_time: string
  end_time: string
  is_available: boolean
  booked_by_user_id: string | null
  created_at: string
  booked_by?: {
    first_name: string
    last_name: string
    email: string
  }
  bookings?: {
    id: string
    dog: {
      name: string
    }
  }[]
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export default function AssessmentSlots() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([])
  const [generatedSlots, setGeneratedSlots] = useState<GeneratedSlot[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Form state for new recurring template
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(5) // Default to Friday
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('12:00')

  useEffect(() => {
    checkAdminAuth()
    fetchData()
  }, [])

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

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchRecurringTemplates(), fetchGeneratedSlots()])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load assessment slot data')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecurringTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_recurring_slots')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      setRecurringTemplates(data || [])
    } catch (error) {
      console.error('Error fetching recurring templates:', error)
      throw error
    }
  }

  const fetchGeneratedSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_slots')
        .select(`
          *,
          booked_by:profiles!assessment_slots_booked_by_user_id_fkey (
            first_name,
            last_name,
            email
          ),
          bookings:assessment_bookings (
            id,
            dog:dogs (
              name
            )
          )
        `)
        .gte('assessment_date', new Date().toISOString().split('T')[0])
        .order('assessment_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      setGeneratedSlots(data || [])
    } catch (error) {
      console.error('Error fetching generated slots:', error)
      throw error
    }
  }

  const handleCreateRecurringTemplate = async () => {
    // Validation
    if (startTime >= endTime) {
      toast.error('End time must be after start time')
      return
    }

    try {
      const { error } = await supabase
        .from('assessment_recurring_slots')
        .insert({
          day_of_week: selectedDayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_active: true,
        })

      if (error) throw error

      toast.success('Recurring template created successfully')

      // Generate slots from all templates
      await generateSlotsFromTemplates()

      // Reset form and close modal
      setShowCreateModal(false)
      setSelectedDayOfWeek(5)
      setStartTime('10:00')
      setEndTime('12:00')

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error creating recurring template:', error)
      toast.error('Failed to create recurring template')
    }
  }

  const handleDeleteRecurringTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this recurring template? Future slots will no longer be generated from this template. Existing bookings will remain.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('assessment_recurring_slots')
        .delete()
        .eq('id', templateId)

      if (error) throw error

      toast.success('Recurring template deleted successfully')
      await fetchData()
    } catch (error) {
      console.error('Error deleting recurring template:', error)
      toast.error('Failed to delete recurring template')
    }
  }

  const handleToggleTemplateActive = async (templateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('assessment_recurring_slots')
        .update({ is_active: !currentStatus })
        .eq('id', templateId)

      if (error) throw error

      toast.success(currentStatus ? 'Template deactivated' : 'Template activated')

      // Regenerate slots if we activated a template
      if (!currentStatus) {
        await generateSlotsFromTemplates()
      }

      await fetchData()
    } catch (error) {
      console.error('Error toggling template:', error)
      toast.error('Failed to update template')
    }
  }

  const generateSlotsFromTemplates = async () => {
    setGenerating(true)
    try {
      // Call the SQL function to generate slots for next 4 weeks
      const { data, error } = await supabase.rpc('generate_assessment_slots_from_recurring', {
        weeks_ahead: 4
      })

      if (error) throw error

      const slotsCreated = data || 0

      if (slotsCreated > 0) {
        toast.success(`Generated ${slotsCreated} new assessment slot(s) for the next 4 weeks`)
      } else {
        toast.success('All slots are up to date')
      }

      await fetchGeneratedSlots()
    } catch (error) {
      console.error('Error generating slots:', error)
      toast.error('Failed to generate slots from templates')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteGeneratedSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this generated slot? This will cancel any bookings.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('assessment_slots')
        .delete()
        .eq('id', slotId)

      if (error) throw error

      toast.success('Slot deleted successfully')
      await fetchGeneratedSlots()
    } catch (error) {
      console.error('Error deleting slot:', error)
      toast.error('Failed to delete slot')
    }
  }

  const groupSlotsByDate = () => {
    const grouped: Record<string, GeneratedSlot[]> = {}
    generatedSlots.forEach(slot => {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
                Assessment Slot Management
              </h1>
              <p className="text-gray-600">Create recurring templates and auto-generate assessment slots (1 user per slot)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generateSlotsFromTemplates}
                disabled={generating}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Generating...' : 'Regenerate Slots'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-6 py-3 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-colors font-semibold"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Recurring Template
              </button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessment slot data...</p>
          </div>
        ) : (
          <>
            {/* SECTION 1: Recurring Schedule Templates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">
                    Recurring Schedule Templates
                  </h2>
                  <p className="text-sm text-gray-600">
                    These templates automatically generate assessment slots for the next 4 weeks (1 user per slot)
                  </p>
                </div>
              </div>

              {recurringTemplates.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                  <CalendarIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-xl text-gray-600 mb-2">No recurring templates configured</p>
                  <p className="text-gray-500">Create your first template to auto-generate assessment slots</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recurringTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`border-2 rounded-xl p-5 ${
                        template.is_active
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="h-5 w-5 text-canine-gold" />
                            <span className="font-bold text-lg text-canine-navy">
                              Every {DAYS_OF_WEEK.find(d => d.value === template.day_of_week)?.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-medium">
                              {template.start_time.slice(0, 5)} - {template.end_time.slice(0, 5)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-blue-600 mt-2 font-semibold">
                            <UserIcon className="h-4 w-4" />
                            <span>1 user per slot</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleTemplateActive(template.id, template.is_active)}
                          className={`p-1 rounded ${
                            template.is_active
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {template.is_active ? (
                            <CheckCircleIcon className="h-6 w-6" />
                          ) : (
                            <XCircleIcon className="h-6 w-6" />
                          )}
                        </button>
                      </div>

                      <div className={`text-xs font-semibold mb-3 ${
                        template.is_active ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {template.is_active ? 'ACTIVE - Auto-generating slots' : 'INACTIVE - Not generating slots'}
                      </div>

                      <button
                        onClick={() => handleDeleteRecurringTemplate(template.id)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Template
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* SECTION 2: Auto-Generated Slots (Read-Only) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-canine-navy">
                    Auto-Generated Assessment Slots
                  </h2>
                  <p className="text-sm text-gray-600">
                    Read-only view of slots generated from recurring templates (next 4 weeks, 1 user per slot)
                  </p>
                </div>
              </div>

              {Object.keys(groupedSlots).length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                  <CalendarIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-xl text-gray-600 mb-2">No generated slots available</p>
                  <p className="text-gray-500">Create recurring templates above and click "Regenerate Slots"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                    <div key={date} className="border-2 border-gray-100 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        {new Date(date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dateSlots.map((slot) => {
                          const isBooked = slot.booked_by_user_id !== null

                          return (
                            <div
                              key={slot.id}
                              className={`border-2 rounded-xl p-4 ${
                                isBooked
                                  ? 'border-red-300 bg-red-50'
                                  : slot.is_available
                                  ? 'border-green-300 bg-green-50'
                                  : 'border-gray-300 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <ClockIcon className="h-5 w-5 text-blue-600" />
                                  <span className="font-bold text-lg text-canine-navy">
                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                  </span>
                                </div>
                                {isBooked ? (
                                  <XCircleIcon className="h-6 w-6 text-red-600" />
                                ) : slot.is_available ? (
                                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                ) : (
                                  <XCircleIcon className="h-6 w-6 text-gray-500" />
                                )}
                              </div>

                              <div className="mb-3">
                                <div className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                                  isBooked ? 'text-red-700' : 'text-green-700'
                                }`}>
                                  <UserIcon className="h-4 w-4" />
                                  <span>{isBooked ? 'BOOKED' : 'AVAILABLE'}</span>
                                </div>
                              </div>

                              {isBooked && slot.booked_by && (
                                <div className="mb-3 space-y-1 bg-white rounded-lg p-3 border border-red-200">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Booked by:</p>
                                  <p className="text-sm text-gray-900 font-medium">
                                    {slot.booked_by.first_name} {slot.booked_by.last_name}
                                  </p>
                                  <p className="text-xs text-gray-600">{slot.booked_by.email}</p>

                                  {slot.bookings && slot.bookings.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-red-200">
                                      <p className="text-xs font-semibold text-gray-700 mb-1">Dogs:</p>
                                      {slot.bookings.map((booking: any) => (
                                        <p key={booking.id} className="text-xs text-gray-600 pl-2">
                                          • {booking.dog.name}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              <button
                                onClick={() => handleDeleteGeneratedSlot(slot.id)}
                                className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete Slot
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Create Recurring Template Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full"
              >
                <h2 className="text-3xl font-display font-bold text-canine-navy mb-6">
                  Create Recurring Template
                </h2>

                <div className="space-y-5">
                  {/* Day of Week Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Day of Week
                    </label>
                    <select
                      value={selectedDayOfWeek}
                      onChange={(e) => setSelectedDayOfWeek(parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Slots will be automatically generated every {DAYS_OF_WEEK.find(d => d.value === selectedDayOfWeek)?.label}
                    </p>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                    />
                  </div>

                  {/* Info Banner */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          1 User Per Slot
                        </p>
                        <p className="text-xs text-blue-700">
                          Each time slot can be booked by exactly one user, regardless of how many dogs they bring for assessment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">Template Preview:</p>
                    <p className="text-sm text-purple-800">
                      Every <span className="font-bold">{DAYS_OF_WEEK.find(d => d.value === selectedDayOfWeek)?.label}</span> from{' '}
                      <span className="font-bold">{startTime}</span> to <span className="font-bold">{endTime}</span>{' '}
                      <span className="font-bold">(1 user per slot)</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      onClick={handleCreateRecurringTemplate}
                      className="flex-1 px-6 py-3 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-colors font-semibold"
                    >
                      Create Template
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateModal(false)
                        setSelectedDayOfWeek(5)
                        setStartTime('10:00')
                        setEndTime('12:00')
                      }}
                      className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
