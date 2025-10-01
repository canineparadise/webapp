# Supabase Email Templates - Complete Setup

Copy these EXACTLY into your Supabase Dashboard → Authentication → Email Templates

## 1. CONFIRM YOUR EMAIL (Sign Up)

### Subject:
```
Welcome to Canine Paradise! Please Confirm Your Email 🐕
```

### Email Body:
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
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a3a52; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                Welcome to Canine Paradise!
              </h1>
              <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 16px;">
                Your dog's home away from home
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1a3a52; font-size: 18px; margin: 0 0 20px 0;">
                Hi {{ .Data.first_name }}!
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Thank you for joining Canine Paradise! We're excited to welcome you and your furry friend to our exclusive doggy daycare community.
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Please confirm your email address to activate your account:
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
                  ✅ Next Steps to Get Started
                </h2>
                <ol style="color: #666666; font-size: 15px; line-height: 2; margin: 0; padding-left: 20px;">
                  <li><strong>Confirm your email</strong> - Click the button above</li>
                  <li><strong>Fill out your profile</strong> - Add your contact details and emergency information</li>
                  <li><strong>Add your dog</strong> - Register your dog's basic information</li>
                  <li><strong>Complete the assessment form</strong> - Tell us about your dog's personality & needs</li>
                  <li><strong>Upload your dog's photo</strong> - So we can identify your pup</li>
                  <li><strong>Upload vaccination records</strong> - Required for all dogs</li>
                  <li><strong>Book an assessment date</strong> - Available on Fridays only</li>
                  <li><strong>Choose your subscription</strong> - 4, 8, 12, 16, or 20 days per month</li>
                  <li><strong>Start booking!</strong> - Once approved, book your daycare days</li>
                </ol>
              </div>

              <!-- Assessment Requirements -->
              <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #1a3a52; font-size: 18px; margin: 0 0 12px 0;">
                  📋 Assessment Day Requirements
                </h3>
                <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>All dogs must complete an assessment before regular daycare</li>
                  <li>Assessments are held on <strong>Fridays only</strong></li>
                  <li>Please bring up-to-date vaccination certificates</li>
                  <li>Assessment fee: £38 (full day rate)</li>
                  <li>We'll evaluate your dog's temperament and social skills</li>
                </ul>
              </div>

              <!-- Important Notice -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
                <p style="color: #866118; font-size: 14px; margin: 0;">
                  <strong>Important:</strong> This confirmation link expires in 24 hours. Unused subscription days do not roll over to the next month.
                </p>
              </div>

              <!-- Why Canine Paradise -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1a3a52; font-size: 18px; margin: 0 0 10px 0;">
                  Why Canine Paradise?
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
            <td style="background-color: #1a3a52; padding: 30px; text-align: center;">
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

## 2. RESET PASSWORD

### Subject:
```
Reset Your Canine Paradise Password 🔐
```

### Email Body:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a3a52; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                Password Reset Request
              </h1>
              <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 16px;">
                Canine Paradise Account Security
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1a3a52; font-size: 18px; margin: 0 0 20px 0;">
                Hi there,
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                We received a request to reset the password for your Canine Paradise account. If you made this request, click the button below to create a new password.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="{{ .RecoveryURL }}"
                   style="display: inline-block; background-color: #d4af37; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  Reset My Password
                </a>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
                <p style="color: #866118; font-size: 14px; margin: 0;">
                  <strong>Security Notice:</strong> This password reset link expires in 24 hours. If you didn't request this, please ignore this email and your password will remain unchanged.
                </p>
              </div>

              <!-- Help Section -->
              <div style="background-color: #f5f2e8; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #1a3a52; font-size: 18px; margin: 0 0 10px 0;">
                  Need Help?
                </h3>
                <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
                  If you're having trouble resetting your password or didn't request this change, please contact us:
                </p>
                <ul style="color: #666666; font-size: 15px; line-height: 1.8; margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Email: wecare@canineparadise.com</li>
                  <li>Phone: 07963 656556</li>
                  <li>Hours: Monday - Friday, 7:00 AM - 7:00 PM</li>
                </ul>
              </div>

              <!-- Alternative Link -->
              <p style="color: #999999; font-size: 13px; margin: 25px 0 0 0;">
                If the button above doesn't work, copy and paste this link into your browser:
                <br>
                <a href="{{ .RecoveryURL }}" style="color: #d4af37; word-break: break-all;">
                  {{ .RecoveryURL }}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a3a52; padding: 30px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
                <strong>Canine Paradise</strong><br>
                Elstree Road, Elstree, WD6 3FS
              </p>
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 10px 0;">
                📞 07963 656556 | ✉️ wecare@canineparadise.com
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

