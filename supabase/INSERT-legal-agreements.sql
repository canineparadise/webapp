-- INSERT LEGAL AGREEMENTS for all 20 test users
-- Users 1-5: PENDING - agreements signed but no recurring billing
-- Users 6-20: APPROVED - all agreements signed including recurring billing

-- ========================================================================
-- PENDING USERS (1-5) - No recurring billing consent
-- ========================================================================

-- USER 1: Emma Wilson
INSERT INTO legal_agreements (
  user_id,
  terms_accepted, terms_accepted_at,
  liability_waiver_accepted, liability_waiver_accepted_at,
  photo_consent, photo_consent_at,
  injury_waiver_agreed, injury_waiver_agreed_at,
  photo_permission_granted, photo_permission_granted_at,
  vaccination_requirement_understood, vaccination_requirement_understood_at,
  behavioral_assessment_agreed, behavioral_assessment_agreed_at,
  medication_administration_consent, medication_administration_consent_at,
  emergency_contact_consent, emergency_contact_consent_at,
  property_damage_waiver, property_damage_waiver_at,
  collection_procedure_agreed, collection_procedure_agreed_at,
  data_protection_consent, data_protection_consent_at,
  notice_period_accepted, notice_period_accepted_at,
  recurring_billing_accepted, recurring_billing_accepted_at,
  digital_signature, signed_at, version
)
SELECT
  id,
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  true, NOW() - INTERVAL '4 days',
  false, NULL,
  'Emma Wilson', NOW() - INTERVAL '4 days', '1.0'
FROM profiles WHERE email = 'emma.wilson@test.com';

-- USER 2: James Brown
INSERT INTO legal_agreements (
  user_id,
  terms_accepted, terms_accepted_at,
  liability_waiver_accepted, liability_waiver_accepted_at,
  photo_consent, photo_consent_at,
  injury_waiver_agreed, injury_waiver_agreed_at,
  photo_permission_granted, photo_permission_granted_at,
  vaccination_requirement_understood, vaccination_requirement_understood_at,
  behavioral_assessment_agreed, behavioral_assessment_agreed_at,
  medication_administration_consent, medication_administration_consent_at,
  emergency_contact_consent, emergency_contact_consent_at,
  property_damage_waiver, property_damage_waiver_at,
  collection_procedure_agreed, collection_procedure_agreed_at,
  data_protection_consent, data_protection_consent_at,
  notice_period_accepted, notice_period_accepted_at,
  recurring_billing_accepted, recurring_billing_accepted_at,
  digital_signature, signed_at, version
)
SELECT
  id,
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  true, NOW() - INTERVAL '6 days',
  false, NULL,
  'James Brown', NOW() - INTERVAL '6 days', '1.0'
FROM profiles WHERE email = 'james.brown@test.com';

-- USER 3: Sophie Taylor
INSERT INTO legal_agreements (
  user_id,
  terms_accepted, terms_accepted_at,
  liability_waiver_accepted, liability_waiver_accepted_at,
  photo_consent, photo_consent_at,
  injury_waiver_agreed, injury_waiver_agreed_at,
  photo_permission_granted, photo_permission_granted_at,
  vaccination_requirement_understood, vaccination_requirement_understood_at,
  behavioral_assessment_agreed, behavioral_assessment_agreed_at,
  medication_administration_consent, medication_administration_consent_at,
  emergency_contact_consent, emergency_contact_consent_at,
  property_damage_waiver, property_damage_waiver_at,
  collection_procedure_agreed, collection_procedure_agreed_at,
  data_protection_consent, data_protection_consent_at,
  notice_period_accepted, notice_period_accepted_at,
  recurring_billing_accepted, recurring_billing_accepted_at,
  digital_signature, signed_at, version
)
SELECT
  id,
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  true, NOW() - INTERVAL '2 days',
  false, NULL,
  'Sophie Taylor', NOW() - INTERVAL '2 days', '1.0'
FROM profiles WHERE email = 'sophie.taylor@test.com';

