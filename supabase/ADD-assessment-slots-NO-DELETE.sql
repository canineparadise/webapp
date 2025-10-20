-- ============================================
-- ADD ASSESSMENT SLOTS (Keep existing ones)
-- ============================================
-- Creates assessment slots for the next 4 Fridays WITHOUT deleting existing ones

-- First, let's see what's already there
SELECT 'Current slots:' as info;
SELECT
  id,
  assessment_date,
  TO_CHAR(assessment_date, 'Day, DD Mon YYYY') as formatted_date,
  start_time,
  end_time,
  booked_count,
  is_available
FROM assessment_slots
ORDER BY assessment_date, start_time;

-- Insert Friday slots for next 4 weeks
-- These will only add if they don't already exist

-- Calculate the next 4 Fridays and insert slots
-- Slot 1: This Friday or next Friday at 10:00-12:00 and 14:00-16:00
INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
SELECT
  CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) as slot_date,
  '10:00:00'::time as start_time,
  '12:00:00'::time as end_time,
  true as is_available,
  0 as booked_count
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_slots
  WHERE assessment_date = CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)
  AND start_time = '10:00:00'
);

INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
SELECT
  CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7),
  '14:00:00'::time,
  '16:00:00'::time,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_slots
  WHERE assessment_date = CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)
  AND start_time = '14:00:00'
);

-- Slot 2: Next week Friday
INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
SELECT
  CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 7,
  '10:00:00'::time,
  '12:00:00'::time,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_slots
  WHERE assessment_date = CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 7
  AND start_time = '10:00:00'
);

INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
SELECT
  CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 7,
  '14:00:00'::time,
  '16:00:00'::time,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_slots
  WHERE assessment_date = CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 7
  AND start_time = '14:00:00'
);

-- Slot 3: 2 weeks from now Friday
INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
SELECT
  CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 14,
  '10:00:00'::time,
  '12:00:00'::time,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_slots
  WHERE assessment_date = CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 14
  AND start_time = '10:00:00'
);

INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
SELECT
  CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 14,
  '14:00:00'::time,
  '16:00:00'::time,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_slots
  WHERE assessment_date = CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 14
  AND start_time = '14:00:00'
);

-- Slot 4: 3 weeks from now Friday
INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
SELECT
  CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 21,
  '10:00:00'::time,
  '12:00:00'::time,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_slots
  WHERE assessment_date = CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 21
  AND start_time = '10:00:00'
);

INSERT INTO assessment_slots (assessment_date, start_time, end_time, is_available, booked_count)
SELECT
  CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 21,
  '14:00:00'::time,
  '16:00:00'::time,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_slots
  WHERE assessment_date = CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7) + 21
  AND start_time = '14:00:00'
);

-- Show all created slots (future slots)
SELECT 'All available slots:' as info;

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
