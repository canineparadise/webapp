-- Add assessment_completed field to dogs table for existing customer handling
-- This allows existing dogs to be marked as assessed without requiring new assessments

ALTER TABLE dogs 
ADD COLUMN IF NOT EXISTS assessment_completed BOOLEAN DEFAULT FALSE;

-- Add comment explaining the field
COMMENT ON COLUMN dogs.assessment_completed IS 'TRUE if dog has completed assessment (for existing customers or completed assessments). FALSE if dog needs assessment.';

