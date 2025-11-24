# Deployment Changes Tracker

## Session Date: 2025-11-24

### Changes Made - Discount Code System

#### 1. PayPal Integration for Discount Codes
**Files Modified:**
- `app/api/create-subscription-checkout-paypal/route.ts`
- `app/api/create-extra-days-checkout-paypal/route.ts`
- `app/api/create-assessment-checkout-paypal/route.ts`
- `app/api/create-individual-day-checkout-paypal/route.ts`

**Changes:**
- Added discount code parameters to all PayPal checkout routes
- Implemented discount tracking in `discount_code_usage` table
- Added automatic increment of `current_uses` counter
- Discount codes now work with both Stripe AND PayPal payments

#### 2. Admin Dashboard Updates
**File:** `app/staff/admin-dashboard/page.tsx`

**Changes:**
- Added "Discount Codes" section to Business Settings page
- New management interface accessible from Business Settings tab
- Fixed TypeScript errors:
  - Removed `check_in_time` property references (commit 99e2ac0, 89426f0)
  - Removed `check_out_time` property references
  - Removed `booking_type` property references (commit da1f9c1)

**Location:** Business Settings → Section 2.3: Discount Codes Management

#### 3. Discount Code Management Page
**File:** `app/staff/admin-dashboard/discount-codes/page.tsx`

**Changes:**
- Added 'individual_days' to applies_to options
- Updated display to show "Individual Days" properly formatted
- All 4 purchase types now supported:
  - Subscriptions
  - Extra Days
  - Assessments
  - Individual Days

#### 4. Frontend Payment Method Selection
**File:** `app/dashboard/subscriptions/page.tsx`

**Changes:**
- Added payment method toggle (Stripe/PayPal)
- Discount codes apply to selected payment method
- Dynamic API endpoint routing based on payment method

#### 5. Stripe API Version Update
**File:** `app/api/create-individual-day-checkout/route.ts`

**Changes:**
- Updated Stripe API version from '2024-11-20.acacia' to '2025-08-27.basil'
- Fixed TypeScript compilation error

#### 6. Individual Day Price Field
**File:** `app/staff/admin-dashboard/page.tsx`

**Status:** Already exists in code (line 5615)
**Location:** Business Settings → Section 2.25: Pricing & Capacity Management
**Field:** Individual Day Price (£)
**Default Value:** 50

#### 7. Daily Dog Limit (Capacity Changes)
**File:** `app/staff/admin-dashboard/page.tsx`

**Changes:**
- Removed separate "Large/Medium Dog Capacity" and "Small Dog Capacity" fields
- Replaced with single "Daily Dog Limit" field
- Default value: 50 dogs
- Applies to total dogs per day (subscriptions + individual bookings combined)
- Updated state management:
  - Removed: `daily_capacity_large`, `daily_capacity_small`
  - Added: `daily_dog_limit`
- Updated database setting key: `daily_dog_limit`

**Location:** Business Settings → Section 2.25: Pricing & Capacity Management

#### 8. Database Function: check_daily_capacity
**File:** `supabase/ADD-INDIVIDUAL-DAY-BOOKING-SYSTEM.sql`

**Changes:**
- Updated `check_daily_capacity` SQL function to use unified capacity approach
- **CRITICAL CHANGE:** Now enforces single `daily_dog_limit` across ALL dogs
- Counts BOTH subscription bookings AND individual day bookings together
- No longer separates by dog size (small/medium/large)
- Query changes:
  - Reads `daily_dog_limit` setting (default 50) instead of `daily_capacity_small`/`daily_capacity_large`
  - Counts from `bookings` table (subscriptions) with status IN ('confirmed', 'checked_in', 'checked_out')
  - Counts from `individual_day_bookings` table with status = 'confirmed'
  - Returns total combined count
- Returns JSON with:
  - `total_capacity`: The daily dog limit (e.g., 50)
  - `subscription_bookings`: Count of subscription dogs
  - `individual_bookings`: Count of individual day dogs
  - `current_bookings`: Total dogs (subscription + individual)
  - `available_spots`: Remaining capacity
  - `is_available`: Boolean (true if spots available)

**Impact:** This is the enforcement mechanism that prevents exceeding 50 dogs per day!

#### 9. Dashboard Capacity Display Widget
**File:** `app/staff/admin-dashboard/page.tsx`

