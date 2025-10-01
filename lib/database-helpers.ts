import { supabase } from './supabase'

// =====================================================
// USER & AUTHENTICATION HELPERS
// =====================================================

export async function signUpClient(email: string, password: string, userData: any) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError

  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        role: 'client',
        ...userData,
      })

    if (profileError) throw profileError
  }

  return authData
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Update last login
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// =====================================================
// DOG MANAGEMENT
// =====================================================

export async function addDog(dogData: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('dogs')
    .insert({
      owner_id: user.id,
      ...dogData,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getClientDogs() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('owner_id', user.id)
    .eq('status', 'active')

  if (error) throw error
  return data
}

export async function updateDog(dogId: string, updates: any) {
  const { data, error } = await supabase
    .from('dogs')
    .update(updates)
    .eq('id', dogId)
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// SUBSCRIPTIONS
// =====================================================

export async function getActiveSubscriptions() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      dog:dogs(*)
    `)
    .eq('client_id', user.id)
    .eq('is_active', true)

  if (error) throw error
  return data
}

export async function createSubscription(subscriptionData: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      client_id: user.id,
      ...subscriptionData,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// BOOKINGS
// =====================================================

export async function getAvailableSpots(date: string) {
  const { data, error } = await supabase
    .rpc('check_availability', { check_date: date })

  if (error) throw error
  return data
}

export async function createBooking(bookingData: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if user has available days
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('dog_id', bookingData.dog_id)
    .eq('is_active', true)
    .gt('days_remaining', 0)
    .single()

  if (!subscription) {
    throw new Error('No active subscription with available days')
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      owner_id: user.id,
      subscription_id: subscription.id,
      ...bookingData,
    })
    .select()
    .single()

  if (bookingError) throw bookingError

  // Deduct subscription day
  const { error: deductError } = await supabase
    .rpc('deduct_subscription_day', { p_subscription_id: subscription.id })

  if (deductError) throw deductError

  return booking
}

export async function getClientBookings() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      dog:dogs(*)
    `)
    .eq('owner_id', user.id)
    .gte('booking_date', new Date().toISOString().split('T')[0])
    .order('booking_date', { ascending: true })

  if (error) throw error
  return data
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error

  // Refund the subscription day
  if (data.subscription_id) {
    // Use RPC function to decrement days_used
    await supabase.rpc('decrement_subscription_days_used', {
      p_subscription_id: data.subscription_id
    })
  }

  return data
}

// =====================================================
// STAFF FUNCTIONS
// =====================================================

export async function getTodaysBookings() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      dog:dogs(*),
      owner:profiles(*)
    `)
    .eq('booking_date', today)
    .neq('status', 'cancelled')

  if (error) throw error
  return data
}

export async function checkInDog(bookingId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'checked_in',
      check_in_time: new Date().toTimeString().split(' ')[0],
      check_in_by: user.id,
    })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function checkOutDog(bookingId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'checked_out',
      check_out_time: new Date().toTimeString().split(' ')[0],
      check_out_by: user.id,
    })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAssessmentRequests() {
  const { data, error } = await supabase
    .from('assessment_requests')
    .select(`
      *,
      dog:dogs(*, owner:profiles(*))
    `)
    .eq('status', 'pending')
    .order('requested_date', { ascending: true })

  if (error) throw error
  return data
}

export async function approveAssessment(requestId: string, dogId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Update assessment request
  const { error: requestError } = await supabase
    .from('assessment_requests')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (requestError) throw requestError

  // Update dog status
  const { error: dogError } = await supabase
    .from('dogs')
    .update({
      assessment_status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', dogId)

  if (dogError) throw dogError

  return { success: true }
}

// =====================================================
// ADMIN FUNCTIONS
// =====================================================

export async function getRevenueSummary() {
  const { data, error } = await supabase
    .from('payments')
    .select('amount, created_at')
    .eq('status', 'completed')
    .gte('created_at', new Date(new Date().setDate(1)).toISOString())

  if (error) throw error

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const todayRevenue = data
    .filter(p => p.created_at.startsWith(today))
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const weekRevenue = data
    .filter(p => p.created_at >= weekAgo)
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const monthRevenue = data
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return {
    todayRevenue,
    weekRevenue,
    monthRevenue,
  }
}

export async function getAllSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      client:profiles(*),
      dog:dogs(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getBookingsByDate(date: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      dog:dogs(*),
      owner:profiles(*)
    `)
    .eq('booking_date', date)
    .neq('status', 'cancelled')

  if (error) throw error
  return data
}

export async function updateCapacity(date: string, capacity: number) {
  const { data, error } = await supabase
    .from('capacity_config')
    .upsert({
      date,
      max_capacity: capacity,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAssessmentConfig() {
  const { data, error } = await supabase
    .from('assessment_config')
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateAssessmentConfig(config: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('assessment_config')
    .upsert({
      ...config,
      updated_by: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

export function subscribeToBookings(callback: (payload: any) => void) {
  return supabase
    .channel('bookings_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bookings',
      filter: `booking_date=eq.${new Date().toISOString().split('T')[0]}`,
    }, callback)
    .subscribe()
}

export function subscribeToAssessments(callback: (payload: any) => void) {
  return supabase
    .channel('assessments_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'assessment_requests',
    }, callback)
    .subscribe()
}

// =====================================================
// CALENDAR HELPERS
// =====================================================

export async function getCalendarAvailability(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('available_spots')
    .select('*')
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)

  if (error) throw error
  return data
}

export async function getAssessmentDates() {
  const config = await getAssessmentConfig()

  // Get next 60 days of dates
  const dates = []
  const today = new Date()

  for (let i = 0; i < 60; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const dateStr = date.toISOString().split('T')[0]

    // Check if it's a regular assessment day or exception date
    const isRegularDay = config?.regular_days?.includes(dayName) || dayName === 'Friday'
    const isException = config?.exception_dates?.includes(dateStr)

    if (isRegularDay || isException) {
      dates.push(dateStr)
    }
  }

  return dates
}