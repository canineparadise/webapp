import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, dogId, dates, pricePerDay } = await request.json()

    if (!userId || !dogId || !dates || !dates.length || !pricePerDay) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get dog details
    const { data: dog } = await supabase
      .from('dogs')
      .select('name, size')
      .eq('id', dogId)
      .maybeSingle()

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 })
    }

    // Check capacity for all dates
    for (const date of dates) {
      const { data: capacityData, error: capacityError } = await supabase
        .rpc('check_daily_capacity', {
          p_date: date,
          p_dog_size: dog.size
        })

      if (capacityError) {
        console.error('Capacity check error:', capacityError)
        return NextResponse.json(
          { error: 'Failed to check capacity' },
          { status: 500 }
        )
      }

      if (!capacityData.is_available) {
        return NextResponse.json(
          { error: `No availability for ${date}` },
          { status: 400 }
        )
      }
    }

    const totalAmount = pricePerDay * dates.length
    const description = `Individual Day Booking for ${dog.name} - ${dates.length} day${dates.length > 1 ? 's' : ''}`

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Individual Day Care',
              description: description,
            },
            unit_amount: Math.round(pricePerDay * 100),
          },
          quantity: dates.length,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/individual-days?payment_method=stripe&session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/individual-days`,
      customer_email: profile.email,
      metadata: {
        userId,
        dogId,
        dates: dates.join(','),
        type: 'individual_days',
        pricePerDay: pricePerDay.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe individual day checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
