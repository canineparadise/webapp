-- INSERT BOOKINGS for all approved dogs (23 dogs from users 6-20)
-- Bookings from today (Monday Oct 7) through Friday (Oct 11)
-- Mix of full-day and half-day sessions, various statuses

-- Get all approved dogs with their owner and subscription info
DO $$
DECLARE
  -- Days of the week
  day1 DATE := '2025-10-07'; -- Today (Tuesday)
  day2 DATE := '2025-10-08'; -- Wednesday
  day3 DATE := '2025-10-09'; -- Thursday
  day4 DATE := '2025-10-10'; -- Friday
  day5 DATE := '2025-10-11'; -- Saturday (bonus day)
BEGIN

-- USER 6: Liam Evans - Alfie (1 dog)
-- Full day bookings Tuesday-Friday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'liam.evans@test.com' AND d.name = 'Alfie';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'liam.evans@test.com' AND d.name = 'Alfie';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'liam.evans@test.com' AND d.name = 'Alfie';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day4, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'liam.evans@test.com' AND d.name = 'Alfie';

-- USER 7: Charlotte Moore - Ruby & Toby (2 dogs)
-- Full day bookings Tuesday, Thursday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:30', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'charlotte.moore@test.com' AND d.name = 'Ruby';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:30', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'charlotte.moore@test.com' AND d.name = 'Toby';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '08:30', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'charlotte.moore@test.com' AND d.name = 'Ruby';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '08:30', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'charlotte.moore@test.com' AND d.name = 'Toby';

-- USER 8: Ethan Jackson - Zeus (1 dog)
-- Half day morning sessions Tuesday-Friday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:00', '12:30', 'confirmed', 'half_day', '08:00', '12:30', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ethan.jackson@test.com' AND d.name = 'Zeus';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:00', '12:30', 'confirmed', 'half_day', '08:00', '12:30', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ethan.jackson@test.com' AND d.name = 'Zeus';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '08:00', '12:30', 'confirmed', 'half_day', '08:00', '12:30', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ethan.jackson@test.com' AND d.name = 'Zeus';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day4, '08:00', '12:30', 'confirmed', 'half_day', '08:00', '12:30', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ethan.jackson@test.com' AND d.name = 'Zeus';

-- USER 9: Mia White - Poppy, Molly, Archie (3 dogs)
-- Full day Tuesday, Wednesday, Friday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:15', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'mia.white@test.com' AND d.name = 'Poppy';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:15', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'mia.white@test.com' AND d.name = 'Molly';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:15', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'mia.white@test.com' AND d.name = 'Archie';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:15', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'mia.white@test.com' AND d.name = 'Poppy';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day4, '08:15', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'mia.white@test.com' AND d.name = 'Archie';

-- USER 10: Lucas Hall - Cooper (1 dog)
-- Half day afternoon Tuesday, Thursday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '12:30', '17:00', 'confirmed', 'half_day', '12:30', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'lucas.hall@test.com' AND d.name = 'Cooper';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '12:30', '17:00', 'confirmed', 'half_day', '12:30', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'lucas.hall@test.com' AND d.name = 'Cooper';

-- USER 11: Grace Allen - Rosie & Teddy (2 dogs)
-- Full day Wednesday, Friday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'grace.allen@test.com' AND d.name = 'Rosie';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'grace.allen@test.com' AND d.name = 'Teddy';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day4, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'grace.allen@test.com' AND d.name = 'Rosie';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day4, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'grace.allen@test.com' AND d.name = 'Teddy';

-- USER 12: Henry Young - Duke (1 dog)
-- Full day Tuesday, Friday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'henry.young@test.com' AND d.name = 'Duke';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day4, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'henry.young@test.com' AND d.name = 'Duke';

-- USER 13: Ella King - Finn & Penny (2 dogs)
-- Half day morning Tuesday-Thursday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:00', '12:30', 'confirmed', 'half_day', '08:00', '12:30', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ella.king@test.com' AND d.name = 'Finn';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:00', '12:30', 'confirmed', 'half_day', '08:00', '12:30', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ella.king@test.com' AND d.name = 'Penny';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '08:00', '12:30', 'confirmed', 'half_day', '08:00', '12:30', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ella.king@test.com' AND d.name = 'Finn';

