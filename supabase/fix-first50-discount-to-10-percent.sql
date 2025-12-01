-- ============================================
-- FIX FIRST50 DISCOUNT CODE TO 10%
-- ============================================
-- FIRST50 should give 10% discount, not 50%

-- Update the FIRST50 discount code to be 10%
UPDATE discount_codes
SET
  discount_value = 10.00,
  description = '10% off - Golden Paw VIP Founders Club'
WHERE code = 'FIRST50';

-- Verify the change
SELECT
  code,
  description,
  discount_type,
  discount_value,
  applies_to,
  is_active
FROM discount_codes
WHERE code = 'FIRST50';
