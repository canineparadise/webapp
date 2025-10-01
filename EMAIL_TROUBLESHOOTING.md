# Email Not Receiving - Troubleshooting Guide

## 🔍 Quick Checks

### 1. Check Supabase Auth Logs
1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Logs**
3. Look for recent signup attempts
4. Check if emails show as "sent"

### 2. Check Email Configuration
1. Go to **Authentication** → **Providers** → **Email**
2. Verify these settings:
   - ✅ **Enable Email Signup** is ON
   - ✅ **Confirm email** is enabled
   - ✅ **Email confirmation expiry** is set (3600 seconds)

### 3. Rate Limiting Issue (Most Common)
**Free tier limits: 4 emails per hour**

If you've been testing, you may have hit the rate limit.

**Solution:** Wait 1 hour or use one of the workarounds below.

---

## 🚀 Immediate Solutions

### Option 1: Disable Email Confirmation (For Testing)
```sql
-- Run this in SQL Editor to bypass email confirmation temporarily
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';

-- Also update the profile
UPDATE public.profiles
SET email_verified = true
WHERE email = 'your-email@example.com';
```

### Option 2: Get the Confirmation Link Manually
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your user
3. Click on the user
4. Look for "Last sign in" or check the logs
5. Sometimes the confirmation token is visible in the metadata

### Option 3: Use Supabase's Inbucket (Local Testing)
If running Supabase locally, emails go to Inbucket:
- URL: `http://localhost:54324`
- All test emails appear here instantly

---

## 🔧 Permanent Solutions

### Solution 1: Set Up Custom SMTP (Recommended for Production)

#### Using Gmail (Quick Setup)
1. Create a Gmail App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password

2. In Supabase Dashboard:
   - Go to **Project Settings** → **Auth**
   - Find **SMTP Settings**
   - Enter:
     ```
     Host: smtp.gmail.com
     Port: 587
     Username: your-email@gmail.com
     Password: [your-app-password]
     Sender email: your-email@gmail.com
     Sender name: Canine Paradise
     ```

#### Using SendGrid (Professional)
1. Sign up for SendGrid (free tier available)
2. Create an API key
3. Configure in Supabase:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [your-api-key]
   Sender email: noreply@yourdomain.com
   ```

#### Using Resend (Modern Alternative)
1. Sign up at resend.com
2. Get API key
3. Configure similar to SendGrid

### Solution 2: Temporary Testing Workaround

Create a temporary bypass for testing:

```typescript
// In app/signup/page.tsx, after successful signup:
if (process.env.NODE_ENV === 'development') {
  // Auto-confirm in development
  const { error } = await supabase.auth.updateUser({
    email_confirmed_at: new Date().toISOString()
  })
}
```

---

## 📝 Check These Settings in Supabase

1. **Email Templates Configuration**
   - Go to **Authentication** → **Email Templates**
   - Make sure templates are saved
   - Check that URLs use `{{ .ConfirmationURL }}` variable

2. **Redirect URLs**
   - Go to **Authentication** → **URL Configuration**
   - Add your site URL to **Redirect URLs**:
     - `http://localhost:3000/*`
     - `http://localhost:3001/*`
     - Your production URL

3. **Check Auth Settings**
   - Go to **Settings** → **Auth**
   - Verify **Site URL** is correct
   - Check **JWT expiry** settings

---

## 🎯 Quick Fix for Right Now

Run this SQL to manually confirm your account and log in:

```sql
-- Replace with your actual email
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'your-test-email@example.com';

-- Also update profile
UPDATE public.profiles
SET
  email_verified = true,
  is_active = true
WHERE email = 'your-test-email@example.com';
```

Then try logging in normally at `/login`

---

## 📊 Test Email Delivery

After setting up SMTP, test with:

```sql
-- In Supabase SQL Editor
SELECT auth.email()
FROM auth.users
WHERE email = 'test@example.com';
```

---

## ⚠️ Common Issues

1. **Spam Filters**: Check ALL spam/junk folders
2. **Email Provider Blocking**: Some providers block Supabase default emails
3. **Rate Limiting**: Free tier = 4 emails/hour
4. **Wrong Email**: Double-check the email address typed
5. **URL Configuration**: Redirect URLs must be whitelisted

---

## Need More Help?

1. Check Supabase Auth Logs for errors
2. Look at browser console for JavaScript errors
3. Verify `.env.local` has correct Supabase URL and anon key
4. Try incognito/private browsing mode

The fastest solution for testing is to manually confirm your email in the database using the SQL above!