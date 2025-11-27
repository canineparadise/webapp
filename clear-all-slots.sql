-- DANGER: This will DELETE ALL assessment slots from the database
-- Use this ONLY if you want to start fresh

-- First, check what will be deleted
SELECT
    id,
    assessment_date,
    start_time,
    end_time,
    booked_by_user_id
FROM assessment_slots
ORDER BY assessment_date, start_time;

-- Uncomment the line below to actually delete all slots
-- DELETE FROM assessment_slots;

-- After deletion, verify it's empty
-- SELECT COUNT(*) as remaining_slots FROM assessment_slots;
