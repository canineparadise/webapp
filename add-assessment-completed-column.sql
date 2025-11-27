-- Add assessment_completed column to dogs table
-- This tracks whether a dog has already completed an assessment at the daycare

ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS assessment_completed BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN dogs.assessment_completed IS 'Indicates if this dog has previously attended the daycare and passed an assessment. Set by users during registration, verified by staff during approval.';

-- Update any existing dogs to have default value
UPDATE dogs
SET assessment_completed = FALSE
WHERE assessment_completed IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'dogs' AND column_name = 'assessment_completed';
