-- Add amount/revenue column to bookings table if it doesn't exist
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);

-- Update existing bookings with calculated amount based on subscription tier
-- This is a one-time migration to populate historical data
UPDATE public.bookings b
SET amount = st.price_per_session
FROM public.subscriptions s
JOIN public.subscription_tiers st ON s.tier_id = st.id
WHERE b.user_id = s.user_id
  AND b.amount IS NULL
  AND s.is_active = true;

-- For bookings without a subscription, set a default price (adjust as needed)
UPDATE public.bookings
SET amount = CASE
  WHEN session_type = 'full_day' THEN 35.00
  WHEN session_type = 'half_day' THEN 25.00
  ELSE 30.00
END
WHERE amount IS NULL;
