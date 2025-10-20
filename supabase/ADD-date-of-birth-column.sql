-- Add date_of_birth column to dogs table

ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dogs'
AND column_name = 'date_of_birth';
