# Supabase Email Configuration Guide

This guide covers how to configure email verification and password reset for Canine Paradise.

---

## Part 1: Enable Email Verification

Email verification ensures users confirm their email address before accessing the system.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your "Canine Paradise" project

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab
   - Find the "Email" provider

3. **Enable Email Confirmation**
   - Scroll down to "Email Confirmation"
   - Toggle **"Confirm email"** to **ON**
   - This requires users to click a link in their email before they can log in

4. **Configure Email Settings**
   - Scroll to "Email Templates" in the left sidebar under Authentication
   - You'll see templates for:
     - Confirmation email (signup)
     - Magic Link
     - Change Email Address
     - Reset Password

---

## Part 2: Configure Password Reset Emails

Password reset allows users to securely reset their forgotten passwords.

### Steps:

1. **Access Email Templates**
   - Still in Authentication → Email Templates
   - Click on **"Reset Password"** template

2. **Customize the Password Reset Email**

Here's a professional template for Canine Paradise:

```html
<h2>🐕 Reset Your Canine Paradise Password</h2>

<p>Hi there,</p>

<p>We received a request to reset your password for your Canine Paradise account.</p>

<p>Click the button below to choose a new password:</p>

<p>
  <a href="{{ .ConfirmationURL }}"
     style="display: inline-block; padding: 12px 24px; background-color: #a68756; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
    Reset Password
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p><strong>This link will expire in 1 hour.</strong></p>

<p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>

<hr>

<p style="color: #666; font-size: 12px;">
  Canine Paradise<br>
  Where every dog is treated like family<br>
  <a href="http://localhost:3000">Visit our website</a>
</p>
```

3. **Save the Template**
   - Click "Save" at the bottom

4. **Set the Redirect URL**
   - Go to Authentication → URL Configuration
   - Set **"Site URL"** to: `http://localhost:3000` (for development)
   - For production, change to your actual domain: `https://yourdomain.com`
   - Set **"Redirect URLs"** to include:
     - `http://localhost:3000/login`
     - `http://localhost:3000/reset-password` (we'll create this page)
     - Your production URLs when ready

---

## Part 3: Customize Confirmation Email

Make the signup confirmation email match your brand:

1. **Go to Email Templates → Confirmation**

2. **Use this template:**

```html
<h2>🐕 Welcome to Canine Paradise!</h2>

<p>Hi {{ .Email }},</p>

<p>Thank you for signing up for Canine Paradise! We're excited to have you join our pack.</p>

<p>Before you can log in, please confirm your email address by clicking the button below:</p>

<p>
  <a href="{{ .ConfirmationURL }}"
     style="display: inline-block; padding: 12px 24px; background-color: #a68756; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
    Confirm Email
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p><strong>This link will expire in 24 hours.</strong></p>

<p>Once confirmed, you'll need to wait for our team to approve your account. We typically approve new accounts within 24 hours.</p>

<p>If you didn't create this account, you can safely ignore this email.</p>

<hr>

<p style="color: #666; font-size: 12px;">
  Canine Paradise<br>
  Where every dog is treated like family<br>
  <a href="http://localhost:3000">Visit our website</a>
</p>
```

3. **Save the template**

---

## Part 4: Test Email Configuration

### Test Password Reset:

1. Start your dev server:
   ```bash
   ./start-server.sh
   ```

2. Go to http://localhost:3000/forgot-password

3. Enter your email address

4. Check your email for the reset link

5. Click the link and you should be redirected to a password reset page

### Test Email Verification:

1. Sign up with a new email at http://localhost:3000/signup

2. Check your email for the confirmation link

3. Click the confirmation link

4. You should be redirected back to the site and able to log in

---

## Part 5: Create Reset Password Page

We need to create a page to handle the password reset flow.

**File to create:** `/app/reset-password/page.tsx`

This page will:
1. Read the reset token from URL
2. Show a form to enter new password
3. Call Supabase to update the password
4. Redirect to login on success

---

## Part 6: SMTP Configuration (Optional but Recommended)

By default, Supabase uses their email service which has limits. For production, configure your own SMTP:

1. **Go to Authentication → Email Templates**
2. Scroll to **SMTP Settings**
3. Toggle **"Enable Custom SMTP"**
4. Enter your SMTP details:
   - **Host:** (e.g., smtp.sendgrid.net, smtp.gmail.com)
   - **Port:** 587 (or 465 for SSL)
   - **Username:** Your SMTP username
   - **Password:** Your SMTP password
   - **Sender email:** noreply@yourcompany.com
   - **Sender name:** Canine Paradise

### Recommended Email Services:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **Amazon SES** (very cheap, pay as you go)
- **Resend** (modern, developer-friendly)

---

## Part 7: Update .env.local

Make sure your environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Troubleshooting

### Emails not sending?
1. Check Supabase email quota (free tier has limits)
2. Check spam folder
3. Verify email templates are saved
4. Check Supabase logs: Dashboard → Logs

### Reset link not working?
1. Check Site URL is correct in Supabase settings
2. Verify redirect URLs include your reset password page
3. Check if token has expired (1 hour expiration)

### Email verification not required?
1. Make sure "Confirm email" is toggled ON in Authentication settings
2. Existing users who signed up before enabling this won't be affected
3. Test with a brand new email address

---

## Next Steps

After configuring emails:
1. Create the reset-password page
2. Test the full flow with a new account
3. Update email templates with production URLs before launch
4. Set up custom SMTP for production
5. Consider adding email notifications for:
   - Booking confirmations
   - Assessment reminders
   - Subscription renewals

---

## Security Notes

- ✅ Password reset links expire after 1 hour
- ✅ Email confirmation links expire after 24 hours
- ✅ Links can only be used once
- ✅ Supabase handles token generation securely
- ✅ Always use HTTPS in production
- ❌ Never expose SMTP credentials in code
- ❌ Don't disable email verification in production
