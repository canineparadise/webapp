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

    const { subscriptionId, pauseWeeks, pauseReason } = await request.json()

    // Validate pause duration (max 4 weeks)
    if (!pauseWeeks || pauseWeeks < 1 || pauseWeeks > 4) {
      return NextResponse.json(
        { error: 'Pause duration must be between 1 and 4 weeks' },
        { status: 400 }
      )
    }

    // Get subscription from database
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, stripe_subscription_id, user_id')
      .eq('id', subscriptionId)
      .single()

    if (fetchError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Security: Users can only pause their own subscriptions
    if (subscription.user_id !== authUser.id) {
      const { data: authProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (!authProfile || authProfile.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot pause other users\' subscriptions' }, { status: 403 })
      }
    }

    // Check if already paused
    if (subscription.is_paused) {
      return NextResponse.json(
        { error: 'Subscription is already paused' },
        { status: 400 }
      )
    }

    // Calculate pause dates
    const pauseStartDate = new Date()
    const pauseEndDate = new Date()
    pauseEndDate.setDate(pauseEndDate.getDate() + (pauseWeeks * 7))

    // Pause the Stripe subscription
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          pause_collection: {
            behavior: 'void', // Don't charge during pause
            resumes_at: Math.floor(pauseEndDate.getTime() / 1000), // Unix timestamp
          },
        })
      } catch (stripeError: any) {
        console.error('Stripe pause error:', stripeError)
        return NextResponse.json(
          { error: `Failed to pause Stripe subscription: ${stripeError.message}` },
          { status: 500 }
        )
      }
    }

    // Update subscription in database
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        is_paused: true,
        pause_start_date: pauseStartDate.toISOString(),
        pause_end_date: pauseEndDate.toISOString(),
        pause_reason: pauseReason || null,
        total_paused_days: (subscription.total_paused_days || 0) + (pauseWeeks * 7),
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
      message: `Subscription paused for ${pauseWeeks} week(s). Billing resumes on ${pauseEndDate.toLocaleDateString()}`,
    })
  } catch (error: any) {
    console.error('Pause subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to pause subscription' },
      { status: 500 }
    )
  }
}
