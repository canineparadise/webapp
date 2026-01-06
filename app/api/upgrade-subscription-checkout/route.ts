import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  // Initialize Stripe lazily to avoid build-time errors
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
  })

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    // Verify the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { subscriptionId, newTierId, proRataAmount, userId } = body

    // Security check
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!subscriptionId || !newTierId || proRataAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the subscription with dog info
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        subscription_tiers:tier_id(*),
        dogs:dog_id(name)
      `)
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Get the new tier
    const { data: newTier, error: tierError } = await supabaseAdmin
      .from('subscription_tiers')
      .select('*')
      .eq('id', newTierId)
      .single()

    if (tierError || !newTier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Verify the new tier is an upgrade
    const currentTier = subscription.subscription_tiers
    if (newTier.days_included <= currentTier.days_included) {
      return NextResponse.json({ error: 'New tier must have more days than current tier' }, { status: 400 })
    }

    // Calculate the extra days they get from the upgrade (pro-rated)
    const nextBillingDate = new Date(subscription.next_billing_date)
    const today = new Date()
    const billingPeriodDays = 30
    const msPerDay = 24 * 60 * 60 * 1000
    const daysUntilBilling = Math.max(0, Math.ceil((nextBillingDate.getTime() - today.getTime()) / msPerDay))
    const proRataFraction = daysUntilBilling / billingPeriodDays

    // Calculate extra days to add immediately
    const extraDaysFromUpgrade = Math.floor((newTier.days_included - currentTier.days_included) * proRataFraction)

    // Create Stripe checkout session for the pro-rata payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Subscription Upgrade - ${subscription.dogs?.name || 'Dog'}`,
              description: `Upgrade from ${currentTier.name} to ${newTier.name} (Pro-rata for ${daysUntilBilling} days)`,
            },
            unit_amount: Math.round(proRataAmount * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions`,
      client_reference_id: user.id,
      metadata: {
        type: 'subscription_upgrade',
        userId: user.id,
        subscriptionId,
        currentTierId: currentTier.id,
        newTierId,
        proRataAmount: proRataAmount.toString(),
        extraDaysFromUpgrade: extraDaysFromUpgrade.toString(),
        dogName: subscription.dogs?.name || '',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error: any) {
    console.error('Upgrade subscription checkout error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
