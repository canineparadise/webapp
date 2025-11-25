import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAssessmentConfirmation } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, slotId, dogIds, amountPaid } = await request.json()

    if (!userId || !slotId || !dogIds || !Array.isArray(dogIds)) {
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

    // Get slot details
    const { data: slot } = await supabase
      .from('assessment_slots')
      .select('assessment_date, start_time, end_time')
      .eq('id', slotId)
      .single()

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      )
    }

    // Get dog names
    const { data: dogs } = await supabase
      .from('dogs')
      .select('name')
      .in('id', dogIds)

    if (!dogs || dogs.length === 0) {
      return NextResponse.json(
        { error: 'Dogs not found' },
        { status: 404 }
      )
    }

    // Send email
    const result = await sendAssessmentConfirmation({
      userEmail: profile.email,
      userName: `${profile.first_name} ${profile.last_name}`,
      dogNames: dogs.map(d => d.name),
      assessmentDate: slot.assessment_date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      amountPaid: amountPaid || 0,
    })

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      throw new Error('Failed to send email')
    }
  } catch (error: any) {
    console.error('Error sending assessment confirmation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send confirmation email' },
      { status: 500 }
    )
  }
}
