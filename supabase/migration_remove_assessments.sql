-- =====================================================
-- MIGRATION: Remove Assessment Forms & Implement New Structure
-- =====================================================

-- 1. DROP OLD ASSESSMENT TABLES
-- =====================================================
DROP TABLE IF EXISTS public.assessment_forms CASCADE;
DROP TABLE IF EXISTS public.assessment_schedule CASCADE;

-- 2. ALTER EXISTING DOGS TABLE WITH NEW FIELDS
-- =====================================================
-- Add health fields
ALTER TABLE public.dogs
ADD COLUMN IF NOT EXISTS flea_treatment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS worming_treatment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS heartworm_prevention BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_medications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS medication_requirements TEXT,
ADD COLUMN IF NOT EXISTS can_be_given_treats BOOLEAN DEFAULT true;

-- Add behavioral fields
ALTER TABLE public.dogs
ADD COLUMN IF NOT EXISTS resource_guarding BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS separation_anxiety BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS excessive_barking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS leash_pulling BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS house_trained BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS crate_trained BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aggression_triggers TEXT,
ADD COLUMN IF NOT EXISTS behavioral_challenges TEXT,
ADD COLUMN IF NOT EXISTS training_needs TEXT;

-- Add social behavior fields
ALTER TABLE public.dogs
ADD COLUMN IF NOT EXISTS good_with_dogs BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS good_with_cats BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS good_with_children BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS good_with_strangers BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS play_style TEXT;

-- Add safety fields
ALTER TABLE public.dogs
ADD COLUMN IF NOT EXISTS escape_artist BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fence_jumper BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recall_reliability VARCHAR(20) DEFAULT 'good' CHECK (recall_reliability IN ('excellent', 'good', 'moderate', 'poor'));

-- Add emergency/vet fields
ALTER TABLE public.dogs
ADD COLUMN IF NOT EXISTS vet_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS vet_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS vet_address TEXT,
ADD COLUMN IF NOT EXISTS emergency_medical_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_vet_cost_approval DECIMAL(10,2);

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

-- 4. CREATE ASSESSMENT SCHEDULE TABLE (NEW STRUCTURE)
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

-- 6. ADD INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_legal_agreements_user ON public.legal_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_schedule_user ON public.assessment_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_schedule_date ON public.assessment_schedule(confirmed_date);
CREATE INDEX IF NOT EXISTS idx_incidents_dog ON public.incidents(dog_id);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON public.incidents(incident_date);

-- 7. SET UP ROW LEVEL SECURITY
-- =====================================================

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

-- Incidents RLS (only viewable by owner)
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

-- Staff can create incidents (you'll need to add role checking)
DROP POLICY IF EXISTS "Staff can create incidents" ON public.incidents;
CREATE POLICY "Staff can create incidents" ON public.incidents
  FOR INSERT WITH CHECK (true); -- You should add proper staff role checking here

-- 8. CREATE OR REPLACE UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
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

-- 9. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.legal_agreements TO authenticated;
GRANT ALL ON public.assessment_schedule TO authenticated;
GRANT SELECT ON public.incidents TO authenticated;

-- 10. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.legal_agreements IS 'Stores legal agreements and waivers signed by dog owners';
COMMENT ON TABLE public.assessment_schedule IS 'Manages assessment day scheduling for new dogs';
COMMENT ON TABLE public.incidents IS 'Records any incidents involving dogs during daycare';

COMMENT ON COLUMN public.dogs.current_medications IS 'JSON array of medications with name, dosage, and frequency';
COMMENT ON COLUMN public.dogs.max_vet_cost_approval IS 'Maximum amount owner authorizes for emergency vet care';
COMMENT ON COLUMN public.legal_agreements.digital_signature IS 'Full legal name as digital signature';
COMMENT ON COLUMN public.legal_agreements.version IS 'Version of agreements, for tracking updates';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration:
-- 1. Removes old assessment_forms table
-- 2. Adds comprehensive fields to dogs table
-- 3. Creates legal_agreements table for waivers
-- 4. Creates incidents tracking table
-- 5. Sets up proper RLS policies
-- =====================================================