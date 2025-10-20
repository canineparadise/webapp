-- Add password policy agreement to legal_agreements table

ALTER TABLE legal_agreements
ADD COLUMN IF NOT EXISTS password_policy_agreed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS password_policy_agreed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN legal_agreements.password_policy_agreed IS 'User agrees that dogs will not be released without correct password for non-authorized pickups';
COMMENT ON COLUMN legal_agreements.password_policy_agreed_at IS 'Timestamp when user agreed to password policy';

-- Update existing agreements to require re-acceptance (set to false)
UPDATE legal_agreements
SET password_policy_agreed = false
WHERE password_policy_agreed IS NULL;
