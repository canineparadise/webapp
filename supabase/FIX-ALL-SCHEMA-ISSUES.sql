-- =====================================================
-- COMPREHENSIVE SCHEMA FIXES
-- Run this to fix all database schema issues found in audit
-- =====================================================

-- ===================
-- 1. ASSESSMENT TABLE FIXES
-- ===================

-- Add missing columns for assessment tracking
ALTER TABLE assessment_schedule
ADD COLUMN IF NOT EXISTS dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_schedule_dog_id ON assessment_schedule(dog_id);
CREATE INDEX IF NOT EXISTS idx_assessment_schedule_stripe_session ON assessment_schedule(stripe_session_id);

-- ===================
-- 2. SUBSCRIPTIONS TABLE FIXES
-- ===================

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  days_included INTEGER NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  session_type session_type DEFAULT 'full_day',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tier_name, session_type)
);

-- Insert full-day tiers
INSERT INTO subscription_tiers (name, tier_name, days_included, monthly_price, price_per_day, session_type, description) VALUES
('Basic - 4 Days/Month', '4_days', 4, 160.00, 40.00, 'full_day', 'Perfect for occasional visits'),
('Standard - 8 Days/Month', '8_days', 8, 304.00, 38.00, 'full_day', 'Great for regular care'),
('Plus - 12 Days/Month', '12_days', 12, 444.00, 37.00, 'full_day', 'Ideal for active pups'),
('Premium - 16 Days/Month', '16_days', 16, 576.00, 36.00, 'full_day', 'Best value for frequent visits'),
('Ultimate - 20 Days/Month', '20_days', 20, 700.00, 35.00, 'full_day', 'Maximum flexibility')
ON CONFLICT (tier_name, session_type) DO NOTHING;

-- Insert half-day tiers
INSERT INTO subscription_tiers (name, tier_name, days_included, monthly_price, price_per_day, session_type, description) VALUES
('Basic Half Day - 4 Half Days/Month', '4_days', 4, 120.00, 30.00, 'half_day', 'Perfect for morning or afternoon sessions'),
('Standard Half Day - 8 Half Days/Month', '8_days', 8, 228.00, 28.50, 'half_day', 'Great for regular half-day care'),
('Plus Half Day - 12 Half Days/Month', '12_days', 12, 333.00, 27.75, 'half_day', 'Ideal for active pups'),
('Premium Half Day - 16 Half Days/Month', '16_days', 16, 432.00, 27.00, 'half_day', 'Best value for frequent half-day visits'),
('Ultimate Half Day - 20 Half Days/Month', '20_days', 20, 500.00, 25.00, 'half_day', 'Maximum half-day flexibility')
ON CONFLICT (tier_name, session_type) DO NOTHING;

-- Enable RLS on subscription_tiers
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active tiers
DROP POLICY IF EXISTS "Anyone can view active tiers" ON subscription_tiers;
CREATE POLICY "Anyone can view active tiers"
ON subscription_tiers FOR SELECT
USING (is_active = true);

-- Add missing columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS tier_id UUID REFERENCES subscription_tiers(id),
ADD COLUMN IF NOT EXISTS session_type session_type DEFAULT 'full_day',
ADD COLUMN IF NOT EXISTS price_per_day DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Make tier column nullable since we're using tier_id
ALTER TABLE subscriptions ALTER COLUMN tier DROP NOT NULL;

-- Add index for tier lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier_id ON subscriptions(tier_id);

-- ===================
-- 3. DOGS TABLE - Assessment Tracking
-- ===================

-- Add assessment tracking to dogs table
ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS assessment_date DATE,
ADD COLUMN IF NOT EXISTS assessment_status TEXT CHECK (assessment_status IN ('pending', 'approved', 'rejected', 'needs_improvement'));

-- ===================
-- VERIFICATION QUERIES
-- ===================

-- Verify assessment_schedule table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'assessment_schedule'
ORDER BY ordinal_position;

-- Verify subscription_tiers were created
SELECT * FROM subscription_tiers WHERE is_active = true ORDER BY session_type, days_included;

-- Verify subscriptions table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Verify dogs table has assessment fields
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dogs' AND column_name LIKE '%assessment%';
