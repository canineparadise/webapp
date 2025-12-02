import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'

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

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Security: Users can only send welcome emails to themselves, admins can send to anyone
    if (userId !== authUser.id) {
      const { data: authProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (!authProfile || authProfile.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot send emails for other users' }, { status: 403 })
      }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile for welcome email')
    }

    if (!profile || !profile.email) {
      // If profile doesn't exist yet, get email from auth user
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId)

      if (!user || !user.email) {
        console.error('Could not find user email:', userError)
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Send email with just email address
      const result = await sendWelcomeEmail({
        userEmail: user.email,
        userName: user.email.split('@')[0], // Use email prefix as name
      })

      if (result.success) {
        return NextResponse.json({ success: true, messageId: result.messageId })
      } else {
        throw new Error('Failed to send email')
      }
    }

    // Send email with profile data
    const userName = profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.email.split('@')[0]

    const result = await sendWelcomeEmail({
      userEmail: profile.email,
      userName: userName,
    })

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      throw new Error('Failed to send email')
    }
  } catch (error: any) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}
