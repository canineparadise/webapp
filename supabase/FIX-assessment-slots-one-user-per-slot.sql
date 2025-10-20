-- Fix assessment slots to be 1 user per slot (not max dogs)
-- Each slot can only be booked by ONE user, regardless of how many dogs they bring

-- 1. Add booked_by_user_id to assessment_slots to track who booked it
ALTER TABLE assessment_slots
ADD COLUMN IF NOT EXISTS booked_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Drop the max_dogs column from recurring templates (not needed)
ALTER TABLE assessment_recurring_slots
DROP COLUMN IF EXISTS max_dogs CASCADE;

-- 3. Drop max_dogs and booked_count from assessment_slots (replace with simpler boolean)
ALTER TABLE assessment_slots
DROP COLUMN IF EXISTS max_dogs CASCADE,
DROP COLUMN IF EXISTS booked_count CASCADE;

-- 4. Drop the old constraint that referenced max_dogs
ALTER TABLE assessment_slots
DROP CONSTRAINT IF EXISTS assessment_slots_booked_count_check CASCADE;

-- 5. Update the generate function to work without max_dogs
CREATE OR REPLACE FUNCTION generate_assessment_slots_from_recurring(weeks_ahead INTEGER DEFAULT 4)
RETURNS INTEGER AS $$
DECLARE
  recurring_slot RECORD;
  slot_date DATE;
  slots_created INTEGER := 0;
  current_day INTEGER;
  days_until_target INTEGER;
  week_offset INTEGER;
BEGIN
  FOR recurring_slot IN
    SELECT * FROM assessment_recurring_slots WHERE is_active = true
  LOOP
    current_day := EXTRACT(DOW FROM CURRENT_DATE)::INTEGER;
    days_until_target := (recurring_slot.day_of_week - current_day + 7) % 7;

    IF days_until_target = 0 AND CURRENT_TIME < recurring_slot.start_time THEN
      days_until_target := 0;
    ELSIF days_until_target = 0 THEN
      days_until_target := 7;
    END IF;

    FOR week_offset IN 0..(weeks_ahead - 1) LOOP
      slot_date := CURRENT_DATE + days_until_target + (week_offset * 7);

      IF slot_date >= CURRENT_DATE THEN
        -- Check if slot already exists for this date/time
        IF NOT EXISTS (
          SELECT 1 FROM assessment_slots
          WHERE assessment_date = slot_date
          AND start_time = recurring_slot.start_time
        ) THEN
          -- Create slot (is_available = true, booked_by_user_id = NULL means available)
          INSERT INTO assessment_slots (
            assessment_date,
            start_time,
            end_time,
            is_available,
            booked_by_user_id,
            created_by
          ) VALUES (
            slot_date,
            recurring_slot.start_time,
            recurring_slot.end_time,
            true,
            NULL,
            NULL
          );
          slots_created := slots_created + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  RETURN slots_created;
END;
$$ LANGUAGE plpgsql;

-- 6. Add comment to explain the system
COMMENT ON TABLE assessment_slots IS 'Each slot can be booked by exactly ONE user (regardless of how many dogs they bring). booked_by_user_id tracks who booked it.';
COMMENT ON COLUMN assessment_slots.booked_by_user_id IS 'The user who booked this slot. NULL = available, NOT NULL = booked.';
COMMENT ON COLUMN assessment_slots.is_available IS 'Whether this slot is available for booking. Set to false to manually disable a slot.';
