'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  UserIcon,
  PhoneIcon,
  HomeIcon,
  HeartIcon,
  DocumentTextIcon,
  CameraIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function AssessmentForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [dogPhoto, setDogPhoto] = useState<File | null>(null)
  const [vaccinationRecord, setVaccinationRecord] = useState<File | null>(null)
  const [assessmentDate, setAssessmentDate] = useState('')

  const totalSteps = 6

  const [formData, setFormData] = useState({
    // Owner Information
    title: '',
    firstName: '',
    lastName: '',
    mobile: '',
    workPhone: '',
    address: '',
    postCode: '',
    email: '',

    // Emergency Contact
    emergencyTitle: '',
    emergencyFirstName: '',
    emergencyLastName: '',
    emergencyMobile: '',
    emergencyWorkPhone: '',
    emergencyAddress: '',
    emergencyPostCode: '',
    emergencyEmail: '',

    // Password for pickup
    pickupPassword: '',

    // Dog Information
    dogName: '',
    breed: '',
    microchipNumber: '',
    gender: '',
    colors: '',
    age: '',
    birthdate: '',
    isSpayedNeutered: '',
    chemicalCastrationDate: '',
    chemicalCastrationExpiry: '',

    // Medical History
    vetPractice: '',
    vetPhone: '',
    vetAddress: '',
    vetPostCode: '',
    kennelCoughDate: '',
    kennelCoughDue: '',
    fiveInOneDate: '',
    fiveInOneDue: '',
    fleaTreatmentDate: '',
    fleaTreatmentDue: '',
    wormTreatmentDate: '',
    wormTreatmentDue: '',
    medicalConditions: '',
    requiresMedication: false,
    medicationDetails: '',

    // Feeding Instructions
    providesOwnFood: true,
    feedingInstructions: '',
    feedingSchedule: {
      breakfast: '',
      lunch: '',
      dinner: '',
      treats: '',
    },

    // Behavior Information
    hasEscaped: false,
    hasJumpedFence: false,
    foodAggression: false,
    hasGrowled: false,
    hasBitten: false,
    behaviorDetails: '',
    hasAttendedTraining: false,
    trainingDetails: '',
    hasAttendedDaycare: false,
    daycareDetails: '',
    lastDaycareDate: '',

    // Insurance & Agreement
    hasInsurance: false,
    insuranceCompany: '',
    agreedToTerms: false,
  })

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDogPhoto(file)
      toast.success('Photo uploaded successfully')
    }
  }

  const handleVaccinationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVaccinationRecord(file)
      toast.success('Vaccination record uploaded successfully')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    // Validate required fields
    if (!dogPhoto) {
      toast.error('Please upload a photo of your dog')
      setLoading(false)
      return
    }

    if (!vaccinationRecord) {
      toast.error('Please upload vaccination records')
      setLoading(false)
      return
    }

    if (!assessmentDate) {
      toast.error('Please select an assessment date')
      setLoading(false)
      return
    }

    if (!formData.agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      setLoading(false)
      return
    }

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Assessment form submitted successfully! We\'ll contact you within 24 hours.')
    router.push('/dashboard')
  }

  const getFridayDates = () => {
    const fridays = []
    const today = new Date()

    for (let i = 0; i < 8; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      if (date.getDay() === 5) { // Friday is day 5
        fridays.push(date.toISOString().split('T')[0])
      }
    }

    return fridays
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <UserIcon className="h-12 w-12 text-canine-gold mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-canine-navy">Owner Information</h2>
              <p className="text-gray-600 mt-2">Let's start with your details</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <select
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Number
                </label>
                <input
                  type="tel"
                  value={formData.workPhone}
                  onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.postCode}
                  onChange={(e) => setFormData({ ...formData, postCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Password *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BARNEY"
                  value={formData.pickupPassword}
                  onChange={(e) => setFormData({ ...formData, pickupPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required if someone else collects your dog
                </p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-canine-navy mb-4">
                Emergency Contact
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyFirstName}
                    onChange={(e) => setFormData({ ...formData, emergencyFirstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyLastName}
                    onChange={(e) => setFormData({ ...formData, emergencyLastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.emergencyMobile}
                    onChange={(e) => setFormData({ ...formData, emergencyMobile: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.emergencyEmail}
                    onChange={(e) => setFormData({ ...formData, emergencyEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <HeartIcon className="h-12 w-12 text-canine-gold mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-canine-navy">Dog Information</h2>
              <p className="text-gray-600 mt-2">Tell us about your furry friend</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dog's Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dogName}
                  onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed *
                </label>
                <input
                  type="text"
                  required
                  placeholder="If mixed, please specify"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Microchip Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.microchipNumber}
                  onChange={(e) => setFormData({ ...formData, microchipNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">All dogs must be microchipped</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color(s) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthdate
                </label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spayed/Neutered? *
                </label>
                <select
                  required
                  value={formData.isSpayedNeutered}
                  onChange={(e) => setFormData({ ...formData, isSpayedNeutered: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Chemically">Chemically Castrated</option>
                </select>
              </div>

              {formData.isSpayedNeutered === 'Chemically' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chemical Castration Date
                    </label>
                    <input
                      type="date"
                      value={formData.chemicalCastrationDate}
                      onChange={(e) => setFormData({ ...formData, chemicalCastrationDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.chemicalCastrationExpiry}
                      onChange={(e) => setFormData({ ...formData, chemicalCastrationExpiry: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            {formData.gender === 'Male' && formData.isSpayedNeutered === 'No' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Male dogs over 1 year who are not castrated may have limited socialization opportunities in daycare for safety reasons.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DocumentTextIcon className="h-12 w-12 text-canine-gold mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-canine-navy">Medical History</h2>
              <p className="text-gray-600 mt-2">Help us keep your dog healthy</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vet Practice *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vetPractice}
                  onChange={(e) => setFormData({ ...formData, vetPractice: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vet Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.vetPhone}
                  onChange={(e) => setFormData({ ...formData, vetPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vet Address
                </label>
                <input
                  type="text"
                  value={formData.vetAddress}
                  onChange={(e) => setFormData({ ...formData, vetAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <h4 className="font-semibold text-canine-navy mb-3">Vaccination Dates</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kennel Cough - Date Given *
                </label>
                <input
                  type="date"
                  required
                  value={formData.kennelCoughDate}
                  onChange={(e) => setFormData({ ...formData, kennelCoughDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kennel Cough - Date Due *
                </label>
                <input
                  type="date"
                  required
                  value={formData.kennelCoughDue}
                  onChange={(e) => setFormData({ ...formData, kennelCoughDue: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  5-in-1 Vaccine - Date Given *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fiveInOneDate}
                  onChange={(e) => setFormData({ ...formData, fiveInOneDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  5-in-1 Vaccine - Date Due *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fiveInOneDue}
                  onChange={(e) => setFormData({ ...formData, fiveInOneDue: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flea Treatment - Date
                </label>
                <input
                  type="date"
                  value={formData.fleaTreatmentDate}
                  onChange={(e) => setFormData({ ...formData, fleaTreatmentDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Worm Treatment - Date
                </label>
                <input
                  type="date"
                  value={formData.wormTreatmentDate}
                  onChange={(e) => setFormData({ ...formData, wormTreatmentDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions/Injuries
                </label>
                <textarea
                  rows={3}
                  placeholder="E.g., hip issues, allergies, recent injuries..."
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requiresMedication}
                    onChange={(e) => setFormData({ ...formData, requiresMedication: e.target.checked })}
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    My dog requires medication during daycare
                  </span>
                </label>
              </div>

              {formData.requiresMedication && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Details
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Please provide medication name, dosage, and administration times"
                    value={formData.medicationDetails}
                    onChange={(e) => setFormData({ ...formData, medicationDetails: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: We are not a veterinary practice. Medications must be clearly labeled.
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <ExclamationTriangleIcon className="h-12 w-12 text-canine-gold mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-canine-navy">Behavior & History</h2>
              <p className="text-gray-600 mt-2">Help us understand your dog better</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-canine-navy">Has your dog ever:</h3>

              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.hasEscaped}
                    onChange={(e) => setFormData({ ...formData, hasEscaped: e.target.checked })}
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-3"
                  />
                  <span className="text-gray-700">Escaped from your property</span>
                </label>

                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.hasJumpedFence}
                    onChange={(e) => setFormData({ ...formData, hasJumpedFence: e.target.checked })}
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-3"
                  />
                  <span className="text-gray-700">Jumped over a 6-foot wall/fence</span>
                </label>

                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.foodAggression}
                    onChange={(e) => setFormData({ ...formData, foodAggression: e.target.checked })}
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-3"
                  />
                  <span className="text-gray-700">Reacted negatively around food</span>
                </label>

                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.hasGrowled}
                    onChange={(e) => setFormData({ ...formData, hasGrowled: e.target.checked })}
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-3"
                  />
                  <span className="text-gray-700">Growled at a person/other dog</span>
                </label>

                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.hasBitten}
                    onChange={(e) => setFormData({ ...formData, hasBitten: e.target.checked })}
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-3"
                  />
                  <span className="text-gray-700">Bitten someone</span>
                </label>
              </div>

              {(formData.hasEscaped || formData.hasJumpedFence || formData.foodAggression || formData.hasGrowled || formData.hasBitten) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please provide details *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.behaviorDetails}
                    onChange={(e) => setFormData({ ...formData, behaviorDetails: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="Please explain the circumstances..."
                  />
                </div>
              )}

              <div className="border-t pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasAttendedTraining}
                    onChange={(e) => setFormData({ ...formData, hasAttendedTraining: e.target.checked })}
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-3"
                  />
                  <span className="text-gray-700">Has attended formal training/group activities</span>
                </label>

                {formData.hasAttendedTraining && (
                  <textarea
                    rows={2}
                    placeholder="Please describe training details..."
                    value={formData.trainingDetails}
                    onChange={(e) => setFormData({ ...formData, trainingDetails: e.target.value })}
                    className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                )}
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasAttendedDaycare}
                    onChange={(e) => setFormData({ ...formData, hasAttendedDaycare: e.target.checked })}
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-3"
                  />
                  <span className="text-gray-700">Has attended daycare before</span>
                </label>

                {formData.hasAttendedDaycare && (
                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      placeholder="Which daycare?"
                      value={formData.daycareDetails}
                      onChange={(e) => setFormData({ ...formData, daycareDetails: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={formData.lastDaycareDate}
                      onChange={(e) => setFormData({ ...formData, lastDaycareDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CameraIcon className="h-12 w-12 text-canine-gold mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-canine-navy">Documents & Photos</h2>
              <p className="text-gray-600 mt-2">Upload required documents</p>
            </div>

            <div className="space-y-6">
              {/* Dog Photo Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Upload Dog Photo *
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Please upload a clear photo of your dog
                  </p>

                  {dogPhoto ? (
                    <div className="mb-4">
                      <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        {dogPhoto.name}
                      </div>
                    </div>
                  ) : null}

                  <label className="cursor-pointer">
                    <span className="btn-primary inline-flex items-center">
                      Choose Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Vaccination Record Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Upload Vaccination Records *
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Please upload your dog's up-to-date vaccination booklet/records from your vet
                  </p>

                  {vaccinationRecord ? (
                    <div className="mb-4">
                      <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        {vaccinationRecord.name}
                      </div>
                    </div>
                  ) : null}

                  <label className="cursor-pointer">
                    <span className="btn-primary inline-flex items-center">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleVaccinationUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-canine-navy mb-3">Insurance Information</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasInsurance}
                    onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.checked })}
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-3"
                  />
                  <span className="text-gray-700">My dog has pet insurance *</span>
                </label>

                {formData.hasInsurance && (
                  <input
                    type="text"
                    placeholder="Insurance company name"
                    value={formData.insuranceCompany}
                    onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}
                    className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                  />
                )}

                {!formData.hasInsurance && (
                  <p className="text-sm text-red-600 mt-2">
                    Note: All dogs attending daycare must be insured
                  </p>
                )}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CalendarDaysIcon className="h-12 w-12 text-canine-gold mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-canine-navy">Book Assessment Day</h2>
              <p className="text-gray-600 mt-2">Select a Friday for your dog's assessment</p>
            </div>

            <div className="bg-canine-sky rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-canine-navy mb-2">Assessment Day Information</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Assessments are held every Friday</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Drop-off between 7:00 AM - 9:00 AM</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Pick-up between 4:00 PM - 7:00 PM</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>We'll assess your dog's temperament and social skills</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>You'll receive feedback within 24 hours</span>
                </li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Assessment Date (Fridays Only) *
              </label>
              <select
                required
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
              >
                <option value="">Choose a Friday...</option>
                {getFridayDates().map((date) => (
                  <option key={date} value={date}>
                    {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Terms and Conditions */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="font-semibold text-canine-navy mb-4">Terms and Conditions</h3>

              <div className="space-y-3 text-sm text-gray-700 mb-4 max-h-64 overflow-y-auto">
                <p>
                  <strong>Liability Declaration:</strong> I confirm that I am the legal owner of my dog;
                  that my dog has not been ill with any contagious disease within the past 30 days;
                  and that my dog has received all necessary vaccinations.
                </p>

                <p>
                  <strong>Daycare Risks:</strong> I understand that Canine Paradise operates a Doggy Day Care
                  where my dog will socialize with other dogs. I accept the risks involved and agree that
                  Canine Paradise is not liable for any injuries or illnesses except those arising from negligence.
                </p>

                <p>
                  <strong>Behavior Policy:</strong> I have disclosed any known dangers associated with my dog.
                  Any behavior deemed dangerous may result in dismissal from daycare.
                </p>

                <p>
                  <strong>Medical Authorization:</strong> If medical problems develop and I cannot be contacted,
                  I authorize Canine Paradise to do whatever they deem necessary for my dog's safety and wellbeing.
                </p>

                <p>
                  <strong>Payment - Monthly Subscriptions:</strong><br />
                  • 4 days/month: £160 (£40 per day)<br />
                  • 8 days/month: £304 (£38 per day)<br />
                  • 12 days/month: £456 (£38 per day)<br />
                  • 16 days/month: £576 (£36 per day)<br />
                  • 20 days/month: £720 (£36 per day)<br />
                  <em>Additional days charged at your subscription rate. Assessment day: £40.</em>
                </p>
              </div>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded mr-3 mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to all terms and conditions *
                </span>
              </label>
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo.jpeg"
            alt="Canine Paradise"
            width={180}
            height={60}
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-display font-bold text-canine-navy">
            Daycare Assessment Form
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-canine-gold h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="btn-outline flex items-center"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-2" />
                Back
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="btn-primary flex items-center ml-auto"
              >
                Next
                <ChevronRightIcon className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.agreedToTerms}
                className="btn-primary flex items-center ml-auto"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Submit Assessment
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}