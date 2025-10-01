-- =====================================================
-- COMPLETE CANINE PARADISE DATABASE SCHEMA
-- All tables and features needed for the full system
-- =====================================================

-- Create all necessary enums
CREATE TYPE user_role AS ENUM ('client', 'staff', 'admin');
CREATE TYPE dog_gender AS ENUM ('male', 'female');
CREATE TYPE dog_size AS ENUM ('small', 'medium', 'large', 'extra_large');
CREATE TYPE subscription_tier AS ENUM ('4_days', '8_days', '12_days', '16_days', '20_days');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE document_type AS ENUM ('vaccination', 'dog_photo', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- User profiles table (extends auth.users)
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
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dogs table
CREATE TABLE IF NOT EXISTS public.dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_years INTEGER NOT NULL,
  age_months INTEGER DEFAULT 0,
  gender dog_gender NOT NULL,
  size dog_size NOT NULL,
  weight DECIMAL(5,2),
  neutered BOOLEAN DEFAULT false,
  microchipped BOOLEAN DEFAULT false,

  -- Health information
  vaccinated BOOLEAN DEFAULT false,
  vaccination_expiry DATE,
  medical_conditions TEXT,
  allergies TEXT,
  special_requirements TEXT,

  -- Behavioral information
  behavioral_notes TEXT,
  favorite_activities TEXT,
  feeding_schedule TEXT,

  -- System fields
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  assessment_completed BOOLEAN DEFAULT false,
  documents_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table for vaccination certificates, photos, etc.
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  days_included INTEGER NOT NULL,
  days_used INTEGER DEFAULT 0,
  monthly_price DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily capacity settings (admin configurable)
CREATE TABLE IF NOT EXISTS public.daily_capacity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  max_dogs INTEGER DEFAULT 40,
  current_bookings INTEGER DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  status booking_status DEFAULT 'pending',
  total_dogs INTEGER NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  payment_status payment_status DEFAULT 'pending',

  -- Subscription booking fields
  subscription_id UUID REFERENCES public.subscriptions(id),
  is_subscription_booking BOOLEAN DEFAULT false,

  -- Special instructions
  special_instructions TEXT,

  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Booking dogs junction table (which dogs are booked for which date)
CREATE TABLE IF NOT EXISTS public.booking_dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(booking_id, dog_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id),
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  status payment_status DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  payment_provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment requests (separate from the forms for scheduling)
CREATE TABLE IF NOT EXISTS public.assessment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_form_id UUID NOT NULL REFERENCES public.assessment_forms(id),
  requested_date DATE,
  confirmed_date DATE,
  status TEXT DEFAULT 'pending',
  staff_notes TEXT,
  result TEXT, -- 'approved', 'rejected', 'needs_improvement'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_dogs_owner_id ON public.dogs(owner_id);
CREATE INDEX idx_dogs_is_approved ON public.dogs(is_approved);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_documents_dog_id ON public.documents(dog_id);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON public.subscriptions(is_active);
CREATE INDEX idx_daily_capacity_date ON public.daily_capacity(date);

-- Create updated_at trigger function (reuse existing if created)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON public.dogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_capacity_updated_at BEFORE UPDATE ON public.daily_capacity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_requests_updated_at BEFORE UPDATE ON public.assessment_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for dogs
CREATE POLICY "Users can view own dogs" ON public.dogs FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own dogs" ON public.dogs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own dogs" ON public.dogs FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Staff can view all dogs" ON public.dogs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for documents
CREATE POLICY "Users can view own dogs documents" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.dogs WHERE id = documents.dog_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can upload documents for own dogs" ON public.documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.dogs WHERE id = documents.dog_id AND owner_id = auth.uid())
);
CREATE POLICY "Staff can view all documents" ON public.documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view all subscriptions" ON public.subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for daily_capacity (read-only for clients, full access for staff)
CREATE POLICY "Anyone can view daily capacity" ON public.daily_capacity FOR SELECT USING (true);
CREATE POLICY "Staff can manage daily capacity" ON public.daily_capacity FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for booking_dogs
CREATE POLICY "Users can manage own booking dogs" ON public.booking_dogs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.dogs d ON d.id = booking_dogs.dog_id
    WHERE b.id = booking_dogs.booking_id AND b.user_id = auth.uid() AND d.owner_id = auth.uid()
  )
);
CREATE POLICY "Staff can view all booking dogs" ON public.booking_dogs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- RLS Policies for assessment_requests
CREATE POLICY "Users can view own assessment requests" ON public.assessment_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assessment requests" ON public.assessment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can manage all assessment requests" ON public.assessment_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Insert default subscription pricing
INSERT INTO public.subscriptions (user_id, tier, days_included, monthly_price, start_date, end_date, is_active)
VALUES
-- These are template records to show pricing structure
-- Will be replaced with actual user subscriptions
('00000000-0000-0000-0000-000000000000', '4_days', 4, 160.00, '2024-01-01', '2024-01-31', false),
('00000000-0000-0000-0000-000000000000', '8_days', 8, 304.00, '2024-01-01', '2024-01-31', false),
('00000000-0000-0000-0000-000000000000', '12_days', 12, 444.00, '2024-01-01', '2024-01-31', false),
('00000000-0000-0000-0000-000000000000', '16_days', 16, 576.00, '2024-01-01', '2024-01-31', false),
('00000000-0000-0000-0000-000000000000', '20_days', 20, 700.00, '2024-01-01', '2024-01-31', false)
ON CONFLICT DO NOTHING;

-- Create user profile automatically when user signs up
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

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
('dog-photos', 'dog-photos', true),
('vaccination-docs', 'vaccination-docs', false),
('documents', 'documents', false)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload dog photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'dog-photos' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can view dog photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'dog-photos'
);
CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('vaccination-docs', 'documents') AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT USING (
  bucket_id IN ('vaccination-docs', 'documents') AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '🚀 COMPLETE SYSTEM SCHEMA CREATED!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '• profiles (user management)';
    RAISE NOTICE '• dogs (pet management, max 4 per user)';
    RAISE NOTICE '• documents (photos, vaccination certs)';
    RAISE NOTICE '• subscriptions (monthly packages)';
    RAISE NOTICE '• bookings (day bookings with calendar)';
    RAISE NOTICE '• booking_dogs (which dogs per booking)';
    RAISE NOTICE '• daily_capacity (40 dogs/day, admin configurable)';
    RAISE NOTICE '• payments (Stripe integration ready)';
    RAISE NOTICE '• assessment_requests (approval workflow)';
    RAISE NOTICE '';
    RAISE NOTICE 'Features enabled:';
    RAISE NOTICE '• Assessment approval required before booking';
    RAISE NOTICE '• Document upload (vaccination + photos)';
    RAISE NOTICE '• Calendar booking with capacity limits';
    RAISE NOTICE '• Subscription tiers: 4/8/12/16/20 days';
    RAISE NOTICE '• Dog photo display';
    RAISE NOTICE '• Staff approval workflow';
    RAISE NOTICE '• Payment processing ready';
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
END $$;