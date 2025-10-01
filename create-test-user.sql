-- ============================================
-- CREATE TEST USER
-- ============================================
-- NOTE: This creates a user directly in the auth.users table
-- Run this in Supabase SQL Editor after running the main schema

-- Create test user with confirmed email
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@canine.com',
  crypt('TestPassword123!', gen_salt('bf')), -- Password: TestPassword123!
  NOW(), -- Email confirmed
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- The profile will be automatically created by the trigger we set up!

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the user was created:
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'test@canine.com';

-- Check if profile was auto-created:
SELECT id, email, first_name, last_name
FROM profiles
WHERE email = 'test@canine.com';
