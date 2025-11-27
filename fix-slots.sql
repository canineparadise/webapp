-- Check current state of all slots
SELECT
    id,
    assessment_date,
    start_time,
    end_time,
    is_available,
    booked_by_user_id,
    max_dogs,
    booked_count,
    created_at
FROM assessment_slots
ORDER BY assessment_date, start_time;

-- Fix any slots that should be available but aren't
-- This makes all future slots available if they have no booking
UPDATE assessment_slots
SET
    is_available = TRUE,
    booked_by_user_id = NULL
WHERE
    assessment_date >= CURRENT_DATE
    AND booked_by_user_id IS NULL;

-- Show the fixed slots
SELECT
    assessment_date,
    start_time,
    end_time,
    is_available,
    booked_by_user_id
FROM assessment_slots
WHERE assessment_date >= CURRENT_DATE
ORDER BY assessment_date, start_time;
