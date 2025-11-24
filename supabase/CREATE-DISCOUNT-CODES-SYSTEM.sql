-- ============================================
-- CREATE DISCOUNT CODES SYSTEM
-- Run this in Supabase SQL Editor to create discount codes tables
-- ============================================

-- ============================================
-- PART 1: CREATE DISCOUNT CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,

  -- Discount details
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL, -- e.g., 10.00 for 10% or £10

  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,

  -- Usage limits
  max_uses INTEGER, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  one_time_per_user BOOLEAN DEFAULT true,

  -- Applicability
  applies_to VARCHAR(50)[] DEFAULT ARRAY['subscription', 'extra_days', 'assessment', 'individual_days'], -- What it can be used for
  min_purchase_amount DECIMAL(10,2), -- Minimum spend to use code

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick code lookup
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);

-- ============================================
-- PART 2: CREATE DISCOUNT CODE USAGE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Usage details
  used_for VARCHAR(50), -- 'subscription', 'extra_days', 'assessment', 'individual_days'
  original_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),

  -- Reference to what was purchased
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Audit
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate usage per user (if one_time_per_user is true)
  UNIQUE(discount_code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_discount_usage_user ON discount_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_code ON discount_code_usage(discount_code_id);

-- ============================================
-- PART 3: CREATE EXTRA DAYS PURCHASES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS extra_days_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,

  -- Purchase details
  quantity INTEGER NOT NULL, -- Number of extra days purchased
  price_per_day DECIMAL(10,2) NOT NULL, -- Price based on subscription tier
  total_amount DECIMAL(10,2) NOT NULL,

  -- Discount applied
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,

  -- Payment
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id VARCHAR(255),
  paypal_order_id VARCHAR(255),

  -- Days tracking
  days_used INTEGER DEFAULT 0,
  days_remaining INTEGER NOT NULL, -- quantity - days_used

  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE, -- Extra days expire at end of billing month

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extra_days_user ON extra_days_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_extra_days_dog ON extra_days_purchases(dog_id);
CREATE INDEX IF NOT EXISTS idx_extra_days_subscription ON extra_days_purchases(subscription_id);

-- ============================================
-- PART 4: UPDATE SUBSCRIPTIONS TO TRACK EXTRA DAYS
-- ============================================

-- Add extra days tracking to subscriptions
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS extra_days_purchased INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_days_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_days_remaining INTEGER DEFAULT 0;

-- ============================================
-- PART 5: CREATE HELPER FUNCTIONS
-- ============================================

-- Function to validate discount code
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
  FROM discount_codes
  WHERE code = p_code AND is_active = true;

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
    FROM discount_code_usage
    WHERE discount_code_id = v_code.id AND user_id = p_user_id;

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

  -- All checks passed
  RETURN QUERY SELECT true, v_code.id, v_code.discount_type, v_code.discount_value, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate discount amount
CREATE OR REPLACE FUNCTION calculate_discount_amount(
  p_original_amount DECIMAL(10,2),
  p_discount_type VARCHAR(20),
  p_discount_value DECIMAL(10,2)
)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  IF p_discount_type = 'percentage' THEN
    RETURN ROUND(p_original_amount * (p_discount_value / 100.0), 2);
  ELSIF p_discount_type = 'fixed_amount' THEN
    -- Don't discount more than the original amount
    RETURN LEAST(p_discount_value, p_original_amount);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 6: CREATE RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE extra_days_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Admins can manage discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Staff can manage discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Users can view their discount usage" ON discount_code_usage;
DROP POLICY IF EXISTS "System can insert discount usage" ON discount_code_usage;
DROP POLICY IF EXISTS "Users can view their extra days purchases" ON extra_days_purchases;
DROP POLICY IF EXISTS "Users can create extra days purchases" ON extra_days_purchases;
DROP POLICY IF EXISTS "Staff can view all extra days purchases" ON extra_days_purchases;

-- Discount codes: Anyone can read active codes (for validation)
CREATE POLICY "Anyone can view active discount codes"
  ON discount_codes FOR SELECT
  USING (is_active = true);

-- Discount codes: Admins can manage
CREATE POLICY "Admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Discount codes: Staff can manage
CREATE POLICY "Staff can manage discount codes"
  ON discount_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Discount code usage: Users can view their own usage
CREATE POLICY "Users can view their discount usage"
  ON discount_code_usage FOR SELECT
  USING (user_id = auth.uid());

-- Discount code usage: System can insert (handled by functions)
CREATE POLICY "System can insert discount usage"
  ON discount_code_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Extra days purchases: Users can view their own
CREATE POLICY "Users can view their extra days purchases"
  ON extra_days_purchases FOR SELECT
  USING (user_id = auth.uid());

-- Extra days purchases: Users can create their own
CREATE POLICY "Users can create extra days purchases"
  ON extra_days_purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Staff/Admin can view all
CREATE POLICY "Staff can view all extra days purchases"
  ON extra_days_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

COMMENT ON TABLE discount_codes IS 'Stores discount/promo codes that can be applied to purchases';
COMMENT ON TABLE discount_code_usage IS 'Tracks which users used which discount codes';
COMMENT ON TABLE extra_days_purchases IS 'Tracks purchases of extra daycare days per dog';

-- ============================================
-- DONE!
-- ============================================
