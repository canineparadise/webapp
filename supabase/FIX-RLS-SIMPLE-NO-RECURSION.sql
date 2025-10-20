-- SIMPLEST POSSIBLE RLS - NO RECURSION
-- Just allow authenticated users to do everything with profiles
-- We'll handle permissions in the application code

-- 1. Drop ALL policies on profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- 2. Create ULTRA SIMPLE policies - no recursion possible
-- Allow all authenticated users to read all profiles
CREATE POLICY "allow_read_profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "allow_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "allow_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow public insert for signup
CREATE POLICY "allow_public_insert"
ON profiles FOR INSERT
TO public
WITH CHECK (true);

-- Verify - should only have 4 simple policies now
SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;
