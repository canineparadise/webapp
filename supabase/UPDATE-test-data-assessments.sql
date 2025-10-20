-- Add assessment dates to test dogs for demonstration

-- Set some dogs with assessments scheduled for various dates in October 2025
UPDATE dogs SET assessment_date = '2025-10-07', assessment_completed = false WHERE id IN (
  SELECT id FROM dogs WHERE assessment_completed = false LIMIT 2
);

UPDATE dogs SET assessment_date = '2025-10-08', assessment_completed = false WHERE id IN (
  SELECT id FROM dogs WHERE assessment_completed = false OFFSET 2 LIMIT 2
);

UPDATE dogs SET assessment_date = '2025-10-09', assessment_completed = false WHERE id IN (
  SELECT id FROM dogs WHERE assessment_completed = false OFFSET 4 LIMIT 2
);

UPDATE dogs SET assessment_date = '2025-10-14', assessment_completed = false WHERE id IN (
  SELECT id FROM dogs WHERE assessment_completed = false OFFSET 6 LIMIT 2
);

UPDATE dogs SET assessment_date = '2025-10-21', assessment_completed = false WHERE id IN (
  SELECT id FROM dogs WHERE assessment_completed = false OFFSET 8 LIMIT 2
);

-- Set some dogs as assessment completed but awaiting approval (they had their assessment yesterday or earlier)
UPDATE dogs SET
  assessment_date = '2025-10-06',
  assessment_completed = true,
  is_approved = false
WHERE id IN (
  SELECT id FROM dogs WHERE is_approved = false LIMIT 3
);

-- Verify the updates
SELECT
  name,
  assessment_date,
  assessment_completed,
  is_approved,
  owner_id
FROM dogs
WHERE assessment_date IS NOT NULL OR (assessment_completed = true AND is_approved = false)
ORDER BY assessment_date;
