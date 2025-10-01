-- Fix various database issues

-- 1. Add assessment price to settings
INSERT INTO daycare_settings (setting_key, setting_value) VALUES
  ('assessment_price', '40.00')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value;

-- 2. Verify legal_agreements table has proper unique constraint
-- (Already has UNIQUE(user_id) from schema)

-- 3. Create function to handle legal agreements upsert
CREATE OR REPLACE FUNCTION upsert_legal_agreement(
  p_user_id UUID,
  p_terms_accepted BOOLEAN,
  p_liability_waiver_accepted BOOLEAN,
  p_photo_consent BOOLEAN,
  p_ip_address TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO legal_agreements (
    user_id,
    terms_accepted,
    terms_accepted_at,
    liability_waiver_accepted,
    liability_waiver_accepted_at,
    photo_consent,
    photo_consent_at,
    ip_address
  ) VALUES (
    p_user_id,
    p_terms_accepted,
    CASE WHEN p_terms_accepted THEN NOW() ELSE NULL END,
    p_liability_waiver_accepted,
    CASE WHEN p_liability_waiver_accepted THEN NOW() ELSE NULL END,
    p_photo_consent,
    CASE WHEN p_photo_consent THEN NOW() ELSE NULL END,
    p_ip_address
  )
  ON CONFLICT (user_id) DO UPDATE SET
    terms_accepted = EXCLUDED.terms_accepted,
    terms_accepted_at = CASE WHEN EXCLUDED.terms_accepted THEN NOW() ELSE legal_agreements.terms_accepted_at END,
    liability_waiver_accepted = EXCLUDED.liability_waiver_accepted,
    liability_waiver_accepted_at = CASE WHEN EXCLUDED.liability_waiver_accepted THEN NOW() ELSE legal_agreements.liability_waiver_accepted_at END,
    photo_consent = EXCLUDED.photo_consent,
    photo_consent_at = CASE WHEN EXCLUDED.photo_consent THEN NOW() ELSE legal_agreements.photo_consent_at END,
    ip_address = EXCLUDED.ip_address,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verify dogs are properly linked to profiles via owner_id
-- (Already properly set up with owner_id UUID NOT NULL REFERENCES profiles(id))

-- 5. Add payment tracking to assessment_schedule
ALTER TABLE assessment_schedule ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded'));
ALTER TABLE assessment_schedule ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);
ALTER TABLE assessment_schedule ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE assessment_schedule ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
