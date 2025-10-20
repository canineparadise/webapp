# 🚀 New Features Implementation Guide
## Half-Day Sessions, Notice Period & Check-In System

---

## ✅ COMPLETED SO FAR

### 1. Database Schema Updates ✓
Created migration file: `supabase/add-half-day-and-notice-period.sql`

**What it adds:**
- ✅ Half-day session support (10am-2pm) with pricing £25-£30
- ✅ Full-day pricing remains £35-£40
- ✅ One month notice period tracking for subscription cancellations
- ✅ Check-in/check-out system for staff
- ✅ Database functions for cancellation and check-in/out operations

### 2. Legal Agreements Updated ✓
Updated file: `app/dashboard/legal-agreements/page.tsx`

**What was added:**
- ✅ New prominent notice period section in Terms & Conditions
- ✅ Dedicated "Subscription Cancellation Notice Period" section with amber warning styling
- ✅ Required checkbox: Users MUST accept one month notice period
- ✅ Clear examples explaining the policy
- ✅ Database field: `notice_period_accepted` with timestamp tracking

---

## 📋 NEXT STEPS TO COMPLETE

### Step 1: Run the Database Migration

**IMPORTANT: Do this first!**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open the file: `/supabase/add-half-day-and-notice-period.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run**

**Expected Result:**
```
✅ Migration completed successfully!
✅ Added half-day session support
✅ Added notice period policy (30 days)
✅ Added check-in/check-out tracking
✅ Created helper functions for cancellation and check-in/out
```

---

### Step 2: Update Subscription Pages (NEEDS WORK)

#### A. Subscriptions Pricing Page
**File to update:** `app/dashboard/subscriptions/page.tsx`

**Add half-day pricing display:**
```typescript
// For each subscription tier, show BOTH full-day and half-day prices
<div className="pricing-card">
  <h3>4 Days/Month</h3>

  {/* Full Day Option */}
  <div>
    <p>Full Day (7am-7pm): £160/month</p>
    <p className="text-sm">£40 per day</p>
  </div>

  {/* Half Day Option */}
  <div>
    <p>Half Day (10am-2pm): £120/month</p>
    <p className="text-sm">£30 per day</p>
  </div>
</div>
```

#### B. Add Cancellation Request Feature
**File to update:** `app/dashboard/subscriptions/page.tsx`

**Add a "Cancel Subscription" button that:**
1. Shows a modal explaining the 30-day notice period
2. Calculates the effective cancellation date
3. Shows the charge amount
4. Calls the database function: `request_subscription_cancellation()`
5. Updates subscription with `cancellation_requested = true`

**Example implementation:**
```typescript
const handleCancelSubscription = async (subscriptionId: string) => {
  // Show confirmation modal
  const confirmed = confirm(
    "Are you sure you want to cancel? You must provide 30 days notice. " +
    "You will be charged for one additional month if you proceed."
  )

  if (!confirmed) return

  // Call database function
  const { data, error } = await supabase.rpc('request_subscription_cancellation', {
    p_subscription_id: subscriptionId,
    p_user_id: user.id
  })

  if (error) {
    toast.error('Failed to request cancellation')
    return
  }

  // Show result
  toast.success(data.message)
}
```

#### C. Show Cancellation Status
If `cancellation_requested` is true, show:
```
⚠️ Cancellation Requested
Effective Date: {cancellation_effective_date}
Charge: £{monthly_price}
```

---

### Step 3: Update Booking System for Half-Day Selection (NEEDS WORK)

**Files to update:**
- `app/dashboard/page.tsx` (main dashboard with calendar)
- `app/dashboard/booking/page.tsx` (if exists)

**Add session type selector:**
```typescript
const [sessionType, setSessionType] = useState<'full_day' | 'half_day'>('full_day')

// In your booking form/calendar:
<div className="session-selector">
  <label>
    <input
      type="radio"
      value="full_day"
      checked={sessionType === 'full_day'}
      onChange={(e) => setSessionType('full_day')}
    />
    Full Day (7am-7pm) - £{fullDayRate}
  </label>

  <label>
    <input
      type="radio"
      value="half_day"
      checked={sessionType === 'half_day'}
      onChange={(e) => setSessionType('half_day')}
    />
    Half Day (10am-2pm) - £{halfDayRate}
  </label>
