# URGENT FIXES - Priority List

## Issues Identified:

### 1. ✅ Add Dog Form - Showing Previous Dog Data
**Problem:** When clicking "Add Dog", form shows previous dog's information from localStorage
**Location:** `/app/dashboard/add-dog/page.tsx` lines 112-136
**Fix:** Clear localStorage when user intentionally adds a new dog (not resuming a draft)
**Priority:** HIGH

### 2. ⚠️ Assessment Checkout Error
**Problem:** "Failed to create checkout" when trying to book assessment
**Location:** Need to check `/app/api/create-assessment-checkout/route.ts`
**Fix:** Debug Stripe API call, check environment variables, verify price calculation
**Priority:** CRITICAL

### 3. ⚠️ Assessment Pricing - £40 Per Dog
**Problem:** Current pricing doesn't implement £40 per dog logic
**Location:** Assessment checkout API + frontend
**Fix:** Implement multi-dog selection with £40 × number of dogs
**Priority:** HIGH

###4. ⚠️ Multi-Dog Assessment Selection
**Problem:** Can't select which dogs to bring for assessment
**Location:** `/app/dashboard/assessment/schedule/page.tsx`
**Fix:** Add checkboxes for dog selection, calculate total (£40 × selected dogs)
**Priority:** HIGH

### 5. ⚠️ Filter Unapproved Dogs for Assessment
**Problem:** Showing all dogs, not just ones needing assessment
**Location:** Assessment scheduling page
**Fix:** Filter dogs where `has_completed_assessment = false` or similar
**Priority:** MEDIUM

### 6. ⚠️ Admin Staff Form - Can't Scroll
**Problem:** Add staff member modal doesn't scroll
**Location:** `/app/staff/admin-dashboard/page.tsx` - staff form modal
**Fix:** Add `overflow-y-auto` and `max-h-[80vh]` to modal content
**Priority:** MEDIUM

### 7. ⚠️ Admin Pricing Tiers - Not Displaying
**Problem:** Prices not showing in admin portal
**Location:** `/app/staff/admin-dashboard/page.tsx` - pricing section
**Fix:** Check data fetching, verify subscription_tiers table columns
**Priority:** MEDIUM

---

## Fixes Applied:

(Will update as fixes are completed)
