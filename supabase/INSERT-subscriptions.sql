-- INSERT SUBSCRIPTIONS for 15 approved users (users 6-20)
-- Mix of full-day and half-day subscriptions with various tiers

-- USER 6: Liam Evans - Premium 16 Days (full day)
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '13c63bff-4f52-4449-bff3-d1c82e24f4dd',
  16, 11, 576.00, 36.00, true, true,
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '23 days',
  CURRENT_DATE + INTERVAL '23 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'liam.evans@test.com';

-- USER 7: Charlotte Moore - Standard 8 Days (full day)
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  'f772fa6b-26ac-4ace-a4be-fdd0a3cce4c5',
  8, 5, 304.00, 38.00, true, true,
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '20 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'charlotte.moore@test.com';

-- USER 8: Ethan Jackson - Plus Half Day 12 Half Days
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '2c521838-f7a8-415f-a6a7-26bb89e3311a',
  12, 8, 228.00, 19.00, true, true,
  CURRENT_DATE - INTERVAL '8 days',
  CURRENT_DATE + INTERVAL '22 days',
  CURRENT_DATE + INTERVAL '22 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'ethan.jackson@test.com';

-- USER 9: Mia White - Ultimate 20 Days (full day)
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '9f832592-fc2d-4596-832c-85320f50cef5',
  20, 14, 720.00, 36.00, true, true,
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '15 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'mia.white@test.com';

-- USER 10: Lucas Hall - Premium Half Day 16 Half Days
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '2a843870-3766-4a2a-9c58-a36cae130c57',
  16, 10, 288.00, 18.00, true, true,
  CURRENT_DATE - INTERVAL '12 days',
  CURRENT_DATE + INTERVAL '18 days',
  CURRENT_DATE + INTERVAL '18 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'lucas.hall@test.com';

-- USER 11: Grace Allen - Plus 12 Days (full day)
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '46a2e332-1ff2-4f69-aab7-1784eb4dcd17',
  12, 7, 456.00, 38.00, true, true,
  CURRENT_DATE - INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '10 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'grace.allen@test.com';

-- USER 12: Henry Young - Basic 4 Days (full day)
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  'ea4387d4-b7e6-4ae4-83fe-ff00c56dbb9d',
  4, 2, 160.00, 40.00, true, true,
  CURRENT_DATE - INTERVAL '18 days',
  CURRENT_DATE + INTERVAL '12 days',
  CURRENT_DATE + INTERVAL '12 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'henry.young@test.com';

-- USER 13: Ella King - Standard Half Day 8 Half Days
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '56db33ed-8586-4513-98d1-5d9d4ca2e978',
  8, 4, 152.00, 19.00, true, true,
  CURRENT_DATE - INTERVAL '25 days',
  CURRENT_DATE + INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '5 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'ella.king@test.com';

-- USER 14: Sebastian Wright - Premium 16 Days (full day)
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '13c63bff-4f52-4449-bff3-d1c82e24f4dd',
  16, 12, 576.00, 36.00, true, true,
  CURRENT_DATE - INTERVAL '28 days',
  CURRENT_DATE + INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '2 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'sebastian.wright@test.com';

-- USER 15: Scarlett Lopez - Ultimate Half Day 20 Half Days
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '812ad24b-8fb3-41b7-8d5c-91551732ca23',
  20, 15, 360.00, 18.00, true, true,
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '20 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'scarlett.lopez@test.com';

-- USER 16: Jack Hill - Basic Half Day 4 Half Days
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  'fcf91013-ffcd-4f00-ae51-08ad458b5fdd',
  4, 3, 80.00, 20.00, true, true,
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '25 days',
  CURRENT_DATE + INTERVAL '25 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'jack.hill@test.com';

-- USER 17: Isabella Thompson - Standard 8 Days (full day)
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  'f772fa6b-26ac-4ace-a4be-fdd0a3cce4c5',
  8, 6, 304.00, 38.00, true, true,
  CURRENT_DATE - INTERVAL '14 days',
  CURRENT_DATE + INTERVAL '16 days',
  CURRENT_DATE + INTERVAL '16 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'isabella.thompson@test.com';

-- USER 18: Noah Anderson - Plus 12 Days (full day)
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '46a2e332-1ff2-4f69-aab7-1784eb4dcd17',
  12, 9, 456.00, 38.00, true, true,
  CURRENT_DATE - INTERVAL '16 days',
  CURRENT_DATE + INTERVAL '14 days',
  CURRENT_DATE + INTERVAL '14 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'noah.anderson@test.com';

-- USER 19: Ava Robinson - Plus Half Day 12 Half Days
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '2c521838-f7a8-415f-a6a7-26bb89e3311a',
  12, 10, 228.00, 19.00, true, true,
  CURRENT_DATE - INTERVAL '11 days',
  CURRENT_DATE + INTERVAL '19 days',
  CURRENT_DATE + INTERVAL '19 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'ava.robinson@test.com';

-- USER 20: William Harris - Ultimate 20 Days (full day)
INSERT INTO subscriptions (user_id, tier_id, days_included, days_remaining, monthly_price, price_per_day, is_active, auto_renew, start_date, end_date, next_billing_date, stripe_subscription_id, payment_status)
SELECT
  p.id,
  '9f832592-fc2d-4596-832c-85320f50cef5',
  20, 16, 720.00, 36.00, true, true,
  CURRENT_DATE - INTERVAL '9 days',
  CURRENT_DATE + INTERVAL '21 days',
  CURRENT_DATE + INTERVAL '21 days',
  'sub_test_' || substr(md5(random()::text), 1, 16),
  'paid'
FROM profiles p WHERE p.email = 'william.harris@test.com';

-- Verify all subscriptions were inserted
SELECT
  p.email,
  p.first_name,
  st.name as tier_name,
  s.days_included,
  s.days_remaining,
  s.monthly_price,
  s.is_active,
  s.payment_status
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
JOIN subscription_tiers st ON s.tier_id = st.id
WHERE p.email LIKE '%@test.com'
ORDER BY p.email;
