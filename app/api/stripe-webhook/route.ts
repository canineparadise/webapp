import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
      break

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata, client_reference_id, subscription } = session

  if (!metadata || !client_reference_id) {
    console.error('Missing metadata or client_reference_id')
    return
  }

  const userId = client_reference_id

  if (metadata.type === 'subscription') {
    // Handle new subscription
    const { tierId, days } = metadata
    const amount = session.amount_total ? session.amount_total / 100 : 0

    // Calculate end date (end of month)
    const startDate = new Date()
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

    // Create subscription in database
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier_id: tierId,
        days_included: parseInt(days),
        days_remaining: parseInt(days),
        monthly_price: amount,
        price_per_day: amount / parseInt(days),
        is_active: true,
        auto_renew: true,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        next_billing_date: endDate.toISOString().split('T')[0],
        stripe_subscription_id: subscription as string,
        payment_status: 'paid',
      })

    if (error) {
      console.error('Error creating subscription:', error)
    } else {
      console.log('Subscription created successfully for user:', userId)
    }

  } else if (metadata.type === 'extra_days') {
    // Handle extra days purchase
    const { subscriptionId, numDays } = metadata

    // Add days to existing subscription
    const { error } = await supabase.rpc('add_subscription_days', {
      p_subscription_id: subscriptionId,
      p_days_to_add: parseInt(numDays)
    })

    if (error) {
      console.error('Error adding extra days:', error)

      // Fallback: manual update
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('days_remaining')
        .eq('id', subscriptionId)
        .single()

      if (sub) {
        await supabase
          .from('subscriptions')
          .update({
            days_remaining: sub.days_remaining + parseInt(numDays)
          })
          .eq('id', subscriptionId)
      }
    } else {
      console.log('Extra days added successfully for subscription:', subscriptionId)
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as inactive
  const { error } = await supabase
    .from('subscriptions')
    .update({
      is_active: false,
      auto_renew: false
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error deleting subscription:', error)
  } else {
    console.log('Subscription marked as inactive:', subscription.id)
  }
}
