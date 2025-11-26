-- Add approval-related columns to dogs table if they don't exist

-- Add approved_by column (reference to staff who approved)
ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);

-- Add approved_at column (timestamp when approved)
ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
