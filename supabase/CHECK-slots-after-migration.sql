-- Check the structure after migration
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'assessment_slots'
ORDER BY ordinal_position;

-- Check recurring templates (should have NO max_dogs column)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'assessment_recurring_slots'
ORDER BY ordinal_position;

-- Check what recurring templates exist
SELECT * FROM assessment_recurring_slots ORDER BY day_of_week, start_time;

-- Check what generated slots exist
SELECT * FROM assessment_slots WHERE assessment_date >= CURRENT_DATE ORDER BY assessment_date, start_time;

-- Manually trigger slot generation
SELECT generate_assessment_slots_from_recurring(4) as slots_created;

-- Check again after generation
SELECT
  id,
  assessment_date,
  start_time,
  end_time,
  is_available,
  booked_by_user_id,
  created_at
FROM assessment_slots
WHERE assessment_date >= CURRENT_DATE
ORDER BY assessment_date, start_time;
