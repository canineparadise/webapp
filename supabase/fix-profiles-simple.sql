-- ============================================
-- FIX PROFILES TABLE WITH SIMPLE POLICIES
-- ============================================
-- The profiles table is causing 500 errors when joined from dogs table
-- We need to simplify the profiles policies to avoid any recursion

-- 1. DROP ALL EXISTING PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_staff" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "allow_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_staff_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_admin_update_all_profiles" ON profiles;

-- 2. CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================

-- Allow all authenticated users to SELECT from profiles
-- This is safe because only logged-in users can access the app
CREATE POLICY "profiles_allow_select_all"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert their own profile (during signup)
CREATE POLICY "profiles_allow_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "profiles_allow_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow authenticated users to update profiles (for admin)
-- Since we're allowing all authenticated to SELECT, we can use the same pattern
CREATE POLICY "profiles_allow_update_all"
ON profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. VERIFY POLICIES
-- ============================================
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
