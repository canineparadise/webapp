# Supabase Email Setup Guide

## Step 1: Access Email Templates

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project (Canine Paradise)
3. Navigate to **Authentication** > **Email Templates**

## Step 2: Configure Welcome/Confirmation Email

Replace the default "Confirm your email" template with this branded version:

### Subject Line:
```
Welcome to Canine Paradise! 🐕 Please Confirm Your Email
```

### Email Body (HTML):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Canine Paradise</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a3a52 0%, #d4af37 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                Welcome to Canine Paradise! 🐕
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">
                Your dog's home away from home
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1a3a52; font-size: 18px; margin: 0 0 20px 0;">
                Hi {{ .Data.first_name }}! 👋
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Thank you for joining Canine Paradise! We're excited to welcome you and your furry friend to our exclusive doggy daycare community.
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Please confirm your email address to activate your account and get started:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="{{ .ConfirmationURL }}"
                   style="display: inline-block; background-color: #d4af37; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  Confirm My Email
                </a>
              </div>

              <!-- What's Next Section -->
              <div style="background-color: #f5f2e8; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h2 style="color: #1a3a52; font-size: 20px; margin: 0 0 15px 0;">
                  What Happens Next? 🎯
                </h2>
                <ol style="color: #666666; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Confirm your email (click the button above)</li>
                  <li>Add your dog's details to your profile</li>
                  <li>Book an assessment day (Fridays only)</li>
                  <li>Choose your monthly subscription package</li>
                  <li>Start booking your dog's daycare days!</li>
                </ol>
              </div>

              <!-- Important Notice -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
                <p style="color: #866118; font-size: 14px; margin: 0;">
                  <strong>Important:</strong> This confirmation link expires in 24 hours.
                  Unused subscription days do not roll over to the next month.
                </p>
              </div>

              <!-- About Us -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1a3a52; font-size: 18px; margin: 0 0 10px 0;">
                  Why Canine Paradise? 🌟
                </h3>
                <ul style="color: #666666; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>14+ years of experience in dog care</li>
                  <li>Secure 2-acre outdoor play area</li>
                  <li>Professional, caring staff</li>
                  <li>Flexible monthly subscription packages</li>
                  <li>Live updates throughout the day</li>
                </ul>
              </div>

              <!-- Alternative Link -->
              <p style="color: #999999; font-size: 13px; margin: 25px 0 0 0;">
                If the button above doesn't work, copy and paste this link into your browser:
                <br>
                <a href="{{ .ConfirmationURL }}" style="color: #d4af37; word-break: break-all;">
                  {{ .ConfirmationURL }}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a3a52; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
                <strong>Canine Paradise</strong><br>
                Elstree Road, Elstree, WD6 3FS
              </p>
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 10px 0;">
                📞 07963 656556 | ✉️ wecare@canineparadise.com
              </p>
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 15px 0;">
                Open Monday - Friday, 7:00 AM - 7:00 PM
              </p>
              <p style="color: #d4af37; font-size: 12px; margin: 0;">
                © 2010-2025 Canine Paradise. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Step 3: Configure Password Reset Email

### Subject Line:
```
Reset Your Canine Paradise Password 🔐
```

### Email Body:
Use similar HTML template but with password reset content:
- Change heading to "Password Reset Request"
- Update button text to "Reset My Password"
- Update the link to use `{{ .RecoveryURL }}`

## Step 4: Configure Email Settings

1. Go to **Authentication** > **Settings**
2. Under **Email Settings**:
   - Enable email confirmations: ✅
   - Auto-confirm emails: ❌ (for production)
   - Secure email change: ✅
   - Secure password change: ✅

## Step 5: Set Up Custom SMTP (Optional but Recommended)

For production, use a custom email service for better deliverability:

### Option A: Resend (Recommended)
1. Create account at https://resend.com
2. Verify your domain
3. Get API key
4. In Supabase: Authentication > Settings > SMTP Settings
5. Configure:
   - Host: smtp.resend.com
   - Port: 587
   - Username: resend
   - Password: [Your Resend API Key]
   - Sender email: noreply@canineparadise.com
   - Sender name: Canine Paradise

### Option B: Gmail (for testing only)
1. Use your Gmail account
2. Generate app password
3. Configure SMTP with Gmail settings

## Step 6: Test Email Flow

1. Create a test account through your signup page
2. Check that email arrives within 1-2 minutes
3. Verify the design looks correct
4. Test the confirmation link works
5. Test password reset flow

## Email Best Practices

1. **SPF/DKIM Records**: Add these DNS records for your domain to improve deliverability
2. **From Address**: Use noreply@canineparadise.com or wecare@canineparadise.com
3. **Reply-To**: Set to wecare@canineparadise.com for customer inquiries
4. **Footer**: Always include unsubscribe link and company details
5. **Testing**: Test on multiple email clients (Gmail, Outlook, Apple Mail)

## Monitoring

1. Check Supabase logs for email sending issues
2. Monitor bounce rates in your email service
3. Set up alerts for failed email sends
4. Keep track of confirmation rates

## Troubleshooting

- **Emails not sending**: Check SMTP configuration
- **Going to spam**: Verify SPF/DKIM records, use custom domain
- **Slow delivery**: Consider upgrading email service
- **Template not updating**: Clear cache, wait 5 minutes

## Important Notes

- Default Supabase emails may go to spam
- Custom SMTP greatly improves deliverability
- Always test with real email addresses
- Keep confirmation links short (24 hours)
- Monitor email reputation score