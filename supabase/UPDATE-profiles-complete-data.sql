-- UPDATE all 20 test user profiles with complete data
-- 5 users remain pending, 15 users are approved

-- USER 1: Emma Wilson - PENDING
UPDATE profiles SET
  first_name = 'Emma',
  last_name = 'Wilson',
  phone = '07700900111',
  address = '12 Oak Street',
  city = 'Manchester',
  postcode = 'M1 2AB',
  emergency_contact_name = 'Tom Wilson',
  emergency_contact_phone = '07700900112',
  approval_status = 'pending'
WHERE email = 'emma.wilson@test.com';

-- USER 2: James Brown - PENDING
UPDATE profiles SET
  first_name = 'James',
  last_name = 'Brown',
  phone = '07700900113',
  address = '45 Park Lane',
  city = 'London',
  postcode = 'SW1A 1AA',
  emergency_contact_name = 'Sarah Brown',
  emergency_contact_phone = '07700900114',
  approval_status = 'pending'
WHERE email = 'james.brown@test.com';

-- USER 3: Sophie Taylor - PENDING
UPDATE profiles SET
  first_name = 'Sophie',
  last_name = 'Taylor',
  phone = '07700900115',
  address = '78 High Street',
  city = 'Birmingham',
  postcode = 'B1 1AA',
  emergency_contact_name = 'Jack Taylor',
  emergency_contact_phone = '07700900116',
  approval_status = 'pending'
WHERE email = 'sophie.taylor@test.com';

-- USER 4: Oliver Davis - PENDING
UPDATE profiles SET
  first_name = 'Oliver',
  last_name = 'Davis',
  phone = '07700900117',
  address = '23 Church Road',
  city = 'Leeds',
  postcode = 'LS1 1AA',
  emergency_contact_name = 'Emma Davis',
  emergency_contact_phone = '07700900118',
  approval_status = 'pending'
WHERE email = 'oliver.davis@test.com';

-- USER 5: Amelia Martinez - PENDING
UPDATE profiles SET
  first_name = 'Amelia',
  last_name = 'Martinez',
  phone = '07700900119',
  address = '56 Bridge Street',
  city = 'Bristol',
  postcode = 'BS1 1AA',
  emergency_contact_name = 'Carlos Martinez',
  emergency_contact_phone = '07700900120',
  approval_status = 'pending'
WHERE email = 'amelia.martinez@test.com';

-- USER 6: Liam Evans - APPROVED
UPDATE profiles SET
  first_name = 'Liam',
  last_name = 'Evans',
  phone = '07700900121',
  address = '89 Queen Street',
  city = 'Bristol',
  postcode = 'BS2 8HG',
  emergency_contact_name = 'Olivia Evans',
  emergency_contact_phone = '07700900122',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '15 days'
WHERE email = 'liam.evans@test.com';

-- USER 7: Charlotte Moore - APPROVED
UPDATE profiles SET
  first_name = 'Charlotte',
  last_name = 'Moore',
  phone = '07700900123',
  address = '34 King Street',
  city = 'Edinburgh',
  postcode = 'EH1 2AB',
  emergency_contact_name = 'George Moore',
  emergency_contact_phone = '07700900124',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '20 days'
WHERE email = 'charlotte.moore@test.com';

-- USER 8: Ethan Jackson - APPROVED
UPDATE profiles SET
  first_name = 'Ethan',
  last_name = 'Jackson',
  phone = '07700900125',
  address = '67 Victoria Road',
  city = 'Glasgow',
  postcode = 'G1 3AB',
  emergency_contact_name = 'Sophie Jackson',
  emergency_contact_phone = '07700900126',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '18 days'
WHERE email = 'ethan.jackson@test.com';

-- USER 9: Mia White - APPROVED
UPDATE profiles SET
  first_name = 'Mia',
  last_name = 'White',
  phone = '07700900127',
  address = '91 Castle Street',
  city = 'Liverpool',
  postcode = 'L1 1AA',
  emergency_contact_name = 'James White',
  emergency_contact_phone = '07700900128',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '25 days'
WHERE email = 'mia.white@test.com';

-- USER 10: Lucas Hall - APPROVED
UPDATE profiles SET
  first_name = 'Lucas',
  last_name = 'Hall',
  phone = '07700900129',
  address = '12 Market Street',
  city = 'Newcastle',
  postcode = 'NE1 1AA',
  emergency_contact_name = 'Emily Hall',
  emergency_contact_phone = '07700900130',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '22 days'
WHERE email = 'lucas.hall@test.com';