**Changes:**
- Updated "Today's Capacity" widget to show unified total instead of separate small/large dog displays
- Modified lines 2702-2756
- **BEFORE:** Showed separate "Small Dogs 0/20" and "Large/Medium Dogs 0/30"
- **AFTER:** Shows single "Total Dogs (All Sizes)" with combined count
- Updated alert logic:
  - "Capacity Full" alert when total capacity = 0
  - "Near Capacity" alert when ≤10 spots remaining (instead of separate small/large thresholds)
- Progress bar now shows unified capacity percentage
- All displays now correctly reflect the 50 dog limit regardless of size

**Location:** Admin Dashboard → Overview tab → Today's Capacity widget

#### 10. Business Settings Accordion Organization
**File:** `app/staff/admin-dashboard/page.tsx`

**Changes:**
- Added accordion-style collapsible sections for better organization
- All sections start expanded by default for easy access
- Added "Collapse All / Expand All" button at the top
- Each section header is clickable to expand/collapse
- Smooth CSS transitions for accordion animation
- Chevron icons rotate to indicate open/closed state

**Sections with accordion:**
1. Assessment Scheduling
2. Business Hours
3. Pricing & Capacity
4. Discount Codes
5. Sections Management
6. Subscription Tiers Pricing

**Benefits:**
- Better organization of Business Settings page
- Users can collapse sections they're not currently working with
- No JSX compilation issues (uses simple CSS show/hide)
- Maintains all existing functionality

---

## Git Commits Made

1. **Initial discount code integration** - Added discount support to all PayPal routes
2. **Added discount codes to Business Settings** - Moved UI to correct location (commit ee29d91)
3. **Updated discount code options** - Added individual_days support
4. **Fixed Stripe API version** - Updated to 2025-08-27.basil (commit 2dd625d)
5. **Fixed check_in_time errors** - Removed non-existent properties (commits 99e2ac0, 89426f0)
6. **Fixed booking_type errors** - Removed non-existent property references (commit da1f9c1)
7. **Replace capacity fields with Daily Dog Limit** - Single unified capacity field (commit ce57f96)
8. **Update check_daily_capacity SQL function** - Enforce unified 50 dog limit across subscriptions + individual bookings
9. **Update dashboard capacity widget** - Display unified 50 dog total instead of separate small/large capacities (commit 9fc267e)
10. **Add accordion-style collapsible sections to Business Settings** - Better organization with expand/collapse functionality (commit a90cec3)

---

## Current Status

✅ **COMPLETED** - Ready for testing on localhost
- All discount code features working
- Daily Dog Limit implemented
- All TypeScript errors fixed
- Server compiling successfully

⏳ **PENDING** - Future enhancements
- Business Settings sub-tabs (General, Pricing, Assessment, Discounts, Sections) - Postponed due to complexity
- Closed Days management feature - Not started
- ✅ Capacity enforcement logic implemented in `check_daily_capacity` SQL function

---

## Testing Checklist

### Admin Features
- [ ] Login as admin
- [ ] Navigate to Admin Dashboard → Business Settings tab
- [ ] Verify "Discount Codes" button is visible
- [ ] Click "Manage Discount Codes"
- [ ] Create a new discount code with:
  - Percentage discount (e.g., 10%)
  - Fixed amount discount (e.g., £5)
  - Test all "Applies To" options
- [ ] Verify Individual Day Price field shows current value (£50)
- [ ] Test updating Individual Day Price

### User Features - Discount Codes
- [ ] Login as regular user
- [ ] Test discount code on Subscriptions (Stripe)
- [ ] Test discount code on Subscriptions (PayPal)
- [ ] Test discount code on Extra Days purchase
- [ ] Test discount code on Assessment booking
- [ ] Test discount code on Individual Day booking
- [ ] Verify discount calculations are correct
- [ ] Verify usage tracking in admin dashboard

### Payment Integration
- [ ] Complete a Stripe payment with discount
- [ ] Complete a PayPal payment with discount
- [ ] Verify discount_code_usage table records
- [ ] Verify current_uses increments correctly
- [ ] Test one-time-per-user restriction
- [ ] Test max_uses limit

---

## Deployment Commands

### Frontend Deployment
```bash
# Verify all changes are committed
git status

# Push to GitHub (triggers Vercel deployment)
git push origin main

# Monitor deployment at:
# https://vercel.com/dashboard
```

