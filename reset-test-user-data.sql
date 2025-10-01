-- ============================================
-- RESET TEST USER DATA
-- This clears all data for test@canine.com but keeps the login
-- Run this in Supabase SQL Editor
-- ============================================

-- Get the test user ID
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Find test user
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@canine.com';

  IF test_user_id IS NOT NULL THEN
    -- Delete in correct order (respecting foreign keys)

    -- 1. Delete documents (references dogs)
    DELETE FROM documents WHERE dog_id IN (
      SELECT id FROM dogs WHERE owner_id = test_user_id
    );

    -- 2. Delete bookings (references dogs, subscriptions, profiles)
    DELETE FROM bookings WHERE user_id = test_user_id;

    -- 3. Delete assessment schedule (references dogs, profiles)
    DELETE FROM assessment_schedule WHERE user_id = test_user_id;

    -- 4. Delete dogs (references profiles)
    DELETE FROM dogs WHERE owner_id = test_user_id;

    -- 5. Delete subscriptions (references profiles)
    DELETE FROM subscriptions WHERE user_id = test_user_id;

    -- 6. Delete legal agreements (references profiles)
    DELETE FROM legal_agreements WHERE user_id = test_user_id;

    -- 7. Clear profile data but keep the profile row (so it doesn't error)
    UPDATE profiles SET
      first_name = NULL,
      last_name = NULL,
      phone = NULL,
      address = NULL,
      city = NULL,
      postcode = NULL,
      emergency_contact_name = NULL,
      emergency_contact_phone = NULL,
      has_dogs = FALSE,
      updated_at = NOW()
    WHERE id = test_user_id;

    RAISE NOTICE 'Test user data cleared successfully for user: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user not found';
  END IF;
END $$;

-- Verify what's left
SELECT
  'Profiles' as table_name,
  COUNT(*) as count
FROM profiles
WHERE email = 'test@canine.com'

UNION ALL

SELECT
  'Dogs' as table_name,
  COUNT(*) as count
FROM dogs
WHERE owner_id IN (SELECT id FROM profiles WHERE email = 'test@canine.com')

UNION ALL

SELECT
  'Legal Agreements' as table_name,
  COUNT(*) as count
FROM legal_agreements
WHERE user_id IN (SELECT id FROM profiles WHERE email = 'test@canine.com')

UNION ALL

SELECT
  'Subscriptions' as table_name,
  COUNT(*) as count
FROM subscriptions
WHERE user_id IN (SELECT id FROM profiles WHERE email = 'test@canine.com')

UNION ALL

SELECT
  'Bookings' as table_name,
  COUNT(*) as count
FROM bookings
WHERE user_id IN (SELECT id FROM profiles WHERE email = 'test@canine.com')

UNION ALL

SELECT
  'Assessments' as table_name,
  COUNT(*) as count
FROM assessment_schedule
WHERE user_id IN (SELECT id FROM profiles WHERE email = 'test@canine.com');

-- Should show:
-- Profiles: 1 (empty profile exists)
-- Everything else: 0
