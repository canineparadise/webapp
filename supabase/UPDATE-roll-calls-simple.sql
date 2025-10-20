-- Add columns for simple dog count and section tracking
ALTER TABLE roll_calls ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE roll_calls ADD COLUMN IF NOT EXISTS dog_count INTEGER;
ALTER TABLE roll_calls ADD COLUMN IF NOT EXISTS actual_time TIME;

-- Make some existing columns nullable since we're using a simpler approach
ALTER TABLE roll_calls ALTER COLUMN dogs_expected DROP NOT NULL;
ALTER TABLE roll_calls ALTER COLUMN status SET DEFAULT 'completed';
