-- Migration: Add discount code tracking tables
-- This adds the discount_codes and discount_code_usage tables to support discount tracking in admin dashboard

-- ============================================
-- DISCOUNT CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  applies_to TEXT CHECK (applies_to IN ('all', 'assessment', 'subscription', 'individual_day', 'extra_days')) DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DISCOUNT CODE USAGE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  used_for TEXT CHECK (used_for IN ('assessment', 'subscription', 'individual_day', 'extra_days')) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;

-- Policies for discount_codes (everyone can read active codes)
CREATE POLICY "Anyone can view active discount codes" ON discount_codes
  FOR SELECT USING (is_active = TRUE);

-- Policies for discount_code_usage (users can view their own usage, admins can view all)
CREATE POLICY "Users can view own discount usage" ON discount_code_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Insert the existing FIRST50 discount code
INSERT INTO discount_codes (code, description, discount_type, discount_value, applies_to, is_active)
VALUES ('FIRST50', '50% off first subscription', 'percentage', 50.00, 'subscription', true)
ON CONFLICT (code) DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_discount_usage_user_id ON discount_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_code_id ON discount_code_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Discount tracking tables created: discount_codes and discount_code_usage';
END $$;
