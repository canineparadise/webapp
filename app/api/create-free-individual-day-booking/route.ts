import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendIndividualDayConfirmation } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      dogId,
      dates,
      pricePerDay,
      discountCode,
      discountCodeId,
      totalAmount,
      discountAmount,
    } = await request.json()

    if (!userId || !dogId || !dates || !dates.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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
