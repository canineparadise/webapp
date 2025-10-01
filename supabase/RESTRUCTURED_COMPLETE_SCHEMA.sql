-- =====================================================
-- RESTRUCTURED CANINE PARADISE DATABASE
-- No assessment forms - everything in dog profiles & owner agreements
-- =====================================================

-- Drop assessment-related tables if they exist
DROP TABLE IF EXISTS public.assessment_forms CASCADE;
DROP TABLE IF EXISTS public.assessment_requests CASCADE;
DROP TABLE IF EXISTS public.assessment_schedule CASCADE;

-- Clean up existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS dog_gender CASCADE;
DROP TYPE IF EXISTS dog_size CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;

-- Create all enums
CREATE TYPE user_role AS ENUM ('client', 'staff', 'admin');
CREATE TYPE dog_gender AS ENUM ('male', 'female');
CREATE TYPE dog_size AS ENUM ('small', 'medium', 'large', 'extra_large');
CREATE TYPE subscription_tier AS ENUM ('none', '4_days', '8_days', '12_days', '16_days', '20_days');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE document_type AS ENUM ('vaccination', 'dog_photo', 'medical_record', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'needs_info');

-- Enhanced profiles table with owner info and agreements
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,

  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,

  -- Emergency Contacts (can have multiple)
  emergency_contacts JSONB DEFAULT '[]',
  -- Format: [{"name": "John Doe", "phone": "07123456789", "relationship": "Spouse"}]

  -- Agreements & Legal
  terms_agreed BOOLEAN DEFAULT false,
  terms_agreed_date TIMESTAMPTZ,
  injury_waiver_agreed BOOLEAN DEFAULT false,
  injury_waiver_agreed_date TIMESTAMPTZ,
  photo_permission BOOLEAN DEFAULT false,
  photo_permission_date TIMESTAMPTZ,
  payment_terms_agreed BOOLEAN DEFAULT false,
  payment_terms_agreed_date TIMESTAMPTZ,

  -- Digital Signature
  digital_signature TEXT,
  signature_date TIMESTAMPTZ,

  -- Account Settings
  role user_role DEFAULT 'client',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false}',

  -- Onboarding Status
  profile_complete BOOLEAN DEFAULT false,
  has_dogs BOOLEAN DEFAULT false,
  all_agreements_signed BOOLEAN DEFAULT false,

  -- Stats
  member_since DATE DEFAULT CURRENT_DATE,
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complete dog profiles with ALL information
CREATE TABLE IF NOT EXISTS public.dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Basic Information
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_years INTEGER NOT NULL,
  age_months INTEGER DEFAULT 0,
  date_of_birth DATE,
  gender dog_gender NOT NULL,
  size dog_size NOT NULL,
  weight DECIMAL(5,2),
  color TEXT,
  microchip_number TEXT,

  -- Photos
  photo_url TEXT,
  additional_photos TEXT[], -- Array of photo URLs

  -- Health Status
  neutered BOOLEAN DEFAULT false,
  neutered_date DATE,
  must_be_neutered_by DATE, -- Auto-calculated: 12 months from birth

  -- Vaccination Information
  vaccinated BOOLEAN DEFAULT false,
  vaccination_dates JSONB DEFAULT '{}',
  -- Format: {"DHPP": "2024-01-15", "Rabies": "2024-01-15", "KennelCough": "2024-01-15"}
  vaccination_expiry DATE,
  kennel_cough_vaccine_date DATE,

  -- Medical Information
  medical_conditions TEXT,
  ongoing_treatments TEXT,
  previous_surgeries TEXT,

  -- Medications
  current_medications JSONB DEFAULT '[]',
  -- Format: [{"name": "Heart medication", "dosage": "1 tablet", "frequency": "Twice daily", "instructions": "With food"}]
  medication_administration_notes TEXT,

  -- Allergies & Dietary
  allergies TEXT,
  food_allergies TEXT,
  dietary_requirements TEXT,
  feeding_schedule TEXT,
  treats_allowed BOOLEAN DEFAULT true,
  treats_restrictions TEXT,

  -- Behavior Profile
  temperament TEXT,
  energy_level TEXT, -- 'Low', 'Medium', 'High', 'Very High'
  socialization_level TEXT, -- 'Excellent', 'Good', 'Needs Work', 'Poor'
  good_with_dogs BOOLEAN DEFAULT true,
  good_with_puppies BOOLEAN DEFAULT true,
  good_with_cats BOOLEAN,
  good_with_children BOOLEAN,

  -- Training & Commands
  house_trained BOOLEAN DEFAULT true,
  crate_trained BOOLEAN,
  known_commands TEXT[],
  training_notes TEXT,

  -- Behavioral Issues
  separation_anxiety BOOLEAN DEFAULT false,
  separation_anxiety_details TEXT,
  resource_guarding BOOLEAN DEFAULT false,
  resource_guarding_details TEXT,
  leash_reactive BOOLEAN DEFAULT false,
  leash_reactive_details TEXT,
  fear_triggers TEXT,
  aggression_triggers TEXT,

  -- Play Style & Preferences
  play_style TEXT, -- 'Gentle', 'Moderate', 'Rough', 'Solo'
  favorite_activities TEXT[],
  favorite_toys TEXT[],
  dislikes TEXT,
  best_friends TEXT[], -- Names of other dogs they play well with
  dogs_to_avoid TEXT[], -- Names of dogs to keep separate from

  -- Special Requirements
  special_handling_instructions TEXT,
  mobility_issues BOOLEAN DEFAULT false,
  mobility_issues_details TEXT,
  requires_special_supervision BOOLEAN DEFAULT false,
  supervision_details TEXT,

  -- Veterinary Information
  vet_name TEXT,
  vet_phone TEXT,
  vet_address TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,

  -- Emergency Information
  emergency_medical_consent BOOLEAN DEFAULT false,
  max_vet_cost_approval DECIMAL(10,2),

  -- Additional Notes
  additional_notes TEXT,
  staff_notes TEXT, -- Internal notes from staff
  incident_history TEXT[],

  -- Approval & Status
  approval_status approval_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_date TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Documents Status
  has_vaccination_docs BOOLEAN DEFAULT false,
  vaccination_docs_verified BOOLEAN DEFAULT false,
  documents_complete BOOLEAN DEFAULT false,

  -- Visit Statistics
  first_visit_date DATE,
  last_visit_date DATE,
  total_visits INTEGER DEFAULT 0,
  favorite_staff_member TEXT,

  -- System Fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT max_4_dogs_per_owner CHECK (
    (SELECT COUNT(*) FROM public.dogs WHERE owner_id = dogs.owner_id) <= 4
  )
);