-- USER 4: Oliver Davis
INSERT INTO legal_agreements (
  user_id,
  terms_accepted, terms_accepted_at,
  liability_waiver_accepted, liability_waiver_accepted_at,
  photo_consent, photo_consent_at,
  injury_waiver_agreed, injury_waiver_agreed_at,
  photo_permission_granted, photo_permission_granted_at,
  vaccination_requirement_understood, vaccination_requirement_understood_at,
  behavioral_assessment_agreed, behavioral_assessment_agreed_at,
  medication_administration_consent, medication_administration_consent_at,
  emergency_contact_consent, emergency_contact_consent_at,
  property_damage_waiver, property_damage_waiver_at,
  collection_procedure_agreed, collection_procedure_agreed_at,
  data_protection_consent, data_protection_consent_at,
  notice_period_accepted, notice_period_accepted_at,
  recurring_billing_accepted, recurring_billing_accepted_at,
  digital_signature, signed_at, version
)
SELECT
  id,
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  true, NOW() - INTERVAL '5 days',
  false, NULL,
  'Oliver Davis', NOW() - INTERVAL '5 days', '1.0'
FROM profiles WHERE email = 'oliver.davis@test.com';

-- USER 5: Amelia Martinez
INSERT INTO legal_agreements (
  user_id,
  terms_accepted, terms_accepted_at,
  liability_waiver_accepted, liability_waiver_accepted_at,
  photo_consent, photo_consent_at,
  injury_waiver_agreed, injury_waiver_agreed_at,
  photo_permission_granted, photo_permission_granted_at,
  vaccination_requirement_understood, vaccination_requirement_understood_at,
  behavioral_assessment_agreed, behavioral_assessment_agreed_at,
  medication_administration_consent, medication_administration_consent_at,
  emergency_contact_consent, emergency_contact_consent_at,
  property_damage_waiver, property_damage_waiver_at,
  collection_procedure_agreed, collection_procedure_agreed_at,
  data_protection_consent, data_protection_consent_at,
  notice_period_accepted, notice_period_accepted_at,
  recurring_billing_accepted, recurring_billing_accepted_at,
  digital_signature, signed_at, version
)
SELECT
  id,
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  true, NOW() - INTERVAL '3 days',
  false, NULL,
  'Amelia Martinez', NOW() - INTERVAL '3 days', '1.0'
FROM profiles WHERE email = 'amelia.martinez@test.com';

-- ========================================================================
-- APPROVED USERS (6-20) - With recurring billing consent
-- ========================================================================

-- USER 6: Liam Evans
INSERT INTO legal_agreements (
  user_id,
  terms_accepted, terms_accepted_at,
  liability_waiver_accepted, liability_waiver_accepted_at,
  photo_consent, photo_consent_at,
  injury_waiver_agreed, injury_waiver_agreed_at,
  photo_permission_granted, photo_permission_granted_at,
  vaccination_requirement_understood, vaccination_requirement_understood_at,
  behavioral_assessment_agreed, behavioral_assessment_agreed_at,
  medication_administration_consent, medication_administration_consent_at,
  emergency_contact_consent, emergency_contact_consent_at,
  property_damage_waiver, property_damage_waiver_at,
  collection_procedure_agreed, collection_procedure_agreed_at,
  data_protection_consent, data_protection_consent_at,
  notice_period_accepted, notice_period_accepted_at,
  recurring_billing_accepted, recurring_billing_accepted_at,
  digital_signature, signed_at, version
)
SELECT
  id,
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  true, NOW() - INTERVAL '15 days',
  'Liam Evans', NOW() - INTERVAL '15 days', '1.0'
FROM profiles WHERE email = 'liam.evans@test.com';

-- Repeat similar pattern for users 7-20 with their respective interval days
-- I'll create the remaining 14 users with appropriate timestamps

-- USER 7: Charlotte Moore
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', true, NOW() - INTERVAL '20 days', 'Charlotte Moore', NOW() - INTERVAL '20 days', '1.0'
FROM profiles WHERE email = 'charlotte.moore@test.com';

