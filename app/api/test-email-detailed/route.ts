import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing email with detailed logging...')

    // Check environment variables
    const config = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
      hasPassword: !!process.env.EMAIL_PASSWORD,
    }

    console.log('Email config:', config)

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Missing email environment variables',
        config
      }, { status: 500 })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: true,
      logger: true,
    })

    console.log('Testing SMTP connection...')

    // Test connection
    await transporter.verify()
    console.log('SMTP connection successful!')

    // Send test email
    console.log('Sending test email...')
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from Vercel',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email sent at ${new Date().toLocaleString()}</p>
        <p>If you received this, your email configuration is working!</p>
        <pre>${JSON.stringify(config, null, 2)}</pre>
      `
    })

    console.log('Email sent successfully:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      config
    })

  } catch (error: any) {
    console.error('Detailed email test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
    }, { status: 500 })
  }
}
