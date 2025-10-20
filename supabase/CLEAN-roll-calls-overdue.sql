-- Delete any roll calls with 'overdue' status
-- These were created when we had time window restrictions
DELETE FROM roll_calls WHERE status = 'overdue';

-- Delete all roll calls for today to start fresh
DELETE FROM roll_calls WHERE date = CURRENT_DATE;

-- Verify deletion
SELECT * FROM roll_calls WHERE date = CURRENT_DATE;
