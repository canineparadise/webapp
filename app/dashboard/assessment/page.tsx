'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ClipboardDocumentListIcon,
  UserIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

export default function AssessmentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [currentSection, setCurrentSection] = useState(0)

  const [formData, setFormData] = useState({
    // Owner Information
    ownerName: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    emergencyName: '',
    emergencyPhone: '',

    // Dog Information
    dogName: '',
    breed: '',
    age: '',
    gender: 'male',
    neutered: 'yes',
    weight: '',

    // Health Information
    vaccinated: 'yes',
    vaccinationDate: '',
    fleaTreatment: 'yes',
    fleaDate: '',
    wormTreatment: 'yes',
    wormDate: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    vetName: '',
    vetPhone: '',

    // Behavioral Information
    socialization: 'excellent',
    aggression: 'never',
    anxiety: 'none',
    commands: '',
    houseTrained: 'yes',
    crate: 'comfortable',
    leashBehavior: 'good',

    // Experience & Preferences
    previousDaycare: 'no',
    previousDaycareDetails: '',
    playStyle: 'gentle',
    favoriteActivities: '',
    dislikes: '',
    triggers: '',

    // Additional Information
    feedingSchedule: '',
    specialInstructions: '',
    pickupPersons: '',
    photoPermission: 'yes',

    // Agreement
    agreeToTerms: false,
    agreeToAssessment: false,
    signature: '',
    signatureDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    { title: 'Owner Information', icon: UserIcon },
    { title: 'Dog Information', icon: HeartIcon },
    { title: 'Health & Medical', icon: ExclamationTriangleIcon },
    { title: 'Behavior & Training', icon: ClipboardDocumentListIcon },
    { title: 'Review & Submit', icon: CheckCircleIcon },
  ]

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeToTerms || !formData.agreeToAssessment) {
      toast.error('Please agree to all terms and conditions')
      return
    }

    if (!formData.signature) {
      toast.error('Please provide your digital signature')
      return
    }

    setSubmitting(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Prepare data for database insertion
      const assessmentData = {
        user_id: user.id,

        // Owner Information
        owner_name: formData.ownerName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        emergency_name: formData.emergencyName,
        emergency_phone: formData.emergencyPhone,

        // Dog Information
        dog_name: formData.dogName,
        breed: formData.breed,
        age: formData.age,
        gender: formData.gender,
        neutered: formData.neutered,
        weight: formData.weight,

        // Health Information
        vaccinated: formData.vaccinated,
        vaccination_date: formData.vaccinationDate || null,
        flea_treatment: formData.fleaTreatment,
        flea_date: formData.fleaDate || null,
        worm_treatment: formData.wormTreatment,
        worm_date: formData.wormDate || null,
        medical_conditions: formData.medicalConditions,
        medications: formData.medications,
        allergies: formData.allergies,
        vet_name: formData.vetName,
        vet_phone: formData.vetPhone,

        // Behavioral Information
        socialization: formData.socialization,
        aggression: formData.aggression,
        anxiety: formData.anxiety,
        commands: formData.commands,
        house_trained: formData.houseTrained,
        crate: formData.crate,
        leash_behavior: formData.leashBehavior,

        // Experience & Preferences
        previous_daycare: formData.previousDaycare,
        previous_daycare_details: formData.previousDaycareDetails,
        play_style: formData.playStyle,
        favorite_activities: formData.favoriteActivities,
        dislikes: formData.dislikes,
        triggers: formData.triggers,

        // Additional Information
        feeding_schedule: formData.feedingSchedule,
        special_instructions: formData.specialInstructions,
        pickup_persons: formData.pickupPersons,
        photo_permission: formData.photoPermission,

        // Agreement
        agree_to_terms: formData.agreeToTerms,
        agree_to_assessment: formData.agreeToAssessment,
        signature: formData.signature,
        signature_date: formData.signatureDate,

        // Status
        status: 'pending'
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from('assessment_forms')
        .insert(assessmentData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      toast.success('Assessment form submitted successfully! We will contact you to schedule your assessment day (Fridays only).')

      // Clean up localStorage (remove old data if any)
      localStorage.removeItem('assessmentForm')

      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Error submitting assessment form:', error)
      toast.error(error.message || 'Failed to submit assessment form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold"></div>
      </div>
    )
  }

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-canine-navy mb-4">Owner Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="John Smith"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  placeholder="07123 456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  placeholder="WD6 3FS"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="London"
              />
            </div>

            <div className="border-t pt-4 mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="07987 654321"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-canine-navy mb-4">Dog Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dog's Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dogName}
                  onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  placeholder="Max"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed *
                </label>
                <input
                  type="text"
                  required
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  placeholder="Golden Retriever"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="text"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  placeholder="3 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight *
                </label>
                <input
                  type="text"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  placeholder="25 kg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Is your dog neutered/spayed? *
              </label>
              <select
                value={formData.neutered}
                onChange={(e) => setFormData({ ...formData, neutered: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favorite Activities
              </label>
              <textarea
                value={formData.favoriteActivities}
                onChange={(e) => setFormData({ ...formData, favoriteActivities: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="Playing fetch, swimming, belly rubs..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dislikes or Fears
              </label>
              <textarea
                value={formData.dislikes}
                onChange={(e) => setFormData({ ...formData, dislikes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="Loud noises, being alone, etc."
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-canine-navy mb-4">Health & Medical Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccinations up to date? *
                </label>
                <select
                  value={formData.vaccinated}
                  onChange={(e) => setFormData({ ...formData, vaccinated: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Vaccination Date
                </label>
                <input
                  type="date"
                  value={formData.vaccinationDate}
                  onChange={(e) => setFormData({ ...formData, vaccinationDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flea treatment up to date? *
                </label>
                <select
                  value={formData.fleaTreatment}
                  onChange={(e) => setFormData({ ...formData, fleaTreatment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Flea Treatment Date
                </label>
                <input
                  type="date"
                  value={formData.fleaDate}
                  onChange={(e) => setFormData({ ...formData, fleaDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Worm treatment up to date? *
                </label>
                <select
                  value={formData.wormTreatment}
                  onChange={(e) => setFormData({ ...formData, wormTreatment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Worm Treatment Date
                </label>
                <input
                  type="date"
                  value={formData.wormDate}
                  onChange={(e) => setFormData({ ...formData, wormDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Conditions
              </label>
              <textarea
                value={formData.medicalConditions}
                onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="Please list any medical conditions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Medications
              </label>
              <textarea
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="Please list any medications and dosages..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergies or Dietary Restrictions
              </label>
              <textarea
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="Please list any allergies or dietary restrictions..."
              />
            </div>

            <div className="border-t pt-4 mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Veterinarian Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vet Clinic Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vetName}
                    onChange={(e) => setFormData({ ...formData, vetName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="Village Vets"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vet Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.vetPhone}
                    onChange={(e) => setFormData({ ...formData, vetPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="020 1234 5678"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-canine-navy mb-4">Behavior & Training</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How does your dog interact with other dogs? *
              </label>
              <select
                value={formData.socialization}
                onChange={(e) => setFormData({ ...formData, socialization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
              >
                <option value="excellent">Excellent - Loves all dogs</option>
                <option value="good">Good - Gets along with most dogs</option>
                <option value="selective">Selective - Prefers certain dogs</option>
                <option value="nervous">Nervous - Shy around other dogs</option>
                <option value="reactive">Reactive - Needs careful introduction</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Has your dog shown aggression? *
              </label>
              <select
                value={formData.aggression}
                onChange={(e) => setFormData({ ...formData, aggression: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
              >
                <option value="never">Never</option>
                <option value="food">Around food</option>
                <option value="toys">Around toys</option>
                <option value="dogs">Towards other dogs</option>
                <option value="people">Towards people</option>
                <option value="multiple">Multiple situations</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Does your dog have separation anxiety? *
              </label>
              <select
                value={formData.anxiety}
                onChange={(e) => setFormData({ ...formData, anxiety: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
              >
                <option value="none">No anxiety</option>
                <option value="mild">Mild - Whines briefly</option>
                <option value="moderate">Moderate - Needs gradual leaving</option>
                <option value="severe">Severe - Cannot be left alone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What commands does your dog know?
              </label>
              <input
                type="text"
                value={formData.commands}
                onChange={(e) => setFormData({ ...formData, commands: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="Sit, stay, come, down, etc."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House trained? *
                </label>
                <select
                  value={formData.houseTrained}
                  onChange={(e) => setFormData({ ...formData, houseTrained: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                >
                  <option value="yes">Yes</option>
                  <option value="mostly">Mostly</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leash behavior *
                </label>
                <select
                  value={formData.leashBehavior}
                  onChange={(e) => setFormData({ ...formData, leashBehavior: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                >
                  <option value="excellent">Excellent - No pulling</option>
                  <option value="good">Good - Minor pulling</option>
                  <option value="needs-work">Needs work - Pulls frequently</option>
                  <option value="difficult">Difficult - Strong puller</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Play style *
              </label>
              <select
                value={formData.playStyle}
                onChange={(e) => setFormData({ ...formData, playStyle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
              >
                <option value="gentle">Gentle - Calm play</option>
                <option value="moderate">Moderate - Normal energy</option>
                <option value="rough">Rough - Loves wrestling</option>
                <option value="solo">Solo - Prefers toys over dogs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any triggers we should know about?
              </label>
              <textarea
                value={formData.triggers}
                onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="Motorcycles, men in hats, small children, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions or Additional Information
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                placeholder="Any other information that would help us care for your dog..."
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-canine-navy mb-4">Review & Submit</h3>

            <div className="bg-canine-cream rounded-lg p-6">
              <h4 className="font-semibold text-canine-navy mb-3">Summary</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Owner:</strong> {formData.ownerName || 'Not provided'}</p>
                <p><strong>Dog:</strong> {formData.dogName || 'Not provided'}</p>
                <p><strong>Breed:</strong> {formData.breed || 'Not provided'}</p>
                <p><strong>Age:</strong> {formData.age || 'Not provided'}</p>
                <p><strong>Emergency Contact:</strong> {formData.emergencyName || 'Not provided'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authorized Pickup Persons (besides owner)
                </label>
                <textarea
                  value={formData.pickupPersons}
                  onChange={(e) => setFormData({ ...formData, pickupPersons: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  placeholder="Name and relationship (e.g., Jane Smith - Spouse)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo Permission *
                </label>
                <select
                  value={formData.photoPermission}
                  onChange={(e) => setFormData({ ...formData, photoPermission: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                >
                  <option value="yes">Yes - Photos can be used on social media</option>
                  <option value="no">No - Do not share photos</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-canine-navy mb-4">Terms & Conditions</h4>

              <div className="space-y-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that all information provided is accurate and complete. I understand that providing false information may result in refusal of service.
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.agreeToAssessment}
                    onChange={(e) => setFormData({ ...formData, agreeToAssessment: e.target.checked })}
                    className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold"
                  />
                  <span className="text-sm text-gray-700">
                    I understand that my dog must pass an assessment day (Fridays only) before being accepted into the daycare program.
                  </span>
                </label>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Digital Signature *
                </label>
                <input
                  type="text"
                  required
                  value={formData.signature}
                  onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  placeholder="Type your full name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  By typing your name, you are electronically signing this form
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.signatureDate}
                  onChange={(e) => setFormData({ ...formData, signatureDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-canine-gold hover:text-canine-light-gold mb-4 inline-flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-display font-bold text-canine-navy">
              Assessment Form
            </h1>
            <p className="text-gray-600 mt-2">
              Please complete this form to schedule your dog's assessment day
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {sections.map((section, index) => {
                const Icon = section.icon
                return (
                  <div
                    key={index}
                    className={`flex-1 ${index < sections.length - 1 ? 'relative' : ''}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${index <= currentSection
                            ? 'bg-canine-gold text-white'
                            : 'bg-gray-200 text-gray-500'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <p className={`text-sm font-medium ${index <= currentSection ? 'text-canine-navy' : 'text-gray-500'}`}>
                          {section.title}
                        </p>
                      </div>
                    </div>
                    {index < sections.length - 1 && (
                      <div
                        className={`
                          absolute top-5 left-10 right-0 h-0.5
                          ${index < currentSection ? 'bg-canine-gold' : 'bg-gray-200'}
                        `}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
            {renderSection()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentSection > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}

              {currentSection < sections.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto bg-canine-gold text-white px-6 py-2 rounded-lg hover:bg-canine-light-gold transition-colors"
                >
                  Next
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="ml-auto bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Submit Assessment
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}