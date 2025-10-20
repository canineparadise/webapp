-- Delete ALL roll calls to start completely fresh
DELETE FROM roll_calls;

-- Verify they're all gone
SELECT COUNT(*) as total_roll_calls FROM roll_calls;
