-- Manually trigger slot generation from recurring templates
-- This will create dated slots for the next 4 weeks
SELECT generate_assessment_slots_from_recurring(4);

-- Then check what slots were created
SELECT
  id,
  assessment_date,
  start_time,
  end_time,
  max_dogs,
  booked_count,
  is_available,
  created_at
FROM assessment_slots
WHERE assessment_date >= CURRENT_DATE
ORDER BY assessment_date, start_time;
