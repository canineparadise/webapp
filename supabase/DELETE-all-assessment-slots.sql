-- ============================================
-- DELETE ALL ASSESSMENT SLOTS
-- ============================================
-- This will remove all assessment slots so admin can create them fresh

-- First, show what will be deleted
SELECT 'Slots to be deleted:' as info;
SELECT COUNT(*) as total_slots FROM assessment_slots;

-- Delete all assessment bookings first (to avoid foreign key issues)
DELETE FROM assessment_bookings;

-- Delete all assessment slots
DELETE FROM assessment_slots;

-- Verify deletion
SELECT 'Remaining slots:' as info;
SELECT COUNT(*) as remaining_slots FROM assessment_slots;

SELECT 'Remaining bookings:' as info;
SELECT COUNT(*) as remaining_bookings FROM assessment_bookings;

-- Show message
SELECT 'All slots deleted successfully. Admin can now create slots through the admin portal.' as message;
