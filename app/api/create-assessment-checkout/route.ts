import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

// Use service role key to bypass RLS in API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, dogIds, requestedDate, slotId } = await request.json()

    // Support both old format (requestedDate) and new format (slotId)
    if (!userId || !dogIds || (!requestedDate && !slotId)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user profile for customer details
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get business settings for assessment fee
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'assessment_fee')
      .maybeSingle()

    const assessmentFee = settings?.setting_value ? parseFloat(settings.setting_value) : 40

    // Get slot details if slotId provided
    let dateDisplay = ''
    let slotDetails = null

    if (slotId) {
      const { data: slot } = await supabase
        .from('assessment_slots')
        .select('*')
        .eq('id', slotId)
        .maybeSingle()

      if (slot) {
        slotDetails = slot
        dateDisplay = new Date(slot.assessment_date).toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
        dateDisplay += ` at ${slot.start_time.slice(0, 5)}-${slot.end_time.slice(0, 5)}`
      }
    } else if (requestedDate) {
      // Old format compatibility
      dateDisplay = new Date(requestedDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }

    const dogCount = dogIds.length
    const description = dogCount === 1
      ? `Dog Assessment - ${dateDisplay}`
      : `Dog Assessment for ${dogCount} dogs - ${dateDisplay}`

    // Calculate total: £40 per dog
    const totalAmount = assessmentFee * dogCount

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Dog Assessment Day',
              description: description,
              images: [], // Can add your logo URL here
            },
            unit_amount: Math.round(assessmentFee * 100), // Convert to pence (£40 per dog)
          },
          quantity: dogCount, // Charge for each dog
        },
      ],
      mode: 'payment',
      success_url: slotId
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/assessment/success?session_id={CHECKOUT_SESSION_ID}&slot_id=${slotId}&dog_ids=${dogIds.join(',')}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/assessment/success?session_id={CHECKOUT_SESSION_ID}&date=${requestedDate}&dog_ids=${dogIds.join(',')}`,
      cancel_url: slotId
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/assessment/book-slot`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/assessment/schedule`,
      client_reference_id: userId,
      customer_email: profile.email,
      metadata: {
        userId,
        dogIds: dogIds.join(','),
        requestedDate: requestedDate || '',
        slotId: slotId || '',
        type: 'assessment',
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
