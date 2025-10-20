-- Add authorized pickup/dropoff people and checkout password to dogs table
ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS authorized_dropoff_people TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS authorized_pickup_people TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS checkout_password TEXT;

-- Add check-in and check-out details to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS dropped_off_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS picked_up_by VARCHAR(255);

-- Update existing test data with authorized people and passwords
-- You can customize these or run your own updates after

COMMENT ON COLUMN dogs.authorized_dropoff_people IS 'Array of names authorized to drop off this dog';
COMMENT ON COLUMN dogs.authorized_pickup_people IS 'Array of names authorized to pick up this dog';
COMMENT ON COLUMN dogs.checkout_password IS 'Case-insensitive password required for non-authorized pickup';
COMMENT ON COLUMN bookings.dropped_off_by IS 'Name of person who dropped off the dog';
COMMENT ON COLUMN bookings.picked_up_by IS 'Name of person who picked up the dog';
