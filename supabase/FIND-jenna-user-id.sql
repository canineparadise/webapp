-- Find Jenna's actual user ID
SELECT 'SEARCHING FOR JENNA IN PROFILES:' AS info;
SELECT id, email, first_name, last_name, role
FROM profiles
WHERE email = 'jennadebeer1989@icloud.com';

-- Also check auth.users
SELECT 'SEARCHING FOR JENNA IN AUTH.USERS:' AS info;
SELECT id, email, created_at
FROM auth.users
WHERE email = 'jennadebeer1989@icloud.com';

-- Find the dog owner ID
SELECT 'DOG OWNER INFO:' AS info;
SELECT
  d.id as dog_id,
  d.name as dog_name,
  d.owner_id,
  p.email as owner_email,
  p.first_name,
  p.last_name
FROM dogs d
JOIN profiles p ON p.id = d.owner_id
WHERE d.id = 'd6c76daa-09bd-4b15-9972-966441f647b6';
