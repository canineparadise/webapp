import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
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
    const { subscriptionId, newTierId, isEndOfBillingPeriod } = body

    if (!subscriptionId || !newTierId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*, subscription_tiers:tier_id(*)')
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

    // For end-of-billing-period upgrades, schedule the upgrade for next billing cycle
    if (isEndOfBillingPeriod) {
      // Update the subscription with the pending upgrade tier
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          pending_upgrade_tier_id: newTierId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)

      if (updateError) {
        console.error('Error scheduling upgrade:', updateError)
        return NextResponse.json({ error: 'Failed to schedule upgrade' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Upgrade to ${newTier.name} scheduled for your next billing date`,
        scheduledTier: newTier.name,
      })
    }

    // For immediate upgrades (handled by Stripe checkout in the other endpoint)
    return NextResponse.json({ error: 'Immediate upgrades must use the checkout endpoint' }, { status: 400 })

  } catch (error) {
    console.error('Upgrade subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
