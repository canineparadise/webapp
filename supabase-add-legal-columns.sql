-- Add missing legal agreement columns to match the form

ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS injury_waiver_agreed BOOLEAN DEFAULT FALSE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS photo_permission_granted BOOLEAN DEFAULT FALSE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS vaccination_requirement_understood BOOLEAN DEFAULT FALSE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS behavioral_assessment_agreed BOOLEAN DEFAULT FALSE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS medication_administration_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS emergency_contact_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS property_damage_waiver BOOLEAN DEFAULT FALSE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS collection_procedure_agreed BOOLEAN DEFAULT FALSE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS data_protection_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS digital_signature TEXT;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0';
