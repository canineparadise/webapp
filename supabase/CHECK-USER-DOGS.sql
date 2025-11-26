-- Check which user owns Max and other approved dogs
SELECT
  d.id as dog_id,
  d.name as dog_name,
  d.owner_id,
  d.is_draft,
  d.is_approved,
  p.email as owner_email,
  p.first_name,
  p.last_name
FROM dogs d
LEFT JOIN profiles p ON p.id = d.owner_id
WHERE d.is_approved = true
ORDER BY d.created_at DESC;
