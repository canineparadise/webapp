# URGENT: Supabase Email Configuration Fix

## Problem
Password reset emails are not being sent because Supabase needs to be configured with custom SMTP settings.

## IMMEDIATE FIX REQUIRED

### Step 1: Configure Supabase SMTP Settings

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**: Aldenham Doggy Day Care
3. **Navigate to**: Project Settings (gear icon) → Authentication → SMTP Settings

### Step 2: Enter Hostinger SMTP Credentials

Use these exact settings:

```
Enable Custom SMTP: ✅ ON

SMTP Host: smtp.hostinger.com
SMTP Port: 465
SMTP User: admin@aldenhamdoggydaycare.com
SMTP Password: C@n1n3P@r@d
Sender Email: admin@aldenhamdoggydaycare.com
Sender Name: Aldenham Doggy Day Care
```

**IMPORTANT**: Port must be **465** (SSL) not 587!

### Step 3: Configure Email Templates

1. Go to: Authentication → Email Templates
2. Update **ALL** email templates to use the correct email address

#### Welcome Email Template
- Subject: `Welcome to Aldenham Doggy Day Care! 🐕 Please Confirm Your Email`
- In the footer, change email from `wecare@canineparadise.com` to `admin@aldenhamdoggydaycare.com`

#### Password Reset Email Template
- Subject: `Reset Your Aldenham Doggy Day Care Password 🔐`
- Make sure the template is enabled
- Update footer email to `admin@aldenhamdoggydaycare.com`

### Step 4: Verify Redirect URL

1. Go to: Authentication → URL Configuration
2. Add these to **Redirect URLs**:
   ```
   http://localhost:3000/reset-password
   https://aldenhamdoggydaycare.com/reset-password
   https://www.aldenhamdoggydaycare.com/reset-password
   https://*.vercel.app/reset-password
   ```

### Step 5: Test the Fix

1. Go to your login page
2. Click "Forgot Password"
3. Enter your email address
4. Click send
5. **Check your email inbox** (including spam folder)
6. Click the reset link in the email
7. It should redirect to `/reset-password` page

## Why This Is Happening

Supabase by default uses their own email service which:
- Often goes to spam
- Has rate limits
- May not work reliably
- Needs custom SMTP for production

## Code Changes Already Made

✅ Fixed redirect URL in login page from `/auth/reset-password` to `/reset-password`
✅ Reset password page exists at `/app/reset-password/page.tsx`
✅ Password reset functionality is implemented correctly

## What's Still Needed

❌ Configure SMTP in Supabase Dashboard (MANUAL STEP - YOU MUST DO THIS)
❌ Update email templates in Supabase Dashboard (MANUAL STEP - YOU MUST DO THIS)
❌ Add redirect URLs in Supabase Dashboard (MANUAL STEP - YOU MUST DO THIS)

## After Configuration

Once you've completed the Supabase dashboard configuration:

1. Test password reset flow
2. Verify emails arrive within 1-2 minutes
3. Check emails don't go to spam
4. Test the reset link works correctly
5. Test creating a new account (confirmation email)

## Troubleshooting

### Email not arriving?
- Check spam folder
- Verify SMTP settings are exactly as shown above
- Check Supabase logs: Authentication → Logs
- Try a different email address

### "Invalid or expired reset link" error?
- Make sure redirect URLs are configured
- Check the URL in browser matches `/reset-password`
- Link expires after 1 hour

### Still not working?
- Check Supabase project logs for errors
- Verify SMTP credentials are correct
- Test SMTP settings with "Send Test Email" button in Supabase
- Contact Supabase support if SMTP test fails

## Priority: CRITICAL

This must be fixed immediately as users cannot reset passwords or confirm email addresses without working email functionality.
