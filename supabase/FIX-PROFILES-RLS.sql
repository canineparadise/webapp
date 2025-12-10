-- ============================================
-- FIX PROFILES RLS - SELF-REFERENCE ISSUE
-- ============================================
-- The profiles policy was checking profiles table to see if user is admin
-- but this creates a circular reference during login

DROP POLICY IF EXISTS "profiles_access" ON profiles;

-- Users can ALWAYS read their own profile (no subquery needed)
-- Staff/Admin can read all profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()  -- User can always see their own profile
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'staff')
  )
);

-- Users can only update their own profile
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Users can only insert their own profile
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Verify
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
