-- ============================================
-- DELETE ALL DATA EXCEPT STAFF AND ADMIN
-- ============================================
-- This will remove all client/user data but preserve staff/admin accounts
-- ============================================

-- Step 1: Show current staff/admin accounts (to preserve)
SELECT 'STAFF/ADMIN ACCOUNTS TO PRESERVE:' AS info;
SELECT id, email, first_name, last_name, role
FROM profiles
WHERE role IN ('admin', 'staff')
ORDER BY role, email;

-- Step 2: Show client accounts that will be deleted
SELECT 'CLIENT ACCOUNTS TO DELETE:' AS info;
SELECT id, email, first_name, last_name, role
FROM profiles
WHERE role NOT IN ('admin', 'staff') OR role IS NULL
ORDER BY email;

-- Step 3: Delete all bookings for non-staff/admin users
DELETE FROM bookings
WHERE user_id IN (
  SELECT id FROM profiles WHERE role NOT IN ('admin', 'staff') OR role IS NULL
);

-- Step 4: Delete all subscriptions for non-staff/admin users
DELETE FROM subscriptions
WHERE user_id IN (
  SELECT id FROM profiles WHERE role NOT IN ('admin', 'staff') OR role IS NULL
);

-- Step 5: Delete all dogs for non-staff/admin users
DELETE FROM dogs
WHERE owner_id IN (
  SELECT id FROM profiles WHERE role NOT IN ('admin', 'staff') OR role IS NULL
);

-- Step 6: Delete all legal agreements for non-staff/admin users
DELETE FROM legal_agreements
WHERE user_id IN (
  SELECT id FROM profiles WHERE role NOT IN ('admin', 'staff') OR role IS NULL
);

-- Step 7: Delete profiles for non-staff/admin users
DELETE FROM profiles
WHERE role NOT IN ('admin', 'staff') OR role IS NULL;

-- Step 8: Delete auth users that no longer have profiles (orphaned auth users)
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Step 9: Verify what remains
SELECT 'REMAINING STAFF/ADMIN:' AS info;
SELECT id, email, first_name, last_name, role
FROM profiles
WHERE role IN ('admin', 'staff')
ORDER BY role, email;

SELECT 'VERIFICATION COUNTS:' AS info;
SELECT
  (SELECT COUNT(*) FROM profiles WHERE role IN ('admin', 'staff')) as staff_admin_count,
  (SELECT COUNT(*) FROM profiles WHERE role NOT IN ('admin', 'staff') OR role IS NULL) as client_count,
  (SELECT COUNT(*) FROM dogs) as remaining_dogs,
  (SELECT COUNT(*) FROM bookings) as remaining_bookings,
  (SELECT COUNT(*) FROM subscriptions) as remaining_subscriptions,
  (SELECT COUNT(*) FROM legal_agreements) as remaining_legal_agreements;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All client data deleted!';
  RAISE NOTICE '✅ Staff and admin accounts preserved';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Database is ready for fresh testing';
  RAISE NOTICE '  - Staff/Admin accounts remain intact';
  RAISE NOTICE '  - All client accounts, dogs, bookings, subscriptions removed';
END $$;
