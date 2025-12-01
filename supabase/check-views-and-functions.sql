-- ============================================
-- CHECK FOR VIEWS AND FUNCTIONS ON DOGS
-- ============================================

-- Check if 'dogs' is actually a view
SELECT
  'TABLE TYPE' as info,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'dogs';

-- Check for any views that reference dogs
SELECT
  'VIEWS REFERENCING DOGS' as info,
  viewname
FROM pg_views
WHERE definition LIKE '%dogs%';

-- Check RLS status again
SELECT
  'RLS STATUS' as info,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('dogs', 'profiles');

-- Check if there are any rules on dogs table
SELECT
  'RULES ON DOGS' as info,
  rulename,
  ev_type
FROM pg_rules
WHERE tablename = 'dogs';

-- Check for any indexes that might be slow
SELECT
  'INDEXES ON DOGS' as info,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'dogs';

-- Simple count test
SELECT 'DOG COUNT' as info, COUNT(*)::text as count FROM dogs;
