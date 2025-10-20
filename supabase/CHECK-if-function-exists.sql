-- Check if the generate_assessment_slots_from_recurring function exists
SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'generate_assessment_slots_from_recurring';

-- If empty result, the function hasn't been created yet
-- Run CREATE-auto-generate-slots-function.sql to create it
