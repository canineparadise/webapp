# Email System Implementation Plan

## ✅ Already Completed
1. **Email infrastructure** - Nodemailer with Hostinger SMTP configured
2. **Assessment confirmation emails** - Sent after booking assessments
3. **Email templates added**:
   - Assessment confirmation
   - Subscription confirmation
   - Individual day booking confirmation
   - Welcome email

## 📋 Phase 1: Remaining Booking Confirmations (Quick wins)

### 1. Subscription Confirmation Email
**File to modify**: `app/dashboard/subscriptions/success/page.tsx`
**Action**: Add API call to send subscription confirmation after successful payment

### 2. Individual Day Booking Confirmation
**File to modify**: `app/dashboard/individual-days/success/page.tsx` (if exists) or checkout success handler
**Action**: Send email after individual day booking confirmed

### 3. Extra Days Purchase Confirmation
**File to modify**: `app/dashboard/extra-days/success/page.tsx` (if exists)
**Action**: Send email after extra days purchase

### 4. Welcome Email on Signup
**File to modify**: `app/signup/page.tsx`
**Action**: Send welcome email after successful registration

## 📋 Phase 2: Automated Reminders (Requires Cron Jobs)

These require setting up Vercel Cron or a scheduled job system:

### Cron Job Setup Options:
1. **Vercel Cron** (Recommended for Vercel hosting)
   - Create `vercel.json` with cron configuration
   - Create API routes that run on schedule
   - Free tier: 1 cron job

2. **Supabase Edge Functions with pg_cron**
   - Use Supabase's built-in cron
   - Query database for upcoming events
   - Trigger emails via API

### Emails Needing Cron:
- Assessment reminders (12 hours before)
- Booking reminders (1 day before)
- Subscription renewal reminders (3 days before)
- Vaccination expiry warnings (30 days before)
- Flea treatment reminders
- Dog birthdays
- User birthdays

## 🛠️ Implementation Steps for Phase 1

### Quick Implementation Guide:

**1. Create API Endpoints** (in `app/api/` folder):
```
send-subscription-confirmation/route.ts
send-individual-day-confirmation/route.ts
send-welcome-email/route.ts
```

**2. Call APIs from Success Pages**:
Add fetch calls similar to assessment success page

**3. Test Each Email**:
- Complete a booking/signup
- Check email inbox
- Verify formatting and content

## 📊 Database Fields Needed for Phase 2

To enable automated reminders, add these fields to `dogs` table:
- `last_flea_treatment_date` (DATE)
- `flea_treatment_frequency_weeks` (INT, default 12)
- `date_of_birth` (DATE) - for birthday emails

Add to `profiles` table:
- `date_of_birth` (DATE) - for user birthday emails
- `email_preferences` (JSONB) - to let users opt in/out of different emails

## 🚀 Deployment Checklist

- [x] Email environment variables added to Vercel
- [x] Nodemailer types installed
- [x] Assessment emails working
- [ ] Subscription emails integrated
- [ ] Individual day emails integrated
- [ ] Welcome emails integrated
- [ ] Cron jobs configured (Phase 2)
- [ ] Reminder emails set up (Phase 2)

## 📝 Next Session Action Items

**Priority 1 (Do First)**:
1. Integrate subscription confirmation email
2. Integrate welcome email on signup
3. Test all emails end-to-end

**Priority 2 (After testing)**:
4. Set up Vercel Cron configuration
5. Create reminder email cron job
6. Add birthday email cron job

**Priority 3 (Nice to have)**:
7. Email preferences dashboard for users
8. Email analytics/tracking
9. Email templates for password reset

## 💡 Tips

- Always test emails in development first
- Don't let email failures block bookings (use try/catch)
- Log all email sends for debugging
- Consider adding email queue for high volume

## 🔗 Resources

- Vercel Cron: https://vercel.com/docs/cron-jobs
- Nodemailer Docs: https://nodemailer.com/
- Email templates location: `/lib/email.ts`
- API endpoints: `/app/api/send-*-confirmation/`
