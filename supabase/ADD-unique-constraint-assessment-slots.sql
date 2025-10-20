-- Add unique constraint to prevent duplicate assessment slots
-- This ensures no two slots can have the same date and time

-- First, delete any existing duplicates
DELETE FROM assessment_slots a
USING assessment_slots b
WHERE a.id < b.id
  AND a.assessment_date = b.assessment_date
  AND a.start_time = b.start_time
  AND a.end_time = b.end_time;

-- Add unique constraint
ALTER TABLE assessment_slots
ADD CONSTRAINT unique_assessment_slot
UNIQUE (assessment_date, start_time, end_time);

-- This will prevent anyone (including you accidentally running the INSERT script twice)
-- from creating duplicate slots for the same date/time
