# Booking Management System Setup

## Step 1: Run SQL in Supabase

1. Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/hmlmazrdoglqfictjcnm/sql/new
2. Copy the entire contents of `supabase/CREATE-booking-management-tables.sql`
3. Paste and run the SQL

This will create:
- `booking_credits` table - Tracks credits when users cancel individual day bookings
- `refund_requests` table - Tracks refund requests for admin approval
- Add cancellation fields to existing `bookings` and `individual_day_bookings` tables
- Helper functions for 24hr cancellation policy and credit calculations

## Step 2: Features Being Implemented

### For Users (Client Portal):
1. **Manage Bookings Page** (`/dashboard/manage-bookings`)
   - View all upcoming and past bookings
   - Cancel bookings (24hr policy)
   - Reschedule bookings (24hr policy)
   - Request refunds or credit account
   - View account credits
   - Manage subscription (upgrade/cancel)

2. **Cancellation Options**:
   - **Individual Day Bookings**: Choose "Request Refund" or "Credit My Account"
   - **Subscription Bookings**: Day credit returns to `days_remaining` (current month only)

3. **Rescheduling**:
   - Cancel original booking
   - Select new date
   - For subscriptions: day credit returned then used for new date
   - For individual: credit applied to new booking

### For Admin (Admin Portal):
1. **Refund Requests Section**
   - View all pending refund requests
   - See client details, booking details, amount
   - Approve/reject/complete refunds
   - Add admin notes

2. **Credits Management**
   - View all user credits
   - Track credit usage

## Step 3: Technical Details

### 24-Hour Cancellation Policy
- Users can only cancel/reschedule bookings more than 24 hours away
- System automatically checks: `booking_date > CURRENT_DATE + INTERVAL '1 day'`

### Credit System
- Credits never expire (unless specified)
- Can be used for any future booking
- Tracked in `booking_credits` table with full audit trail

### Subscription Days Management
- Days don't roll over to next month
- Rescheduling within month doesn't lose days
- Cancelling returns day to `days_remaining`

## Status
- ✅ SQL migration file created
- ⏳ Waiting for SQL to be run in Supabase
- ⏳ Frontend implementation in progress
