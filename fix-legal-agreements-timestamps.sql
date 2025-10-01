-- Add individual timestamp columns for each waiver (for legal purposes)

-- Terms & Conditions
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- Injury Waiver
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS injury_waiver_agreed_at TIMESTAMPTZ;

-- Photo Permission (optional)
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS photo_permission_granted_at TIMESTAMPTZ;

-- Vaccination Requirement
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS vaccination_requirement_understood_at TIMESTAMPTZ;

-- Behavioral Assessment
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS behavioral_assessment_agreed_at TIMESTAMPTZ;

-- Medication Administration
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS medication_administration_consent_at TIMESTAMPTZ;

-- Emergency Contact
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS emergency_contact_consent_at TIMESTAMPTZ;

-- Property Damage
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS property_damage_waiver_at TIMESTAMPTZ;

-- Collection Procedure
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS collection_procedure_agreed_at TIMESTAMPTZ;

-- Data Protection
ALTER TABLE legal_agreements ADD COLUMN IF NOT EXISTS data_protection_consent_at TIMESTAMPTZ;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'legal_agreements'
  AND column_name LIKE '%_at'
ORDER BY column_name;
