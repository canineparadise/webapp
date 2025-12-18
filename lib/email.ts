import nodemailer from 'nodemailer'

// Create reusable transporter with explicit SSL settings for Hostinger
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Less strict - may help with Hostinger
  },
  debug: true, // Enable debug output
  logger: true, // Log to console
})

// Verify connection configuration
export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log('Email server is ready to send messages')
    return true
  } catch (error) {
    console.error('Email server connection error:', error)
    return false
  }
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Assessment confirmation email
export async function sendAssessmentConfirmation({
  userEmail,
  userName,
  dogNames,
  assessmentDate,
  startTime,
  endTime,
  amountPaid,
}: {
  userEmail: string
  userName: string
  dogNames: string[]
  assessmentDate: string
  startTime: string
  endTime: string
  amountPaid: number
}) {
  const formattedDate = new Date(assessmentDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const dogsText = dogNames.length === 1
    ? dogNames[0]
    : dogNames.length === 2
    ? `${dogNames[0]} and ${dogNames[1]}`
    : `${dogNames.slice(0, -1).join(', ')}, and ${dogNames[dogNames.length - 1]}`

  const subject = `Assessment Confirmed - ${formattedDate}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #a68756; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #1a3a52; margin-top: 0; }
          .highlight { color: #a68756; font-weight: bold; }
          ul { padding-left: 20px; }
          li { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 Assessment Confirmed!</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>Great news! Your assessment booking has been confirmed and payment received.</p>

            <div class="details-box">
              <h2>📅 Assessment Details</h2>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}</p>
              <p><strong>Dog${dogNames.length > 1 ? 's' : ''}:</strong> ${dogsText}</p>
              <p><strong>Amount Paid:</strong> <span class="highlight">£${amountPaid.toFixed(2)}</span></p>
            </div>

            <h2>What to Bring</h2>
            <ul>
              <li>Your dog's vaccination records (if not already provided)</li>
              <li>Any medication your dog requires</li>
              <li>Your dog's favourite treats (optional)</li>
              <li>A positive attitude! 🐕</li>
            </ul>

            <h2>What Happens Next?</h2>
            <p>We'll send you a reminder 12 hours before your assessment. During the assessment, we'll:</p>
            <ul>
              <li>Get to know your dog's personality and behavior</li>
              <li>Introduce them to our facilities and staff</li>
              <li>Assess their compatibility with our daycare environment</li>
              <li>Answer any questions you may have</li>
            </ul>

            <p>After a successful assessment, you'll be able to book daycare sessions and subscriptions through your client portal.</p>

            <p><strong>Our Address:</strong><br>
            Aldenham Doggy Day Care<br>
            [Your Full Address Here]</p>

            <p>If you have any questions or need to reschedule, please contact us at admin@aldenhamdoggydaycare.com or call [Your Phone Number].</p>

            <p>We can't wait to meet ${dogsText}! 🐾</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated confirmation email from Aldenham Doggy Day Care.</p>
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

// Subscription confirmation email
export async function sendSubscriptionConfirmation({
  userEmail,
  userName,
  subscriptions,
  totalAmount,
  nextBillingDate,
}: {
  userEmail: string
  userName: string
  subscriptions: Array<{
    dogName: string
    tierName: string
    daysPerMonth: number
    pricePerMonth: number
  }>
  totalAmount: number
  nextBillingDate: string
}) {
  const subject = 'Subscription Activated - Welcome to Aldenham Doggy Day Care!'

  const subscriptionRows = subscriptions.map(sub => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>${sub.dogName}</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${sub.tierName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${sub.daysPerMonth} days</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">£${sub.pricePerMonth.toFixed(2)}/month</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #1a3a52; margin-top: 0; }
          .highlight { color: #a68756; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to the Pack!</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>Congratulations! Your subscription has been activated. We're thrilled to welcome you and your furry friend(s) to Aldenham Doggy Day Care!</p>

            <div class="details-box">
              <h2>📋 Subscription Summary</h2>
              <table>
                <thead>
                  <tr style="background: #f0f0f0;">
                    <th style="padding: 10px; text-align: left;">Dog</th>
                    <th style="padding: 10px; text-align: left;">Tier</th>
                    <th style="padding: 10px; text-align: left;">Days</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${subscriptionRows}
                </tbody>
                <tfoot>
                  <tr style="background: #f5f2e8; font-weight: bold;">
                    <td colspan="3" style="padding: 15px;">Total Monthly Cost</td>
                    <td style="padding: 15px; text-align: right;"><span class="highlight">£${totalAmount.toFixed(2)}</span></td>
                  </tr>
                </tfoot>
              </table>
              <p><strong>Next Billing Date:</strong> ${new Date(nextBillingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <h2>How to Book Your Days</h2>
            <ol>
              <li>Log into your client portal</li>
              <li>Navigate to "Book Days"</li>
              <li>Select available dates for your subscription days</li>
              <li>Confirm your bookings</li>
            </ol>

            <p><strong>Important:</strong> You have ${subscriptions.reduce((sum, sub) => sum + sub.daysPerMonth, 0)} days per month across all subscriptions. Make sure to book them before the end of each month!</p>

            <p>If you have any questions, please don't hesitate to contact us at admin@aldenhamdoggydaycare.com</p>

            <p>Looking forward to seeing your dog(s) soon! 🐾</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

// Individual day booking confirmation email
export async function sendIndividualDayConfirmation({
  userEmail,
  userName,
  dogName,
  bookingDates,
  totalAmount,
}: {
  userEmail: string
  userName: string
  dogName: string
  bookingDates: string[]
  totalAmount: number
}) {
  const subject = 'Day Booking Confirmed - See You Soon!'

  const datesList = bookingDates.map(date => {
    const formatted = new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    return `<li style="margin: 8px 0;">${formatted}</li>`
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #1a3a52; }
          .highlight { color: #a68756; font-weight: bold; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>Great news! Your daycare booking for <strong>${dogName}</strong> has been confirmed.</p>

            <div class="details-box">
              <h2>📅 Booked Dates</h2>
              <ul style="list-style: none; padding: 0;">
                ${datesList}
              </ul>
              <p style="margin-top: 15px;"><strong>Total Paid:</strong> <span class="highlight">£${totalAmount.toFixed(2)}</span></p>
            </div>

            <h2>What to Remember</h2>
            <ul>
              <li>Drop-off: 7:00 AM - 10:00 AM</li>
              <li>Pick-up: 3:00 PM - 7:00 PM</li>
              <li>Bring any required medication</li>
              <li>Make sure ${dogName} has had breakfast before drop-off</li>
            </ul>

            <p>We're excited to see ${dogName}! If you need to make any changes to your booking, please contact us as soon as possible.</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

// Welcome email for new users
export async function sendWelcomeEmail({
  userEmail,
  userName,
}: {
  userEmail: string
  userName: string
}) {
  const subject = 'Welcome to Aldenham Doggy Day Care! 🐾'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #1a3a52; }
          .cta-button { display: inline-block; background: #a68756; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to the Pack! 🐕</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>Thank you for choosing Aldenham Doggy Day Care! We're thrilled to have you and your furry friend(s) join our community.</p>

            <h2>Getting Started</h2>
            <p>Here's what to do next:</p>

            <ol>
              <li><strong>Add Your Dog(s)</strong> - Log into your portal and add your dog's details, including photos and vaccination records</li>
              <li><strong>Book an Assessment</strong> - All new dogs need an assessment day before joining regular daycare</li>
              <li><strong>Choose Your Plan</strong> - After a successful assessment, select from our flexible subscription tiers or book individual days</li>
            </ol>

            <div class="details-box">
              <h2>What We Offer</h2>
              <ul>
                <li>🏃 Supervised play sessions</li>
                <li>🌳 Outdoor and indoor activities</li>
                <li>💼 Flexible subscription tiers (1-5 days/week)</li>
                <li>📸 Regular photo updates</li>
                <li>👨‍⚕️ Experienced and caring staff</li>
              </ul>
            </div>

            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="cta-button">Go to Your Dashboard</a>
            </p>

            <p>If you have any questions, don't hesitate to reach out to us at admin@aldenhamdoggydaycare.com or call us directly.</p>

            <p>We can't wait to meet your four-legged family member!</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

// Dog registration confirmation email
export async function sendDogRegistrationEmail({
  userEmail,
  userName,
  dogName,
  requiresAssessment,
}: {
  userEmail: string
  userName: string
  dogName: string
  requiresAssessment: boolean
}) {
  const subject = `${dogName} has been added to your account!`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #1a3a52; }
          .highlight { color: #a68756; font-weight: bold; }
          .cta-button { display: inline-block; background: #a68756; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .warning-box { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .success-box { background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 Dog Added Successfully!</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>Great news! <strong>${dogName}</strong> has been successfully added to your Aldenham Doggy Day Care account.</p>

            ${requiresAssessment ? `
              <div class="warning-box">
                <h2 style="margin-top: 0; color: #856404;">📋 Next Step: Book an Assessment</h2>
                <p style="margin-bottom: 0;">Before ${dogName} can attend regular daycare, they need to complete an assessment. This helps us ensure ${dogName} is comfortable in our environment and gets along well with other dogs.</p>
              </div>

              <h2>How to Book an Assessment</h2>
              <ol>
                <li>Log into your dashboard</li>
                <li>Navigate to "Book Assessment"</li>
                <li>Select an available time slot</li>
                <li>Complete the booking and payment</li>
              </ol>

              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/assessment/schedule" class="cta-button">Book Assessment Now</a>
              </p>

              <h2>What Happens During the Assessment?</h2>
              <ul>
                <li>Meet our experienced staff</li>
                <li>Tour of our facilities</li>
                <li>Supervised introduction to other dogs</li>
                <li>Behavioral evaluation in a safe environment</li>
              </ul>

              <p><strong>Assessment Fee:</strong> £40 (one-time fee)</p>
            ` : `
              <div class="success-box">
                <h2 style="margin-top: 0; color: #155724;">✅ Welcome Back!</h2>
                <p style="margin-bottom: 0;">You've marked ${dogName} as an existing dog who has already completed an assessment. Our team will review and approve ${dogName}'s profile shortly.</p>
              </div>

              <h2>What's Next?</h2>
              <p>Once our team approves ${dogName}'s profile, you'll be able to:</p>
              <ul>
                <li>Book daycare sessions</li>
                <li>Purchase subscription plans</li>
                <li>Schedule individual days</li>
                <li>View ${dogName}'s activity updates</li>
              </ul>

              <p>You'll receive an email notification once ${dogName} has been approved!</p>
            `}

            <div class="details-box">
              <h2>What to Bring</h2>
              <ul>
                <li>Up-to-date vaccination records</li>
                <li>Any required medications</li>
                <li>Emergency contact information</li>
              </ul>
            </div>

            <p>If you have any questions about ${dogName}'s registration or the assessment process, please don't hesitate to contact us at admin@aldenhamdoggydaycare.com</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

// Vaccination expiry reminder email
export async function sendVaccinationExpiryReminder({
  userEmail,
  userName,
  dogName,
  expiringItems,
}: {
  userEmail: string
  userName: string
  dogName: string
  expiringItems: Array<{
    type: 'vaccination' | 'flea' | 'worming' | 'heartworm'
    expiryDate: string
    daysUntilExpiry: number
  }>
}) {
  const typeLabels: Record<string, string> = {
    vaccination: 'Vaccinations',
    flea: 'Flea Treatment',
    worming: 'Worming Treatment',
    heartworm: 'Heartworm Prevention',
  }

  const typeIcons: Record<string, string> = {
    vaccination: '💉',
    flea: '🦟',
    worming: '🐛',
    heartworm: '❤️',
  }

  const itemsList = expiringItems.map(item => {
    const formattedDate = new Date(item.expiryDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    const urgency = item.daysUntilExpiry <= 7 ? 'color: #dc3545; font-weight: bold;' : 'color: #856404;'
    const daysText = item.daysUntilExpiry === 0
      ? '<strong style="color: #dc3545;">TODAY!</strong>'
      : item.daysUntilExpiry === 1
        ? '<strong style="color: #dc3545;">TOMORROW!</strong>'
        : `in <strong>${item.daysUntilExpiry} days</strong>`

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
          ${typeIcons[item.type]} ${typeLabels[item.type]}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${formattedDate}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; ${urgency}">Expires ${daysText}</td>
      </tr>
    `
  }).join('')

  const isUrgent = expiringItems.some(item => item.daysUntilExpiry <= 7)
  const subject = isUrgent
    ? `⚠️ URGENT: ${dogName}'s health records expiring soon!`
    : `📋 Reminder: ${dogName}'s health records expiring in 30 days`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isUrgent ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' : 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)'}; color: ${isUrgent ? 'white' : '#333'}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          h1 { margin: 0; font-size: 24px; }
          h2 { color: #1a3a52; margin-top: 0; }
          .highlight { color: #a68756; font-weight: bold; }
          .warning-box { background: ${isUrgent ? '#f8d7da' : '#fff3cd'}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isUrgent ? '#dc3545' : '#ffc107'}; }
          .cta-button { display: inline-block; background: #a68756; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isUrgent ? '⚠️' : '📋'} Health Records Reminder</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>This is a friendly reminder that some of <strong>${dogName}</strong>'s health records are ${isUrgent ? 'expiring very soon' : 'due for renewal'}.</p>

            <div class="warning-box">
              <h2 style="margin-top: 0; color: ${isUrgent ? '#721c24' : '#856404'};">
                ${isUrgent ? '⚠️ Urgent Attention Required' : '📅 Upcoming Expirations'}
              </h2>
              <table>
                <thead>
                  <tr style="background: #f0f0f0;">
                    <th style="padding: 10px; text-align: left;">Treatment</th>
                    <th style="padding: 10px; text-align: left;">Expiry Date</th>
                    <th style="padding: 10px; text-align: left;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
            </div>

            <div class="details-box">
              <h2>Why This Matters</h2>
              <p>For the safety of ${dogName} and all dogs at our daycare, we require up-to-date health records. Dogs with expired vaccinations or treatments may not be able to attend daycare until records are updated.</p>
            </div>

            <h2>What You Need To Do</h2>
            <ol>
              <li>Schedule an appointment with your vet to renew the expiring treatments</li>
              <li>After your vet visit, log into your dashboard and update ${dogName}'s health information</li>
              <li>Upload any new vaccination certificates</li>
            </ol>

            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/dogs" class="cta-button">Update ${dogName}'s Records</a>
            </p>

            <p>If you've already renewed these treatments, please update ${dogName}'s profile in your dashboard to avoid future reminders.</p>

            <p>Questions? Contact us at admin@aldenhamdoggydaycare.com</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated reminder from Aldenham Doggy Day Care.</p>
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

// Weekly booking reminder email
export async function sendWeeklyBookingReminder({
  userEmail,
  userName,
  bookings,
  weekStartDate,
  weekEndDate,
}: {
  userEmail: string
  userName: string
  bookings: Array<{
    date: string
    dogNames: string[]
    needsBreakfast?: boolean
    needsLunch?: boolean
    needsDinner?: boolean
    specialInstructions?: string | null
  }>
  weekStartDate: string
  weekEndDate: string
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const formattedWeekStart = new Date(weekStartDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  })
  const formattedWeekEnd = new Date(weekEndDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const bookingRows = bookings.map(booking => {
    const dogsText = booking.dogNames.join(', ')
    const meals: string[] = []
    if (booking.needsBreakfast) meals.push('Breakfast')
    if (booking.needsLunch) meals.push('Lunch')
    if (booking.needsDinner) meals.push('Dinner')
    const mealsText = meals.length > 0 ? meals.join(', ') : 'None requested'

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">
          ${formatDate(booking.date)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
          ${dogsText}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
          ${mealsText}
        </td>
      </tr>
      ${booking.specialInstructions ? `
      <tr>
        <td colspan="3" style="padding: 8px 12px; background: #f9f9f9; font-size: 13px; color: #666; border-bottom: 1px solid #e0e0e0;">
          <em>📝 Note: ${booking.specialInstructions}</em>
        </td>
      </tr>
      ` : ''}
    `
  }).join('')

  const totalDays = bookings.length
  const subject = `🐾 Your Week Ahead: ${totalDays} Daycare Day${totalDays > 1 ? 's' : ''} Booked (${formattedWeekStart} - ${formattedWeekEnd})`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          h1 { margin: 0; font-size: 24px; }
          h2 { color: #1a3a52; margin-top: 0; }
          .highlight { color: #a68756; font-weight: bold; }
          .info-box { background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8; }
          .cta-button { display: inline-block; background: #a68756; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 Your Week at Aldenham</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${formattedWeekStart} - ${formattedWeekEnd}</p>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>Here's a reminder of your upcoming daycare bookings for this week. We're excited to see your furry friend${bookings.some(b => b.dogNames.length > 1) ? 's' : ''}!</p>

            <div class="details-box">
              <h2>📅 This Week's Bookings</h2>
              <table>
                <thead>
                  <tr style="background: #f0f0f0;">
                    <th style="padding: 10px; text-align: left;">Date</th>
                    <th style="padding: 10px; text-align: left;">Dog(s)</th>
                    <th style="padding: 10px; text-align: left;">Meals</th>
                  </tr>
                </thead>
                <tbody>
                  ${bookingRows}
                </tbody>
              </table>
              <p style="margin-top: 15px; font-size: 14px;">
                <strong>Total Days This Week:</strong> <span class="highlight">${totalDays}</span>
              </p>
            </div>

            <div class="info-box">
              <h2 style="margin-top: 0; color: #0c5460;">⏰ Drop-off & Pick-up Times</h2>
              <p style="margin-bottom: 0;">
                <strong>Drop-off:</strong> 7:00 AM - 10:00 AM<br>
                <strong>Pick-up:</strong> 3:00 PM - 7:00 PM
              </p>
            </div>

            <h2>📋 Checklist for Each Visit</h2>
            <ul>
              <li>✓ Ensure your dog has had a toilet break before drop-off</li>
              <li>✓ Bring any required medications with clear instructions</li>
              <li>✓ Let us know if anything has changed (diet, behavior, health)</li>
              <li>✓ Remember your checkout password for pick-up</li>
            </ul>

            <p>Need to make changes to your bookings? Log into your dashboard or contact us as soon as possible.</p>

            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="cta-button">View Your Dashboard</a>
            </p>

            <p>If you have any questions, please contact us at admin@aldenhamdoggydaycare.com or call us directly.</p>

            <p>We look forward to seeing you this week! 🐕</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated weekly reminder from Aldenham Doggy Day Care.</p>
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

// Password reset email
export async function sendPasswordResetEmail({
  userEmail,
  userName,
  resetLink,
}: {
  userEmail: string
  userName: string
  resetLink: string
}) {
  const subject = 'Reset Your Password - Aldenham Doggy Day Care'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #1a3a52; margin-top: 0; }
          .cta-button { display: inline-block; background: #a68756; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .warning-text { color: #856404; font-size: 13px; background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>We received a request to reset your password for your Aldenham Doggy Day Care account.</p>

            <div class="details-box">
              <h2>Reset Your Password</h2>
              <p>Click the button below to set a new password:</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="cta-button">Reset Password</a>
              </p>
              <p style="font-size: 13px; color: #666;">Or copy and paste this link into your browser:</p>
              <p style="font-size: 12px; word-break: break-all; color: #666;">${resetLink}</p>
            </div>

            <div class="warning-text">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact us if you have concerns about your account security.
            </div>

            <p>If you have any questions, please contact us at admin@aldenhamdoggydaycare.com</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated email from Aldenham Doggy Day Care.</p>
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

// Assessment reschedule notification email
export async function sendAssessmentRescheduleEmail({
  userEmail,
  userName,
  dogNames,
  oldDate,
  oldStartTime,
  oldEndTime,
  newDate,
  newStartTime,
  newEndTime,
  rescheduledBy,
}: {
  userEmail: string
  userName: string
  dogNames: string[]
  oldDate: string
  oldStartTime: string
  oldEndTime: string
  newDate: string
  newStartTime: string
  newEndTime: string
  rescheduledBy: string
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const dogsText = dogNames.length === 1
    ? dogNames[0]
    : dogNames.length === 2
    ? `${dogNames[0]} and ${dogNames[1]}`
    : `${dogNames.slice(0, -1).join(', ')}, and ${dogNames[dogNames.length - 1]}`

  const subject = `Assessment Rescheduled - New Date: ${formatDate(newDate)}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .old-details { background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc3545; text-decoration: line-through; opacity: 0.7; }
          .new-details { background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #1a3a52; margin-top: 0; }
          .highlight { color: #a68756; font-weight: bold; }
          ul { padding-left: 20px; }
          li { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Assessment Rescheduled</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>Your assessment for <strong>${dogsText}</strong> has been rescheduled by ${rescheduledBy}.</p>

            <div class="old-details">
              <h3 style="margin-top: 0; color: #721c24;">Previous Date (Cancelled)</h3>
              <p><strong>Date:</strong> ${formatDate(oldDate)}</p>
              <p><strong>Time:</strong> ${oldStartTime.slice(0, 5)} - ${oldEndTime.slice(0, 5)}</p>
            </div>

            <div class="new-details">
              <h3 style="margin-top: 0; color: #155724;">New Date</h3>
              <p><strong>Date:</strong> ${formatDate(newDate)}</p>
              <p><strong>Time:</strong> ${newStartTime.slice(0, 5)} - ${newEndTime.slice(0, 5)}</p>
              <p><strong>Dog${dogNames.length > 1 ? 's' : ''}:</strong> ${dogsText}</p>
            </div>

            <div class="details-box">
              <h2>What to Bring</h2>
              <ul>
                <li>Your dog's vaccination records (if not already provided)</li>
                <li>Any medication your dog requires</li>
                <li>Your dog's favourite treats (optional)</li>
                <li>A positive attitude! 🐕</li>
              </ul>
            </div>

            <p><strong>Our Address:</strong><br>
            Aldenham Doggy Day Care<br>
            [Your Full Address Here]</p>

            <p>If you have any questions about this change or need to request a different date, please contact us at admin@aldenhamdoggydaycare.com or call [Your Phone Number].</p>

            <p>We look forward to meeting ${dogsText}! 🐾</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated notification from Aldenham Doggy Day Care.</p>
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

// Dog approval notification email
export async function sendDogApprovalEmail({
  userEmail,
  userName,
  dogName,
}: {
  userEmail: string
  userName: string
  dogName: string
}) {
  const subject = `${dogName} has been approved! 🎉`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .details-box { background: #f5f2e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a68756; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #1a3a52; }
          .cta-button { display: inline-block; background: #a68756; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ${dogName} is Approved!</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>Fantastic news! <strong>${dogName}</strong> has been approved to join Aldenham Doggy Day Care! We're so excited to welcome ${dogName} to our pack!</p>

            <div class="details-box">
              <h2>You Can Now:</h2>
              <ul>
                <li>📅 Book daycare sessions for ${dogName}</li>
                <li>💳 Purchase subscription plans (1-5 days per week)</li>
                <li>📆 Schedule individual days</li>
                <li>📸 Receive photo updates during daycare</li>
              </ul>
            </div>

            <h2>How to Book Daycare</h2>
            <ol>
              <li>Log into your client portal</li>
              <li>Choose between subscriptions or individual days</li>
              <li>Select your preferred dates</li>
              <li>Complete your booking</li>
            </ol>

            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="cta-button">Book Daycare Now</a>
            </p>

            <h2>Drop-off & Pick-up Times</h2>
            <ul>
              <li><strong>Drop-off:</strong> 7:00 AM - 10:00 AM</li>
              <li><strong>Pick-up:</strong> 3:00 PM - 7:00 PM</li>
            </ul>

            <h2>What to Bring</h2>
            <ul>
              <li>Any required medications</li>
              <li>Special dietary requirements (if any)</li>
              <li>A positive attitude! 🐕</li>
            </ul>

            <p>We can't wait to see ${dogName} soon! If you have any questions, please contact us at admin@aldenhamdoggydaycare.com</p>

            <p>Best regards,<br>
            <strong>The Aldenham Doggy Day Care Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Aldenham Doggy Day Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}
