-- COMPLETE TEST DATA POPULATION
-- This script populates profiles, dogs, legal agreements, and subscriptions for all 20 test users
-- Run this AFTER creating all 20 users in Supabase Auth

DO $$
DECLARE
  -- User IDs (fetched from auth.users by email)
  user1_id UUID; user2_id UUID; user3_id UUID; user4_id UUID; user5_id UUID;
  user6_id UUID; user7_id UUID; user8_id UUID; user9_id UUID; user10_id UUID;
  user11_id UUID; user12_id UUID; user13_id UUID; user14_id UUID; user15_id UUID;
  user16_id UUID; user17_id UUID; user18_id UUID; user19_id UUID; user20_id UUID;

  -- Subscription tier IDs
  tier_4days UUID; tier_8days UUID; tier_12days UUID; tier_16days UUID; tier_20days UUID;

  -- Dog IDs (temporary for each insert)
  dog_id UUID;

BEGIN
  RAISE NOTICE 'Starting complete test data population...';

  -- Fetch all user IDs from auth.users
  SELECT id INTO user1_id FROM auth.users WHERE email = 'emma.wilson@test.com';
  SELECT id INTO user2_id FROM auth.users WHERE email = 'james.brown@test.com';
  SELECT id INTO user3_id FROM auth.users WHERE email = 'sophie.taylor@test.com';
  SELECT id INTO user4_id FROM auth.users WHERE email = 'oliver.davis@test.com';
  SELECT id INTO user5_id FROM auth.users WHERE email = 'amelia.martinez@test.com';
  SELECT id INTO user6_id FROM auth.users WHERE email = 'liam.evans@test.com';
  SELECT id INTO user7_id FROM auth.users WHERE email = 'charlotte.moore@test.com';
  SELECT id INTO user8_id FROM auth.users WHERE email = 'ethan.jackson@test.com';
  SELECT id INTO user9_id FROM auth.users WHERE email = 'mia.white@test.com';
  SELECT id INTO user10_id FROM auth.users WHERE email = 'lucas.hall@test.com';
  SELECT id INTO user11_id FROM auth.users WHERE email = 'grace.allen@test.com';
  SELECT id INTO user12_id FROM auth.users WHERE email = 'henry.young@test.com';
  SELECT id INTO user13_id FROM auth.users WHERE email = 'ella.king@test.com';
  SELECT id INTO user14_id FROM auth.users WHERE email = 'sebastian.wright@test.com';
  SELECT id INTO user15_id FROM auth.users WHERE email = 'scarlett.lopez@test.com';
  SELECT id INTO user16_id FROM auth.users WHERE email = 'jack.hill@test.com';
  SELECT id INTO user17_id FROM auth.users WHERE email = 'isabella.thompson@test.com';
  SELECT id INTO user18_id FROM auth.users WHERE email = 'noah.anderson@test.com';
  SELECT id INTO user19_id FROM auth.users WHERE email = 'ava.robinson@test.com';
  SELECT id INTO user20_id FROM auth.users WHERE email = 'william.harris@test.com';

  RAISE NOTICE 'Fetched all 20 user IDs from auth.users';

  -- Get subscription tier IDs
  SELECT id INTO tier_4days FROM subscription_tiers WHERE days_included = 4 LIMIT 1;
  SELECT id INTO tier_8days FROM subscription_tiers WHERE days_included = 8 LIMIT 1;
  SELECT id INTO tier_12days FROM subscription_tiers WHERE days_included = 12 LIMIT 1;
  SELECT id INTO tier_16days FROM subscription_tiers WHERE days_included = 16 LIMIT 1;
  SELECT id INTO tier_20days FROM subscription_tiers WHERE days_included = 20 LIMIT 1;

  RAISE NOTICE 'Fetched subscription tier IDs';

  -- ========================================================================
  -- PENDING USERS (5) - Awaiting approval
  -- ========================================================================

  -- USER 1: Emma Wilson - 1 dog, pending approval
  RAISE NOTICE 'Creating User 1: Emma Wilson (pending)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user1_id, 'emma.wilson@test.com', 'Emma', 'Wilson', '07700900010', '10 Oak Street', 'Manchester', 'M10 1AA', 'Tom Wilson', '07700900011', 'user', 'pending', NOW() - INTERVAL '5 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user1_id, 'Buddy', 'Golden Retriever', '2020-05-15', 30.0, 'male', true, 'high', 'None', 'Standard adult', 'Manchester Vets', '01612345678', 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user1_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '4 days');

  -- USER 2: James Brown - 2 dogs, pending approval
  RAISE NOTICE 'Creating User 2: James Brown (pending)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user2_id, 'james.brown@test.com', 'James', 'Brown', '07700900012', '22 High Street', 'London', 'SW1A 1AA', 'Sarah Brown', '07700900013', 'user', 'pending', NOW() - INTERVAL '7 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user2_id, 'Max', 'Labrador Retriever', '2019-03-10', 32.0, 'male', true, 'very_high', 'None', 'Active dog formula', 'London Pet Clinic', '02071234567', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user2_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '6 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user2_id, 'Bella', 'Border Collie', '2021-07-22', 18.0, 'female', true, 'very_high', 'None', 'High energy diet', 'London Pet Clinic', '02071234567', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user2_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '6 days');

  -- USER 3: Sophie Taylor - 1 dog, pending approval
  RAISE NOTICE 'Creating User 3: Sophie Taylor (pending)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user3_id, 'sophie.taylor@test.com', 'Sophie', 'Taylor', '07700900014', '45 King Road', 'Birmingham', 'B1 1AA', 'Mike Taylor', '07700900015', 'user', 'pending', NOW() - INTERVAL '3 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user3_id, 'Charlie', 'Cocker Spaniel', '2020-11-08', 14.0, 'male', true, 'medium', 'None', 'Standard diet', 'Birmingham Vets', '01213456789', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user3_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '2 days');

  -- USER 4: Oliver Davis - 3 dogs, pending approval
  RAISE NOTICE 'Creating User 4: Oliver Davis (pending)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user4_id, 'oliver.davis@test.com', 'Oliver', 'Davis', '07700900016', '88 Queen Avenue', 'Leeds', 'LS1 1AA', 'Kate Davis', '07700900017', 'user', 'pending', NOW() - INTERVAL '6 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user4_id, 'Rocky', 'German Shepherd', '2018-09-12', 38.0, 'male', true, 'high', 'None', 'Large breed diet', 'Leeds Animal Hospital', '01132223344', 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user4_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '5 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user4_id, 'Luna', 'Beagle', '2020-01-20', 12.0, 'female', true, 'high', 'None', 'Weight control', 'Leeds Animal Hospital', '01132223344', 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user4_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '5 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user4_id, 'Milo', 'Jack Russell Terrier', '2021-06-05', 7.0, 'male', false, 'very_high', 'None', 'Small breed formula', 'Leeds Animal Hospital', '01132223344', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user4_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '5 days');

  -- USER 5: Amelia Martinez - 2 dogs, pending approval
  RAISE NOTICE 'Creating User 5: Amelia Martinez (pending)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at)
  VALUES (user5_id, 'amelia.martinez@test.com', 'Amelia', 'Martinez', '07700900018', '15 Park Lane', 'Bristol', 'BS1 1AA', 'Carlos Martinez', '07700900019', 'user', 'pending', NOW() - INTERVAL '4 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user5_id, 'Daisy', 'Poodle', '2019-12-15', 9.0, 'female', true, 'medium', 'None', 'Hypoallergenic diet', 'Bristol Vets', '01179123456', 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user5_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '3 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user5_id, 'Oscar', 'French Bulldog', '2021-04-10', 11.0, 'male', true, 'low', 'Breathing issues', 'Grain-free diet', 'Bristol Vets', '01179123456', 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user5_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '3 days');

  RAISE NOTICE '✓ Created 5 pending approval users with dogs';

  -- ========================================================================
  -- APPROVED USERS (15) - With active subscriptions
  -- ========================================================================

  -- USER 6: Liam Evans - 1 dog, 16-day subscription
  RAISE NOTICE 'Creating User 6: Liam Evans (approved, 16-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user6_id, 'liam.evans@test.com', 'Liam', 'Evans', '07700900020', '34 Elm Avenue', 'Bristol', 'BS5 6HG', 'Sarah Evans', '07700900021', 'user', 'approved', NOW() - INTERVAL '12 days', NOW() - INTERVAL '18 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user6_id, 'Alfie', 'Cocker Spaniel', '2020-03-20', 14.0, 'male', true, 'high', 'None', 'Standard diet', 'Bristol Vets', '01179123456', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', true, true, NOW() - INTERVAL '13 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user6_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '15 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user6_id, tier_16days, '16_days', 'full_day', 16, 11, 576.00, 36.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days', NOW() - INTERVAL '7 days');

  -- USER 7: Charlotte Moore - 2 dogs, 20-day half-day subscription
  RAISE NOTICE 'Creating User 7: Charlotte Moore (approved, 20-day half-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user7_id, 'charlotte.moore@test.com', 'Charlotte', 'Moore', '07700900022', '78 Park Lane', 'Birmingham', 'B12 8QJ', 'David Moore', '07700900023', 'user', 'approved', NOW() - INTERVAL '20 days', NOW() - INTERVAL '25 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user7_id, 'Leo', 'French Bulldog', '2021-07-10', 12.5, 'male', true, 'medium', 'Breathing sensitivity', 'Grain-free diet', 'Birmingham Animal Care', '01213456789', 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400', true, true, NOW() - INTERVAL '21 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user7_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '22 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user7_id, 'Winnie', 'Pug', '2019-11-05', 8.0, 'female', true, 'low', 'Sensitive skin', 'Hypoallergenic food', 'Birmingham Animal Care', '01213456789', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400', true, true, NOW() - INTERVAL '21 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user7_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '22 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user7_id, tier_20days, '20_days', 'half_day', 20, 16, 500.00, 25.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NOW() - INTERVAL '10 days');

  -- USER 8: Ethan Jackson - 1 dog, 4-day subscription
  RAISE NOTICE 'Creating User 8: Ethan Jackson (approved, 4-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user8_id, 'ethan.jackson@test.com', 'Ethan', 'Jackson', '07700900024', '12 Victoria Road', 'Leeds', 'LS6 1DR', 'Rachel Jackson', '07700900025', 'user', 'approved', NOW() - INTERVAL '8 days', NOW() - INTERVAL '14 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user8_id, 'Teddy', 'Yorkshire Terrier', '2022-01-15', 3.5, 'male', false, 'high', 'None', 'Small breed formula', 'Leeds Veterinary Clinic', '01132223344', 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=400', true, true, NOW() - INTERVAL '9 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user8_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '11 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user8_id, tier_4days, '4_days', 'full_day', 4, 2, 160.00, 40.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days', NOW() - INTERVAL '4 days');

  -- USER 9: Mia White - 3 dogs, 12-day subscription
  RAISE NOTICE 'Creating User 9: Mia White (approved, 12-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user9_id, 'mia.white@test.com', 'Mia', 'White', '07700900026', '56 Church Street', 'Liverpool', 'L1 3AY', 'Ben White', '07700900027', 'user', 'approved', NOW() - INTERVAL '15 days', NOW() - INTERVAL '21 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user9_id, 'Bella', 'Labrador Retriever', '2018-05-12', 28.0, 'female', true, 'high', 'Hip dysplasia', 'Joint support diet', 'Liverpool Pet Hospital', '01514445566', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', true, true, NOW() - INTERVAL '16 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user9_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '18 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user9_id, 'Zeus', 'German Shepherd', '2019-09-08', 35.0, 'male', true, 'very_high', 'None', 'Large breed adult', 'Liverpool Pet Hospital', '01514445566', 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400', true, true, NOW() - INTERVAL '16 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user9_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '18 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user9_id, 'Luna', 'Border Collie', '2020-12-03', 18.0, 'female', true, 'very_high', 'None', 'High energy formula', 'Liverpool Pet Hospital', '01514445566', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', true, true, NOW() - INTERVAL '16 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user9_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '18 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user9_id, tier_12days, '12_days', 'full_day', 12, 8, 444.00, 37.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '9 days', NOW() + INTERVAL '21 days', NOW() - INTERVAL '9 days');

  -- USER 10: Lucas Hall - 2 dogs, 8-day half-day subscription
  RAISE NOTICE 'Creating User 10: Lucas Hall (approved, 8-day half-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user10_id, 'lucas.hall@test.com', 'Lucas', 'Hall', '07700900028', '90 Station Road', 'Sheffield', 'S1 2JE', 'Emma Hall', '07700900029', 'user', 'approved', NOW() - INTERVAL '10 days', NOW() - INTERVAL '16 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user10_id, 'Murphy', 'Beagle', '2019-04-22', 13.0, 'male', true, 'high', 'None', 'Weight management', 'Sheffield Vets', '01142667788', 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400', true, true, NOW() - INTERVAL '11 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user10_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '13 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user10_id, 'Sadie', 'Cavalier King Charles Spaniel', '2021-02-14', 7.5, 'female', true, 'medium', 'Heart murmur', 'Cardiac support diet', 'Sheffield Vets', '01142667788', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400', true, true, NOW() - INTERVAL '11 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user10_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '13 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user10_id, tier_8days, '8_days', 'half_day', 8, 5, 228.00, 28.50, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days', NOW() - INTERVAL '6 days');

  -- USER 11: Grace Allen - 1 dog, 20-day subscription
  RAISE NOTICE 'Creating User 11: Grace Allen (approved, 20-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user11_id, 'grace.allen@test.com', 'Grace', 'Allen', '07700900030', '23 High Street', 'Newcastle', 'NE1 4JH', 'Mark Allen', '07700900031', 'user', 'approved', NOW() - INTERVAL '18 days', NOW() - INTERVAL '24 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user11_id, 'Ollie', 'Staffordshire Bull Terrier', '2018-08-30', 16.0, 'male', true, 'high', 'None', 'Standard adult', 'Newcastle Animal Clinic', '01913334455', 'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=400', true, true, NOW() - INTERVAL '19 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user11_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '21 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user11_id, tier_20days, '20_days', 'full_day', 20, 14, 700.00, 35.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days', NOW() - INTERVAL '12 days');

  -- USER 12: Henry Young - 2 dogs, 12-day half-day subscription
  RAISE NOTICE 'Creating User 12: Henry Young (approved, 12-day half-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user12_id, 'henry.young@test.com', 'Henry', 'Young', '07700900032', '45 Castle Street', 'Nottingham', 'NG1 6AF', 'Lucy Young', '07700900033', 'user', 'approved', NOW() - INTERVAL '14 days', NOW() - INTERVAL '19 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user12_id, 'Penny', 'Miniature Schnauzer', '2020-06-18', 7.0, 'female', true, 'medium', 'None', 'Small breed diet', 'Nottingham Veterinary Centre', '01159876543', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', true, true, NOW() - INTERVAL '15 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user12_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '17 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user12_id, 'Bear', 'Rottweiler', '2017-11-25', 45.0, 'male', true, 'medium', 'Arthritis', 'Joint support formula', 'Nottingham Veterinary Centre', '01159876543', 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=400', true, true, NOW() - INTERVAL '15 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user12_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '17 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user12_id, tier_12days, '12_days', 'half_day', 12, 9, 333.00, 27.75, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW() - INTERVAL '5 days');

  -- USER 13: Ella King - 3 dogs, 16-day subscription
  RAISE NOTICE 'Creating User 13: Ella King (approved, 16-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user13_id, 'ella.king@test.com', 'Ella', 'King', '07700900034', '67 Bridge Road', 'Cambridge', 'CB1 2JN', 'James King', '07700900035', 'user', 'approved', NOW() - INTERVAL '22 days', NOW() - INTERVAL '28 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user13_id, 'Coco', 'Dachshund', '2021-03-07', 6.5, 'female', true, 'medium', 'Back issues', 'Weight management', 'Cambridge Pet Care', '01223112233', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400', true, true, NOW() - INTERVAL '23 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user13_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '25 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user13_id, 'Jasper', 'English Springer Spaniel', '2019-07-19', 22.0, 'male', true, 'very_high', 'None', 'Active dog formula', 'Cambridge Pet Care', '01223112233', 'https://images.unsplash.com/photo-1544526226-d4568090ffb8?w=400', true, true, NOW() - INTERVAL '23 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user13_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '25 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user13_id, 'Millie', 'West Highland White Terrier', '2020-10-11', 8.5, 'female', true, 'high', 'Skin allergies', 'Hypoallergenic diet', 'Cambridge Pet Care', '01223112233', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', true, true, NOW() - INTERVAL '23 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user13_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '25 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user13_id, tier_16days, '16_days', 'full_day', 16, 12, 576.00, 36.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days', NOW() - INTERVAL '8 days');

  -- USER 14: Sebastian Wright - 1 dog, 8-day subscription
  RAISE NOTICE 'Creating User 14: Sebastian Wright (approved, 8-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user14_id, 'sebastian.wright@test.com', 'Sebastian', 'Wright', '07700900036', '89 Queen Street', 'Edinburgh', 'EH2 4NH', 'Olivia Wright', '07700900037', 'user', 'approved', NOW() - INTERVAL '11 days', NOW() - INTERVAL '17 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user14_id, 'Roxy', 'Boxer', '2019-12-20', 27.0, 'female', true, 'very_high', 'None', 'High protein diet', 'Edinburgh Vets', '01315554433', 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400', true, true, NOW() - INTERVAL '12 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user14_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '14 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user14_id, tier_8days, '8_days', 'full_day', 8, 6, 304.00, 38.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', NOW() - INTERVAL '3 days');

  -- USER 15: Scarlett Lopez - 2 dogs, 4-day half-day subscription
  RAISE NOTICE 'Creating User 15: Scarlett Lopez (approved, 4-day half-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user15_id, 'scarlett.lopez@test.com', 'Scarlett', 'Lopez', '07700900038', '101 Market Street', 'Cardiff', 'CF10 1FF', 'Daniel Lopez', '07700900039', 'user', 'approved', NOW() - INTERVAL '9 days', NOW() - INTERVAL '15 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user15_id, 'Zara', 'Shih Tzu', '2021-08-05', 6.0, 'female', true, 'low', 'None', 'Small breed diet', 'Cardiff Animal Hospital', '02920776655', 'https://images.unsplash.com/photo-1612536257779-e702f7d8679f?w=400', true, true, NOW() - INTERVAL '10 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user15_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '12 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user15_id, 'Finn', 'Irish Setter', '2018-03-28', 30.0, 'male', true, 'very_high', 'None', 'Large breed active', 'Cardiff Animal Hospital', '02920776655', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400', true, true, NOW() - INTERVAL '10 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user15_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '12 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user15_id, tier_4days, '4_days', 'half_day', 4, 3, 120.00, 30.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', NOW() - INTERVAL '2 days');

  -- Continue with remaining 5 users (16-20)...

  -- USER 16: Jack Hill - 1 dog, 12-day subscription
  RAISE NOTICE 'Creating User 16: Jack Hill (approved, 12-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user16_id, 'jack.hill@test.com', 'Jack', 'Hill', '07700900040', '14 Garden Lane', 'Oxford', 'OX1 3UQ', 'Sophie Hill', '07700900041', 'user', 'approved', NOW() - INTERVAL '16 days', NOW() - INTERVAL '22 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user16_id, 'Harley', 'Siberian Husky', '2020-02-10', 25.0, 'male', true, 'very_high', 'None', 'High energy formula', 'Oxford Veterinary Group', '01865998877', 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400', true, true, NOW() - INTERVAL '17 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user16_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '19 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user16_id, tier_12days, '12_days', 'full_day', 12, 10, 444.00, 37.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days', NOW() - INTERVAL '4 days');

  -- USER 17: Isabella Thompson - 1 dog, 8-day subscription
  RAISE NOTICE 'Creating User 17: Isabella Thompson (approved, 8-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user17_id, 'isabella.thompson@test.com', 'Isabella', 'Thompson', '07700900042', '50 Abbey Road', 'Bath', 'BA1 1LY', 'William Thompson', '07700900043', 'user', 'approved', NOW() - INTERVAL '13 days', NOW() - INTERVAL '19 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user17_id, 'Toby', 'Bulldog', '2019-06-25', 24.0, 'male', true, 'low', 'Breathing issues', 'Weight management', 'Bath Veterinary Surgery', '01225334455', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', true, true, NOW() - INTERVAL '14 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user17_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '16 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user17_id, tier_8days, '8_days', 'full_day', 8, 7, 304.00, 38.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', NOW() - INTERVAL '2 days');

  -- USER 18: Noah Anderson - 2 dogs, 12-day subscription
  RAISE NOTICE 'Creating User 18: Noah Anderson (approved, 12-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user18_id, 'noah.anderson@test.com', 'Noah', 'Anderson', '07700900044', '33 River Street', 'York', 'YO1 9SL', 'Emily Anderson', '07700900045', 'user', 'approved', NOW() - INTERVAL '17 days', NOW() - INTERVAL '23 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user18_id, 'Ruby', 'Dalmatian', '2020-08-14', 25.0, 'female', true, 'very_high', 'None', 'Active formula', 'York Animal Care', '01904556677', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', true, true, NOW() - INTERVAL '18 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user18_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '20 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user18_id, 'Jack', 'Australian Shepherd', '2019-10-30', 23.0, 'male', true, 'very_high', 'None', 'High protein', 'York Animal Care', '01904556677', 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400', true, true, NOW() - INTERVAL '18 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user18_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '20 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user18_id, tier_12days, '12_days', 'full_day', 12, 9, 444.00, 37.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days', NOW() - INTERVAL '6 days');

  -- USER 19: Ava Robinson - 3 dogs, 20-day subscription
  RAISE NOTICE 'Creating User 19: Ava Robinson (approved, 20-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user19_id, 'ava.robinson@test.com', 'Ava', 'Robinson', '07700900046', '77 Mill Lane', 'Brighton', 'BN1 3XE', 'Lucas Robinson', '07700900047', 'user', 'approved', NOW() - INTERVAL '25 days', NOW() - INTERVAL '30 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user19_id, 'Poppy', 'Spaniel Mix', '2020-04-05', 15.0, 'female', true, 'high', 'None', 'Standard adult', 'Brighton Vets', '01273778899', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', true, true, NOW() - INTERVAL '26 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user19_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '28 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user19_id, 'Cooper', 'Mixed Breed', '2019-02-18', 20.0, 'male', true, 'medium', 'None', 'Standard diet', 'Brighton Vets', '01273778899', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', true, true, NOW() - INTERVAL '26 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user19_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '28 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user19_id, 'Rosie', 'Terrier Mix', '2021-09-12', 10.0, 'female', true, 'high', 'None', 'Small breed', 'Brighton Vets', '01273778899', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400', true, true, NOW() - INTERVAL '26 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user19_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '28 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user19_id, tier_20days, '20_days', 'full_day', 20, 15, 700.00, 35.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '11 days', NOW() + INTERVAL '19 days', NOW() - INTERVAL '11 days');

  -- USER 20: William Harris - 1 dog, 4-day subscription
  RAISE NOTICE 'Creating User 20: William Harris (approved, 4-day)';
  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user20_id, 'william.harris@test.com', 'William', 'Harris', '07700900048', '8 Willow Close', 'Plymouth', 'PL1 2AB', 'Charlotte Harris', '07700900049', 'user', 'approved', NOW() - INTERVAL '10 days', NOW() - INTERVAL '16 days');

  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user20_id, 'Archie', 'Whippet', '2020-07-22', 12.0, 'male', true, 'high', 'None', 'Athletic formula', 'Plymouth Pet Hospital', '01752889900', 'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=400', true, true, NOW() - INTERVAL '11 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user20_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '13 days');

  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user20_id, tier_4days, '4_days', 'full_day', 4, 3, 160.00, 40.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '1 days', NOW() + INTERVAL '29 days', NOW() - INTERVAL '1 days');

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Successfully created all 20 test users!';
  RAISE NOTICE '  - 5 pending approval users';
  RAISE NOTICE '  - 15 approved users with subscriptions';
  RAISE NOTICE '  - Total of 32 dogs created';
  RAISE NOTICE '========================================';

END $$;
