import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Initialize Supabase client with service role key to bypass RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Extract the token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '')

    // Verify the user session
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid session' }, { status: 401 })
    }

    // Verify user is staff or admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    const { bookingId, bookingType, staffId } = await req.json()

    // Validate input
    if (!bookingId || !bookingType || !staffId) {
      return NextResponse.json({ error: 'Missing required fields: bookingId, bookingType, staffId' }, { status: 400 })
    }

    // Determine which table to update
    const tableName = bookingType === 'individual' ? 'individual_day_bookings' : 'bookings'

    // Perform the check-out update using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .update({
        checked_out: true,
        checked_out_at: new Date().toISOString(),
        checked_out_by: staffId,
        status: 'completed'
      })
      .eq('id', bookingId)
      .select()

    if (error) {
      console.error('Check-out error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No booking found with that ID' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Check-out successful',
      booking: data[0]
    })

  } catch (error: any) {
    console.error('Check-out error:', error)
    return NextResponse.json({ error: error.message || 'Failed to check out' }, { status: 500 })
  }
}
