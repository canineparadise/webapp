-- Canine Paradise Database - Safe Migration Script
-- This script safely adds missing tables/columns without errors

-- ============================================
-- DOGS TABLE - Add missing columns if they don't exist
-- ============================================
DO $$
BEGIN
  -- Add has_vaccination_docs column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dogs' AND column_name='has_vaccination_docs') THEN
    ALTER TABLE dogs ADD COLUMN has_vaccination_docs BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================
-- SUBSCRIPTION TIERS - Ensure they exist
-- ============================================
INSERT INTO subscription_tiers (name, days_included, monthly_price, price_per_day, description) VALUES
  ('Basic - 4 Days/Month', 4, 160.00, 40.00, 'Perfect for occasional visits'),
  ('Standard - 8 Days/Month', 8, 304.00, 38.00, 'Great for regular care'),
  ('Plus - 12 Days/Month', 12, 456.00, 38.00, 'Ideal for active pups'),
  ('Premium - 16 Days/Month', 16, 576.00, 36.00, 'Best value for frequent visits'),
  ('Ultimate - 20 Days/Month', 20, 720.00, 36.00, 'Maximum daycare fun')
ON CONFLICT (name) DO UPDATE SET
  days_included = EXCLUDED.days_included,
  monthly_price = EXCLUDED.monthly_price,
  price_per_day = EXCLUDED.price_per_day,
  description = EXCLUDED.description;

-- ============================================
-- DAYCARE SETTINGS - Ensure they exist
-- ============================================
INSERT INTO daycare_settings (setting_key, setting_value) VALUES
  ('daily_capacity', '40'),
  ('assessment_days', '["Friday"]'),
  ('operating_hours_start', '07:00:00'),
  ('operating_hours_end', '19:00:00'),
  ('booking_reminder_hours', '12')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- STORAGE BUCKETS - Create if they don't exist
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dog-photos', 'dog-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES - Drop and recreate to avoid conflicts
-- ============================================
DROP POLICY IF EXISTS "Anyone can view dog photos" ON storage.objects;
CREATE POLICY "Anyone can view dog photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'dog-photos');

DROP POLICY IF EXISTS "Users can upload dog photos" ON storage.objects;
CREATE POLICY "Users can upload dog photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'dog-photos' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Create test user
-- ============================================
-- Note: Run this separately in Supabase Auth section OR use Dashboard
-- Email: test@canine.com
-- Password: TestPassword123!
