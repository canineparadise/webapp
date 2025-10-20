-- Add pickup/dropoff authorization fields to dogs table

ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS authorized_dropoff_people TEXT[],
ADD COLUMN IF NOT EXISTS authorized_pickup_people TEXT[],
ADD COLUMN IF NOT EXISTS checkout_password TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dogs_authorized_people ON dogs(owner_id);

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dogs'
AND column_name IN ('authorized_dropoff_people', 'authorized_pickup_people', 'checkout_password')
ORDER BY column_name;
