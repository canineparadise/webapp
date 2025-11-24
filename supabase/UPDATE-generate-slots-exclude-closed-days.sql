-- ============================================
-- UPDATE AUTO-GENERATE ASSESSMENT SLOTS TO EXCLUDE CLOSED DAYS
-- ============================================
-- This updates the function to skip generating slots on closed days

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
  -- Loop through all active recurring slots
  FOR recurring_slot IN
    SELECT * FROM assessment_recurring_slots WHERE is_active = true
  LOOP
    -- Get current day of week (0 = Sunday, 1 = Monday, etc.)
    current_day := EXTRACT(DOW FROM CURRENT_DATE)::INTEGER;

    -- Calculate days until the target day of week
    days_until_target := (recurring_slot.day_of_week - current_day + 7) % 7;

    -- If target day is today, start from today, otherwise start from next occurrence
    IF days_until_target = 0 AND CURRENT_TIME < recurring_slot.start_time THEN
      days_until_target := 0; -- Use today if we haven't passed the time yet
    ELSIF days_until_target = 0 THEN
      days_until_target := 7; -- Use next week if we passed the time
    END IF;

    -- Generate slots for the next N weeks
    FOR week_offset IN 0..(weeks_ahead - 1) LOOP
      slot_date := CURRENT_DATE + days_until_target + (week_offset * 7);

      -- Only create if date is in future, not a closed day, and slot doesn't already exist
      IF slot_date >= CURRENT_DATE AND NOT is_closed_day(slot_date) THEN
        -- Check if slot already exists for this date and time
        IF NOT EXISTS (
          SELECT 1 FROM assessment_slots
          WHERE assessment_date = slot_date
          AND start_time = recurring_slot.start_time
        ) THEN
          -- Insert the slot
          INSERT INTO assessment_slots (
            assessment_date,
            start_time,
            end_time,
            max_dogs,
            booked_count,
            is_available,
            created_by
          ) VALUES (
            slot_date,
            recurring_slot.start_time,
            recurring_slot.end_time,
            recurring_slot.max_dogs,
            0,
            true,
            NULL -- System generated
          );

          slots_created := slots_created + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  RETURN slots_created;
END;
$$ LANGUAGE plpgsql;
