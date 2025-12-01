# Fix Password Reset Email Redirect

## Problem
When users click the password reset link in their email, they're taken to:
```
https://www.aldenhamdoggydaycare.com/login#
```

Instead of being taken to the password reset page.

## Root Cause
Supabase's default email template is using the wrong redirect URL. It's sending users to `/login#` instead of `/auth/callback?type=recovery`.

## Solution: Update Supabase Email Template

### Step 1: Access Email Templates

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Email Templates**
4. Look for **"Reset Password"** or **"Magic Link"** template

### Step 2: Check Current Template

The current template probably has something like:
```html
<a href="{{ .SiteURL }}/login#">Reset Password</a>
```

Or it might be using:
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

### Step 3: Use the Correct Variable

**IMPORTANT:** Supabase provides a special variable `{{ .ConfirmationURL }}` that already includes the correct callback URL with all necessary parameters.

**You should use:**
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

**NOT:**
```html
<a href="{{ .SiteURL }}/login#">Reset Password</a>
```

### Step 4: Update the Template

I've created a beautiful, branded email template for you at:
- `/supabase/email-template-reset-password.html`

**To use it:**
1. Open the file: `supabase/email-template-reset-password.html`
2. Copy the entire contents
3. Go to Supabase Dashboard → Authentication → Email Templates
4. Click on **"Reset Password"** template
5. Paste the new template
6. Click **Save**

### Step 5: Verify Redirect URLs in Supabase

1. In Supabase Dashboard, go to: **Authentication** → **URL Configuration**
2. Make sure these URLs are configured:

**Site URL:**
```
https://www.aldenhamdoggydaycare.com
```

**Redirect URLs (add all of these):**
```
https://www.aldenhamdoggydaycare.com/auth/callback
https://www.aldenhamdoggydaycare.com/auth/callback?type=recovery
https://aldenhamdoggydaycare.com/auth/callback
https://aldenhamdoggydaycare.com/auth/callback?type=recovery
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?type=recovery
```

### Step 6: Test the Flow

1. Go to your login page
2. Enter your email
3. Click "Forgot Password"
4. Check your email
5. Click the "Reset Password" button
6. You should be taken to: `https://www.aldenhamdoggydaycare.com/reset-password`

## Common Issues & Solutions

### Issue 1: Still Going to /login#

**Cause:** Email template is still using old URL

**Fix:**
- Make sure you saved the email template
- Try clearing your browser cache
- Request a new password reset email (old emails use old template)

### Issue 2: "Invalid Reset Link" Error

**Cause:** Redirect URL not whitelisted in Supabase

**Fix:**
- Add all callback URLs to Supabase redirect whitelist (see Step 5)
- Make sure URL configuration includes the `type=recovery` parameter

### Issue 3: Email Not Using Custom Domain

**Cause:** Custom SMTP not configured or disabled

**Fix:**
- Go to: Authentication → SMTP Settings
- Enable Custom SMTP
- Re-enter your SMTP credentials
- See: `TROUBLESHOOTING-EMAILS.md` for detailed instructions

## How the Flow Works

1. **User requests password reset** → Login page calls `supabase.auth.resetPasswordForEmail()`
2. **Supabase sends email** → Uses template with `{{ .ConfirmationURL }}`
3. **User clicks link** → Goes to `/auth/callback?code=...&type=recovery`
4. **Auth callback detects recovery type** → Redirects to `/reset-password`
5. **User enters new password** → Session is already established, can update password

## Debugging Tips

### Check What URL is in the Email

1. Request a password reset
2. Open the email
3. Right-click the "Reset Password" button
4. Select "Copy Link Address"
5. Paste it somewhere to see the full URL

**It should look like:**
```
https://www.aldenhamdoggydaycare.com/auth/callback?token_hash=...&type=recovery&code=...
```

**NOT like:**
```
https://www.aldenhamdoggydaycare.com/login#access_token=...
```

### Check Supabase Variables

In your email template, Supabase provides these variables:
- `{{ .SiteURL }}` - Your site URL (e.g., https://www.aldenhamdoggydaycare.com)
- `{{ .ConfirmationURL }}` - Full callback URL with code (USE THIS!)
- `{{ .Token }}` - Just the token (don't use alone)
- `{{ .TokenHash }}` - Hashed token (don't use alone)
- `{{ .Email }}` - User's email

**Always use `{{ .ConfirmationURL }}`** for password reset links!

## Quick Checklist

- [ ] Email template uses `{{ .ConfirmationURL }}`
- [ ] Site URL is set correctly in Supabase
- [ ] All callback URLs are whitelisted
- [ ] Custom SMTP is enabled (for branded emails)
- [ ] Auth callback detects `type=recovery` parameter
- [ ] Reset password page validates session
- [ ] Tested full flow from email click to password update

## Need More Help?

If you're still having issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check browser console for errors when clicking the email link
3. Verify the URL in the email matches the expected format
4. Make sure you're testing with a fresh password reset email (not an old one)
