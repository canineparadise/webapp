-- Fix ambiguous column reference in validate_discount_code function
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_applies_to VARCHAR(50),
  p_amount DECIMAL(10,2)
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_code_id UUID,
  discount_type VARCHAR(20),
  discount_value DECIMAL(10,2),
  error_message TEXT
) AS $$
DECLARE
  v_code discount_codes%ROWTYPE;
  v_usage_count INTEGER;
BEGIN
  -- Get discount code
  SELECT * INTO v_code
  FROM discount_codes dc
  WHERE dc.code = p_code AND dc.is_active = true;

  -- Code doesn't exist or inactive
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR(20), NULL::DECIMAL(10,2), 'Invalid or inactive discount code';
    RETURN;
  END IF;

  -- Check validity dates
  IF v_code.valid_from > NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR(20), NULL::DECIMAL(10,2), 'Discount code not yet valid';
    RETURN;
  END IF;

  IF v_code.valid_until IS NOT NULL AND v_code.valid_until < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR(20), NULL::DECIMAL(10,2), 'Discount code has expired';
    RETURN;
  END IF;

  -- Check max uses
  IF v_code.max_uses IS NOT NULL AND v_code.current_uses >= v_code.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR(20), NULL::DECIMAL(10,2), 'Discount code has reached maximum uses';
    RETURN;
  END IF;

  -- Check if user already used (if one_time_per_user)
  IF v_code.one_time_per_user THEN
    SELECT COUNT(*) INTO v_usage_count
    FROM discount_code_usage dcu
    WHERE dcu.discount_code_id = v_code.id AND dcu.user_id = p_user_id;

    IF v_usage_count > 0 THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR(20), NULL::DECIMAL(10,2), 'You have already used this discount code';
      RETURN;
    END IF;
  END IF;

  -- Check if applies to this purchase type
  IF NOT p_applies_to = ANY(v_code.applies_to) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR(20), NULL::DECIMAL(10,2), 'Discount code not applicable to this purchase';
    RETURN;
  END IF;

  -- Check minimum purchase amount
  IF v_code.min_purchase_amount IS NOT NULL AND p_amount < v_code.min_purchase_amount THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR(20), NULL::DECIMAL(10,2),
      'Minimum purchase amount of £' || v_code.min_purchase_amount || ' required';
    RETURN;
  END IF;

  -- All checks passed - use explicit column names to avoid ambiguity
  RETURN QUERY SELECT
    true::BOOLEAN,
    v_code.id::UUID,
    v_code.discount_type::VARCHAR(20),
    v_code.discount_value::DECIMAL(10,2),
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
