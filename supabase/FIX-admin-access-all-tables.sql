-- =====================================================
-- FIX ADMIN ACCESS TO ALL TABLES
-- Ensure admins have full access to all tables
-- =====================================================

-- Grant admin access to legal_agreements table
DROP POLICY IF EXISTS "Admin full access to legal_agreements" ON legal_agreements;
CREATE POLICY "Admin full access to legal_agreements"
ON legal_agreements FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Grant users access to their own legal_agreements
DROP POLICY IF EXISTS "Users can view own legal_agreements" ON legal_agreements;
CREATE POLICY "Users can view own legal_agreements"
ON legal_agreements FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own legal_agreements" ON legal_agreements;
CREATE POLICY "Users can insert own legal_agreements"
ON legal_agreements FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own legal_agreements" ON legal_agreements;
CREATE POLICY "Users can update own legal_agreements"
ON legal_agreements FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant admin access to dog_medications table (if exists)
DROP POLICY IF EXISTS "Admin full access to dog_medications" ON dog_medications;
CREATE POLICY "Admin full access to dog_medications"
ON dog_medications FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Grant admin access to incidents table (if exists)
DROP POLICY IF EXISTS "Admin full access to incidents" ON incidents;
CREATE POLICY "Admin full access to incidents"
ON incidents FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Grant admin access to visit_history table (if exists)
DROP POLICY IF EXISTS "Admin full access to visit_history" ON visit_history;
CREATE POLICY "Admin full access to visit_history"
ON visit_history FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Grant admin access to financial_transactions table (if exists)
DROP POLICY IF EXISTS "Admin full access to financial_transactions" ON financial_transactions;
CREATE POLICY "Admin full access to financial_transactions"
ON financial_transactions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Grant admin access to admin_activity_log table (if exists)
DROP POLICY IF EXISTS "Admin full access to admin_activity_log" ON admin_activity_log;
CREATE POLICY "Admin full access to admin_activity_log"
ON admin_activity_log FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Grant admin access to daily_capacity table (if exists)
DROP POLICY IF EXISTS "Admin full access to daily_capacity" ON daily_capacity;
CREATE POLICY "Admin full access to daily_capacity"
ON daily_capacity FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Grant admin access to documents table (if exists)
DROP POLICY IF EXISTS "Admin full access to documents" ON documents;
CREATE POLICY "Admin full access to documents"
ON documents FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Grant admin access to subscription_tiers table
DROP POLICY IF EXISTS "Everyone can view subscription_tiers" ON subscription_tiers;
CREATE POLICY "Everyone can view subscription_tiers"
ON subscription_tiers FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admin can manage subscription_tiers" ON subscription_tiers;
CREATE POLICY "Admin can manage subscription_tiers"
ON subscription_tiers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Grant admin access to admin_settings table
DROP POLICY IF EXISTS "Everyone can view admin_settings" ON admin_settings;
CREATE POLICY "Everyone can view admin_settings"
ON admin_settings FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admin can manage admin_settings" ON admin_settings;
CREATE POLICY "Admin can manage admin_settings"
ON admin_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Grant admin access to play_groups table
DROP POLICY IF EXISTS "Everyone can view play_groups" ON play_groups;
CREATE POLICY "Everyone can view play_groups"
ON play_groups FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admin can manage play_groups" ON play_groups;
CREATE POLICY "Admin can manage play_groups"
ON play_groups FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Grant admin access to dog_play_groups junction table
DROP POLICY IF EXISTS "Everyone can view dog_play_groups" ON dog_play_groups;
CREATE POLICY "Everyone can view dog_play_groups"
ON dog_play_groups FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admin can manage dog_play_groups" ON dog_play_groups;
CREATE POLICY "Admin can manage dog_play_groups"
ON dog_play_groups FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Grant admin access to assessment_schedule table
DROP POLICY IF EXISTS "Admin full access to assessment_schedule" ON assessment_schedule;
CREATE POLICY "Admin full access to assessment_schedule"
ON assessment_schedule FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Users can view and insert their own assessment requests
DROP POLICY IF EXISTS "Users can manage own assessment_schedule" ON assessment_schedule;
CREATE POLICY "Users can manage own assessment_schedule"
ON assessment_schedule FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

COMMIT;
