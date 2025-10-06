-- Add recurring billing agreement fields to legal_agreements table

ALTER TABLE legal_agreements
ADD COLUMN IF NOT EXISTS recurring_billing_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurring_billing_accepted_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN legal_agreements.recurring_billing_accepted IS 'User accepted recurring monthly billing terms';
COMMENT ON COLUMN legal_agreements.recurring_billing_accepted_at IS 'Timestamp when recurring billing was accepted';
