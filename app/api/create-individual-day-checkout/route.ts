import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // Initialize Stripe lazily to avoid build-time errors
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
  })
  try {
    // Verify the request is from an authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const {
      userId,
      dogId,
      dates,
      pricePerDay,
      discountCode,
      discountCodeId,
      totalAmount,
      discountAmount,
      finalAmount,
      needsBreakfast,
      needsLunch,
      needsDinner,
      specialInstructions,
      isVipMember,
      vipDiscountAmount,
    } = await request.json()

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

    const calculatedTotal = pricePerDay * dates.length
    const amountToCharge = finalAmount || calculatedTotal

    // Build description with discount info
    let description = `Individual Day Booking for ${dog.name} - ${dates.length} day${dates.length > 1 ? 's' : ''}`
    if (discountCode && vipDiscountAmount > 0) {
      description = `${description} (Discount: ${discountCode} + Golden Paw VIP 10%)`
    } else if (discountCode) {
      description = `${description} (Discount: ${discountCode})`
    } else if (isVipMember && vipDiscountAmount > 0) {
      description = `${description} (Golden Paw VIP 10% Discount)`
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Individual Day Care',
              description,
            },
            unit_amount: Math.round(amountToCharge * 100),
          },
          quantity: 1,
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
        discountCode: discountCode || '',
        discountCodeId: discountCodeId || '',
        totalAmount: (totalAmount || calculatedTotal).toString(),
        discountAmount: (discountAmount || 0).toString(),
        finalAmount: (finalAmount || calculatedTotal).toString(),
        isVipMember: isVipMember ? 'true' : 'false',
        vipDiscountAmount: (vipDiscountAmount || 0).toString(),
        needsBreakfast: needsBreakfast ? 'true' : 'false',
        needsLunch: needsLunch ? 'true' : 'false',
        needsDinner: needsDinner ? 'true' : 'false',
        specialInstructions: specialInstructions || '',
      },
    })

    // Note: Discount code usage is handled by the webhook after payment confirmation

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe individual day checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
