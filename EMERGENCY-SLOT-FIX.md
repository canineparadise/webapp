# EMERGENCY SLOT FIX - READ THIS NOW

## THE PROBLEM

You are trying to create slots but they're not showing correctly. Here's what's happening:

### Issue 1: Recurring Templates vs Manual Slots
- **RECURRING TEMPLATES** = Auto-generate slots based on day of week (e.g., "Every Friday")
- **MANUAL SLOTS** = Create ONE specific slot for ONE specific date

**YOU MUST USE THE GREEN "ADD MANUAL SLOT" BUTTON!**

### Issue 2: Why slots aren't showing for today (Nov 27)
The system might have timezone issues OR you created a recurring template for "Thursday" which would generate slots for NEXT Thursday, not today.

### Issue 3: Why only showing one slot per day
If you're using recurring templates, it will only create ONE slot per day of week. For multiple slots on the same day, you MUST use "Add Manual Slot" TWICE.

## IMMEDIATE FIX - DO THIS NOW

### Step 1: Clear everything in Supabase SQL Editor
```sql
DELETE FROM assessment_slots;
DELETE FROM assessment_recurring_slots;
```

### Step 2: Go to admin dashboard → Assessment Slots

### Step 3: Create slots for TODAY (Nov 27) using MANUAL SLOT CREATION

1. Click the **GREEN "Add Manual Slot"** button
2. Select date: **2025-11-27**
3. Start time: **10:00**
4. End time: **12:00**
5. Click "Create Slot"

### Step 4: Create TWO slots for Thursday (Nov 28)

**First slot:**
1. Click **GREEN "Add Manual Slot"** button
2. Select date: **2025-11-28**
3. Start time: **10:00**
4. End time: **12:00**
5. Click "Create Slot"

**Second slot:**
1. Click **GREEN "Add Manual Slot"** button AGAIN
2. Select date: **2025-11-28**
3. Start time: **14:00**
4. End time: **16:00**
5. Click "Create Slot"

### Step 5: For recurring weekly slots (OPTIONAL)

Only do this AFTER you've created today's manual slots:

1. Click "Add Recurring Template" (gold button)
2. Select day: **Friday**
3. Start time: **10:00**
4. End time: **12:00**
5. Click "Create Template"
6. Click "Regenerate Slots" (blue button)

This will create Friday slots for the next 52 weeks (1 year).

## Why it's only showing 3 weeks

The recurring template system generates slots, but it might be skipping dates that already have slots. Or you created a template recently and need to click "Regenerate Slots" to extend it to 52 weeks.

## IMPORTANT

- **MANUAL SLOTS** = For specific dates (today, tomorrow, next week)
- **RECURRING TEMPLATES** = For weekly repeating slots (every Friday for a year)

You can use BOTH systems together!
