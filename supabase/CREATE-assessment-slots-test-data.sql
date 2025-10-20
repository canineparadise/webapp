-- Create assessment slots for the next 4 weeks
-- 3 time slots per day, 1 user per slot
-- max_dogs = 1 (only ONE user/booking per time slot)

-- DELETE ALL EXISTING SLOTS FIRST - Run this first!
-- DELETE FROM assessment_slots;

-- Then insert new slots:
INSERT INTO assessment_slots (assessment_date, start_time, end_time, max_dogs, booked_count, is_available, created_at)
VALUES
-- Week 1: Monday Oct 20
('2025-10-20', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-10-20', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-10-20', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 1: Wednesday Oct 22
('2025-10-22', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-10-22', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-10-22', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 1: Friday Oct 24
('2025-10-24', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-10-24', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-10-24', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 2: Monday Oct 27
('2025-10-27', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-10-27', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-10-27', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 2: Wednesday Oct 29
('2025-10-29', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-10-29', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-10-29', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 2: Friday Oct 31
('2025-10-31', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-10-31', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-10-31', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 3: Monday Nov 3
('2025-11-03', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-11-03', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-11-03', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 3: Wednesday Nov 5
('2025-11-05', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-11-05', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-11-05', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 3: Friday Nov 7
('2025-11-07', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-11-07', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-11-07', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 4: Monday Nov 10
('2025-11-10', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-11-10', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-11-10', '16:30:00', '19:00:00', 1, 0, true, NOW()),

-- Week 4: Wednesday Nov 12
('2025-11-12', '09:00:00', '12:00:00', 1, 0, true, NOW()),
('2025-11-12', '13:00:00', '16:00:00', 1, 0, true, NOW()),
('2025-11-12', '16:30:00', '19:00:00', 1, 0, true, NOW());

-- Total: 11 days × 3 slots = 33 assessment slots
-- Each day has exactly 3 time slots
-- Each slot allows 1 booking (1 user with up to 4 dogs)
