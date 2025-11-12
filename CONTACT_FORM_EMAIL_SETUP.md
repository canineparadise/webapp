# Contact Form Email Setup Guide

This guide shows you how to implement real email sending for the contact form.

---

## Option 1: Using Resend (Recommended - Easiest)

**Resend** is a modern email API with a generous free tier (3,000 emails/month).

### Step 1: Sign up for Resend

1. Go to https://resend.com/
2. Sign up for a free account
3. Verify your email address
4. Get your API key from the dashboard

### Step 2: Install Resend

```bash
npm install resend
```

### Step 3: Add API Key to Environment

Add to `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
```

### Step 4: Create API Route

Create file: `/app/api/send-contact-email/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, dogName, message, preferredContact } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email to Aldenham Doggy Day Care
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <noreply@yourdomain.com>', // Change to your verified domain
      to: ['wecare@canineparadise.com'],
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Dog Name:</strong> ${dogName || 'Not provided'}</p>
        <p><strong>Preferred Contact:</strong> ${preferredContact}</p>
        <hr>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Sent from Aldenham Doggy Day Care website contact form
        </p>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    // Send confirmation email to user
    await resend.emails.send({
      from: 'Aldenham Doggy Day Care <noreply@yourdomain.com>',
      to: [email],
      subject: 'We received your message!',
      html: `
        <h2>Thank you for contacting Aldenham Doggy Day Care!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <h3>Your message:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
          ${message.replace(/\n/g, '<br>')}
        </p>
        <p>Best regards,<br>The Aldenham Doggy Day Care Team</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Aldenham Doggy Day Care<br>
          Elstree Road, Elstree, WD6 3FS<br>
          07963 656556
        </p>
      `,
    })

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Error sending contact email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Step 5: Update Contact Page

Update [app/contact/page.tsx](app/contact/page.tsx) line 25-42:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const response = await fetch('/api/send-contact-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message')
    }

    toast.success('Message sent! We\'ll get back to you within 24 hours.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      dogName: '',
      message: '',
      preferredContact: 'email',
    })
  } catch (error: any) {
    console.error('Error sending contact form:', error)
    toast.error(error.message || 'Failed to send message. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

### Step 6: Verify Domain with Resend

For production, you need to verify your domain:

1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `canineparadise.com`)
3. Add the DNS records they provide
4. Wait for verification (usually 5-10 minutes)
5. Update the `from` field in the API route to use your domain

For development, you can use `onboarding@resend.dev` as the from address.

---

## Option 2: Using Supabase Edge Functions

If you want to keep everything in Supabase:

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Create Edge Function

```bash
supabase functions new send-contact-email
```

### Step 3: Implement Function

Edit `supabase/functions/send-contact-email/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { name, email, phone, dogName, message, preferredContact } = await req.json()

  // Use a service like SendGrid, Mailgun, or Postmark
  // This example uses SendGrid
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: 'wecare@canineparadise.com' }],
      }],
      from: { email: 'noreply@yourdomain.com' },
      subject: `New Contact Form Submission from ${name}`,
      content: [{
        type: 'text/html',
        value: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Dog Name:</strong> ${dogName}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      }],
    }),
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## Option 3: Using Nodemailer with SMTP

If you have an existing email provider with SMTP:

### Step 1: Install Nodemailer

```bash
npm install nodemailer @types/nodemailer
```

### Step 2: Create API Route

```typescript
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, phone, dogName, message } = body

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  // Send email
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: 'wecare@canineparadise.com',
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Dog Name:</strong> ${dogName}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  })

  return NextResponse.json({ success: true })
}
```

Add to `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM="Aldenham Doggy Day Care <noreply@canineparadise.com>"
```

---

## Testing

### Test in Development:

1. Start the dev server:
   ```bash
   ./start-server.sh
   ```

2. Go to http://localhost:3000/contact

3. Fill out the form and submit

4. Check your email for:
   - Email to Aldenham Doggy Day Care (wecare@canineparadise.com)
   - Confirmation email to the user

### Test Edge Cases:

- [ ] Submit with missing required fields
- [ ] Submit with invalid email format
- [ ] Submit with very long message
- [ ] Check spam folder for test emails
- [ ] Verify reply-to works correctly

---

## Recommended: Resend

**Why Resend is recommended:**
- ✅ Very easy to set up
- ✅ Generous free tier (3,000 emails/month)
- ✅ Modern API and great docs
- ✅ Built-in analytics
- ✅ No credit card required for free tier
- ✅ Works with any domain
- ✅ Excellent deliverability

**Next steps:**
1. Sign up for Resend
2. Get API key
3. Add to `.env.local`
4. Install package: `npm install resend`
5. Create the API route
6. Update contact form
7. Test it!

---

## Production Checklist

Before going live:
- [ ] Verify domain with email provider
- [ ] Update `from` email to your domain
- [ ] Test with real email addresses
- [ ] Check spam scoring
- [ ] Set up email forwarding for `wecare@canineparadise.com`
- [ ] Add rate limiting to prevent spam
- [ ] Add honeypot field for bot protection
- [ ] Monitor email delivery rates
- [ ] Set up alerts for failed sends

---

## Security Notes

- ✅ Never expose API keys in frontend code
- ✅ Validate all input on the server
- ✅ Sanitize HTML in emails
- ✅ Add rate limiting (max 5 emails per IP per hour)
- ✅ Use CAPTCHA for production if spam becomes an issue
- ⚠️ Never send emails directly from frontend
- ⚠️ Always use environment variables for secrets
