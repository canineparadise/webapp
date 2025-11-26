-- Check all dogs and their approval status
SELECT
  id,
  name,
  owner_id,
  is_draft,
  is_approved,
  assessment_completed,
  approved_at
FROM dogs
WHERE is_draft = false
ORDER BY created_at DESC;
