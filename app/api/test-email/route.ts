import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailConnection, sendEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    // Check if email credentials are configured
    const emailConfigured = !!(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD &&
      process.env.EMAIL_FROM
    )

    if (!emailConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Email not configured',
        details: {
          EMAIL_HOST: !!process.env.EMAIL_HOST,
          EMAIL_PORT: !!process.env.EMAIL_PORT,
          EMAIL_USER: !!process.env.EMAIL_USER,
          EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
          EMAIL_FROM: !!process.env.EMAIL_FROM,
        }
      }, { status: 500 })
    }

    // Verify email connection
    const connectionOk = await verifyEmailConnection()

    if (!connectionOk) {
      return NextResponse.json({
        success: false,
        error: 'Email server connection failed',
        config: {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          user: process.env.EMAIL_USER,
          from: process.env.EMAIL_FROM,
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email configuration is valid and server is reachable',
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM,
      }
    })

  } catch (error: any) {
    console.error('Email test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Email test failed',
      stack: error.stack
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      )
    }

    const result = await sendEmail({
      to,
      subject: 'Test Email from Aldenham Doggy Day Care',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your Aldenham Doggy Day Care application.</p>
        <p>If you received this, your email configuration is working correctly!</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
        details: result.error
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test email',
      stack: error.stack
    }, { status: 500 })
  }
}
