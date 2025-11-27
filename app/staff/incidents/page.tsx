'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import BackButton from '@/components/BackButton'
import {
  ExclamationTriangleIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface Incident {
  id: string
  incident_type: string
  severity: string
  title: string
  description: string
  dog_id: string
  occurred_at: string
  location: string
  action_taken: string
  vet_notified: boolean
  owner_notified: boolean
  requires_follow_up: boolean
  resolved: boolean
  created_at: string
  dog?: {
    name: string
    owner: {
      first_name: string
      last_name: string
    }
  }
}

interface Dog {
  id: string
  name: string
  breed: string
  owner: {
    first_name: string
    last_name: string
  }
}

export default function StaffIncidents() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [dogs, setDogs] = useState<Dog[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    incident_type: 'behavioral',
    severity: 'minor',
    title: '',
    description: '',
    dog_id: '',
    occurred_at: new Date().toISOString().slice(0, 16),
    location: '',
    action_taken: '',
    vet_notified: false,
    owner_notified: false,
    requires_follow_up: false,
  })

  useEffect(() => {
    checkAuth()
    fetchIncidents()
    fetchDogs()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/staff/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'staff' && profile?.role !== 'admin') {
      router.push('/')
    }
  }

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          dog:dogs!incidents_dog_id_fkey (
            name,
            owner:profiles!dogs_owner_id_fkey (first_name, last_name)
          )
        `)
        .order('occurred_at', { ascending: false })

      if (error) throw error
      setIncidents(data || [])
    } catch (error) {
      console.error('Error fetching incidents:', error)
      toast.error('Failed to load incidents')
    } finally {
      setLoading(false)
    }
  }

  const fetchDogs = async () => {
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select(`
          id,
          name,
          breed,
          owner:profiles!dogs_owner_id_fkey (first_name, last_name)
        `)
        .eq('is_approved', true)
        .order('name')

      if (error) throw error
      // Map to handle owner as array
      const mappedDogs = (data || []).map((dog: any) => ({
        ...dog,
        owner: Array.isArray(dog.owner) ? dog.owner[0] : dog.owner
      }))
      setDogs(mappedDogs)
    } catch (error) {
      console.error('Error fetching dogs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.dog_id) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('incidents')
        .insert({
          ...formData,
          reported_by_staff_id: user?.id,
        })

      if (error) throw error

      toast.success('Incident reported successfully')
      setShowAddModal(false)
      setFormData({
        incident_type: 'behavioral',
        severity: 'minor',
        title: '',
        description: '',
        dog_id: '',
        occurred_at: new Date().toISOString().slice(0, 16),
        location: '',
        action_taken: '',
        vet_notified: false,
        owner_notified: false,
        requires_follow_up: false,
      })
      fetchIncidents()
    } catch (error) {
      console.error('Error creating incident:', error)
      toast.error('Failed to create incident report')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800'
      case 'moderate': return 'bg-orange-100 text-orange-800'
      case 'serious': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canine-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-canine-navy"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canine-cream">
      {/* Header */}
      <header className="bg-gradient-to-r from-canine-navy to-[#2a5a7a] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2">
                <BackButton href="/staff/dashboard" />
              </div>
              <h1 className="text-3xl font-display font-bold">Incident Reports</h1>
              <p className="text-canine-sky mt-1">Track and manage daycare incidents</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-canine-gold text-canine-navy px-6 py-3 rounded-xl font-semibold hover:bg-canine-light-gold transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Report Incident
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {incidents.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-canine-navy mb-2">No Incidents Reported</h3>
            <p className="text-gray-600">All clear! No incidents have been reported today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-canine-navy">{incident.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {incident.incident_type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{incident.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>🐕 {incident.dog?.name}</span>
                      <span>📍 {incident.location || 'N/A'}</span>
                      <span>🕒 {new Date(incident.occurred_at).toLocaleString('en-GB')}</span>
                    </div>
                  </div>
                  {incident.resolved && (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  )}
                </div>

                {incident.action_taken && (
                  <div className="bg-canine-sky/20 rounded-lg p-4 mb-3">
                    <p className="text-sm font-semibold text-canine-navy mb-1">Action Taken:</p>
                    <p className="text-sm text-gray-700">{incident.action_taken}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  {incident.vet_notified && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      Vet Notified
                    </span>
                  )}
                  {incident.owner_notified && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      Owner Notified
                    </span>
                  )}
                  {incident.requires_follow_up && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <ClockIcon className="h-4 w-4" />
                      Requires Follow-up
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-canine-navy">Report Incident</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">
                    Incident Type *
                  </label>
                  <select
                    value={formData.incident_type}
                    onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-canine-gold outline-none"
                    required
                  >
                    <option value="behavioral">Behavioral</option>
                    <option value="injury">Injury</option>
                    <option value="illness">Illness</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-canine-gold outline-none"
                    required
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="serious">Serious</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-canine-navy mb-2">
                  Dog *
                </label>
                <select
                  value={formData.dog_id}
                  onChange={(e) => setFormData({ ...formData, dog_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-canine-gold outline-none"
                  required
                >
                  <option value="">Select a dog...</option>
                  {dogs.map((dog) => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name} - {dog.owner?.first_name} {dog.owner?.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-canine-navy mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-canine-gold outline-none"
                  placeholder="Brief summary..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-canine-navy mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-canine-gold outline-none h-32"
                  placeholder="Detailed description of what happened..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">
                    Occurred At *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.occurred_at}
                    onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-canine-gold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-canine-navy mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-canine-gold outline-none"
                    placeholder="e.g., Indoor play area"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-canine-navy mb-2">
                  Action Taken
                </label>
                <textarea
                  value={formData.action_taken}
                  onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-canine-gold outline-none h-24"
                  placeholder="What actions were taken..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.vet_notified}
                    onChange={(e) => setFormData({ ...formData, vet_notified: e.target.checked })}
                    className="w-4 h-4 text-canine-gold focus:ring-canine-gold"
                  />
                  <span className="text-sm font-semibold text-canine-navy">Vet Notified</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.owner_notified}
                    onChange={(e) => setFormData({ ...formData, owner_notified: e.target.checked })}
                    className="w-4 h-4 text-canine-gold focus:ring-canine-gold"
                  />
                  <span className="text-sm font-semibold text-canine-navy">Owner Notified</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.requires_follow_up}
                    onChange={(e) => setFormData({ ...formData, requires_follow_up: e.target.checked })}
                    className="w-4 h-4 text-canine-gold focus:ring-canine-gold"
                  />
                  <span className="text-sm font-semibold text-canine-navy">Requires Follow-up</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-canine-navy text-white font-semibold hover:bg-canine-navy/90 transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
