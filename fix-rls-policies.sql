-- FIX RLS POLICIES - Run this to fix the 403 errors
-- This adds the missing WITH CHECK clause that allows INSERT/UPDATE operations

-- Fix admin_settings policy
DROP POLICY IF EXISTS "Admin and staff full access to settings" ON admin_settings;
CREATE POLICY "Admin and staff full access to settings"
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

-- Fix subscription_tiers policy (if it exists)
DROP POLICY IF EXISTS "Admin and staff can update subscription tiers" ON subscription_tiers;
CREATE POLICY "Admin and staff can update subscription tiers"
  ON subscription_tiers FOR ALL
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

-- Verify your user has admin role (replace with your email)
-- SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';
