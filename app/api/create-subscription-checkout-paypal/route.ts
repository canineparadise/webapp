import { NextRequest, NextResponse } from 'next/server'
import { getPayPalConfig, getPayPalAccessToken } from '@/lib/paypal'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
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

    // Calculate final amount (with discount if applicable)
    const orderAmount = (finalAmount || totalAmount).toFixed(2)

    // Build purchase units with per-dog subscriptions
    const purchaseUnits = dogSubscriptions.map((sub: any) => ({
      amount: {
        currency_code: 'GBP',
        value: sub.monthlyPrice.toFixed(2),
      },
      description: `${sub.tierName} - ${sub.daysIncluded} days/month - ${sub.sessionType === 'full_day' ? 'Full Day' : 'Half Day'}`,
      custom_id: JSON.stringify({
        userId,
        dogId: sub.dogId,
        tierId: sub.tierId,
        sessionType: sub.sessionType,
        type: 'subscription',
        discountCode: discountCode || '',
        discountCodeId: discountCodeId || '',
      }),
    }))

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()
    const { baseUrl } = getPayPalConfig()

    // Create PayPal order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        application_context: {
          brand_name: 'Aldenham Doggy Day Care',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions/success-paypal`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions`,
        },
        purchase_units: purchaseUnits,
      }),
    })

    const order = await orderResponse.json()

    if (!order.id) {
      throw new Error('Failed to create PayPal order')
    }

    // Store pending subscription data in database
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
        is_active: false,
        payment_status: 'pending',
        paypal_order_id: order.id,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      const { data: discountCodeData } = await supabase
        .from('discount_codes')
        .select('current_uses')
        .eq('id', discountCodeId)
        .single()

      if (discountCodeData) {
        await supabase
          .from('discount_codes')
          .update({ current_uses: discountCodeData.current_uses + 1 })
          .eq('id', discountCodeId)
      }
    }

    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href

    return NextResponse.json({
      orderId: order.id,
      approvalUrl: approvalUrl,
    })
  } catch (error: any) {
    console.error('PayPal subscription checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal checkout' },
      { status: 500 }
    )
  }
}
