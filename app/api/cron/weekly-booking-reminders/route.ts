import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWeeklyBookingReminder } from '@/lib/email'

// Create Supabase client with service role for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - allowing request in development')
    return process.env.NODE_ENV === 'development'
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Calculate the upcoming week (Monday to Sunday)
    const today = new Date()

    // Find next Monday (or today if it's Monday)
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7

    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() + daysUntilMonday)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Sunday
    weekEnd.setHours(23, 59, 59, 999)

    const weekStartStr = weekStart.toISOString().split('T')[0]
    const weekEndStr = weekEnd.toISOString().split('T')[0]

    console.log(`Checking for bookings from ${weekStartStr} to ${weekEndStr}`)

    // Get all confirmed bookings for the upcoming week
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        user_id,
        dog_id,
        needs_breakfast,
        needs_lunch,
        needs_dinner,
        special_instructions,
        dogs!bookings_dog_id_fkey (
          id,
          name
        ),
        profiles!bookings_user_id_fkey (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .gte('booking_date', weekStartStr)
      .lte('booking_date', weekEndStr)
      .eq('status', 'confirmed')
      .order('booking_date', { ascending: true })

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        message: 'No bookings found for the upcoming week',
        emailsSent: 0,
        weekStart: weekStartStr,
        weekEnd: weekEndStr
      })
    }

    // Group bookings by user
    const userBookings: Map<string, {
      email: string
      userName: string
      bookings: Map<string, {
        date: string
        dogNames: string[]
        needsBreakfast: boolean
        needsLunch: boolean
        needsDinner: boolean
        specialInstructions: string | null
      }>
    }> = new Map()

    for (const booking of bookings) {
      const profile = booking.profiles as any
      const dog = booking.dogs as any

      if (!profile?.email || !dog?.name) continue

      const userId = booking.user_id
      const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Valued Customer'

      if (!userBookings.has(userId)) {
        userBookings.set(userId, {
          email: profile.email,
          userName,
          bookings: new Map()
        })
      }

      const userBookingData = userBookings.get(userId)!
      const dateKey = booking.booking_date

      if (!userBookingData.bookings.has(dateKey)) {
        userBookingData.bookings.set(dateKey, {
          date: dateKey,
          dogNames: [],
          needsBreakfast: false,
          needsLunch: false,
          needsDinner: false,
          specialInstructions: null
        })
      }

      const dateBooking = userBookingData.bookings.get(dateKey)!

      // Add dog name if not already present
      if (!dateBooking.dogNames.includes(dog.name)) {
        dateBooking.dogNames.push(dog.name)
      }

      // Combine meal requirements (if any booking for that day needs a meal, show it)
      if (booking.needs_breakfast) dateBooking.needsBreakfast = true
      if (booking.needs_lunch) dateBooking.needsLunch = true
      if (booking.needs_dinner) dateBooking.needsDinner = true

      // Combine special instructions
      if (booking.special_instructions) {
        if (dateBooking.specialInstructions) {
          // Avoid duplicates
          if (!dateBooking.specialInstructions.includes(booking.special_instructions)) {
            dateBooking.specialInstructions += '; ' + booking.special_instructions
          }
        } else {
          dateBooking.specialInstructions = booking.special_instructions
        }
      }
    }

    let emailsSent = 0
    const errors: string[] = []

    // Send email to each user with their bookings
    for (const [userId, userData] of userBookings) {
      const bookingsArray = Array.from(userData.bookings.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      try {
        const result = await sendWeeklyBookingReminder({
          userEmail: userData.email,
          userName: userData.userName,
          bookings: bookingsArray,
          weekStartDate: weekStartStr,
          weekEndDate: weekEndStr,
        })

        if (result.success) {
          emailsSent++
          console.log(`Sent weekly reminder to ${userData.email} for ${bookingsArray.length} booking days`)
        } else {
          errors.push(`Failed to send email to ${userData.email}: ${result.error}`)
        }
      } catch (emailError) {
        errors.push(`Error sending email to ${userData.email}: ${emailError}`)
      }
    }

    const response = {
      message: 'Weekly booking reminder check complete',
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      totalBookings: bookings.length,
      usersNotified: userBookings.size,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log('Weekly reminder cron job completed:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in weekly booking reminder cron:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggering from admin panel
export async function POST(request: NextRequest) {
  // For POST, check for admin authentication instead of cron secret
  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]

    // First try cron secret
    if (token === process.env.CRON_SECRET) {
      return GET(request)
    }

    // Then try user auth
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Reuse GET handler logic
  return GET(request)
}