-- USER 8: Ethan Jackson
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', true, NOW() - INTERVAL '18 days', 'Ethan Jackson', NOW() - INTERVAL '18 days', '1.0'
FROM profiles WHERE email = 'ethan.jackson@test.com';

-- USER 9: Mia White
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', true, NOW() - INTERVAL '25 days', 'Mia White', NOW() - INTERVAL '25 days', '1.0'
FROM profiles WHERE email = 'mia.white@test.com';

-- USER 10: Lucas Hall
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', true, NOW() - INTERVAL '22 days', 'Lucas Hall', NOW() - INTERVAL '22 days', '1.0'
FROM profiles WHERE email = 'lucas.hall@test.com';

-- USER 11: Grace Allen
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '30 days', 'Grace Allen', NOW() - INTERVAL '30 days', '1.0'
FROM profiles WHERE email = 'grace.allen@test.com';

-- USER 12: Henry Young
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', true, NOW() - INTERVAL '28 days', 'Henry Young', NOW() - INTERVAL '28 days', '1.0'
FROM profiles WHERE email = 'henry.young@test.com';

-- USER 13: Ella King
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', true, NOW() - INTERVAL '35 days', 'Ella King', NOW() - INTERVAL '35 days', '1.0'
FROM profiles WHERE email = 'ella.king@test.com';

-- USER 14: Sebastian Wright
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', true, NOW() - INTERVAL '40 days', 'Sebastian Wright', NOW() - INTERVAL '40 days', '1.0'
FROM profiles WHERE email = 'sebastian.wright@test.com';

-- USER 15: Scarlett Lopez
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', true, NOW() - INTERVAL '32 days', 'Scarlett Lopez', NOW() - INTERVAL '32 days', '1.0'
FROM profiles WHERE email = 'scarlett.lopez@test.com';

-- USER 16: Jack Hill
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', true, NOW() - INTERVAL '27 days', 'Jack Hill', NOW() - INTERVAL '27 days', '1.0'
FROM profiles WHERE email = 'jack.hill@test.com';

-- USER 17: Isabella Thompson
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', true, NOW() - INTERVAL '23 days', 'Isabella Thompson', NOW() - INTERVAL '23 days', '1.0'
FROM profiles WHERE email = 'isabella.thompson@test.com';

-- USER 18: Noah Anderson
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', true, NOW() - INTERVAL '26 days', 'Noah Anderson', NOW() - INTERVAL '26 days', '1.0'
FROM profiles WHERE email = 'noah.anderson@test.com';

-- USER 19: Ava Robinson
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', true, NOW() - INTERVAL '29 days', 'Ava Robinson', NOW() - INTERVAL '29 days', '1.0'
FROM profiles WHERE email = 'ava.robinson@test.com';

-- USER 20: William Harris
INSERT INTO legal_agreements (user_id, terms_accepted, terms_accepted_at, liability_waiver_accepted, liability_waiver_accepted_at, photo_consent, photo_consent_at, injury_waiver_agreed, injury_waiver_agreed_at, photo_permission_granted, photo_permission_granted_at, vaccination_requirement_understood, vaccination_requirement_understood_at, behavioral_assessment_agreed, behavioral_assessment_agreed_at, medication_administration_consent, medication_administration_consent_at, emergency_contact_consent, emergency_contact_consent_at, property_damage_waiver, property_damage_waiver_at, collection_procedure_agreed, collection_procedure_agreed_at, data_protection_consent, data_protection_consent_at, notice_period_accepted, notice_period_accepted_at, recurring_billing_accepted, recurring_billing_accepted_at, digital_signature, signed_at, version)
SELECT id, true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', true, NOW() - INTERVAL '24 days', 'William Harris', NOW() - INTERVAL '24 days', '1.0'
FROM profiles WHERE email = 'william.harris@test.com';

-- Verify all legal agreements were inserted
SELECT
  p.email,
  p.first_name,
  la.recurring_billing_accepted,
  la.signed_at
FROM legal_agreements la
JOIN profiles p ON la.user_id = p.id
WHERE p.email LIKE '%@test.com'
ORDER BY p.email;
