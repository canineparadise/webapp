import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-08-27.basil',
    })

    const {
      subscriptionId,
      numExtraDays,
      pricePerDay,
      selectedDates,
      selectedDogs,
      mealOptions,
      specialNotes,
      includedDays
    } = await req.json()

    // Get user from session cookie
    const cookieHeader = req.headers.get('cookie') || ''
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate total cost (extra days only, included days are FREE)
    const totalCost = numExtraDays * pricePerDay

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Extra Daycare Days (${numExtraDays} day${numExtraDays > 1 ? 's' : ''})`,
              description: `Additional days at your subscription rate of £${pricePerDay}/day`,
            },
            unit_amount: Math.round(pricePerDay * 100), // Convert to pence
          },
          quantity: numExtraDays,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/booking`,
      client_reference_id: user.id,
      metadata: {
        type: 'subscription_extra_days',
        subscriptionId: subscriptionId,
        numExtraDays: numExtraDays.toString(),
        pricePerDay: pricePerDay.toString(),
        selectedDates: selectedDates.join(','),
        selectedDogs: selectedDogs.join(','),
        mealBreakfast: mealOptions.breakfast ? 'true' : 'false',
        mealLunch: mealOptions.lunch ? 'true' : 'false',
        mealDinner: mealOptions.dinner ? 'true' : 'false',
        specialNotes: specialNotes || '',
        includedDays: includedDays.toString(),
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Error creating subscription extra days checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
