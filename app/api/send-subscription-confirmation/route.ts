import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSubscriptionConfirmation } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, subscriptionIds, totalAmount } = await request.json()

    if (!userId || !subscriptionIds || !Array.isArray(subscriptionIds)) {
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
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get subscription details with tier information
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select(`
        *,
        dogs:dog_id (
          id,
          name
        ),
        subscription_tiers:tier_id (
          name,
          days_per_week,
          price_per_month
        )
      `)
      .in('id', subscriptionIds)

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Subscriptions not found' },
        { status: 404 }
      )
    }

    // Format subscription data for email
    const formattedSubscriptions = subscriptions.map(sub => ({
      dogName: sub.dogs.name,
      tierName: sub.subscription_tiers.name,
      daysPerWeek: sub.subscription_tiers.days_per_week,
      pricePerMonth: sub.subscription_tiers.price_per_month,
    }))

    // Calculate next billing date (30 days from now)
    const nextBillingDate = new Date()
    nextBillingDate.setDate(nextBillingDate.getDate() + 30)

    // Send email
    const result = await sendSubscriptionConfirmation({
      userEmail: profile.email,
      userName: `${profile.first_name} ${profile.last_name}`,
      subscriptions: formattedSubscriptions,
      totalAmount: totalAmount || 0,
      nextBillingDate: nextBillingDate.toISOString().split('T')[0],
    })

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      throw new Error('Failed to send email')
    }
  } catch (error: any) {
    console.error('Error sending subscription confirmation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send confirmation email' },
      { status: 500 }
    )
  }
}
