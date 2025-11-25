# Add These Environment Variables to Vercel

Go to your Vercel Dashboard → Your Project → Settings → Environment Variables

Add the following variables (for Production, Preview, and Development):

```
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=admin@aldenhamdoggydaycare.com
EMAIL_PASSWORD=C@n1n3P@r@d
EMAIL_FROM=admin@aldenhamdoggydaycare.com
EMAIL_FROM_NAME=Aldenham Doggy Day Care
```

After adding these, redeploy your project for the changes to take effect.

## What's Been Set Up

✅ Nodemailer package installed
✅ Email configuration utility created (`lib/email.ts`)
✅ Assessment confirmation email template
✅ Subscription confirmation email template (ready to use)
✅ API endpoint for sending assessment confirmations
✅ Integration with assessment success page

## Next Steps

1. Add environment variables to Vercel (see above)
2. Redeploy on Vercel
3. Test by booking an assessment
4. Check your email inbox for the confirmation

## Email Templates Included

1. **Assessment Confirmation** - Sent after booking assessment
   - Includes date, time, dog names, amount paid
   - What to bring checklist
   - What happens next

2. **Subscription Confirmation** - Ready to integrate
   - Subscription summary table
   - How to book days instructions
   - Next billing date

## Future Enhancements (Optional)

- Add email for individual day bookings
- Add reminder emails (12 hours before assessment)
- Add monthly subscription renewal reminders
- Add welcome email for new signups