-- Documents table for vaccination certs, medical records, etc.
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  expiry_date DATE,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,

  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal agreements tracking
CREATE TABLE IF NOT EXISTS public.legal_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Terms & Conditions
  terms_version TEXT NOT NULL,
  terms_agreed BOOLEAN DEFAULT false,
  terms_agreed_date TIMESTAMPTZ,

  -- Injury & Disease Waiver
  injury_waiver_version TEXT NOT NULL,
  injury_waiver_agreed BOOLEAN DEFAULT false,
  injury_waiver_agreed_date TIMESTAMPTZ,

  -- Photo Permission
  photo_permission_version TEXT NOT NULL,
  photo_permission_granted BOOLEAN DEFAULT false,
  photo_permission_date TIMESTAMPTZ,
  social_media_handles TEXT, -- Optional: their social media for tagging

  -- Payment Terms
  payment_terms_version TEXT NOT NULL,
  payment_terms_agreed BOOLEAN DEFAULT false,
  payment_terms_agreed_date TIMESTAMPTZ,

  -- Uncastrated Dog Policy
  uncastrated_policy_version TEXT NOT NULL,
  uncastrated_policy_agreed BOOLEAN DEFAULT false,
  uncastrated_policy_agreed_date TIMESTAMPTZ,

  -- Digital Signature
  digital_signature TEXT NOT NULL,
  signature_ip_address INET,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions remain the same
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'none',
  days_included INTEGER DEFAULT 0,
  days_used INTEGER DEFAULT 0,
  days_remaining INTEGER GENERATED ALWAYS AS (days_included - days_used) STORED,
  monthly_price DECIMAL(10,2),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,

  is_active BOOLEAN DEFAULT true,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily capacity management
