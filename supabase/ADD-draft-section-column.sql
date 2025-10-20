-- Add draft_section column to track which section user was on

ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS draft_section INTEGER DEFAULT 0;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'dogs' AND column_name = 'draft_section';
