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
    // Verify the request is from an authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { subscriptionId, cancellationReason } = await request.json()

    // Get subscription from database
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, stripe_subscription_id, user_id, next_billing_date')
      .eq('id', subscriptionId)
      .single()

    if (fetchError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Security: Users can only cancel their own subscriptions
    if (subscription.user_id !== authUser.id) {
      const { data: authProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (!authProfile || authProfile.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot cancel other users\' subscriptions' }, { status: 403 })
      }
    }

    // Check if already cancelled
    if (subscription.cancelled_at) {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      )
    }

    // Cancel the Stripe subscription at period end
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        })
      } catch (stripeError: any) {
        console.error('Stripe cancel error:', stripeError)
        return NextResponse.json(
          { error: `Failed to cancel Stripe subscription: ${stripeError.message}` },
          { status: 500 }
        )
      }
    }

    // Update subscription in database
    // Keep is_active: true so they can still use their remaining days
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        auto_renew: false,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: cancellationReason || null,
        cancellation_requested: true,
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

    // Format the end date for the message
    const endDate = subscription.next_billing_date
      ? new Date(subscription.next_billing_date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : 'the end of your billing period'

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
      message: `Subscription cancelled. You can continue using your remaining days until ${endDate}. No further charges will be made.`,
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
