'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function EditDogPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    breed: '',
    age_years: '',
    age_months: '',
    gender: 'male',
    size: 'medium',
    weight_kg: '',
    color: '',
    neutered: false,
    microchipped: false,
    photo_url: '',

    // Health
    vaccinated: false,
    vaccination_expiry: '',
    flea_treatment: false,
    flea_treatment_date: '',
    worming_treatment: false,
    worming_treatment_date: '',
    heartworm_prevention: false,
    heartworm_prevention_date: '',
    medical_conditions: '',
    current_medications: [] as { name: string; dosage: string; frequency: string }[],
    medication_requirements: '',
    allergies: '',
    can_be_given_treats: true,

    // Behavioral
    resource_guarding: false,
    separation_anxiety: false,
    excessive_barking: false,
    leash_pulling: false,
    house_trained: true,
    crate_trained: false,
    aggression_triggers: '',
    behavioral_challenges: '',
    training_needs: '',

    // Social
    good_with_dogs: true,
    good_with_cats: true,
    good_with_children: true,
    good_with_strangers: true,
    play_style: '',

    // Safety
    escape_artist: false,
    fence_jumper: false,
    recall_reliability: 'good',

    // Emergency
    vet_name: '',
    vet_phone: '',
    vet_address: '',
    emergency_medical_consent: false,
    max_vet_cost_approval: '',

    // Care
    feeding_schedule: '',
    special_requirements: '',
    favorite_activities: '',
  })

  useEffect(() => {
    checkAuthAndLoadDog()
  }, [params.id])

  const checkAuthAndLoadDog = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Load dog data
      const { data: dogData, error: dogError } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', params.id)
        .eq('owner_id', user.id)
        .single()

      if (dogError || !dogData) {
        toast.error('Dog not found')
        router.push('/dashboard')
        return
      }

      // Populate form with existing data
      setFormData({
        name: dogData.name || '',
        breed: dogData.breed || '',
        age_years: dogData.age_years?.toString() || '',
        age_months: dogData.age_months?.toString() || '',
        gender: dogData.gender || 'male',
        size: dogData.size || 'medium',
        weight_kg: dogData.weight_kg?.toString() || '',
        color: dogData.color || '',
        neutered: dogData.neutered || false,
        microchipped: dogData.microchipped || false,
        photo_url: dogData.photo_url || '',

        vaccinated: dogData.vaccinated || false,
        vaccination_expiry: dogData.vaccination_expiry || '',
        flea_treatment: dogData.flea_treatment || false,
        flea_treatment_date: dogData.flea_treatment_date || '',
        worming_treatment: dogData.worming_treatment || false,
        worming_treatment_date: dogData.worming_treatment_date || '',
        heartworm_prevention: dogData.heartworm_prevention || false,
        heartworm_prevention_date: dogData.heartworm_prevention_date || '',
        medical_conditions: dogData.medical_conditions || '',
        current_medications: dogData.current_medications || [],
        medication_requirements: dogData.medication_requirements || '',
        allergies: dogData.allergies || '',
        can_be_given_treats: dogData.can_be_given_treats !== false,

        resource_guarding: dogData.resource_guarding || false,
        separation_anxiety: dogData.separation_anxiety || false,
        excessive_barking: dogData.excessive_barking || false,
        leash_pulling: dogData.leash_pulling || false,
        house_trained: dogData.house_trained !== false,
        crate_trained: dogData.crate_trained || false,
        aggression_triggers: dogData.aggression_triggers || '',
        behavioral_challenges: dogData.behavioral_challenges || '',
        training_needs: dogData.training_needs || '',

        good_with_dogs: dogData.good_with_dogs !== false,
        good_with_cats: dogData.good_with_cats !== false,
        good_with_children: dogData.good_with_children !== false,
        good_with_strangers: dogData.good_with_strangers !== false,
        play_style: dogData.play_style || '',

        escape_artist: dogData.escape_artist || false,
        fence_jumper: dogData.fence_jumper || false,
        recall_reliability: dogData.recall_reliability || 'good',

        vet_name: dogData.vet_name || '',
        vet_phone: dogData.vet_phone || '',
        vet_address: dogData.vet_address || '',
        emergency_medical_consent: dogData.emergency_medical_consent || false,
        max_vet_cost_approval: dogData.max_vet_cost_approval?.toString() || '',

        feeding_schedule: dogData.feeding_schedule || '',
        special_requirements: dogData.special_requirements || '',
        favorite_activities: dogData.favorite_activities || '',
      })

      setPhotoPreview(dogData.photo_url || '')
    } catch (error) {
      console.error('Error loading dog:', error)
      toast.error('Failed to load dog data')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Photo must be less than 10MB')
        return
      }
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const uploadPhoto = async (dogId: string) => {
    if (!photoFile) return formData.photo_url

    try {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${dogId}-${Date.now()}.${fileExt}`
      const filePath = `dog-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(filePath, photoFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Failed to upload photo')
      return formData.photo_url
    }
  }

  const addMedication = () => {
    setFormData({
      ...formData,
      current_medications: [
        ...formData.current_medications,
        { name: '', dosage: '', frequency: '' }
      ]
    })
  }

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = [...formData.current_medications]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, current_medications: updated })
  }

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      current_medications: formData.current_medications.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Upload photo if changed
      let photoUrl = formData.photo_url
      if (photoFile) {
        photoUrl = await uploadPhoto(params.id as string)
      }

      // Update dog in database
      const { error: updateError } = await supabase
        .from('dogs')
        .update({
          name: formData.name,
          breed: formData.breed,
          age_years: parseInt(formData.age_years),
          age_months: parseInt(formData.age_months || '0'),
          gender: formData.gender,
          size: formData.size,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          color: formData.color,
          neutered: formData.neutered,
          microchipped: formData.microchipped,
          photo_url: photoUrl,

          vaccinated: formData.vaccinated,
          vaccination_expiry: formData.vaccination_expiry || null,
          flea_treatment: formData.flea_treatment,
          flea_treatment_date: formData.flea_treatment_date || null,
          worming_treatment: formData.worming_treatment,
          worming_treatment_date: formData.worming_treatment_date || null,
          heartworm_prevention: formData.heartworm_prevention,
          heartworm_prevention_date: formData.heartworm_prevention_date || null,
          medical_conditions: formData.medical_conditions || null,
          current_medications: formData.current_medications.length > 0 ? formData.current_medications : null,
          medication_requirements: formData.medication_requirements || null,
          allergies: formData.allergies || null,
          can_be_given_treats: formData.can_be_given_treats,

          resource_guarding: formData.resource_guarding,
          separation_anxiety: formData.separation_anxiety,
          excessive_barking: formData.excessive_barking,
          leash_pulling: formData.leash_pulling,
          house_trained: formData.house_trained,
          crate_trained: formData.crate_trained,
          aggression_triggers: formData.aggression_triggers || null,
          behavioral_challenges: formData.behavioral_challenges || null,
          training_needs: formData.training_needs || null,

          good_with_dogs: formData.good_with_dogs,
          good_with_cats: formData.good_with_cats,
          good_with_children: formData.good_with_children,
          good_with_strangers: formData.good_with_strangers,
          play_style: formData.play_style || null,

          escape_artist: formData.escape_artist,
          fence_jumper: formData.fence_jumper,
          recall_reliability: formData.recall_reliability,

          vet_name: formData.vet_name,
          vet_phone: formData.vet_phone,
          vet_address: formData.vet_address || null,
          emergency_medical_consent: formData.emergency_medical_consent,
          max_vet_cost_approval: formData.max_vet_cost_approval ? parseFloat(formData.max_vet_cost_approval) : null,

          feeding_schedule: formData.feeding_schedule || null,
          special_requirements: formData.special_requirements || null,
          favorite_activities: formData.favorite_activities || null,

          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      toast.success('Profile updated successfully! 🎉')
      router.push(`/dashboard/dogs/${params.id}`)

    } catch (error: any) {
      console.error('Error updating dog:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const nextSection = () => setCurrentSection(currentSection + 1)
  const prevSection = () => setCurrentSection(currentSection - 1)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canine-cream to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-canine-gold border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  const sections = ['Basic Info', 'Health & Medical', 'Behavior & Social', 'Emergency & Care']

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <Link href={`/dashboard/dogs/${params.id}`} className="inline-flex items-center text-canine-gold hover:text-canine-navy mb-8 font-medium transition-colors group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-canine-navy to-blue-900 text-white p-8">
            <h1 className="text-4xl font-display font-bold mb-2">Edit {formData.name}'s Profile</h1>
            <p className="text-blue-200">Update your dog's information</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              {sections.map((section, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index <= currentSection ? 'bg-canine-gold text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < sections.length - 1 && (
                    <div className={`w-24 h-1 mx-2 ${
                      index < currentSection ? 'bg-canine-gold' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              {sections.map((section, index) => (
                <span key={index} className={index <= currentSection ? 'text-canine-gold font-semibold' : ''}>
                  {section}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">

            {/* Section 0: Basic Info */}
            {currentSection === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">Basic Information</h2>

                {/* Photo Upload */}
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-canine-gold/20 to-amber-100 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Dog" className="w-full h-full object-cover" />
                    ) : (
                      <CameraIcon className="h-12 w-12 text-canine-gold" />
                    )}
                  </div>
                  <div>
                    <label className="btn-primary cursor-pointer">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">Max 10MB</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Breed *</label>
                    <input
                      type="text"
                      required
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age (Years) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="25"
                      value={formData.age_years}
                      onChange={(e) => setFormData({ ...formData, age_years: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age (Months)</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={formData.age_months}
                      onChange={(e) => setFormData({ ...formData, age_months: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size *</label>
                    <select
                      required
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    >
                      <option value="toy">Toy (under 10 lbs)</option>
                      <option value="small">Small (10-25 lbs)</option>
                      <option value="medium">Medium (26-50 lbs)</option>
                      <option value="large">Large (51-100 lbs)</option>
                      <option value="giant">Giant (over 100 lbs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Black, Brown, White"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.neutered}
                      onChange={(e) => setFormData({ ...formData, neutered: e.target.checked })}
                      className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700 font-medium">{formData.gender === 'male' ? 'Neutered' : 'Spayed'}</span>
                  </label>

                  <label className="flex items-center bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.microchipped}
                      onChange={(e) => setFormData({ ...formData, microchipped: e.target.checked })}
                      className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700 font-medium">Microchipped</span>
                  </label>
                </div>
              </div>
            )}

            {/* Section 1: Health & Medical - Similar structure to add-dog form */}
            {currentSection === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">Health & Medical Information</h2>

                {/* Vaccination */}
                <div className="grid md:grid-cols-2 gap-6">
                  <label className="flex items-center bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.vaccinated}
                      onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                      className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700 font-medium">Up to Date on Vaccinations</span>
                  </label>

                  {formData.vaccinated && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vaccination Expiry Date</label>
                      <input
                        type="date"
                        value={formData.vaccination_expiry}
                        onChange={(e) => setFormData({ ...formData, vaccination_expiry: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Treatment checkboxes */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.flea_treatment}
                        onChange={(e) => setFormData({ ...formData, flea_treatment: e.target.checked })}
                        className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                      />
                      <span className="text-gray-700">Flea Treatment</span>
                    </label>
                    {formData.flea_treatment && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Flea Treatment Date</label>
                        <input
                          type="date"
                          value={formData.flea_treatment_date}
                          onChange={(e) => setFormData({ ...formData, flea_treatment_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.worming_treatment}
                        onChange={(e) => setFormData({ ...formData, worming_treatment: e.target.checked })}
                        className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                      />
                      <span className="text-gray-700">Worming Treatment</span>
                    </label>
                    {formData.worming_treatment && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Worming Treatment Date</label>
                        <input
                          type="date"
                          value={formData.worming_treatment_date}
                          onChange={(e) => setFormData({ ...formData, worming_treatment_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.heartworm_prevention}
                        onChange={(e) => setFormData({ ...formData, heartworm_prevention: e.target.checked })}
                        className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                      />
                      <span className="text-gray-700">Heartworm Prevention</span>
                    </label>
                    {formData.heartworm_prevention && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Heartworm Prevention Date</label>
                        <input
                          type="date"
                          value={formData.heartworm_prevention_date}
                          onChange={(e) => setFormData({ ...formData, heartworm_prevention_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                  <textarea
                    value={formData.medical_conditions}
                    onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="Any chronic conditions, past surgeries, etc."
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="Food allergies, environmental allergies, etc."
                  />
                </div>

                <label className="flex items-center bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={formData.can_be_given_treats}
                    onChange={(e) => setFormData({ ...formData, can_be_given_treats: e.target.checked })}
                    className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                  />
                  <span className="text-gray-700 font-medium">Can be given treats</span>
                </label>
              </div>
            )}

            {/* Section 2: Behavior & Social */}
            {currentSection === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">Behavior & Social</h2>

                {/* Behavioral Concerns */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Behavioral Concerns</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.resource_guarding}
                        onChange={(e) => setFormData({ ...formData, resource_guarding: e.target.checked })}
                        className="mr-3 text-amber-500 focus:ring-amber-500 rounded"
                      />
                      <span className="text-gray-700">Resource Guarding</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.separation_anxiety}
                        onChange={(e) => setFormData({ ...formData, separation_anxiety: e.target.checked })}
                        className="mr-3 text-amber-500 focus:ring-amber-500 rounded"
                      />
                      <span className="text-gray-700">Separation Anxiety</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.excessive_barking}
                        onChange={(e) => setFormData({ ...formData, excessive_barking: e.target.checked })}
                        className="mr-3 text-amber-500 focus:ring-amber-500 rounded"
                      />
                      <span className="text-gray-700">Excessive Barking</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.leash_pulling}
                        onChange={(e) => setFormData({ ...formData, leash_pulling: e.target.checked })}
                        className="mr-3 text-amber-500 focus:ring-amber-500 rounded"
                      />
                      <span className="text-gray-700">Leash Pulling</span>
                    </label>
                  </div>
                </div>

                {/* Social Behavior */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Social Behavior</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.good_with_dogs}
                        onChange={(e) => setFormData({ ...formData, good_with_dogs: e.target.checked })}
                        className="mr-3 text-green-500 focus:ring-green-500 rounded"
                      />
                      <span className="text-gray-700">Good with Dogs</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.good_with_cats}
                        onChange={(e) => setFormData({ ...formData, good_with_cats: e.target.checked })}
                        className="mr-3 text-green-500 focus:ring-green-500 rounded"
                      />
                      <span className="text-gray-700">Good with Cats</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.good_with_children}
                        onChange={(e) => setFormData({ ...formData, good_with_children: e.target.checked })}
                        className="mr-3 text-green-500 focus:ring-green-500 rounded"
                      />
                      <span className="text-gray-700">Good with Children</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.good_with_strangers}
                        onChange={(e) => setFormData({ ...formData, good_with_strangers: e.target.checked })}
                        className="mr-3 text-green-500 focus:ring-green-500 rounded"
                      />
                      <span className="text-gray-700">Good with Strangers</span>
                    </label>
                  </div>
                </div>

                {/* Training */}
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.house_trained}
                      onChange={(e) => setFormData({ ...formData, house_trained: e.target.checked })}
                      className="mr-3 text-blue-500 focus:ring-blue-500 rounded"
                    />
                    <span className="text-gray-700">House Trained</span>
                  </label>
                  <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.crate_trained}
                      onChange={(e) => setFormData({ ...formData, crate_trained: e.target.checked })}
                      className="mr-3 text-blue-500 focus:ring-blue-500 rounded"
                    />
                    <span className="text-gray-700">Crate Trained</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recall Reliability</label>
                  <select
                    value={formData.recall_reliability}
                    onChange={(e) => setFormData({ ...formData, recall_reliability: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="moderate">Moderate</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Play Style</label>
                  <input
                    type="text"
                    value={formData.play_style}
                    onChange={(e) => setFormData({ ...formData, play_style: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="e.g., Gentle, rough and tumble"
                  />
                </div>
              </div>
            )}

            {/* Section 3: Emergency & Care */}
            {currentSection === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-4">Emergency & Care Information</h2>

                {/* Vet Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vet Clinic Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.vet_name}
                      onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vet Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.vet_phone}
                      onChange={(e) => setFormData({ ...formData, vet_phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vet Address</label>
                  <input
                    type="text"
                    value={formData.vet_address}
                    onChange={(e) => setFormData({ ...formData, vet_address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                </div>

                <label className="flex items-center bg-red-50 p-4 rounded-lg cursor-pointer hover:bg-red-100 border border-red-200">
                  <input
                    type="checkbox"
                    checked={formData.emergency_medical_consent}
                    onChange={(e) => setFormData({ ...formData, emergency_medical_consent: e.target.checked })}
                    className="mr-3 text-red-500 focus:ring-red-500 rounded"
                  />
                  <span className="text-gray-700 font-medium">I consent to emergency medical treatment</span>
                </label>

                {formData.emergency_medical_consent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Vet Cost Approval (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.max_vet_cost_approval}
                      onChange={(e) => setFormData({ ...formData, max_vet_cost_approval: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., 500"
                    />
                  </div>
                )}

                {/* Care Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feeding Schedule</label>
                  <textarea
                    value={formData.feeding_schedule}
                    onChange={(e) => setFormData({ ...formData, feeding_schedule: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="e.g., 2 cups in the morning, 2 cups in the evening"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Activities</label>
                  <textarea
                    value={formData.favorite_activities}
                    onChange={(e) => setFormData({ ...formData, favorite_activities: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="e.g., Fetch, swimming, puzzle toys"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                  <textarea
                    value={formData.special_requirements}
                    onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="Any special care instructions"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentSection > 0 && (
                <button
                  type="button"
                  onClick={prevSection}
                  className="btn-outline"
                >
                  Previous
                </button>
              )}

              {currentSection < sections.length - 1 ? (
                <button
                  type="button"
                  onClick={nextSection}
                  className="btn-primary ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary ml-auto flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
