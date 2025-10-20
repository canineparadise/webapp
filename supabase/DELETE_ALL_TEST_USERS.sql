-- ============================================
-- DELETE ALL TEST USERS - CLEAN SLATE
-- ============================================
-- This will remove ALL users from the system
-- Use with caution - only for resetting test data
-- ============================================

-- Show what will be deleted
SELECT 'USERS TO BE DELETED:' AS info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Delete all related data first (respects foreign keys)
DELETE FROM bookings;
DELETE FROM subscriptions;
DELETE FROM dogs;
DELETE FROM legal_agreements;
DELETE FROM profiles;

-- Delete auth users (this will cascade to profiles if foreign key is set)
DELETE FROM auth.users;

-- Verify deletion
SELECT 'REMAINING USERS:' AS info;
SELECT COUNT(*) as remaining_users FROM auth.users;

SELECT 'REMAINING PROFILES:' AS info;
SELECT COUNT(*) as remaining_profiles FROM profiles;

SELECT 'REMAINING DOGS:' AS info;
SELECT COUNT(*) as remaining_dogs FROM dogs;

SELECT 'REMAINING BOOKINGS:' AS info;
SELECT COUNT(*) as remaining_bookings FROM bookings;

SELECT 'REMAINING SUBSCRIPTIONS:' AS info;
SELECT COUNT(*) as remaining_subscriptions FROM subscriptions;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All test users and data deleted!';
  RAISE NOTICE '✅ System is clean and ready for production';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '  1. Test signup with a real email address';
  RAISE NOTICE '  2. Check that verification email arrives';
  RAISE NOTICE '  3. Verify email and login';
END $$;