CREATE TABLE IF NOT EXISTS public.daily_capacity (
  date DATE PRIMARY KEY,
  max_dogs INTEGER DEFAULT 40,
  current_bookings INTEGER DEFAULT 0,
  spots_remaining INTEGER GENERATED ALWAYS AS (max_dogs - current_bookings) STORED,
  is_open BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,

  -- Dogs in this booking
  dog_ids UUID[] NOT NULL,
  total_dogs INTEGER NOT NULL,

  -- Pricing
  daily_rate DECIMAL(10,2) DEFAULT 40.00,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Status
  status booking_status DEFAULT 'pending',
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,

  -- Payment
  payment_status payment_status DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,

  -- Subscription booking
  subscription_id UUID REFERENCES public.subscriptions(id),
  is_subscription_booking BOOLEAN DEFAULT false,

  -- Notes
  special_instructions TEXT,
  staff_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Visit history for each dog
CREATE TABLE IF NOT EXISTS public.visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,

  -- Check in/out
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id),
  checked_out_by UUID REFERENCES public.profiles(id),

  -- Day details
  activities TEXT[],
  meal_times JSONB DEFAULT '[]',
  bathroom_breaks INTEGER DEFAULT 0,
  nap_times JSONB DEFAULT '[]',

  -- Social interactions
  played_with TEXT[], -- Names of other dogs
  play_notes TEXT,

  -- Behavior & Health
  behavior_notes TEXT,
  health_notes TEXT,
  incidents TEXT[],
  medication_given JSONB DEFAULT '[]',

  -- Photos from the day
  photos TEXT[],

  -- Report card
  report_card JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents/Injuries tracking
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES public.dogs(id),
  other_dog_id UUID REFERENCES public.dogs(id), -- If another dog was involved
  incident_date TIMESTAMPTZ NOT NULL,
  incident_type TEXT NOT NULL, -- 'Nipped Ear', 'Paw Injury', 'Bite', 'Eye Injury', etc.

  -- Details
  description TEXT NOT NULL,
  injury_severity TEXT, -- 'Minor', 'Moderate', 'Severe'
  body_part_affected TEXT,

  -- Actions taken
  first_aid_given BOOLEAN DEFAULT false,
  first_aid_details TEXT,
  vet_visit_required BOOLEAN DEFAULT false,
  vet_visit_details TEXT,

  -- Notifications
  owner_notified BOOLEAN DEFAULT false,
  owner_notified_time TIMESTAMPTZ,
  owner_response TEXT,

  -- Follow up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_date DATE,

  -- Staff involved
  reported_by UUID NOT NULL REFERENCES public.profiles(id),
  handled_by UUID REFERENCES public.profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing configuration
CREATE TABLE IF NOT EXISTS public.pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier NOT NULL UNIQUE,
  days_included INTEGER NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  savings_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing
INSERT INTO public.pricing_config (tier, days_included, price_per_day, monthly_price, savings_amount) VALUES
('4_days', 4, 40.00, 160.00, 0.00),
('8_days', 8, 38.00, 304.00, 16.00),
('12_days', 12, 37.00, 444.00, 36.00),
('16_days', 16, 36.00, 576.00, 64.00),
('20_days', 20, 35.00, 700.00, 100.00)
ON CONFLICT DO NOTHING;

