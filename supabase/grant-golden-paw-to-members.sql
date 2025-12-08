-- ============================================
-- GRANT GOLDEN PAW VIP STATUS TO MEMBERS
-- ============================================
-- These members used FIRST50 discount code but weren't properly recorded

-- Step 1: Find these members by name
SELECT
  id,
  email,
  first_name,
  last_name,
  is_vip_member,
  vip_badge_type
FROM profiles
WHERE
  (LOWER(first_name) LIKE '%ajay%' AND LOWER(last_name) LIKE '%thakerar%')
  OR (LOWER(first_name) LIKE '%fulya%' AND LOWER(last_name) LIKE '%ertur%')
  OR (LOWER(first_name) LIKE '%sinem%' AND LOWER(last_name) LIKE '%yavuz%')
  OR (LOWER(first_name) LIKE '%shakira%' AND LOWER(last_name) LIKE '%richardson%')
  OR (LOWER(first_name) LIKE '%gill%' AND LOWER(last_name) LIKE '%barron%')
  OR (LOWER(first_name) LIKE '%natascha%' AND LOWER(last_name) LIKE '%pellegrinetti%')
  OR (LOWER(first_name) LIKE '%chetna%' AND LOWER(last_name) LIKE '%teckchandani%')
  OR (LOWER(first_name) LIKE '%jade%' AND LOWER(last_name) LIKE '%creighton%')
  OR (LOWER(first_name) LIKE '%samantha%' AND LOWER(last_name) LIKE '%roseman%')
  OR (LOWER(first_name) LIKE '%peggy%' AND LOWER(last_name) LIKE '%rieckmann%')
  OR (LOWER(first_name) LIKE '%angela%' AND LOWER(last_name) LIKE '%littlechild%')
  OR (LOWER(first_name) LIKE '%katie%' AND LOWER(last_name) LIKE '%arthur%')
  OR (LOWER(first_name) LIKE '%emma%' AND LOWER(last_name) LIKE '%cameron%')
  OR (LOWER(first_name) LIKE '%james%' AND LOWER(last_name) LIKE '%sweeney%')
  OR (LOWER(first_name) LIKE '%maria%' AND LOWER(last_name) LIKE '%campanella%')
  OR (LOWER(first_name) LIKE '%kayleigh%' AND LOWER(last_name) LIKE '%castro%')
  OR (LOWER(first_name) LIKE '%adam%' AND LOWER(last_name) LIKE '%bates%')
  OR (LOWER(first_name) LIKE '%amy%' AND LOWER(last_name) LIKE '%connor%')
  OR (LOWER(first_name) LIKE '%penni%' AND LOWER(last_name) LIKE '%french%')
  OR (LOWER(first_name) LIKE '%chelsea%' AND LOWER(last_name) LIKE '%ward%')
  OR (LOWER(first_name) LIKE '%pooja%' AND LOWER(last_name) LIKE '%shah%')
  OR (LOWER(first_name) LIKE '%victoria%' AND LOWER(last_name) LIKE '%gardiner%')
  OR (LOWER(first_name) LIKE '%lauren%' AND LOWER(last_name) LIKE '%kahn%')
  OR (LOWER(first_name) LIKE '%siobhan%' AND LOWER(last_name) LIKE '%cater%')
  OR (LOWER(first_name) LIKE '%emma%' AND LOWER(last_name) LIKE '%toberman%')
  OR (LOWER(first_name) LIKE '%alexandra%' AND LOWER(last_name) LIKE '%panagidi%')
  OR (LOWER(first_name) LIKE '%natalie%' AND LOWER(last_name) LIKE '%raperport%')
  OR (LOWER(first_name) LIKE '%sarah%' AND LOWER(last_name) LIKE '%zackheim%')
  OR (LOWER(first_name) LIKE '%naina%' AND LOWER(last_name) LIKE '%shah%')
ORDER BY last_name, first_name;

-- Step 2: Grant Golden Paw VIP status to ALL these members
UPDATE profiles
SET
  is_vip_member = TRUE,
  vip_badge_type = 'golden_paw_founders',
  vip_granted_at = NOW()
