-- ============================================
-- FIX DOGS TABLE RLS POLICIES
-- ============================================
-- The dogs table is still throwing 500 errors
-- This is likely due to conflicting or recursive RLS policies

-- 1. DROP ALL EXISTING DOGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "dogs_select_own" ON dogs;
DROP POLICY IF EXISTS "dogs_select_staff" ON dogs;
DROP POLICY IF EXISTS "Admin: Full access to dogs" ON dogs;
DROP POLICY IF EXISTS "Users can delete own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can insert own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can update own dogs" ON dogs;
DROP POLICY IF EXISTS "Authenticated users can view dogs" ON dogs;
DROP POLICY IF EXISTS "Staff: View all dogs" ON dogs;
DROP POLICY IF EXISTS "Staff: Update dogs" ON dogs;
DROP POLICY IF EXISTS "Users: Insert own dogs" ON dogs;
DROP POLICY IF EXISTS "Users: Update own dogs" ON dogs;
DROP POLICY IF EXISTS "Users: View own dogs" ON dogs;

-- 2. CREATE CLEAN, NON-RECURSIVE POLICIES
-- ============================================

-- Allow users to view their own dogs
CREATE POLICY "dogs_select_own"
ON dogs FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Allow staff/admin to view all dogs (using the helper function to avoid recursion)
CREATE POLICY "dogs_select_staff"
ON dogs FOR SELECT
TO authenticated
USING (current_user_role() IN ('admin', 'staff'));

-- Allow users to insert their own dogs
CREATE POLICY "dogs_insert_own"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Allow users to update their own dogs
CREATE POLICY "dogs_update_own"
ON dogs FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Allow users to delete their own dogs
CREATE POLICY "dogs_delete_own"
ON dogs FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Allow staff to update dogs (for approval, notes, etc.)
CREATE POLICY "dogs_update_staff"
ON dogs FOR UPDATE
TO authenticated
USING (current_user_role() IN ('admin', 'staff'))
WITH CHECK (current_user_role() IN ('admin', 'staff'));

-- Allow admin to insert dogs (for testing, etc.)
CREATE POLICY "dogs_insert_admin"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (current_user_role() = 'admin');

-- Allow admin to delete dogs
CREATE POLICY "dogs_delete_admin"
ON dogs FOR DELETE
TO authenticated
USING (current_user_role() = 'admin');

-- 3. VERIFY POLICIES
-- ============================================
SELECT
  policyname,
  cmd as command,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'dogs'
ORDER BY policyname;
