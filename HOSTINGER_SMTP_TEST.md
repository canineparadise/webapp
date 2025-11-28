# Hostinger SMTP Configuration Test

## Try These Settings in Vercel

The current settings might not be working. Try changing these environment variables in Vercel:

### Option 1: Port 587 with STARTTLS (RECOMMENDED)
```
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=admin@aldenhamdoggydaycare.com
EMAIL_PASSWORD=C@n1n3P@r@d
EMAIL_FROM=admin@aldenhamdoggydaycare.com
EMAIL_FROM_NAME=Aldenham Doggy Day Care
```

### Option 2: Port 465 with SSL (Current)
```
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=admin@aldenhamdoggydaycare.com
EMAIL_PASSWORD=C@n1n3P@r@d
EMAIL_FROM=admin@aldenhamdoggydaycare.com
EMAIL_FROM_NAME=Aldenham Doggy Day Care
```

## Quick Test

1. Change `EMAIL_PORT` to `587` in Vercel
2. Change `EMAIL_SECURE` to `false` in Vercel
3. Redeploy
4. Try signup again

## Common Issues with Hostinger

1. **Wrong Port**: Hostinger often works better with 587 instead of 465
2. **Authentication**: Make sure the password is EXACTLY: `C@n1n3P@r@d`
3. **Account Active**: Check if the email account is active in Hostinger control panel
4. **2FA**: If you have 2-factor auth on the email, you might need an app-specific password

## Check Hostinger Control Panel

1. Login to Hostinger control panel
2. Go to Email → Email Accounts
3. Verify `admin@aldenhamdoggydaycare.com` exists and is active
4. Check if there's a "Enable SMTP" option and make sure it's ON
5. Look for any SMTP connection limits or blocks

## Alternative: Generate App-Specific Password

If Hostinger has security features enabled:
1. Go to Hostinger email settings
2. Generate an "App Password" or "SMTP Password"
3. Use that instead of your regular password
