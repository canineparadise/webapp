-- ============================================
-- EMERGENCY FIX FOR DOGS TABLE RLS
-- ============================================
-- Completely disable RLS temporarily to diagnose the issue,
-- then re-enable with the absolute simplest possible policies

-- 1. TEMPORARILY DISABLE RLS TO CLEAR ANY ISSUES
-- ============================================
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;

-- 2. DROP ALL POLICIES
-- ============================================
DROP POLICY IF EXISTS "dogs_select_own" ON dogs;
DROP POLICY IF EXISTS "dogs_select_staff" ON dogs;
DROP POLICY IF EXISTS "dogs_insert_own" ON dogs;
DROP POLICY IF EXISTS "dogs_update_own" ON dogs;
DROP POLICY IF EXISTS "dogs_delete_own" ON dogs;
DROP POLICY IF EXISTS "dogs_update_staff" ON dogs;
DROP POLICY IF EXISTS "dogs_insert_admin" ON dogs;
DROP POLICY IF EXISTS "dogs_delete_admin" ON dogs;

-- 3. RE-ENABLE RLS
-- ============================================
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

-- 4. CREATE THE ABSOLUTE SIMPLEST POLICIES POSSIBLE
-- ============================================

-- For now, let's just allow all authenticated users to SELECT
-- This will at least get the dashboard working while we debug
CREATE POLICY "dogs_allow_select_all"
ON dogs FOR SELECT
TO authenticated
USING (true);

-- Allow users to manage their own dogs
CREATE POLICY "dogs_allow_insert_own"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "dogs_allow_update_own"
ON dogs FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "dogs_allow_delete_own"
ON dogs FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- 5. TEST QUERY
-- ============================================
-- Run this to test if the policies work
SELECT COUNT(*) as total_dogs FROM dogs;

-- 6. VERIFY POLICIES
-- ============================================
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'dogs'
ORDER BY policyname;
