import { NextRequest, NextResponse } from 'next/server'
import { paypalClient } from '@/lib/paypal'
import { orders } from '@paypal/checkout-server-sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, dogId, dates, pricePerDay } = await request.json()

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
      .select('name')
      .eq('id', dogId)
      .maybeSingle()

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 })
    }

    const totalAmount = (pricePerDay * dates.length).toFixed(2)
    const description = `Extra Days for ${dog.name} - ${dates.length} day${dates.length > 1 ? 's' : ''}`

    // Create PayPal order
    const orderRequest = new orders.OrdersCreateRequest()
    orderRequest.prefer('return=representation')
    orderRequest.requestBody({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'Aldenham Doggy Day Care',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/extra-days?payment_method=paypal&success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/extra-days`,
      },
      purchase_units: [
        {
          amount: {
            currency_code: 'GBP',
            value: totalAmount,
            breakdown: {
              item_total: {
                currency_code: 'GBP',
                value: totalAmount,
              },
            },
          },
          description: description,
          items: [
            {
              name: 'Extra Day Care',
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
            type: 'extra_days',
          }),
        },
      ],
    })

    const client = paypalClient()
    const order = await client.execute(orderRequest)

    const approvalUrl = order.result.links?.find((link: any) => link.rel === 'approve')?.href

    return NextResponse.json({
      orderId: order.result.id,
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
