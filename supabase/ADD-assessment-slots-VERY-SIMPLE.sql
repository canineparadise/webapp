-- ============================================
-- VERY SIMPLE ASSESSMENT SLOTS CREATION
-- ============================================
-- Creates assessment slots for the next 4 Fridays

-- First, let's see what's already there
SELECT 'Current slots:' as info;
SELECT * FROM assessment_slots ORDER BY assessment_date, start_time;

-- Clear all future slots to start fresh
DELETE FROM assessment_slots WHERE assessment_date >= CURRENT_DATE;

-- Insert Friday slots for next 4 weeks
-- Slot 1: This Friday or next Friday at 10:00-12:00
INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
VALUES
  (CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7), '10:00:00', '12:00:00', true, 0),
  (CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7), '14:00:00', '16:00:00', true, 0);

-- Slot 2: Next week Friday
INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
VALUES
  (CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 7, '10:00:00', '12:00:00', true, 0),
  (CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 7, '14:00:00', '16:00:00', true, 0);

-- Slot 3: 2 weeks from now Friday
INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
VALUES
  (CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 14, '10:00:00', '12:00:00', true, 0),
  (CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 14, '14:00:00', '16:00:00', true, 0);

-- Slot 4: 3 weeks from now Friday
INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
VALUES
  (CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 21, '10:00:00', '12:00:00', true, 0),
  (CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 21, '14:00:00', '16:00:00', true, 0);

-- Show all created slots
SELECT
  'Created slots:' as info;

SELECT
  id,
  assessment_date,
  TO_CHAR(assessment_date, 'Day, DD Mon YYYY') as formatted_date,
  start_time,
  end_time,
  booked_count,
  is_available
FROM assessment_slots
WHERE assessment_date >= CURRENT_DATE
ORDER BY assessment_date, start_time;
