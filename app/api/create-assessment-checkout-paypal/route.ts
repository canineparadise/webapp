import { NextRequest, NextResponse } from 'next/server'
import { getPayPalConfig, getPayPalAccessToken } from '@/lib/paypal'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS in API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, dogIds, requestedDate, slotId } = await request.json()

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
      const { data: slot } = await supabase
        .from('assessment_slots')
        .select('*')
        .eq('id', slotId)
        .maybeSingle()

      if (slot) {
        slotDetails = slot
        dateDisplay = new Date(slot.assessment_date).toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
        dateDisplay += ` at ${slot.start_time.slice(0, 5)}-${slot.end_time.slice(0, 5)}`
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
    const description = dogCount === 1
      ? `Dog Assessment - ${dateDisplay}`
      : `Dog Assessment for ${dogCount} dogs - ${dateDisplay}`

    // Calculate total: £40 per dog
    const totalAmount = (assessmentFee * dogCount).toFixed(2)

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
          return_url: slotId
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/assessment/success?payment_method=paypal&slot_id=${slotId}&dog_ids=${dogIds.join(',')}`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/assessment/success?payment_method=paypal&date=${requestedDate}&dog_ids=${dogIds.join(',')}`,
          cancel_url: slotId
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/assessment/book-slot`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/assessment/schedule`,
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
                name: 'Dog Assessment Day',
                description: description,
                unit_amount: {
                  currency_code: 'GBP',
                  value: assessmentFee.toFixed(2),
                },
                quantity: dogCount.toString(),
              },
            ],
            custom_id: JSON.stringify({
              userId,
              dogIds: dogIds.join(','),
              requestedDate: requestedDate || '',
              slotId: slotId || '',
              type: 'assessment',
            }),
          },
        ],
      }),
    })

    const order = await orderResponse.json()

    // Find the approval URL
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href

    return NextResponse.json({
      orderId: order.id,
      approvalUrl: approvalUrl,
    })
  } catch (error: any) {
    console.error('PayPal checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal checkout' },
      { status: 500 }
    )
  }
}
