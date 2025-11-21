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

    // Calculate order amount (with discount if applicable)
    const orderAmount = (finalAmount || totalAmount).toFixed(2)

    // Build purchase items
    const items = extraDaysPurchases.map((purchase: any) => ({
      name: `Extra Days - ${purchase.dogName}`,
      description: `${purchase.quantity} extra day${purchase.quantity > 1 ? 's' : ''} - ${purchase.sessionType === 'full_day' ? 'Full Day' : 'Half Day'}`,
      unit_amount: {
        currency_code: 'GBP',
        value: purchase.pricePerDay.toFixed(2),
      },
      quantity: purchase.quantity.toString(),
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
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/extra-days/success-paypal`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/extra-days`,
        },
        purchase_units: [
          {
            amount: {
              currency_code: 'GBP',
              value: orderAmount,
              breakdown: {
                item_total: {
                  currency_code: 'GBP',
                  value: orderAmount,
                },
              },
            },
            items: items,
            custom_id: JSON.stringify({
              userId,
              extraDaysPurchases,
              type: 'extra_days',
              discountCode: discountCode || '',
              discountCodeId: discountCodeId || '',
              totalAmount,
              discountAmount,
              finalAmount,
            }),
          },
        ],
      }),
    })

    const order = await orderResponse.json()

    if (!order.id) {
      throw new Error('Failed to create PayPal order')
    }

    // Store pending extra days purchases in database
    for (const purchase of extraDaysPurchases) {
      const now = new Date()
      const expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

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
        payment_status: 'pending',
        paypal_order_id: order.id,
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
    console.error('PayPal extra days checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal checkout' },
      { status: 500 }
    )
  }
}
