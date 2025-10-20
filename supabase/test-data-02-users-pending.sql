-- =====================================================
-- TEST DATA SCRIPT 2: PENDING APPROVAL USERS (5 users)
-- =====================================================
-- These users have completed onboarding but awaiting approval
-- =====================================================

-- You must create these users in Supabase Auth first, then get their IDs
-- For testing, I'll use gen_random_uuid() which creates new UUIDs
-- IMPORTANT: These won't link to actual auth users, so they won't be able to log in
-- If you want them to log in, create them in Auth first and use those IDs

DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  user4_id uuid := gen_random_uuid();
  user5_id uuid := gen_random_uuid();
  dog1_id uuid;
  dog2_id uuid;
  dog3_id uuid;
  dog4_id uuid;
  dog5_id uuid;
  dog6_id uuid;
BEGIN
  -- USER 1: Emma Wilson (1 dog, pending approval)
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user1_id, 'emma.wilson@test.com', 'Emma', 'Wilson', '07700900010', '10 Oak Street', 'Manchester', 'M10 1AA', 'Tom Wilson', '07700900011', 'user', 'pending', NOW() - INTERVAL '5 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, has_vaccination_docs, photo_url, energy_level, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, created_at)
  VALUES (user1_id, 'Buddy', 'Golden Retriever', 3, 0, 'male', 'large', 30.0, true, true, true, NULL, 'high', true, true, true, 'Manchester Vet Clinic', '01612345001', NOW() - INTERVAL '5 days')
  RETURNING id INTO dog1_id;

  INSERT INTO legal_agreements (user_id, terms_accepted, injury_waiver_agreed, photo_permission_granted, vaccination_requirement_understood, behavioral_assessment_agreed, medication_administration_consent, emergency_contact_consent, property_damage_waiver, collection_procedure_agreed, data_protection_consent, notice_period_accepted, recurring_billing_accepted, digital_signature, signed_at, created_at)
  VALUES (user1_id, true, true, true, true, true, true, true, true, true, true, true, true, 'Emma Wilson', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

  INSERT INTO assessment_schedule (user_id, dog_id, requested_date, confirmed_date, status, created_at)
  VALUES (user1_id, dog1_id, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '3 days', 'confirmed', NOW() - INTERVAL '3 days');

  -- USER 2: James Brown (2 dogs, pending approval)
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user2_id, 'james.brown@test.com', 'James', 'Brown', '07700900020', '22 Elm Road', 'Manchester', 'M11 2BB', 'Lisa Brown', '07700900021', 'user', 'pending', NOW() - INTERVAL '7 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, has_vaccination_docs, energy_level, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, created_at)
  VALUES
    (user2_id, 'Max', 'Labrador', 2, 6, 'male', 'large', 28.0, true, true, true, 'high', true, true, true, 'City Vet', '01612345002', NOW() - INTERVAL '6 days'),
    (user2_id, 'Bella', 'Cocker Spaniel', 4, 0, 'female', 'medium', 12.0, true, true, true, 'medium', true, true, true, 'City Vet', '01612345002', NOW() - INTERVAL '6 days');

  INSERT INTO legal_agreements (user_id, terms_accepted, injury_waiver_agreed, photo_permission_granted, vaccination_requirement_understood, behavioral_assessment_agreed, medication_administration_consent, emergency_contact_consent, property_damage_waiver, collection_procedure_agreed, data_protection_consent, notice_period_accepted, recurring_billing_accepted, digital_signature, signed_at, created_at)
  VALUES (user2_id, true, true, true, true, true, true, true, true, true, true, true, true, 'James Brown', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

  -- USER 3: Sophie Taylor (1 dog, pending approval)
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user3_id, 'sophie.taylor@test.com', 'Sophie', 'Taylor', '07700900030', '33 Pine Avenue', 'Manchester', 'M12 3CC', 'Mark Taylor', '07700900031', 'user', 'pending', NOW() - INTERVAL '4 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, has_vaccination_docs, energy_level, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, created_at)
  VALUES (user3_id, 'Charlie', 'Border Collie', 1, 8, 'male', 'medium', 18.0, true, true, true, 'very_high', true, true, true, 'Pet Care Clinic', '01612345003', NOW() - INTERVAL '4 days')
  RETURNING id INTO dog3_id;

  INSERT INTO legal_agreements (user_id, terms_accepted, injury_waiver_agreed, photo_permission_granted, vaccination_requirement_understood, behavioral_assessment_agreed, medication_administration_consent, emergency_contact_consent, property_damage_waiver, collection_procedure_agreed, data_protection_consent, notice_period_accepted, recurring_billing_accepted, digital_signature, signed_at, created_at)
  VALUES (user3_id, true, true, true, true, true, true, true, true, true, true, true, true, 'Sophie Taylor', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

  INSERT INTO assessment_schedule (user_id, dog_id, requested_date, confirmed_date, status, created_at)
  VALUES (user3_id, dog3_id, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '5 days', 'confirmed', NOW() - INTERVAL '2 days');

  -- USER 4: Oliver Davis (3 dogs, pending approval)
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user4_id, 'oliver.davis@test.com', 'Oliver', 'Davis', '07700900040', '44 Maple Close', 'Manchester', 'M13 4DD', 'Sarah Davis', '07700900041', 'user', 'pending', NOW() - INTERVAL '10 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, has_vaccination_docs, energy_level, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, created_at)
  VALUES
    (user4_id, 'Rocky', 'German Shepherd', 5, 0, 'male', 'large', 35.0, true, true, true, 'high', true, false, true, 'Animal Hospital', '01612345004', NOW() - INTERVAL '9 days'),
    (user4_id, 'Luna', 'Beagle', 3, 0, 'female', 'small', 10.0, true, true, true, 'medium', true, true, true, 'Animal Hospital', '01612345004', NOW() - INTERVAL '9 days'),
    (user4_id, 'Milo', 'French Bulldog', 2, 0, 'male', 'small', 11.0, true, true, true, 'low', true, true, true, 'Animal Hospital', '01612345004', NOW() - INTERVAL '9 days');

  INSERT INTO legal_agreements (user_id, terms_accepted, injury_waiver_agreed, photo_permission_granted, vaccination_requirement_understood, behavioral_assessment_agreed, medication_administration_consent, emergency_contact_consent, property_damage_waiver, collection_procedure_agreed, data_protection_consent, notice_period_accepted, recurring_billing_accepted, digital_signature, signed_at, created_at)
  VALUES (user4_id, true, true, true, true, true, true, true, true, true, true, true, true, 'Oliver Davis', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days');

  -- USER 5: Amelia Martinez (2 dogs, pending approval)
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user5_id, 'amelia.martinez@test.com', 'Amelia', 'Martinez', '07700900050', '55 Birch Lane', 'Manchester', 'M14 5EE', 'Carlos Martinez', '07700900051', 'user', 'pending', NOW() - INTERVAL '6 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, has_vaccination_docs, energy_level, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, created_at)
  VALUES
    (user5_id, 'Daisy', 'Pug', 4, 0, 'female', 'small', 7.0, true, true, true, 'low', true, true, true, 'Paws Vet Care', '01612345005', NOW() - INTERVAL '6 days'),
    (user5_id, 'Oscar', 'Pug', 4, 0, 'male', 'small', 8.0, true, true, true, 'low', true, true, true, 'Paws Vet Care', '01612345005', NOW() - INTERVAL '6 days');

  INSERT INTO legal_agreements (user_id, terms_accepted, injury_waiver_agreed, photo_permission_granted, vaccination_requirement_understood, behavioral_assessment_agreed, medication_administration_consent, emergency_contact_consent, property_damage_waiver, collection_procedure_agreed, data_protection_consent, notice_period_accepted, recurring_billing_accepted, digital_signature, signed_at, created_at)
  VALUES (user5_id, true, true, true, true, true, true, true, true, true, true, true, true, 'Amelia Martinez', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

END $$;