## 3. MAGIC LINK (Optional - if you enable passwordless login)

### Subject:
```
Your Canine Paradise Login Link 🔗
```

### Email Body:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login to Canine Paradise</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a3a52; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                Your Login Link
              </h1>
              <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 16px;">
                Quick access to your account
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1a3a52; font-size: 18px; margin: 0 0 20px 0;">
                Welcome back!
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Click the button below to instantly log in to your Canine Paradise account.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="{{ .MagicLink }}"
                   style="display: inline-block; background-color: #d4af37; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  Log In to My Account
                </a>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
                <p style="color: #866118; font-size: 14px; margin: 0;">
                  <strong>Security:</strong> This login link expires in 1 hour and can only be used once. Do not share this link with anyone.
                </p>
              </div>

              <!-- Alternative Link -->
              <p style="color: #999999; font-size: 13px; margin: 25px 0 0 0;">
                If the button above doesn't work, copy and paste this link into your browser:
                <br>
                <a href="{{ .MagicLink }}" style="color: #d4af37; word-break: break-all;">
                  {{ .MagicLink }}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a3a52; padding: 30px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
                <strong>Canine Paradise</strong><br>
                Elstree Road, Elstree, WD6 3FS
              </p>
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 10px 0;">
                📞 07963 656556 | ✉️ wecare@canineparadise.com
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

## 4. CHANGE EMAIL ADDRESS

### Subject:
```
Confirm Your New Email Address for Canine Paradise 📧
```

### Email Body:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a3a52; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                Email Address Change Request
              </h1>
              <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 16px;">
                Please confirm your new email
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1a3a52; font-size: 18px; margin: 0 0 20px 0;">
                Hi {{ .Data.first_name }},
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                You've requested to change your email address for your Canine Paradise account. Please confirm this change by clicking the button below.
              </p>

              <div style="background-color: #f5f2e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #1a3a52; font-size: 15px; margin: 0;">
                  <strong>New Email:</strong> {{ .Email }}
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="{{ .ConfirmationURL }}"
                   style="display: inline-block; background-color: #d4af37; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  Confirm Email Change
                </a>
              </div>

              <!-- Warning -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
                <p style="color: #866118; font-size: 14px; margin: 0;">
                  <strong>Important:</strong> After confirming, you'll need to use your new email address to log in. This link expires in 24 hours.
                </p>
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
            <td style="background-color: #1a3a52; padding: 30px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
                <strong>Canine Paradise</strong><br>
                Elstree Road, Elstree, WD6 3FS
              </p>
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 10px 0;">
                📞 07963 656556 | ✉️ wecare@canineparadise.com
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

## How to Add These Templates to Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. For each template type:
   - Copy the **Subject** line
   - Copy the **entire HTML body**
   - Paste into the corresponding template
   - Click **Save**

## Color Palette Used:
- Navy Blue: `#1a3a52` (headers, text)
- Gold: `#d4af37` (accents, buttons, links)
- Cream: `#f5f2e8` (background sections)
- Light Gold: `#fff9e6` (warning boxes)
- White: `#ffffff` (main content background)
- Gray: `#666666` (body text)

## Notes:
- No gradients used - clean flat colors only
- Professional layout matching your website
- Mobile responsive
- All links use the gold color for consistency
- Footer includes all contact information