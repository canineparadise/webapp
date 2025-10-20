-- TEST DATA PART 4: Remaining 11 Approved Users with Subscriptions
-- IMPORTANT: You must create these users in Supabase Auth first, then replace the email placeholders
-- with the actual UUIDs from auth.users

-- This script creates users 5-15 (11 more approved users with active subscriptions)

DO $$
DECLARE
  -- Subscription tier IDs (fetched dynamically)
  tier_4days UUID;
  tier_8days UUID;
  tier_12days UUID;
  tier_16days UUID;
  tier_20days UUID;

  -- User IDs - REPLACE THESE with actual auth.users IDs after creating accounts
  user5_id UUID := 'REPLACE_WITH_AUTH_UUID_5'::UUID;  -- liam.evans@test.com
  user6_id UUID := 'REPLACE_WITH_AUTH_UUID_6'::UUID;  -- charlotte.moore@test.com
  user7_id UUID := 'REPLACE_WITH_AUTH_UUID_7'::UUID;  -- ethan.jackson@test.com
  user8_id UUID := 'REPLACE_WITH_AUTH_UUID_8'::UUID;  -- mia.white@test.com
  user9_id UUID := 'REPLACE_WITH_AUTH_UUID_9'::UUID;  -- lucas.hall@test.com
  user10_id UUID := 'REPLACE_WITH_AUTH_UUID_10'::UUID; -- grace.allen@test.com
  user11_id UUID := 'REPLACE_WITH_AUTH_UUID_11'::UUID; -- henry.young@test.com
  user12_id UUID := 'REPLACE_WITH_AUTH_UUID_12'::UUID; -- ella.king@test.com
  user13_id UUID := 'REPLACE_WITH_AUTH_UUID_13'::UUID; -- sebastian.wright@test.com
  user14_id UUID := 'REPLACE_WITH_AUTH_UUID_14'::UUID; -- scarlett.lopez@test.com
  user15_id UUID := 'REPLACE_WITH_AUTH_UUID_15'::UUID; -- jack.hill@test.com

  -- Dog IDs
  dog_id UUID;

