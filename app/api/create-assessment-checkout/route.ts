import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS in API routes
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
      dogIds,
      requestedDate,
      slotId,
      discountCode,
      discountCodeId,
      totalAmount,
      discountAmount,
      finalAmount,
      isVipMember,
      vipDiscountAmount
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
      // First, try to reserve the slot to prevent double bookings
      // This uses an atomic database operation to ensure only one user can reserve a slot
      const { data: reserveResult, error: reserveError } = await supabase
        .rpc('reserve_assessment_slot', {
          p_slot_id: slotId,
          p_user_id: userId,
          p_reservation_minutes: 30  // 30 minute reservation window for payment
        })

      // If reservation function doesn't exist yet, fall back to direct check
      if (reserveError && (reserveError.message.includes('does not exist') || reserveError.message.includes('Could not find the function') || reserveError.code === 'PGRST202')) {
        console.log('[Assessment Checkout] Reservation function not found, using direct check')
        // Check if slot is available
        const { data: slot } = await supabase
          .from('assessment_slots')
          .select('*')
          .eq('id', slotId)
          .maybeSingle()

        if (!slot || !slot.is_available) {
          return NextResponse.json(
            { error: 'This slot is no longer available. Please select another time.' },
            { status: 409 }
          )
        }

        // Try to reserve with direct update (less safe but works without the function)
        const { error: updateError } = await supabase
          .from('assessment_slots')
          .update({
            is_available: false,
            booked_by_user_id: userId,
          })
          .eq('id', slotId)
          .eq('is_available', true)  // Only update if still available (optimistic lock)

        if (updateError) {
          console.error('[Assessment Checkout] Failed to reserve slot:', updateError)
          return NextResponse.json(
            { error: 'Failed to reserve slot. Please try again.' },
            { status: 500 }
          )
        }

        slotDetails = slot
      } else if (reserveError) {
        console.error('[Assessment Checkout] Reserve error:', reserveError)
        return NextResponse.json(
          { error: 'Failed to reserve slot. Please try again.' },
          { status: 500 }
        )
      } else if (reserveResult === false) {
        // Slot was already reserved by someone else
        return NextResponse.json(
          { error: 'This slot is no longer available. Please select another time.' },
          { status: 409 }
        )
      } else {
        // Reservation successful, get slot details
        const { data: slot } = await supabase
          .from('assessment_slots')
          .select('*')
          .eq('id', slotId)
          .maybeSingle()

        slotDetails = slot
      }

      if (slotDetails) {
        dateDisplay = new Date(slotDetails.assessment_date).toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
        dateDisplay += ` at ${slotDetails.start_time.slice(0, 5)}-${slotDetails.end_time.slice(0, 5)}`
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

    // Build description with discount info
    let description = dogCount === 1
      ? `Dog Assessment - ${dateDisplay}`
      : `Dog Assessment for ${dogCount} dogs - ${dateDisplay}`

    if (discountCode && vipDiscountAmount > 0) {
      description = `${description} (Discount: ${discountCode} + Golden Paw VIP 10%)`
    } else if (discountCode) {
      description = `${description} (Discount: ${discountCode})`
    } else if (isVipMember && vipDiscountAmount > 0) {
      description = `${description} (Golden Paw VIP 10% Discount)`
    }

    // Calculate amount to charge
    const calculatedTotal = assessmentFee * dogCount
    const amountToCharge = finalAmount !== undefined && finalAmount !== null ? finalAmount : calculatedTotal

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Dog Assessment Day',
              description,
              images: [], // Can add your logo URL here
            },
            unit_amount: Math.round(amountToCharge * 100), // Apply discount if provided
          },
          quantity: 1,
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
        discountCode: discountCode || '',
        discountCodeId: discountCodeId || '',
        totalAmount: (totalAmount || calculatedTotal).toString(),
        discountAmount: (discountAmount || 0).toString(),
        finalAmount: (finalAmount || calculatedTotal).toString(),
        isVipMember: isVipMember ? 'true' : 'false',
        vipDiscountAmount: (vipDiscountAmount || 0).toString(),
      },
    })

    // Note: Discount code usage is handled by the webhook after payment confirmation

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
