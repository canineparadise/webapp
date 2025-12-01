-- Check the exact foreign key constraint
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as references_table,
  a.attname as column_name,
  af.attname as foreign_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE c.contype = 'f'
  AND conrelid::regclass::text = 'dogs'
  AND a.attname = 'owner_id';

-- Check what PostgREST sees
SELECT
  'POSTGREST VIEW' as info,
  c.relname as from_table,
  a.attname as from_column,
  c2.relname as to_table,
  a2.attname as to_column,
  con.conname as fk_name
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_class c2 ON c2.oid = con.confrelid
JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
JOIN pg_attribute a2 ON a2.attrelid = con.confrelid AND a2.attnum = ANY(con.confkey)
WHERE c.relname = 'dogs' AND con.contype = 'f';
