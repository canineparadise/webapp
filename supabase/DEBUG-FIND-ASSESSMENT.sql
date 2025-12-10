-- ============================================
-- FIND THE DECEMBER 19TH ASSESSMENT
-- ============================================

-- Check assessment_schedule table (old system)
SELECT * FROM assessment_schedule
ORDER BY created_at DESC
LIMIT 10;

-- Check all assessment_slots for December
SELECT * FROM assessment_slots
WHERE assessment_date >= '2025-12-01'
ORDER BY assessment_date, start_time;

-- Check if any slot on 19th at 10am exists
SELECT * FROM assessment_slots
WHERE assessment_date = '2025-12-19'
AND start_time = '10:00:00';

-- Check most recent Stripe payment sessions/transactions
SELECT * FROM financial_transactions
WHERE transaction_type = 'assessment'
ORDER BY created_at DESC
LIMIT 5;

-- Check dogs table for any recent assessment_date updates
SELECT id, name, owner_id, assessment_date, assessment_slot_id, created_at, updated_at
FROM dogs
WHERE assessment_date IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;
