-- ============================================
-- MANUALLY CONFIRM ALL EXISTING USERS
-- ============================================
-- This will mark all users as email_confirmed
-- Run this after disabling email confirmation requirement
-- ============================================

-- Update all users to be confirmed
-- Note: confirmed_at is auto-generated, only set email_confirmed_at
UPDATE auth.users
SET
  email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Show results
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not Confirmed'
  END AS status
FROM auth.users
ORDER BY created_at DESC;
