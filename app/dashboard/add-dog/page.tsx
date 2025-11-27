'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  HeartIcon,
  CameraIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  HomeIcon,
  BeakerIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { uploadDogPhoto, uploadVaccinationCertificate } from '@/lib/storage'
import Link from 'next/link'

export default function AddDogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dogCount, setDogCount] = useState(0)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [vaccinationFile, setVaccinationFile] = useState<File | null>(null)
  const [vaccinationFileName, setVaccinationFileName] = useState<string>('')
  const [currentSection, setCurrentSection] = useState(0)
  const [draftDogId, setDraftDogId] = useState<string | null>(null)
  const [lastSavedSection, setLastSavedSection] = useState(0)

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    breed: '',
    date_of_birth: '',
    gender: 'male',
    size: 'medium',
    weight: '',
    color: '',
    neutered: false,
    microchipped: false,
    microchip_number: '',
    assessment_completed: false,

    // Health Information
    vaccinated: false,
    vaccination_expiry: '',
    has_vaccination_docs: false,
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

    // Behavioral Profile
    resource_guarding: false,
    separation_anxiety: false,
    excessive_barking: false,
    leash_pulling: false,
    house_trained: true,
    crate_trained: false,
    aggression_triggers: '',
    behavioral_challenges: '',
    training_needs: '',

    // Social Behavior
    good_with_dogs: true,
    good_with_cats: false,
    good_with_children: true,
    good_with_strangers: true,
    play_style: '',

    // Safety Information
    escape_artist: false,
    fence_jumper: false,
    recall_reliability: 'good',

    // Emergency & Vet Information
    vet_name: '',
    vet_phone: '',
    vet_address: '',
    emergency_medical_consent: false,
    max_vet_cost_approval: '',

    // Care Instructions
    feeding_schedule: '',
    special_requirements: '',
    favorite_activities: '',

    // Pickup & Dropoff Authorization
    authorized_dropoff_people: [] as string[],
    authorized_pickup_people: [] as string[],
    checkout_password: '',
  })

  // For adding/editing authorized people
  const [newDropoffPerson, setNewDropoffPerson] = useState('')
  const [newPickupPerson, setNewPickupPerson] = useState('')

  useEffect(() => {
    // Check if this is a new dog request (not resuming draft)
    const urlParams = new URLSearchParams(window.location.search)
    const isNew = urlParams.get('new') === 'true'

    if (isNew) {
      // Clear localStorage for a fresh start
      localStorage.removeItem('dogFormDraft')
      localStorage.removeItem('dogFormSection')
      localStorage.removeItem('dogFormPhoto')
      toast.success('Starting fresh dog profile')
    } else {
      // Load from localStorage ONLY if not a new request
      const savedFormData = localStorage.getItem('dogFormDraft')
      const savedSection = localStorage.getItem('dogFormSection')
      const savedPhoto = localStorage.getItem('dogFormPhoto')

      if (savedFormData) {
        const parsed = JSON.parse(savedFormData)

        // Clean up any "null null" entries from old drafts
        if (parsed.authorized_dropoff_people) {
          parsed.authorized_dropoff_people = parsed.authorized_dropoff_people.filter((name: string) => name !== 'null null' && name.trim() !== '')
        }
        if (parsed.authorized_pickup_people) {
          parsed.authorized_pickup_people = parsed.authorized_pickup_people.filter((name: string) => name !== 'null null' && name.trim() !== '')
        }

        setFormData(parsed)
        if (savedSection) setCurrentSection(parseInt(savedSection))
        if (savedPhoto) setPhotoPreview(savedPhoto)
        toast.success('Loaded your saved progress')
      }
    }

    checkAuthAndDogCount()
  }, [])

  const checkAuthAndDogCount = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      router.push('/login')
      return
    }
    setUser(user)

    // Get user profile to get their full name
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    // Check if user has completed their profile
    if (!profile || !profile.first_name || !profile.last_name) {
      toast.error('Please complete your profile before adding a dog')
      router.push('/dashboard/profile')
      return
    }

    const fullName = `${profile.first_name} ${profile.last_name}`.trim()

    // Check for existing draft
    const { data: draftDogs } = await supabase
      .from('dogs')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_draft', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (draftDogs && draftDogs.length > 0) {
      const draft = draftDogs[0]
      console.log('DRAFT DOG DATA:', draft)
      setDraftDogId(draft.id)

      // ONLY load from database if localStorage is EMPTY
      const hasLocalStorage = localStorage.getItem('dogFormDraft')
      if (!hasLocalStorage) {
        // Load the section they were on
        setCurrentSection(draft.draft_section || 0)
        setLastSavedSection(draft.draft_section || 0)

        // Load draft data into form - ALL FIELDS FROM DATABASE
        const loadedData = {
          // Basic Information
          name: draft.name || '',
          breed: draft.breed || '',
          date_of_birth: draft.date_of_birth || '',
          gender: draft.gender || 'male',
          size: draft.size || 'medium',
          weight: draft.weight_kg?.toString() || '',
          color: draft.color || '',
          neutered: draft.neutered || false,
          microchipped: draft.microchipped || false,
          microchip_number: draft.microchip_number || '',
          assessment_completed: draft.assessment_completed || false,

          // Health Information
          vaccinated: draft.vaccinated || false,
          vaccination_expiry: draft.vaccination_expiry || '',
          medical_conditions: draft.medical_conditions || '',
          current_medications: draft.current_medications || [],
          medication_requirements: draft.medication_requirements || '',
          allergies: draft.allergies || '',
          can_be_given_treats: draft.can_be_given_treats !== undefined ? draft.can_be_given_treats : true,

          // Behavioral
          resource_guarding: draft.resource_guarding || false,
          separation_anxiety: draft.separation_anxiety || false,
          leash_pulling: draft.leash_pulling || false,
          house_trained: draft.house_trained !== undefined ? draft.house_trained : true,
          crate_trained: draft.crate_trained || false,
          aggression_triggers: draft.aggression_triggers || '',
          behavioral_challenges: draft.behavioral_challenges || '',
          training_needs: draft.training_needs || '',

          // Social
          good_with_dogs: draft.good_with_dogs !== undefined ? draft.good_with_dogs : true,
          good_with_cats: draft.good_with_cats || false,
          good_with_children: draft.good_with_children !== undefined ? draft.good_with_children : true,
          good_with_strangers: draft.good_with_strangers !== undefined ? draft.good_with_strangers : true,
          play_style: draft.play_style || '',

          // Safety
          escape_artist: draft.escape_artist || false,
          fence_jumper: draft.fence_jumper || false,
          recall_reliability: draft.recall_reliability || 'good',

          // Emergency & Vet
          vet_name: draft.vet_name || '',
          vet_phone: draft.vet_phone || '',
          vet_address: draft.vet_address || '',
          emergency_medical_consent: draft.emergency_medical_consent || false,
          max_vet_cost_approval: draft.max_vet_cost_approval?.toString() || '',

          // Pickup & Dropoff
          authorized_dropoff_people: draft.authorized_dropoff_people && draft.authorized_dropoff_people.length > 0 && draft.authorized_dropoff_people[0] !== 'null null'
            ? draft.authorized_dropoff_people
            : (fullName ? [fullName] : []),
          authorized_pickup_people: draft.authorized_pickup_people && draft.authorized_pickup_people.length > 0 && draft.authorized_pickup_people[0] !== 'null null'
            ? draft.authorized_pickup_people
            : (fullName ? [fullName] : []),
          checkout_password: draft.checkout_password || '',
        }

        setFormData(prev => ({
          ...prev,
          ...loadedData
        }))

        if (draft.photo_url) {
          setPhotoPreview(draft.photo_url)
        }
        toast.success(`Loaded draft from database`)
      } else {
        toast.success(`Loaded from your browser - all fields preserved!`)
      }
    } else {
      // Auto-add the user's name to pickup and dropoff lists for new forms
      if (fullName) {
        setFormData(prev => ({
          ...prev,
          authorized_dropoff_people: [fullName],
          authorized_pickup_people: [fullName]
        }))
      }
    }

    const { data: dogs } = await supabase
      .from('dogs')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_draft', false)

    if (dogs) {
      setDogCount(dogs.length)
      if (dogs.length >= 4) {
        toast.error('You have reached the maximum of 4 dogs')
        router.push('/dashboard')
      }
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB')
        return
      }

      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVaccinationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File must be less than 10MB')
        return
      }
      setVaccinationFile(file)
      setVaccinationFileName(file.name)
    }
  }

  const uploadPhoto = async (dogId: string): Promise<string | null> => {
    if (!photoFile || !user) return null

    try {
      setUploading(true)
      const result = await uploadDogPhoto(user.id, photoFile, dogId)

      if (!result.success) {
        toast.error(result.error || 'Failed to upload photo')
        return null
      }

      return result.url || null
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Failed to upload photo')
      return null
    } finally {
      setUploading(false)
    }
  }

  const uploadVaccinationDocument = async (dogId: string): Promise<string | null> => {
    if (!vaccinationFile || !user) return null

    try {
      setUploading(true)
      const result = await uploadVaccinationCertificate(user.id, vaccinationFile, dogId)

      if (!result.success) {
        toast.error(result.error || 'Failed to upload vaccination document')
        return null
      }

      // Save to documents table
      const { error: docError } = await supabase
        .from('documents')
        .insert({
          dog_id: dogId,
          type: 'vaccination',
          file_url: result.url || '',
          file_name: vaccinationFile.name,
          uploaded_at: new Date().toISOString()
        })

      if (docError) {
        console.error('Error saving document record:', docError)
        toast.error('Document uploaded but failed to save record')
      }

      return result.url || null
    } catch (error) {
      console.error('Error uploading vaccination document:', error)
      toast.error('Failed to upload vaccination document')
      return null
    } finally {
      setUploading(false)
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

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return { years: 0, months: 0 }
    const birth = new Date(birthDate)
    const today = new Date()
    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    return { years, months }
  }

  const validateSection = (section: number): boolean => {
    switch(section) {
      case 0: // Basic Information
        if (!photoFile && !photoPreview) {
          toast.error('Please upload a photo of your dog')
          return false
        }
        if (!formData.name || !formData.breed || !formData.date_of_birth) {
          toast.error('Please fill in all required fields')
          return false
        }
        if (!formData.gender || !formData.size) {
          toast.error('Please select gender and size')
          return false
        }
        if (!formData.microchipped) {
          toast.error('Your dog must be microchipped to attend our daycare')
          return false
        }

        // Neutered/Spayed validation
        const age = calculateAge(formData.date_of_birth)
        if (formData.gender === 'male' && age.years >= 1 && !formData.neutered) {
          toast.error('Male dogs over 1 year old must be neutered to attend our daycare')
          return false
        }
        if (formData.gender === 'female' && !formData.neutered) {
          toast('Please note: Your dog may not attend daycare while in season', {
            icon: '⚠️',
            duration: 5000
          })
        }

        return true
      case 1: // Health Information
        if (!formData.vaccinated) {
          toast.error('All dogs must be vaccinated to attend daycare')
          return false
        }
        if (!formData.vaccination_expiry) {
          toast.error('Please provide vaccination expiry date')
          return false
        }
        if (!vaccinationFile && !formData.has_vaccination_docs) {
          toast.error('Please upload vaccination records')
          return false
        }
        return true
      case 3: // Emergency Information
        if (!formData.vet_name || !formData.vet_phone) {
          toast.error('Please provide vet contact information')
          return false
        }
        if (!formData.emergency_medical_consent) {
          toast.error('Emergency medical consent is required')
          return false
        }
        if (!formData.max_vet_cost_approval) {
          toast.error('Please specify maximum vet cost approval')
          return false
        }
        return true
      case 5: // Pickup & Dropoff Authorization
        if (formData.authorized_dropoff_people.length === 0) {
          toast.error('Please add at least one person authorized to drop off your dog')
          return false
        }
        if (formData.authorized_pickup_people.length === 0) {
          toast.error('Please add at least one person authorized to pick up your dog')
          return false
        }
        if (!formData.checkout_password || formData.checkout_password.trim().length < 3) {
          toast.error('Please provide a checkout password (at least 3 characters)')
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(currentSection + 1)
    }
  }

  const prevSection = () => {
    setCurrentSection(currentSection - 1)
  }

  const handleSaveAndContinue = async () => {
    if (!user) {
      toast.error('Please login to continue')
      return
    }

    // Apply validation for current section (same as Next Section button)
    if (!validateSection(currentSection)) {
      return
    }

    setLoading(true)

    try {
      const age = formData.date_of_birth ? calculateAge(formData.date_of_birth) : { years: 0, months: 0 }

      // ONLY save ESSENTIAL fields for drafts - localStorage saves everything else
      const dogData: any = {
        owner_id: user.id,
        name: formData.name || 'Draft Dog',
        breed: formData.breed || 'Unknown',
        age_years: age.years,
        age_months: age.months,
        gender: formData.gender,
        neutered: formData.neutered,
        vaccinated: formData.vaccinated,
        photo_url: photoPreview || null,
        is_approved: false,
        is_draft: true,
        draft_section: currentSection,
      }

      if (draftDogId) {
        // Update existing draft
        const { error } = await supabase
          .from('dogs')
          .update(dogData)
          .eq('id', draftDogId)

        if (error) throw error
        setLastSavedSection(currentSection)

        // Save to localStorage for ALL form data
        localStorage.setItem('dogFormDraft', JSON.stringify(formData))
        localStorage.setItem('dogFormSection', (currentSection + 1).toString())
        if (photoPreview) localStorage.setItem('dogFormPhoto', photoPreview)

        toast.success('✓ Progress saved! You can continue anytime.')

        // Move to next section after saving
        if (currentSection < 5) {
          setCurrentSection(currentSection + 1)
        }
      } else {
        // Create new draft
        const { data: dog, error } = await supabase
          .from('dogs')
          .insert(dogData)
          .select()
          .single()

        if (error) throw error
        setDraftDogId(dog.id)
        setLastSavedSection(currentSection)

        // Save to localStorage for ALL form data
        localStorage.setItem('dogFormDraft', JSON.stringify(formData))
        localStorage.setItem('dogFormSection', (currentSection + 1).toString())
        if (photoPreview) localStorage.setItem('dogFormPhoto', photoPreview)

        toast.success('✓ Progress saved! You can continue anytime.')

        // Move to next section after saving
        if (currentSection < 5) {
          setCurrentSection(currentSection + 1)
        }
      }
    } catch (error: any) {
      console.error('Error saving draft:', error)
      console.error('Error details:', error.details, error.hint, error.code)
      toast.error(error.message || 'Failed to save progress')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please login to continue')
      return
    }

    // Validate all sections
    for (let i = 0; i <= 5; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i)
        return
      }
    }

    setLoading(true)

    try {
      // Calculate age from date of birth
      const age = calculateAge(formData.date_of_birth)

      let dog
      let dogError

      if (draftDogId) {
        // Update existing draft to mark as complete
        const updateData: any = {
          owner_id: user.id,
          name: formData.name,
          breed: formData.breed,
          date_of_birth: formData.date_of_birth,
          age_years: age.years,
          age_months: age.months,
          gender: formData.gender,
          size: formData.size,
          weight_kg: formData.weight ? parseFloat(formData.weight) : null,
          color: formData.color,
          neutered: formData.neutered,
          microchipped: formData.microchipped,
          microchip_number: formData.microchip_number || null,
          assessment_completed: formData.assessment_completed,

          // Health
          vaccinated: formData.vaccinated,
          vaccination_expiry: formData.vaccination_expiry || null,
          medical_conditions: formData.medical_conditions || null,
          current_medications: formData.current_medications.length > 0 ? formData.current_medications : null,
          medication_requirements: formData.medication_requirements || null,
          allergies: formData.allergies || null,
          can_be_given_treats: formData.can_be_given_treats,

          // Behavioral
          resource_guarding: formData.resource_guarding,
          separation_anxiety: formData.separation_anxiety,
          leash_pulling: formData.leash_pulling,
          house_trained: formData.house_trained,
          crate_trained: formData.crate_trained,
          aggression_triggers: formData.aggression_triggers || null,
          behavioral_challenges: formData.behavioral_challenges || null,
          training_needs: formData.training_needs || null,

          // Social
          good_with_dogs: formData.good_with_dogs,
          good_with_cats: formData.good_with_cats,
          good_with_children: formData.good_with_children,
          good_with_strangers: formData.good_with_strangers,
          play_style: formData.play_style || null,

          // Safety
          escape_artist: formData.escape_artist,
          fence_jumper: formData.fence_jumper,
          recall_reliability: formData.recall_reliability,

          // Emergency
          vet_name: formData.vet_name,
          vet_phone: formData.vet_phone,
          vet_address: formData.vet_address || null,
          emergency_medical_consent: formData.emergency_medical_consent,
          max_vet_cost_approval: formData.max_vet_cost_approval ? parseFloat(formData.max_vet_cost_approval) : null,

          // Pickup & Dropoff Authorization
          authorized_dropoff_people: formData.authorized_dropoff_people.length > 0 ? formData.authorized_dropoff_people : null,
          authorized_pickup_people: formData.authorized_pickup_people.length > 0 ? formData.authorized_pickup_people : null,
          checkout_password: formData.checkout_password || null,

          has_vaccination_docs: false,
          is_approved: false,
          is_draft: false,
        }

        // Keep existing photo if no new photo file uploaded
        if (!photoFile && photoPreview) {
          updateData.photo_url = photoPreview
        }

        const result = await supabase
          .from('dogs')
          .update(updateData)
          .eq('id', draftDogId)
          .select()
          .single()

        dog = result.data
        dogError = result.error
      } else {
        // Create new dog profile
        const result = await supabase
          .from('dogs')
          .insert({
            owner_id: user.id,
            name: formData.name,
            breed: formData.breed,
            date_of_birth: formData.date_of_birth,
            age_years: age.years,
            age_months: age.months,
            gender: formData.gender,
            size: formData.size,
            weight_kg: formData.weight ? parseFloat(formData.weight) : null,
            color: formData.color,
            neutered: formData.neutered,
            microchipped: formData.microchipped,
            microchip_number: formData.microchip_number || null,
            assessment_completed: formData.assessment_completed,
            vaccinated: formData.vaccinated,
            vaccination_expiry: formData.vaccination_expiry || null,
            medical_conditions: formData.medical_conditions || null,
            current_medications: formData.current_medications.length > 0 ? formData.current_medications : null,
            medication_requirements: formData.medication_requirements || null,
            allergies: formData.allergies || null,
            can_be_given_treats: formData.can_be_given_treats,
            resource_guarding: formData.resource_guarding,
            separation_anxiety: formData.separation_anxiety,
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
            authorized_dropoff_people: formData.authorized_dropoff_people.length > 0 ? formData.authorized_dropoff_people : null,
            authorized_pickup_people: formData.authorized_pickup_people.length > 0 ? formData.authorized_pickup_people : null,
            checkout_password: formData.checkout_password || null,
            has_vaccination_docs: false,
            is_approved: false,
            is_draft: false,
          })
          .select()
          .single()

        dog = result.data
        dogError = result.error
      }

      if (dogError) throw dogError

      // Upload photo if provided (either from new file upload or from base64 preview)
      if (dog) {
        if (photoFile) {
          // New photo file uploaded - upload to Supabase storage
          const photoUrl = await uploadPhoto(dog.id)
          if (photoUrl) {
            await supabase
              .from('dogs')
              .update({ photo_url: photoUrl })
              .eq('id', dog.id)
          }
        } else if (photoPreview && photoPreview.startsWith('data:image/')) {
          // Base64 preview exists from draft - convert to File and upload
          try {
            const response = await fetch(photoPreview)
            const blob = await response.blob()
            const file = new File([blob], 'dog-photo.jpg', { type: blob.type })

            const filePath = `${dog.id}/photo.${file.name.split('.').pop()}`
            const { error: uploadError } = await supabase.storage
              .from('dog-photos')
              .upload(filePath, file, { upsert: true })

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('dog-photos')
                .getPublicUrl(filePath)

              await supabase
                .from('dogs')
                .update({ photo_url: urlData.publicUrl })
                .eq('id', dog.id)
            }
          } catch (error) {
            console.error('Error uploading base64 photo:', error)
          }
        }
      }

      // Upload vaccination document if provided
      if (vaccinationFile && dog) {
        const vaccinationUrl = await uploadVaccinationDocument(dog.id)
        if (vaccinationUrl) {
          await supabase
            .from('dogs')
            .update({ has_vaccination_docs: true })
            .eq('id', dog.id)
        }
      }

      // Save medications to dog_medications table
      if (dog && formData.current_medications.length > 0) {
        const medicationsToInsert = formData.current_medications
          .filter(med => med.name && med.dosage && med.frequency) // Only save complete medications
          .map(med => ({
            dog_id: dog.id,
            medication_name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            start_date: new Date().toISOString().split('T')[0], // Today's date
            end_date: null, // Ongoing medication
            notes: formData.medication_requirements || null
          }))

        if (medicationsToInsert.length > 0) {
          const { error: medError } = await supabase
            .from('dog_medications')
            .insert(medicationsToInsert)

          if (medError) {
            console.error('Error saving medications:', medError)
            toast.error('Dog added but medications failed to save. Please add them in the Medications page.')
          }
        }
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ has_dogs: true })
        .eq('id', user.id)

      toast.success(`${formData.name} has been added to your pack! 🐕`)

      // Check if user needs to sign agreements
      const { data: agreements } = await supabase
        .from('legal_agreements')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!agreements) {
        toast('Please review and sign our legal agreements', {
          icon: '📝',
          duration: 4000
        })
        setTimeout(() => {
          router.push('/dashboard/legal-agreements')
        }, 2000)
      } else if (dogCount + 1 < 4) {
        const addAnother = window.confirm('Would you like to add another dog?')
        if (addAnother) {
          window.location.reload()
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.success('You\'ve added the maximum of 4 dogs!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }

    } catch (error: any) {
      console.error('Error adding dog:', error)
      toast.error(error.message || 'Failed to add dog')
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    { title: 'Basic Information', icon: HeartIcon },
    { title: 'Health & Medical', icon: BeakerIcon },
    { title: 'Behavior & Social', icon: UserGroupIcon },
    { title: 'Emergency & Vet', icon: PhoneIcon },
    { title: 'Care Instructions', icon: HomeIcon },
  ]

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-canine-navy flex items-center gap-3">
                  <HeartSolid className="h-10 w-10 text-red-500" />
                  Complete Dog Profile
                </h1>
                <p className="text-gray-600 mt-2">
                  Provide comprehensive information about your dog ({dogCount}/4 dogs registered)
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {sections.map((section, index) => (
                <div key={index} className="flex items-center">
                  <button
                    onClick={() => index < currentSection && setCurrentSection(index)}
                    disabled={index > currentSection}
                    className={`flex flex-col items-center ${
                      index === currentSection
                        ? 'text-canine-gold'
                        : index < currentSection
                          ? 'text-green-600 cursor-pointer'
                          : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === currentSection
                        ? 'bg-canine-gold text-white'
                        : index < currentSection
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200'
                    }`}>
                      {index < currentSection ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <section.icon className="h-6 w-6" />
                      )}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">{section.title}</span>
                  </button>
                  {index < sections.length - 1 && (
                    <div className={`h-1 w-8 sm:w-16 mx-1 ${
                      index < currentSection ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-6">

              {/* Section 0: Basic Information */}
              {currentSection === 0 && (
                <>
                  {/* Photo Upload */}
                  <div className="text-center mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dog Photo *
                    </label>
                    <div className="mb-4">
                      <div className={`w-32 h-32 mx-auto rounded-2xl flex items-center justify-center overflow-hidden shadow-md ${
                        !photoPreview ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200' : 'bg-gradient-to-br from-canine-gold/20 to-amber-100'
                      }`}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Dog preview" className="w-full h-full object-cover" />
                        ) : (
                          <CameraIcon className="h-12 w-12 text-red-400" />
                        )}
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        required
                      />
                      <span className="bg-canine-gold text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-canine-light-gold transition-colors inline-flex items-center gap-2">
                        <CameraIcon className="h-4 w-4" />
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </span>
                    </label>
                    <p className="text-xs text-red-600 mt-2 font-medium">Required - Max 5MB</p>
                  </div>

                  <h3 className="text-lg font-semibold text-canine-navy mb-4">Basic Information</h3>

                  {/* Name and Breed FIRST */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dog's Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                  {/* Date of Birth - with calendar popup */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth * <span className="text-xs text-gray-500">(Click to open calendar)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          required
                          max={new Date().toISOString().split('T')[0]}
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-canine-gold text-base cursor-pointer hover:border-canine-gold transition-colors"
                          style={{ colorScheme: 'light' }}
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age <span className="text-xs text-gray-500">(Auto-calculated)</span>
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium">
                        {formData.date_of_birth ? (() => {
                          const age = calculateAge(formData.date_of_birth)
                          return `${age.years} year${age.years !== 1 ? 's' : ''}, ${age.months} month${age.months !== 1 ? 's' : ''}`
                        })() : '📅 Select date of birth first'}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                        Size *
                      </label>
                      <select
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      >
                        <option value="small">Small (0-11 kg)</option>
                        <option value="medium">Medium (11-27 kg)</option>
                        <option value="large">Large (27-41 kg)</option>
                        <option value="extra_large">Extra Large (41+ kg)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="55"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color/Markings
                      </label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="Golden, White chest"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.neutered}
                        onChange={(e) => setFormData({ ...formData, neutered: e.target.checked })}
                        className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                      />
                      <span className="text-gray-700">
                        {formData.gender === 'male' ? 'Neutered' : 'Spayed'}
                        {formData.gender === 'male' && formData.date_of_birth && calculateAge(formData.date_of_birth).years >= 1 && (
                          <span className="text-red-600 ml-2">*</span>
                        )}
                      </span>
                    </label>

                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={formData.microchipped}
                          onChange={(e) => setFormData({ ...formData, microchipped: e.target.checked })}
                          className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                        />
                        <div className="flex-1">
                          <span className="text-gray-700 font-medium">Microchipped *</span>
                          <p className="text-xs text-red-700 mt-1">Required - All dogs must be microchipped to attend daycare</p>
                        </div>
                      </label>
                    </div>

                    {formData.microchipped && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Microchip Number
                        </label>
                        <input
                          type="text"
                          value={formData.microchip_number}
                          onChange={(e) => setFormData({ ...formData, microchip_number: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                          placeholder="Optional - We can record this at daycare"
                        />
                        <p className="text-xs text-gray-500 mt-1">You don't need to fill this in now - we'll record it when you attend daycare</p>
                      </div>
                    )}
                  </div>

                  {/* Assessment Completed Checkbox */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assessment_completed}
                        onChange={(e) => setFormData({ ...formData, assessment_completed: e.target.checked })}
                        className="mt-1 mr-3 text-blue-600 focus:ring-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium">This dog has already completed an assessment at our daycare</span>
                        <p className="text-xs text-blue-700 mt-1">
                          Check this box ONLY if this dog has previously attended our daycare and passed an assessment.
                          New dogs will need to book and complete an assessment before attending regular daycare.
                        </p>
                      </div>
                    </label>
                  </div>
                </>
              )}

              {/* Section 1: Health & Medical */}
              {currentSection === 1 && (
                <>
                  <h3 className="text-lg font-semibold text-canine-navy mb-4">Health & Medical Information</h3>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-red-800">
                          All dogs must be fully vaccinated and have up-to-date flea/worming treatments to attend daycare.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.vaccinated}
                        onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                        className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                      />
                      <span className="text-gray-700">Fully Vaccinated *</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vaccination Expiry *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.vaccination_expiry}
                        onChange={(e) => setFormData({ ...formData, vaccination_expiry: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Vaccination Document Upload */}
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Vaccination Records *
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer flex-1">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleVaccinationFileChange}
                          className="hidden"
                        />
                        <span className="bg-white border-2 border-canine-gold text-canine-gold px-4 py-2 rounded-lg text-sm font-medium hover:bg-canine-gold hover:text-white transition-colors inline-flex items-center gap-2 w-full justify-center">
                          <CameraIcon className="h-4 w-4" />
                          {vaccinationFileName || 'Choose File (PDF, JPG, PNG)'}
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-amber-700 mt-2 font-medium">
                      Required - Upload proof of current vaccinations (Max 10MB)
                    </p>
                  </div>

                  <div className="space-y-4 mb-4">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Flea Treatment Date
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Worming Treatment Date
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Heartworm Prevention Date
                          </label>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Conditions
                    </label>
                    <textarea
                      value={formData.medical_conditions}
                      onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Hip dysplasia, heart condition, diabetes (leave blank if none)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies
                    </label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Chicken, grain, grass (leave blank if none)"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Current Medications
                      </label>
                      <button
                        type="button"
                        onClick={addMedication}
                        className="text-canine-gold hover:text-canine-light-gold text-sm font-medium"
                      >
                        + Add Medication
                      </button>
                    </div>
                    {formData.current_medications.map((med, index) => (
                      <div key={index} className="grid md:grid-cols-4 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Medication name"
                          value={med.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={med.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication Administration Requirements
                    </label>
                    <textarea
                      value={formData.medication_requirements}
                      onChange={(e) => setFormData({ ...formData, medication_requirements: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Needs medication with food, must be given at exact times"
                    />
                  </div>

                  <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.can_be_given_treats}
                      onChange={(e) => setFormData({ ...formData, can_be_given_treats: e.target.checked })}
                      className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-gray-700">Can be given treats</span>
                  </label>
                </>
              )}

              {/* Section 2: Behavior & Social */}
              {currentSection === 2 && (
                <>
                  <h3 className="text-lg font-semibold text-canine-navy mb-4">Behavioral Profile</h3>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.house_trained}
                        onChange={(e) => setFormData({ ...formData, house_trained: e.target.checked })}
                        className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                      />
                      <span className="text-gray-700">House Trained</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.crate_trained}
                        onChange={(e) => setFormData({ ...formData, crate_trained: e.target.checked })}
                        className="mr-3 text-canine-gold focus:ring-canine-gold rounded"
                      />
                      <span className="text-gray-700">Crate Trained</span>
                    </label>
                  </div>

                  <h4 className="font-medium text-gray-700 mb-2">Behavioral Concerns</h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.resource_guarding}
                        onChange={(e) => setFormData({ ...formData, resource_guarding: e.target.checked })}
                        className="mr-3 text-red-500 focus:ring-red-500 rounded"
                      />
                      <span className="text-gray-700">Resource Guarding</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.separation_anxiety}
                        onChange={(e) => setFormData({ ...formData, separation_anxiety: e.target.checked })}
                        className="mr-3 text-red-500 focus:ring-red-500 rounded"
                      />
                      <span className="text-gray-700">Separation Anxiety</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.excessive_barking}
                        onChange={(e) => setFormData({ ...formData, excessive_barking: e.target.checked })}
                        className="mr-3 text-red-500 focus:ring-red-500 rounded"
                      />
                      <span className="text-gray-700">Excessive Barking</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.leash_pulling}
                        onChange={(e) => setFormData({ ...formData, leash_pulling: e.target.checked })}
                        className="mr-3 text-red-500 focus:ring-red-500 rounded"
                      />
                      <span className="text-gray-700">Leash Pulling</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aggression Triggers (if any)
                    </label>
                    <textarea
                      value={formData.aggression_triggers}
                      onChange={(e) => setFormData({ ...formData, aggression_triggers: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Food, toys, other dogs approaching quickly"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Behavioral Challenges
                    </label>
                    <textarea
                      value={formData.behavioral_challenges}
                      onChange={(e) => setFormData({ ...formData, behavioral_challenges: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Jumps on people, chews furniture when anxious"
                    />
                  </div>

                  <h4 className="font-medium text-gray-700 mb-2">Social Behavior</h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Play Style
                    </label>
                    <input
                      type="text"
                      value={formData.play_style}
                      onChange={(e) => setFormData({ ...formData, play_style: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Gentle, rough and tumble, likes to chase"
                    />
                  </div>

                  <h4 className="font-medium text-gray-700 mb-2">Safety Concerns</h4>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.escape_artist}
                        onChange={(e) => setFormData({ ...formData, escape_artist: e.target.checked })}
                        className="mr-3 text-amber-500 focus:ring-amber-500 rounded"
                      />
                      <span className="text-gray-700">Escape Artist</span>
                    </label>
                    <label className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.fence_jumper}
                        onChange={(e) => setFormData({ ...formData, fence_jumper: e.target.checked })}
                        className="mr-3 text-amber-500 focus:ring-amber-500 rounded"
                      />
                      <span className="text-gray-700">Fence Jumper</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recall Reliability
                      </label>
                      <select
                        value={formData.recall_reliability}
                        onChange={(e) => setFormData({ ...formData, recall_reliability: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="moderate">Moderate</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Training Needs
                    </label>
                    <textarea
                      value={formData.training_needs}
                      onChange={(e) => setFormData({ ...formData, training_needs: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Working on recall, needs help with leash manners"
                    />
                  </div>
                </>
              )}

              {/* Section 3: Emergency & Vet Information */}
              {currentSection === 3 && (
                <>
                  <h3 className="text-lg font-semibold text-canine-navy mb-4">Emergency & Veterinary Information</h3>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <ShieldCheckIcon className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-red-800 font-medium">Emergency Medical Consent Required</p>
                        <p className="text-sm text-red-700 mt-1">
                          In case of medical emergency, we need your consent and spending approval to provide immediate veterinary care.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Veterinary Clinic Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vet_name}
                        onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="Elmhurst Veterinary Clinic"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vet Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.vet_phone}
                        onChange={(e) => setFormData({ ...formData, vet_phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="020 1234 5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vet Address
                    </label>
                    <input
                      type="text"
                      value={formData.vet_address}
                      onChange={(e) => setFormData({ ...formData, vet_address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="123 High Street, London, SW1 1AA"
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.emergency_medical_consent}
                        onChange={(e) => setFormData({ ...formData, emergency_medical_consent: e.target.checked })}
                        className="mt-1 mr-3 text-canine-gold focus:ring-canine-gold rounded"
                      />
                      <div>
                        <span className="text-gray-700 font-medium">Emergency Medical Consent *</span>
                        <p className="text-sm text-gray-600 mt-1">
                          I authorize Aldenham Doggy Day Care to seek emergency veterinary care for my dog if needed.
                          I understand I will be responsible for all veterinary costs incurred.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Emergency Vet Cost Approval (£) *
                    </label>
                    <input
                      type="number"
                      required
                      step="100"
                      min="0"
                      value={formData.max_vet_cost_approval}
                      onChange={(e) => setFormData({ ...formData, max_vet_cost_approval: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum amount we can spend on emergency care without additional authorization
                    </p>
                  </div>
                </>
              )}

              {/* Section 4: Care Instructions */}
              {currentSection === 4 && (
                <>
                  <h3 className="text-lg font-semibold text-canine-navy mb-4">Care Instructions</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feeding Schedule & Instructions
                    </label>
                    <textarea
                      value={formData.feeding_schedule}
                      onChange={(e) => setFormData({ ...formData, feeding_schedule: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Two meals daily at 8am and 5pm, 1.5 cups of dry food each. Please feed separately from other dogs."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Favorite Activities & Toys
                    </label>
                    <textarea
                      value={formData.favorite_activities}
                      onChange={(e) => setFormData({ ...formData, favorite_activities: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Loves playing fetch with tennis balls, enjoys swimming, likes puzzle toys"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requirements or Instructions
                    </label>
                    <textarea
                      value={formData.special_requirements}
                      onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="e.g., Needs to wear special harness, should not play with small dogs, needs quiet space for naps"
                    />
                  </div>

                </>
              )}

              {/* Section 5: Pickup & Dropoff Authorization */}
              {currentSection === 5 && (
                <>
                  <h3 className="text-lg font-semibold text-canine-navy mb-4 flex items-center">
                    <UserGroupIcon className="h-6 w-6 mr-2" />
                    Pickup & Dropoff Authorization
                  </h3>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> For your dog's safety, specify who is authorized to drop off and pick up your dog.
                      A password will be required if someone else picks up your dog.
                    </p>
                  </div>

                  {/* Authorized Dropoff People */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who can drop off your dog? *
                    </label>
                    <div className="mb-3">
                      <input
                        type="text"
                        value={newDropoffPerson}
                        onChange={(e) => setNewDropoffPerson(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (newDropoffPerson.trim()) {
                              setFormData({
                                ...formData,
                                authorized_dropoff_people: [...formData.authorized_dropoff_people, newDropoffPerson.trim()]
                              })
                              setNewDropoffPerson('')
                            }
                          }
                        }}
                        onBlur={() => {
                          if (newDropoffPerson.trim()) {
                            setFormData({
                              ...formData,
                              authorized_dropoff_people: [...formData.authorized_dropoff_people, newDropoffPerson.trim()]
                            })
                            setNewDropoffPerson('')
                          }
                        }}
                        placeholder="Type full name and press Enter (e.g., Jane Smith)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Press Enter or click away to add name</p>
                    </div>
                    {formData.authorized_dropoff_people.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.authorized_dropoff_people.map((person, index) => (
                          <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2">
                            <span>{person}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  authorized_dropoff_people: formData.authorized_dropoff_people.filter((_, i) => i !== index)
                                })
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Authorized Pickup People */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who can pick up your dog? *
                    </label>
                    <div className="mb-3">
                      <input
                        type="text"
                        value={newPickupPerson}
                        onChange={(e) => setNewPickupPerson(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (newPickupPerson.trim()) {
                              setFormData({
                                ...formData,
                                authorized_pickup_people: [...formData.authorized_pickup_people, newPickupPerson.trim()]
                              })
                              setNewPickupPerson('')
                            }
                          }
                        }}
                        onBlur={() => {
                          if (newPickupPerson.trim()) {
                            setFormData({
                              ...formData,
                              authorized_pickup_people: [...formData.authorized_pickup_people, newPickupPerson.trim()]
                            })
                            setNewPickupPerson('')
                          }
                        }}
                        placeholder="Type full name and press Enter (e.g., Sarah Johnson)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Press Enter or click away to add name</p>
                    </div>
                    {formData.authorized_pickup_people.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.authorized_pickup_people.map((person, index) => (
                          <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
                            <span>{person}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  authorized_pickup_people: formData.authorized_pickup_people.filter((_, i) => i !== index)
                                })
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Checkout Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Checkout Password *
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      Required if someone NOT on the authorized pickup list picks up your dog
                    </p>
                    <input
                      type="text"
                      value={formData.checkout_password}
                      onChange={(e) => setFormData({ ...formData, checkout_password: e.target.value })}
                      placeholder={`e.g., "${formData.name} is king" or "pickup123"`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Summary Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-green-800 font-medium">Almost Done!</p>
                        <p className="text-sm text-green-700 mt-1">
                          After submitting this profile, you'll need to:
                        </p>
                        <ul className="text-sm text-green-700 mt-2 space-y-1">
                          <li>• Sign legal agreements and waivers</li>
                          <li>• Schedule an assessment day</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  type="button"
                  onClick={currentSection === 0 ? () => router.push('/dashboard') : prevSection}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  {currentSection === 0 ? 'Cancel' : 'Previous'}
                </button>

                {currentSection < 5 ? (
                  <button
                    type="button"
                    onClick={handleSaveAndContinue}
                    disabled={loading}
                    className="bg-canine-gold text-white px-8 py-3 rounded-lg font-semibold hover:bg-canine-light-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save & Continue'
                    )}
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || uploading}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Complete {formData.name}'s Profile
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}