import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { userId, dogSubscriptions, discountCode, discountCodeId, totalAmount, discountAmount } = body

    // Security: Ensure user can only create subscriptions for themselves
    if (userId !== authUser.id) {
      // Check if admin is creating for someone else
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot create subscriptions for other users' }, { status: 403 })
      }
    }

    // Verify that a valid 100% discount code is being used (free subscriptions require full discount)
    if (!discountCodeId) {
      return NextResponse.json({ error: 'Discount code required for free subscriptions' }, { status: 400 })
    }

    // Verify the discount code is valid and gives 100% off
    const { data: discountData } = await supabase
      .from('discount_codes')
      .select('discount_percent, is_active, current_uses, max_uses')
      .eq('id', discountCodeId)
      .single()

    if (!discountData || !discountData.is_active) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 })
    }

    if (discountData.discount_percent !== 100) {
      return NextResponse.json({ error: 'This endpoint requires a 100% discount code' }, { status: 400 })
    }

    if (discountData.max_uses && discountData.current_uses >= discountData.max_uses) {
      return NextResponse.json({ error: 'Discount code has reached maximum uses' }, { status: 400 })
    }

    if (!userId || !dogSubscriptions || !Array.isArray(dogSubscriptions) || dogSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // IMPORTANT: Check that none of the dogs already have an active subscription
    const dogIds = dogSubscriptions.map((sub: any) => sub.dogId)
    const { data: existingSubscriptions, error: existingSubsError } = await supabase
      .from('subscriptions')
      .select('dog_id, dogs:dog_id(name)')
      .in('dog_id', dogIds)
      .eq('is_active', true)

    if (existingSubsError) {
      console.error('Error checking existing subscriptions:', existingSubsError)
      return NextResponse.json(
        { error: 'Failed to verify subscription eligibility' },
        { status: 500 }
      )
    }

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      const dogNames = existingSubscriptions
        .map((sub: any) => sub.dogs?.name || 'Unknown')
        .join(', ')
      return NextResponse.json(
        { error: `The following dog(s) already have an active subscription: ${dogNames}. Please cancel the existing subscription first.` },
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
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Date only
    }))

    const { data: createdSubscriptions, error: subError } = await supabase
      .from('subscriptions')
      .insert(subscriptions)
      .select()

    if (subError) {
      throw subError
    }

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
    console.error('Error creating free subscription:', error.message)
    return NextResponse.json(
      {
        error: error.message || 'Failed to create subscription',
        details: error.details || error.hint || null,
        code: error.code || null
      },
      { status: 500 }
    )
  }
}
