-- Fix assessment booking date to reflect when payment was received (today)
-- This should be the date the customer paid, not the scheduled assessment date

UPDATE assessment_bookings
SET booked_at = '2025-10-17 10:00:00+00'
WHERE user_id = '42389796-b6d7-4167-b1c0-fec274c0f2c9'
  AND booking_status = 'confirmed';

-- Verify the update
SELECT id, user_id, booking_status, booked_at, slot_id
FROM assessment_bookings
WHERE user_id = '42389796-b6d7-4167-b1c0-fec274c0f2c9';
