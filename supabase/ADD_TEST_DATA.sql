-- ============================================
-- CANINE PARADISE - COMPREHENSIVE TEST DATA
-- ============================================
-- This script creates realistic test data for:
-- - Customer profiles and staff
-- - Dogs
-- - Subscriptions (various plans)
-- - Bookings (today's full-day and half-day sessions)
-- - Check-in/check-out scenarios
-- - Cancellation request scenario
-- ============================================

-- Clean up any existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM bookings;
-- DELETE FROM subscriptions;
-- DELETE FROM dogs;
-- DELETE FROM legal_agreements;
-- DELETE FROM profiles WHERE email LIKE '%test%';

-- ============================================
-- STEP 1: Create Test User Profiles
-- ============================================

-- Customer 1: Sarah Johnson (has 2 dogs, active subscription)
INSERT INTO profiles (id, email, first_name, last_name, phone, role, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'sarah.johnson@test.com', 'Sarah', 'Johnson', '07700900001', 'user', NOW())
ON CONFLICT (id) DO NOTHING;

-- Customer 2: Mark Davies (has 1 dog, active subscription, will request cancellation)
INSERT INTO profiles (id, email, first_name, last_name, phone, role, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'mark.davies@test.com', 'Mark', 'Davies', '07700900002', 'user', NOW())
ON CONFLICT (id) DO NOTHING;

-- Customer 3: Emily Chen (has 1 dog, half-day subscription)
INSERT INTO profiles (id, email, first_name, last_name, phone, role, created_at)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'emily.chen@test.com', 'Emily', 'Chen', '07700900003', 'user', NOW())
ON CONFLICT (id) DO NOTHING;

-- Customer 4: James Wilson (has 1 dog, full-day subscription)
INSERT INTO profiles (id, email, first_name, last_name, phone, role, created_at)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'james.wilson@test.com', 'James', 'Wilson', '07700900004', 'user', NOW())
ON CONFLICT (id) DO NOTHING;

-- Staff Member 1: Katie (for check-ins)
INSERT INTO profiles (id, email, first_name, last_name, phone, role, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'katie.staff@test.com', 'Katie', 'Smith', '07700900100', 'staff', NOW())
ON CONFLICT (id) DO NOTHING;

-- Staff Member 2: Tom (for check-outs)
INSERT INTO profiles (id, email, first_name, last_name, phone, role, created_at)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'tom.staff@test.com', 'Tom', 'Brown', '07700900101', 'staff', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Create Test Dogs
-- ============================================

-- Sarah's dogs
INSERT INTO dogs (id, user_id, name, breed, age, weight, medical_conditions, created_at)
VALUES
  ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Max', 'Golden Retriever', 3, 30.5, 'None', NOW()),
  ('d1111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Bella', 'Labrador', 5, 28.0, 'Allergic to chicken', NOW())
ON CONFLICT (id) DO NOTHING;

-- Mark's dog
INSERT INTO dogs (id, user_id, name, breed, age, weight, medical_conditions, created_at)
VALUES
  ('d2222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Charlie', 'Border Collie', 2, 20.0, 'None', NOW())
ON CONFLICT (id) DO NOTHING;

-- Emily's dog
INSERT INTO dogs (id, user_id, name, breed, age, weight, medical_conditions, created_at)
VALUES
  ('d3333331-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Luna', 'French Bulldog', 4, 12.0, 'Hip dysplasia - gentle play only', NOW())
ON CONFLICT (id) DO NOTHING;

