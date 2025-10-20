-- ============================================
-- INSPECT TABLES FOR TEST DATA GENERATION
-- ============================================
-- Run this entire script to see all table structures needed for test data

-- 1. PROFILES TABLE
SELECT 'PROFILES TABLE STRUCTURE' AS table_name;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Show sample profile if exists
SELECT 'SAMPLE PROFILE DATA' AS info;
SELECT * FROM profiles LIMIT 1;

-- 2. DOGS TABLE
SELECT 'DOGS TABLE STRUCTURE' AS table_name;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'dogs'
ORDER BY ordinal_position;

-- Show sample dog if exists
SELECT 'SAMPLE DOG DATA' AS info;
SELECT * FROM dogs LIMIT 1;

-- 3. BOOKINGS TABLE (we already know this one but let's confirm new columns added)
SELECT 'BOOKINGS TABLE STRUCTURE (UPDATED)' AS table_name;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- 4. SUBSCRIPTIONS TABLE (we already know this one but let's confirm new columns added)
SELECT 'SUBSCRIPTIONS TABLE STRUCTURE (UPDATED)' AS table_name;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 5. Check if there are any existing users/profiles we can use
SELECT 'EXISTING PROFILES COUNT' AS info;
SELECT COUNT(*) as total_profiles FROM profiles;

SELECT 'EXISTING DOGS COUNT' AS info;
SELECT COUNT(*) as total_dogs FROM dogs;

SELECT 'EXISTING BOOKINGS COUNT' AS info;
SELECT COUNT(*) as total_bookings FROM bookings;

SELECT 'EXISTING SUBSCRIPTIONS COUNT' AS info;
SELECT COUNT(*) as total_subscriptions FROM subscriptions;
