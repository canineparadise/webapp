-- ============================================
-- CHECK TABLE COLUMNS SCRIPT
-- ============================================
-- This script will show you the exact column names
-- for all the tables we need to modify
-- ============================================

-- Check BOOKINGS table columns
SELECT
  'BOOKINGS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Separator
SELECT '---' as separator, '---' as column_name, '---' as data_type, '---' as is_nullable;

-- Check SUBSCRIPTIONS table columns
SELECT
  'SUBSCRIPTIONS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Separator
SELECT '---' as separator, '---' as column_name, '---' as data_type, '---' as is_nullable;

-- Check LEGAL_AGREEMENTS table columns
SELECT
  'LEGAL_AGREEMENTS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'legal_agreements'
ORDER BY ordinal_position;

-- Separator
SELECT '---' as separator, '---' as column_name, '---' as data_type, '---' as is_nullable;

-- Check PROFILES table columns
SELECT
  'PROFILES TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Separator
SELECT '---' as separator, '---' as column_name, '---' as data_type, '---' as is_nullable;

-- Check what ENUMS exist
SELECT
  'EXISTING ENUMS' as enum_name,
  typname as actual_enum_name,
  '-' as unused1,
  '-' as unused2
FROM pg_type
WHERE typtype = 'e'
  AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY typname;
