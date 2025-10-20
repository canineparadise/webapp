-- Check which tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('roll_calls', 'sections', 'staff_assignments', 'staff_tasks')
ORDER BY table_name;

-- Check roll_calls table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'roll_calls'
ORDER BY ordinal_position;

-- Check sections table structure (if exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'sections'
ORDER BY ordinal_position;

-- Check staff_assignments table structure (if exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'staff_assignments'
ORDER BY ordinal_position;

-- Check staff_tasks table structure (if exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'staff_tasks'
ORDER BY ordinal_position;
