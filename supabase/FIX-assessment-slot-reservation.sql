-- Fix assessment slot double-booking by adding reservation system
-- This prevents race conditions where two users could book the same slot

-- 1. Add pending_until column to track temporary reservations
ALTER TABLE assessment_slots
ADD COLUMN IF NOT EXISTS pending_until TIMESTAMPTZ DEFAULT NULL;

-- 2. Add comment explaining the column
COMMENT ON COLUMN assessment_slots.pending_until IS 'If set, the slot is temporarily reserved until this time. After this time, the reservation expires and can be cleared.';

-- 3. Create function to release expired reservations
CREATE OR REPLACE FUNCTION release_expired_assessment_reservations()
RETURNS INTEGER AS $$
DECLARE
  released_count INTEGER;
BEGIN
  UPDATE assessment_slots
  SET
    is_available = true,
    booked_by_user_id = NULL,
    pending_until = NULL
  WHERE
    pending_until IS NOT NULL
    AND pending_until < NOW()
    AND NOT EXISTS (
      -- Don't release if there's a confirmed booking
      SELECT 1 FROM assessment_bookings
      WHERE assessment_bookings.slot_id = assessment_slots.id
      AND assessment_bookings.booking_status = 'confirmed'
    );

  GET DIAGNOSTICS released_count = ROW_COUNT;
  RETURN released_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to reserve a slot (returns true if successful)
CREATE OR REPLACE FUNCTION reserve_assessment_slot(
  p_slot_id UUID,
  p_user_id UUID,
  p_reservation_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := false;
BEGIN
  -- First, release any expired reservations for this slot
  UPDATE assessment_slots
  SET
    is_available = true,
    booked_by_user_id = NULL,
    pending_until = NULL
  WHERE
    id = p_slot_id
    AND pending_until IS NOT NULL
    AND pending_until < NOW()
    AND NOT EXISTS (
      SELECT 1 FROM assessment_bookings
      WHERE assessment_bookings.slot_id = p_slot_id
      AND assessment_bookings.booking_status = 'confirmed'
    );

  -- Try to reserve the slot (only if still available)
  UPDATE assessment_slots
  SET
    is_available = false,
    booked_by_user_id = p_user_id,
    pending_until = NOW() + (p_reservation_minutes || ' minutes')::INTERVAL
  WHERE
    id = p_slot_id
    AND is_available = true
    AND (booked_by_user_id IS NULL OR booked_by_user_id = p_user_id);

  IF FOUND THEN
    v_success := true;
  END IF;

  RETURN v_success;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to confirm a reservation (called after successful payment)
CREATE OR REPLACE FUNCTION confirm_assessment_slot_reservation(
  p_slot_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := false;
BEGIN
  -- Confirm the reservation by clearing pending_until (keeps is_available = false and booked_by_user_id)
  UPDATE assessment_slots
  SET pending_until = NULL
  WHERE
    id = p_slot_id
    AND booked_by_user_id = p_user_id;

  IF FOUND THEN
    v_success := true;
  END IF;

  RETURN v_success;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to cancel a reservation (if payment fails)
CREATE OR REPLACE FUNCTION cancel_assessment_slot_reservation(
  p_slot_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := false;
BEGIN
  -- Only cancel if it's still a pending reservation (pending_until set) and no confirmed bookings
  UPDATE assessment_slots
  SET
    is_available = true,
    booked_by_user_id = NULL,
    pending_until = NULL
  WHERE
    id = p_slot_id
    AND booked_by_user_id = p_user_id
    AND pending_until IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM assessment_bookings
      WHERE assessment_bookings.slot_id = p_slot_id
      AND assessment_bookings.booking_status = 'confirmed'
    );

  IF FOUND THEN
    v_success := true;
  END IF;

  RETURN v_success;
END;
$$ LANGUAGE plpgsql;
