import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
  })

  try {
    // Verify admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all completed checkout sessions from Stripe
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
    })

    const results = {
      processed: 0,
      created: 0,
      skipped: 0,
      errors: [] as string[],
      details: [] as any[],
    }

    for (const session of sessions.data) {
      results.processed++
      const metadata = session.metadata || {}

      // Process individual_days type
      if (metadata.type === 'individual_days') {
        const { userId, dogId, dates, pricePerDay, needsBreakfast, needsLunch, needsDinner, specialInstructions } = metadata

        if (!userId || !dogId || !dates) {
          results.skipped++
          continue
        }

        // Check if we already have these bookings
        const { data: existingBookings } = await supabase
          .from('individual_day_bookings')
          .select('id')
          .eq('stripe_session_id', session.id)

        if (existingBookings && existingBookings.length > 0) {
          results.skipped++
          results.details.push({
            sessionId: session.id,
            status: 'skipped',
            reason: 'Already exists',
          })
          continue
        }

        // Get dog details
        const { data: dog } = await supabase
          .from('dogs')
          .select('size')
          .eq('id', dogId)
          .single()

        if (!dog) {
          results.errors.push(`Dog not found: ${dogId} for session ${session.id}`)
          continue
        }

        const datesArray = dates.split(',')
        const bookings = datesArray.map((date: string) => ({
          user_id: userId,
          dog_id: dogId,
          booking_date: date.trim(),
          dog_size: dog.size,
          price: parseFloat(pricePerDay || '50'),
          payment_status: 'paid',
          payment_method: 'stripe',
          stripe_session_id: session.id,
          status: 'confirmed',
          needs_breakfast: needsBreakfast === 'true',
          needs_lunch: needsLunch === 'true',
          needs_dinner: needsDinner === 'true',
          special_instructions: specialInstructions || null,
        }))

        const { error: insertError } = await supabase
          .from('individual_day_bookings')
          .insert(bookings)

        if (insertError) {
          results.errors.push(`Insert error for session ${session.id}: ${insertError.message}`)
        } else {
          results.created += bookings.length
          results.details.push({
            sessionId: session.id,
            status: 'created',
            bookings: bookings.length,
            userId,
            dogId,
            dates: datesArray,
          })

          // Record financial transaction
          const amount = session.amount_total ? session.amount_total / 100 : 0
          await supabase.from('financial_transactions').insert({
            user_id: userId,
            transaction_type: 'individual_days',
            amount,
            currency: 'GBP',
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_customer_id: session.customer as string,
            payment_method: 'card',
            status: 'completed',
            payment_date: new Date(session.created * 1000).toISOString(),
            description: `Individual day booking - ${datesArray.length} day${datesArray.length > 1 ? 's' : ''} (synced)`,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error('Error syncing Stripe payments:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync payments' },
      { status: 500 }
    )
  }
}

// GET endpoint to view all Stripe sessions
export async function GET(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
  })

  try {
    // Verify admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
    })

    const sessionDetails = sessions.data.map(s => ({
      id: s.id,
      amount: s.amount_total ? s.amount_total / 100 : 0,
      currency: s.currency,
      created: new Date(s.created * 1000).toISOString(),
      metadata: s.metadata,
      customer_email: s.customer_details?.email,
      payment_status: s.payment_status,
    }))

    return NextResponse.json({
      success: true,
      sessions: sessionDetails,
    })
  } catch (error: any) {
    console.error('Error fetching Stripe sessions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
