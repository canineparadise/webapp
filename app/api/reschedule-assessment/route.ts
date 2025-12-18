import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAssessmentRescheduleEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authenticated admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify admin role
    const { data: authProfile } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', authUser.id)
      .single()

    if (!authProfile || authProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const adminName = `${authProfile.first_name} ${authProfile.last_name}`

    const {
      dogId,
      oldSlotId,
      newSlotId,
      userId,
    } = await request.json()

    if (!dogId || !oldSlotId || !newSlotId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
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

    // Get new slot details
    const { data: newSlot, error: newSlotError } = await supabase
      .from('assessment_slots')
      .select('*')
      .eq('id', newSlotId)
      .single()

    if (newSlotError || !newSlot) {
      return NextResponse.json({ error: 'New slot not found' }, { status: 404 })
    }

    // Get dog details
    const { data: dog, error: dogError } = await supabase
      .from('dogs')
      .select('id, name, owner_id')
      .eq('id', dogId)
      .single()

    if (dogError || !dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 })
    }

    // Get user/owner profile
    const { data: owner, error: ownerError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single()

    if (ownerError || !owner) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all dogs in this assessment booking (there might be multiple)
    const { data: allBookings } = await supabase
      .from('assessment_bookings')
      .select('dog_id')
      .eq('slot_id', oldSlotId)
      .eq('user_id', userId)
      .eq('booking_status', 'confirmed')

    const allDogIds = allBookings?.map(b => b.dog_id) || [dogId]

    // Get all dog names
    const { data: allDogs } = await supabase
      .from('dogs')
      .select('id, name')
      .in('id', allDogIds)

    const dogNames = allDogs?.map(d => d.name) || [dog.name]

    // Begin transaction-like operations

    // 1. Update assessment_bookings: change slot_id from old to new for all dogs in this booking
    const { error: bookingUpdateError } = await supabase
      .from('assessment_bookings')
      .update({ slot_id: newSlotId })
      .eq('slot_id', oldSlotId)
      .eq('user_id', userId)
      .eq('booking_status', 'confirmed')

    if (bookingUpdateError) {
      console.error('Error updating assessment bookings:', bookingUpdateError)
      return NextResponse.json({ error: 'Failed to update assessment bookings' }, { status: 500 })
    }

    // 2. Update old slot: make it available again
    const { error: oldSlotUpdateError } = await supabase
      .from('assessment_slots')
      .update({
        is_available: true,
        booked_by_user_id: null,
      })
      .eq('id', oldSlotId)

    if (oldSlotUpdateError) {
      console.error('Error updating old slot:', oldSlotUpdateError)
      // Note: Not rolling back here, but this could leave data in inconsistent state
    }

    // 3. Update new slot: mark as booked
    const { error: newSlotUpdateError } = await supabase
      .from('assessment_slots')
      .update({
        is_available: false,
        booked_by_user_id: userId,
      })
      .eq('id', newSlotId)

    if (newSlotUpdateError) {
      console.error('Error updating new slot:', newSlotUpdateError)
    }

    // 4. Update dogs: update assessment_date and assessment_slot_id
    for (const dId of allDogIds) {
      const { error: dogUpdateError } = await supabase
        .from('dogs')
        .update({
          assessment_date: newSlot.assessment_date,
          assessment_slot_id: newSlotId,
        })
        .eq('id', dId)

      if (dogUpdateError) {
        console.error('Error updating dog:', dId, dogUpdateError)
      }
    }

    // 5. Log the change in staff_activity_log
    const { error: logError } = await supabase
      .from('staff_activity_log')
      .insert({
        staff_id: authUser.id,
        action_type: 'assessment_rescheduled',
        dog_id: dogId,
        dog_name: dog.name,
        user_id: userId,
        user_name: `${owner.first_name} ${owner.last_name}`,
        notes: `Assessment rescheduled from ${oldSlot.assessment_date} (${oldSlot.start_time}) to ${newSlot.assessment_date} (${newSlot.start_time}). Dogs: ${dogNames.join(', ')}`,
        timestamp: new Date().toISOString(),
        staff_name: adminName,
      })

    if (logError) {
      console.error('Error logging activity:', logError)
      // Don't fail the request for logging errors
    }

    // 6. Send email notification to the client
    try {
      await sendAssessmentRescheduleEmail({
        userEmail: owner.email,
        userName: `${owner.first_name} ${owner.last_name}`,
        dogNames,
        oldDate: oldSlot.assessment_date,
        oldStartTime: oldSlot.start_time,
        oldEndTime: oldSlot.end_time,
        newDate: newSlot.assessment_date,
        newStartTime: newSlot.start_time,
        newEndTime: newSlot.end_time,
        rescheduledBy: adminName,
      })
    } catch (emailError) {
      console.error('Error sending reschedule email:', emailError)
      // Don't fail the request for email errors
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment rescheduled successfully',
      newDate: newSlot.assessment_date,
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
