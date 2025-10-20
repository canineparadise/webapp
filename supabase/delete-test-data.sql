-- DELETE ALL TEST DATA
-- WARNING: This will delete all test users and their associated data
-- Only run this if you want to start fresh with test data

DO $$
DECLARE
  test_user_ids UUID[];
BEGIN
  RAISE NOTICE 'Starting deletion of test data...';

  -- Get all test user IDs
  SELECT ARRAY_AGG(id) INTO test_user_ids
  FROM auth.users
  WHERE email IN (
    'emma.wilson@test.com',
    'james.brown@test.com',
    'sophie.taylor@test.com',
    'oliver.davis@test.com',
    'amelia.martinez@test.com',
    'liam.evans@test.com',
    'charlotte.moore@test.com',
    'ethan.jackson@test.com',
    'mia.white@test.com',
    'lucas.hall@test.com',
    'grace.allen@test.com',
    'henry.young@test.com',
    'ella.king@test.com',
    'sebastian.wright@test.com',
    'scarlett.lopez@test.com',
    'jack.hill@test.com',
    'isabella.thompson@test.com',
    'noah.anderson@test.com',
    'ava.robinson@test.com',
    'william.harris@test.com'
  );

  RAISE NOTICE 'Found % test users to delete', ARRAY_LENGTH(test_user_ids, 1);

  -- Delete in reverse order of dependencies

  -- Delete subscriptions
  DELETE FROM subscriptions WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Deleted subscriptions';

  -- Delete bookings
  DELETE FROM bookings WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Deleted bookings';

  -- Delete legal agreements
  DELETE FROM legal_agreements WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Deleted legal agreements';

  -- Delete documents (for dogs owned by test users)
  DELETE FROM documents WHERE dog_id IN (
    SELECT id FROM dogs WHERE owner_id = ANY(test_user_ids)
  );
  RAISE NOTICE 'Deleted documents';

  -- Delete assessment schedules
  DELETE FROM assessment_schedule WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Deleted assessment schedules';

  -- Delete dogs
  DELETE FROM dogs WHERE owner_id = ANY(test_user_ids);
  RAISE NOTICE 'Deleted dogs';

  -- Delete profiles
  DELETE FROM profiles WHERE id = ANY(test_user_ids);
  RAISE NOTICE 'Deleted profiles';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Successfully deleted all test data!';
  RAISE NOTICE 'You can now run the populate script again.';
  RAISE NOTICE '========================================';

END $$;
