-- ============================================
-- DELETE ALL ASSESSMENT SLOTS - SAFE VERSION
-- ============================================
-- This handles foreign key constraints properly

-- First, show what will be deleted
SELECT 'Slots to be deleted:' as info;
SELECT COUNT(*) as total_slots FROM assessment_slots;

-- Step 1: Remove assessment_slot_id from dogs table
UPDATE dogs SET assessment_slot_id = NULL WHERE assessment_slot_id IS NOT NULL;

-- Step 2: Delete all assessment bookings
DELETE FROM assessment_bookings;

-- Step 3: Delete all assessment slots
DELETE FROM assessment_slots;

-- Verify deletion
SELECT 'Remaining slots:' as info;
SELECT COUNT(*) as remaining_slots FROM assessment_slots;

SELECT 'Remaining bookings:' as info;
SELECT COUNT(*) as remaining_bookings FROM assessment_bookings;

SELECT 'Dogs cleared:' as info;
SELECT COUNT(*) as dogs_with_null_slot FROM dogs WHERE assessment_slot_id IS NULL;

-- Show message
SELECT 'All slots deleted successfully. Admin can now create slots through the admin portal.' as message;
