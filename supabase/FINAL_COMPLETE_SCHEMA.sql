-- =====================================================
-- FINAL COMPLETE CANINE PARADISE SYSTEM
-- Everything needed for a fully functional daycare system
-- =====================================================

-- Clean up existing types (if any)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS dog_gender CASCADE;
DROP TYPE IF EXISTS dog_size CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS assessment_day CASCADE;

-- Create all enums
CREATE TYPE user_role AS ENUM ('client', 'staff', 'admin');
CREATE TYPE dog_gender AS ENUM ('male', 'female');
CREATE TYPE dog_size AS ENUM ('small', 'medium', 'large', 'extra_large');
CREATE TYPE subscription_tier AS ENUM ('none', '4_days', '8_days', '12_days', '16_days', '20_days');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE document_type AS ENUM ('vaccination', 'dog_photo', 'medical', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE assessment_day AS ENUM ('friday');

-- User profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  role user_role DEFAULT 'client',

  -- Onboarding tracking
  email_verified BOOLEAN DEFAULT false,
  form_completed BOOLEAN DEFAULT false,
  has_dogs BOOLEAN DEFAULT false,
  documents_uploaded BOOLEAN DEFAULT false,
  assessment_scheduled BOOLEAN DEFAULT false,
  assessment_approved BOOLEAN DEFAULT false,

  -- Fun stats
  member_since DATE DEFAULT CURRENT_DATE,
  total_visits INTEGER DEFAULT 0,
  favorite_day TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dogs table with visit tracking
CREATE TABLE IF NOT EXISTS public.dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_years INTEGER NOT NULL,
  age_months INTEGER DEFAULT 0,
  gender dog_gender NOT NULL,
  size dog_size NOT NULL,
  weight DECIMAL(5,2),
  color TEXT,

  -- Health info
  neutered BOOLEAN DEFAULT false,
  microchipped BOOLEAN DEFAULT false,
  vaccinated BOOLEAN DEFAULT false,
  vaccination_expiry DATE,

  -- Medical info
  medical_conditions TEXT,
  medications TEXT,
  allergies TEXT,
  special_requirements TEXT,

  -- Behavioral info
  behavioral_notes TEXT,
  favorite_activities TEXT,
  best_friends TEXT[], -- Array of dog names they play well with
  feeding_schedule TEXT,

  -- Photos and documents
  photo_url TEXT,
  has_vaccination_docs BOOLEAN DEFAULT false,

  -- Stats
  first_visit_date DATE,
  total_visits INTEGER DEFAULT 0,
  last_visit_date DATE,
  favorite_activity TEXT,

  -- Approval status
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT max_4_dogs_per_owner CHECK (
    (SELECT COUNT(*) FROM public.dogs WHERE owner_id = dogs.owner_id) <= 4
  )
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  expiry_date DATE, -- For vaccination docs
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment scheduling (Fridays only)
CREATE TABLE IF NOT EXISTS public.assessment_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_form_id UUID NOT NULL REFERENCES public.assessment_forms(id),
  requested_date DATE NOT NULL CHECK (EXTRACT(DOW FROM requested_date) = 5), -- Friday only
  confirmed_date DATE CHECK (EXTRACT(DOW FROM confirmed_date) = 5),
  time_slot TEXT, -- '9:00 AM', '10:00 AM', etc.
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  assessment_result TEXT CHECK (assessment_result IN ('approved', 'rejected', 'needs_improvement')),
  staff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table with current usage
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'none',
  days_included INTEGER DEFAULT 0,
  days_used INTEGER DEFAULT 0,
  days_remaining INTEGER GENERATED ALWAYS AS (days_included - days_used) STORED,
  monthly_price DECIMAL(10,2),

  -- Billing period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one active subscription per user
  CONSTRAINT one_active_subscription UNIQUE (user_id, is_active)
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
  dog_ids UUID[] NOT NULL, -- Array of dog IDs
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
  confirmed_at TIMESTAMPTZ,

  -- Ensure booking doesn't exceed capacity
  CONSTRAINT check_capacity CHECK (
    (SELECT current_bookings FROM public.daily_capacity WHERE date = booking_date) <
    (SELECT max_dogs FROM public.daily_capacity WHERE date = booking_date)
  )
);

-- Visit history for tracking
CREATE TABLE IF NOT EXISTS public.visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  activities TEXT[],
  meal_times TEXT[],
  bathroom_breaks INTEGER DEFAULT 0,
  nap_time BOOLEAN DEFAULT false,
  played_with TEXT[], -- Names of other dogs
  behavior_notes TEXT,
  staff_notes TEXT,
  photos TEXT[], -- URLs of photos from the day
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing configuration (admin managed)
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

