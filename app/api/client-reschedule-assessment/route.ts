import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAssessmentRescheduleEmail } from '@/lib/email'

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

    const {
      oldSlotId,
      newSlotId,
    } = await request.json()

    if (!oldSlotId || !newSlotId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the user's assessment booking for the old slot
    const { data: existingBookings, error: bookingError } = await supabase
      .from('assessment_bookings')
      .select('*, dogs(id, name)')
      .eq('slot_id', oldSlotId)
      .eq('user_id', authUser.id)
      .eq('booking_status', 'confirmed')

    if (bookingError || !existingBookings || existingBookings.length === 0) {
      return NextResponse.json({ error: 'Assessment booking not found' }, { status: 404 })
    }

    // Get old slot details
    const { data: oldSlot, error: oldSlotError } = await supabase
      .from('assessment_slots')
      .select('*')
      .eq('id', oldSlotId)
      .single()

    if (oldSlotError || !oldSlot) {
      return NextResponse.json({ error: 'Old slot not found' }, { status: 404 })
    }

    // Check if the assessment is in the future (can only reschedule future assessments)
    const assessmentDate = new Date(oldSlot.assessment_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (assessmentDate < today) {
      return NextResponse.json(
        { error: 'Cannot reschedule past assessments' },
        { status: 400 }
      )
    }

    // Get new slot details and verify it's available
    const { data: newSlot, error: newSlotError } = await supabase
      .from('assessment_slots')
      .select('*')
      .eq('id', newSlotId)
      .eq('is_available', true)
      .single()

    if (newSlotError || !newSlot) {
      return NextResponse.json({ error: 'New slot not available' }, { status: 400 })
    }

    // Get user profile for email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', authUser.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get all dog IDs from the bookings
    const allDogIds = existingBookings.map(b => b.dog_id)
    const dogNames = existingBookings.map(b => b.dogs?.name).filter(Boolean)

    // Begin transaction-like operations

    // 1. Update assessment_bookings: change slot_id from old to new
    const { error: bookingUpdateError } = await supabase
      .from('assessment_bookings')
      .update({ slot_id: newSlotId })
      .eq('slot_id', oldSlotId)
      .eq('user_id', authUser.id)
      .eq('booking_status', 'confirmed')

    if (bookingUpdateError) {
      console.error('Error updating assessment bookings:', bookingUpdateError)
      return NextResponse.json({ error: 'Failed to update assessment bookings' }, { status: 500 })
    }

    // 2. Update old slot: make it available again
    const { data: oldSlotUpdateData, error: oldSlotUpdateError } = await supabase
      .from('assessment_slots')
      .update({
        is_available: true,
        booked_by_user_id: null,
      })
      .eq('id', oldSlotId)
      .select()

    if (oldSlotUpdateError) {
      console.error('Error updating old slot:', oldSlotUpdateError)
      return NextResponse.json({ error: 'Failed to release old slot' }, { status: 500 })
    }
    console.log('Old slot updated successfully:', oldSlotUpdateData)

    // 3. Update new slot: mark as booked
    const { data: newSlotUpdateData, error: newSlotUpdateError } = await supabase
      .from('assessment_slots')
      .update({
        is_available: false,
        booked_by_user_id: authUser.id,
      })
      .eq('id', newSlotId)
      .select()

    if (newSlotUpdateError) {
      console.error('Error updating new slot:', newSlotUpdateError)
      return NextResponse.json({ error: 'Failed to book new slot' }, { status: 500 })
    }
    console.log('New slot updated successfully:', newSlotUpdateData)

    // 4. Update dogs: update assessment_date and assessment_slot_id
    for (const dogId of allDogIds) {
      const { error: dogUpdateError } = await supabase
        .from('dogs')
        .update({
          assessment_date: newSlot.assessment_date,
          assessment_slot_id: newSlotId,
        })
        .eq('id', dogId)

      if (dogUpdateError) {
        console.error('Error updating dog:', dogId, dogUpdateError)
      }
    }

    // 5. Send email notification to the client
    try {
      await sendAssessmentRescheduleEmail({
        userEmail: userProfile.email,
        userName: `${userProfile.first_name} ${userProfile.last_name}`,
        dogNames,
        oldDate: oldSlot.assessment_date,
        oldStartTime: oldSlot.start_time,
        oldEndTime: oldSlot.end_time,
        newDate: newSlot.assessment_date,
        newStartTime: newSlot.start_time,
        newEndTime: newSlot.end_time,
        rescheduledBy: 'You (Client Portal)',
      })
    } catch (emailError) {
      console.error('Error sending reschedule email:', emailError)
      // Don't fail the request for email errors
    }

    const formattedNewDate = new Date(newSlot.assessment_date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    return NextResponse.json({
      success: true,
      message: 'Assessment rescheduled successfully',
      newDate: formattedNewDate,
      newTime: `${newSlot.start_time.slice(0, 5)} - ${newSlot.end_time.slice(0, 5)}`,
    })
  } catch (error: any) {
    console.error('Error rescheduling assessment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reschedule assessment' },
      { status: 500 }
    )
  }
}
