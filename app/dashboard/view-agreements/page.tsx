'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  CameraIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  BeakerIcon,
  PhoneIcon,
  HomeIcon,
  UsersIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ViewAgreementsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [agreement, setAgreement] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  useEffect(() => {
    loadAgreements()
  }, [])

  const loadAgreements = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Get signed agreements
      const { data: agreementData } = await supabase
        .from('legal_agreements')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setAgreement(agreementData)
    } catch (error) {
      console.error('Error loading agreements:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    })
  }

  const toggleExpand = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-600 mx-auto"></div>
            <DocumentTextIcon className="h-6 w-6 text-slate-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading agreements...</p>
        </div>
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/dashboard" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
          >
            <DocumentTextIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-display font-bold text-gray-800 mb-3">
              No Agreements Signed
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              You haven't signed any legal agreements yet.
            </p>
            <Link href="/dashboard/legal-agreements" className="btn-primary inline-block">
              Sign Agreements
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  const agreementsList = [
    {
      title: 'Terms & Conditions',
      key: 'terms_accepted',
      timestampKey: 'terms_accepted_at',
      required: true,
      icon: DocumentTextIcon,
      gradient: 'from-blue-500 to-blue-600',
      content: "Canine Paradise Terms & Conditions:\n\n1. Services: We provide daycare services for dogs Monday-Friday, 7:00 AM - 7:00 PM.\n\n2. Fees: All fees must be paid in advance. Subscription packages are non-refundable.\n\n3. Cancellation: Cancellations must be made 24 hours in advance.\n\n4. Behavior: We reserve the right to refuse service to any dog displaying aggressive behavior.\n\n5. Health: All dogs must be in good health and free from contagious diseases.\n\nBy accepting these terms, you acknowledge that you have read, understood, and agree to be bound by these conditions."
    },
    {
      title: 'Injury & Disease Waiver',
      key: 'injury_waiver_agreed',
      timestampKey: 'injury_waiver_agreed_at',
      required: true,
      icon: ShieldCheckIcon,
      gradient: 'from-red-500 to-rose-600',
      content: "Injury & Disease Release Waiver:\n\nI understand that while my dog is in attendance at Canine Paradise, my dog will be socializing and playing with other dogs. I understand that during the course of normal dog play, my dog may sustain injuries.\n\nAll dogs attending Canine Paradise must be in good health. If my dog shows any symptoms of illness, I will not bring my dog to the facility.\n\nI understand that despite all precautions taken by Canine Paradise, there is a risk that my dog may be exposed to or contract diseases from other dogs.\n\nI hereby release and hold harmless Canine Paradise, its owners, employees, and agents from any and all liability, claims, suits, actions, loss, or injury to my dog, or myself, arising from normal dog play during my dog's attendance at Canine Paradise."
    },
    {
      title: 'Photo/Video Permission',
      key: 'photo_permission_granted',
      timestampKey: 'photo_permission_granted_at',
      required: false,
      icon: CameraIcon,
      gradient: 'from-purple-500 to-pink-600',
      content: "Photo & Video Consent (Optional):\n\nI grant permission to Canine Paradise to photograph and/or video record my dog during their stay.\n\nI understand these images may be used for:\n• Social media posts (Facebook, Instagram, etc.)\n• Website content and marketing materials\n• Promotional materials and advertisements\n\nI understand that I will not receive compensation for the use of these images.\n\nNote: This permission is OPTIONAL. If you do not grant permission, we will ensure your dog is not included in any photos or videos shared publicly."
    },
    {
      title: 'Vaccination Requirements',
      key: 'vaccination_requirement_understood',
      timestampKey: 'vaccination_requirement_understood_at',
      required: true,
      icon: BeakerIcon,
      gradient: 'from-green-500 to-emerald-600',
      content: "Vaccination Requirements Agreement:\n\nAll dogs attending Canine Paradise must be current on the following vaccinations:\n\n• Rabies (1 or 3-year vaccine)\n• DHPP/DAPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)\n• Bordetella (Kennel Cough) - must be current within the last 6 months\n• Canine Influenza (H3N2 and H3N8) - recommended\n\nProof of vaccination must be provided before your dog's first day. We reserve the right to refuse service to any dog without current vaccinations.\n\nI understand and agree to maintain current vaccinations for my dog at all times while using Canine Paradise services. I will provide updated vaccination records as needed."
    },
    {
      title: 'Behavioral Assessment',
      key: 'behavioral_assessment_agreed',
      timestampKey: 'behavioral_assessment_agreed_at',
      required: true,
      icon: HeartIcon,
      gradient: 'from-amber-500 to-orange-600',
      content: "Behavioral Assessment Agreement:\n\nAll dogs must pass a behavioral assessment before attending Canine Paradise. This assessment evaluates:\n\n• Socialization skills with other dogs\n• Response to commands and handler direction\n• General temperament and stress levels\n• Play style and energy levels\n\nI understand that:\n• The assessment is mandatory and may take 1-2 hours\n• If my dog does not pass, I may be offered alternative options or training recommendations\n• Canine Paradise reserves the right to remove any dog displaying aggressive, fearful, or overly stressed behavior\n• Reassessment may be required if my dog has not attended in over 6 months\n\nI agree to participate in the behavioral assessment process and accept the evaluation results."
    },
    {
      title: 'Medication Administration Consent',
      key: 'medication_administration_consent',
      timestampKey: 'medication_administration_consent_at',
      required: true,
      icon: ExclamationTriangleIcon,
      gradient: 'from-indigo-500 to-purple-600',
      content: "Medication Administration Consent:\n\nIf my dog requires medication during their stay at Canine Paradise, I understand the following:\n\n• All medications must be provided in original packaging with clear veterinary instructions\n• I must complete a detailed medication authorization form\n• Canine Paradise staff will make reasonable efforts to administer medications as directed\n• There is no additional charge for basic medication administration (oral medications with meals)\n• Complex medication needs (injections, multiple daily doses) may require additional fees or may not be accommodated\n\nI agree to:\n• Provide accurate and complete information about my dog's medications\n• Inform staff of any changes to medication schedules\n• Hold Canine Paradise harmless for any issues arising from medication administration when proper protocols were followed\n\nI acknowledge that Canine Paradise staff are not veterinary professionals and are providing medication administration as a courtesy service."
    },
    {
      title: 'Emergency Contact Consent',
      key: 'emergency_contact_consent',
      timestampKey: 'emergency_contact_consent_at',
      required: true,
      icon: PhoneIcon,
      gradient: 'from-pink-500 to-rose-600',
      content: "Emergency Contact & Veterinary Care Consent:\n\nIn the event of a medical emergency involving my dog, I authorize Canine Paradise to:\n\n• Contact me immediately using the contact information provided\n• Contact my designated emergency contacts if I cannot be reached\n• Seek immediate veterinary care at the nearest available veterinary clinic or emergency hospital\n• Approve emergency medical treatment up to $500 without prior authorization if I cannot be reached\n\nI agree to:\n• Keep my contact information and emergency contacts current at all times\n• Provide my preferred veterinary clinic information\n• Be financially responsible for all veterinary costs incurred\n• Reimburse Canine Paradise for any emergency veterinary expenses paid on my behalf\n\nI understand that Canine Paradise will make reasonable efforts to contact me before authorizing treatment, but in true emergencies, my dog's health and safety take priority."
    },
    {
      title: 'Property Damage Waiver',
      key: 'property_damage_waiver',
      timestampKey: 'property_damage_waiver_at',
      required: true,
      icon: HomeIcon,
      gradient: 'from-orange-500 to-red-600',
      content: "Property Damage Liability Waiver:\n\nI understand that my dog will be in a facility with equipment, furniture, and property belonging to Canine Paradise and other clients.\n\nI agree that:\n• I am responsible for any damage my dog causes to Canine Paradise property, equipment, or facilities\n• I am responsible for any damage my dog causes to property belonging to other clients\n• I will pay for repairs or replacement of damaged items within 30 days of being notified\n• Canine Paradise may suspend services until damages are paid\n\nCanine Paradise agrees to:\n• Provide reasonable supervision to prevent property damage\n• Notify me promptly of any damage caused by my dog\n• Provide itemized estimates for repair or replacement costs\n\nI release Canine Paradise from liability for damage to any personal items I choose to send with my dog (toys, bedding, collars, etc.). I understand that personal items may be lost, damaged, or destroyed during normal play."
    },
    {
      title: 'Collection Procedure',
      key: 'collection_procedure_agreed',
      timestampKey: 'collection_procedure_agreed_at',
      required: true,
      icon: UsersIcon,
      gradient: 'from-teal-500 to-cyan-600',
      content: "Collection & Pick-up Procedure Agreement:\n\nFor the safety and security of all dogs, Canine Paradise has established collection procedures:\n\nDrop-off and Pick-up:\n• Standard hours: Monday-Friday, 7:00 AM - 7:00 PM\n• Dogs must be dropped off and picked up by authorized persons only\n• Valid photo ID required for pick-up\n• Late pick-up fees: $1 per minute after 7:00 PM\n\nAuthorized Persons:\n• I will maintain a current list of authorized persons who may collect my dog\n• Changes to authorized persons must be submitted in writing or via the online portal\n• Canine Paradise will not release my dog to unauthorized persons under any circumstances\n\nUnclaimed Dogs:\n• If my dog is not collected by closing time and I cannot be reached, my emergency contacts will be called\n• After 24 hours, my dog may be transported to a local boarding facility at my expense\n• After 7 days, local animal control will be contacted\n\nI understand and agree to follow all collection procedures to ensure the safety and security of my dog."
    },
    {
      title: 'Data Protection Consent',
      key: 'data_protection_consent',
      timestampKey: 'data_protection_consent_at',
      required: true,
      icon: LockClosedIcon,
      gradient: 'from-gray-600 to-slate-700',
      content: "Data Protection & Privacy Consent:\n\nCanine Paradise collects and processes personal information about you and your dog to provide our services.\n\nInformation we collect:\n• Your name, contact details, and payment information\n• Your dog's name, breed, age, medical history, and behavioral information\n• Emergency contact information\n• Veterinary records and vaccination history\n• Photos and videos (with separate consent)\n\nHow we use your information:\n• To provide daycare and related services\n• To contact you about your dog's care and our services\n• To process payments and maintain financial records\n• To comply with legal and regulatory requirements\n• For safety and security purposes\n\nYour rights:\n• You may request access to your personal information at any time\n• You may request corrections to inaccurate information\n• You may request deletion of your information (subject to legal retention requirements)\n\nWe will:\n• Keep your information secure and confidential\n• Never sell your information to third parties\n• Only share information with veterinarians or emergency services as needed for your dog's care\n\nBy signing this agreement, you consent to our collection, use, and storage of your personal information as described above."
    }
  ]

  const signedCount = agreementsList.filter(item => agreement[item.key]).length
  const totalCount = agreementsList.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <Link href="/dashboard" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors group">
          <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800 rounded-2xl shadow-2xl p-8 mb-8"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                  <DocumentTextIcon className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <div>
                <h1 className="text-4xl font-display font-bold text-white mb-2">
                  Your Legal Agreements
                </h1>
                <p className="text-slate-200 text-lg">Review your signed waivers and consents</p>
                <div className="flex items-center mt-3 space-x-2">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <CheckCircleSolid className="w-5 h-5 text-green-300 mr-2" />
                    <span className="text-white font-semibold">{signedCount} of {totalCount} signed</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <SparklesIcon className="w-16 h-16 text-slate-300 opacity-50" />
            </motion.div>
          </div>
        </motion.div>

        {/* Signature Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl mr-4">
              <CheckCircleSolid className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-800">Signature Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-200">
              <p className="text-sm text-gray-500 mb-1 font-medium">Digital Signature</p>
              <p className="text-lg font-semibold text-gray-800">{agreement.digital_signature}</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-200">
              <p className="text-sm text-gray-500 mb-1 font-medium">Account Name</p>
              <p className="text-lg font-semibold text-gray-800">{profile?.first_name} {profile?.last_name}</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-200">
              <p className="text-sm text-gray-500 mb-1 font-medium">Date Signed</p>
              <p className="text-lg font-semibold text-gray-800">{formatDate(agreement.signed_at)}</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-200">
              <p className="text-sm text-gray-500 mb-1 font-medium">Agreement Version</p>
              <p className="text-lg font-semibold text-gray-800">v{agreement.version || '1.0'}</p>
            </div>
          </div>
        </motion.div>

        {/* Agreements List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-6 flex items-center">
            <ShieldCheckIcon className="w-7 h-7 mr-3 text-gray-600" />
            Agreement Status
          </h2>

          <div className="space-y-4">
            {agreementsList.map((item, index) => {
              const Icon = item.icon
              const isSigned = agreement[item.key]
              const timestamp = agreement[item.timestampKey]
              const isExpanded = expandedItems.includes(item.key)

              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    isSigned
                      ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md hover:shadow-lg'
                      : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start flex-1">
                        <div className={`bg-gradient-to-br ${item.gradient} p-3 rounded-xl mr-4 shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-display font-bold text-gray-800">
                              {item.title}
                            </h3>
                            {!item.required && (
                              <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full font-semibold border border-purple-200">
                                Optional
                              </span>
                            )}
                          </div>

                          <div className="flex items-center text-sm space-x-4">
                            <div className={`flex items-center px-3 py-1.5 rounded-full ${
                              isSigned
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {isSigned ? (
                                <>
                                  <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                  <span className="font-semibold">Agreed</span>
                                </>
                              ) : (
                                <>
                                  <XMarkIcon className="w-4 h-4 mr-1.5" />
                                  <span className="font-semibold">Disagreed</span>
                                </>
                              )}
                            </div>

                            {isSigned && timestamp && (
                              <div className="flex items-center text-gray-600">
                                <ClockIcon className="w-4 h-4 mr-1.5" />
                                <span>{formatDate(timestamp)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        {isSigned ? (
                          <CheckCircleSolid className="w-8 h-8 text-green-500" />
                        ) : (
                          <XMarkIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                    </div>

                    {isSigned && (
                      <button
                        onClick={() => toggleExpand(item.key)}
                        className="mt-4 w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-xl hover:from-slate-700 hover:to-gray-800 transition-all duration-300 shadow-md hover:shadow-lg font-semibold group"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUpIcon className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                            Hide Full Agreement
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
                            Read Full Agreement
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && isSigned && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-inner">
                            <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                              <DocumentTextIcon className="w-6 h-6 text-slate-600 mr-3" />
                              <h4 className="text-lg font-display font-bold text-gray-800">Full Agreement Text</h4>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-md"
          >
            <div className="flex items-start">
              <div className="bg-amber-500 p-2 rounded-lg mr-4 mt-0.5">
                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-900 leading-relaxed">
                  <strong className="font-semibold">Important Notice:</strong> These agreements were signed electronically on {formatDate(agreement.signed_at)}.
                  If you need to update any information or have questions about these agreements, please contact us at{' '}
                  <a href="mailto:legal@canineparadise.com" className="text-amber-700 underline hover:text-amber-800">
                    legal@canineparadise.com
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
