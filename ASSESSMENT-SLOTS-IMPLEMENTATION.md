# Assessment Time Slots - Complete Implementation Guide

## Overview
This system allows admin to configure RECURRING weekly time slots (e.g., "Every Friday 9am-12pm") that users can book for assessments.

## Database Structure

### Tables:
1. **`assessment_recurring_slots`** - Admin-configured recurring weekly slots
   - `day_of_week` (0-6: Sunday-Saturday)
   - `start_time`, `end_time`
   - `is_active` (to soft-delete)

2. **`assessment_slots`** (EXISTING) - Generated specific date slots for booking
   - `assessment_date` (specific date like 2025-10-20)
   - `start_time`, `end_time`
   - `is_booked`, `max_capacity` (always 1)

3. **`assessment_bookings`** (EXISTING) - Actual user bookings
   - `slot_id` → references assessment_slots
   - `user_id`, `dog_id`
   - `booking_status`

## Setup Steps

### Step 1: Create the Recurring Slots Table
Run this SQL in Supabase:
```bash
/Users/jenna/Desktop/CanineParadiseWebapp/supabase/CREATE-assessment-recurring-time-slots.sql
```

### Step 2: Admin UI - Add/Delete Slots (NEEDS IMPLEMENTATION)
Location: `/app/staff/admin-dashboard/page.tsx` lines 4855-4862

**Current:** Uses `prompt()` - needs proper implementation
**Need to add:**
```typescript
const handleAddSlot = async (dayOfWeek: number) => {
  const { data, error } = await supabase
    .from('assessment_recurring_slots')
    .insert({
      day_of_week: dayOfWeek,
      start_time: startTime,  // from form
      end_time: endTime,      // from form
      is_active: true
    })

  if (!error) {
    // Refresh slots display
    fetchRecurringSlots()
  }
}
```

### Step 3: Load Slots on Page Load (NEEDS IMPLEMENTATION)
Admin dashboard needs to fetch and display actual slots:
```typescript
const [recurringSlots, setRecurringSlots] = useState([])

const fetchRecurringSlots = async () => {
  const { data } = await supabase
    .from('assessment_recurring_slots')
    .select('*')
    .eq('is_active', true)
    .order('day_of_week, start_time')

  setRecurringSlots(data || [])
}
```

### Step 4: Delete Slots (NEEDS IMPLEMENTATION)
```typescript
const handleDeleteSlot = async (slotId: string) => {
  await supabase
    .from('assessment_recurring_slots')
    .update({ is_active: false })
    .eq('id', slotId)

  fetchRecurringSlots()
}
```

### Step 5: Generate Bookable Slots for Users
Create a function that generates specific date slots from recurring slots:

```typescript
// Generate next 8 weeks of bookable slots from recurring template
const generateBookableSlots = async () => {
  const { data: recurringSlots } = await supabase
    .from('assessment_recurring_slots')
    .select('*')
    .eq('is_active', true)

  const today = new Date()
  const slotsToCreate = []

  // For each of next 8 weeks
  for (let week = 0; week < 8; week++) {
    for (const recurring of recurringSlots) {
      // Find the next occurrence of this day_of_week
      const nextDate = getNextDayOfWeek(today, recurring.day_of_week, week)

      slotsToCreate.push({
        assessment_date: nextDate,
        start_time: recurring.start_time,
        end_time: recurring.end_time,
        is_booked: false,
        max_capacity: 1
      })
    }
  }

  // Insert into assessment_slots (with conflict handling)
  await supabase.from('assessment_slots').upsert(slotsToCreate)
}
```

### Step 6: User Booking Flow
When user books assessment:
1. Fetch available `assessment_slots` WHERE `is_booked = false` AND `assessment_date >= today`
2. Display to user as options
3. On booking, create `assessment_bookings` record and mark slot as booked

## Current Status

✅ Fixed display to show "1 assessment per slot"
✅ Created database table SQL script
✅ UI layout with day-by-day structure
⚠️  Add Slot button - needs database connection
⚠️  Delete Slot button - needs database connection
⚠️  Load actual slots from database
⚠️  Generate bookable slots for users
⚠️  Connect user booking flow to these slots

## Next Steps (IN ORDER)

1. **Run the SQL script** to create `assessment_recurring_slots` table
2. **Update Admin UI** to load/display actual slots from database
3. **Connect Add/Delete buttons** to database operations
4. **Create slot generation function** (recurring → bookable)
5. **Update user booking flow** to use generated slots

## Files Created
- `/supabase/CREATE-assessment-recurring-time-slots.sql` - Database setup
- This guide - Implementation instructions
