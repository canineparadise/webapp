import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventType = body.event_type

    // Handle different PayPal webhook events
    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = body.resource
      const customId = resource.purchase_units?.[0]?.custom_id

      if (!customId) {
        console.log('No custom_id found in PayPal webhook')
        return NextResponse.json({ received: true })
      }

      const metadata = JSON.parse(customId)

      // Handle assessment payments
      if (metadata.type === 'assessment') {
        const { userId, dogIds, slotId, requestedDate } = metadata
        const dogIdArray = dogIds.split(',')

        // Create assessment booking record
        const { error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            user_id: userId,
            dog_ids: dogIdArray,
            requested_date: requestedDate || null,
            slot_id: slotId || null,
            status: 'pending',
            payment_status: 'paid',
            payment_method: 'paypal',
            paypal_order_id: resource.id,
          })

        if (assessmentError) {
          console.error('Error creating assessment:', assessmentError)
        }

        // If using slots, mark slot as booked
        if (slotId) {
          await supabase
            .from('assessment_slots')
            .update({
              is_booked: true,
              booked_by: userId,
              booked_at: new Date().toISOString(),
            })
            .eq('id', slotId)
        }
      }

      // Handle subscription payments
      if (metadata.type === 'subscription') {
        const { userId, dogId, tier } = metadata

        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            dog_id: dogId,
            subscription_tier: tier,
            status: 'active',
            payment_method: 'paypal',
            paypal_order_id: resource.id,
            start_date: new Date().toISOString(),
          })

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError)
        }
      }

      // Handle extra days payments
      if (metadata.type === 'extra_days') {
        const { userId, dogId, dates } = metadata
        const dateArray = dates.split(',')

        for (const date of dateArray) {
          await supabase
            .from('extra_days')
            .insert({
              user_id: userId,
              dog_id: dogId,
              date: date,
              status: 'confirmed',
              payment_method: 'paypal',
              paypal_order_id: resource.id,
            })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
