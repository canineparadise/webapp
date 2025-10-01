'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  HeartIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function ViewAssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [assessmentForm, setAssessmentForm] = useState<any>(null)

  useEffect(() => {
    fetchAssessmentForm()
  }, [])

  const fetchAssessmentForm = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      const { data: formData } = await supabase
        .from('assessment_forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!formData) {
        router.push('/dashboard/assessment')
        return
      }

      setAssessmentForm(formData)
    } catch (error) {
      console.error('Error fetching assessment form:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold"></div>
      </div>
    )
  }

  if (!assessmentForm) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'pending':
        return <ClockIcon className="h-5 w-5" />
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'scheduled':
        return <CalendarIcon className="h-5 w-5" />
      default:
        return <DocumentTextIcon className="h-5 w-5" />
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-display font-bold text-canine-navy">
                  Your Assessment Form
                </h1>
                <p className="text-gray-600 mt-2">
                  Submitted on {new Date(assessmentForm.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full border ${getStatusColor(assessmentForm.status)} flex items-center gap-2`}>
                {getStatusIcon(assessmentForm.status)}
                <span className="font-semibold capitalize">{assessmentForm.status}</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">

            {/* Owner Information */}
            <div>
              <h2 className="text-xl font-semibold text-canine-navy mb-4 flex items-center">
                <UserIcon className="h-6 w-6 mr-2 text-canine-gold" />
                Owner Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.owner_name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.address}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">City & Postcode</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.city}, {assessmentForm.postcode}</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
                <p className="font-medium text-canine-navy">{assessmentForm.emergency_name}</p>
                <p className="text-canine-navy flex items-center mt-1">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {assessmentForm.emergency_phone}
                </p>
              </div>
            </div>

            {/* Dog Information */}
            <div>
              <h2 className="text-xl font-semibold text-canine-navy mb-4 flex items-center">
                <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
                Dog Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Dog's Name</p>
                  <p className="font-medium text-canine-navy text-lg">{assessmentForm.dog_name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Breed</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.breed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.age}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-canine-navy capitalize">{assessmentForm.gender}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.weight}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Neutered/Spayed</p>
                  <p className="font-medium text-canine-navy capitalize">{assessmentForm.neutered}</p>
                </div>
              </div>

              {assessmentForm.favorite_activities && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Favorite Activities</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.favorite_activities}</p>
                </div>
              )}

              {assessmentForm.dislikes && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Dislikes or Fears</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.dislikes}</p>
                </div>
              )}
            </div>

            {/* Health Information */}
            <div>
              <h2 className="text-xl font-semibold text-canine-navy mb-4">Health & Medical</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className={`p-4 rounded-lg border ${assessmentForm.vaccinated === 'yes' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <p className="text-sm text-gray-600">Vaccinations</p>
                  <p className="font-medium capitalize">{assessmentForm.vaccinated}</p>
                  {assessmentForm.vaccination_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last: {new Date(assessmentForm.vaccination_date).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
                <div className={`p-4 rounded-lg border ${assessmentForm.flea_treatment === 'yes' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <p className="text-sm text-gray-600">Flea Treatment</p>
                  <p className="font-medium capitalize">{assessmentForm.flea_treatment}</p>
                  {assessmentForm.flea_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last: {new Date(assessmentForm.flea_date).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
                <div className={`p-4 rounded-lg border ${assessmentForm.worm_treatment === 'yes' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <p className="text-sm text-gray-600">Worm Treatment</p>
                  <p className="font-medium capitalize">{assessmentForm.worm_treatment}</p>
                  {assessmentForm.worm_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last: {new Date(assessmentForm.worm_date).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
              </div>

              {(assessmentForm.medical_conditions || assessmentForm.medications || assessmentForm.allergies) && (
                <div className="space-y-3">
                  {assessmentForm.medical_conditions && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Medical Conditions</p>
                      <p className="font-medium text-canine-navy">{assessmentForm.medical_conditions}</p>
                    </div>
                  )}
                  {assessmentForm.medications && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Current Medications</p>
                      <p className="font-medium text-canine-navy">{assessmentForm.medications}</p>
                    </div>
                  )}
                  {assessmentForm.allergies && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Allergies</p>
                      <p className="font-medium text-canine-navy">{assessmentForm.allergies}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Veterinarian</p>
                <p className="font-medium text-canine-navy">{assessmentForm.vet_name}</p>
                <p className="text-canine-navy flex items-center mt-1">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {assessmentForm.vet_phone}
                </p>
              </div>
            </div>

            {/* Behavioral Information */}
            <div>
              <h2 className="text-xl font-semibold text-canine-navy mb-4">Behavior & Training</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Socialization with Dogs</p>
                  <p className="font-medium text-canine-navy capitalize">{assessmentForm.socialization}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Aggression History</p>
                  <p className="font-medium text-canine-navy capitalize">{assessmentForm.aggression}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Separation Anxiety</p>
                  <p className="font-medium text-canine-navy capitalize">{assessmentForm.anxiety}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">House Trained</p>
                  <p className="font-medium text-canine-navy capitalize">{assessmentForm.house_trained}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Leash Behavior</p>
                  <p className="font-medium text-canine-navy capitalize">{assessmentForm.leash_behavior}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Play Style</p>
                  <p className="font-medium text-canine-navy capitalize">{assessmentForm.play_style}</p>
                </div>
              </div>

              {assessmentForm.commands && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Known Commands</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.commands}</p>
                </div>
              )}

              {assessmentForm.triggers && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Triggers to Avoid</p>
                  <p className="font-medium text-canine-navy">{assessmentForm.triggers}</p>
                </div>
              )}
            </div>

            {/* Additional Information */}
            {(assessmentForm.special_instructions || assessmentForm.pickup_persons) && (
              <div>
                <h2 className="text-xl font-semibold text-canine-navy mb-4">Additional Information</h2>
                {assessmentForm.special_instructions && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-3">
                    <p className="text-sm text-gray-600 mb-1">Special Instructions</p>
                    <p className="font-medium text-canine-navy">{assessmentForm.special_instructions}</p>
                  </div>
                )}
                {assessmentForm.pickup_persons && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-3">
                    <p className="text-sm text-gray-600 mb-1">Authorized Pickup Persons</p>
                    <p className="font-medium text-canine-navy">{assessmentForm.pickup_persons}</p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Photo Permission</p>
                  <p className="font-medium text-canine-navy capitalize">{assessmentForm.photo_permission}</p>
                </div>
              </div>
            )}

            {/* Agreement */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-canine-navy mb-4">Agreement & Signature</h2>
              <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                <div className="flex items-center mb-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">Form signed and agreed to terms</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">Digital Signature</p>
                <p className="font-bold text-canine-navy text-lg">{assessmentForm.signature}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Signed on {new Date(assessmentForm.signature_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Admin Notes (if any) */}
            {assessmentForm.admin_notes && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-canine-navy mb-4">Staff Notes</h2>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                  <p className="text-canine-navy">{assessmentForm.admin_notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-between items-center">
            <Link href="/dashboard">
              <button className="text-gray-600 hover:text-gray-800">
                Back to Dashboard
              </button>
            </Link>
            {assessmentForm.status === 'pending' && (
              <div className="text-amber-600 font-medium">
                Your assessment is under review. We'll contact you soon!
              </div>
            )}
            {assessmentForm.status === 'approved' && (
              <Link href="/dashboard/booking">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-canine-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-canine-light-gold transition-colors"
                >
                  Book Your First Day!
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}