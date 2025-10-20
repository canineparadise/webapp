-- SIMPLE FIX: Allow all authenticated users to READ data (staff will handle permissions in app code)

-- BOOKINGS - allow all authenticated users to read
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;

CREATE POLICY "Authenticated users can view bookings"
ON bookings FOR SELECT
TO authenticated
USING (true);

-- DOGS - allow all authenticated users to read
DROP POLICY IF EXISTS "Staff can view all dogs" ON dogs;
DROP POLICY IF EXISTS "Users can view own dogs" ON dogs;

CREATE POLICY "Authenticated users can view dogs"
ON dogs FOR SELECT
TO authenticated
USING (true);

-- PROFILES - allow all authenticated users to read
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Authenticated users can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- SUBSCRIPTIONS - allow all authenticated users to read
DROP POLICY IF EXISTS "Staff can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

CREATE POLICY "Authenticated users can view subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (true);

-- LEGAL_AGREEMENTS - allow all authenticated users to read
DROP POLICY IF EXISTS "Staff can view all legal agreements" ON legal_agreements;
DROP POLICY IF EXISTS "Users can view own agreements" ON legal_agreements;

CREATE POLICY "Authenticated users can view legal agreements"
ON legal_agreements FOR SELECT
TO authenticated
USING (true);

-- DOG_MEDICATIONS - allow all authenticated users to read
DROP POLICY IF EXISTS "Staff can view all dog medications" ON dog_medications;
DROP POLICY IF EXISTS "Users can view medications for their dogs" ON dog_medications;

CREATE POLICY "Authenticated users can view dog medications"
ON dog_medications FOR SELECT
TO authenticated
USING (true);

-- Verify
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE policyname LIKE '%Authenticated%'
ORDER BY tablename;
