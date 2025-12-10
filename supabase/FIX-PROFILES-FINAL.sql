-- ============================================
-- FINAL FIX FOR PROFILES - SIMPLE APPROACH
-- ============================================
-- The issue: during login, the profile query is returning NULL
-- because the RLS policy isn't allowing the SELECT

-- Drop ALL existing profile policies
DROP POLICY IF EXISTS "profiles_access" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;

-- SIMPLE POLICY: Authenticated users can read ALL profiles
-- This is safe because profiles only contain names, not sensitive data
-- And it's needed for staff to see customer names, etc.
CREATE POLICY "profiles_read_all" ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can only UPDATE their own profile
CREATE POLICY "profiles_update_own" ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Users can only INSERT their own profile (for signup)
CREATE POLICY "profiles_insert_own" ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Verify
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
