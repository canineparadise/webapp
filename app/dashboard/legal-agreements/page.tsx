'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LegalAgreementsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [existingAgreement, setExistingAgreement] = useState<any>(null)
  const [signature, setSignature] = useState('')
  const [signatureDate, setSignatureDate] = useState('')
  const [agreements, setAgreements] = useState({
    terms_accepted: false,
    injury_waiver_agreed: false,
    photo_permission_granted: false,
    vaccination_requirement_understood: false,
    behavioral_assessment_agreed: false,
    medication_administration_consent: false,
    emergency_contact_consent: false,
    property_damage_waiver: false,
    collection_procedure_agreed: false,
    data_protection_consent: false,
    notice_period_accepted: false,
  })

  useEffect(() => {
    checkAuthAndAgreements()
  }, [])

  const checkAuthAndAgreements = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Check for existing agreements
      const { data: existing } = await supabase
        .from('legal_agreements')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        setExistingAgreement(existing)
        setSignature(existing.digital_signature || '')
        setSignatureDate(existing.signed_at ? new Date(existing.signed_at).toLocaleDateString() : '')
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()

      if (profile && !signature) {
        setSignature(`${profile.first_name} ${profile.last_name}`)
      }
    } catch (error) {
      console.error('Error loading agreements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAgreement = (key: string) => {
    setAgreements(prev => ({
      ...prev,
      [key]: !(prev as any)[key]
    }))
  }

  // Photo permission is optional, all others required
  const requiredAgreementsAccepted =
    agreements.terms_accepted &&
    agreements.injury_waiver_agreed &&
    agreements.vaccination_requirement_understood &&
    agreements.behavioral_assessment_agreed &&
    agreements.medication_administration_consent &&
    agreements.emergency_contact_consent &&
    agreements.property_damage_waiver &&
    agreements.collection_procedure_agreed &&
    agreements.data_protection_consent &&
    agreements.notice_period_accepted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!requiredAgreementsAccepted) {
      toast.error('Please accept all required agreements to continue')
      return
    }

    if (!signature.trim()) {
      toast.error('Please provide your digital signature')
      return
    }

    setSaving(true)

    try {
      const now = new Date().toISOString()

      const agreementData = {
        user_id: user.id,
        ...agreements,
        // Add timestamps for each agreement when they check the box
        terms_accepted_at: agreements.terms_accepted ? now : null,
        injury_waiver_agreed_at: agreements.injury_waiver_agreed ? now : null,
        photo_permission_granted_at: agreements.photo_permission_granted ? now : null,
        vaccination_requirement_understood_at: agreements.vaccination_requirement_understood ? now : null,
        behavioral_assessment_agreed_at: agreements.behavioral_assessment_agreed ? now : null,
        medication_administration_consent_at: agreements.medication_administration_consent ? now : null,
        emergency_contact_consent_at: agreements.emergency_contact_consent ? now : null,
        property_damage_waiver_at: agreements.property_damage_waiver ? now : null,
        collection_procedure_agreed_at: agreements.collection_procedure_agreed ? now : null,
        data_protection_consent_at: agreements.data_protection_consent ? now : null,
        notice_period_accepted: agreements.notice_period_accepted,
        notice_period_accepted_at: agreements.notice_period_accepted ? now : null,
        digital_signature: signature,
        ip_address: null, // Could capture this if needed
        signed_at: now,
        version: '1.0',
        updated_at: now
      }

      let error

      if (existingAgreement) {
        const result = await supabase
          .from('legal_agreements')
          .update(agreementData)
          .eq('id', existingAgreement.id)
        error = result.error
      } else {
        const result = await supabase
          .from('legal_agreements')
          .insert(agreementData)
        error = result.error
      }

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      toast.success('Legal agreements signed successfully!')

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error: any) {
      console.error('Error saving agreements:', error)
      toast.error('Failed to save agreements')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agreements...</p>
        </div>
      </div>
    )
  }

  if (existingAgreement && existingAgreement.terms_accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <Link href="/dashboard" className="text-canine-gold hover:text-canine-light-gold mb-4 inline-flex items-center">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-display font-bold text-canine-navy">
                Legal Agreements
              </h1>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-green-800">Agreements Already Signed</h3>
                    <p className="mt-2 text-green-700">
                      You have already signed all required legal agreements on {signatureDate}.
                    </p>
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-green-700">Digital Signature: <span className="font-semibold">{existingAgreement.digital_signature}</span></p>
                      <p className="text-sm text-green-700 mt-1">Version: {existingAgreement.version}</p>
                    </div>
                    <div className="mt-6">
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-canine-gold hover:bg-canine-light-gold"
                      >
                        Return to Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-display font-bold text-canine-navy flex items-center gap-3">
              <DocumentTextIcon className="h-10 w-10 text-canine-gold" />
              Legal Agreements & Waivers
            </h1>
            <p className="text-gray-600 mt-2">
              Please review and accept all agreements before your dog can attend daycare
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Terms and Conditions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-canine-navy mb-4 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-canine-gold" />
                Terms and Conditions
              </h2>

              <div className="prose max-w-none text-gray-700 space-y-4 text-sm">
                <p><strong>1. Service Agreement</strong></p>
                <p>Canine Paradise provides dog daycare services Monday through Friday, 7:00 AM to 7:00 PM. Services include supervised play, socialization, and care for your dog(s) in our facility.</p>

                <p><strong>2. Health Requirements</strong></p>
                <ul className="list-disc pl-6">
                  <li>All dogs must be fully vaccinated (DHPP, Rabies, Bordetella)</li>
                  <li>Current flea and worming treatments are required</li>
                  <li>Dogs must be in good health and free from contagious conditions</li>
                  <li>Vaccination records must be provided and kept current</li>
                </ul>

                <p><strong>3. Assessment Requirements</strong></p>
                <p>All dogs must complete a FREE assessment day (Fridays only). This ensures your dog is comfortable in our environment and can safely socialize with other dogs.</p>

                <p><strong>4. Pricing & Payment</strong></p>
                <p className="font-semibold mb-2">Monthly Package Options (Minimum 4 days/month required):</p>
                <ul className="list-disc pl-6 mb-3">
                  <li>4 days per month: £40/day = £160 total</li>
                  <li>8 days per month: £38/day = £304 total</li>
                  <li>12 days per month: £38/day = £456 total</li>
                  <li>16 days per month: £36/day = £576 total</li>
                  <li>20 days per month: £36/day = £720 total</li>
                </ul>

                <p className="font-semibold mb-2">Additional Days:</p>
                <ul className="list-disc pl-6 mb-3">
                  <li>Extra days are charged at your subscription rate:</li>
                  <li className="ml-4">4-day package clients: £40 per additional day</li>
                  <li className="ml-4">8 or 12-day package clients: £38 per additional day</li>
                  <li className="ml-4">16 or 20-day package clients: £36 per additional day</li>
                </ul>
                <p className="text-sm italic">Example: 15 days with 12-day package = £456 + (3 × £38) = £570 total</p>

                <p className="font-semibold mb-2">Important Information:</p>
                <ul className="list-disc pl-6 mb-3">
                  <li>Minimum booking requirement: 4 days per month</li>
                  <li>Service hours: 7 AM - 7 PM, Monday to Friday</li>
                  <li>Late pickup fee: £1 per minute after 7 PM</li>
                  <li>Monthly package days must be used within the calendar month - no carry over</li>
                  <li>Payment is due at time of booking</li>
                </ul>

                <p><strong>5. Cancellation Policy</strong></p>
                <p>24-hour notice required for individual day cancellations. Monthly package days cannot be carried over to the following month.</p>

                <p><strong>6. Subscription Cancellation - One Month Notice Period</strong></p>
                <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 my-3">
                  <p className="font-bold text-amber-900 mb-2">⚠️ IMPORTANT: Notice Period Requirement</p>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    <li><strong>One (1) full calendar month notice is required to cancel your subscription.</strong></li>
                    <li>If you wish to stop attending, you must provide notice at least 30 days before the effective cancellation date.</li>
                    <li>If less than one month's notice is given, you will be charged for one additional month based on your current subscription tier.</li>
                    <li>Example: If you cancel on January 15th, your subscription will end February 28th (or 30 days from cancellation date, whichever is later), and you will be charged for both January and February.</li>
                    <li>Cancellation becomes effective 30 days from the date you submit your cancellation request.</li>
                    <li>You may continue to use your remaining days during the notice period.</li>
                  </ul>
                </div>

                <p><strong>7. Owner Responsibilities</strong></p>
                <ul className="list-disc pl-6">
                  <li>Provide accurate and complete information about your dog</li>
                  <li>Inform us of any behavioral or health changes</li>
                  <li>Provide emergency contact information</li>
                  <li>Pick up your dog by closing time (7 PM)</li>
                </ul>
              </div>

              <label className="flex items-start mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.terms_accepted}
                  onChange={() => handleToggleAgreement('terms_accepted')}
                  className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                />
                <span className="text-gray-700">
                  I have read and agree to the Terms and Conditions
                </span>
              </label>
            </div>

            {/* Injury Waiver */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-canine-navy mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-500" />
                Injury & Liability Waiver
              </h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-red-800 mb-2">IMPORTANT: Please read carefully</p>
                <p className="text-sm text-red-700">
                  This waiver releases Canine Paradise from liability for injuries that may occur during normal daycare activities.
                </p>
              </div>

              <div className="prose max-w-none text-gray-700 space-y-4 text-sm">
                <p>
                  <strong>PLEASE READ CAREFULLY:</strong> Dog play and interaction carries inherent risks. Despite our best efforts to supervise and manage play, injuries can occur during normal dog interaction including but not limited to:
                </p>
                <ul className="list-disc pl-6">
                  <li>Scratches, punctures, or bite wounds from play or altercations</li>
                  <li>Sprains, strains, or other injuries from running and playing</li>
                  <li>Transmission of parasites or illnesses despite health requirements</li>
                  <li>Stress-related conditions</li>
                  <li>Injuries from facility equipment or surfaces</li>
                </ul>

                <p className="font-semibold">
                  By signing below, you acknowledge and agree that:
                </p>
                <ol className="list-decimal pl-6">
                  <li>You understand dogs can be unpredictable and injuries may occur even with proper supervision</li>
                  <li>You accept the risks inherent in dog socialization and group play</li>
                  <li>You release Canine Paradise, its owners, employees, and agents from any liability for injuries, illness, death, loss, or damage to personal property</li>
                  <li>You agree to indemnify Canine Paradise for any damages or injuries caused by your dog to other dogs, people, or property</li>
                  <li>You are solely responsible for any veterinary costs resulting from injuries or illness</li>
                  <li>Canine Paradise reserves the right to seek emergency veterinary care at your expense</li>
                  <li>This waiver remains in effect for all future visits unless explicitly revoked in writing</li>
                </ol>

                <p className="font-semibold text-red-700">
                  I UNDERSTAND THAT BY AGREEING TO THIS WAIVER, I AM GIVING UP SUBSTANTIAL RIGHTS, INCLUDING THE RIGHT TO SUE.
                </p>
              </div>

              <label className="flex items-start mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.injury_waiver_agreed}
                  onChange={() => handleToggleAgreement('injury_waiver_agreed')}
                  className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                />
                <span className="text-gray-700 font-semibold">
                  I understand and accept all risks and release Canine Paradise from liability
                </span>
              </label>
            </div>

            {/* Photo/Video Permission */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-canine-navy mb-4 flex items-center">
                <CameraIcon className="h-6 w-6 mr-2 text-canine-gold" />
                Photo & Video Permission
              </h2>

              <div className="prose max-w-none text-gray-700 space-y-4 text-sm">
                <p>
                  Canine Paradise may take photos and videos of dogs during daycare activities for:
                </p>
                <ul className="list-disc pl-6">
                  <li>Social media posts (Facebook, Instagram)</li>
                  <li>Website content and promotional materials</li>
                  <li>Daily report cards to owners</li>
                  <li>Training and safety documentation</li>
                </ul>

                <p>
                  By granting permission, you agree that:
                </p>
                <ul className="list-disc pl-6">
                  <li>Photos/videos become property of Canine Paradise</li>
                  <li>No compensation will be provided for use of images</li>
                  <li>Your dog's name may be used in posts</li>
                  <li>You can revoke permission at any time in writing</li>
                </ul>
              </div>

              <label className="flex items-start mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.photo_permission_granted}
                  onChange={() => handleToggleAgreement('photo_permission_granted')}
                  className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                />
                <span className="text-gray-700">
                  I grant permission to use photos/videos of my dog(s) <span className="text-gray-500 italic">(Optional)</span>
                </span>
              </label>
            </div>

            {/* Health & Medical */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-canine-navy mb-4 flex items-center">
                <ShieldCheckIcon className="h-6 w-6 mr-2 text-green-600" />
                Health & Medical Agreements
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Vaccination Requirements</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    I understand my dog must maintain current vaccinations and I will provide updated records as required.
                  </p>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.vaccination_requirement_understood}
                      onChange={() => handleToggleAgreement('vaccination_requirement_understood')}
                      className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700">
                      I understand and agree to vaccination requirements
                    </span>
                  </label>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Behavioral Disclosure</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    I have disclosed all known behavioral issues, triggers, and medical conditions. I understand failure to disclose may result in dismissal from daycare.
                  </p>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.behavioral_assessment_agreed}
                      onChange={() => handleToggleAgreement('behavioral_assessment_agreed')}
                      className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700">
                      I have fully disclosed all behavioral and medical information
                    </span>
                  </label>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Medication Administration</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    If my dog requires medication, I will provide clear written instructions. I understand staff will make reasonable efforts to administer medication but cannot guarantee compliance.
                  </p>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.medication_administration_consent}
                      onChange={() => handleToggleAgreement('medication_administration_consent')}
                      className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700">
                      I understand the medication administration policy
                    </span>
                  </label>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Emergency Veterinary Care</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    In case of emergency, Canine Paradise will attempt to contact me and my emergency contact. If we cannot be reached, Canine Paradise has permission to seek veterinary care at my expense.
                  </p>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.emergency_contact_consent}
                      onChange={() => handleToggleAgreement('emergency_contact_consent')}
                      className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700">
                      I authorize emergency veterinary care if needed
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Agreements */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-canine-navy mb-4">
                Additional Agreements
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Property Damage</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    I understand that I am responsible for any damage or destruction of property caused by my dog.
                  </p>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.property_damage_waiver}
                      onChange={() => handleToggleAgreement('property_damage_waiver')}
                      className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700">
                      I accept responsibility for property damage
                    </span>
                  </label>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Collection Procedure</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Only authorized persons listed in my account can collect my dog. Photo ID may be required. Dogs not collected by 7 PM may incur additional charges.
                  </p>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.collection_procedure_agreed}
                      onChange={() => handleToggleAgreement('collection_procedure_agreed')}
                      className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700">
                      I understand the collection procedures
                    </span>
                  </label>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Data Protection</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    I consent to Canine Paradise storing and processing my personal data and my dog's information for the purpose of providing daycare services.
                  </p>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.data_protection_consent}
                      onChange={() => handleToggleAgreement('data_protection_consent')}
                      className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700">
                      I consent to data storage and processing
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* One Month Notice Period Agreement */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-amber-300">
              <h2 className="text-xl font-semibold text-canine-navy mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-amber-600" />
                Subscription Cancellation Notice Period
              </h2>

              <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6 mb-6">
                <p className="text-sm font-bold text-amber-900 mb-3">
                  ⚠️ CRITICAL REQUIREMENT: ONE MONTH NOTICE PERIOD
                </p>
                <div className="prose max-w-none text-amber-900 space-y-3 text-sm">
                  <p className="font-semibold">
                    By accepting this agreement, you understand and agree that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>You must provide one (1) full calendar month (30 days) notice if you wish to cancel your subscription.</strong></li>
                    <li>If you cancel with less than 30 days notice, you will be charged for one additional month at your current subscription rate.</li>
                    <li>The cancellation becomes effective 30 days from the date you submit your cancellation request.</li>
                    <li>During the notice period, you may continue to use any remaining days in your subscription.</li>
                    <li>No refunds will be provided for unused days after cancellation.</li>
                  </ul>

                  <div className="bg-white border border-amber-400 rounded p-3 mt-4">
                    <p className="font-bold text-amber-900 mb-2">Example:</p>
                    <p className="text-xs">
                      If you submit a cancellation request on <strong>January 15, 2025</strong>:<br/>
                      • Your effective cancellation date will be <strong>February 14, 2025</strong> (30 days later)<br/>
                      • You will be charged for both January and February<br/>
                      • You can continue using your subscription until February 14th<br/>
                      • After February 14th, no further charges will apply
                    </p>
                  </div>

                  <p className="font-bold text-red-700 mt-4">
                    THIS IS A BINDING COMMITMENT. FAILURE TO PROVIDE PROPER NOTICE WILL RESULT IN ADDITIONAL CHARGES.
                  </p>
                </div>
              </div>

              <label className="flex items-start cursor-pointer bg-white border-2 border-amber-400 rounded-lg p-4 hover:bg-amber-50 transition-colors">
                <input
                  type="checkbox"
                  checked={agreements.notice_period_accepted}
                  onChange={() => handleToggleAgreement('notice_period_accepted')}
                  className="mt-1 mr-3 h-5 w-5 text-amber-600 focus:ring-amber-600 rounded"
                />
                <span className="text-gray-800 font-semibold">
                  I have read and fully understand the one month notice period requirement. I agree that if I wish to cancel my subscription, I must provide 30 days notice or I will be charged for an additional month.
                </span>
              </label>
            </div>

            {/* Digital Signature */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-canine-navy mb-4 flex items-center">
                <PencilSquareIcon className="h-6 w-6 mr-2 text-canine-gold" />
                Digital Signature
              </h2>

              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  By providing your digital signature below, you confirm that you have read, understood, and agree to all the terms, conditions, and waivers outlined above.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="Enter your full legal name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This serves as your electronic signature
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Today's Date
                  </label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString()}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 font-medium">
                Cancel
              </Link>

              <motion.button
                whileHover={{ scale: requiredAgreementsAccepted ? 1.02 : 1 }}
                whileTap={{ scale: requiredAgreementsAccepted ? 0.98 : 1 }}
                type="submit"
                disabled={!requiredAgreementsAccepted || saving}
                className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center ${
                  requiredAgreementsAccepted
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing Agreements...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Sign All Agreements
                  </>
                )}
              </motion.button>
            </div>

            {!requiredAgreementsAccepted && (
              <p className="text-center text-sm text-amber-600">
                Please accept all agreements to continue
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
}