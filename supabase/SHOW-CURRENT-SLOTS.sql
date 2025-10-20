-- Show all current assessment slots
SELECT
  id,
  assessment_date,
  TO_CHAR(assessment_date, 'Day DD Mon YYYY') as formatted_date,
  start_time,
  end_time,
  booked_count,
  is_available
FROM assessment_slots
ORDER BY assessment_date, start_time;
