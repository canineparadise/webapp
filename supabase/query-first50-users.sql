-- ============================================
-- FIND USERS WHO GOT 10% FIRST50 DISCOUNT
-- ============================================

-- Users who used FIRST50 discount code (from discount_code_usage table)
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.is_vip_member,
  dc.code as discount_code,
  dcu.used_for,
  COALESCE(dcu.original_amount, 0) as original_amount,
  COALESCE(dcu.discount_amount, 0) as discount_amount,
  COALESCE(dcu.final_amount, 0) as final_amount,
  CASE
    WHEN COALESCE(dcu.original_amount, 0) > 0
    THEN ROUND((COALESCE(dcu.discount_amount, 0) / dcu.original_amount) * 100, 1)
    ELSE 0
  END as discount_percent,
  dcu.created_at as discount_used_at
FROM profiles p
JOIN discount_code_usage dcu ON dcu.user_id = p.id
JOIN discount_codes dc ON dc.id = dcu.discount_code_id
WHERE dc.code = 'FIRST50'
ORDER BY dcu.created_at DESC;

