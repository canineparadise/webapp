-- Add assessment video column to dogs table
-- Run this script in your Supabase SQL Editor

-- Add column to store assessment video URL
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS assessment_video_url TEXT;

-- Add column to track who uploaded the video
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS assessment_video_uploaded_by UUID REFERENCES profiles(id);

-- Add column to track when video was uploaded
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS assessment_video_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN dogs.assessment_video_url IS 'URL to the assessment day video stored in Supabase Storage';
COMMENT ON COLUMN dogs.assessment_video_uploaded_by IS 'Staff member who uploaded the assessment video';
COMMENT ON COLUMN dogs.assessment_video_uploaded_at IS 'When the assessment video was uploaded';
