-- ============================================
-- CANINE PARADISE - COMPLETE DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. DOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_years INTEGER NOT NULL,
  age_months INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large', 'extra_large')),
  weight_kg DECIMAL(5,2),
  neutered BOOLEAN DEFAULT FALSE,
  vaccinated BOOLEAN DEFAULT FALSE,
  has_vaccination_docs BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  energy_level TEXT CHECK (energy_level IN ('low', 'moderate', 'high', 'very_high')),
  behavior_notes TEXT,
  medical_conditions TEXT,
  medications TEXT,
  allergies TEXT,
  special_dietary_requirements TEXT,
  good_with_dogs BOOLEAN DEFAULT TRUE,
  good_with_puppies BOOLEAN DEFAULT TRUE,
  good_with_people BOOLEAN DEFAULT TRUE,
  separation_anxiety BOOLEAN DEFAULT FALSE,
  vet_name TEXT,
  vet_phone TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  assessment_completed BOOLEAN DEFAULT FALSE,
  assessment_date DATE,
  assessment_notes TEXT,
  total_visits INTEGER DEFAULT 0,
  last_visit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own dogs" ON dogs;
CREATE POLICY "Users can view own dogs" ON dogs
  FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own dogs" ON dogs;
CREATE POLICY "Users can insert own dogs" ON dogs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own dogs" ON dogs;
CREATE POLICY "Users can update own dogs" ON dogs
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own dogs" ON dogs;
CREATE POLICY "Users can delete own dogs" ON dogs
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- 3. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vaccination', 'medical', 'insurance', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own dogs documents" ON documents;
CREATE POLICY "Users can view own dogs documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dogs WHERE dogs.id = documents.dog_id AND dogs.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own dogs documents" ON documents;
CREATE POLICY "Users can insert own dogs documents" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs WHERE dogs.id = documents.dog_id AND dogs.owner_id = auth.uid()
    )
  );

-- ============================================
-- 4. SUBSCRIPTION TIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  days_included INTEGER NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subscription tiers" ON subscription_tiers;
CREATE POLICY "Anyone can view subscription tiers" ON subscription_tiers
  FOR SELECT USING (is_active = TRUE);

-- Insert default pricing tiers
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
-- 5. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  days_included INTEGER NOT NULL,
  days_remaining INTEGER NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  next_billing_date DATE,
  stripe_subscription_id TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  booking_date DATE NOT NULL,
  drop_off_time TIME DEFAULT '07:00:00',
  pick_up_time TIME DEFAULT '19:00:00',
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')) DEFAULT 'confirmed',
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  special_instructions TEXT,
  staff_notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dog_id, booking_date)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookings" ON bookings;
CREATE POLICY "Users can insert own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;
CREATE POLICY "Users can delete own bookings" ON bookings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. ASSESSMENT SCHEDULE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  confirmed_date DATE,
  time_slot TIME DEFAULT '09:00:00',
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE assessment_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assessments" ON assessment_schedule;
CREATE POLICY "Users can view own assessments" ON assessment_schedule
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessments" ON assessment_schedule;
CREATE POLICY "Users can insert own assessments" ON assessment_schedule
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON assessment_schedule;
CREATE POLICY "Users can update own assessments" ON assessment_schedule
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 8. LEGAL AGREEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS legal_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  liability_waiver_accepted BOOLEAN DEFAULT FALSE,
  liability_waiver_accepted_at TIMESTAMP WITH TIME ZONE,
  photo_consent BOOLEAN DEFAULT FALSE,
  photo_consent_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE legal_agreements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own agreements" ON legal_agreements;
CREATE POLICY "Users can view own agreements" ON legal_agreements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own agreements" ON legal_agreements;
CREATE POLICY "Users can insert own agreements" ON legal_agreements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own agreements" ON legal_agreements;
CREATE POLICY "Users can update own agreements" ON legal_agreements
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 9. DAYCARE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daycare_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE daycare_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view settings" ON daycare_settings;
CREATE POLICY "Anyone can view settings" ON daycare_settings
  FOR SELECT USING (TRUE);

-- Insert default settings
INSERT INTO daycare_settings (setting_key, setting_value) VALUES
  ('daily_capacity', '40'),
  ('assessment_days', '["Friday"]'),
  ('operating_hours_start', '07:00:00'),
  ('operating_hours_end', '19:00:00'),
  ('booking_reminder_hours', '12')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value;

-- ============================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_dogs_updated_at ON dogs;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS update_assessment_schedule_updated_at ON assessment_schedule;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON dogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_schedule_updated_at BEFORE UPDATE ON assessment_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 11. INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_dogs_owner_id ON dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_dog_date ON bookings(dog_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_documents_dog ON documents(dog_id);
CREATE INDEX IF NOT EXISTS idx_assessment_user ON assessment_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_dog ON assessment_schedule(dog_id);

-- ============================================
-- 12. STORAGE BUCKETS
-- ============================================

-- Create storage bucket for dog photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('dog-photos', 'dog-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can view dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- Storage policies for dog-photos bucket
CREATE POLICY "Anyone can view dog photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'dog-photos');

CREATE POLICY "Users can upload dog photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'dog-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own dog photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'dog-photos' AND
    auth.role() = 'authenticated'
  );

-- Storage policies for documents bucket
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- DONE!
-- Next step: Create test user in Authentication > Users
-- Email: test@canine.com
-- Password: TestPassword123!
-- ============================================
