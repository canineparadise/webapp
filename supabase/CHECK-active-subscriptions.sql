-- Check all subscriptions in the database
SELECT
  s.id,
  s.user_id,
  s.tier,
  s.is_active,
  s.start_date,
  s.end_date,
  p.first_name,
  p.last_name,
  p.email
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC;

-- Count active subscriptions
SELECT COUNT(*) as active_count
FROM subscriptions
WHERE is_active = true;

-- Count all subscriptions
SELECT COUNT(*) as total_count
FROM subscriptions;
