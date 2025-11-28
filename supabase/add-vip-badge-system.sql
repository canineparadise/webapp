-- ============================================
-- VIP BADGE SYSTEM
-- Golden Paw VIP Founders Club for FIRST50 users
-- ============================================

-- Add VIP badge fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_vip_member BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vip_badge_type TEXT,
ADD COLUMN IF NOT EXISTS vip_granted_at TIMESTAMP WITH TIME ZONE;

-- Update all users who used FIRST50 discount to have VIP badge
UPDATE profiles
SET
  is_vip_member = TRUE,
  vip_badge_type = 'golden_paw_founders',
  vip_granted_at = NOW()
WHERE id IN (
  SELECT DISTINCT user_id
  FROM discount_code_usage
  WHERE discount_code_id IN (
    SELECT id FROM discount_codes WHERE code = 'FIRST50'
  )
);

-- Create index for VIP queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_vip_member ON profiles(is_vip_member);

-- Comment to document the VIP badge types
COMMENT ON COLUMN profiles.vip_badge_type IS 'Types: golden_paw_founders (FIRST50 users), can add more VIP tiers later';