-- Welcome messages table
CREATE TABLE IF NOT EXISTS public.welcome_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  author TEXT DEFAULT 'The Canine Paradise Team',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some welcome messages
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dogs_owner_id ON public.dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_dog_id ON public.documents(dog_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_visit_history_dog_id ON public.visit_history(dog_id);
CREATE INDEX IF NOT EXISTS idx_visit_history_date ON public.visit_history(visit_date);
CREATE INDEX IF NOT EXISTS idx_assessment_schedule_user_id ON public.assessment_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON public.dogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_capacity_updated_at BEFORE UPDATE ON public.daily_capacity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_schedule_updated_at BEFORE UPDATE ON public.assessment_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update profile completion status
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update has_dogs flag
  UPDATE public.profiles
  SET has_dogs = EXISTS (SELECT 1 FROM public.dogs WHERE owner_id = NEW.owner_id)
  WHERE id = NEW.owner_id;

  -- Update documents_uploaded flag
  UPDATE public.profiles
  SET documents_uploaded = EXISTS (
    SELECT 1 FROM public.dogs d
    WHERE d.owner_id = NEW.owner_id
    AND d.has_vaccination_docs = true
  )
  WHERE id = NEW.owner_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for dog updates
CREATE TRIGGER update_profile_on_dog_change
AFTER INSERT OR UPDATE OR DELETE ON public.dogs
FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

-- Function to update dog visit stats
CREATE OR REPLACE FUNCTION update_dog_visit_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update dog's visit count and last visit date
  UPDATE public.dogs
  SET
    total_visits = total_visits + 1,
    last_visit_date = NEW.visit_date,
    first_visit_date = COALESCE(first_visit_date, NEW.visit_date)
  WHERE id = NEW.dog_id;

  -- Update owner's total visits
  UPDATE public.profiles
  SET total_visits = total_visits + 1
  WHERE id = (SELECT owner_id FROM public.dogs WHERE id = NEW.dog_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for visit history
CREATE TRIGGER update_stats_on_visit
AFTER INSERT ON public.visit_history
FOR EACH ROW EXECUTE FUNCTION update_dog_visit_stats();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for dogs
CREATE POLICY "Users can manage own dogs" ON public.dogs FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Staff can view all dogs" ON public.dogs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);
CREATE POLICY "Staff can update all dogs" ON public.dogs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for documents
CREATE POLICY "Users can manage own dog documents" ON public.documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.dogs WHERE id = documents.dog_id AND owner_id = auth.uid())
);
CREATE POLICY "Staff can manage all documents" ON public.documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can manage all subscriptions" ON public.subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for bookings
CREATE POLICY "Users can manage own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Staff can manage all bookings" ON public.bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for visit history
CREATE POLICY "Users can view own dog visits" ON public.visit_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.dogs WHERE id = visit_history.dog_id AND owner_id = auth.uid())
);
CREATE POLICY "Staff can manage all visits" ON public.visit_history FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for assessment schedule
CREATE POLICY "Users can manage own assessments" ON public.assessment_schedule FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Staff can manage all assessments" ON public.assessment_schedule FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for daily capacity (read all, write staff only)
CREATE POLICY "Anyone can view capacity" ON public.daily_capacity FOR SELECT USING (true);
CREATE POLICY "Staff can manage capacity" ON public.daily_capacity FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for pricing config
CREATE POLICY "Anyone can view pricing" ON public.pricing_config FOR SELECT USING (true);
CREATE POLICY "Admin can manage pricing" ON public.pricing_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for welcome messages
CREATE POLICY "Anyone can view messages" ON public.welcome_messages FOR SELECT USING (true);
CREATE POLICY "Admin can manage messages" ON public.welcome_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('dog-photos', 'dog-photos', true),
('vaccination-docs', 'vaccination-docs', false),
('visit-photos', 'visit-photos', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload dog photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'dog-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Everyone can view dog photos" ON storage.objects
FOR SELECT USING (bucket_id = 'dog-photos');

CREATE POLICY "Authenticated users can upload vaccination docs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vaccination-docs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own vaccination docs" ON storage.objects
FOR SELECT USING (bucket_id = 'vaccination-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Staff can view all vaccination docs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'vaccination-docs' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Pre-populate some capacity for the next 30 days
INSERT INTO public.daily_capacity (date, max_dogs, current_bookings, is_open)
SELECT
  generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day')::date,
  40,
  0,
  CASE
    WHEN EXTRACT(DOW FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day')) IN (0, 6) THEN false -- Closed weekends
    ELSE true
  END
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '🎉 COMPLETE SYSTEM CREATED SUCCESSFULLY!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Features Ready:';
    RAISE NOTICE '• User profiles with onboarding tracking';
    RAISE NOTICE '• Dogs management (max 4 per user)';
    RAISE NOTICE '• Document uploads (photos & vaccinations)';
    RAISE NOTICE '• Assessment scheduling (Fridays only)';
    RAISE NOTICE '• Subscription tiers (4/8/12/16/20 days)';
    RAISE NOTICE '• Booking calendar with capacity limits';
    RAISE NOTICE '• Visit history and stats tracking';
    RAISE NOTICE '• Welcome messages for fun vibes';
    RAISE NOTICE '• Staff approval workflow';
    RAISE NOTICE '';
    RAISE NOTICE '🐕 Dog Features:';
    RAISE NOTICE '• Photo display';
    RAISE NOTICE '• Visit counter';
    RAISE NOTICE '• Best friends tracking';
    RAISE NOTICE '• Medical info storage';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Dashboard Shows:';
    RAISE NOTICE '• Real onboarding progress';
    RAISE NOTICE '• Assessment status';
    RAISE NOTICE '• Dog approval status';
    RAISE NOTICE '• Upcoming bookings';
    RAISE NOTICE '• Subscription tier';
    RAISE NOTICE '• Visit statistics';
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
END $$;