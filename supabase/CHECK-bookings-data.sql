-- Check what bookings data we actually have
SELECT
  id,
  user_id,
  dog_id,
  dog_ids,
  booking_date,
  status,
  session_type,
  checked_in,
  checked_out
FROM bookings
WHERE booking_date >= '2025-10-07'
ORDER BY booking_date, user_id
LIMIT 10;
