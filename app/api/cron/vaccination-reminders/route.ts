import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendVaccinationExpiryReminder } from '@/lib/email'

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
    const today = new Date()
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    // Format dates for comparison
    const todayStr = today.toISOString().split('T')[0]
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0]

    console.log(`Checking for vaccinations expiring between ${todayStr} and ${thirtyDaysStr}`)

    // Get all approved dogs with their owner info and expiry dates
    const { data: dogs, error } = await supabase
      .from('dogs')
      .select(`
        id,
        name,
        vaccination_expiry,
        flea_treatment_date,
        worming_treatment_date,
        heartworm_prevention_date,
        owner_id,
        profiles!dogs_owner_id_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .eq('is_approved', true)
      .eq('is_draft', false)

    if (error) {
      console.error('Error fetching dogs:', error)
      return NextResponse.json({ error: 'Failed to fetch dogs' }, { status: 500 })
    }

    if (!dogs || dogs.length === 0) {
      return NextResponse.json({ message: 'No dogs to check', emailsSent: 0 })
    }

    let emailsSent = 0
    const errors: string[] = []

    // Process each dog
    for (const dog of dogs) {
      const expiringItems: Array<{
        type: 'vaccination' | 'flea' | 'worming' | 'heartworm'
        expiryDate: string
        daysUntilExpiry: number
      }> = []

      // Check each treatment type
      const treatments = [
        { field: 'vaccination_expiry', type: 'vaccination' as const },
        { field: 'flea_treatment_date', type: 'flea' as const },
        { field: 'worming_treatment_date', type: 'worming' as const },
        { field: 'heartworm_prevention_date', type: 'heartworm' as const },
      ]

      for (const treatment of treatments) {
        const expiryDate = dog[treatment.field as keyof typeof dog] as string | null

        if (expiryDate) {
          const expiry = new Date(expiryDate)
          const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          // Send reminders at 30 days, 14 days, 7 days, 3 days, and on expiry day
          const reminderDays = [30, 14, 7, 3, 1, 0]

          if (reminderDays.includes(daysUntilExpiry) && daysUntilExpiry >= 0) {
            expiringItems.push({
              type: treatment.type,
              expiryDate,
              daysUntilExpiry,
            })
          }
        }
      }

      // If there are expiring items, send email
      if (expiringItems.length > 0 && dog.profiles) {
        const profile = dog.profiles as any
        const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Valued Customer'

        try {
          const result = await sendVaccinationExpiryReminder({
            userEmail: profile.email,
            userName,
            dogName: dog.name,
            expiringItems,
          })

          if (result.success) {
            emailsSent++
            console.log(`Sent vaccination reminder to ${profile.email} for ${dog.name}`)
          } else {
            errors.push(`Failed to send email for ${dog.name}: ${result.error}`)
          }
        } catch (emailError) {
          errors.push(`Error sending email for ${dog.name}: ${emailError}`)
        }
      }
    }

    const response = {
      message: 'Vaccination reminder check complete',
      dogsChecked: dogs.length,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log('Cron job completed:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in vaccination reminder cron:', error)
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
    // Verify the user is an admin
    const token = authHeader.split(' ')[1]
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
    // Also accept cron secret for POST
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Reuse GET handler logic
  return GET(request)
}
