-- Add reassessment requirement tracking to dogs table
-- Dogs that haven't visited in 30+ days (excluding paused subscription periods) need reassessment

-- Add last_activity_date to track when dog last attended daycare
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMPTZ;

-- Add flag for requiring reassessment
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS requires_reassessment BOOLEAN DEFAULT false;

-- Add date when reassessment was triggered
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS reassessment_required_at TIMESTAMPTZ;

-- Add reason for reassessment requirement
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS reassessment_reason TEXT;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_dogs_requires_reassessment ON dogs(requires_reassessment) WHERE requires_reassessment = true;
CREATE INDEX IF NOT EXISTS idx_dogs_last_activity_date ON dogs(last_activity_date);

-- Comments for documentation
COMMENT ON COLUMN dogs.last_activity_date IS 'Date of the dogs last visit to daycare (check-in). Used to determine if reassessment is needed after 30 days of inactivity.';
COMMENT ON COLUMN dogs.requires_reassessment IS 'Flag indicating dog needs to complete a new assessment before booking. Set after 30 days of inactivity.';
COMMENT ON COLUMN dogs.reassessment_required_at IS 'When the reassessment requirement was triggered.';
COMMENT ON COLUMN dogs.reassessment_reason IS 'Reason why reassessment is required (e.g., "30+ days without visit")';

-- Initialize last_activity_date for existing dogs based on their most recent check-in
-- This sets it to the most recent checked_in_at from bookings or individual_day_bookings
UPDATE dogs d
SET last_activity_date = GREATEST(
  COALESCE((
    SELECT MAX(b.checked_in_at)
    FROM bookings b
    WHERE b.dog_id = d.id AND b.checked_in_at IS NOT NULL
  ), '1970-01-01'::timestamptz),
  COALESCE((
    SELECT MAX(idb.checked_in_at)
    FROM individual_day_bookings idb
    WHERE idb.dog_id = d.id AND idb.checked_in_at IS NOT NULL
  ), '1970-01-01'::timestamptz)
)
WHERE d.last_activity_date IS NULL AND d.is_approved = true;

-- For dogs without any check-ins but who are approved, set to their assessment_date or approval date
UPDATE dogs d
SET last_activity_date = COALESCE(d.assessment_date, d.created_at)
WHERE d.last_activity_date IS NULL AND d.is_approved = true;

-- Create a function to check if a dog needs reassessment
-- This considers:
-- 1. Days since last activity
-- 2. Whether the owner has an active paused subscription (excluded from count)
-- 3. 30-day threshold
CREATE OR REPLACE FUNCTION check_dog_needs_reassessment(p_dog_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_activity TIMESTAMPTZ;
  v_days_inactive INTEGER;
  v_has_paused_subscription BOOLEAN;
  v_is_approved BOOLEAN;
BEGIN
  -- Get dog's approval status and last activity
  SELECT is_approved, last_activity_date
  INTO v_is_approved, v_last_activity
  FROM dogs
  WHERE id = p_dog_id;

  -- If not approved, they already need assessment
  IF NOT v_is_approved THEN
    RETURN false; -- Don't flag as needing REassessment, they need initial assessment
  END IF;

  -- If no last activity recorded, assume they need reassessment
  IF v_last_activity IS NULL THEN
    RETURN true;
  END IF;

  -- Check if owner has an active paused subscription for this dog
  SELECT EXISTS(
    SELECT 1 FROM subscriptions s
    JOIN dogs d ON d.owner_id = s.user_id
    WHERE d.id = p_dog_id
    AND s.is_paused = true
    AND s.is_active = true
  ) INTO v_has_paused_subscription;

  -- If subscription is paused, don't count inactivity
  IF v_has_paused_subscription THEN
    RETURN false;
  END IF;

  -- Calculate days since last activity
  v_days_inactive := EXTRACT(DAY FROM (NOW() - v_last_activity));

  -- Return true if 30+ days inactive
  RETURN v_days_inactive >= 30;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update last_activity_date when a dog is checked in
CREATE OR REPLACE FUNCTION update_dog_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update when checked_in changes to true or checked_in_at is set
  IF (NEW.checked_in = true AND (OLD.checked_in IS NULL OR OLD.checked_in = false))
     OR (NEW.checked_in_at IS NOT NULL AND OLD.checked_in_at IS NULL) THEN

    UPDATE dogs
    SET last_activity_date = COALESCE(NEW.checked_in_at, NOW()),
        requires_reassessment = false,  -- Clear reassessment flag on check-in
        reassessment_required_at = NULL,
        reassessment_reason = NULL
    WHERE id = NEW.dog_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update last_activity_date on check-in
DROP TRIGGER IF EXISTS update_dog_activity_on_booking_checkin ON bookings;
CREATE TRIGGER update_dog_activity_on_booking_checkin
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_dog_last_activity();

DROP TRIGGER IF EXISTS update_dog_activity_on_individual_checkin ON individual_day_bookings;
CREATE TRIGGER update_dog_activity_on_individual_checkin
  AFTER UPDATE ON individual_day_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_dog_last_activity();

-- Function to mark inactive dogs as requiring reassessment
-- This should be called periodically (e.g., daily cron job or on page load)
CREATE OR REPLACE FUNCTION mark_inactive_dogs_for_reassessment()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  UPDATE dogs d
  SET requires_reassessment = true,
      reassessment_required_at = NOW(),
      reassessment_reason = '30+ days without visiting daycare'
  WHERE d.is_approved = true
    AND d.requires_reassessment = false
    AND check_dog_needs_reassessment(d.id) = true;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clear reassessment requirement after completing assessment
CREATE OR REPLACE FUNCTION clear_reassessment_requirement(p_dog_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE dogs
  SET requires_reassessment = false,
      reassessment_required_at = NULL,
      reassessment_reason = NULL,
      last_activity_date = NOW(),
      is_approved = true
  WHERE id = p_dog_id;
END;
$$ LANGUAGE plpgsql;
