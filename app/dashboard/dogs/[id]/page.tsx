'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  HeartIcon,
  CameraIcon,
  DocumentIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  PhoneIcon,
  BeakerIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  HomeIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DogProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [dog, setDog] = useState<any>(null)
  const [owner, setOwner] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [visits, setVisits] = useState<any[]>([])

  useEffect(() => {
    if (params.id) {
      fetchDogProfile()
    }
  }, [params.id])

  const fetchDogProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch dog details
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

      setDog(dogData)

      // Fetch owner details
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setOwner(ownerData)

      // Fetch documents
      const { data: docsData } = await supabase
        .from('documents')
        .select('*')
        .eq('dog_id', params.id)
        .order('created_at', { ascending: false })

      setDocuments(docsData || [])

      // Fetch recent visits/bookings
      const { data: visitsData } = await supabase
        .from('bookings')
        .select('*')
        .contains('dog_ids', [params.id])
        .order('booking_date', { ascending: false })
        .limit(5)

      setVisits(visitsData || [])

    } catch (error) {
      console.error('Error fetching dog profile:', error)
      toast.error('Failed to load dog profile')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = () => {
    if (!dog) return ''
    const years = dog.age_years
    const months = dog.age_months || 0

    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canine-cream to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-canine-gold border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading {params.id}...</p>
        </div>
      </div>
    )
  }

  if (!dog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canine-cream to-white">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Dog profile not found</p>
          <Link href="/dashboard">
            <button className="mt-6 btn-primary">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-canine-gold hover:text-canine-navy mb-8 font-medium transition-colors group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-canine-navy to-blue-900 rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-canine-gold opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-canine-light-gold opacity-10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Dog Photo */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-40 h-40 rounded-3xl bg-gradient-to-br from-canine-gold to-amber-400 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white/20"
            >
              {dog.photo_url ? (
                <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
              ) : (
                <CameraIcon className="h-16 w-16 text-white" />
              )}
            </motion.div>

            {/* Dog Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-display font-bold text-white flex items-center justify-center md:justify-start gap-3 mb-3">
                {dog.name}
                <HeartSolid className="h-10 w-10 text-red-400 animate-pulse" />
              </h1>
              <p className="text-2xl text-canine-gold font-semibold mb-3">{dog.breed}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/90 text-lg mb-4">
                <span className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5" />
                  {calculateAge()} old
                </span>
                <span>•</span>
                <span>{dog.gender === 'male' ? '♂ Male' : '♀ Female'}</span>
                <span>•</span>
                <span className="capitalize">{dog.size?.replace('_', ' ')}</span>
                {dog.weight_kg && (
                  <>
                    <span>•</span>
                    <span>{dog.weight_kg} lbs</span>
                  </>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {dog.is_approved ? (
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Approved for Daycare
                  </span>
                ) : (
                  <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    Pending Approval
                  </span>
                )}
                {dog.vaccinated && (
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    💉 Vaccinated
                  </span>
                )}
                {dog.neutered && (
                  <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ✓ {dog.gender === 'male' ? 'Neutered' : 'Spayed'}
                  </span>
                )}
                {dog.microchipped && (
                  <span className="bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    🔒 Microchipped
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <Link href={`/dashboard/dogs/${dog.id}/edit`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-canine-gold hover:bg-canine-light-gold text-white px-6 py-3 rounded-xl font-bold shadow-xl flex items-center gap-2 transition-colors"
              >
                <PencilSquareIcon className="h-6 w-6" />
                Edit Profile
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <CalendarIcon className="h-10 w-10 mb-3 opacity-80" />
                <p className="text-3xl font-bold">{visits.length}</p>
                <p className="text-blue-100">Total Visits</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <BeakerIcon className="h-10 w-10 mb-3 opacity-80" />
                <p className="text-3xl font-bold">{dog.vaccinated ? '✓' : '✗'}</p>
                <p className="text-green-100">Vaccinations</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <DocumentIcon className="h-10 w-10 mb-3 opacity-80" />
                <p className="text-3xl font-bold">{documents.length}</p>
                <p className="text-purple-100">Documents</p>
              </motion.div>
            </div>

            {/* Health Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-green-500"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <BeakerIcon className="h-7 w-7 text-green-600" />
                </div>
                Health & Medical Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Vaccination Status
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {dog.vaccinated ? `Valid until ${new Date(dog.vaccination_expiry).toLocaleDateString()}` : 'Not provided'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-5 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <FireIcon className="h-4 w-4" />
                    Weight
                  </p>
                  <p className="font-bold text-gray-900 text-lg">{dog.weight_kg ? `${dog.weight_kg} lbs` : 'Not specified'}</p>
                </div>
              </div>

              {/* Treatment Status */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 mb-6 border border-purple-200">
                <p className="text-sm font-semibold text-purple-800 mb-4">Prevention & Treatment</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.flea_treatment ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${dog.flea_treatment ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {dog.flea_treatment && <CheckCircleIcon className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${dog.flea_treatment ? 'text-green-800' : 'text-gray-600'}`}>
                      Flea Treatment
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.worming_treatment ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${dog.worming_treatment ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {dog.worming_treatment && <CheckCircleIcon className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${dog.worming_treatment ? 'text-green-800' : 'text-gray-600'}`}>
                      Worming
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.heartworm_prevention ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${dog.heartworm_prevention ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {dog.heartworm_prevention && <CheckCircleIcon className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${dog.heartworm_prevention ? 'text-green-800' : 'text-gray-600'}`}>
                      Heartworm
                    </span>
                  </div>
                </div>
              </div>

              {dog.medical_conditions && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-5 mb-4">
                  <p className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    Medical Conditions
                  </p>
                  <p className="text-gray-800 leading-relaxed">{dog.medical_conditions}</p>
                </div>
              )}

              {dog.current_medications && dog.current_medications.length > 0 && (
                <div className="border-t-2 border-gray-100 pt-6">
                  <p className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BeakerIcon className="h-5 w-5 text-blue-600" />
                    Current Medications
                  </p>
                  <div className="grid gap-3">
                    {dog.current_medications.map((med: any, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <p className="font-bold text-gray-900 mb-1">{med.name}</p>
                        <p className="text-sm text-gray-700">{med.dosage} • {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dog.allergies && (
                <div className="border-t-2 border-gray-100 pt-6 mt-6">
                  <p className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    Allergies & Sensitivities
                  </p>
                  <p className="text-gray-800 bg-red-50 rounded-lg p-4 border border-red-200">{dog.allergies}</p>
                </div>
              )}
            </motion.div>

            {/* Behavioral Profile */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-purple-500"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <UserGroupIcon className="h-7 w-7 text-purple-600" />
                </div>
                Behavioral Profile & Socialization
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    Social Behavior
                  </p>
                  <div className="space-y-3">
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.good_with_dogs ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                      <span className={`text-2xl ${dog.good_with_dogs ? 'text-green-600' : 'text-red-600'}`}>
                        {dog.good_with_dogs ? '✓' : '✗'}
                      </span>
                      <span className={`font-medium ${dog.good_with_dogs ? 'text-green-800' : 'text-red-800'}`}>
                        Good with dogs
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.good_with_cats ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                      <span className={`text-2xl ${dog.good_with_cats ? 'text-green-600' : 'text-red-600'}`}>
                        {dog.good_with_cats ? '✓' : '✗'}
                      </span>
                      <span className={`font-medium ${dog.good_with_cats ? 'text-green-800' : 'text-red-800'}`}>
                        Good with cats
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.good_with_children ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                      <span className={`text-2xl ${dog.good_with_children ? 'text-green-600' : 'text-red-600'}`}>
                        {dog.good_with_children ? '✓' : '✗'}
                      </span>
                      <span className={`font-medium ${dog.good_with_children ? 'text-green-800' : 'text-red-800'}`}>
                        Good with children
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.good_with_strangers ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                      <span className={`text-2xl ${dog.good_with_strangers ? 'text-green-600' : 'text-red-600'}`}>
                        {dog.good_with_strangers ? '✓' : '✗'}
                      </span>
                      <span className={`font-medium ${dog.good_with_strangers ? 'text-green-800' : 'text-red-800'}`}>
                        Good with strangers
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-blue-500" />
                    Training Status
                  </p>
                  <div className="space-y-3">
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.house_trained ? 'bg-green-50 border-2 border-green-300' : 'bg-amber-50 border-2 border-amber-300'}`}>
                      <span className={`text-2xl ${dog.house_trained ? 'text-green-600' : 'text-amber-600'}`}>
                        {dog.house_trained ? '✓' : '○'}
                      </span>
                      <span className={`font-medium ${dog.house_trained ? 'text-green-800' : 'text-amber-800'}`}>
                        House trained
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.crate_trained ? 'bg-green-50 border-2 border-green-300' : 'bg-amber-50 border-2 border-amber-300'}`}>
                      <span className={`text-2xl ${dog.crate_trained ? 'text-green-600' : 'text-amber-600'}`}>
                        {dog.crate_trained ? '✓' : '○'}
                      </span>
                      <span className={`font-medium ${dog.crate_trained ? 'text-green-800' : 'text-amber-800'}`}>
                        Crate trained
                      </span>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                      <p className="text-xs text-indigo-700 font-semibold mb-1">Recall Reliability</p>
                      <p className="text-lg font-bold text-indigo-900 capitalize">{dog.recall_reliability || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {(dog.resource_guarding || dog.separation_anxiety || dog.excessive_barking || dog.leash_pulling) && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border-l-4 border-amber-500">
                  <p className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                    Behavioral Notes
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {dog.resource_guarding && (
                      <div className="flex items-center gap-2 text-amber-800">
                        <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                        Resource guarding
                      </div>
                    )}
                    {dog.separation_anxiety && (
                      <div className="flex items-center gap-2 text-amber-800">
                        <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                        Separation anxiety
                      </div>
                    )}
                    {dog.excessive_barking && (
                      <div className="flex items-center gap-2 text-amber-800">
                        <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                        Excessive barking
                      </div>
                    )}
                    {dog.leash_pulling && (
                      <div className="flex items-center gap-2 text-amber-800">
                        <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                        Leash pulling
                      </div>
                    )}
                  </div>
                </div>
              )}

              {dog.aggression_triggers && (
                <div className="border-t-2 border-gray-100 pt-6 mt-6">
                  <p className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-red-600" />
                    Aggression Triggers
                  </p>
                  <p className="text-gray-800 bg-red-50 rounded-lg p-4 border border-red-200">{dog.aggression_triggers}</p>
                </div>
              )}

              {dog.play_style && (
                <div className="border-t-2 border-gray-100 pt-6 mt-6">
                  <p className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <HeartIcon className="h-5 w-5 text-purple-600" />
                    Play Style
                  </p>
                  <p className="text-gray-800 bg-purple-50 rounded-lg p-4 border border-purple-200">{dog.play_style}</p>
                </div>
              )}
            </motion.div>

            {/* Care Instructions */}
            {(dog.feeding_schedule || dog.special_requirements || dog.favorite_activities) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-blue-500"
              >
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <HomeIcon className="h-7 w-7 text-blue-600" />
                  </div>
                  Care Instructions
                </h2>

                {dog.feeding_schedule && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      🍽️ Feeding Schedule
                    </p>
                    <p className="text-gray-800 bg-orange-50 rounded-lg p-4 border border-orange-200 leading-relaxed">{dog.feeding_schedule}</p>
                  </div>
                )}

                {dog.favorite_activities && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      ⚽ Favorite Activities
                    </p>
                    <p className="text-gray-800 bg-green-50 rounded-lg p-4 border border-green-200 leading-relaxed">{dog.favorite_activities}</p>
                  </div>
                )}

                {dog.special_requirements && (
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      ⭐ Special Requirements
                    </p>
                    <p className="text-gray-800 bg-purple-50 rounded-lg p-4 border border-purple-200 leading-relaxed">{dog.special_requirements}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Emergency & Quick Info */}
          <div className="space-y-8">

            {/* Emergency Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-2xl p-8 text-white"
            >
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <PhoneIcon className="h-7 w-7" />
                </div>
                Emergency Contacts
              </h2>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                  <p className="text-sm font-bold text-red-100 mb-2">🏥 Veterinary Clinic</p>
                  <p className="text-white font-bold text-lg mb-1">{dog.vet_name || 'Not provided'}</p>
                  {dog.vet_phone && <p className="text-red-100 font-semibold mb-1">📞 {dog.vet_phone}</p>}
                  {dog.vet_address && <p className="text-sm text-red-100">📍 {dog.vet_address}</p>}
                </div>

                <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                  <p className="text-sm font-bold text-red-100 mb-2">👤 Owner Contact</p>
                  <p className="text-white font-bold mb-1">{owner?.first_name} {owner?.last_name}</p>
                  <p className="text-red-100">📞 {owner?.phone}</p>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                  <p className="text-sm font-bold text-red-100 mb-2">🚨 Emergency Contact</p>
                  <p className="text-white font-bold mb-1">{owner?.emergency_contact_name || 'Not provided'}</p>
                  <p className="text-red-100">📞 {owner?.emergency_contact_phone}</p>
                </div>

                {dog.emergency_medical_consent && (
                  <div className="bg-green-500 rounded-xl p-5">
                    <p className="text-white font-bold flex items-center gap-2 mb-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      Medical Consent Granted
                    </p>
                    {dog.max_vet_cost_approval && (
                      <p className="text-green-100 text-sm">
                        Max approval: £{dog.max_vet_cost_approval}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <DocumentIcon className="h-7 w-7 text-blue-600" />
                </div>
                Documents
              </h2>

              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <p className="font-bold text-gray-900 mb-1">{doc.name}</p>
                      <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">{doc.type}</p>
                      {doc.expiry_date && (
                        <p className="text-xs text-amber-600 font-semibold">
                          Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No documents uploaded</p>
                </div>
              )}

              <Link href="/dashboard/documents">
                <button className="mt-6 w-full bg-canine-gold hover:bg-canine-light-gold text-white py-3 rounded-xl font-bold transition-colors">
                  Manage Documents →
                </button>
              </Link>
            </motion.div>

            {/* Recent Visits */}
            {visits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CalendarIcon className="h-7 w-7 text-green-600" />
                  </div>
                  Recent Visits
                </h2>

                <div className="space-y-3">
                  {visits.map((visit) => (
                    <div key={visit.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <p className="font-bold text-gray-900">
                        {new Date(visit.booking_date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-green-700 font-semibold capitalize mt-1">
                        {visit.status === 'completed' ? '✓ Attended' : visit.status}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
