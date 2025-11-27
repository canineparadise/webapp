-- Check ALL slots in the database (including past dates)
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

-- Count total slots
SELECT COUNT(*) as total_slots FROM assessment_slots;

-- Count slots by date
SELECT
    assessment_date,
    COUNT(*) as slot_count
FROM assessment_slots
GROUP BY assessment_date
ORDER BY assessment_date;
