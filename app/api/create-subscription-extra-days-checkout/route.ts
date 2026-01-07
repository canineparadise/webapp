import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Verify the request is from an authenticated user
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-08-27.basil',
    })

    const {
      userId,
      subscriptionId,
      numExtraDays,
      pricePerDay,
      selectedDates,
      selectedDogs,
      mealOptions,
      specialNotes,
      includedDays,
      isVipMember,
      vipDiscountAmount,
      totalAmount,
      finalAmount
    } = await req.json()

    // Security: Users can only create checkouts for themselves
    if (userId !== authUser.id) {
      const { data: authProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (!authProfile || authProfile.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot create checkout for other users' }, { status: 403 })
      }
    }

    if (!userId || !subscriptionId || !numExtraDays) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate total cost (extra days only, included days are FREE)
    const calculatedTotal = numExtraDays * pricePerDay
    // Use provided finalAmount if VIP discount applied, otherwise calculate
    const amountToCharge = finalAmount || calculatedTotal

    // Build description with VIP discount info
    let description = `Additional days at your subscription rate of £${pricePerDay}/day`
    if (isVipMember && vipDiscountAmount > 0) {
      description = `${description} (Golden Paw VIP 10% Discount Applied)`
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Extra Daycare Days (${numExtraDays} day${numExtraDays > 1 ? 's' : ''})`,
              description,
            },
            unit_amount: Math.round(amountToCharge * 100), // Convert to pence - includes VIP discount
          },
          quantity: 1, // Single line item with total discounted amount
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/booking`,
      client_reference_id: userId,
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
        isVipMember: isVipMember ? 'true' : 'false',
        vipDiscountAmount: (vipDiscountAmount || 0).toString(),
        totalAmount: (totalAmount || calculatedTotal).toString(),
        finalAmount: (finalAmount || calculatedTotal).toString(),
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
