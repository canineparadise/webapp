-- Add missing columns to staff_tasks table
-- Add missing columns to staff_assignments table

-- Fix staff_tasks table - add missing columns
ALTER TABLE staff_tasks
  ADD COLUMN IF NOT EXISTS due_time TIME,
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER;

-- Rename task_status to status if the column exists
-- This uses DO block to handle the case where it might already be renamed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'staff_tasks'
      AND column_name = 'task_status'
  ) THEN
    ALTER TABLE staff_tasks RENAME COLUMN task_status TO status;
  END IF;
END $$;

-- Add status column if it doesn't exist (in case the table was created without it)
ALTER TABLE staff_tasks
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Fix staff_assignments table - add check-in/check-out timestamp columns
ALTER TABLE staff_assignments
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMP WITH TIME ZONE;
