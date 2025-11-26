-- Check what columns actually exist in the staff_tasks table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'staff_tasks'
ORDER BY ordinal_position;
