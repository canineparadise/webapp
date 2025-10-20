-- Check LEGAL_AGREEMENTS table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'legal_agreements'
ORDER BY ordinal_position;