-- USER 14: Sebastian Wright - Bear (1 dog)
-- Full day Tuesday-Thursday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'sebastian.wright@test.com' AND d.name = 'Bear';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'sebastian.wright@test.com' AND d.name = 'Bear';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'sebastian.wright@test.com' AND d.name = 'Bear';

-- USER 15: Scarlett Lopez - Jasper, Willow, Chester (3 dogs)
-- Half day afternoon Tuesday-Friday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '12:30', '17:00', 'confirmed', 'half_day', '12:30', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'scarlett.lopez@test.com' AND d.name = 'Jasper';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '12:30', '17:00', 'confirmed', 'half_day', '12:30', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'scarlett.lopez@test.com' AND d.name = 'Willow';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '12:30', '17:00', 'confirmed', 'half_day', '12:30', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'scarlett.lopez@test.com' AND d.name = 'Chester';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day4, '12:30', '17:00', 'confirmed', 'half_day', '12:30', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'scarlett.lopez@test.com' AND d.name = 'Jasper';

-- USER 16: Jack Hill - Barney (1 dog)
-- Half day morning Tuesday, Thursday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:00', '12:30', 'confirmed', 'half_day', '08:00', '12:30', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'jack.hill@test.com' AND d.name = 'Barney';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '08:00', '12:30', 'confirmed', 'half_day', '08:00', '12:30', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'jack.hill@test.com' AND d.name = 'Barney';

-- USER 17: Isabella Thompson - Coco & Sammy (2 dogs)
-- Full day Tuesday, Wednesday, Friday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'isabella.thompson@test.com' AND d.name = 'Coco';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'isabella.thompson@test.com' AND d.name = 'Sammy';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day4, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'isabella.thompson@test.com' AND d.name = 'Coco';

-- USER 18: Noah Anderson - Bruno & Bella (2 dogs)
-- Full day Wednesday, Thursday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'noah.anderson@test.com' AND d.name = 'Bruno';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'noah.anderson@test.com' AND d.name = 'Bella';

-- USER 19: Ava Robinson - Lola (1 dog)
-- Half day afternoon Tuesday-Thursday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '12:30', '17:00', 'confirmed', 'half_day', '12:30', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ava.robinson@test.com' AND d.name = 'Lola';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '12:30', '17:00', 'confirmed', 'half_day', '12:30', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ava.robinson@test.com' AND d.name = 'Lola';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '12:30', '17:00', 'confirmed', 'half_day', '12:30', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'ava.robinson@test.com' AND d.name = 'Lola';

-- USER 20: William Harris - Bailey & Ziggy (2 dogs)
-- Full day Tuesday-Friday
INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day1, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'william.harris@test.com' AND d.name = 'Bailey';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day2, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'william.harris@test.com' AND d.name = 'Ziggy';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day3, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'william.harris@test.com' AND d.name = 'Bailey';

INSERT INTO bookings (user_id, dog_id, subscription_id, booking_date, drop_off_time, pick_up_time, status, session_type, session_start_time, session_end_time, checked_in, checked_out)
SELECT p.id, d.id, s.id, day4, '08:00', '17:00', 'confirmed', 'full_day', '08:00', '17:00', false, false
FROM profiles p JOIN dogs d ON d.owner_id = p.id JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'william.harris@test.com' AND d.name = 'Ziggy';

RAISE NOTICE 'Successfully created bookings for all approved dogs!';

END $$;

-- Verify all bookings
SELECT
  b.booking_date,
  p.first_name || ' ' || p.last_name as owner_name,
  d.name as dog_name,
  b.session_type,
  b.drop_off_time,
  b.pick_up_time,
  b.status
FROM bookings b
JOIN profiles p ON b.user_id = p.id
JOIN dogs d ON b.dog_id = d.id
WHERE p.email LIKE '%@test.com'
ORDER BY b.booking_date, b.drop_off_time, p.last_name, d.name;