BEGIN
  RAISE NOTICE 'Starting test data creation for users 5-15...';

  -- Get subscription tier IDs
  SELECT id INTO tier_4days FROM subscription_tiers WHERE tier_name = '4_days' LIMIT 1;
  SELECT id INTO tier_8days FROM subscription_tiers WHERE tier_name = '8_days' LIMIT 1;
  SELECT id INTO tier_12days FROM subscription_tiers WHERE tier_name = '12_days' LIMIT 1;
  SELECT id INTO tier_16days FROM subscription_tiers WHERE tier_name = '16_days' LIMIT 1;
  SELECT id INTO tier_20days FROM subscription_tiers WHERE tier_name = '20_days' LIMIT 1;

  RAISE NOTICE 'Tier IDs fetched successfully';

  -- ============================================================================
  -- USER 5: Liam Evans - 1 dog, 16-day subscription
  -- ============================================================================
  RAISE NOTICE 'Creating user 5: Liam Evans';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user5_id, 'liam.evans@test.com', 'Liam', 'Evans', '07700900014', '34 Elm Avenue', 'Bristol', 'BS5 6HG', 'Sarah Evans', '07700900015', 'user', 'approved', NOW() - INTERVAL '12 days', NOW() - INTERVAL '18 days');

  -- Dog: Alfie (Cocker Spaniel)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user5_id, 'Alfie', 'Cocker Spaniel', '2020-03-20', 14.0, 'male', true, 'high', 'None', 'Standard diet', 'Bristol Vets', '01179123456', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', true, true, NOW() - INTERVAL '13 days')
  RETURNING id INTO dog_id;

  -- Legal agreements
  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user5_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '15 days');

  -- 16-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user5_id, tier_16days, '16_days', 'full_day', 16, 11, 576.00, 36.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days', NOW() - INTERVAL '7 days');

  -- ============================================================================
  -- USER 6: Charlotte Moore - 2 dogs, 20-day subscription (half-day)
  -- ============================================================================
  RAISE NOTICE 'Creating user 6: Charlotte Moore';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user6_id, 'charlotte.moore@test.com', 'Charlotte', 'Moore', '07700900016', '78 Park Lane', 'Birmingham', 'B12 8QJ', 'David Moore', '07700900017', 'user', 'approved', NOW() - INTERVAL '20 days', NOW() - INTERVAL '25 days');

  -- Dog 1: Leo (French Bulldog)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user6_id, 'Leo', 'French Bulldog', '2021-07-10', 12.5, 'male', true, 'medium', 'Breathing sensitivity', 'Grain-free diet', 'Birmingham Animal Care', '01213456789', 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400', true, true, NOW() - INTERVAL '21 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user6_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '22 days');

  -- Dog 2: Winnie (Pug)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user6_id, 'Winnie', 'Pug', '2019-11-05', 8.0, 'female', true, 'low', 'Sensitive skin', 'Hypoallergenic food', 'Birmingham Animal Care', '01213456789', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400', true, true, NOW() - INTERVAL '21 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user6_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '22 days');

  -- 20-day half-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user6_id, tier_20days, '20_days', 'half_day', 20, 16, 500.00, 25.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NOW() - INTERVAL '10 days');

  -- ============================================================================
  -- USER 7: Ethan Jackson - 1 dog, 4-day subscription
  -- ============================================================================
  RAISE NOTICE 'Creating user 7: Ethan Jackson';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user7_id, 'ethan.jackson@test.com', 'Ethan', 'Jackson', '07700900018', '12 Victoria Road', 'Leeds', 'LS6 1DR', 'Rachel Jackson', '07700900019', 'user', 'approved', NOW() - INTERVAL '8 days', NOW() - INTERVAL '14 days');

  -- Dog: Teddy (Yorkshire Terrier)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user7_id, 'Teddy', 'Yorkshire Terrier', '2022-01-15', 3.5, 'male', false, 'high', 'None', 'Small breed formula', 'Leeds Veterinary Clinic', '01132223344', 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=400', true, true, NOW() - INTERVAL '9 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user7_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '11 days');

  -- 4-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user7_id, tier_4days, '4_days', 'full_day', 4, 2, 160.00, 40.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days', NOW() - INTERVAL '4 days');

  -- ============================================================================
  -- USER 8: Mia White - 3 dogs, 12-day subscription
  -- ============================================================================
  RAISE NOTICE 'Creating user 8: Mia White';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user8_id, 'mia.white@test.com', 'Mia', 'White', '07700900020', '56 Church Street', 'Liverpool', 'L1 3AY', 'Ben White', '07700900021', 'user', 'approved', NOW() - INTERVAL '15 days', NOW() - INTERVAL '21 days');

  -- Dog 1: Bella (Labrador Retriever)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user8_id, 'Bella', 'Labrador Retriever', '2018-05-12', 28.0, 'female', true, 'high', 'Hip dysplasia', 'Joint support diet', 'Liverpool Pet Hospital', '01514445566', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', true, true, NOW() - INTERVAL '16 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user8_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '18 days');

  -- Dog 2: Zeus (German Shepherd)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user8_id, 'Zeus', 'German Shepherd', '2019-09-08', 35.0, 'male', true, 'very_high', 'None', 'Large breed adult', 'Liverpool Pet Hospital', '01514445566', 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400', true, true, NOW() - INTERVAL '16 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user8_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '18 days');

  -- Dog 3: Luna (Border Collie)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user8_id, 'Luna', 'Border Collie', '2020-12-03', 18.0, 'female', true, 'very_high', 'None', 'High energy formula', 'Liverpool Pet Hospital', '01514445566', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', true, true, NOW() - INTERVAL '16 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user8_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '18 days');

  -- 12-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user8_id, tier_12days, '12_days', 'full_day', 12, 8, 444.00, 37.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '9 days', NOW() + INTERVAL '21 days', NOW() - INTERVAL '9 days');

  -- ============================================================================
  -- USER 9: Lucas Hall - 2 dogs, 8-day subscription (half-day)
  -- ============================================================================
  RAISE NOTICE 'Creating user 9: Lucas Hall';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user9_id, 'lucas.hall@test.com', 'Lucas', 'Hall', '07700900022', '90 Station Road', 'Sheffield', 'S1 2JE', 'Emma Hall', '07700900023', 'user', 'approved', NOW() - INTERVAL '10 days', NOW() - INTERVAL '16 days');

  -- Dog 1: Murphy (Beagle)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user9_id, 'Murphy', 'Beagle', '2019-04-22', 13.0, 'male', true, 'high', 'None', 'Weight management', 'Sheffield Vets', '01142667788', 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400', true, true, NOW() - INTERVAL '11 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user9_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '13 days');

  -- Dog 2: Sadie (Cavalier King Charles)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user9_id, 'Sadie', 'Cavalier King Charles Spaniel', '2021-02-14', 7.5, 'female', true, 'medium', 'Heart murmur', 'Cardiac support diet', 'Sheffield Vets', '01142667788', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400', true, true, NOW() - INTERVAL '11 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user9_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '13 days');

  -- 8-day half-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user9_id, tier_8days, '8_days', 'half_day', 8, 5, 228.00, 28.50, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days', NOW() - INTERVAL '6 days');

  -- ============================================================================
  -- USER 10: Grace Allen - 1 dog, 20-day subscription
  -- ============================================================================
  RAISE NOTICE 'Creating user 10: Grace Allen';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user10_id, 'grace.allen@test.com', 'Grace', 'Allen', '07700900024', '23 High Street', 'Newcastle', 'NE1 4JH', 'Mark Allen', '07700900025', 'user', 'approved', NOW() - INTERVAL '18 days', NOW() - INTERVAL '24 days');

  -- Dog: Ollie (Staffordshire Bull Terrier)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user10_id, 'Ollie', 'Staffordshire Bull Terrier', '2018-08-30', 16.0, 'male', true, 'high', 'None', 'Standard adult', 'Newcastle Animal Clinic', '01913334455', 'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=400', true, true, NOW() - INTERVAL '19 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user10_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '21 days');

  -- 20-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user10_id, tier_20days, '20_days', 'full_day', 20, 14, 700.00, 35.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days', NOW() - INTERVAL '12 days');

  -- ============================================================================
  -- USER 11: Henry Young - 2 dogs, 12-day subscription (half-day)
  -- ============================================================================
  RAISE NOTICE 'Creating user 11: Henry Young';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user11_id, 'henry.young@test.com', 'Henry', 'Young', '07700900026', '45 Castle Street', 'Nottingham', 'NG1 6AF', 'Lucy Young', '07700900027', 'user', 'approved', NOW() - INTERVAL '14 days', NOW() - INTERVAL '19 days');

  -- Dog 1: Penny (Miniature Schnauzer)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user11_id, 'Penny', 'Miniature Schnauzer', '2020-06-18', 7.0, 'female', true, 'medium', 'None', 'Small breed diet', 'Nottingham Veterinary Centre', '01159876543', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', true, true, NOW() - INTERVAL '15 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user11_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '17 days');

  -- Dog 2: Bear (Rottweiler)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user11_id, 'Bear', 'Rottweiler', '2017-11-25', 45.0, 'male', true, 'medium', 'Arthritis', 'Joint support formula', 'Nottingham Veterinary Centre', '01159876543', 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=400', true, true, NOW() - INTERVAL '15 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user11_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '17 days');

  -- 12-day half-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user11_id, tier_12days, '12_days', 'half_day', 12, 9, 333.00, 27.75, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW() - INTERVAL '5 days');

  -- ============================================================================
  -- USER 12: Ella King - 3 dogs, 16-day subscription
  -- ============================================================================
  RAISE NOTICE 'Creating user 12: Ella King';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user12_id, 'ella.king@test.com', 'Ella', 'King', '07700900028', '67 Bridge Road', 'Cambridge', 'CB1 2JN', 'James King', '07700900029', 'user', 'approved', NOW() - INTERVAL '22 days', NOW() - INTERVAL '28 days');

  -- Dog 1: Coco (Dachshund)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user12_id, 'Coco', 'Dachshund', '2021-03-07', 6.5, 'female', true, 'medium', 'Back issues', 'Weight management', 'Cambridge Pet Care', '01223112233', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400', true, true, NOW() - INTERVAL '23 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user12_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '25 days');

  -- Dog 2: Jasper (Springer Spaniel)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user12_id, 'Jasper', 'English Springer Spaniel', '2019-07-19', 22.0, 'male', true, 'very_high', 'None', 'Active dog formula', 'Cambridge Pet Care', '01223112233', 'https://images.unsplash.com/photo-1544526226-d4568090ffb8?w=400', true, true, NOW() - INTERVAL '23 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user12_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '25 days');

  -- Dog 3: Millie (West Highland Terrier)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user12_id, 'Millie', 'West Highland White Terrier', '2020-10-11', 8.5, 'female', true, 'high', 'Skin allergies', 'Hypoallergenic diet', 'Cambridge Pet Care', '01223112233', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', true, true, NOW() - INTERVAL '23 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user12_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '25 days');

  -- 16-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user12_id, tier_16days, '16_days', 'full_day', 16, 12, 576.00, 36.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days', NOW() - INTERVAL '8 days');

  -- ============================================================================
  -- USER 13: Sebastian Wright - 1 dog, 8-day subscription
  -- ============================================================================
  RAISE NOTICE 'Creating user 13: Sebastian Wright';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user13_id, 'sebastian.wright@test.com', 'Sebastian', 'Wright', '07700900030', '89 Queen Street', 'Edinburgh', 'EH2 4NH', 'Olivia Wright', '07700900031', 'user', 'approved', NOW() - INTERVAL '11 days', NOW() - INTERVAL '17 days');

  -- Dog: Roxy (Boxer)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user13_id, 'Roxy', 'Boxer', '2019-12-20', 27.0, 'female', true, 'very_high', 'None', 'High protein diet', 'Edinburgh Vets', '01315554433', 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400', true, true, NOW() - INTERVAL '12 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user13_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '14 days');

  -- 8-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user13_id, tier_8days, '8_days', 'full_day', 8, 6, 304.00, 38.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', NOW() - INTERVAL '3 days');

  -- ============================================================================
  -- USER 14: Scarlett Lopez - 2 dogs, 4-day subscription (half-day)
  -- ============================================================================
  RAISE NOTICE 'Creating user 14: Scarlett Lopez';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user14_id, 'scarlett.lopez@test.com', 'Scarlett', 'Lopez', '07700900032', '101 Market Street', 'Cardiff', 'CF10 1FF', 'Daniel Lopez', '07700900033', 'user', 'approved', NOW() - INTERVAL '9 days', NOW() - INTERVAL '15 days');

  -- Dog 1: Zara (Shih Tzu)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user14_id, 'Zara', 'Shih Tzu', '2021-08-05', 6.0, 'female', true, 'low', 'None', 'Small breed diet', 'Cardiff Animal Hospital', '02920776655', 'https://images.unsplash.com/photo-1612536257779-e702f7d8679f?w=400', true, true, NOW() - INTERVAL '10 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user14_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '12 days');

  -- Dog 2: Finn (Irish Setter)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user14_id, 'Finn', 'Irish Setter', '2018-03-28', 30.0, 'male', true, 'very_high', 'None', 'Large breed active', 'Cardiff Animal Hospital', '02920776655', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400', true, true, NOW() - INTERVAL '10 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user14_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '12 days');

  -- 4-day half-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user14_id, tier_4days, '4_days', 'half_day', 4, 3, 120.00, 30.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', NOW() - INTERVAL '2 days');

  -- ============================================================================
  -- USER 15: Jack Hill - 1 dog, 12-day subscription
  -- ============================================================================
  RAISE NOTICE 'Creating user 15: Jack Hill';

  INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, approved_at, created_at)
  VALUES (user15_id, 'jack.hill@test.com', 'Jack', 'Hill', '07700900034', '14 Garden Lane', 'Oxford', 'OX1 3UQ', 'Sophie Hill', '07700900035', 'user', 'approved', NOW() - INTERVAL '16 days', NOW() - INTERVAL '22 days');

  -- Dog: Harley (Husky)
  INSERT INTO dogs (owner_id, name, breed, date_of_birth, weight, gender, is_neutered, energy_level, medical_conditions, dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user15_id, 'Harley', 'Siberian Husky', '2020-02-10', 25.0, 'male', true, 'very_high', 'None', 'High energy formula', 'Oxford Veterinary Group', '01865998877', 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400', true, true, NOW() - INTERVAL '17 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user15_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '19 days');

  -- 12-day subscription
  INSERT INTO subscriptions (user_id, tier_id, tier, session_type, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, created_at)
  VALUES (user15_id, tier_12days, '12_days', 'full_day', 12, 10, 444.00, 37.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days', NOW() - INTERVAL '4 days');

  RAISE NOTICE 'Successfully created all 11 users (5-15) with subscriptions!';
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'IMPORTANT: Before running this script, you must:';
  RAISE NOTICE '1. Create these 11 users in Supabase Auth (Authentication > Users > Add user)';
  RAISE NOTICE '2. Copy their UUIDs from auth.users';
  RAISE NOTICE '3. Replace the REPLACE_WITH_AUTH_UUID_X placeholders at the top of this script';
  RAISE NOTICE '===========================================';

END $$;
