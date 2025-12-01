import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
  })

  try {
    const { subscriptionId } = await request.json()

    // Get subscription from database
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, stripe_subscription_id')
      .eq('id', subscriptionId)
      .single()

    if (fetchError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Check if actually paused
    if (!subscription.is_paused) {
      return NextResponse.json(
        { error: 'Subscription is not paused' },
        { status: 400 }
      )
    }

    // Resume the Stripe subscription
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          pause_collection: null, // Remove pause
        })
      } catch (stripeError: any) {
        console.error('Stripe resume error:', stripeError)
        return NextResponse.json(
          { error: `Failed to resume Stripe subscription: ${stripeError.message}` },
          { status: 500 }
        )
      }
    }

    // Update subscription in database
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        is_paused: false,
        pause_start_date: null,
        pause_end_date: null,
        pause_reason: null,
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
      message: 'Subscription resumed successfully. Billing will continue as normal.',
    })
  } catch (error: any) {
    console.error('Resume subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resume subscription' },
      { status: 500 }
    )
  }
}
