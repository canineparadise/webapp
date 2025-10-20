-- Add date_of_birth and microchip_number columns to dogs table

-- Add date_of_birth column
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add microchip_number column
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS microchip_number TEXT;

-- Add comment to columns
COMMENT ON COLUMN dogs.date_of_birth IS 'Date of birth of the dog (used to calculate age automatically)';
COMMENT ON COLUMN dogs.microchip_number IS 'Microchip identification number (optional, can be recorded at daycare)';
