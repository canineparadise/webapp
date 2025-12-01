-- ============================================
-- FULL SYSTEM CHECK - ALL TABLES
-- ============================================

-- STEP 1: Check RLS status on ALL tables
SELECT 'RLS STATUS' as section, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'dogs', 'subscriptions', 'bookings', 'assessment_bookings',
                    'individual_day_bookings', 'legal_agreements', 'refund_requests',
                    'discount_codes', 'discount_code_usage', 'admin_settings')
ORDER BY tablename;

-- STEP 2: Check policy counts per table
SELECT 'POLICY COUNT' as section, tablename, COUNT(*) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- STEP 3: Check for any policies using current_user_role (BAD)
SELECT 'BAD POLICIES (current_user_role)' as section, tablename, policyname
FROM pg_policies
WHERE qual::text LIKE '%current_user_role%';

-- STEP 4: Test critical tables with simple counts
SELECT 'TABLE COUNTS' as section,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM dogs) as dogs,
  (SELECT COUNT(*) FROM subscriptions) as subscriptions,
  (SELECT COUNT(*) FROM bookings) as bookings;

-- STEP 5: Test the JOIN that was failing
SELECT 'JOIN TEST' as section,
  d.id, d.name, p.first_name
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
LIMIT 3;

-- STEP 6: Check trigger status
SELECT 'TRIGGER STATUS' as section,
  tgname as trigger_name,
  CASE tgenabled WHEN 'O' THEN 'ENABLED' WHEN 'D' THEN 'DISABLED' ELSE tgenabled::text END as status
FROM pg_trigger pt
JOIN pg_class c ON pt.tgrelid = c.oid
WHERE c.relname = 'dogs'
  AND tgname NOT LIKE 'RI_%'
ORDER BY tgname;

-- STEP 7: Check foreign keys on dogs
SELECT 'DOGS FOREIGN KEYS' as section,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name as references_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'dogs' AND tc.constraint_type = 'FOREIGN KEY';

SELECT 'SYSTEM CHECK COMPLETE' as status;
