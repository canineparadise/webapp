-- CREATE DEMO ACCOUNTS FOR CLIENT PREVIEW
-- Run this in Supabase SQL Editor to create 3 demo accounts
--
-- DEMO CREDENTIALS:
-- User Portal:   demo.user@canineparadise.com / DemoUser2025!
-- Staff Portal:  demo.staff@canineparadise.com / DemoStaff2025!
-- Admin Portal:  demo.admin@canineparadise.com / DemoAdmin2025!

-- ============================================
-- STEP 1: Create users in Supabase Auth UI
-- ============================================
-- You need to create these 3 users in Supabase Auth first:
--
-- 1. Go to: Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" for each one below
-- 3. Check "Auto Confirm User" for each
--
-- User 1 (Demo Client):
--   Email: demo.user@canineparadise.com
--   Password: DemoUser2025!
--
-- User 2 (Demo Staff):
--   Email: demo.staff@canineparadise.com
--   Password: DemoStaff2025!
--
-- User 3 (Demo Admin):
--   Email: demo.admin@canineparadise.com
--   Password: DemoAdmin2025!
--
-- ============================================

-- STEP 2: After creating users in Auth UI, run this SQL:

-- Update Demo User profile (regular client)
UPDATE profiles
SET
  role = 'user',
  first_name = 'Demo',
  last_name = 'Client',
  phone = '07123456789',
  address = '123 Demo Street, London, SW1A 1AA',
  emergency_contact_name = 'Jane Doe',
  emergency_contact_phone = '07987654321'
WHERE email = 'demo.user@canineparadise.com';

-- Update Demo Staff profile
UPDATE profiles
SET
  role = 'staff',
  first_name = 'Demo',
  last_name = 'Staff'
WHERE email = 'demo.staff@canineparadise.com';

-- Update Demo Admin profile
UPDATE profiles
SET
  role = 'admin',
  first_name = 'Demo',
  last_name = 'Admin'
WHERE email = 'demo.admin@canineparadise.com';

-- STEP 3: Add sample data for the demo user

-- Add a demo dog for the client (get user_id first)
DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  -- Get the demo user's ID
  SELECT id INTO demo_user_id FROM profiles WHERE email = 'demo.user@canineparadise.com';

  IF demo_user_id IS NOT NULL THEN
    -- Insert a demo dog
    INSERT INTO dogs (
      owner_id,
      name,
      breed,
      age_years,
      age_months,
      gender,
      size,
      weight_kg,
      color,
      neutered,
      microchipped,
      vaccinated,
      vaccination_expiry,
      medical_conditions,
      allergies,
      vet_name,
      vet_phone,
      is_approved
    ) VALUES (
      demo_user_id,
      'Max',
      'Golden Retriever',
      3,
      6,
      'male',
      'large',
      28.5,
      'Golden',
      true,
      true,
      true,
      '2026-06-01',
      'None',
      'None',
      'Happy Paws Veterinary',
      '020 7123 4567',
      true
    );

    -- Add legal agreements
    INSERT INTO legal_agreements (
      user_id,
      terms_accepted,
      injury_waiver_agreed,
      photo_permission_granted,
      vaccination_requirement_understood,
      behavioral_assessment_agreed,
      medication_administration_consent,
      emergency_contact_consent,
      property_damage_waiver,
      collection_procedure_agreed,
      liability_acknowledgment
    ) VALUES (
      demo_user_id,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true
    );
  END IF;
END $$;

-- STEP 4: Verify all demo accounts were created successfully
SELECT
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM profiles
WHERE email IN (
  'demo.user@canineparadise.com',
  'demo.staff@canineparadise.com',
  'demo.admin@canineparadise.com'
)
ORDER BY role;

-- You should see all 3 users with their correct roles
