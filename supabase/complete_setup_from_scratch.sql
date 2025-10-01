-- =====================================================
-- COMPLETE SETUP FROM SCRATCH
-- Run this if you have an empty database
-- =====================================================

-- 1. CREATE PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  postcode VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  has_dogs BOOLEAN DEFAULT false,
  total_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE DOGS TABLE WITH ALL FIELDS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100) NOT NULL,
  age_years INTEGER NOT NULL CHECK (age_years >= 0),
  age_months INTEGER DEFAULT 0 CHECK (age_months >= 0 AND age_months < 12),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  size VARCHAR(20) NOT NULL CHECK (size IN ('small', 'medium', 'large', 'extra_large')),
  weight DECIMAL(5,2),
  color VARCHAR(100),
  neutered BOOLEAN DEFAULT false,
  microchipped BOOLEAN DEFAULT false,

  -- Health Information
  vaccinated BOOLEAN DEFAULT false,
  vaccination_expiry DATE,
  flea_treatment BOOLEAN DEFAULT false,
  worming_treatment BOOLEAN DEFAULT false,
  heartworm_prevention BOOLEAN DEFAULT false,
  medical_conditions TEXT,
  current_medications JSONB DEFAULT '[]',
  medication_requirements TEXT,
  allergies TEXT,
  can_be_given_treats BOOLEAN DEFAULT true,

  -- Behavioral Profile
  resource_guarding BOOLEAN DEFAULT false,
  separation_anxiety BOOLEAN DEFAULT false,
  excessive_barking BOOLEAN DEFAULT false,
  leash_pulling BOOLEAN DEFAULT false,
  house_trained BOOLEAN DEFAULT true,
  crate_trained BOOLEAN DEFAULT false,
  aggression_triggers TEXT,
  behavioral_challenges TEXT,
  training_needs TEXT,

  -- Social Behavior
  good_with_dogs BOOLEAN DEFAULT true,
  good_with_cats BOOLEAN DEFAULT false,
  good_with_children BOOLEAN DEFAULT true,
  good_with_strangers BOOLEAN DEFAULT true,
  play_style TEXT,

  -- Safety Information
  escape_artist BOOLEAN DEFAULT false,
  fence_jumper BOOLEAN DEFAULT false,
  recall_reliability VARCHAR(20) DEFAULT 'good' CHECK (recall_reliability IN ('excellent', 'good', 'moderate', 'poor')),

  -- Emergency & Vet Information
  vet_name VARCHAR(255),
  vet_phone VARCHAR(50),
  vet_address TEXT,
  emergency_medical_consent BOOLEAN DEFAULT false,
  max_vet_cost_approval DECIMAL(10,2),

  -- Care Instructions
  feeding_schedule TEXT,
  special_requirements TEXT,
  favorite_activities TEXT,
  behavioral_notes TEXT,

  -- Admin Fields
  photo_url TEXT,
  has_vaccination_docs BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  total_visits INTEGER DEFAULT 0,
  last_visit_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE LEGAL AGREEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.legal_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Agreement flags
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  injury_waiver_agreed BOOLEAN NOT NULL DEFAULT false,
  photo_permission_granted BOOLEAN NOT NULL DEFAULT false,
  vaccination_requirement_understood BOOLEAN NOT NULL DEFAULT false,
  behavioral_assessment_agreed BOOLEAN NOT NULL DEFAULT false,
  medication_administration_consent BOOLEAN NOT NULL DEFAULT false,
  emergency_contact_consent BOOLEAN NOT NULL DEFAULT false,
  property_damage_waiver BOOLEAN NOT NULL DEFAULT false,
  collection_procedure_agreed BOOLEAN NOT NULL DEFAULT false,
  data_protection_consent BOOLEAN NOT NULL DEFAULT false,

  -- Signature details
  digital_signature TEXT NOT NULL,
  ip_address INET,
  signed_at TIMESTAMPTZ NOT NULL,
  version VARCHAR(10) DEFAULT '1.0',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one agreement per user
  CONSTRAINT one_agreement_per_user UNIQUE (user_id)
);

-- 4. CREATE ASSESSMENT SCHEDULE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.assessment_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_ids UUID[] NOT NULL,

  -- Scheduling
  preferred_date DATE,
  confirmed_date DATE,
  time_slot VARCHAR(50),

  -- Results
  assessment_result VARCHAR(20) CHECK (assessment_result IN ('pending', 'approved', 'needs_work', 'rejected')),
  assessor_notes TEXT,
  assessed_by UUID REFERENCES auth.users(id),
  assessed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE INCIDENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,

  -- Incident details
  incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('injury', 'illness', 'behavioral', 'accident', 'other')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe')),
  description TEXT NOT NULL,

  -- Actions taken
  immediate_action_taken TEXT,
  vet_visit_required BOOLEAN DEFAULT false,
  vet_visit_details TEXT,
  parent_notified_at TIMESTAMPTZ,

  -- Follow up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,

  -- Metadata
  reported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('vaccination', 'insurance', 'medical', 'other')),
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  expiry_date DATE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_ids UUID[] NOT NULL,
  booking_date DATE NOT NULL,
  drop_off_time TIME DEFAULT '07:00',
  pick_up_time TIME DEFAULT '19:00',
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_instructions TEXT,
  total_price DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREATE SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('basic_4', 'standard_8', 'premium_12', 'unlimited_20')),
  days_included INTEGER NOT NULL,
  days_used INTEGER DEFAULT 0,
  days_remaining INTEGER GENERATED ALWAYS AS (days_included - days_used) STORED,
  price_per_month DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_dogs_owner ON public.dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_legal_agreements_user ON public.legal_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_schedule_user ON public.assessment_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_schedule_date ON public.assessment_schedule(confirmed_date);
