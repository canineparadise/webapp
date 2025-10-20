-- Add draft status to dogs table so users can save incomplete profiles

ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS draft_section INTEGER DEFAULT 0;

-- Add index for querying drafts
CREATE INDEX IF NOT EXISTS idx_dogs_is_draft ON dogs(owner_id, is_draft);

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'dogs' AND column_name IN ('is_draft', 'draft_section');
