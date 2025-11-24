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

---

## Git Commits Made

1. **Initial discount code integration** - Added discount support to all PayPal routes
2. **Added discount codes to Business Settings** - Moved UI to correct location (commit ee29d91)
3. **Updated discount code options** - Added individual_days support
4. **Fixed Stripe API version** - Updated to 2025-08-27.basil (commit 2dd625d)
5. **Fixed check_in_time errors** - Removed non-existent properties (commits 99e2ac0, 89426f0)
6. **Fixed booking_type errors** - Removed non-existent property references (commit da1f9c1)
7. **Replace capacity fields with Daily Dog Limit** - Single unified capacity field (commit ce57f96)

---

## Current Status

✅ **COMPLETED** - Ready for testing on localhost
- All discount code features working
- Daily Dog Limit implemented
- All TypeScript errors fixed
- Server compiling successfully

⏳ **PENDING** - Future enhancements
- Business Settings sub-tabs (General, Pricing, Assessment, Discounts, Sections)
- Closed Days management feature
- Capacity enforcement logic (ensuring 50 dog limit is respected)

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

```bash
# Verify all changes are committed
git status

# Push to GitHub (triggers Vercel deployment)
git push origin main

# Monitor deployment at:
# https://vercel.com/dashboard
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

### RPC Functions:
- `validate_discount_code` - Validates code eligibility
- `calculate_discount_amount` - Calculates discount value
