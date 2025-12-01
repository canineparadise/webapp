-- ============================================
-- GRANT KAREN JENKINS GOLDEN PAW VIP STATUS
-- ============================================
-- Karen forgot to use the FIRST50 discount code when signing up
-- This script retroactively grants her Golden Paw VIP Founders status
-- which gives her permanent 10% discount on all future purchases

-- Step 1: Get the FIRST50 discount code ID and Karen's user ID
DO $$
DECLARE
  karen_user_id UUID;
  first50_code_id UUID;
BEGIN
  -- Find Karen's user ID
  SELECT id INTO karen_user_id
  FROM profiles
  WHERE email = 'karenjenk@hotmail.co.uk'
  LIMIT 1;

  -- Find FIRST50 discount code ID
  SELECT id INTO first50_code_id
  FROM discount_codes
  WHERE code = 'FIRST50'
  LIMIT 1;

  -- Update Karen's profile to have Golden Paw VIP status
  UPDATE profiles
  SET
    is_vip_member = TRUE,
    vip_badge_type = 'golden_paw_founders',
    vip_granted_at = NOW()
  WHERE id = karen_user_id;

  -- Record that Karen "used" the FIRST50 code (retroactively)
  -- This ensures she's tracked as a Founders Club member
  IF first50_code_id IS NOT NULL AND karen_user_id IS NOT NULL THEN
    INSERT INTO discount_code_usage (
      discount_code_id,
      user_id,
      used_for,
      original_amount,
      discount_amount,
      final_amount
    )
    VALUES (
      first50_code_id,
      karen_user_id,
      'subscription',
      0.00, -- No retroactive charges
      0.00, -- No actual discount applied retroactively, just VIP status
      0.00  -- No retroactive charges
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Karen Jenkins has been granted Golden Paw VIP Founders status!';
END $$;

-- Verify Karen now has Golden Paw status
SELECT
  id,
  email,
  first_name,
  last_name,
  is_vip_member,
  vip_badge_type,
  vip_granted_at,
  created_at
FROM profiles
WHERE email = 'karenjenk@hotmail.co.uk';

-- Show Karen's discount code usage
SELECT
  dcu.id,
  dcu.used_for,
  dcu.original_amount,
  dcu.discount_amount,
  dcu.final_amount,
  dc.code,
  dc.description
FROM discount_code_usage dcu
JOIN discount_codes dc ON dcu.discount_code_id = dc.id
WHERE dcu.user_id IN (
  SELECT id FROM profiles
  WHERE email = 'karenjenk@hotmail.co.uk'
);

-- IMPORTANT: Karen will now see the Golden Paw badge on her dashboard
-- and receive 10% off all future subscription and daycare purchases!
