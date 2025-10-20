-- Check what slots were just created
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