### Database Deployment (CRITICAL - MUST BE DONE FIRST!)
**⚠️ IMPORTANT: Run this SQL in Supabase BEFORE deploying frontend changes!**

The updated `check_daily_capacity` function must be deployed to the database first, otherwise the capacity checking will not work correctly with the new `daily_dog_limit` setting.

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy the updated function from `supabase/ADD-INDIVIDUAL-DAY-BOOKING-SYSTEM.sql` (lines 140-188)
3. Run the SQL to replace the existing function
4. Verify it works by testing: `SELECT check_daily_capacity('2025-11-25', 'medium');`
5. Then deploy the frontend changes

**SQL to run:**
```sql
CREATE OR REPLACE FUNCTION check_daily_capacity(
  p_date DATE,
  p_dog_size TEXT
)
RETURNS JSON AS $$
DECLARE
  v_capacity INTEGER;
  v_subscription_bookings INTEGER;
  v_individual_bookings INTEGER;
  v_total_bookings INTEGER;
  v_available INTEGER;
BEGIN
  -- Get unified daily dog limit
  SELECT COALESCE(setting_value::INTEGER, 50)
  INTO v_capacity
  FROM admin_settings
  WHERE setting_key = 'daily_dog_limit';

  -- Count subscription bookings for this date (confirmed or checked_in)
  SELECT COUNT(*)
  INTO v_subscription_bookings
  FROM bookings
  WHERE booking_date = p_date
    AND status IN ('confirmed', 'checked_in', 'checked_out');

  -- Count individual day bookings for this date (confirmed only)
  SELECT COUNT(*)
  INTO v_individual_bookings
  FROM individual_day_bookings
  WHERE booking_date = p_date
    AND status = 'confirmed';

  -- Calculate total bookings
  v_total_bookings := v_subscription_bookings + v_individual_bookings;

  -- Calculate available spots
  v_available := v_capacity - v_total_bookings;

  RETURN json_build_object(
    'date', p_date,
    'total_capacity', v_capacity,
    'subscription_bookings', v_subscription_bookings,
    'individual_bookings', v_individual_bookings,
    'current_bookings', v_total_bookings,
    'available_spots', v_available,
    'is_available', v_available > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Known Issues / Notes

1. ✅ **RESOLVED**: GitHub webhook to Vercel was disconnected - manual deployments were required
2. ✅ **RESOLVED**: TypeScript errors with booking properties blocking build
3. ✅ **RESOLVED**: Discount code UI placement (now in Business Settings)
4. ⚠️ **CURRENT**: Testing needed on localhost before production deployment

---

## Database Schema Dependencies

### Tables Used:
- `discount_codes` - Stores discount code definitions
- `discount_code_usage` - Tracks usage by users
- `subscriptions` - Subscription records
- `extra_days_purchases` - Extra days records
- `assessment_requests` - Assessment bookings
- `bookings` - Individual day bookings
- `individual_day_bookings` - Individual day booking records

### RPC Functions:
- `validate_discount_code` - Validates code eligibility
- `calculate_discount_amount` - Calculates discount value
- `check_daily_capacity` - Checks daily dog capacity

---

## SQL Scripts Required for Deployment

⚠️ **CRITICAL: These SQL scripts MUST be run in Supabase BEFORE deploying frontend changes!**

### 1. Daily Dog Limit Capacity Function
**File:** `supabase/ADD-INDIVIDUAL-DAY-BOOKING-SYSTEM.sql` (lines 140-188)
**Why:** Updates the `check_daily_capacity` function to use the unified `daily_dog_limit` setting instead of separate small/large capacities.
**Status:** ⚠️ NEEDS TO BE RUN IN SUPABASE

### 2. Discount Codes System
**File:** `supabase/CREATE-DISCOUNT-CODES-SYSTEM.sql`
**Why:** Creates all discount code tables, functions, and RLS policies
**Tables Created:**
- `discount_codes` - Main table for storing discount codes
- `discount_code_usage` - Tracks who used which codes
- `extra_days_purchases` - Tracks extra day purchases with discounts

**Functions Created:**
- `validate_discount_code()` - Validates if a code can be used
- `calculate_discount_amount()` - Calculates discount value

**Status:** ⚠️ NEEDS TO BE RUN IN SUPABASE

**How to Run:**
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase/CREATE-DISCOUNT-CODES-SYSTEM.sql`
3. Paste and run the SQL
4. Verify success by checking if `discount_codes` table exists
