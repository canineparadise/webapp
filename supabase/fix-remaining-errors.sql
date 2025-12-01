-- ============================================
-- FIX REMAINING DASHBOARD ERRORS
-- ============================================
-- This script fixes:
-- 1. Foreign key constraints for refund_requests
-- 2. Missing discount_code_usage table structure
-- 3. Dogs table foreign key issues

-- 1. FIX REFUND_REQUESTS TABLE
-- ============================================

-- First check if table exists, if not create it
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dog_id UUID,
  booking_id UUID,
  reason TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing foreign keys if they exist
DO $$
BEGIN
  -- Drop old constraints if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'refund_requests' AND constraint_name = 'refund_requests_user_id_fkey'
  ) THEN
    ALTER TABLE refund_requests DROP CONSTRAINT refund_requests_user_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'refund_requests' AND constraint_name = 'refund_requests_dog_id_fkey'
  ) THEN
    ALTER TABLE refund_requests DROP CONSTRAINT refund_requests_dog_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'refund_requests' AND constraint_name = 'refund_requests_reviewed_by_fkey'
  ) THEN
    ALTER TABLE refund_requests DROP CONSTRAINT refund_requests_reviewed_by_fkey;
  END IF;
END $$;

-- Add proper foreign key constraints with correct names
ALTER TABLE refund_requests
  ADD CONSTRAINT refund_requests_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE refund_requests
  ADD CONSTRAINT refund_requests_dog_id_fkey
  FOREIGN KEY (dog_id) REFERENCES dogs(id) ON DELETE SET NULL;

ALTER TABLE refund_requests
  ADD CONSTRAINT refund_requests_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_dog_id ON refund_requests(dog_id);

-- Enable RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (if not already created by previous script)
DROP POLICY IF EXISTS "refund_requests_select_own" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_select_staff" ON refund_requests;
DROP POLICY IF EXISTS "Users can create refund requests" ON refund_requests;
DROP POLICY IF EXISTS "Staff can update refund requests" ON refund_requests;

CREATE POLICY "refund_requests_select_own"
ON refund_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "refund_requests_select_staff"
ON refund_requests FOR SELECT
TO authenticated
USING (current_user_role() IN ('admin', 'staff'));

CREATE POLICY "refund_requests_insert_own"
ON refund_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "refund_requests_update_staff"
ON refund_requests FOR UPDATE
TO authenticated
USING (current_user_role() IN ('admin', 'staff'))
WITH CHECK (current_user_role() IN ('admin', 'staff'));

-- 2. FIX DISCOUNT_CODE_USAGE TABLE
-- ============================================

-- Create or update discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Add created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discount_codes' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE discount_codes ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Drop old policies and create new ones
DROP POLICY IF EXISTS "discount_codes_select_staff" ON discount_codes;
DROP POLICY IF EXISTS "discount_codes_manage_admin" ON discount_codes;

-- Allow staff to view and manage discount codes
CREATE POLICY "discount_codes_select_staff"
ON discount_codes FOR SELECT
TO authenticated
USING (current_user_role() IN ('admin', 'staff'));

CREATE POLICY "discount_codes_manage_admin"
ON discount_codes FOR ALL
TO authenticated
USING (current_user_role() = 'admin')
WITH CHECK (current_user_role() = 'admin');

-- Create discount_code_usage table
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID,
  user_id UUID,
  used_for TEXT CHECK (used_for IN ('subscription', 'daycare', 'assessment', 'individual_day')),
  original_amount DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2),
  final_amount DECIMAL(10, 2)
);

-- Add created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discount_code_usage' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE discount_code_usage ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Drop existing foreign keys if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'discount_code_usage' AND constraint_name = 'discount_code_usage_discount_code_id_fkey'
  ) THEN
    ALTER TABLE discount_code_usage DROP CONSTRAINT discount_code_usage_discount_code_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'discount_code_usage' AND constraint_name = 'discount_code_usage_user_id_fkey'
  ) THEN
    ALTER TABLE discount_code_usage DROP CONSTRAINT discount_code_usage_user_id_fkey;
  END IF;
END $$;

-- Add foreign key constraints
ALTER TABLE discount_code_usage
  ADD CONSTRAINT discount_code_usage_discount_code_id_fkey
  FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id) ON DELETE SET NULL;

ALTER TABLE discount_code_usage
  ADD CONSTRAINT discount_code_usage_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_user_id ON discount_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_code_id ON discount_code_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_created_at ON discount_code_usage(created_at);

-- Enable RLS
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DROP POLICY IF EXISTS "discount_code_usage_select_own" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_select_staff" ON discount_code_usage;

CREATE POLICY "discount_code_usage_select_own"
ON discount_code_usage FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "discount_code_usage_select_staff"
ON discount_code_usage FOR SELECT
TO authenticated
USING (current_user_role() IN ('admin', 'staff'));

CREATE POLICY "discount_code_usage_insert_own"
ON discount_code_usage FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. VERIFY DOGS TABLE FOREIGN KEYS
-- ============================================

-- Check if dogs table has proper foreign key to profiles
DO $$
BEGIN
  -- Check if foreign key exists with correct name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'dogs' AND constraint_name = 'dogs_owner_id_fkey'
  ) THEN
    -- Drop any existing owner_id foreign keys with different names
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'dogs'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'owner_id'
    ) THEN
      EXECUTE (
        SELECT 'ALTER TABLE dogs DROP CONSTRAINT ' || constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'dogs'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'owner_id'
        LIMIT 1
      );
    END IF;

    -- Add the properly named foreign key
    ALTER TABLE dogs
      ADD CONSTRAINT dogs_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. VERIFY ALL FOREIGN KEYS WERE CREATED
-- ============================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('refund_requests', 'discount_code_usage', 'dogs')
ORDER BY tc.table_name, kcu.column_name;
