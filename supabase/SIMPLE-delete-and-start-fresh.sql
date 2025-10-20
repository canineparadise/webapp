-- Delete the 20 test user profiles so we can start fresh
DELETE FROM profiles WHERE email LIKE '%@test.com';

-- That's it! Now you can run a corrected populate script
