-- Add approval_status column to profiles table if it doesn't exist

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending';

-- Update existing profiles to 'approved' if they have any approved dogs
UPDATE profiles
SET approval_status = 'approved'
WHERE id IN (
  SELECT DISTINCT owner_id
  FROM dogs
  WHERE is_approved = true
);
