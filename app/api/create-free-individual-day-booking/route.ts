import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendIndividualDayConfirmation } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    const {
      userId,
      dogId,
      dates,
      pricePerDay,
      discountCode,
      discountCodeId,
      totalAmount,
      discountAmount,
      needsBreakfast,
      needsLunch,
      needsDinner,
      specialInstructions,
    } = await request.json()

    // Security: Ensure user can only create bookings for themselves
    if (userId !== authUser.id) {
      // Check if admin is creating for someone else
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot create bookings for other users' }, { status: 403 })
      }
    }

    if (!userId || !dogId || !dates || !dates.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify that a valid 100% discount code is being used (free bookings require full discount)
    if (!discountCodeId) {
      return NextResponse.json({ error: 'Discount code required for free bookings' }, { status: 400 })
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

    console.log('Creating free booking for user:', userId, 'by:', authUser.id)

    // Get dog details for validation
    const { data: dog } = await supabase
      .from('dogs')
      .select('name, size')
      .eq('id', dogId)
      .maybeSingle()

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 })
    }

    // Check capacity for all dates
    for (const date of dates) {
      const { data: capacityData, error: capacityError } = await supabase
        .rpc('check_daily_capacity', {
          p_date: date,
          p_dog_size: dog.size
        })

      if (capacityError) {
        console.error('Capacity check error:', capacityError)
        return NextResponse.json(
          { error: 'Failed to check capacity' },
          { status: 500 }
        )
      }

      if (!capacityData.is_available) {
        return NextResponse.json(
          { error: `No availability for ${date}` },
          { status: 400 }
        )
      }
    }

    // Create individual day bookings
    const bookings = dates.map((date: string) => ({
      user_id: userId,
      dog_id: dogId,
      booking_date: date,
      price: 0, // Free due to 100% discount
      payment_status: 'paid', // Mark as paid since discount covered full cost
      status: 'confirmed',
      created_at: new Date().toISOString(),
      needs_breakfast: needsBreakfast || false,
      needs_lunch: needsLunch || false,
      needs_dinner: needsDinner || false,
      special_instructions: specialInstructions || null,
    }))

    const { data: createdBookings, error: bookingError } = await supabase
      .from('individual_day_bookings')
      .insert(bookings)
      .select()

    if (bookingError) {
      console.error('Error creating bookings:', bookingError)
      throw bookingError
    }

    // Record discount code usage if applicable
    if (discountCodeId) {
      await supabase.from('discount_code_usage').insert({
        discount_code_id: discountCodeId,
        user_id: userId,
        used_for: 'individual_days',
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

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single()

    // Send confirmation email
    if (profile && profile.email) {
      try {
        await sendIndividualDayConfirmation({
          userEmail: profile.email,
          userName: profile.first_name || 'Valued Customer',
          dogName: dog.name,
          bookingDates: dates,
          totalAmount: 0, // Free booking
        })
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Don't fail the booking if email fails
      }
    }

    return NextResponse.json({
      success: true,
      bookings: createdBookings,
    })
  } catch (error: any) {
    console.error('Error creating free individual day booking:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
}
