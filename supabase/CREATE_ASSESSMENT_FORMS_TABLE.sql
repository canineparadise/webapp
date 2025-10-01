-- =====================================================
-- CREATE ASSESSMENT FORMS TABLE
-- Stores all assessment form submissions from clients
-- =====================================================

-- Create assessment status enum
CREATE TYPE assessment_status AS ENUM ('pending', 'approved', 'rejected', 'scheduled');

-- Create the assessment_forms table with ALL fields
CREATE TABLE IF NOT EXISTS public.assessment_forms (
  -- Primary key and metadata
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Form status
  status assessment_status DEFAULT 'pending',

  -- Owner Information
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  emergency_name TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,

  -- Dog Information
  dog_name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  gender TEXT NOT NULL,
  neutered TEXT NOT NULL,
  weight TEXT NOT NULL,

  -- Health Information
  vaccinated TEXT NOT NULL,
  vaccination_date DATE,
  flea_treatment TEXT NOT NULL,
  flea_date DATE,
  worm_treatment TEXT NOT NULL,
  worm_date DATE,
  medical_conditions TEXT,
  medications TEXT,
  allergies TEXT,
  vet_name TEXT NOT NULL,
  vet_phone TEXT NOT NULL,

  -- Behavioral Information
  socialization TEXT NOT NULL,
  aggression TEXT NOT NULL,
  anxiety TEXT NOT NULL,
  commands TEXT,
  house_trained TEXT NOT NULL,
  crate TEXT,
  leash_behavior TEXT NOT NULL,

  -- Experience & Preferences
  previous_daycare TEXT,
  previous_daycare_details TEXT,
  play_style TEXT NOT NULL,
  favorite_activities TEXT,
  dislikes TEXT,
  triggers TEXT,

  -- Additional Information
  feeding_schedule TEXT,
  special_instructions TEXT,
  pickup_persons TEXT,
  photo_permission TEXT NOT NULL,

  -- Agreement
  agree_to_terms BOOLEAN NOT NULL DEFAULT false,
  agree_to_assessment BOOLEAN NOT NULL DEFAULT false,
  signature TEXT NOT NULL,
  signature_date DATE NOT NULL,

  -- Admin fields
  admin_notes TEXT,
  assessment_date DATE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX idx_assessment_forms_user_id ON public.assessment_forms(user_id);
CREATE INDEX idx_assessment_forms_status ON public.assessment_forms(status);
CREATE INDEX idx_assessment_forms_created_at ON public.assessment_forms(created_at DESC);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_assessment_forms_updated_at
  BEFORE UPDATE ON public.assessment_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.assessment_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own assessment forms
CREATE POLICY "Users can view own assessment forms"
  ON public.assessment_forms
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own assessment forms
CREATE POLICY "Users can insert own assessment forms"
  ON public.assessment_forms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessment forms (only if still pending)
CREATE POLICY "Users can update own pending assessment forms"
  ON public.assessment_forms
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Optional: Create a view for easy querying of recent submissions
CREATE VIEW recent_assessments AS
SELECT
  af.*,
  au.email as user_email
FROM assessment_forms af
JOIN auth.users au ON af.user_id = au.id
WHERE af.created_at > NOW() - INTERVAL '30 days'
ORDER BY af.created_at DESC;

-- Grant permissions
GRANT SELECT ON recent_assessments TO authenticated;
GRANT ALL ON public.assessment_forms TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ ASSESSMENT FORMS TABLE CREATED!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '• assessment_forms table with all fields';
    RAISE NOTICE '• assessment_status enum type';
    RAISE NOTICE '• Automatic updated_at trigger';
    RAISE NOTICE '• RLS policies for security';
    RAISE NOTICE '• Indexes for performance';
    RAISE NOTICE '• recent_assessments view';
    RAISE NOTICE '';
    RAISE NOTICE 'Users can:';
    RAISE NOTICE '• Submit assessment forms';
    RAISE NOTICE '• View their own submissions';
    RAISE NOTICE '• Update pending submissions';
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
END $$;