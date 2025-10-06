-- =====================================================
-- ADD USER APPROVAL STATUS SYSTEM (FINAL CORRECT VERSION)
-- =====================================================
-- This migration adds an approval workflow for users
-- Users must be approved by staff after assessment day
-- before they can subscribe to daycare services
-- =====================================================

-- 1. Add approval columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- 2. Add index for quick filtering of pending approvals
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);

-- 3. Create function to approve user
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
BEGIN
  -- Check if approver is staff or admin
  SELECT role INTO v_staff_role
  FROM profiles
  WHERE id = p_staff_id;

  IF v_staff_role NOT IN ('staff', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only staff and admin can approve users'
    );
  END IF;

  -- Update user approval status
  UPDATE profiles
  SET
    approval_status = 'approved',
    approved_by = p_staff_id,
    approved_at = NOW(),
    approval_notes = p_notes
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'User approved successfully'
  );
END;
$$;

-- 4. Create function to reject user
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
BEGIN
  -- Check if rejector is staff or admin
  SELECT role INTO v_staff_role
  FROM profiles
  WHERE id = p_staff_id;

  IF v_staff_role NOT IN ('staff', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only staff and admin can reject users'
    );
  END IF;

  -- Update user approval status
  UPDATE profiles
  SET
    approval_status = 'rejected',
    approved_by = p_staff_id,
    approved_at = NOW(),
    approval_notes = p_notes
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'User rejected'
  );
END;
$$;

-- 5. Create view for pending approvals (staff use)
-- Note: profiles has first_name and last_name (not full_name)
-- Note: dogs uses owner_id, bookings uses user_id
CREATE OR REPLACE VIEW pending_user_approvals AS
SELECT
  p.id,
  p.email,
  COALESCE(p.first_name || ' ' || p.last_name, p.first_name, p.last_name, 'No name') as full_name,
  p.phone,
  p.created_at,
  p.approval_status,
  COUNT(DISTINCT d.id) as num_dogs,
  COUNT(DISTINCT b.id) as num_bookings,
  MAX(b.booking_date) as latest_booking_date
FROM profiles p
LEFT JOIN dogs d ON d.owner_id = p.id
LEFT JOIN bookings b ON b.user_id = p.id
WHERE p.role = 'user'
GROUP BY p.id, p.email, p.first_name, p.last_name, p.phone, p.created_at, p.approval_status
ORDER BY p.created_at DESC;

-- 6. Grant permissions
GRANT SELECT ON pending_user_approvals TO authenticated;

-- 7. Set existing users to approved (grandfather them in)
UPDATE profiles
SET approval_status = 'approved'
WHERE role = 'user' AND (approval_status IS NULL OR approval_status = 'pending');

-- 8. Ensure staff and admin are always approved
UPDATE profiles
SET approval_status = 'approved'
WHERE role IN ('staff', 'admin');

-- 9. Add comments
COMMENT ON COLUMN profiles.approval_status IS 'User approval status after assessment day: pending, approved, or rejected';
COMMENT ON COLUMN profiles.approved_by IS 'Staff/admin user ID who approved/rejected this user';
COMMENT ON COLUMN profiles.approved_at IS 'Timestamp of approval/rejection';
COMMENT ON COLUMN profiles.approval_notes IS 'Notes from staff about approval decision';
