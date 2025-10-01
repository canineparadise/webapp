-- Fix dogs table - remove the problematic constraint
-- Run this in Supabase SQL Editor

-- Drop the problematic constraint if it exists
ALTER TABLE dogs DROP CONSTRAINT IF EXISTS max_dogs_per_owner;

-- We'll enforce the 4-dog limit in the application code instead
-- This is actually better practice anyway!

-- Ensure all other columns exist
DO $$
BEGIN
  -- Check if has_vaccination_docs exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dogs' AND column_name='has_vaccination_docs') THEN
    ALTER TABLE dogs ADD COLUMN has_vaccination_docs BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
