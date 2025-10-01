-- STEP 1: Ensure role column exists in profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin'));
  END IF;
END $$;

-- STEP 2: Settings table for admin-configurable values
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL, -- 'number', 'text', 'boolean', 'json'
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default settings
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description) VALUES
  ('assessment_fee', '40.00', 'number', 'One-time assessment fee in GBP'),
  ('assessment_day', '5', 'text', 'Day of week for assessments (0=Sun, 5=Fri, 6=Sat)'),
  ('max_dogs_per_day', '20', 'number', 'Maximum dogs allowed per day'),
  ('max_assessments_per_day', '3', 'number', 'Maximum assessment bookings per day'),
  ('business_hours_start', '07:00', 'text', 'Opening time (24hr format)'),
  ('business_hours_end', '19:00', 'text', 'Closing time (24hr format)'),
  ('operating_days', '["1","2","3","4","5"]', 'json', 'Operating days (0=Sun, 6=Sat)'),
  ('late_fee_per_15min', '10.00', 'number', 'Late collection fee per 15 minutes')
ON CONFLICT (setting_key) DO NOTHING;

-- STEP 3: Financial transactions table (track Stripe payments)
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'subscription', 'assessment', 'late_fee', 'refund'
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',

  -- Stripe details
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  payment_method TEXT, -- 'card', 'bank_transfer', etc.

  -- Related records
  subscription_id UUID,
  assessment_id UUID,
  booking_id UUID,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_date TIMESTAMPTZ,

  -- Metadata
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Daily capacity tracking
CREATE TABLE IF NOT EXISTS daily_capacity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  total_capacity INTEGER NOT NULL DEFAULT 20,
  booked_count INTEGER DEFAULT 0,
  available_count INTEGER GENERATED ALWAYS AS (total_capacity - booked_count) STORED,
  is_closed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 5: Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action_type TEXT NOT NULL, -- 'approve_dog', 'deny_assessment', 'change_setting', 'refund', etc.
  target_type TEXT, -- 'dog', 'user', 'booking', 'setting', etc.
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(payment_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_daily_capacity_date ON daily_capacity(date);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created ON admin_activity_log(created_at);

-- STEP 7: Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- STEP 8: Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin full access to settings" ON admin_settings;
DROP POLICY IF EXISTS "Admin full access to financial transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Admin full access to daily capacity" ON daily_capacity;
DROP POLICY IF EXISTS "Admin full access to activity log" ON admin_activity_log;

-- STEP 9: Create RLS Policies (Admin and Staff access)
CREATE POLICY "Admin full access to settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin full access to financial transactions"
  ON financial_transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin full access to daily capacity"
  ON daily_capacity FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin full access to activity log"
  ON admin_activity_log FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- STEP 10: Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_action_type TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_activity_log (admin_id, action_type, target_type, target_id, details)
  VALUES (auth.uid(), p_action_type, p_target_type, p_target_id, p_details)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 11: Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON financial_transactions;
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_capacity_updated_at ON daily_capacity;
CREATE TRIGGER update_daily_capacity_updated_at BEFORE UPDATE ON daily_capacity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
