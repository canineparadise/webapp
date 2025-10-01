# Complete Canine Paradise Email Templates Setup Guide

## 🚀 Quick Setup Steps

### Step 1: Upload Your Logo
First, upload your logo to Supabase Storage or use your website URL:

**Option A - Supabase Storage (Recommended):**
1. Go to Supabase Dashboard → Storage
2. Click on the `dog-photos` bucket (it's public)
3. Upload your `logo.jpeg` file
4. Get the public URL (it will look like: `https://hmlmazrdoglqfictjcnm.supabase.co/storage/v1/object/public/dog-photos/logo.jpeg`)
5. Replace `YOUR_LOGO_URL` in all templates below with this URL

**Option B - Use Website URL:**
Replace `YOUR_LOGO_URL` with: `https://yourdomain.com/logo.jpeg`

### Step 2: Configure Email Templates in Supabase
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. For each template below:
   - Select the template type from the dropdown
   - Copy the **Subject** line
   - Copy the **entire HTML body**
   - Replace `YOUR_LOGO_URL` with your actual logo URL
   - Click **Save**

### Step 3: Enable Email Confirmation
1. Go to **Authentication** → **Providers** → **Email**
2. Enable **Confirm email**
3. Set **Email confirmation expiry** to 3600 (1 hour for better security)
4. Save changes

### Step 4: Configure SMTP (For Production)

**Note:** In Supabase's newer dashboard, SMTP settings might be in different locations:

**Option A - Project Settings:**
1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **Auth** tab
3. Scroll down to find **SMTP Settings** section
4. Enable **Custom SMTP**
5. Enter your email provider details (SendGrid, Mailgun, etc.)

**Option B - Authentication Settings:**
1. Go to **Authentication** in the sidebar
2. Click on **Providers** tab
3. Look for **Email** provider settings
4. Some projects have SMTP configuration here

**Common SMTP Providers:**
- **SendGrid:** smtp.sendgrid.net (port 587)
- **Mailgun:** smtp.mailgun.org (port 587)
- **Gmail:** smtp.gmail.com (port 587)

**If you can't find SMTP settings:**
- Contact Supabase support for your specific plan
- Some free plans use Supabase's default email service
- SMTP customization may require a paid plan

---

## 📧 EMAIL TEMPLATE #1: CONFIRM YOUR EMAIL (Sign Up)

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

          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #1a3a52; padding: 30px 40px; text-align: center;">
              <!-- Logo -->
              <img src="YOUR_LOGO_URL" alt="Canine Paradise" style="width: 80px; height: 80px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">

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
                Hi there! 👋
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
                  Confirm My Email Address
                </a>
              </div>

              <!-- What's Next Section -->
              <div style="background-color: #f5f2e8; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h2 style="color: #1a3a52; font-size: 20px; margin: 0 0 15px 0;">
                  ✅ Your Onboarding Checklist
                </h2>
                <ol style="color: #666666; font-size: 15px; line-height: 2.2; margin: 0; padding-left: 20px;">
                  <li><strong>Confirm your email</strong> - Click the button above</li>
                  <li><strong>Fill out your profile</strong> - Add your contact details and emergency information</li>
                  <li><strong>Add your dog</strong> - Register your dog's basic information</li>
                  <li><strong>Complete the assessment form</strong> - Tell us about your dog's personality & needs</li>
                  <li><strong>Upload your dog's photo</strong> - So our staff can identify your pup</li>
                  <li><strong>Upload vaccination records</strong> - Required for all dogs (PDF or image)</li>
                  <li><strong>Book an assessment date</strong> - Available on Fridays only (£38)</li>
                  <li><strong>Choose your monthly subscription</strong>:
                    <ul style="margin-top: 5px; list-style-type: disc;">
                      <li>4 days/month - £160</li>
                      <li>8 days/month - £304</li>
                      <li>12 days/month - £444</li>
                      <li>16 days/month - £576</li>
                      <li>20 days/month - £700</li>
                    </ul>
                  </li>
                  <li><strong>Start booking!</strong> - Once approved, book your daycare days online</li>
                </ol>
              </div>

              <!-- Assessment Requirements -->
              <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #d4af37;">
                <h3 style="color: #1a3a52; font-size: 18px; margin: 0 0 12px 0;">
                  📋 Assessment Day Information
                </h3>
                <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>All new dogs must complete an assessment before regular daycare</li>
                  <li>Assessments are held on <strong>Fridays only</strong></li>
                  <li>Please bring printed vaccination certificates on assessment day</li>
                  <li>Assessment fee: <strong>£38</strong> (full day rate)</li>
                  <li>Drop-off: 7:00 AM - 9:00 AM | Pick-up: 5:00 PM - 7:00 PM</li>
                  <li>We'll evaluate temperament, social skills, and play style</li>
                </ul>
              </div>

              <!-- Important Notice -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
                <p style="color: #866118; font-size: 14px; margin: 0;">
                  <strong>⚠️ Important:</strong> This confirmation link expires in 1 hour for security. Monthly subscription days do not roll over - use them or lose them!
                </p>
              </div>

              <!-- Why Canine Paradise -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1a3a52; font-size: 18px; margin: 0 0 10px 0;">
                  Why Choose Canine Paradise?
                </h3>
                <ul style="color: #666666; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>14+ years of professional dog care experience</li>
                  <li>Secure 2-acre outdoor play area</li>
                  <li>Professional, trained staff who love dogs</li>
                  <li>Live updates throughout the day</li>
                  <li>Small group sizes for personalized attention</li>
                  <li>Indoor and outdoor play areas</li>
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
                📞 07963 656556 | ✉️ info@canineparadise.com
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

---

## 📧 EMAIL TEMPLATE #2: RESET PASSWORD

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

          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #1a3a52; padding: 30px 40px; text-align: center;">
              <!-- Logo -->
              <img src="YOUR_LOGO_URL" alt="Canine Paradise" style="width: 80px; height: 80px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">

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
                <a href="{{ .ConfirmationURL }}"
                   style="display: inline-block; background-color: #d4af37; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  Reset My Password
                </a>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
                <p style="color: #866118; font-size: 14px; margin: 0;">
                  <strong>🔒 Security Notice:</strong> This password reset link expires in 1 hour. If you didn't request this, please ignore this email and your password will remain unchanged.
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
                  <li>Email: info@canineparadise.com</li>
                  <li>Phone: 07963 656556</li>
                  <li>Hours: Monday - Friday, 7:00 AM - 7:00 PM</li>
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
                📞 07963 656556 | ✉️ info@canineparadise.com
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

---

## 📧 EMAIL TEMPLATE #3: MAGIC LINK (Optional - if you enable passwordless login)

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

          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #1a3a52; padding: 30px 40px; text-align: center;">
              <!-- Logo -->
              <img src="YOUR_LOGO_URL" alt="Canine Paradise" style="width: 80px; height: 80px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">

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
                Welcome back! 👋
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Click the button below to instantly log in to your Canine Paradise account.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="{{ .ConfirmationURL }}"
                   style="display: inline-block; background-color: #d4af37; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  Log In to My Account
                </a>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0;">
                <p style="color: #866118; font-size: 14px; margin: 0;">
                  <strong>🔒 Security:</strong> This login link expires in 1 hour and can only be used once. Do not share this link with anyone.
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
                📞 07963 656556 | ✉️ info@canineparadise.com
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

---

## 📧 EMAIL TEMPLATE #4: CHANGE EMAIL ADDRESS

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

          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #1a3a52; padding: 30px 40px; text-align: center;">
              <!-- Logo -->
              <img src="YOUR_LOGO_URL" alt="Canine Paradise" style="width: 80px; height: 80px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">

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
                Hi there,
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
                  <strong>⚠️ Important:</strong> After confirming, you'll need to use your new email address to log in. This link expires in 1 hour.
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
                📞 07963 656556 | ✉️ info@canineparadise.com
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

---

## 🎨 Design Specifications

### Color Palette Used:
- **Navy Blue:** `#1a3a52` (headers, primary text)
- **Gold:** `#d4af37` (accents, buttons, links)
- **Cream:** `#f5f2e8` (background sections)
- **Light Sky:** `#e8f4f8` (info boxes)
- **Light Gold:** `#fff9e6` (warning/notice boxes)
- **White:** `#ffffff` (main content background)
- **Gray:** `#666666` (body text)

### Key Features:
- ✅ Logo included in all templates
- ✅ No gradients - clean flat colors only
- ✅ Professional layout matching your website
- ✅ Mobile responsive design
- ✅ All links use gold color for brand consistency
- ✅ Complete onboarding checklist in confirmation email
- ✅ Assessment requirements clearly stated
- ✅ Subscription pricing included
- ✅ Footer with all contact information

---

## 🔧 Troubleshooting

### Common Issues:

**1. Emails not sending:**
- Check SMTP configuration
- Verify API keys are correct
- Ensure email confirmation is enabled

**2. Logo not appearing:**
- Make sure logo is uploaded to public storage
- Verify the URL is accessible
- Check image format (JPEG/PNG recommended)

**3. Links not working:**
- Ensure redirect URLs are configured correctly
- Check that your domain is added to allowed URLs

**4. Emails going to spam:**
- Configure custom SMTP provider
- Add SPF/DKIM records to your domain
- Use a reputable email service (SendGrid, Mailgun)

---

## 📝 Testing Checklist

Before going live, test these scenarios:

- [ ] Sign up with new email → Confirmation email received
- [ ] Click confirmation link → Account activated
- [ ] Request password reset → Reset email received
- [ ] Click reset link → Can set new password
- [ ] Change email address → Confirmation sent to new email
- [ ] All links work correctly
- [ ] Logo appears in all emails
- [ ] Mobile view looks good
- [ ] Colors match brand guidelines

---

## 🚀 Going Live

Once everything is tested:

1. **Remove test accounts** from production
2. **Set up production SMTP** for reliable delivery
3. **Monitor email metrics** in Supabase dashboard
4. **Keep templates updated** with any business changes

---

## 📞 Need Help?

If you encounter any issues:
- Check Supabase logs: **Dashboard → Logs → Auth**
- Contact Supabase support
- Review documentation at docs.supabase.com

---

**Remember to replace `YOUR_LOGO_URL` with your actual logo URL in all templates!**