-- USER 11: Grace Allen - APPROVED
UPDATE profiles SET
  first_name = 'Grace',
  last_name = 'Allen',
  phone = '07700900131',
  address = '45 Station Road',
  city = 'Sheffield',
  postcode = 'S1 1AA',
  emergency_contact_name = 'Daniel Allen',
  emergency_contact_phone = '07700900132',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '30 days'
WHERE email = 'grace.allen@test.com';

-- USER 12: Henry Young - APPROVED
UPDATE profiles SET
  first_name = 'Henry',
  last_name = 'Young',
  phone = '07700900133',
  address = '78 Mill Lane',
  city = 'Nottingham',
  postcode = 'NG1 1AA',
  emergency_contact_name = 'Charlotte Young',
  emergency_contact_phone = '07700900134',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '28 days'
WHERE email = 'henry.young@test.com';

-- USER 13: Ella King - APPROVED
UPDATE profiles SET
  first_name = 'Ella',
  last_name = 'King',
  phone = '07700900135',
  address = '23 Abbey Road',
  city = 'Cambridge',
  postcode = 'CB1 1AA',
  emergency_contact_name = 'Oliver King',
  emergency_contact_phone = '07700900136',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '35 days'
WHERE email = 'ella.king@test.com';

-- USER 14: Sebastian Wright - APPROVED
UPDATE profiles SET
  first_name = 'Sebastian',
  last_name = 'Wright',
  phone = '07700900137',
  address = '56 Green Lane',
  city = 'Oxford',
  postcode = 'OX1 1AA',
  emergency_contact_name = 'Amelia Wright',
  emergency_contact_phone = '07700900138',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '40 days'
WHERE email = 'sebastian.wright@test.com';

-- USER 15: Scarlett Lopez - APPROVED
UPDATE profiles SET
  first_name = 'Scarlett',
  last_name = 'Lopez',
  phone = '07700900139',
  address = '89 Church Lane',
  city = 'Brighton',
  postcode = 'BN1 1AA',
  emergency_contact_name = 'Lucas Lopez',
  emergency_contact_phone = '07700900140',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '32 days'
WHERE email = 'scarlett.lopez@test.com';

-- USER 16: Jack Hill - APPROVED
UPDATE profiles SET
  first_name = 'Jack',
  last_name = 'Hill',
  phone = '07700900141',
  address = '12 Park Avenue',
  city = 'Cardiff',
  postcode = 'CF10 1AA',
  emergency_contact_name = 'Grace Hill',
  emergency_contact_phone = '07700900142',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '27 days'
WHERE email = 'jack.hill@test.com';

-- USER 17: Isabella Thompson - APPROVED
UPDATE profiles SET
  first_name = 'Isabella',
  last_name = 'Thompson',
  phone = '07700900143',
  address = '45 River Road',
  city = 'Southampton',
  postcode = 'SO14 1AA',
  emergency_contact_name = 'Ethan Thompson',
  emergency_contact_phone = '07700900144',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '23 days'
WHERE email = 'isabella.thompson@test.com';

-- USER 18: Noah Anderson - APPROVED
UPDATE profiles SET
  first_name = 'Noah',
  last_name = 'Anderson',
  phone = '07700900145',
  address = '78 Hill Street',
  city = 'Plymouth',
  postcode = 'PL1 1AA',
  emergency_contact_name = 'Mia Anderson',
  emergency_contact_phone = '07700900146',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '26 days'
WHERE email = 'noah.anderson@test.com';

-- USER 19: Ava Robinson - APPROVED
UPDATE profiles SET
  first_name = 'Ava',
  last_name = 'Robinson',
  phone = '07700900147',
  address = '23 Valley Road',
  city = 'Leicester',
  postcode = 'LE1 1AA',
  emergency_contact_name = 'Noah Robinson',
  emergency_contact_phone = '07700900148',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '29 days'
WHERE email = 'ava.robinson@test.com';

-- USER 20: William Harris - APPROVED
UPDATE profiles SET
  first_name = 'William',
  last_name = 'Harris',
  phone = '07700900149',
  address = '56 Forest Drive',
  city = 'York',
  postcode = 'YO1 1AA',
  emergency_contact_name = 'Isabella Harris',
  emergency_contact_phone = '07700900150',
  approval_status = 'approved',
  approved_at = NOW() - INTERVAL '24 days'
WHERE email = 'william.harris@test.com';

-- Verify the updates
SELECT
  email,
  first_name,
  last_name,
  city,
  approval_status
FROM profiles
WHERE email LIKE '%@test.com'
ORDER BY email;
