import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '@/lib/email'

// Create admin Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('email', normalizedEmail)
      .single()

    // If no profile found, tell the user
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    // Check if user exists in Supabase Auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error('Error listing users:', authError)
      return NextResponse.json(
        { error: 'Failed to verify account' },
        { status: 500 }
      )
    }

    const authUser = authUsers.users.find(u => u.email?.toLowerCase() === normalizedEmail)

    if (!authUser) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    // Generate password reset link using Supabase Admin API
    // This generates a link but does NOT send an email when using admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?type=recovery`
      }
    })

    if (linkError) {
      console.error('Error generating reset link:', linkError)
      return NextResponse.json(
        { error: 'Failed to generate reset link' },
        { status: 500 }
      )
    }

    // The link data contains the full URL with the token
    const resetLink = linkData.properties?.action_link

    if (!resetLink) {
      console.error('No reset link generated')
      return NextResponse.json(
        { error: 'Failed to generate reset link' },
        { status: 500 }
      )
    }

    console.log('Generated reset link for:', normalizedEmail)

    // Send the password reset email using OUR custom SMTP
    const userName = profile.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`.trim()
      : 'Valued Customer'

    const emailResult = await sendPasswordResetEmail({
      userEmail: normalizedEmail,
      userName,
      resetLink,
    })

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      )
    }

    console.log(`Password reset email sent successfully to ${normalizedEmail}`)

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    })

  } catch (error) {
    console.error('Error in forgot-password:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
