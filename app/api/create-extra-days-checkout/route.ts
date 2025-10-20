import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: Request) {
  try {
    const {
      userId,
      extraDaysPurchases,
      discountCode,
      discountCodeId,
      totalAmount,
      discountAmount,
      finalAmount
    } = await request.json()

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
        type: 'extra_days',
      },
    }

    // Add discount if applicable
    if (discountCode && discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100), // Convert to pence
        currency: 'gbp',
        duration: 'once',
        name: `Discount Code: ${discountCode}`,
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

    // Record discount code usage if applicable
    if (discountCodeId) {
      await supabase.from('discount_code_usage').insert({
        discount_code_id: discountCodeId,
        user_id: userId,
        used_for: 'extra_days',
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
    console.error('Error creating extra days checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
