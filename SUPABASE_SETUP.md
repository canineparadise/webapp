# Supabase Setup Guide for Canine Paradise

## Prerequisites
- Node.js 18+ installed
- A Supabase account (create one at https://supabase.com)
- A Stripe account for payment processing

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project details:
   - Name: "Canine Paradise"
   - Database Password: (save this securely)
   - Region: Choose closest to your location (Europe West for UK)
4. Wait for project to be created (~2 minutes)

## Step 2: Get Your API Keys

1. Go to Project Settings > API
2. Copy these values:
   - Project URL: `https://YOUR_PROJECT_ID.supabase.co`
   - Anon/Public Key: `eyJ...` (long string)
   - Service Role Key: `eyJ...` (keep this secret!)

## Step 3: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Run Database Migrations

1. Go to Supabase Dashboard > SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. You should see success messages for all tables created

## Step 5: Enable Authentication

1. Go to Authentication > Providers
2. Enable Email provider:
   - Auto-confirm emails: OFF (for production)
   - Secure email change: ON
   - Secure password change: ON

3. Configure email templates (Authentication > Email Templates):
   - Customize confirmation email
   - Customize password reset email

## Step 6: Set Up Storage Buckets

Run this SQL in the SQL Editor:

```sql
-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES
  ('dog-photos', 'dog-photos', true),
  ('vaccination-certificates', 'vaccination-certificates', false);

-- Set up storage policies
CREATE POLICY "Users can upload dog photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'dog-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view dog photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'dog-photos');

CREATE POLICY "Users can upload vaccination certificates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vaccination-certificates' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own certificates" ON storage.objects
  FOR SELECT USING (bucket_id = 'vaccination-certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 7: Set Up Scheduled Functions (Optional)

For automatic monthly subscription resets, create a cron job:

1. Go to Database > Extensions
2. Enable `pg_cron` extension
3. Run this SQL:

```sql
-- Schedule monthly subscription reset (runs at midnight on the 1st of each month)
SELECT cron.schedule(
  'reset-monthly-subscriptions',
  '0 0 1 * *',
  'SELECT reset_monthly_subscriptions();'
);
```

## Step 8: Initial Admin User Setup

Run this SQL to create your first admin user:

```sql
-- Create admin user (replace with your details)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES (
  'admin@canineparadise.com',
  crypt('your_secure_password', gen_salt('bf')),
  NOW(),
  'authenticated'
);

-- Get the user ID from the response, then:
INSERT INTO public.profiles (id, email, role, first_name, last_name, phone)
VALUES (
  'USER_ID_FROM_ABOVE',
  'admin@canineparadise.com',
  'admin',
  'Admin',
  'User',
  '07963656556'
);
```

## Step 9: Test the Connection

Run the development server:

```bash
npm run dev
```

Test the connection by going to http://localhost:3000 and checking the browser console for any Supabase errors.

## Step 10: Security Checklist

- [ ] Row Level Security (RLS) is enabled on all tables
- [ ] API keys are only in `.env.local` (never commit!)
- [ ] Service role key is never exposed to client
- [ ] All policies are properly configured
- [ ] Email confirmation is required for production

## Database Schema Overview

### Core Tables:
- **profiles**: User accounts (extends Supabase auth)
- **dogs**: All dog information and medical records
- **subscriptions**: Monthly subscription packages
- **bookings**: Daily bookings and attendance
- **payments**: Payment records and invoices
- **assessment_requests**: New dog assessment scheduling
- **capacity_config**: Daily capacity management

### Key Features:
- Automatic subscription day tracking
- Monthly reset with history archival
- Real-time booking updates
- Comprehensive audit logging
- Assessment day configuration
- Flexible pricing tiers

## Troubleshooting

### Common Issues:

1. **"relation does not exist" error**
   - Make sure you ran the entire schema.sql file
   - Check if all extensions are enabled

2. **Authentication not working**
   - Verify your anon key is correct
   - Check if email provider is enabled
   - Look for errors in Supabase logs

3. **Can't upload images**
   - Ensure storage buckets are created
   - Check storage policies are in place

4. **RLS policy violations**
   - Make user is properly authenticated
   - Review RLS policies for the table
   - Check user role permissions

## Production Deployment

Before going to production:

1. **Change email settings**:
   - Set up custom SMTP in Authentication > Settings
   - Configure proper email templates
   - Turn off auto-confirm emails

2. **Set up backups**:
   - Enable point-in-time recovery
   - Configure daily backups
   - Test restore procedure

3. **Monitor performance**:
   - Enable query performance insights
   - Set up error alerting
   - Monitor storage usage

4. **Secure your app**:
   - Enable CAPTCHA for sign-ups
   - Set up rate limiting
   - Configure allowed redirect URLs

## Support

For issues with:
- Database schema: Check `supabase/schema.sql`
- Helper functions: See `lib/database-helpers.ts`
- Supabase docs: https://supabase.com/docs
- This project: Create an issue on GitHub

## Next Steps

1. Complete the setup above
2. Run the app: `npm run dev`
3. Create test accounts for:
   - Client (sign up through the app)
   - Staff member (manually in database)
   - Admin (already created above)
4. Test the full flow:
   - Client signup
   - Dog registration
   - Assessment booking
   - Subscription purchase
   - Day booking
   - Check-in/out process

The system is now ready for development and testing!