CREATE INDEX IF NOT EXISTS idx_incidents_dog ON public.incidents(dog_id);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON public.incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_documents_dog ON public.documents(dog_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- 10. SET UP ROW LEVEL SECURITY
-- =====================================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Dogs RLS
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own dogs" ON public.dogs;
CREATE POLICY "Users can view own dogs" ON public.dogs
  FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own dogs" ON public.dogs;
CREATE POLICY "Users can insert own dogs" ON public.dogs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own dogs" ON public.dogs;
CREATE POLICY "Users can update own dogs" ON public.dogs
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own dogs" ON public.dogs;
CREATE POLICY "Users can delete own dogs" ON public.dogs
  FOR DELETE USING (auth.uid() = owner_id);

-- Legal Agreements RLS
ALTER TABLE public.legal_agreements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own agreements" ON public.legal_agreements;
CREATE POLICY "Users can view own agreements" ON public.legal_agreements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own agreements" ON public.legal_agreements;
CREATE POLICY "Users can insert own agreements" ON public.legal_agreements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own agreements" ON public.legal_agreements;
CREATE POLICY "Users can update own agreements" ON public.legal_agreements
  FOR UPDATE USING (auth.uid() = user_id);

-- Assessment Schedule RLS
ALTER TABLE public.assessment_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assessments" ON public.assessment_schedule;
CREATE POLICY "Users can view own assessments" ON public.assessment_schedule
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessment_schedule;
CREATE POLICY "Users can insert own assessments" ON public.assessment_schedule
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON public.assessment_schedule;
CREATE POLICY "Users can update own assessments" ON public.assessment_schedule
  FOR UPDATE USING (auth.uid() = user_id);

-- Documents RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view documents for own dogs" ON public.documents;
CREATE POLICY "Users can view documents for own dogs" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dogs
      WHERE dogs.id = documents.dog_id
      AND dogs.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert documents for own dogs" ON public.documents;
CREATE POLICY "Users can insert documents for own dogs" ON public.documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dogs
      WHERE dogs.id = dog_id
      AND dogs.owner_id = auth.uid()
    )
  );

-- Bookings RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
CREATE POLICY "Users can insert own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Incidents RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view incidents for own dogs" ON public.incidents;
CREATE POLICY "Users can view incidents for own dogs" ON public.incidents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dogs
      WHERE dogs.id = incidents.dog_id
      AND dogs.owner_id = auth.uid()
    )
  );

-- 11. CREATE TRIGGER FUNCTION FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. CREATE PROFILE TRIGGER ON AUTH.USERS
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. APPLY UPDATED_AT TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dogs_updated_at ON public.dogs;
CREATE TRIGGER update_dogs_updated_at
  BEFORE UPDATE ON public.dogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legal_agreements_updated_at ON public.legal_agreements;
CREATE TRIGGER update_legal_agreements_updated_at
  BEFORE UPDATE ON public.legal_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_schedule_updated_at ON public.assessment_schedule;
CREATE TRIGGER update_assessment_schedule_updated_at
  BEFORE UPDATE ON public.assessment_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_incidents_updated_at ON public.incidents;
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. CREATE STORAGE BUCKETS
-- =====================================================
-- Run this in the Supabase Dashboard under Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('dog-photos', 'dog-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- 15. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.dogs TO authenticated;
GRANT ALL ON public.legal_agreements TO authenticated;
GRANT ALL ON public.assessment_schedule TO authenticated;
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.subscriptions TO authenticated;
GRANT SELECT ON public.incidents TO authenticated;

-- 16. ADD CHECK CONSTRAINT FOR MAX DOGS
-- =====================================================
CREATE OR REPLACE FUNCTION check_max_dogs_per_user()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.dogs WHERE owner_id = NEW.owner_id) >= 4 THEN
    RAISE EXCEPTION 'Maximum of 4 dogs per user allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_max_dogs ON public.dogs;
CREATE TRIGGER enforce_max_dogs
  BEFORE INSERT ON public.dogs
  FOR EACH ROW EXECUTE FUNCTION check_max_dogs_per_user();

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- This creates all tables from scratch with:
-- 1. User profiles
-- 2. Comprehensive dog profiles
-- 3. Legal agreements
-- 4. Assessment scheduling
-- 5. Incident tracking
-- 6. Document storage
-- 7. Bookings
-- 8. Subscriptions
-- 9. All RLS policies
-- 10. All triggers
-- =====================================================