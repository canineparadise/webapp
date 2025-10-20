-- ============================================
-- COMPLETE DATABASE AUDIT
-- ============================================

-- 1. List all tables
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check for missing expected tables
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN '✅ profiles'
    ELSE '❌ profiles - MISSING'
  END as profiles_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dogs') THEN '✅ dogs'
    ELSE '❌ dogs - MISSING'
  END as dogs_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN '✅ bookings'
    ELSE '❌ bookings - MISSING'
  END as bookings_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN '✅ subscriptions'
    ELSE '❌ subscriptions - MISSING'
  END as subscriptions_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_tiers') THEN '✅ subscription_tiers'
    ELSE '❌ subscription_tiers - MISSING'
  END as subscription_tiers_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legal_agreements') THEN '✅ legal_agreements'
    ELSE '❌ legal_agreements - MISSING'
  END as legal_agreements_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roll_calls') THEN '✅ roll_calls'
    ELSE '❌ roll_calls - MISSING'
  END as roll_calls_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sections') THEN '✅ sections'
    ELSE '❌ sections - MISSING'
  END as sections_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'staff_assignments') THEN '✅ staff_assignments'
    ELSE '❌ staff_assignments - MISSING'
  END as staff_assignments_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'staff_tasks') THEN '✅ staff_tasks'
    ELSE '❌ staff_tasks - MISSING'
  END as staff_tasks_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN '✅ incidents'
    ELSE '❌ incidents - MISSING'
  END as incidents_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dog_medications') THEN '✅ dog_medications'
    ELSE '❌ dog_medications - MISSING'
  END as medications_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assessments') THEN '✅ assessments'
    ELSE '❌ assessments - MISSING'
  END as assessments_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assessment_time_slots') THEN '✅ assessment_time_slots'
    ELSE '❌ assessment_time_slots - MISSING'
  END as assessment_slots_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assessment_recurring_slots') THEN '✅ assessment_recurring_slots'
    ELSE '❌ assessment_recurring_slots - MISSING'
  END as recurring_slots_status;

-- 3. Count records in each table
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'dogs', COUNT(*) FROM dogs
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'subscription_tiers', COUNT(*) FROM subscription_tiers
UNION ALL
SELECT 'legal_agreements', COUNT(*) FROM legal_agreements
UNION ALL
SELECT 'roll_calls', COUNT(*) FROM roll_calls
UNION ALL
SELECT 'sections', COUNT(*) FROM sections
UNION ALL
SELECT 'staff_assignments', COUNT(*) FROM staff_assignments
UNION ALL
SELECT 'staff_tasks', COUNT(*) FROM staff_tasks
UNION ALL
SELECT 'incidents', COUNT(*) FROM incidents
UNION ALL
SELECT 'dog_medications', COUNT(*) FROM dog_medications
UNION ALL
SELECT 'assessments', COUNT(*) FROM assessments
UNION ALL
SELECT 'assessment_time_slots', COUNT(*) FROM assessment_time_slots
UNION ALL
SELECT 'assessment_recurring_slots', COUNT(*) FROM assessment_recurring_slots
ORDER BY table_name;

-- 4. Check RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS DISABLED - SECURITY RISK!'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Check for foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema='public'
ORDER BY tc.table_name, kcu.column_name;

-- 6. Check for missing indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. Check user roles distribution
SELECT
  role,
  COUNT(*) as user_count,
  COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN approval_status = 'declined' THEN 1 END) as declined_count
FROM profiles
GROUP BY role
ORDER BY role;

-- 8. Check for orphaned records (dogs without owners)
SELECT
  d.id,
  d.name,
  d.owner_id,
  'Orphaned dog - owner does not exist' as issue
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
WHERE p.id IS NULL;

-- 9. Check for bookings without dogs
SELECT
  b.id,
  b.booking_date,
  b.dog_ids,
  'Booking with invalid dog IDs' as issue
FROM bookings b
WHERE b.dog_ids IS NULL OR array_length(b.dog_ids, 1) = 0;

-- 10. Check for subscriptions without valid tiers
SELECT
  s.id,
  s.tier_id,
  'Subscription references non-existent tier' as issue
FROM subscriptions s
LEFT JOIN subscription_tiers st ON s.tier_id = st.id
WHERE st.id IS NULL;
