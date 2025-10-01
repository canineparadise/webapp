'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Dog {
  id: string
  name: string
}

interface Medication {
  id: string
  dog_id: string
  medication_name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export default function MedicationsPage() {
  const router = useRouter()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string>('')
  const [medications, setMedications] = useState<Medication[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: '',
  })

  useEffect(() => {
    checkAuth()
    fetchDogs()
  }, [])

  useEffect(() => {
    if (selectedDogId) {
      fetchMedications()
    }
  }, [selectedDogId, showHistory])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    }
  }

  const fetchDogs = async () => {
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('id, name')
        .order('name')

      if (error) throw error

      setDogs(data || [])
      if (data && data.length > 0) {
        setSelectedDogId(data[0].id)
      }
    } catch (error: any) {
      toast.error('Error loading dogs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMedications = async () => {
    try {
      let query = supabase
        .from('dog_medications')
        .select('*')
        .eq('dog_id', selectedDogId)
        .order('start_date', { ascending: false })

      if (!showHistory) {
        // Only show active medications
        query = query.or('end_date.is.null,end_date.gte.' + new Date().toISOString().split('T')[0])
      }

      const { data, error } = await query

      if (error) throw error

      setMedications(data || [])
    } catch (error: any) {
      toast.error('Error loading medications: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.medication_name || !formData.dosage || !formData.frequency || !formData.start_date) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const medData = {
        dog_id: selectedDogId,
        medication_name: formData.medication_name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        notes: formData.notes || null,
      }

      if (editingMed) {
        const { error } = await supabase
          .from('dog_medications')
          .update(medData)
          .eq('id', editingMed.id)

        if (error) throw error
        toast.success('Medication updated successfully')
      } else {
        const { error } = await supabase
          .from('dog_medications')
          .insert(medData)

        if (error) throw error
        toast.success('Medication added successfully')
      }

      setFormData({
        medication_name: '',
        dosage: '',
        frequency: '',
        start_date: '',
        end_date: '',
        notes: '',
      })
      setShowAddForm(false)
      setEditingMed(null)
      fetchMedications()
    } catch (error: any) {
      toast.error('Error saving medication: ' + error.message)
    }
  }

  const handleEdit = (med: Medication) => {
    setEditingMed(med)
    setFormData({
      medication_name: med.medication_name,
      dosage: med.dosage,
      frequency: med.frequency,
      start_date: med.start_date,
      end_date: med.end_date || '',
      notes: med.notes || '',
    })
    setShowAddForm(true)
  }

  const handleEndMedication = async (medId: string) => {
    if (!confirm('End this medication today?')) return

    try {
      const { error } = await supabase
        .from('dog_medications')
        .update({ end_date: new Date().toISOString().split('T')[0] })
        .eq('id', medId)

      if (error) throw error
      toast.success('Medication ended')
      fetchMedications()
    } catch (error: any) {
      toast.error('Error ending medication: ' + error.message)
    }
  }

  const handleDelete = async (medId: string) => {
    if (!confirm('Delete this medication record permanently?')) return

    try {
      const { error } = await supabase
        .from('dog_medications')
        .delete()
        .eq('id', medId)

      if (error) throw error
      toast.success('Medication deleted')
      fetchMedications()
    } catch (error: any) {
      toast.error('Error deleting medication: ' + error.message)
    }
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingMed(null)
    setFormData({
      medication_name: '',
      dosage: '',
      frequency: '',
      start_date: '',
      end_date: '',
      notes: '',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canine-cream flex items-center justify-center">
        <div className="text-canine-navy text-xl">Loading...</div>
      </div>
    )
  }

  const selectedDog = dogs.find(d => d.id === selectedDogId)
  const activeMeds = medications.filter(m => m.is_active)
  const inactiveMeds = medications.filter(m => !m.is_active)

  return (
    <div className="min-h-screen bg-canine-cream py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
            Medication Management
          </h1>
          <p className="text-gray-600">
            Track current and historical medications for your dogs
          </p>
        </div>

        {dogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">You need to add a dog first</p>
            <button
              onClick={() => router.push('/dashboard/add-dog')}
              className="btn-primary"
            >
              Add Your First Dog
            </button>
          </div>
        ) : (
          <>
            {/* Dog Selector */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Dog
              </label>
              <select
                value={selectedDogId}
                onChange={(e) => setSelectedDogId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
              >
                {dogs.map(dog => (
                  <option key={dog.id} value={dog.id}>{dog.name}</option>
                ))}
              </select>
            </div>

            {/* Add Medication Button */}
            {!showAddForm && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Medication
                </button>
              </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">
                  {editingMed ? 'Edit Medication' : 'Add New Medication'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      value={formData.medication_name}
                      onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Apoquel, Rimadyl"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="e.g., 10mg, 1 tablet"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency *
                      </label>
                      <input
                        type="text"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="e.g., Twice daily, Once daily"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date (leave blank if ongoing)
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary">
                      {editingMed ? 'Update Medication' : 'Add Medication'}
                    </button>
                    <button type="button" onClick={cancelForm} className="btn-outline">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Active Medications */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">
                Active Medications for {selectedDog?.name}
              </h2>

              {activeMeds.length === 0 ? (
                <p className="text-gray-500 italic">No active medications</p>
              ) : (
                <div className="space-y-4">
                  {activeMeds.map(med => (
                    <div key={med.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-canine-navy">
                            {med.medication_name}
                          </h3>
                          <p className="text-gray-600">
                            {med.dosage} • {med.frequency}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(med)}
                            className="text-canine-gold hover:text-canine-navy"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEndMedication(med.id)}
                            className="text-red-500 hover:text-red-700"
                            title="End medication"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Started: {new Date(med.start_date).toLocaleDateString()}</p>
                        {med.end_date && (
                          <p>Ends: {new Date(med.end_date).toLocaleDateString()}</p>
                        )}
                        {med.notes && (
                          <p className="mt-2 text-gray-600">{med.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-canine-gold hover:text-canine-navy font-medium"
              >
                {showHistory ? '← Hide History' : 'View Medication History →'}
              </button>
            </div>

            {/* Medication History */}
            {showHistory && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">
                  Medication History for {selectedDog?.name}
                </h2>

                {inactiveMeds.length === 0 ? (
                  <p className="text-gray-500 italic">No historical medications</p>
                ) : (
                  <div className="space-y-4">
                    {inactiveMeds.map(med => (
                      <div key={med.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-700">
                              {med.medication_name}
                            </h3>
                            <p className="text-gray-600">
                              {med.dosage} • {med.frequency}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Delete permanently"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>Started: {new Date(med.start_date).toLocaleDateString()}</p>
                          <p>Ended: {med.end_date ? new Date(med.end_date).toLocaleDateString() : 'N/A'}</p>
                          {med.notes && (
                            <p className="mt-2 text-gray-600">{med.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
