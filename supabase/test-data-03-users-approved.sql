-- =====================================================
-- TEST DATA SCRIPT 3: APPROVED USERS WITH SUBSCRIPTIONS (15 users)
-- =====================================================
-- These users are approved and have active subscriptions
-- Mix of 1, 2, and 3 dogs with various subscription tiers
-- =====================================================

DO $$
DECLARE
  -- Get subscription tier IDs
  tier_4days uuid;
  tier_8days uuid;
  tier_12days uuid;
  tier_16days uuid;
  tier_20days uuid;

  -- User IDs
  user_ids uuid[] := ARRAY[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ];

  i int;
  subscription_id uuid;
BEGIN
  -- Get tier IDs
  SELECT id INTO tier_4days FROM subscription_tiers WHERE tier_name = '4_days';
  SELECT id INTO tier_8days FROM subscription_tiers WHERE tier_name = '8_days';
  SELECT id INTO tier_12days FROM subscription_tiers WHERE tier_name = '12_days';
  SELECT id INTO tier_16days FROM subscription_tiers WHERE tier_name = '16_days';
  SELECT id INTO tier_20days FROM subscription_tiers WHERE tier_name = '20_days';

  -- USER 1: Isabella Thompson (1 dog, 8-day subscription)
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user_ids[1], 'isabella.thompson@test.com', 'Isabella', 'Thompson', '07700900100', '100 Queen Street', 'Manchester', 'M15 1AA', 'David Thompson', '07700900101', 'user', 'approved', NOW() - INTERVAL '20 days', NOW() - INTERVAL '30 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, has_vaccination_docs, energy_level, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, created_at)
  VALUES (user_ids[1], 'Toby', 'Yorkshire Terrier', 3, 0, 'male', 'small', 5.0, true, true, true, 'medium', true, true, true, 'Westside Vet', '01612345100', true, true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '29 days');

  INSERT INTO legal_agreements (user_id, terms_accepted, injury_waiver_agreed, photo_permission_granted, vaccination_requirement_understood, behavioral_assessment_agreed, medication_administration_consent, emergency_contact_consent, property_damage_waiver, collection_procedure_agreed, data_protection_consent, notice_period_accepted, recurring_billing_accepted, digital_signature, signed_at, created_at)
  VALUES (user_ids[1], true, true, true, true, true, true, true, true, true, true, true, true, 'Isabella Thompson', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, days_included, days_remaining, monthly_price, price_per_day, start_date, end_date, is_active, stripe_subscription_id, stripe_customer_id, created_at)
  VALUES (user_ids[1], tier_8days, '8_days', 8, 5, 304.00, 38.00, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', true, 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 16), NOW() - INTERVAL '15 days');

  -- USER 2: Noah Anderson (2 dogs, 12-day subscription)
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user_ids[2], 'noah.anderson@test.com', 'Noah', 'Anderson', '07700900110', '110 King Street', 'Manchester', 'M16 2BB', 'Emily Anderson', '07700900111', 'user', 'approved', NOW() - INTERVAL '25 days', NOW() - INTERVAL '35 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, has_vaccination_docs, energy_level, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, created_at)
  VALUES
    (user_ids[2], 'Ruby', 'Cavalier King Charles', 2, 0, 'female', 'small', 7.0, true, true, true, 'medium', true, true, true, 'North Vet Clinic', '01612345110', true, true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '34 days'),
    (user_ids[2], 'Jack', 'Jack Russell', 4, 0, 'male', 'small', 6.0, true, true, true, 'high', true, true, true, 'North Vet Clinic', '01612345110', true, true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '34 days');

  INSERT INTO legal_agreements (user_id, terms_accepted, injury_waiver_agreed, photo_permission_granted, vaccination_requirement_understood, behavioral_assessment_agreed, medication_administration_consent, emergency_contact_consent, property_damage_waiver, collection_procedure_agreed, data_protection_consent, notice_period_accepted, recurring_billing_accepted, digital_signature, signed_at, created_at)
  VALUES (user_ids[2], true, true, true, true, true, true, true, true, true, true, true, true, 'Noah Anderson', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, days_included, days_remaining, monthly_price, price_per_day, start_date, end_date, is_active, stripe_subscription_id, stripe_customer_id, created_at)
  VALUES (user_ids[2], tier_12days, '12_days', 12, 8, 444.00, 37.00, NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days', true, 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 16), NOW() - INTERVAL '20 days');

  -- USER 3: Ava Robinson (3 dogs, 20-day subscription)
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user_ids[3], 'ava.robinson@test.com', 'Ava', 'Robinson', '07700900120', '120 Prince Road', 'Manchester', 'M17 3CC', 'Liam Robinson', '07700900121', 'user', 'approved', NOW() - INTERVAL '40 days', NOW() - INTERVAL '50 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, has_vaccination_docs, energy_level, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, created_at)
  VALUES
    (user_ids[3], 'Poppy', 'Springer Spaniel', 5, 0, 'female', 'medium', 20.0, true, true, true, 'high', true, true, true, 'South Vet', '01612345120', true, true, NOW() - INTERVAL '40 days', NOW() - INTERVAL '49 days'),
    (user_ids[3], 'Cooper', 'Springer Spaniel', 5, 0, 'male', 'medium', 22.0, true, true, true, 'high', true, true, true, 'South Vet', '01612345120', true, true, NOW() - INTERVAL '40 days', NOW() - INTERVAL '49 days'),
    (user_ids[3], 'Rosie', 'Springer Spaniel', 3, 0, 'female', 'medium', 19.0, true, true, true, 'high', true, true, true, 'South Vet', '01612345120', true, true, NOW() - INTERVAL '40 days', NOW() - INTERVAL '49 days');

  INSERT INTO legal_agreements (user_id, terms_accepted, injury_waiver_agreed, photo_permission_granted, vaccination_requirement_understood, behavioral_assessment_agreed, medication_administration_consent, emergency_contact_consent, property_damage_waiver, collection_procedure_agreed, data_protection_consent, notice_period_accepted, recurring_billing_accepted, digital_signature, signed_at, created_at)
  VALUES (user_ids[3], true, true, true, true, true, true, true, true, true, true, true, true, 'Ava Robinson', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, days_included, days_remaining, monthly_price, price_per_day, start_date, end_date, is_active, stripe_subscription_id, stripe_customer_id, created_at)
  VALUES (user_ids[3], tier_20days, '20_days', 20, 15, 700.00, 35.00, NOW() - INTERVAL '25 days', NOW() + INTERVAL '5 days', true, 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 16), NOW() - INTERVAL '25 days');

  -- USER 4: William Harris (1 dog, 4-day subscription)
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user_ids[4], 'william.harris@test.com', 'William', 'Harris', '07700900130', '130 Duke Lane', 'Manchester', 'M18 4DD', 'Sophie Harris', '07700900131', 'user', 'approved', NOW() - INTERVAL '15 days', NOW() - INTERVAL '25 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, has_vaccination_docs, energy_level, good_with_dogs, good_with_puppies, good_with_people, vet_name, vet_phone, is_approved, assessment_completed, assessment_date, created_at)
  VALUES (user_ids[4], 'Archie', 'Dachshund', 2, 0, 'male', 'small', 9.0, true, true, true, 'medium', true, true, true, 'East Vet Practice', '01612345130', true, true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '24 days');

  INSERT INTO legal_agreements (user_id, terms_accepted, injury_waiver_agreed, photo_permission_granted, vaccination_requirement_understood, behavioral_assessment_agreed, medication_administration_consent, emergency_contact_consent, property_damage_waiver, collection_procedure_agreed, data_protection_consent, notice_period_accepted, recurring_billing_accepted, digital_signature, signed_at, created_at)
  VALUES (user_ids[4], true, true, true, true, true, true, true, true, true, true, true, true, 'William Harris', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, days_included, days_remaining, monthly_price, price_per_day, start_date, end_date, is_active, stripe_subscription_id, stripe_customer_id, created_at)
  VALUES (user_ids[4], tier_4days, '4_days', 4, 2, 160.00, 40.00, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', true, 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 16), NOW() - INTERVAL '10 days');

  -- Continue with remaining 11 users...
  -- USER 5-15 will follow similar pattern with different data

  RAISE NOTICE 'Created 4 test users with subscriptions. Run test-data-04 for the remaining 11 users.';
END $$;
