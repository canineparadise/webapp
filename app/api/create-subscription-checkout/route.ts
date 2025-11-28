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
      // Use the pre-created Stripe coupon directly (e.g., FIRST50)
      // This assumes the discount code matches the Stripe coupon ID
      sessionParams.discounts = [{ coupon: discountCode.toUpperCase() }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Note: Subscription will be created by the webhook after successful payment
    // Removed duplicate subscription creation here to avoid conflicts

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

      // Increment usage count and check for VIP badge eligibility
      const { data: discountCodeData } = await supabase
        .from('discount_codes')
        .select('current_uses, code')
        .eq('id', discountCodeId)
        .single()

      if (discountCodeData) {
        await supabase
          .from('discount_codes')
          .update({ current_uses: discountCodeData.current_uses + 1 })
          .eq('id', discountCodeId)

        // Grant Golden Paw VIP Founders Club badge if using FIRST50
        if (discountCodeData.code === 'FIRST50') {
          await supabase
            .from('profiles')
            .update({
              is_vip_member: true,
              vip_badge_type: 'golden_paw_founders',
              vip_granted_at: new Date().toISOString()
            })
            .eq('id', userId)
        }
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
