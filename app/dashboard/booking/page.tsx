'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/DashboardHeader'
import {
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Type for per-dog booking state
interface DogBookingState {
  dogId: string
  dogName: string
  dogBreed: string
  dogPhoto: string | null
  subscription: any
  selectedDates: string[]
  currentMonth: Date
  bookedDates: string[]
  mealOptions: { breakfast: boolean; lunch: boolean; dinner: boolean }
  specialNotes: string
  mealAgreementAccepted: boolean
}

export default function BookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dogs, setDogs] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [maxDogsPerDay, setMaxDogsPerDay] = useState(20)
  const [dateCapacity, setDateCapacity] = useState<Record<string, number>>({})
  const [closedDates, setClosedDates] = useState<string[]>([])
  const [isVipMember, setIsVipMember] = useState(false)

  // NEW: Per-dog booking state
  const [dogBookingStates, setDogBookingStates] = useState<Record<string, DogBookingState>>({})
  const [activeDogId, setActiveDogId] = useState<string | null>(null)
  const [showMealAgreement, setShowMealAgreement] = useState(false)
  const [pendingMealDogId, setPendingMealDogId] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Check VIP membership status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_vip_member')
        .eq('id', user.id)
        .single()

      if (profileData?.is_vip_member) {
        setIsVipMember(true)
      }

      // Load dogs (all dogs, not just approved)
      const { data: dogsData } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', user.id)

      setDogs(dogsData || [])

      // Load ALL active subscriptions (one per dog)
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_tiers(name),
          dogs(name, breed, photo_url)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      const mappedSubs = subsData ? subsData.map(sub => ({
        ...sub,
        tier_name: sub.subscription_tiers?.name || 'Subscription',
        dog_name: sub.dogs?.name || 'Unknown Dog',
        dog_breed: sub.dogs?.breed || '',
        dog_photo: sub.dogs?.photo_url || null
      })) : []
      setSubscriptions(mappedSubs)

      // Load existing bookings PER DOG (include all non-cancelled statuses)
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('booking_date, dog_id')
        .eq('user_id', user.id)
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .not('status', 'eq', 'cancelled')

      // Group booked dates by dog
      const bookedByDog: Record<string, string[]> = {}
      bookingsData?.forEach(b => {
        if (b.dog_id) {
          if (!bookedByDog[b.dog_id]) bookedByDog[b.dog_id] = []
          if (!bookedByDog[b.dog_id].includes(b.booking_date)) {
            bookedByDog[b.dog_id].push(b.booking_date)
          }
        }
      })

      // Initialize per-dog booking states
      const initialStates: Record<string, DogBookingState> = {}
      mappedSubs.forEach(sub => {
        initialStates[sub.dog_id] = {
          dogId: sub.dog_id,
          dogName: sub.dog_name,
          dogBreed: sub.dog_breed,
          dogPhoto: sub.dog_photo,
          subscription: sub,
          selectedDates: [],
          currentMonth: new Date(),
          bookedDates: bookedByDog[sub.dog_id] || [],
          mealOptions: { breakfast: false, lunch: false, dinner: false },
          specialNotes: '',
          mealAgreementAccepted: false
        }
      })
      setDogBookingStates(initialStates)

      // Set first dog as active if there are subscriptions
      if (mappedSubs.length > 0) {
        setActiveDogId(mappedSubs[0].dog_id)
      }

      // Fetch max dogs per day setting
      const { data: maxDogsSettings } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'max_dogs_per_day')
        .single()

      if (maxDogsSettings) {
        setMaxDogsPerDay(parseInt(maxDogsSettings.setting_value))
      }

      // Calculate capacity for upcoming dates (next 60 days)
      const today = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 60)

      const { data: allBookingsData } = await supabase
        .from('bookings')
        .select('booking_date, dog_ids, dog_id')
        .gte('booking_date', today.toISOString().split('T')[0])
        .lte('booking_date', endDate.toISOString().split('T')[0])
        .in('status', ['confirmed', 'pending'])

      // Count dogs per date
      const capacityMap: Record<string, number> = {}
      allBookingsData?.forEach(booking => {
        const date = booking.booking_date
        const dogCount = booking.dog_ids?.length || (booking.dog_id ? 1 : 0)
        capacityMap[date] = (capacityMap[date] || 0) + dogCount
      })
      setDateCapacity(capacityMap)

      // Fetch closed days (holidays, etc.)
      const { data: closedDaysData } = await supabase
        .from('closed_days')
        .select('closed_date')

      if (closedDaysData) {
        setClosedDates(closedDaysData.map(d => d.closed_date))
      }

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  // Check if a date is available for a specific dog
  const isDateAvailableForDog = (dateString: string, dogId: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if date is in the past
    if (date < today) return false

    // Check if it's a weekend
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return false

    // Check if it's a closed day (holiday, etc.)
    if (closedDates.includes(dateString)) return false

    // Check if already booked for THIS dog
    const dogState = dogBookingStates[dogId]
    if (dogState?.bookedDates.includes(dateString)) return false

    // Check if day is at capacity (total dogs booked >= max allowed)
    const currentCapacity = dateCapacity[dateString] || 0
    if (currentCapacity >= maxDogsPerDay) return false

    return true
  }

  const getDateCapacityInfo = (dateString: string) => {
    const currentCapacity = dateCapacity[dateString] || 0
    const spotsRemaining = maxDogsPerDay - currentCapacity
    return { currentCapacity, spotsRemaining, maxDogsPerDay }
  }

  // Toggle date selection for a specific dog
  const toggleDateForDog = (dateString: string, dogId: string) => {
    if (!isDateAvailableForDog(dateString, dogId)) return

    setDogBookingStates(prev => {
      const dogState = prev[dogId]
      if (!dogState) return prev

      const newSelectedDates = dogState.selectedDates.includes(dateString)
        ? dogState.selectedDates.filter(d => d !== dateString)
        : [...dogState.selectedDates, dateString]

      return {
        ...prev,
        [dogId]: {
          ...dogState,
          selectedDates: newSelectedDates
        }
      }
    })
  }

  // Navigate months for a specific dog
  const previousMonthForDog = (dogId: string) => {
    setDogBookingStates(prev => {
      const dogState = prev[dogId]
      if (!dogState) return prev

      return {
        ...prev,
        [dogId]: {
          ...dogState,
          currentMonth: new Date(dogState.currentMonth.getFullYear(), dogState.currentMonth.getMonth() - 1, 1)
        }
      }
    })
  }

  const nextMonthForDog = (dogId: string) => {
    setDogBookingStates(prev => {
      const dogState = prev[dogId]
      if (!dogState) return prev

      return {
        ...prev,
        [dogId]: {
          ...dogState,
          currentMonth: new Date(dogState.currentMonth.getFullYear(), dogState.currentMonth.getMonth() + 1, 1)
        }
      }
    })
  }

  // Handle meal option change for a specific dog
  const handleMealOptionChangeForDog = (dogId: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
    setDogBookingStates(prev => {
      const dogState = prev[dogId]
      if (!dogState) return prev

      const newMealOptions = { ...dogState.mealOptions, [meal]: !dogState.mealOptions[meal] }

      // Show agreement modal if any meal is selected and agreement hasn't been accepted
      if ((newMealOptions.breakfast || newMealOptions.lunch || newMealOptions.dinner) && !dogState.mealAgreementAccepted) {
        setPendingMealDogId(dogId)
        setShowMealAgreement(true)
      }

      return {
        ...prev,
        [dogId]: {
          ...dogState,
          mealOptions: newMealOptions
        }
      }
    })
  }

  const handleMealAgreementAccept = () => {
    if (pendingMealDogId) {
      setDogBookingStates(prev => {
        const dogState = prev[pendingMealDogId]
        if (!dogState) return prev

        return {
          ...prev,
          [pendingMealDogId]: {
            ...dogState,
            mealAgreementAccepted: true
          }
        }
      })
    }
    setShowMealAgreement(false)
    setPendingMealDogId(null)
    toast.success('Meal agreement accepted')
  }

  const handleMealAgreementDecline = () => {
    if (pendingMealDogId) {
      setDogBookingStates(prev => {
        const dogState = prev[pendingMealDogId]
        if (!dogState) return prev

        return {
          ...prev,
          [pendingMealDogId]: {
            ...dogState,
            mealOptions: { breakfast: false, lunch: false, dinner: false }
          }
        }
      })
    }
    setShowMealAgreement(false)
    setPendingMealDogId(null)
    toast('Meal options cleared - you must accept the agreement to provide meals')
  }

  // Update special notes for a specific dog
  const updateSpecialNotesForDog = (dogId: string, notes: string) => {
    setDogBookingStates(prev => {
      const dogState = prev[dogId]
      if (!dogState) return prev

      return {
        ...prev,
        [dogId]: {
          ...dogState,
          specialNotes: notes
        }
      }
    })
  }

  // Submit booking for a specific dog
  const handleSubmitForDog = async (dogId: string) => {
    const dogState = dogBookingStates[dogId]
    if (!dogState) return

    if (dogState.selectedDates.length === 0) {
      toast.error(`Please select at least one date for ${dogState.dogName}`)
      return
    }

    const { subscription, mealOptions, specialNotes, mealAgreementAccepted, selectedDates } = dogState

    if (!subscription) {
      toast.error(`${dogState.dogName} needs an active subscription to book days`)
      return
    }

    // Check if meals are selected but agreement not accepted
    if ((mealOptions.breakfast || mealOptions.lunch || mealOptions.dinner) && !mealAgreementAccepted) {
      toast.error('Please accept the meal agreement to continue')
      setPendingMealDogId(dogId)
      setShowMealAgreement(true)
      return
    }

    const daysRemaining = subscription.days_remaining || 0
    const daysNeeded = selectedDates.length
    const includedDays = Math.min(daysNeeded, daysRemaining)
    const extraDays = Math.max(0, daysNeeded - daysRemaining)

    // If there are extra days, we'll need to charge at subscription rate
    if (extraDays > 0) {
      const extraDayCost = subscription.price_per_day || 40.00
      const totalExtraCost = extraDays * extraDayCost

      // Calculate VIP discount (10% for Golden Paw members)
      const vipDiscountPercent = isVipMember ? 0.10 : 0
      const vipDiscountAmount = totalExtraCost * vipDiscountPercent
      const finalCost = totalExtraCost - vipDiscountAmount

      let confirmMessage = `${dogState.dogName} has ${daysRemaining} days remaining.\n\n` +
        `• ${includedDays} day${includedDays !== 1 ? 's' : ''} will use included days (FREE)\n` +
        `• ${extraDays} extra day${extraDays !== 1 ? 's' : ''} at £${extraDayCost}/day = £${totalExtraCost.toFixed(2)}`

      if (isVipMember && vipDiscountAmount > 0) {
        confirmMessage += `\n• Golden Paw VIP 10% discount: -£${vipDiscountAmount.toFixed(2)}\n` +
          `• Total: £${finalCost.toFixed(2)}`
      }

      confirmMessage += `\n\nContinue to payment?`

      if (!window.confirm(confirmMessage)) {
        return
      }

      // Redirect to Stripe checkout for extra days
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          toast.error('Please log in again')
          router.push('/login')
          return
        }

        const response = await fetch('/api/create-subscription-extra-days-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            subscriptionId: subscription.id,
            numExtraDays: extraDays,
            pricePerDay: extraDayCost,
            selectedDates: selectedDates,
            selectedDogs: [dogId],
            mealOptions: mealOptions,
            specialNotes: specialNotes,
            includedDays: includedDays,
            isVipMember: isVipMember,
            vipDiscountAmount: vipDiscountAmount,
            totalAmount: totalExtraCost,
            finalAmount: finalCost
          })
        })

        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL returned')
        }
      } catch (error) {
        console.error('Error creating checkout:', error)
        toast.error('Failed to create payment session')
      }
      return
    }

    // Check capacity for each selected date
    for (const date of selectedDates) {
      const { currentCapacity, spotsRemaining } = getDateCapacityInfo(date)
      if (currentCapacity + 1 > maxDogsPerDay) {
        toast.error(`Cannot book ${date}: Only ${spotsRemaining} spots remaining`)
        return
      }
    }

    setSubmitting(true)

    try {
      // Build meal requirements text
      const mealRequirements = []
      if (mealOptions.breakfast) mealRequirements.push('Breakfast')
      if (mealOptions.lunch) mealRequirements.push('Lunch')
      if (mealOptions.dinner) mealRequirements.push('Dinner')
      const mealText = mealRequirements.length > 0
        ? `MEALS REQUIRED: ${mealRequirements.join(', ')}. `
        : ''

      const fullInstructions = mealText + (specialNotes || '')

      // Create bookings for each selected date
      const bookings = selectedDates.map(date => ({
        user_id: user.id,
        dog_id: dogId,
        dog_ids: [dogId],
        booking_date: date,
        subscription_id: subscription.id,
        status: 'confirmed',
        special_instructions: fullInstructions.trim() || null,
        needs_breakfast: mealOptions.breakfast,
        needs_lunch: mealOptions.lunch,
        needs_dinner: mealOptions.dinner
      }))

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert(bookings)

      if (bookingError) throw bookingError

      // Update subscription days remaining
      const daysToDeduct = Math.min(selectedDates.length, daysRemaining)
      if (daysToDeduct > 0) {
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            days_remaining: daysRemaining - daysToDeduct,
            days_used: (subscription.days_used || 0) + daysToDeduct
          })
          .eq('id', subscription.id)

        if (subError) {
          console.error(`Error updating subscription for ${dogState.dogName}:`, subError)
        }
      }

      toast.success(`Successfully booked ${selectedDates.length} day${selectedDates.length > 1 ? 's' : ''} for ${dogState.dogName}! 🎉`)

      // Reload data to refresh states
      checkAuthAndLoadData()

    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error(error.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canine-cream to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-canine-gold border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading booking calendar...</p>
        </div>
      </div>
    )
  }

  const hasApprovedDogs = dogs.some(dog => dog.is_approved)
  const hasSubscriptions = subscriptions.length > 0

  // Calculate total days remaining across all subscriptions
  const totalDaysRemaining = subscriptions.reduce((total, sub) => total + (sub.days_remaining || 0), 0)

  // Render calendar for a specific dog
  const renderDogCalendar = (dogState: DogBookingState) => {
    const { dogId, dogName, dogBreed, dogPhoto, subscription, selectedDates, currentMonth, bookedDates, mealOptions, specialNotes, mealAgreementAccepted } = dogState
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
    const daysRemaining = subscription?.days_remaining || 0

    return (
      <motion.div
        key={dogId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100"
      >
        {/* Dog Header */}
        <div className="bg-gradient-to-r from-canine-navy to-blue-900 text-white p-6">
          <div className="flex items-center gap-4">
            {dogPhoto ? (
              <img src={dogPhoto} alt={dogName} className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-canine-gold/30 flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-display font-bold">{dogName}</h2>
              <p className="text-blue-200">{dogBreed}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
                <p className="text-xs text-blue-200">Days Remaining</p>
                <p className="text-3xl font-bold">{daysRemaining}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4 bg-canine-cream rounded-xl p-3">
            <button
              onClick={() => previousMonthForDog(dogId)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-canine-navy" />
            </button>
            <h3 className="text-lg font-bold text-canine-navy">{monthName}</h3>
            <button
              onClick={() => nextMonthForDog(dogId)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-canine-navy" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-4">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-500 text-xs py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isAvailable = isDateAvailableForDog(dateString, dogId)
                const isSelected = selectedDates.includes(dateString)
                const isBooked = bookedDates.includes(dateString)
                const date = new Date(dateString)
                const isWeekend = date.getDay() === 0 || date.getDay() === 6

                return (
                  <motion.button
                    key={day}
                    type="button"
                    whileHover={isAvailable ? { scale: 1.1 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    onClick={() => toggleDateForDog(dateString, dogId)}
                    disabled={!isAvailable}
                    className={`aspect-square rounded-lg flex items-center justify-center font-medium text-sm transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-canine-gold to-amber-400 text-white shadow-md ring-2 ring-canine-gold/30'
                        : isBooked
                        ? 'bg-green-100 text-green-700'
                        : isWeekend
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isAvailable
                        ? 'bg-gray-50 hover:bg-canine-sky text-gray-700 border border-gray-200 hover:border-canine-gold'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {day}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-canine-gold to-amber-400"></div>
              <span className="text-gray-600">Selected ({selectedDates.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-100"></div>
              <span className="text-gray-600">Already Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-gray-100"></div>
              <span className="text-gray-600">Unavailable</span>
            </div>
          </div>

          {/* Selected Dates List */}
          {selectedDates.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-canine-navy mb-2">Selected Dates:</p>
              <div className="flex flex-wrap gap-2">
                {selectedDates.sort().map(date => (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1 bg-canine-gold/10 text-canine-navy px-3 py-1 rounded-full text-sm"
                  >
                    {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    <button
                      onClick={() => toggleDateForDog(date, dogId)}
                      className="hover:text-red-500"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meal Options */}
          {selectedDates.length > 0 && (
            <div className="mb-4 p-4 bg-amber-50 rounded-xl">
              <p className="text-sm font-semibold text-canine-navy mb-2">Meal Requirements</p>
              <div className="flex flex-wrap gap-3">
                {(['breakfast', 'lunch', 'dinner'] as const).map(meal => (
                  <label key={meal} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mealOptions[meal]}
                      onChange={() => handleMealOptionChangeForDog(dogId, meal)}
                      className="w-4 h-4 text-canine-gold focus:ring-canine-gold rounded"
                    />
                    <span className="text-sm capitalize">{meal}</span>
                  </label>
                ))}
              </div>
              {(mealOptions.breakfast || mealOptions.lunch || mealOptions.dinner) && mealAgreementAccepted && (
                <p className="text-xs text-green-600 mt-2">✓ Meal agreement accepted</p>
              )}
            </div>
          )}

          {/* Special Notes */}
          {selectedDates.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-semibold text-canine-navy mb-1 block">Special Notes</label>
              <textarea
                value={specialNotes}
                onChange={(e) => updateSpecialNotesForDog(dogId, e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-canine-gold focus:border-canine-gold resize-none text-sm"
                placeholder="Any special instructions..."
              />
            </div>
          )}

          {/* Extra Days Warning */}
          {selectedDates.length > daysRemaining && (
            <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> {selectedDates.length - daysRemaining} extra day{selectedDates.length - daysRemaining !== 1 ? 's' : ''} will be charged at £{subscription?.price_per_day || 40}/day
                = <strong>£{((selectedDates.length - daysRemaining) * (subscription?.price_per_day || 40)).toFixed(2)}</strong>
              </p>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={() => handleSubmitForDog(dogId)}
            disabled={submitting || selectedDates.length === 0}
            className="w-full bg-gradient-to-r from-canine-gold to-amber-400 hover:from-canine-light-gold hover:to-amber-500 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Booking...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Book {selectedDates.length} Day{selectedDates.length !== 1 ? 's' : ''} for {dogName}
              </>
            )}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-12">
      <div className="max-w-7xl mx-auto px-4">

        <DashboardHeader
          title="Book Daycare Days"
          subtitle="Use your subscription days to book daycare visits"
        />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">Book Your Subscription Days</h1>
          <p className="text-gray-600">
            Each dog has their own calendar and days. Select dates for each dog separately.
            {!hasSubscriptions && <span className="font-semibold text-purple-600"> (Subscription required to book)</span>}
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-canine-gold rounded-full"></div>
              <span className="text-gray-600">For subscription members</span>
            </div>
            <Link href="/dashboard/individual-days" className="flex items-center gap-2 text-canine-navy hover:text-canine-gold transition-colors">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Looking for individual days? Click here</span>
            </Link>
          </div>
        </div>

        {/* Warning Banners */}
        {!hasSubscriptions && (
          <div className="mb-8 space-y-4">
            {dogs.length === 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-amber-900">Add Your Dog First</h3>
                    <p className="text-amber-700 mt-1">You need to register at least one dog before booking daycare days.</p>
                    <Link href="/dashboard/add-dog" className="mt-3 inline-block btn-primary">
                      Add Your First Dog
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {dogs.length > 0 && !hasApprovedDogs && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-blue-900">Dog Approval Pending</h3>
                    <p className="text-blue-700 mt-1">Your dog needs to be approved before you can purchase a subscription and book daycare days.</p>
                  </div>
                </div>
              </div>
            )}

            {hasApprovedDogs && (
              <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-purple-900">Purchase a Subscription</h3>
                    <p className="text-purple-700 mt-1">You need an active subscription to book daycare days. Choose a plan that works for you!</p>
                    <Link href="/dashboard/subscriptions" className="mt-3 inline-block btn-primary">
                      View Subscription Plans
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Per-Dog Calendars Grid */}
        {hasSubscriptions && (
          <div className="grid md:grid-cols-2 gap-6">
            {Object.values(dogBookingStates).map(dogState => renderDogCalendar(dogState))}
          </div>
        )}

        {/* Summary Card - Only if there are bookings pending */}
        {hasSubscriptions && Object.values(dogBookingStates).some(s => s.selectedDates.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-canine-navy to-blue-900 text-white rounded-3xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.values(dogBookingStates)
                .filter(s => s.selectedDates.length > 0)
                .map(dogState => (
                  <div key={dogState.dogId} className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="font-bold text-lg">{dogState.dogName}</p>
                    <p className="text-blue-200 text-sm">{dogState.selectedDates.length} day{dogState.selectedDates.length !== 1 ? 's' : ''} selected</p>
                    <p className="text-xs text-blue-300 mt-1">
                      {dogState.subscription?.days_remaining || 0} days remaining in subscription
                    </p>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Meal Agreement Modal */}
        <AnimatePresence>
          {showMealAgreement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full"
              >
                <h3 className="text-2xl font-bold text-canine-navy mb-4">Meal Agreement</h3>
                <div className="space-y-4 mb-6">
                  <p className="text-gray-700 font-medium">
                    Please read and agree to the following:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-canine-gold font-bold mt-1">•</span>
                      <span>You must <strong>bring your dog's food</strong> - we do not supply food</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-canine-gold font-bold mt-1">•</span>
                      <span>Food must be in <strong>portion-sized amounts</strong> in separate containers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-canine-gold font-bold mt-1">•</span>
                      <span>Each container must be <strong>clearly labeled</strong> with your dog's name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-canine-gold font-bold mt-1">•</span>
                      <span>Include any <strong>feeding instructions</strong> in the special notes field</span>
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleMealAgreementDecline}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleMealAgreementAccept}
                    className="flex-1 bg-gradient-to-r from-canine-gold to-amber-400 hover:from-canine-light-gold hover:to-amber-500 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    I Agree
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
// Force cache clear - Jan 6 2026
