import { NextRequest, NextResponse } from 'next/server'
import { sendDogApprovalEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { ownerEmail, ownerName, dogName } = await request.json()

    if (!ownerEmail || !ownerName || !dogName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email using nodemailer
    const result = await sendDogApprovalEmail({
      userEmail: ownerEmail,
      userName: ownerName,
      dogName,
    })

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      throw new Error('Failed to send email')
    }
  } catch (error: any) {
    console.error('Error sending approval email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send approval email' },
      { status: 500 }
    )
  }
}
