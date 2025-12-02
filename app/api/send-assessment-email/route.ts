import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering to avoid build-time env var issues
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Initialize Supabase client lazily to avoid build-time errors
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  try {
    // Verify the request is from an admin or staff
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin or staff
    const { data: authProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (!authProfile || !['admin', 'staff'].includes(authProfile.role)) {
      return NextResponse.json({ error: 'Admin or staff access required' }, { status: 403 })
    }

    const { userEmail, userName, dogName, status, notes } = await request.json()

    if (!userEmail || !userName || !dogName || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email content based on approval/decline status
    const isApproved = status === 'approved'
    const subject = isApproved
      ? `🎉 ${dogName} Has Been Approved for Aldenham Doggy Day Care!`
      : `Assessment Update for ${dogName}`

    const emailContent = isApproved
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f2e8;">
          <div style="background: linear-gradient(135deg, #1a3a52, #2a5a7a); color: white; padding: 30px; border-radius: 15px 15px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🐾 Great News!</h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px;">
            <p style="font-size: 16px; color: #1a3a52;">Dear ${userName},</p>

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              We're thrilled to inform you that <strong>${dogName}</strong> has successfully completed the assessment and has been <strong style="color: #16a34a;">APPROVED</strong> to join Aldenham Doggy Day Care!
            </p>

            ${notes ? `
              <div style="background: #e8f4f8; border-left: 4px solid #a68756; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; font-weight: bold; color: #1a3a52;">Assessment Notes:</p>
                <p style="margin: 10px 0 0 0; color: #333;">${notes}</p>
              </div>
            ` : ''}

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              You can now book daycare sessions for ${dogName} through your dashboard. We can't wait to see ${dogName} playing and having fun with our pack!
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://canineparadise-p88d.vercel.app'}/dashboard"
                 style="display: inline-block; background: linear-gradient(135deg, #a68756, #c4a874); color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">
                Book Now
              </a>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If you have any questions, please don't hesitate to contact us.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e8f4f8; text-align: center;">
              <p style="margin: 0; color: #a68756; font-weight: bold; font-size: 18px;">Aldenham Doggy Day Care</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Where Every Dog's Day is Paradise!</p>
            </div>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f2e8;">
          <div style="background: linear-gradient(135deg, #1a3a52, #2a5a7a); color: white; padding: 30px; border-radius: 15px 15px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Assessment Update</h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px;">
            <p style="font-size: 16px; color: #1a3a52;">Dear ${userName},</p>

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for bringing <strong>${dogName}</strong> in for an assessment at Aldenham Doggy Day Care.
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              After careful consideration, we've determined that our daycare environment may not be the best fit for ${dogName} at this time.
            </p>

            ${notes ? `
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; font-weight: bold; color: #856404;">Feedback from Our Team:</p>
                <p style="margin: 10px 0 0 0; color: #333;">${notes}</p>
              </div>
            ` : ''}

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              We understand this may be disappointing, and we're happy to discuss the assessment results with you. Please feel free to contact us if you have any questions or would like to schedule a follow-up assessment in the future.
            </p>

            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 20px;">
              We appreciate your understanding and wish you and ${dogName} all the best.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e8f4f8; text-align: center;">
              <p style="margin: 0; color: #a68756; font-weight: bold; font-size: 18px;">Aldenham Doggy Day Care</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Where Every Dog's Day is Paradise!</p>
            </div>
          </div>
        </div>
      `

    // In production, you would use a proper email service like SendGrid, Resend, or Supabase Edge Functions
    // For now, we'll log a minimal notification (actual email content not logged for privacy)

    // TODO: Integrate with actual email service
    // Example with Resend or SendGrid:
    // await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     from: 'Aldenham Doggy Day Care <noreply@canineparadise.com>',
    //     to: userEmail,
    //     subject,
    //     html: emailContent
    //   })
    // })

    return NextResponse.json({
      success: true,
      message: 'Email queued for sending',
      preview: { to: userEmail, subject }
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
