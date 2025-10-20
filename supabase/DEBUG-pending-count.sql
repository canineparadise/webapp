-- Check what's being counted as "pending"

-- 1. Dogs awaiting approval (completed assessment but not approved)
SELECT
  'Dogs Pending Approval' as type,
  COUNT(*) as count
FROM dogs
WHERE is_approved = false
  AND assessment_completed = true;

-- Show the actual dogs
SELECT
  id,
  name,
  owner_id,
  is_approved,
  assessment_completed,
  assessment_date
FROM dogs
WHERE is_approved = false
  AND assessment_completed = true;

-- 2. User accounts with pending approval status
SELECT
  'Users Pending Approval' as type,
  COUNT(*) as count
FROM profiles
WHERE role = 'user'
  AND approval_status = 'pending';

-- Show the actual users
SELECT
  id,
  first_name,
  last_name,
  email,
  approval_status,
  role
FROM profiles
WHERE role = 'user'
  AND approval_status = 'pending';

-- 3. Check assessment bookings that are pending
SELECT
  'Assessment Bookings Pending' as type,
  COUNT(DISTINCT user_id) as count
FROM assessment_bookings
WHERE booking_status = 'pending';
