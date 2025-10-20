-- Add amount column to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);

-- Set default amounts based on session type for existing bookings
UPDATE public.bookings
SET amount = CASE
  WHEN session_type = 'full_day' THEN 35.00
  WHEN session_type = 'half_day' THEN 25.00
  ELSE 30.00
END
WHERE amount IS NULL;

-- Make amount NOT NULL going forward
ALTER TABLE public.bookings
ALTER COLUMN amount SET DEFAULT 30.00;

COMMENT ON COLUMN public.bookings.amount IS 'Booking amount in GBP';
