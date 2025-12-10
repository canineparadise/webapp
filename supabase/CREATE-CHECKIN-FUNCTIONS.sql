-- ============================================
-- CREATE CHECK-IN/CHECK-OUT FUNCTIONS
-- ============================================

-- First, ensure the columns exist on bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_out BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_in_by UUID,
ADD COLUMN IF NOT EXISTS checked_out_by UUID,
ADD COLUMN IF NOT EXISTS staff_notes TEXT;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS check_in_dog(UUID, UUID);
DROP FUNCTION IF EXISTS check_out_dog(UUID, UUID, TEXT);

-- Create check-in function
CREATE OR REPLACE FUNCTION check_in_dog(
  p_booking_id UUID,
  p_staff_id UUID
)
RETURNS JSON AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Get booking
  SELECT * INTO booking_record FROM bookings WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF booking_record.checked_in THEN
    RETURN json_build_object('success', false, 'error', 'Already checked in');
  END IF;

  -- Update booking
  UPDATE bookings SET
    checked_in = true,
    checked_in_at = NOW(),
    checked_in_by = p_staff_id,
    status = 'checked_in'
  WHERE id = p_booking_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Dog(s) checked in successfully',
    'checked_in_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create check-out function
CREATE OR REPLACE FUNCTION check_out_dog(
  p_booking_id UUID,
  p_staff_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Get booking
  SELECT * INTO booking_record FROM bookings WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF NOT booking_record.checked_in THEN
    RETURN json_build_object('success', false, 'error', 'Dog not checked in yet');
  END IF;

  IF booking_record.checked_out THEN
    RETURN json_build_object('success', false, 'error', 'Already checked out');
  END IF;

  -- Update booking
  UPDATE bookings SET
    checked_out = true,
    checked_out_at = NOW(),
    checked_out_by = p_staff_id,
    staff_notes = COALESCE(p_notes, staff_notes),
    status = 'completed'
  WHERE id = p_booking_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Dog(s) checked out successfully',
    'checked_out_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_in_dog(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_out_dog(UUID, UUID, TEXT) TO authenticated;

-- Verify functions were created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('check_in_dog', 'check_out_dog')
AND routine_schema = 'public';
