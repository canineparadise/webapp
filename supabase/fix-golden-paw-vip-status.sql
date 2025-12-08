-- ============================================
-- FIX GOLDEN PAW VIP STATUS
-- ============================================
-- ONLY users who used the FIRST50 discount code get VIP membership
-- They get: Golden Paw badge + 10% lifetime discount

-- Step 1: Find all users who used FIRST50 discount code
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.is_vip_member,
  CASE
    WHEN p.is_vip_member = true THEN 'Already VIP'
    ELSE 'SHOULD BE VIP'
  END as vip_status,
  dcu.used_for,
  dcu.original_amount,
  dcu.discount_amount,
  dcu.final_amount,
  dcu.created_at as discount_used_at
FROM profiles p
JOIN discount_code_usage dcu ON dcu.user_id = p.id
JOIN discount_codes dc ON dc.id = dcu.discount_code_id
WHERE dc.code = 'FIRST50'
ORDER BY p.is_vip_member ASC, dcu.created_at DESC;

-- Step 2: Grant VIP ONLY to users who used FIRST50 discount code
UPDATE profiles
SET
  is_vip_member = TRUE,
  vip_badge_type = 'golden_paw_founders',
  vip_granted_at = NOW()
WHERE id IN (
  SELECT DISTINCT dcu.user_id
  FROM discount_code_usage dcu
  JOIN discount_codes dc ON dc.id = dcu.discount_code_id
  WHERE dc.code = 'FIRST50'
)
AND (is_vip_member = false OR is_vip_member IS NULL);

-- Step 3: Verify - Show all Golden Paw VIP members
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.phone,
  p.is_vip_member,
  p.vip_badge_type,
  p.vip_granted_at,
  p.created_at as account_created
FROM profiles p
WHERE p.is_vip_member = TRUE
ORDER BY p.vip_granted_at DESC;

-- Step 4: Count summary
SELECT
  'Total Golden Paw VIP Members' as metric,
  COUNT(*) as count
FROM profiles
WHERE is_vip_member = TRUE;