-- Welcome messages
CREATE TABLE IF NOT EXISTS public.welcome_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert welcome messages
INSERT INTO public.welcome_messages (message) VALUES
('🐾 Welcome back! Your pups are going to have an amazing day!'),
('🦴 Ready for some tail-wagging fun? We are!'),
('🎾 Another day in paradise for your furry friends!'),
('💛 We missed you and your wonderful pups!'),
('🐕 Time for some pawsome adventures!'),
('✨ Your dogs are about to have the best day ever!'),
('🌟 Welcome to where every dog is a star!'),
('🎉 Let the tail-wagging begin!'),
('🏃 Ready, set, PLAY TIME!'),
('❤️ Your pups make our day brighter!')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dogs_owner_id ON public.dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_dogs_approval_status ON public.dogs(approval_status);
CREATE INDEX IF NOT EXISTS idx_documents_dog_id ON public.documents(dog_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_visit_history_dog_id ON public.visit_history(dog_id);
CREATE INDEX IF NOT EXISTS idx_visit_history_date ON public.visit_history(visit_date);
CREATE INDEX IF NOT EXISTS idx_incidents_dog_id ON public.incidents(dog_id);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON public.incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_legal_agreements_user_id ON public.legal_agreements(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON public.dogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_legal_agreements_updated_at BEFORE UPDATE ON public.legal_agreements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_capacity_updated_at BEFORE UPDATE ON public.daily_capacity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if all agreements are signed
CREATE OR REPLACE FUNCTION check_agreements_complete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET all_agreements_signed = (
    SELECT COUNT(*) > 0 FROM public.legal_agreements
    WHERE user_id = NEW.user_id
    AND terms_agreed = true
    AND injury_waiver_agreed = true
    AND payment_terms_agreed = true
    AND uncastrated_policy_agreed = true
  )
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update agreement status
CREATE TRIGGER update_agreements_status
AFTER INSERT OR UPDATE ON public.legal_agreements
FOR EACH ROW EXECUTE FUNCTION check_agreements_complete();

-- Function to calculate neutered by date
CREATE OR REPLACE FUNCTION calculate_neutered_by_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.must_be_neutered_by = NEW.date_of_birth + INTERVAL '12 months';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for neutered by date
CREATE TRIGGER set_neutered_by_date
BEFORE INSERT OR UPDATE ON public.dogs
FOR EACH ROW EXECUTE FUNCTION calculate_neutered_by_date();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Dogs
CREATE POLICY "Users can manage own dogs" ON public.dogs FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Staff can view all dogs" ON public.dogs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);
CREATE POLICY "Staff can update dog approval" ON public.dogs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Documents
CREATE POLICY "Users can manage own dog documents" ON public.documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.dogs WHERE id = documents.dog_id AND owner_id = auth.uid())
);
CREATE POLICY "Staff can manage all documents" ON public.documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Legal Agreements
CREATE POLICY "Users can manage own agreements" ON public.legal_agreements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all agreements" ON public.legal_agreements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can manage all subscriptions" ON public.subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Bookings
CREATE POLICY "Users can manage own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Staff can manage all bookings" ON public.bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Visit History
CREATE POLICY "Users can view own dog visits" ON public.visit_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.dogs WHERE id = visit_history.dog_id AND owner_id = auth.uid())
);
CREATE POLICY "Staff can manage all visits" ON public.visit_history FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Incidents
CREATE POLICY "Users can view own dog incidents" ON public.incidents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.dogs WHERE id = incidents.dog_id AND owner_id = auth.uid())
);
CREATE POLICY "Staff can manage all incidents" ON public.incidents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Daily Capacity
CREATE POLICY "Anyone can view capacity" ON public.daily_capacity FOR SELECT USING (true);
CREATE POLICY "Staff can manage capacity" ON public.daily_capacity FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Pricing Config
CREATE POLICY "Anyone can view pricing" ON public.pricing_config FOR SELECT USING (true);
CREATE POLICY "Admin can manage pricing" ON public.pricing_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Welcome Messages
CREATE POLICY "Anyone can view messages" ON public.welcome_messages FOR SELECT USING (true);
CREATE POLICY "Admin can manage messages" ON public.welcome_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('dog-photos', 'dog-photos', true),
('vaccination-docs', 'vaccination-docs', false),
('medical-records', 'medical-records', false),
('visit-photos', 'visit-photos', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload dog photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'dog-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Everyone can view dog photos" ON storage.objects
FOR SELECT USING (bucket_id = 'dog-photos');

CREATE POLICY "Users can upload docs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('vaccination-docs', 'medical-records') AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own docs" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('vaccination-docs', 'medical-records') AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Staff can view all docs" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('vaccination-docs', 'medical-records') AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Pre-populate capacity
INSERT INTO public.daily_capacity (date, max_dogs, current_bookings, is_open)
SELECT
  generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', '1 day')::date,
  40,
  0,
  CASE
    WHEN EXTRACT(DOW FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', '1 day')) IN (0, 6) THEN false
    ELSE true
  END
ON CONFLICT DO NOTHING;

-- Success
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '🎉 RESTRUCTURED SYSTEM CREATED!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Key Changes:';
    RAISE NOTICE '• NO assessment forms - removed completely';
    RAISE NOTICE '• Each dog has COMPLETE profile with all info';
    RAISE NOTICE '• Owner agreements & legal waivers table';
    RAISE NOTICE '• Comprehensive injury/incident tracking';
    RAISE NOTICE '• Enhanced medical & behavior profiles per dog';
    RAISE NOTICE '• Digital signatures for all agreements';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Legal Coverage:';
    RAISE NOTICE '• Terms & Conditions';
    RAISE NOTICE '• Injury/Disease Waiver';
    RAISE NOTICE '• Photo Permission';
    RAISE NOTICE '• Payment Terms';
    RAISE NOTICE '• Uncastrated Dog Policy';
    RAISE NOTICE '';
    RAISE NOTICE '🐕 Dog Profiles Include:';
    RAISE NOTICE '• Complete medical history';
    RAISE NOTICE '• Medication administration';
    RAISE NOTICE '• Behavioral assessment';
    RAISE NOTICE '• Emergency vet consent';
    RAISE NOTICE '• Individual requirements';
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
END $$;