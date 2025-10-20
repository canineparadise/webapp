-- Add assessment scheduling and notes fields

-- Add assessment_date to dogs table for scheduling assessments
ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS assessment_date DATE,
ADD COLUMN IF NOT EXISTS assessment_notes TEXT;

-- Add assessment history to profiles to track declined dogs
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS assessment_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN dogs.assessment_date IS 'Scheduled date for dog assessment';
COMMENT ON COLUMN dogs.assessment_notes IS 'Staff notes from assessment (approval or decline reasons)';
COMMENT ON COLUMN profiles.assessment_history IS 'History of all dog assessments for this user (approvals and declines with notes)';

-- Create index for efficient assessment date queries
CREATE INDEX IF NOT EXISTS idx_dogs_assessment_date ON dogs(assessment_date) WHERE assessment_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dogs_assessment_status ON dogs(assessment_completed, is_approved) WHERE assessment_completed = true;
