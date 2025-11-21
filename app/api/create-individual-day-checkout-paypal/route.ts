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
      dogId,
      dates,
      pricePerDay,
      discountCode,
      discountCodeId,
      totalAmount,
      discountAmount,
      finalAmount
    } = await request.json()

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

    // Calculate order amount (with discount if applicable)
    const calculatedTotal = pricePerDay * dates.length
    const orderAmount = (finalAmount || totalAmount || calculatedTotal).toFixed(2)
    const description = `Individual Day Booking for ${dog.name} - ${dates.length} day${dates.length > 1 ? 's' : ''}`

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
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/individual-days?payment_method=paypal&success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/individual-days`,
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
            description: description,
            items: [
              {
                name: 'Individual Day Care',
                description: description,
                unit_amount: {
                  currency_code: 'GBP',
                  value: pricePerDay.toFixed(2),
                },
                quantity: dates.length.toString(),
              },
            ],
            custom_id: JSON.stringify({
              userId,
              dogId,
              dates: dates.join(','),
              type: 'individual_days',
              pricePerDay: pricePerDay.toString(),
              discountCode: discountCode || '',
              discountCodeId: discountCodeId || '',
              totalAmount: totalAmount || calculatedTotal,
              discountAmount: discountAmount || 0,
              finalAmount: finalAmount || calculatedTotal,
            }),
          },
        ],
      }),
    })

    const order = await orderResponse.json()

    if (!order.id) {
      throw new Error('Failed to create PayPal order')
    }

    // Record discount code usage if applicable
    if (discountCodeId) {
      await supabase.from('discount_code_usage').insert({
        discount_code_id: discountCodeId,
        user_id: userId,
        used_for: 'individual_days',
        original_amount: totalAmount || calculatedTotal,
        discount_amount: discountAmount || 0,
        final_amount: finalAmount || calculatedTotal,
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
    console.error('PayPal individual day checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal checkout' },
      { status: 500 }
    )
  }
}
