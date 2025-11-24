import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  // Initialize Stripe lazily to avoid build-time errors
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
  })
  try {
    const {
      userId,
      dogSubscriptions,
      discountCode,
      discountCodeId,
      totalAmount,
      discountAmount,
      finalAmount
    } = await request.json()

    if (!userId || !dogSubscriptions || dogSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const lineItems = dogSubscriptions.map((sub: any) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: `Dog Daycare Subscription - ${sub.tierName}`,
          description: `${sub.daysIncluded} days/month - ${sub.sessionType === 'full_day' ? 'Full Day' : 'Half Day'}`,
        },
        unit_amount: Math.round(sub.monthlyPrice * 100), // Convert to pence
        recurring: {
          interval: 'month',
        },
      },
      quantity: 1,
    }))

    // Apply discount if provided
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions`,
      client_reference_id: userId,
      metadata: {
        userId,
        dogSubscriptions: JSON.stringify(dogSubscriptions),
        discountCode: discountCode || '',
        discountCodeId: discountCodeId || '',
        totalAmount: totalAmount.toString(),
        discountAmount: discountAmount.toString(),
        finalAmount: finalAmount.toString(),
      },
    }

    // Add discount if applicable
    if (discountCode && discountAmount > 0) {
      // Create a Stripe coupon for this discount
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100), // Convert to pence
        currency: 'gbp',
        duration: 'once',
        name: `Discount Code: ${discountCode}`,
      })

      sessionParams.discounts = [{ coupon: coupon.id }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Store pending subscription data in database
    // This will be completed by the webhook after successful payment
    for (const dogSub of dogSubscriptions) {
      await supabase.from('subscriptions').insert({
        user_id: userId,
        dog_id: dogSub.dogId,
        tier_id: dogSub.tierId,
        session_type: dogSub.sessionType,
        days_included: dogSub.daysIncluded,
        days_used: 0,
        days_remaining: dogSub.daysIncluded,
        price_per_day: dogSub.pricePerDay,
        monthly_price: dogSub.monthlyPrice,
        is_active: false, // Will be activated by webhook
        payment_status: 'pending',
        stripe_subscription_id: null, // Will be set by webhook
        stripe_customer_id: null, // Will be set by webhook
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    // Record discount code usage if applicable
    if (discountCodeId) {
      await supabase.from('discount_code_usage').insert({
        discount_code_id: discountCodeId,
        user_id: userId,
        used_for: 'subscription',
        original_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
      })

      // Increment usage count
      const { data: discountCode } = await supabase
        .from('discount_codes')
        .select('current_uses')
        .eq('id', discountCodeId)
        .single()
      
      if (discountCode) {
        await supabase
          .from('discount_codes')
          .update({ current_uses: discountCode.current_uses + 1 })
          .eq('id', discountCodeId)
      }
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Error creating subscription checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