WHERE
  (LOWER(first_name) LIKE '%ajay%' AND LOWER(last_name) LIKE '%thakerar%')
  OR (LOWER(first_name) LIKE '%fulya%' AND LOWER(last_name) LIKE '%ertur%')
  OR (LOWER(first_name) LIKE '%sinem%' AND LOWER(last_name) LIKE '%yavuz%')
  OR (LOWER(first_name) LIKE '%shakira%' AND LOWER(last_name) LIKE '%richardson%')
  OR (LOWER(first_name) LIKE '%gill%' AND LOWER(last_name) LIKE '%barron%')
  OR (LOWER(first_name) LIKE '%natascha%' AND LOWER(last_name) LIKE '%pellegrinetti%')
  OR (LOWER(first_name) LIKE '%chetna%' AND LOWER(last_name) LIKE '%teckchandani%')
  OR (LOWER(first_name) LIKE '%jade%' AND LOWER(last_name) LIKE '%creighton%')
  OR (LOWER(first_name) LIKE '%samantha%' AND LOWER(last_name) LIKE '%roseman%')
  OR (LOWER(first_name) LIKE '%peggy%' AND LOWER(last_name) LIKE '%rieckmann%')
  OR (LOWER(first_name) LIKE '%angela%' AND LOWER(last_name) LIKE '%littlechild%')
  OR (LOWER(first_name) LIKE '%katie%' AND LOWER(last_name) LIKE '%arthur%')
  OR (LOWER(first_name) LIKE '%emma%' AND LOWER(last_name) LIKE '%cameron%')
  OR (LOWER(first_name) LIKE '%james%' AND LOWER(last_name) LIKE '%sweeney%')
  OR (LOWER(first_name) LIKE '%maria%' AND LOWER(last_name) LIKE '%campanella%')
  OR (LOWER(first_name) LIKE '%kayleigh%' AND LOWER(last_name) LIKE '%castro%')
  OR (LOWER(first_name) LIKE '%adam%' AND LOWER(last_name) LIKE '%bates%')
  OR (LOWER(first_name) LIKE '%amy%' AND LOWER(last_name) LIKE '%connor%')
  OR (LOWER(first_name) LIKE '%penni%' AND LOWER(last_name) LIKE '%french%')
  OR (LOWER(first_name) LIKE '%chelsea%' AND LOWER(last_name) LIKE '%ward%')
  OR (LOWER(first_name) LIKE '%pooja%' AND LOWER(last_name) LIKE '%shah%')
  OR (LOWER(first_name) LIKE '%victoria%' AND LOWER(last_name) LIKE '%gardiner%')
  OR (LOWER(first_name) LIKE '%lauren%' AND LOWER(last_name) LIKE '%kahn%')
  OR (LOWER(first_name) LIKE '%siobhan%' AND LOWER(last_name) LIKE '%cater%')
  OR (LOWER(first_name) LIKE '%emma%' AND LOWER(last_name) LIKE '%toberman%')
  OR (LOWER(first_name) LIKE '%alexandra%' AND LOWER(last_name) LIKE '%panagidi%')
  OR (LOWER(first_name) LIKE '%natalie%' AND LOWER(last_name) LIKE '%raperport%')
  OR (LOWER(first_name) LIKE '%sarah%' AND LOWER(last_name) LIKE '%zackheim%')
  OR (LOWER(first_name) LIKE '%naina%' AND LOWER(last_name) LIKE '%shah%');

-- Step 3: Verify - Show all Golden Paw VIP members after update
SELECT
  id,
  email,
  first_name,
  last_name,
  is_vip_member,
  vip_badge_type,
  vip_granted_at
FROM profiles
WHERE is_vip_member = TRUE
ORDER BY vip_granted_at DESC;

-- Step 4: Count total VIP members
SELECT
  'Total Golden Paw VIP Members' as metric,
  COUNT(*) as count
FROM profiles
WHERE is_vip_member = TRUE;
