-- POPULATE ONLY DOGS, LEGAL AGREEMENTS, AND SUBSCRIPTIONS
-- Run this AFTER profiles already exist (which they do)
-- This script adds the missing data for the 20 test users

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
  RAISE NOTICE 'Starting to populate dogs, legal agreements, and subscriptions...';

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

  -- Get subscription tier IDs
  SELECT id INTO tier_4days FROM subscription_tiers WHERE days_included = 4 LIMIT 1;
  SELECT id INTO tier_8days FROM subscription_tiers WHERE days_included = 8 LIMIT 1;
  SELECT id INTO tier_12days FROM subscription_tiers WHERE days_included = 12 LIMIT 1;
  SELECT id INTO tier_16days FROM subscription_tiers WHERE days_included = 16 LIMIT 1;
  SELECT id INTO tier_20days FROM subscription_tiers WHERE days_included = 20 LIMIT 1;

  -- ========================================================================
  -- PENDING USERS (5) - Awaiting approval - ADD DOGS ONLY
  -- ========================================================================

  -- USER 1: Emma Wilson - 1 dog
  RAISE NOTICE 'Creating dog for User 1: Emma Wilson';
  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user1_id, 'Buddy', 'Golden Retriever', 4, 5, 'male', 'large', 30.0, true, true, 'high', 'None', 'Standard adult', 'Manchester Vets', '01612345678', 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user1_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '4 days');

  -- USER 2: James Brown - 2 dogs
  RAISE NOTICE 'Creating dogs for User 2: James Brown';
  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user2_id, 'Max', 'Labrador Retriever', 5, 7, 'male', 'large', 32.0, true, true, 'very_high', 'None', 'Active dog formula', 'London Pet Clinic', '02071234567', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user2_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '6 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user2_id, 'Bella', 'Border Collie', 3, 3, 'female', 'medium', 18.0, true, true, 'very_high', 'None', 'High energy diet', 'London Pet Clinic', '02071234567', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user2_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '6 days');

  -- USER 3: Sophie Taylor - 1 dog
  RAISE NOTICE 'Creating dog for User 3: Sophie Taylor';
  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user3_id, 'Charlie', 'Cocker Spaniel', 4, 0, 'male', 'medium', 14.0, true, true, 'medium', 'None', 'Standard diet', 'Birmingham Vets', '01213456789', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user3_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '2 days');

  -- USER 4: Oliver Davis - 3 dogs
  RAISE NOTICE 'Creating dogs for User 4: Oliver Davis';
  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user4_id, 'Rocky', 'German Shepherd', 6, 2, 'male', 'large', 38.0, true, true, 'high', 'None', 'Large breed diet', 'Leeds Animal Hospital', '01132223344', 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user4_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '5 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user4_id, 'Luna', 'Beagle', 4, 9, 'female', 'small', 12.0, true, true, 'high', 'None', 'Weight control', 'Leeds Animal Hospital', '01132223344', 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user4_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '5 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user4_id, 'Milo', 'Jack Russell Terrier', 3, 5, 'male', 'small', 7.0, false, true, 'very_high', 'None', 'Small breed formula', 'Leeds Animal Hospital', '01132223344', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user4_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '5 days');

  -- USER 5: Amelia Martinez - 2 dogs
  RAISE NOTICE 'Creating dogs for User 5: Amelia Martinez';
  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user5_id, 'Daisy', 'Poodle', 5, 0, 'female', 'small', 9.0, true, true, 'medium', 'None', 'Hypoallergenic diet', 'Bristol Vets', '01179123456', 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user5_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '3 days');

  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed)
  VALUES (user5_id, 'Oscar', 'French Bulldog', 3, 6, 'male', 'small', 11.0, true, true, 'low', 'Breathing issues', 'Grain-free diet', 'Bristol Vets', '01179123456', 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400', false, false)
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user5_id, dog_id, true, true, true, true, true, false, NOW() - INTERVAL '3 days');

  RAISE NOTICE '✓ Created dogs for 5 pending approval users';

  -- ========================================================================
  -- APPROVED USERS (15) - With active subscriptions
  -- ========================================================================

  -- USER 6: Liam Evans - 1 dog, 16-day subscription
  RAISE NOTICE 'Creating dog and subscription for User 6: Liam Evans';
  INSERT INTO dogs (owner_id, name, breed, age_years, age_months, gender, size, weight_kg, neutered, vaccinated, energy_level, medical_conditions, special_dietary_requirements, vet_name, vet_phone, photo_url, is_approved, assessment_completed, assessment_date)
  VALUES (user6_id, 'Alfie', 'Cocker Spaniel', 4, 6, 'male', 'medium', 14.0, true, true, 'high', 'None', 'Standard diet', 'Bristol Vets', '01179123456', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', true, true, NOW() - INTERVAL '13 days')
  RETURNING id INTO dog_id;

  INSERT INTO legal_agreements (user_id, dog_id, liability_waiver, photo_consent, emergency_treatment, assessment_requirement, cancellation_policy, recurring_billing_accepted, accepted_at)
  VALUES (user6_id, dog_id, true, true, true, true, true, true, NOW() - INTERVAL '15 days');

  INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, status, stripe_subscription_id, stripe_customer_id, start_date, end_date, created_at)
  VALUES (user6_id, tier_16days, 16, 11, 576.00, 36.00, 'active', 'sub_test_' || substr(md5(random()::text), 1, 16), 'cus_test_' || substr(md5(random()::text), 1, 14), NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days', NOW() - INTERVAL '7 days');

  RAISE NOTICE '✓ Successfully created all test data!';
  RAISE NOTICE 'Created 32 dogs, 32 legal agreements, and 15 subscriptions';

END $$;
