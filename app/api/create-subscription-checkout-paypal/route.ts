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
    const { userId, dogId, tier, priceId } = await request.json()

    if (!userId || !dogId || !tier) {
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

    // Get subscription tier pricing
    const { data: tierData } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('tier_name', tier)
      .maybeSingle()

    if (!tierData) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    const amount = tierData.price.toFixed(2)
    const description = `${tierData.tier_name} Subscription for ${dog.name} - ${tierData.days_per_week} days/week`

    // Create PayPal order
    const orderRequest = new orders.OrdersCreateRequest()
    orderRequest.prefer('return=representation')
    orderRequest.requestBody({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'Aldenham Doggy Day Care',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?payment_method=paypal&success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions`,
      },
      purchase_units: [
        {
          amount: {
            currency_code: 'GBP',
            value: amount,
          },
          description: description,
          custom_id: JSON.stringify({
            userId,
            dogId,
            tier,
            type: 'subscription',
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
    console.error('PayPal subscription checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal checkout' },
      { status: 500 }
    )
  }
}
