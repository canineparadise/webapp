'use client'

import { useState, useEffect } from 'react'
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
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

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

export default function StaffDashboard() {
  const router = useRouter()
  const [staffName, setStaffName] = useState('Staff')
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])

  // Dashboard data
  const [playGroups, setPlayGroups] = useState<PlayGroup[]>([])
  const [unassignedDogs, setUnassignedDogs] = useState<Dog[]>([])
  const [medicationsToday, setMedicationsToday] = useState<Medication[]>([])
  const [totalDogsToday, setTotalDogsToday] = useState(0)

  // Modal states
  const [showDogModal, setShowDogModal] = useState(false)
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  const [showMedicationsModal, setShowMedicationsModal] = useState(false)

  useEffect(() => {
    fetchStaffProfile()
    fetchTodayData()
  }, [currentDate])

  const fetchStaffProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
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
      // Get today's bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('dog_ids')
        .eq('booking_date', currentDate)
        .eq('status', 'confirmed')

      const todayDogIds = bookingsData?.flatMap(b => b.dog_ids) || []
      setTotalDogsToday(todayDogIds.length)

      if (todayDogIds.length === 0) {
        setPlayGroups([])
        setUnassignedDogs([])
        setMedicationsToday([])
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
      }).filter(group => group.dogs.length > 0) // Only show groups with dogs present today

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

          {/* Quick Stats & Date */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white font-semibold outline-none focus:border-canine-gold"
              />
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                <p className="text-sm text-canine-sky">Dogs Today</p>
                <p className="text-3xl font-bold">{totalDogsToday}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                <p className="text-sm text-canine-sky">Play Groups</p>
                <p className="text-3xl font-bold">{playGroups.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                <p className="text-sm text-canine-sky">Medications</p>
                <p className="text-3xl font-bold">{medicationsToday.length}</p>
              </div>
            </div>
            {medicationsToday.length > 0 && (
              <button
                onClick={() => setShowMedicationsModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all animate-pulse"
              >
                <BeakerIcon className="h-5 w-5" />
                <span>View Medications ({medicationsToday.length})</span>
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {totalDogsToday === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center border-2 border-canine-gold/20">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-canine-navy mb-2">No Dogs Scheduled</h2>
            <p className="text-gray-600">No dogs are booked for {new Date(currentDate).toLocaleDateString()}</p>
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
                    {group.dogs.map((dog) => (
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
                              {dog.owner?.first_name} {dog.owner?.last_name}
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
                    ))}
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
                    {unassignedDogs.map((dog) => (
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
                              {dog.owner?.first_name} {dog.owner?.last_name}
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
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
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
                      <p className="font-bold text-xl text-red-900">{selectedDog.owner?.first_name} {selectedDog.owner?.last_name}</p>
                      <p className="font-bold text-2xl text-red-900 mt-2">{selectedDog.owner?.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedDog.owner?.email}</p>
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
                          <p className="font-semibold text-orange-800 mb-1">⚠️ Medical Conditions</p>
                          <p className="text-gray-900 text-lg">{selectedDog.medical_conditions}</p>
                        </div>
                      )}
                      {selectedDog.medications && (
                        <div className="bg-white rounded-lg p-4">
                          <p className="font-semibold text-orange-800 mb-1">💊 Medications</p>
                          <p className="text-gray-900 text-lg">{selectedDog.medications}</p>
                        </div>
                      )}
                      {selectedDog.allergies && (
                        <div className="bg-white rounded-lg p-4">
                          <p className="font-semibold text-orange-800 mb-1">🚨 Allergies</p>
                          <p className="text-gray-900 text-lg">{selectedDog.allergies}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {(selectedDog.dietary_requirements || selectedDog.behavioral_notes || selectedDog.special_instructions) && (
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300">
                    <h3 className="font-bold text-xl mb-4 text-blue-900">📋 Important Information</h3>
                    <div className="space-y-3">
                      {selectedDog.dietary_requirements && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-semibold text-blue-800 text-sm mb-1">🍖 Dietary Requirements</p>
                          <p className="text-gray-700">{selectedDog.dietary_requirements}</p>
                        </div>
                      )}
                      {selectedDog.behavioral_notes && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-semibold text-blue-800 text-sm mb-1">🐕 Behavioral Notes</p>
                          <p className="text-gray-700">{selectedDog.behavioral_notes}</p>
                        </div>
                      )}
                      {selectedDog.special_instructions && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-semibold text-blue-800 text-sm mb-1">⭐ Special Instructions</p>
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
                      {selectedDog.photo_permission ? '📸 Photo Permission Granted' : '🚫 No Photo Permission - Do Not Photograph'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medications Modal */}
      <AnimatePresence>
        {showMedicationsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMedicationsModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-3xl z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BeakerIcon className="h-8 w-8" />
                    <h2 className="text-3xl font-display font-bold">Today's Medications</h2>
                  </div>
                  <button
                    onClick={() => setShowMedicationsModal(false)}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-4">
                {medicationsToday.map((med) => (
                  <div key={med.id} className="bg-orange-50 rounded-xl p-6 border-2 border-orange-300">
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
                        <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Important Notes</p>
                        <p className="text-gray-700">{med.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
