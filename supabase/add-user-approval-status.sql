-- =====================================================
-- ADD USER APPROVAL STATUS SYSTEM
-- =====================================================
-- This migration adds an approval workflow for users
-- Users must be approved by staff after assessment day
-- before they can subscribe to daycare services
-- =====================================================

-- 1. Create approval status enum
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Add approval columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- 3. Add index for quick filtering of pending approvals
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);

-- 4. Create function to approve user
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
  FROM users
  WHERE id = p_staff_id;

  IF v_staff_role NOT IN ('staff', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only staff and admin can approve users'
    );
  END IF;

  -- Update user approval status
  UPDATE users
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

-- 5. Create function to reject user
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
  FROM users
  WHERE id = p_staff_id;

  IF v_staff_role NOT IN ('staff', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only staff and admin can reject users'
    );
  END IF;

  -- Update user approval status
  UPDATE users
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

-- 6. Create view for pending approvals (staff use)
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
FROM users u
LEFT JOIN dogs d ON d.user_id = u.id
LEFT JOIN bookings b ON b.user_id = u.id
WHERE u.role = 'user'
GROUP BY u.id, u.email, u.full_name, u.phone, u.created_at, u.approval_status
ORDER BY u.created_at DESC;

-- 7. Grant permissions
GRANT SELECT ON pending_user_approvals TO authenticated;

-- 8. Set existing users to approved (grandfather them in)
UPDATE users
SET approval_status = 'approved'
WHERE role = 'user' AND approval_status IS NULL;

-- 9. Ensure staff and admin are always approved
UPDATE users
SET approval_status = 'approved'
WHERE role IN ('staff', 'admin');

COMMENT ON COLUMN users.approval_status IS 'User approval status after assessment day: pending, approved, or rejected';
COMMENT ON COLUMN users.approved_by IS 'Staff/admin user who approved/rejected this user';
COMMENT ON COLUMN users.approved_at IS 'Timestamp of approval/rejection';
COMMENT ON COLUMN users.approval_notes IS 'Notes from staff about approval decision';
