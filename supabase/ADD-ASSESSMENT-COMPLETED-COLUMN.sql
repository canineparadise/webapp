-- Add assessment_completed column to dogs table if it doesn't exist

ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS assessment_completed BOOLEAN DEFAULT false;

-- Add assessment_date column if it doesn't exist
ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS assessment_date DATE;

-- Add assessment_notes column if it doesn't exist
ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS assessment_notes TEXT;

-- Add assessment_video_url column if it doesn't exist
ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS assessment_video_url TEXT;