</div>
```

**When creating booking:**
```typescript
const bookingData = {
  user_id: user.id,
  dog_ids: selectedDogs,
  booking_date: selectedDate,
  session_type: sessionType, // 'full_day' or 'half_day'
  session_start_time: sessionType === 'full_day' ? '07:00' : '10:00',
  session_end_time: sessionType === 'full_day' : '19:00' : '14:00',
  daily_rate: sessionType === 'full_day' ? fullDayRate : halfDayRate,
  total_amount: (sessionType === 'full_day' ? fullDayRate : halfDayRate) * selectedDogs.length,
  // ...other fields
}
```

---

### Step 4: Build Check-In/Check-Out UI for Staff (NEEDS WORK)

**File to update:** `app/staff/dashboard/page.tsx`

**Add Check-In Interface:**
```typescript
const handleCheckIn = async (bookingId: string) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase.rpc('check_in_dog', {
    p_booking_id: bookingId,
    p_staff_id: user.id
  })

  if (error) {
    toast.error('Check-in failed')
    return
  }

  toast.success('Dog checked in successfully!')
  fetchTodayData() // Refresh the view
}

const handleCheckOut = async (bookingId: string, notes?: string) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase.rpc('check_out_dog', {
    p_booking_id: bookingId,
    p_staff_id: user.id,
    p_notes: notes || null
  })

  if (error) {
    toast.error('Check-out failed')
    return
  }

  toast.success('Dog checked out successfully!')
  fetchTodayData() // Refresh the view
}
```

**UI Components to Add:**
```typescript
// For each booking in today's view:
<div className="booking-card">
  <h3>{dog.name}</h3>
  <p>Owner: {owner.name}</p>
  <p>Session: {booking.session_type === 'full_day' ? '7am-7pm' : '10am-2pm'}</p>

  {/* Status badges */}
  {!booking.checked_in && (
    <button onClick={() => handleCheckIn(booking.id)} className="btn-primary">
      Check In
    </button>
  )}

  {booking.checked_in && !booking.checked_out && (
    <>
      <span className="badge-success">✅ Checked In at {booking.checked_in_at}</span>
      <button onClick={() => showCheckOutModal(booking)} className="btn-secondary">
        Check Out
      </button>
    </>
  )}

  {booking.checked_out && (
    <span className="badge-gray">✅ Completed (Out at {booking.checked_out_at})</span>
  )}
</div>
```

**Check-Out Modal (with notes):**
```typescript
const [showCheckOutModal, setShowCheckOutModal] = useState(false)
const [checkOutNotes, setCheckOutNotes] = useState('')
const [selectedBooking, setSelectedBooking] = useState(null)

// Modal component:
{showCheckOutModal && (
  <div className="modal">
    <h2>Check Out: {selectedBooking.dog.name}</h2>
    <textarea
      placeholder="Any notes about today? (optional)"
      value={checkOutNotes}
      onChange={(e) => setCheckOutNotes(e.target.value)}
      className="w-full p-3 border rounded"
      rows={4}
    />
    <button onClick={() => {
      handleCheckOut(selectedBooking.id, checkOutNotes)
      setShowCheckOutModal(false)
      setCheckOutNotes('')
    }}>
      Confirm Check-Out
    </button>
  </div>
)}
```

---

### Step 5: Update Pricing Configuration in Database

**SQL to run in Supabase (already in migration, but verify):**
```sql
-- Check current pricing
SELECT * FROM pricing_config;

