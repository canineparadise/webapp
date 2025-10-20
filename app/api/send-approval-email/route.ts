import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { ownerEmail, ownerName, dogName } = await request.json()

    if (!ownerEmail || !ownerName || !dogName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: Replace with actual email service (SendGrid, Resend, etc.)
    // For now, just log and return success
    console.log('📧 Approval Email:', {
      to: ownerEmail,
      subject: `${dogName} has been approved for Canine Paradise!`,
      body: `
        Hi ${ownerName},

        Great news! ${dogName} has successfully completed the assessment and has been approved to join Canine Paradise Daycare!

        You can now book daycare sessions for ${dogName} through your dashboard.

        We're excited to welcome ${dogName} to our pack!

        Best regards,
        The Canine Paradise Team
      `
    })

    // In production, you would send the email here:
    // await sendEmail({
    //   to: ownerEmail,
    //   subject: `${dogName} has been approved for Canine Paradise!`,
    //   html: emailTemplate
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending approval email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
