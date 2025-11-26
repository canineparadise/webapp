import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Log which key is being used (without exposing the actual key)
    const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log('🔑 Using service role key:', usingServiceRole)

    const body = await request.json()
    console.log('📥 Received free subscription request:', JSON.stringify(body, null, 2))

    const { userId, dogSubscriptions, discountCode, discountCodeId, totalAmount, discountAmount } = body

    if (!userId || !dogSubscriptions || !Array.isArray(dogSubscriptions) || dogSubscriptions.length === 0) {
      console.error('❌ Validation failed:', { userId, dogSubscriptions })
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
      session_type: dogSub.sessionType || 'full_day',
      days_included: dogSub.daysIncluded || 0,
      days_used: 0,
      days_remaining: dogSub.daysIncluded || 0,
      price_per_day: dogSub.pricePerDay || 0,
      monthly_price: dogSub.monthlyPrice || 0,
      is_active: true,
      payment_status: 'paid',
      stripe_subscription_id: null,
      stripe_customer_id: null,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    console.log('📤 Inserting subscriptions:', JSON.stringify(subscriptions, null, 2))

    const { data: createdSubscriptions, error: subError } = await supabase
      .from('subscriptions')
      .insert(subscriptions)
      .select()

    if (subError) {
      console.error('❌ Error creating subscriptions:', subError)
      throw subError
    }

    console.log('✅ Successfully created subscriptions:', createdSubscriptions)

    // If discount code was used, record the usage
    if (discountCodeId) {
      await supabase.from('discount_code_usage').insert({
        discount_code_id: discountCodeId,
        user_id: userId,
        used_for: 'subscription',
        original_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: 0,
      })

      // Increment usage count
      const { data: discountCodeData } = await supabase
        .from('discount_codes')
        .select('current_uses')
        .eq('id', discountCodeId)
        .single()

      if (discountCodeData) {
        await supabase
          .from('discount_codes')
          .update({ current_uses: discountCodeData.current_uses + 1 })
          .eq('id', discountCodeId)
      }
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