-- Half-day prices should be:
-- 4 days: £30/day = £120/month
-- 8 days: £28.50/day = £228/month
-- 12 days: £27.75/day = £333/month
-- 16 days: £27/day = £432/month
-- 20 days: £25/day = £500/month
```

---

## 🎯 TESTING CHECKLIST

### Test Notice Period Flow:
- [ ] User signs up and checks the notice period checkbox
- [ ] Verify `notice_period_accepted` = true in database
- [ ] User purchases subscription
- [ ] User clicks "Cancel Subscription"
- [ ] Modal shows 30-day notice warning
- [ ] Confirm cancellation
- [ ] Verify `cancellation_requested` = true
- [ ] Verify `cancellation_effective_date` = 30 days from now
- [ ] Verify user is charged for one more month

### Test Half-Day Booking:
- [ ] User sees both Full Day and Half Day options when booking
- [ ] Select Half Day (10am-2pm)
- [ ] Correct pricing displays (£25-£30 depending on tier)
- [ ] Booking saves with `session_type` = 'half_day'
- [ ] Session times: 10:00-14:00
- [ ] Subscription days deducted correctly

### Test Check-In/Check-Out:
- [ ] Staff sees today's bookings
- [ ] Bookings show session type (Full/Half day)
- [ ] Click "Check In" button
- [ ] Verify `checked_in` = true, `checked_in_at` timestamp
- [ ] Status shows "Checked In"
- [ ] Click "Check Out" button
- [ ] Modal opens for optional notes
- [ ] Add notes and confirm
- [ ] Verify `checked_out` = true, `checked_out_at` timestamp, notes saved
- [ ] Status shows "Completed"

---

## 📊 DATABASE CHANGES SUMMARY

### New Columns in `bookings`:
- `session_type` - ENUM ('full_day', 'half_day')
- `session_start_time` - TIME
- `session_end_time` - TIME
- `checked_in` - BOOLEAN
- `checked_out` - BOOLEAN
- `checked_in_at` - TIMESTAMPTZ
- `checked_out_at` - TIMESTAMPTZ
- `checked_in_by` - UUID (staff member ID)
- `checked_out_by` - UUID (staff member ID)

### New Columns in `subscriptions`:
- `cancellation_requested` - BOOLEAN
- `cancellation_requested_at` - TIMESTAMPTZ
- `cancellation_effective_date` - DATE
- `notice_period_days` - INTEGER (default 30)

### New Columns in `legal_agreements`:
- `notice_period_accepted` - BOOLEAN
- `notice_period_accepted_at` - TIMESTAMPTZ

### New Columns in `pricing_config`:
- `half_day_price_per_day` - DECIMAL
- `half_day_monthly_price` - DECIMAL

### New Database Functions:
1. `check_in_dog(p_booking_id, p_staff_id)` - Returns JSON
2. `check_out_dog(p_booking_id, p_staff_id, p_notes)` - Returns JSON
3. `request_subscription_cancellation(p_subscription_id, p_user_id)` - Returns JSON
4. `calculate_cancellation_charge(subscription_id)` - Returns DECIMAL

### New Database View:
- `todays_checkin_status` - Shows all bookings for today with check-in status

---

## 🔧 FILES THAT NEED UPDATES

### ✅ Completed:
- `supabase/add-half-day-and-notice-period.sql` ✓
- `app/dashboard/legal-agreements/page.tsx` ✓

### 🔨 Need to Update:
1. **Subscription Pages**:
   - `app/dashboard/subscriptions/page.tsx` - Add half-day pricing display + cancellation button

2. **Booking Pages**:
   - `app/dashboard/page.tsx` - Add session type selector (Full Day / Half Day)
   - `app/dashboard/booking/page.tsx` - Same as above

3. **Staff Dashboard**:
   - `app/staff/dashboard/page.tsx` - Add check-in/check-out buttons and view

4. **Admin Dashboard**:
   - `app/staff/admin-dashboard/page.tsx` - Show cancellation requests, check-in stats

---

## 💡 QUICK IMPLEMENTATION TIPS

### For Half-Day Pricing:
1. Get user's subscription tier
2. Look up both `price_per_day` and `half_day_price_per_day`
3. Let user choose which session type when booking
4. Charge accordingly

### For Notice Period:
1. Add a "Cancel Subscription" button in subscriptions page
2. Show a warning modal with the policy
3. Call `request_subscription_cancellation()` function
4. Display effective date and charge amount
5. Disable new bookings after effective date

### For Check-In/Out:
1. Fetch today's bookings with session times
2. Show check-in button if not checked in
3. Show check-out button if checked in but not checked out
4. Update status using the database functions
5. Display check-in/out times to staff

---

## 📞 SUPPORT

If you need help implementing any of these features:
1. Start with running the database migration
2. Test the legal agreements page (notice period checkbox)
3. Then tackle half-day booking UI
4. Finally implement check-in/out for staff

**Estimated Time:**
- Database migration: 5 minutes
- Half-day booking UI: 2-3 hours
- Cancellation UI: 1-2 hours
- Check-in/out UI: 3-4 hours
- Testing: 1-2 hours

**Total: 8-12 hours of development**

---

*Last Updated: October 6, 2025*
