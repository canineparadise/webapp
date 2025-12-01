# Email Domain Troubleshooting Guide

## Issue: Emails Not Using Custom Domain

You configured custom SMTP in Supabase and it was working on Friday, but now emails are coming from Supabase's default domain instead of your custom domain.

## Checklist to Fix:

### 1. Verify Supabase SMTP Settings

Go to your Supabase dashboard:
1. Navigate to: **Settings** → **Auth** → **SMTP Settings**
2. Check if **Custom SMTP** is still **enabled**
3. Verify all credentials are still entered:
   - SMTP Host
   - SMTP Port
   - SMTP Username
   - SMTP Password
   - Sender Email (should be your domain: `noreply@aldenhamdoggydaycare.com`)
   - Sender Name

**Common Issue:** Sometimes Supabase reverts to default SMTP if there's an authentication failure with your custom SMTP provider.

### 2. Check SMTP Provider Status

If you're using SendGrid, Mailgun, or another provider:
1. Log into your email provider dashboard
2. Check if your API key or SMTP credentials are still valid
3. Check if your account is in good standing (not suspended)
4. Verify your sending limits haven't been exceeded

### 3. Test SMTP Credentials

Test if your SMTP credentials still work:

```bash
# For SendGrid or similar
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{"to": [{"email": "YOUR_EMAIL"}]}],
    "from": {"email": "noreply@aldenhamdoggydaycare.com"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "This is a test"}]
  }'
```

### 4. Check Domain Verification

Email providers require domain verification:

1. Log into your email provider (SendGrid/Mailgun/etc.)
2. Go to **Sender Authentication** or **Domain Verification**
3. Check if your domain (`aldenhamdoggydaycare.com`) is still verified
4. If not verified, you'll need to add DNS records again:
   - **SPF Record** - Proves you authorize the email provider
   - **DKIM Record** - Cryptographic signature for authenticity
   - **DMARC Record** - Email authentication policy

### 5. Re-enter SMTP Credentials in Supabase

Sometimes the fix is as simple as re-entering the credentials:

1. Go to Supabase: **Settings** → **Auth** → **SMTP Settings**
2. Click **Edit** on Custom SMTP
3. Re-enter all credentials (even if they look correct)
4. Click **Save**
5. Send a test email (use password reset feature)

### 6. Check Supabase Project Settings

Verify your project hasn't switched environments:
1. Make sure you're in the correct Supabase project
2. Some projects have separate staging/production instances
3. Verify the project URL matches your production database

### 7. Force SMTP Refresh

If Supabase is caching old settings:
1. Disable Custom SMTP
2. Save
3. Wait 1 minute
4. Re-enable Custom SMTP with credentials
5. Save

## Common Causes:

### Expired API Keys
- SendGrid API keys can be rotated or expire
- Check if you need to generate a new API key

### Domain Verification Lapsed
- Some providers require periodic re-verification
- DNS records may have been accidentally deleted

### Rate Limits Hit
- Free tier limits exceeded
- Account suspended due to bounces or spam complaints

### Wrong Environment
- Accidentally using test mode credentials in production
- Supabase project switched to a different environment

## How to Verify It's Working:

1. Trigger a password reset email
2. Check the email you receive
3. Look at the "From" address - should be `noreply@aldenhamdoggydaycare.com`
4. Check email headers to see sending service

## If Still Not Working:

### Option 1: Check Supabase Logs
1. Supabase Dashboard → **Logs**
2. Filter by Auth logs
3. Look for SMTP errors

### Option 2: Contact Support
- If using paid email provider, contact their support
- They can verify if emails are being sent from their service
- Check your SMTP provider's dashboard for sending activity

### Option 3: Try Different SMTP Provider
If current provider isn't working, consider switching:
- **SendGrid**: Free tier, 100 emails/day
- **Mailgun**: Free tier, generous limits
- **AWS SES**: Very cheap, but requires more setup
- **Resend**: Modern, simple, great for Next.js apps

## Quick Test Script

You can test your SMTP credentials directly:

```javascript
// test-smtp.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net', // Your SMTP host
  port: 587,
  auth: {
    user: 'apikey', // Usually 'apikey' for SendGrid
    pass: 'YOUR_API_KEY' // Your API key
  }
});

transporter.sendMail({
  from: 'noreply@aldenhamdoggydaycare.com',
  to: 'YOUR_EMAIL',
  subject: 'SMTP Test',
  text: 'If you receive this, SMTP is working!'
}, (err, info) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Success!', info);
  }
});
```

Run with: `node test-smtp.js`

## Need Help?

If you're still stuck:
1. Check what email provider you're using
2. Verify the SMTP credentials are correct
3. Make sure domain verification is complete
4. Try re-entering credentials in Supabase
5. Check for any error messages in Supabase logs
