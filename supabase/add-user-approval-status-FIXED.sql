-- =====================================================
-- ADD USER APPROVAL STATUS SYSTEM (FIXED FOR SUPABASE AUTH)
-- =====================================================
-- This migration adds an approval workflow for users
-- Users must be approved by staff after assessment day
-- before they can subscribe to daycare services
-- =====================================================

-- First, check if we have a public.users table or need to create profiles table
-- If you're using Supabase Auth, user data is in auth.users
-- We need a public table to store additional user metadata

-- 1. Create user_profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  approval_status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. If you already have a users table, add the approval columns
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    -- Add approval columns to existing users table
    ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_notes TEXT;

    -- Add index for quick filtering
    CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);

    -- Set existing users to approved
    UPDATE users SET approval_status = 'approved' WHERE approval_status IS NULL OR approval_status = 'pending';
    UPDATE users SET approval_status = 'approved' WHERE role IN ('staff', 'admin');
  END IF;
END $$;

-- 3. Enable RLS on user_profiles if it exists
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can view all profiles" ON user_profiles;
CREATE POLICY "Staff can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('staff', 'admin')
    )
  );

-- 5. Create function to approve user (works with either users or user_profiles)
CREATE OR REPLACE FUNCTION approve_user(
  p_user_id UUID,
  p_staff_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_staff_role TEXT;
  v_table_name TEXT;
BEGIN
  -- Check which table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    v_table_name := 'users';
  ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    v_table_name := 'user_profiles';
  ELSE
    RETURN json_build_object('success', false, 'error', 'No user table found');
  END IF;

  -- Check if approver is staff or admin
  EXECUTE format('SELECT role FROM %I WHERE id = $1', v_table_name) INTO v_staff_role USING p_staff_id;

  IF v_staff_role NOT IN ('staff', 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Only staff and admin can approve users');
  END IF;

  -- Update user approval status
  EXECUTE format(
    'UPDATE %I SET approval_status = $1, approved_by = $2, approved_at = NOW(), approval_notes = $3 WHERE id = $4',
    v_table_name
  ) USING 'approved', p_staff_id, p_notes, p_user_id;

  RETURN json_build_object('success', true, 'message', 'User approved successfully');
END;
$$;

-- 6. Create function to reject user
CREATE OR REPLACE FUNCTION reject_user(
  p_user_id UUID,
  p_staff_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_staff_role TEXT;
  v_table_name TEXT;
BEGIN
  -- Check which table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    v_table_name := 'users';
  ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    v_table_name := 'user_profiles';
  ELSE
    RETURN json_build_object('success', false, 'error', 'No user table found');
  END IF;

  -- Check if rejector is staff or admin
  EXECUTE format('SELECT role FROM %I WHERE id = $1', v_table_name) INTO v_staff_role USING p_staff_id;

  IF v_staff_role NOT IN ('staff', 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Only staff and admin can reject users');
  END IF;

  -- Update user approval status
  EXECUTE format(
    'UPDATE %I SET approval_status = $1, approved_by = $2, approved_at = NOW(), approval_notes = $3 WHERE id = $4',
    v_table_name
  ) USING 'rejected', p_staff_id, p_notes, p_user_id;

  RETURN json_build_object('success', true, 'message', 'User rejected');
END;
$$;

-- 7. Create view for pending approvals (works with either table)
CREATE OR REPLACE VIEW pending_user_approvals AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.created_at,
  u.approval_status,
  COUNT(DISTINCT d.id) as num_dogs,
  COUNT(DISTINCT b.id) as num_bookings,
  MAX(b.booking_date) as latest_booking_date
FROM (
  SELECT id, email, full_name, phone, created_at, approval_status
  FROM users WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
  UNION ALL
  SELECT id, email, full_name, phone, created_at, approval_status
  FROM user_profiles WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
) u
LEFT JOIN dogs d ON d.user_id = u.id
LEFT JOIN bookings b ON b.user_id = u.id
GROUP BY u.id, u.email, u.full_name, u.phone, u.created_at, u.approval_status
ORDER BY u.created_at DESC;

-- 8. Grant permissions
GRANT SELECT ON pending_user_approvals TO authenticated;
GRANT ALL ON user_profiles TO authenticated;

COMMENT ON TABLE user_profiles IS 'Extended user profile data including approval status';
COMMENT ON COLUMN user_profiles.approval_status IS 'User approval status: pending, approved, or rejected';
