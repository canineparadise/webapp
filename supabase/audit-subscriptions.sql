-- ============================================
-- SUBSCRIPTION AUDIT QUERIES
-- ============================================
-- Run these queries to audit your subscriptions

-- QUERY 1: Overview - Total subscriptions by status
-- ============================================
SELECT
  'Total Subscriptions' as metric,
  COUNT(*) as count
FROM subscriptions
UNION ALL
SELECT
  'Active Subscriptions' as metric,
  COUNT(*) as count
FROM subscriptions
WHERE is_active = TRUE
UNION ALL
SELECT
  'Inactive Subscriptions' as metric,
  COUNT(*) as count
FROM subscriptions
WHERE is_active = FALSE
UNION ALL
SELECT
  'With Stripe ID' as metric,
  COUNT(*) as count
FROM subscriptions
WHERE stripe_subscription_id IS NOT NULL
UNION ALL
SELECT
  'Without Stripe ID' as metric,
  COUNT(*) as count
FROM subscriptions
WHERE stripe_subscription_id IS NULL;

-- QUERY 2: List all active subscriptions with user and dog details
-- ============================================
SELECT
  s.id,
  p.email,
  p.first_name || ' ' || p.last_name as user_name,
  d.name as dog_name,
  s.stripe_subscription_id,
  s.days_remaining,
  s.days_included,
  s.is_active,
  s.created_at,
  s.current_period_end
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
LEFT JOIN dogs d ON s.dog_id = d.id
WHERE s.is_active = TRUE
ORDER BY s.created_at DESC;

-- QUERY 3: Subscriptions WITHOUT Stripe ID (potential issues)
-- ============================================
SELECT
  s.id,
  p.email,
  p.first_name || ' ' || p.last_name as user_name,
  d.name as dog_name,
  s.days_remaining,
  s.created_at,
  s.is_active
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
LEFT JOIN dogs d ON s.dog_id = d.id
WHERE s.stripe_subscription_id IS NULL
ORDER BY s.created_at DESC;

-- QUERY 4: Users with multiple active subscriptions (multi-dog owners)
-- ============================================
SELECT
  p.email,
  p.first_name || ' ' || p.last_name as user_name,
  COUNT(s.id) as subscription_count,
  SUM(s.days_remaining) as total_days_remaining,
  STRING_AGG(d.name, ', ') as dogs
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
LEFT JOIN dogs d ON s.dog_id = d.id
WHERE s.is_active = TRUE
GROUP BY p.id, p.email, p.first_name, p.last_name
HAVING COUNT(s.id) > 1
ORDER BY subscription_count DESC;

-- QUERY 5: Subscriptions by tier
-- ============================================
SELECT
  st.name as tier_name,
  COUNT(s.id) as subscription_count,
  COUNT(CASE WHEN s.is_active THEN 1 END) as active_count,
  SUM(s.days_remaining) as total_days_remaining,
  AVG(s.days_remaining) as avg_days_remaining
FROM subscriptions s
LEFT JOIN subscription_tiers st ON s.tier_id = st.id
GROUP BY st.name
ORDER BY subscription_count DESC;

-- QUERY 6: Recent subscriptions (last 30 days)
-- ============================================
SELECT
  s.id,
  p.email,
  d.name as dog_name,
  s.stripe_subscription_id,
  s.days_included,
  s.days_remaining,
  s.created_at,
  s.is_active
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
LEFT JOIN dogs d ON s.dog_id = d.id
WHERE s.created_at >= NOW() - INTERVAL '30 days'
ORDER BY s.created_at DESC;

-- QUERY 7: Paused subscriptions
-- ============================================
SELECT
  s.id,
  p.email,
  p.first_name || ' ' || p.last_name as user_name,
  d.name as dog_name,
  s.pause_start_date,
  s.pause_end_date,
  s.pause_reason,
  s.total_paused_days,
  CASE
    WHEN s.pause_end_date < NOW() THEN 'Pause Ended'
    WHEN s.pause_start_date > NOW() THEN 'Pause Scheduled'
    ELSE 'Currently Paused'
  END as pause_status
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
LEFT JOIN dogs d ON s.dog_id = d.id
WHERE s.is_paused = TRUE
ORDER BY s.pause_start_date DESC;

-- QUERY 8: Subscriptions about to expire (days_remaining < 5)
-- ============================================
SELECT
  s.id,
  p.email,
  p.first_name || ' ' || p.last_name as user_name,
  d.name as dog_name,
  s.days_remaining,
  s.stripe_subscription_id,
  s.current_period_end
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
LEFT JOIN dogs d ON s.dog_id = d.id
WHERE s.is_active = TRUE
  AND s.days_remaining < 5
  AND s.days_remaining > 0
ORDER BY s.days_remaining ASC;

-- QUERY 9: Check for duplicate Stripe IDs (shouldn't happen but worth checking)
-- ============================================
SELECT
  stripe_subscription_id,
  COUNT(*) as duplicate_count,
  STRING_AGG(p.email, ', ') as users
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
WHERE stripe_subscription_id IS NOT NULL
GROUP BY stripe_subscription_id
HAVING COUNT(*) > 1;

-- QUERY 10: Revenue summary by subscription status
-- ============================================
SELECT
  CASE
    WHEN s.is_active THEN 'Active'
    ELSE 'Inactive'
  END as status,
  COUNT(*) as count,
  COUNT(DISTINCT s.user_id) as unique_users,
  SUM(s.days_included) as total_days_sold,
  SUM(s.days_used) as total_days_used,
  SUM(s.days_remaining) as total_days_remaining
FROM subscriptions s
GROUP BY s.is_active
ORDER BY s.is_active DESC;