-- James's dog
INSERT INTO dogs (id, user_id, name, breed, age, weight, medical_conditions, created_at)
VALUES
  ('d4444441-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Rocky', 'German Shepherd', 6, 35.0, 'None', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: Create Legal Agreements
-- ============================================

INSERT INTO legal_agreements (id, user_id, terms_accepted, liability_accepted, vaccination_policy_accepted, notice_period_accepted, terms_accepted_at, liability_accepted_at, vaccination_policy_accepted_at, notice_period_accepted_at, created_at)
VALUES
  ('la111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', true, true, true, true, NOW(), NOW(), NOW(), NOW(), NOW()),
  ('la222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', true, true, true, true, NOW(), NOW(), NOW(), NOW(), NOW()),
  ('la333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', true, true, true, true, NOW(), NOW(), NOW(), NOW(), NOW()),
  ('la444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', true, true, true, true, NOW(), NOW(), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 4: Create Subscriptions
-- ============================================

-- Sarah: 12 days/month full-day (£444/month)
INSERT INTO subscriptions (id, user_id, plan_name, days_per_month, monthly_price, status, start_date, next_billing_date, stripe_subscription_id, created_at)
VALUES
  ('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '12 Days Full-Day', 12, 444.00, 'active', CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '28 days', 'sub_test_sarah', NOW())
ON CONFLICT (id) DO NOTHING;

-- Mark: 8 days/month full-day (£304/month) - WILL REQUEST CANCELLATION
INSERT INTO subscriptions (id, user_id, plan_name, days_per_month, monthly_price, status, start_date, next_billing_date, stripe_subscription_id, created_at)
VALUES
  ('s2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '8 Days Full-Day', 8, 304.00, 'active', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '28 days', 'sub_test_mark', NOW())
ON CONFLICT (id) DO NOTHING;

-- Emily: 12 days/month HALF-DAY (£333/month)
INSERT INTO subscriptions (id, user_id, plan_name, days_per_month, monthly_price, status, start_date, next_billing_date, stripe_subscription_id, created_at)
VALUES
  ('s3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '12 Days Half-Day', 12, 333.00, 'active', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '28 days', 'sub_test_emily', NOW())
ON CONFLICT (id) DO NOTHING;

-- James: 20 days/month full-day (£700/month) - power user
INSERT INTO subscriptions (id, user_id, plan_name, days_per_month, monthly_price, status, start_date, next_billing_date, stripe_subscription_id, created_at)
VALUES
  ('s4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '20 Days Full-Day', 20, 700.00, 'active', CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE + INTERVAL '28 days', 'sub_test_james', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 5: Create TODAY'S Bookings (mix of full-day and half-day)
-- ============================================

-- Sarah's Max - FULL DAY - ALREADY CHECKED IN (by Katie at 7:30am)
INSERT INTO bookings (id, user_id, dog_id, booking_date, session_type, session_start_time, session_end_time, status, checked_in, checked_in_at, checked_in_by, checked_out, created_at)
VALUES
  ('b1111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'd1111111-1111-1111-1111-111111111111',
   CURRENT_DATE,
   'full_day',
   '07:00',
   '19:00',
   'confirmed',
   true,
   CURRENT_DATE + TIME '07:30',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   false,
   NOW())
ON CONFLICT (id) DO NOTHING;

-- Sarah's Bella - FULL DAY - ALREADY CHECKED IN (by Katie at 7:35am)
INSERT INTO bookings (id, user_id, dog_id, booking_date, session_type, session_start_time, session_end_time, status, checked_in, checked_in_at, checked_in_by, checked_out, created_at)
VALUES
  ('b1111112-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'd1111112-1111-1111-1111-111111111111',
   CURRENT_DATE,
   'full_day',
   '07:00',
   '19:00',
   'confirmed',
   true,
   CURRENT_DATE + TIME '07:35',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   false,
   NOW())
ON CONFLICT (id) DO NOTHING;

-- Mark's Charlie - FULL DAY - NOT CHECKED IN YET
INSERT INTO bookings (id, user_id, dog_id, booking_date, session_type, session_start_time, session_end_time, status, checked_in, checked_out, created_at)
VALUES
  ('b2222221-2222-2222-2222-222222222222',
   '22222222-2222-2222-2222-222222222222',
   'd2222221-2222-2222-2222-222222222222',
   CURRENT_DATE,
   'full_day',
   '07:00',
   '19:00',
   'pending',
   false,
   false,
   NOW())
ON CONFLICT (id) DO NOTHING;

-- Emily's Luna - HALF DAY (10am-2pm) - ALREADY CHECKED IN (by Tom at 10:15am)
INSERT INTO bookings (id, user_id, dog_id, booking_date, session_type, session_start_time, session_end_time, status, checked_in, checked_in_at, checked_in_by, checked_out, created_at)
VALUES
  ('b3333331-3333-3333-3333-333333333333',
   '33333333-3333-3333-3333-333333333333',
   'd3333331-3333-3333-3333-333333333333',
   CURRENT_DATE,
   'half_day',
   '10:00',
   '14:00',
   'confirmed',
   true,
   CURRENT_DATE + TIME '10:15',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   false,
   NOW())
ON CONFLICT (id) DO NOTHING;

-- James's Rocky - FULL DAY - NOT CHECKED IN YET
INSERT INTO bookings (id, user_id, dog_id, booking_date, session_type, session_start_time, session_end_time, status, checked_in, checked_out, created_at)
VALUES
  ('b4444441-4444-4444-4444-444444444444',
   '44444444-4444-4444-4444-444444444444',
   'd4444441-4444-4444-4444-444444444444',
   CURRENT_DATE,
   'full_day',
   '07:00',
   '19:00',
   'pending',
   false,
   false,
   NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 6: Simulate a cancellation request (Mark wants to cancel)
-- ============================================

UPDATE subscriptions SET
  cancellation_requested = true,
  cancellation_requested_at = NOW() - INTERVAL '5 days',
  cancellation_effective_date = (CURRENT_DATE + INTERVAL '25 days')::DATE
WHERE id = 's2222222-2222-2222-2222-222222222222';

-- ============================================
-- SUCCESS SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Test data created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '👥 CUSTOMERS CREATED:';
  RAISE NOTICE '  1. Sarah Johnson - 2 dogs (Max & Bella) - 12 days full-day subscription';
  RAISE NOTICE '  2. Mark Davies - 1 dog (Charlie) - 8 days full-day - CANCELLATION REQUESTED';
  RAISE NOTICE '  3. Emily Chen - 1 dog (Luna) - 12 days HALF-DAY subscription';
  RAISE NOTICE '  4. James Wilson - 1 dog (Rocky) - 20 days full-day subscription';
  RAISE NOTICE '';
  RAISE NOTICE '👔 STAFF CREATED:';
  RAISE NOTICE '  1. Katie Smith (staff)';
  RAISE NOTICE '  2. Tom Brown (staff)';
  RAISE NOTICE '';
  RAISE NOTICE '📅 TODAY''S BOOKINGS:';
  RAISE NOTICE '  ✅ Max (Sarah) - Full Day - CHECKED IN at 7:30am by Katie';
  RAISE NOTICE '  ✅ Bella (Sarah) - Full Day - CHECKED IN at 7:35am by Katie';
  RAISE NOTICE '  ⏳ Charlie (Mark) - Full Day - PENDING CHECK-IN';
  RAISE NOTICE '  ✅ Luna (Emily) - HALF DAY (10am-2pm) - CHECKED IN at 10:15am by Tom';
  RAISE NOTICE '  ⏳ Rocky (James) - Full Day - PENDING CHECK-IN';
  RAISE NOTICE '';
  RAISE NOTICE '🔔 SPECIAL SCENARIOS:';
  RAISE NOTICE '  - Mark Davies has requested cancellation 5 days ago';
  RAISE NOTICE '  - Effective date: ' || (CURRENT_DATE + INTERVAL '25 days')::TEXT;
  RAISE NOTICE '  - Will be charged £304 for notice period';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TEST CREDENTIALS (you''ll need to create auth users separately):';
  RAISE NOTICE '  sarah.johnson@test.com';
  RAISE NOTICE '  mark.davies@test.com';
  RAISE NOTICE '  emily.chen@test.com';
  RAISE NOTICE '  james.wilson@test.com';
  RAISE NOTICE '  katie.staff@test.com';
  RAISE NOTICE '  tom.staff@test.com';
  RAISE NOTICE '';
  RAISE NOTICE '📝 NEXT STEPS:';
  RAISE NOTICE '  1. Visit /staff/checkin to see today''s check-in dashboard';
  RAISE NOTICE '  2. Check in Charlie and Rocky';
  RAISE NOTICE '  3. Check out Luna (half-day ends at 2pm)';
  RAISE NOTICE '  4. View subscriptions to see Mark''s cancellation request';
END $$;
