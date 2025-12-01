-- ============================================
-- ADD SUBSCRIPTION PAUSE FEATURE
-- ============================================
-- Allows users to pause subscriptions for up to 4 weeks
-- During pause: no charges, no days deducted
-- After pause: billing resumes automatically

-- Add pause tracking columns
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pause_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pause_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pause_reason TEXT,
ADD COLUMN IF NOT EXISTS total_paused_days INTEGER DEFAULT 0;

-- Add index for querying paused subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_paused
ON subscriptions(is_paused)
WHERE is_paused = true;

-- Add check constraint to ensure pause period is max 28 days (4 weeks)
ALTER TABLE subscriptions
ADD CONSTRAINT IF NOT EXISTS check_pause_duration
CHECK (
  pause_end_date IS NULL OR
  pause_start_date IS NULL OR
  (pause_end_date - pause_start_date) <= INTERVAL '28 days'
);

-- Verify columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'subscriptions'
  AND column_name IN ('is_paused', 'pause_start_date', 'pause_end_date', 'pause_reason', 'total_paused_days')
ORDER BY ordinal_position;
