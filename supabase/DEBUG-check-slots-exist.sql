-- Check what slots exist and their availability
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

-- Also check recurring templates
SELECT
  id,
  day_of_week,
  start_time,
  end_time,
  max_dogs,
  is_active,
  created_at
FROM assessment_recurring_slots
ORDER BY day_of_week, start_time;
