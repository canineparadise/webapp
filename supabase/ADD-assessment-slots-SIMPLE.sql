-- ============================================
-- SIMPLE ASSESSMENT SLOTS CREATION
-- ============================================
-- Just creates assessment slots for the next 4 weeks

-- Delete any old slots that are in the past
DELETE FROM assessment_slots WHERE assessment_date < CURRENT_DATE;

-- Insert assessment slots for next 4 Fridays
-- Friday slots: 10:00-12:00 and 14:00-16:00

DO $$
DECLARE
  friday_date DATE;
  i INTEGER;
BEGIN
  -- Loop through next 4 weeks
  FOR i IN 0..3 LOOP
    -- Calculate next Friday
    friday_date := CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + (i * 7);

    -- Only add if it's in the future
    IF friday_date >= CURRENT_DATE THEN
      -- Morning slot 10:00-12:00
      INSERT INTO assessment_slots (
        assessment_date,
        start_time,
        end_time,
        is_available,
        booked_count
      ) VALUES (
        friday_date,
        '10:00:00',
        '12:00:00',
        true,
        0
      )
      ON CONFLICT (assessment_date, start_time) DO NOTHING;

      -- Afternoon slot 14:00-16:00
      INSERT INTO assessment_slots (
        assessment_date,
        start_time,
        end_time,
        is_available,
        booked_count
      ) VALUES (
        friday_date,
        '14:00:00',
        '16:00:00',
        true,
        0
      )
      ON CONFLICT (assessment_date, start_time) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Show all available slots
SELECT
  id,
  assessment_date,
  TO_CHAR(assessment_date, 'Day, DD Mon YYYY') as formatted_date,
  start_time,
  end_time,
  booked_count,
  is_available
FROM assessment_slots
WHERE assessment_date >= CURRENT_DATE
  AND is_available = true
ORDER BY assessment_date, start_time;
