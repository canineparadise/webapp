# Aldenham Doggy Day Care - Branded Email Templates

Copy and paste these into Supabase → Authentication → Email Templates

Brand Colors:
- Navy: #1a3a52
- Gold: #a68756
- Light Gold: #c4a874
- Cream: #f5f2e8

---

## 1. CONFIRM SIGNUP

**Subject:**
```
Welcome to Aldenham Doggy Day Care – Verify Your Email 🐾
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header with Navy Background -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a3a52 0%, #2a4a62 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #a68756; font-size: 32px; font-weight: bold;">🐾 Aldenham Doggy Day Care</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Where Every Dog Finds Paradise</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a3a52; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Welcome to Our Pack!</h2>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We're thrilled to have you join the Aldenham Doggy Day Care family! Your furry friend is one step closer to experiencing our loving care and exciting adventures.
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                To get started, please confirm your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #a68756; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(166,135,86,0.3);">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #a68756; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <div style="background-color: #e8f4f8; border-left: 4px solid #a68756; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #1a3a52; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>What's Next?</strong><br>
                  Once verified, you can book your dog's first visit, set up a subscription plan, and access our full range of services!
                </p>
              </div>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                With love and tail wags,<br>
                <strong style="color: #1a3a52;">The Aldenham Doggy Day Care Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f2e8; padding: 30px; text-align: center; border-top: 3px solid #a68756;">
              <p style="color: #1a3a52; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">
                📞 Questions? We're Here to Help!
              </p>
              <p style="color: #666666; font-size: 13px; margin: 0 0 15px 0;">
                Email: <a href="mailto:wecare@canineparadise.com" style="color: #a68756; text-decoration: none;">wecare@canineparadise.com</a><br>
                Licensed & Insured | 14+ Years Experience | 24/7 Emergency Support
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Aldenham Doggy Day Care. All rights reserved.
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

## 2. RESET PASSWORD

**Subject:**
```
Reset Your Aldenham Doggy Day Care Password 🔐
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a3a52 0%, #2a4a62 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #a68756; font-size: 32px; font-weight: bold;">🐾 Aldenham Doggy Day Care</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Where Every Dog Finds Paradise</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a3a52; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Reset Your Password</h2>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset the password for your Aldenham Doggy Day Care account. No worries – it happens to the best of us!
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #a68756; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(166,135,86,0.3);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #a68756; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #e65100; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ Security Note:</strong><br>
                  If you didn't request this password reset, please ignore this email. Your password will remain unchanged. This link expires in 1 hour.
                </p>
              </div>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Stay safe,<br>
                <strong style="color: #1a3a52;">The Aldenham Doggy Day Care Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f2e8; padding: 30px; text-align: center; border-top: 3px solid #a68756;">
              <p style="color: #1a3a52; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">
                📞 Need Help?
              </p>
              <p style="color: #666666; font-size: 13px; margin: 0 0 15px 0;">
                Email: <a href="mailto:wecare@canineparadise.com" style="color: #a68756; text-decoration: none;">wecare@canineparadise.com</a><br>
                Licensed & Insured | 14+ Years Experience | 24/7 Emergency Support
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Aldenham Doggy Day Care. All rights reserved.
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

## 3. MAGIC LINK

**Subject:**
```
Your Aldenham Doggy Day Care Login Link 🔑
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a3a52 0%, #2a4a62 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #a68756; font-size: 32px; font-weight: bold;">🐾 Aldenham Doggy Day Care</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Where Every Dog Finds Paradise</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a3a52; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Your Login Link is Ready!</h2>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Click the button below to securely log in to your Aldenham Doggy Day Care account:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #a68756; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(166,135,86,0.3);">
                      Log In to My Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #a68756; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <div style="background-color: #e8f4f8; border-left: 4px solid #a68756; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #1a3a52; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>🔒 Security Tip:</strong><br>
                  This link expires in 1 hour and can only be used once. If you didn't request this login link, please ignore this email.
                </p>
              </div>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Happy tail wags,<br>
                <strong style="color: #1a3a52;">The Aldenham Doggy Day Care Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f2e8; padding: 30px; text-align: center; border-top: 3px solid #a68756;">
              <p style="color: #1a3a52; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">
                📞 Questions?
              </p>
              <p style="color: #666666; font-size: 13px; margin: 0 0 15px 0;">
                Email: <a href="mailto:wecare@canineparadise.com" style="color: #a68756; text-decoration: none;">wecare@canineparadise.com</a><br>
                Licensed & Insured | 14+ Years Experience | 24/7 Emergency Support
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Aldenham Doggy Day Care. All rights reserved.
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

## 4. CHANGE EMAIL ADDRESS

**Subject:**
```
Confirm Your New Email Address for Aldenham Doggy Day Care ✉️
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a3a52 0%, #2a4a62 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #a68756; font-size: 32px; font-weight: bold;">🐾 Aldenham Doggy Day Care</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Where Every Dog Finds Paradise</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a3a52; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Confirm Your New Email</h2>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You've requested to change the email address associated with your Aldenham Doggy Day Care account. To complete this change, please confirm your new email address.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #a68756; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(166,135,86,0.3);">
                      Confirm New Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #a68756; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #e65100; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ Important:</strong><br>
                  If you didn't request this email change, please contact us immediately at wecare@canineparadise.com. Your account security is our priority.
                </p>
              </div>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #1a3a52;">The Aldenham Doggy Day Care Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f2e8; padding: 30px; text-align: center; border-top: 3px solid #a68756;">
              <p style="color: #1a3a52; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">
                📞 Need Assistance?
              </p>
              <p style="color: #666666; font-size: 13px; margin: 0 0 15px 0;">
                Email: <a href="mailto:wecare@canineparadise.com" style="color: #a68756; text-decoration: none;">wecare@canineparadise.com</a><br>
                Licensed & Insured | 14+ Years Experience | 24/7 Emergency Support
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Aldenham Doggy Day Care. All rights reserved.
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

## HOW TO ADD THESE TO SUPABASE:

1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication** → **Email Templates**
3. For each template above:
   - Click on the template name (Confirm signup, Reset Password, etc.)
   - Copy the **Subject** line and paste it in the Subject field
   - Copy the entire **Body** HTML and paste it in the Body field
   - Click **Save**
4. Repeat for all 4 templates

All templates use your brand colors (#1a3a52 navy, #a68756 gold) and friendly, professional tone!
