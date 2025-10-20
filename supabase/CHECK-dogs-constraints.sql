-- Check constraints on dogs table
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'dogs'::regclass
  AND contype = 'c';
