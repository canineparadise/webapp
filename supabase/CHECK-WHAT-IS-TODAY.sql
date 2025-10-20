-- What does the database think TODAY is?
SELECT
  CURRENT_DATE as database_today,
  NOW() as database_now,
  NOW()::date as now_as_date,
  '2025-10-07'::date as booking_date,
  CURRENT_DATE = '2025-10-07'::date as dates_match;
