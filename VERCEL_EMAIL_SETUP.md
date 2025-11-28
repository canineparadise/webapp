# Vercel Email Configuration Setup

## Environment Variables Required

You MUST add these environment variables in your Vercel project settings:

1. Go to: https://vercel.com/your-project/settings/environment-variables

2. Add the following variables (copy from .env.local):

```
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=admin@aldenhamdoggydaycare.com
EMAIL_PASSWORD=C@n1n3P@r@d
EMAIL_FROM=admin@aldenhamdoggydaycare.com
EMAIL_FROM_NAME=Aldenham Doggy Day Care
```

## How to Add Each Variable

For each variable above:
1. Click "Add New" in Vercel Environment Variables
2. Enter the **Name** (e.g., `EMAIL_HOST`)
3. Enter the **Value** (e.g., `smtp.hostinger.com`)
4. Select environment: **Production**, **Preview**, and **Development** (check all three)
5. Click "Save"

## After Adding All Variables

1. **Redeploy your application**:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Or push a new commit to trigger deployment

2. **Test Email Configuration**:
   - Visit: `https://your-domain.com/api/test-email` (GET request)
   - This will show if email is configured correctly
   - Or send a test email with POST request to same endpoint

## Testing Email Locally

Run this in your browser console while on your site:

```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to: 'your-email@example.com' })
})
  .then(res => res.json())
  .then(data => console.log(data))
```

## Troubleshooting

If emails still don't send:

1. Check Vercel logs:
   - Go to your project → Deployments → Click on latest → View Function Logs
   - Look for email-related errors

2. Verify Hostinger SMTP settings:
   - Confirm `admin@aldenhamdoggydaycare.com` email exists
   - Confirm password is correct
   - Check if Hostinger requires any special SMTP settings

3. Test SMTP connection:
   - Use an SMTP testing tool
   - Verify port 465 is not blocked

## Current Status

⚠️ **CRITICAL**: Email environment variables are NOT currently set on Vercel!

The emails are failing silently because:
- .env.local is only used for local development
- Vercel needs environment variables set in project settings
- Without these variables, nodemailer cannot connect to SMTP server

## Fix Now

1. Add all EMAIL_* variables to Vercel (see above)
2. Redeploy
3. Test with `/api/test-email` endpoint
