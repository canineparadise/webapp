# Disable Supabase Email Confirmation

## CRITICAL: Do this IMMEDIATELY after deploying

To use your custom Hostinger emails instead of Supabase verification emails, you MUST disable email confirmation in Supabase.

### Step 1: Go to Supabase Dashboard

1. Go to: https://app.supabase.com
2. Select your project (Aldenham Doggy Day Care)
3. Click the gear icon (⚙️) - Project Settings
4. Click "Authentication"

### Step 2: Disable Email Confirmation

1. Scroll to "Email Auth"
2. Find **"Confirm email"** toggle
3. **TURN IT OFF** (disable it)
4. Click **Save**

### Step 3: Configure Site URL

1. Still in Authentication settings
2. Scroll to "Site URL"
3. Set it to: `https://canineparadise-p88d.vercel.app`
4. Click **Save**

### Step 4: Update Redirect URLs

1. Still in Authentication settings
2. Scroll to "Redirect URLs"
3. Add these URLs:
   ```
   https://canineparadise-p88d.vercel.app/auth/callback
   https://canineparadise-p88d.vercel.app/dashboard
   http://localhost:3000/auth/callback
   http://localhost:3000/dashboard
   ```
4. Click **Save**

## What This Does

- ✅ Users can sign up and login IMMEDIATELY (no email verification needed)
- ✅ Custom welcome emails will be sent from your Hostinger account
- ✅ No more "email rate limit exceeded" errors
- ✅ No more Supabase verification emails
- ✅ Users get logged in automatically after signup

## Next: Configure Vercel Environment Variables

Make sure you've added these to Vercel:

```
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=admin@aldenhamdoggydaycare.com
EMAIL_PASSWORD=C@n1n3P@r@d
EMAIL_FROM=admin@aldenhamdoggydaycare.com
EMAIL_FROM_NAME=Aldenham Doggy Day Care
```

Go to: https://vercel.com/your-project/settings/environment-variables

Then redeploy after adding them.

## Testing

After making these changes:

1. Try creating a new account
2. You should be logged in immediately (no email confirmation needed)
3. Check your email for the custom welcome email from admin@aldenhamdoggydaycare.com
4. Test adding a dog - you should receive a dog registration email
5. Test password reset (it will use Supabase's password reset which doesn't need confirmation)

## Priority: CRITICAL

This MUST be done for the app to work properly. Without disabling email confirmation:
- Users will be stuck waiting for verification emails that never arrive (rate limited)
- Signups will fail
- Custom emails won't be sent

**Do this NOW before testing signups!**
