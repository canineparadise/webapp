# Assessment System Fix - IMPORTANT

## What Was Fixed

### 1. Assessment Slot Booking System
**OLD SYSTEM (WRONG)**:
- Used `max_dogs` and `booked_count` fields
- Showed "6 spots available"
- Multiple clients could share one slot

**NEW SYSTEM (CORRECT)**:
- One client books ONE time slot for ALL their dogs
- Uses `booked_by_user_id` to track who booked the slot
- Shows "Available" instead of spot counts
- When a slot is booked, `booked_by_user_id` is set and slot disappears from calendar

### 2. How It Works Now
1. **Admin creates slots** in `/staff/admin-dashboard/assessment-slots`
   - Can create slots on ANY day of the week
   - Can create multiple slots per day
   - Each slot = 1 client only

2. **Client books slot** at `/dashboard/assessment/schedule`
   - Sees full calendar view with available slots
   - Selects ALL dogs they want assessed
   - Books ONE time slot for ALL selected dogs
   - Pays assessment fee per dog (e.g., 3 dogs = £120 if fee is £40/dog)
   - Once booked, slot is marked with their `user_id` and disappears from other clients' view

3. **Real-time updates**
   - When admin adds/removes slots, calendar updates instantly
   - When client books, slot disappears instantly for all other clients

## Existing Customers - Manual Setup Required

### Run This SQL in Supabase SQL Editor:

```sql
-- Add assessment_completed field to dogs table
ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS assessment_completed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN dogs.assessment_completed IS 'TRUE if dog has completed assessment (for existing customers). FALSE if dog needs assessment.';
```

### How to Handle Existing Customers

**Option 1: Mark all existing dogs as assessed (Recommended for launch)**
```sql
-- Mark all dogs created before launch date as already assessed
UPDATE dogs
SET assessment_completed = TRUE
WHERE created_at < '2025-12-01';  -- Adjust date to your launch date
```

**Option 2: Manually mark specific customers**
```sql
-- Find a specific customer's dogs
SELECT id, name, owner_id FROM dogs WHERE owner_id = 'user_uuid_here';

-- Mark those dogs as assessed
UPDATE dogs
SET assessment_completed = TRUE
WHERE owner_id = 'user_uuid_here';
```

**Option 3: Mark individual dogs**
```sql
-- Mark specific dog as assessed
UPDATE dogs
SET assessment_completed = TRUE
WHERE id = 'dog_uuid_here';
```

### Add Admin UI for Marking Dogs as Assessed (Future Enhancement)

In the admin dashboard dog management, add a button:
- "Mark as Assessed" button on each dog
- Updates `assessment_completed = TRUE`
- Useful for:
  - Existing customers moving to new system
  - Dogs that completed assessment offline
  - Manual overrides

## Files Changed

1. `/app/dashboard/assessment/schedule/page.tsx`
   - Fixed `fetchAvailableSlots()` to check `booked_by_user_id` instead of `max_dogs`
   - Updated calendar display to show "Available" instead of "6 spots"
   - Already had correct booking validation logic

## Testing Checklist

- [ ] Admin creates slot on Wednesday 10:00-12:00
- [ ] Client sees it in calendar marked green with "10:00 - Available"
- [ ] Admin creates another slot Wednesday 14:00-16:00
- [ ] Client sees both slots on Wednesday
- [ ] Client selects 2 dogs and books 10:00 slot
- [ ] Slot disappears from calendar immediately
- [ ] 14:00 slot still visible
- [ ] Other clients cannot see 10:00 slot
- [ ] Admin adds Thursday slot
- [ ] Client calendar updates automatically without refresh

## Current Issue (Before Deploy)

The Wednesday and Thursday slots you created are still using the old `max_dogs` system. To fix:

1. **Delete all existing slots** in admin dashboard
2. **Recreate them** using the recurring template system
3. New slots will use the `booked_by_user_id` system correctly

OR run this SQL to clear old slots:
```sql
DELETE FROM assessment_slots WHERE created_at < NOW();
```

Then recreate slots in admin panel.
