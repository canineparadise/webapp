-- Add treatment date columns to dogs table

ALTER TABLE dogs ADD COLUMN IF NOT EXISTS flea_treatment_date DATE;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS worming_treatment_date DATE;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS heartworm_prevention_date DATE;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dogs'
  AND column_name IN ('vaccination_expiry', 'flea_treatment_date', 'worming_treatment_date', 'heartworm_prevention_date')
ORDER BY column_name;
