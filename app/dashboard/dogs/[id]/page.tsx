'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/DashboardHeader'
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
  StarIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  LockClosedIcon
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
  const [totalVisits, setTotalVisits] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

      // Fetch documents from documents table
      const { data: dbDocuments } = await supabase
        .from('documents')
        .select('*')
        .eq('dog_id', params.id)
        .order('uploaded_at', { ascending: false })

      // Also check storage bucket for legacy documents (dog-vaccinations)
      const { data: storageFiles } = await supabase.storage
        .from('dog-vaccinations')
        .list(`${params.id}`)

      // Get public URLs for storage files
      const storageDocsWithUrls = (storageFiles || []).filter(file => file.name !== '.emptyFolderPlaceholder').map(file => ({
        name: file.name,
        url: supabase.storage.from('dog-vaccinations').getPublicUrl(`${params.id}/${file.name}`).data.publicUrl,
        created_at: file.created_at,
        type: 'Vaccination Record'
      }))

      // Format database documents
      const dbDocsWithUrls = (dbDocuments || []).map(doc => ({
        name: doc.file_name,
        url: doc.file_url,
        created_at: doc.uploaded_at,
        type: doc.type === 'vaccination' ? 'Vaccination Record' : doc.type
      }))

      // Combine both sources
      setDocuments([...dbDocsWithUrls, ...storageDocsWithUrls])

      // Fetch completed visits/bookings for this specific dog
      const { data: subscriptionBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('dog_id', params.id)
        .in('status', ['completed', 'checked_in'])
        .order('booking_date', { ascending: false })

      // Also check individual day bookings
      const { data: individualBookings } = await supabase
        .from('individual_day_bookings')
        .select('*')
        .eq('dog_id', params.id)
        .in('status', ['completed', 'checked_in', 'confirmed'])
        .order('booking_date', { ascending: false })

      // Combine and sort all visits
      const allVisits = [
        ...(subscriptionBookings || []).map(b => ({ ...b, type: 'subscription' })),
        ...(individualBookings || []).map(b => ({ ...b, type: 'individual' }))
      ].sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())

      setVisits(allVisits.slice(0, 5))
      setTotalVisits(allVisits.length)

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

  const handleDeleteDog = async () => {
    if (!dog) return

    setDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Delete dog from database
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', dog.id)
        .eq('owner_id', user.id) // Security: ensure user owns the dog

      if (error) {
        console.error('Error deleting dog:', error)
        toast.error('Failed to delete dog. Please try again.')
        return
      }

      // Also try to delete any vaccination documents from storage
      try {
        const { data: files } = await supabase.storage
          .from('dog-vaccinations')
          .list(`${dog.id}`)

        if (files && files.length > 0) {
          const filePaths = files.map(f => `${dog.id}/${f.name}`)
          await supabase.storage
            .from('dog-vaccinations')
            .remove(filePaths)
        }
      } catch (storageError) {
        console.error('Error deleting dog documents:', storageError)
        // Don't fail the whole operation if storage cleanup fails
      }

      toast.success(`${dog.name} has been removed from your account`)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting dog:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canine-cream to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-canine-gold border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading dog profile...</p>
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

        {/* Header */}
        <DashboardHeader
          title={dog?.name || 'Dog Profile'}
          subtitle="View your dog's complete profile"
        />

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-canine-navy to-canine-navy/90 rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-canine-gold opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-canine-light-gold opacity-10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Dog Photo */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-40 h-40 rounded-3xl bg-gradient-to-br from-canine-gold to-canine-light-gold flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white/20"
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
                <HeartSolid className="h-10 w-10 text-canine-gold animate-pulse" />
              </h1>
              <p className="text-2xl text-canine-gold font-semibold mb-3">{dog.breed}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/90 text-lg mb-4">
                <span className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-canine-gold" />
                  {calculateAge()} old
                </span>
                <span>•</span>
                <span>{dog.gender === 'male' ? '♂ Male' : '♀ Female'}</span>
                <span>•</span>
                <span className="capitalize">{dog.size?.replace('_', ' ')}</span>
                {dog.weight_kg && (
                  <>
                    <span>•</span>
                    <span>{dog.weight_kg} kg</span>
                  </>
                )}
                {dog.color && (
                  <>
                    <span>•</span>
                    <span>{dog.color}</span>
                  </>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {dog.is_approved ? (
                  <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Approved for Daycare
                  </span>
                ) : (
                  <span className="bg-canine-gold text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    Pending Approval
                  </span>
                )}
                {dog.vaccinated && (
                  <span className="bg-canine-navy/80 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-canine-gold/30">
                    💉 Vaccinated
                  </span>
                )}
                {dog.neutered && (
                  <span className="bg-canine-navy/80 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-canine-gold/30">
                    ✓ {dog.gender === 'male' ? 'Neutered' : 'Spayed'}
                  </span>
                )}
                {dog.microchipped && (
                  <span className="bg-canine-navy/80 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-canine-gold/30">
                    🔒 Microchipped
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link href={`/dashboard/dogs/${dog.id}/edit`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-canine-gold hover:bg-canine-light-gold text-white px-6 py-3 rounded-xl font-bold shadow-xl flex items-center gap-2 transition-colors w-full"
                >
                  <PencilSquareIcon className="h-6 w-6" />
                  Edit Profile
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl flex items-center gap-2 transition-colors"
              >
                <TrashIcon className="h-6 w-6" />
                Delete Dog
              </motion.button>
            </div>
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
                className="bg-gradient-to-br from-canine-navy to-canine-navy/80 rounded-2xl p-6 text-white shadow-xl border border-canine-gold/20"
              >
                <CalendarIcon className="h-10 w-10 mb-3 text-canine-gold" />
                <p className="text-3xl font-bold">{totalVisits}</p>
                <p className="text-gray-300">Total Visits</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-canine-gold to-canine-light-gold rounded-2xl p-6 text-white shadow-xl"
              >
                <BeakerIcon className="h-10 w-10 mb-3 opacity-90" />
                <p className="text-3xl font-bold">{dog.vaccinated ? '✓' : '✗'}</p>
                <p className="text-white/80">Vaccinations</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-canine-navy to-canine-navy/80 rounded-2xl p-6 text-white shadow-xl border border-canine-gold/20"
              >
                <DocumentIcon className="h-10 w-10 mb-3 text-canine-gold" />
                <p className="text-3xl font-bold">{documents.length}</p>
                <p className="text-gray-300">Documents</p>
              </motion.div>
            </div>

            {/* Health Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-canine-gold"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center gap-3">
                <div className="bg-canine-gold/10 p-3 rounded-xl">
                  <BeakerIcon className="h-7 w-7 text-canine-gold" />
                </div>
                Health & Medical Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-canine-cream to-canine-sky/30 rounded-xl p-5 border border-canine-gold/20">
                  <p className="text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-canine-gold" />
                    Vaccination Status
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {dog.vaccinated ? `Valid until ${new Date(dog.vaccination_expiry).toLocaleDateString()}` : 'Not provided'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-canine-cream to-canine-sky/30 rounded-xl p-5 border border-canine-gold/20">
                  <p className="text-sm font-semibold text-canine-navy mb-2 flex items-center gap-2">
                    <FireIcon className="h-4 w-4 text-canine-gold" />
                    Weight
                  </p>
                  <p className="font-bold text-gray-900 text-lg">{dog.weight_kg ? `${dog.weight_kg} kg` : 'Not specified'}</p>
                </div>
              </div>

              {/* Treats Information */}
              <div className="bg-canine-cream/50 rounded-xl p-5 mb-6 border border-canine-gold/20">
                <p className="text-sm font-semibold text-canine-navy mb-2">Treats</p>
                <p className={`font-bold ${dog.can_be_given_treats ? 'text-green-600' : 'text-red-600'}`}>
                  {dog.can_be_given_treats ? '✓ Can be given treats' : '✗ Cannot be given treats'}
                </p>
              </div>

              {/* Treatment Status */}
              <div className="bg-gradient-to-r from-canine-cream to-canine-sky/30 rounded-xl p-5 mb-6 border border-canine-gold/20">
                <p className="text-sm font-semibold text-canine-navy mb-4">Prevention & Treatment</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.flea_treatment ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-100'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${dog.flea_treatment ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {dog.flea_treatment && <CheckCircleIcon className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${dog.flea_treatment ? 'text-green-800' : 'text-gray-600'}`}>
                      Flea Treatment
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.worming_treatment ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-100'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${dog.worming_treatment ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {dog.worming_treatment && <CheckCircleIcon className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${dog.worming_treatment ? 'text-green-800' : 'text-gray-600'}`}>
                      Worming
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${dog.heartworm_prevention ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-100'}`}>
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
                  <p className="text-sm font-bold text-canine-navy mb-4 flex items-center gap-2">
                    <BeakerIcon className="h-5 w-5 text-canine-gold" />
                    Current Medications
                  </p>
                  <div className="grid gap-3">
                    {dog.current_medications.map((med: any, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-canine-cream to-canine-sky/30 rounded-xl p-4 border border-canine-gold/20">
                        <p className="font-bold text-gray-900 mb-1">{med.name}</p>
                        <p className="text-sm text-gray-700">{med.dosage} • {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dog.medication_requirements && (
                <div className="border-t-2 border-gray-100 pt-6 mt-6">
                  <p className="text-sm font-bold text-canine-navy mb-2 flex items-center gap-2">
                    <BeakerIcon className="h-5 w-5 text-canine-gold" />
                    Medication Requirements
                  </p>
                  <p className="text-gray-800 bg-canine-cream/50 rounded-lg p-4 border border-canine-gold/20">{dog.medication_requirements}</p>
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
              className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-canine-navy"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center gap-3">
                <div className="bg-canine-navy/10 p-3 rounded-xl">
                  <UserGroupIcon className="h-7 w-7 text-canine-navy" />
                </div>
                Behavioral Profile & Socialization
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-sm font-bold text-canine-navy mb-4 flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-canine-gold" />
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
                  <p className="text-sm font-bold text-canine-navy mb-4 flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-canine-gold" />
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
                    <div className="bg-gradient-to-r from-canine-cream to-canine-sky/30 rounded-lg p-4 border border-canine-gold/20">
                      <p className="text-xs text-canine-navy font-semibold mb-1">Recall Reliability</p>
                      <p className="text-lg font-bold text-canine-navy capitalize">{dog.recall_reliability || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Concerns - Escape & Fence */}
              {(dog.escape_artist || dog.fence_jumper) && (
                <div className="bg-amber-50 rounded-xl p-5 mb-6 border border-amber-200">
                  <p className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5" />
                    Safety Concerns
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dog.escape_artist && (
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        Escape Artist
                      </span>
                    )}
                    {dog.fence_jumper && (
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        Fence Jumper
                      </span>
                    )}
                  </div>
                </div>
              )}

              {(dog.resource_guarding || dog.separation_anxiety || dog.excessive_barking || dog.leash_pulling) && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-l-4 border-amber-500">
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

              {dog.behavioral_challenges && (
                <div className="border-t-2 border-gray-100 pt-6 mt-6">
                  <p className="text-sm font-bold text-canine-navy mb-3 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                    Behavioral Challenges
                  </p>
                  <p className="text-gray-800 bg-amber-50 rounded-lg p-4 border border-amber-200">{dog.behavioral_challenges}</p>
                </div>
              )}

              {dog.training_needs && (
                <div className="border-t-2 border-gray-100 pt-6 mt-6">
                  <p className="text-sm font-bold text-canine-navy mb-3 flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-canine-gold" />
                    Training Needs
                  </p>
                  <p className="text-gray-800 bg-canine-cream/50 rounded-lg p-4 border border-canine-gold/20">{dog.training_needs}</p>
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
                  <p className="text-sm font-bold text-canine-navy mb-3 flex items-center gap-2">
                    <HeartIcon className="h-5 w-5 text-canine-gold" />
                    Play Style
                  </p>
                  <p className="text-gray-800 bg-canine-cream/50 rounded-lg p-4 border border-canine-gold/20">{dog.play_style}</p>
                </div>
              )}
            </motion.div>

            {/* Care Instructions */}
            {(dog.feeding_schedule || dog.special_requirements || dog.favorite_activities) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-canine-light-gold"
              >
                <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center gap-3">
                  <div className="bg-canine-gold/10 p-3 rounded-xl">
                    <HomeIcon className="h-7 w-7 text-canine-gold" />
                  </div>
                  Care Instructions
                </h2>

                {dog.feeding_schedule && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-canine-navy mb-3 flex items-center gap-2">
                      🍽️ Feeding Schedule
                    </p>
                    <p className="text-gray-800 bg-canine-cream/50 rounded-lg p-4 border border-canine-gold/20 leading-relaxed">{dog.feeding_schedule}</p>
                  </div>
                )}

                {dog.favorite_activities && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-canine-navy mb-3 flex items-center gap-2">
                      ⚽ Favorite Activities
                    </p>
                    <p className="text-gray-800 bg-canine-sky/30 rounded-lg p-4 border border-canine-gold/20 leading-relaxed">{dog.favorite_activities}</p>
                  </div>
                )}

                {dog.special_requirements && (
                  <div>
                    <p className="text-sm font-bold text-canine-navy mb-3 flex items-center gap-2">
                      ⭐ Special Requirements
                    </p>
                    <p className="text-gray-800 bg-canine-cream/50 rounded-lg p-4 border border-canine-gold/20 leading-relaxed">{dog.special_requirements}</p>
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
              className="bg-gradient-to-br from-canine-navy to-canine-navy/90 rounded-3xl shadow-2xl p-8 text-white"
            >
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                <div className="bg-canine-gold/20 p-3 rounded-xl">
                  <PhoneIcon className="h-7 w-7 text-canine-gold" />
                </div>
                Emergency Contacts
              </h2>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                  <p className="text-sm font-bold text-canine-gold mb-2">🏥 Veterinary Clinic</p>
                  <p className="text-white font-bold text-lg mb-1">{dog.vet_name || 'Not provided'}</p>
                  {dog.vet_phone && <p className="text-gray-300 font-semibold mb-1">📞 {dog.vet_phone}</p>}
                  {dog.vet_address && <p className="text-sm text-gray-300">📍 {dog.vet_address}</p>}
                </div>

                <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                  <p className="text-sm font-bold text-canine-gold mb-2">👤 Owner Contact</p>
                  <p className="text-white font-bold mb-1">{owner?.first_name} {owner?.last_name}</p>
                  <p className="text-gray-300">📞 {owner?.phone}</p>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                  <p className="text-sm font-bold text-canine-gold mb-2">🚨 Emergency Contact</p>
                  <p className="text-white font-bold mb-1">{owner?.emergency_contact_name || 'Not provided'}</p>
                  <p className="text-gray-300">📞 {owner?.emergency_contact_phone}</p>
                </div>

                {dog.emergency_medical_consent && (
                  <div className="bg-green-600 rounded-xl p-5">
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

            {/* Pickup & Dropoff Authorization */}
            {(dog.authorized_dropoff_people?.length > 0 || dog.authorized_pickup_people?.length > 0 || dog.checkout_password) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
                className="bg-white rounded-3xl shadow-xl p-6"
              >
                <h3 className="text-lg font-display font-bold text-canine-navy mb-4 flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-canine-gold" />
                  Pickup & Dropoff
                </h3>

                <div className="space-y-4">
                  {dog.authorized_dropoff_people?.length > 0 && (
                    <div className="bg-canine-cream/50 rounded-xl p-4 border border-canine-gold/20">
                      <p className="text-xs font-bold text-canine-navy mb-2">Authorized to Drop Off</p>
                      <div className="flex flex-wrap gap-2">
                        {dog.authorized_dropoff_people.map((person: string, index: number) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {person}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {dog.authorized_pickup_people?.length > 0 && (
                    <div className="bg-canine-cream/50 rounded-xl p-4 border border-canine-gold/20">
                      <p className="text-xs font-bold text-canine-navy mb-2">Authorized to Pick Up</p>
                      <div className="flex flex-wrap gap-2">
                        {dog.authorized_pickup_people.map((person: string, index: number) => (
                          <span key={index} className="bg-canine-sky text-canine-navy px-2 py-1 rounded-full text-xs font-medium">
                            {person}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {dog.checkout_password && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <p className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                        <LockClosedIcon className="h-4 w-4" />
                        Checkout Password Set
                      </p>
                      <p className="text-amber-700 text-xs">Password required for non-authorized pickup.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Microchip Information */}
            {dog.microchip_number && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-3xl shadow-xl p-6"
              >
                <h3 className="text-lg font-display font-bold text-canine-navy mb-3 flex items-center gap-2">
                  <LockClosedIcon className="h-5 w-5 text-canine-gold" />
                  Microchip Number
                </h3>
                <p className="font-mono text-lg text-canine-navy bg-canine-cream/50 rounded-lg p-3 border border-canine-gold/20">
                  {dog.microchip_number}
                </p>
              </motion.div>
            )}

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-6 flex items-center gap-3">
                <div className="bg-canine-gold/10 p-3 rounded-xl">
                  <DocumentIcon className="h-7 w-7 text-canine-gold" />
                </div>
                Documents
              </h2>

              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gradient-to-r from-canine-cream to-canine-sky/30 rounded-xl p-4 border border-canine-gold/20 hover:border-canine-gold hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-canine-navy mb-1">{doc.name}</p>
                          <p className="text-xs text-canine-gold uppercase tracking-wide font-semibold">{doc.type}</p>
                          {doc.created_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-canine-gold">
                          <EyeIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">View</span>
                        </div>
                      </div>
                    </a>
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
                  <div className="bg-canine-gold/10 p-3 rounded-xl">
                    <CalendarIcon className="h-7 w-7 text-canine-gold" />
                  </div>
                  Recent Visits
                </h2>

                <div className="space-y-3">
                  {visits.map((visit) => (
                    <div key={visit.id} className="bg-gradient-to-r from-canine-cream to-canine-sky/30 rounded-xl p-4 border border-canine-gold/20">
                      <p className="font-bold text-canine-navy">
                        {new Date(visit.booking_date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-canine-gold font-semibold capitalize mt-1">
                        {visit.status === 'completed' ? '✓ Attended' : visit.status === 'checked_in' ? '✓ Checked In' : visit.status}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          >
            <div className="text-center">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrashIcon className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                Delete {dog?.name}?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove <strong>{dog?.name}</strong> from your account?
                This action cannot be undone and will delete all associated data including
                vaccination records and booking history.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDog}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-5 w-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
