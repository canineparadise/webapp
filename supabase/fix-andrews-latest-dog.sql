-- Quick fix to approve Andrew's latest pending dog
UPDATE dogs
SET
  is_approved = TRUE,
  is_draft = FALSE
WHERE owner_id IN (
  SELECT id FROM profiles WHERE email = 'andrew_carrick@yahoo.co.uk'
)
AND is_approved = FALSE
AND created_at >= NOW() - INTERVAL '1 hour';

-- Verify
SELECT
  name,
  is_approved,
  is_draft,
  created_at
FROM dogs d
INNER JOIN profiles p ON d.owner_id = p.id
WHERE p.email = 'andrew_carrick@yahoo.co.uk'
ORDER BY d.created_at DESC
LIMIT 5;
