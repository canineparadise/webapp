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
      extraDaysPurchases,
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot create checkout for other users' }, { status: 403 })
      }
    }

    if (!userId || !extraDaysPurchases || extraDaysPurchases.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const lineItems = extraDaysPurchases.map((purchase: any) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: `Extra Days - ${purchase.dogName}`,
          description: `${purchase.quantity} extra day${purchase.quantity > 1 ? 's' : ''} - ${purchase.sessionType === 'full_day' ? 'Full Day' : 'Half Day'}`,
        },
        unit_amount: Math.round(purchase.pricePerDay * 100), // Convert to pence
      },
      quantity: purchase.quantity,
    }))

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/extra-days/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/extra-days`,
      client_reference_id: userId,
      metadata: {
        userId,
        extraDaysPurchases: JSON.stringify(extraDaysPurchases),
        discountCode: discountCode || '',
        discountCodeId: discountCodeId || '',
        totalAmount: totalAmount.toString(),
        discountAmount: discountAmount.toString(),
        finalAmount: finalAmount.toString(),
        isVipMember: isVipMember ? 'true' : 'false',
        vipDiscountAmount: (vipDiscountAmount || 0).toString(),
        type: 'extra_days',
      },
    }

    // Add discount if applicable (either discount code or VIP discount or both)
    if (discountAmount > 0) {
      // Build coupon name based on discount sources
      let couponName = ''
      if (discountCode && vipDiscountAmount > 0) {
        couponName = `Discount: ${discountCode} + Golden Paw VIP 10%`
      } else if (discountCode) {
        couponName = `Discount Code: ${discountCode}`
      } else if (isVipMember && vipDiscountAmount > 0) {
        couponName = 'Golden Paw VIP 10% Discount'
      } else {
        couponName = 'Discount'
      }

      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100), // Convert to pence
        currency: 'gbp',
        duration: 'once',
        name: couponName,
      })

      sessionParams.discounts = [{ coupon: coupon.id }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Store pending extra days purchases in database
    for (const purchase of extraDaysPurchases) {
      // Calculate expiry (end of current billing month)
      const now = new Date()
      const expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) // End of month

      await supabase.from('extra_days_purchases').insert({
        user_id: userId,
        dog_id: purchase.dogId,
        subscription_id: purchase.subscriptionId,
        quantity: purchase.quantity,
        price_per_day: purchase.pricePerDay,
        total_amount: purchase.totalPrice,
        discount_code_id: discountCodeId || null,
        discount_amount: discountAmount || 0,
        final_amount: finalAmount,
        payment_status: 'pending', // Will be updated by webhook
        days_used: 0,
        days_remaining: purchase.quantity,
        expires_at: expiresAt.toISOString(),
      })
    }

    // Note: Discount code usage is handled by the webhook after payment confirmation

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Error creating extra days checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
