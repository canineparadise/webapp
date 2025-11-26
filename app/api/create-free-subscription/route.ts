import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, dogSubscriptions, discountCode, discountCodeId, totalAmount, discountAmount } = await request.json()

    if (!userId || !dogSubscriptions || !Array.isArray(dogSubscriptions) || dogSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create subscriptions for each dog
    const subscriptions = dogSubscriptions.map((dogSub: any) => ({
      user_id: userId,
      dog_id: dogSub.dogId,
      tier_id: dogSub.tierId,
      tier: dogSub.tierName,
      monthly_price: dogSub.monthlyPrice || 0,
      is_active: true,
      start_date: new Date().toISOString(),
      payment_status: 'free',
      stripe_subscription_id: null,
      session_type: dogSub.sessionType || 'full_day',
    }))

    const { data: createdSubscriptions, error: subError } = await supabase
      .from('subscriptions')
      .insert(subscriptions)
      .select()

    if (subError) {
      console.error('Error creating subscriptions:', subError)
      throw subError
    }

    // If discount code was used, record the usage
    if (discountCodeId) {
      await supabase.rpc('use_discount_code', {
        p_discount_code_id: discountCodeId,
        p_user_id: userId,
      })
    }

    return NextResponse.json({
      success: true,
      subscriptions: createdSubscriptions,
    })
  } catch (error: any) {
    console.error('Error creating free subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
