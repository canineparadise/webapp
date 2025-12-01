# Database Errors Fix Guide

## Errors Found and Solutions

### ✅ **Error 1: Subscription Query - FIXED**

**Error:**
```
❌ Subscription query error for user: JSON object requested, multiple (or no) rows returned
```

**Cause:** Using `.maybeSingle()` for users with multiple subscriptions (multi-dog owners)

**Fix Applied:** Changed to load all subscriptions and aggregate properly

---

### 🔴 **Error 2: Dogs Table Returning 500 Errors**

**Error:**
```
Failed to load resource: the server responded with a status of 500
hmlmazrdoglqfictjcnm.supabase.co/rest/v1/dogs?select=*,owner:profiles!dogs_owner_id_fkey
```

**Cause:** Row Level Security (RLS) policy issue or foreign key constraint problem

**Solution:**

1. Go to Supabase Dashboard → Table Editor → `dogs` table
2. Click on "Policies" tab
3. Check if RLS is enabled
4. **If RLS is enabled**, you need policies that allow admin/staff to read all dogs:

```sql
-- Policy to allow staff/admin to read all dogs
CREATE POLICY "Staff can view all dogs"
ON dogs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Policy to allow users to see their own dogs
CREATE POLICY "Users can view own dogs"
ON dogs
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());
```

**Alternative Fix:** If you don't need RLS on dogs table:
```sql
-- Disable RLS on dogs table (only if you're okay with this)
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
```

---

### 🔴 **Error 3: Refund Requests Table Missing**

**Error:**
```
Refund requests table not available: Could not find a relationship between 'refund_requests' and 'user_id'
```

**Cause:** Either the table doesn't exist or the foreign key relationship is named differently

**Solution:**

**Option A: Create the refund_requests table**
```sql
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);

-- Enable RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own refund requests"
ON refund_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff can view all refund requests"
ON refund_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);
```

**Option B: Hide the error (if you don't need refund requests)**

Find the code that queries refund_requests and wrap it in a try-catch:
```tsx
try {
  const { data } = await supabase
    .from('refund_requests')
    .select('...')
} catch (error) {
  // Table doesn't exist, skip
  console.log('Refund requests table not available (expected for OLD schema)')
}
```

---

### 🔴 **Error 4: Discount Code Usage Table Issues**

**Error:**
```
Discount usage tracking table not available (expected for OLD schema)
```

**Cause:** Missing columns or incorrect foreign key names

**Solution:**

Check your discount_code_usage table schema:

```sql
-- Verify the table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'discount_code_usage';
```

**Expected schema:**
```sql
CREATE TABLE discount_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID REFERENCES discount_codes(id),
  user_id UUID REFERENCES profiles(id),
  used_for TEXT,  -- 'subscription', 'daycare', 'assessment'
  original_amount DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2),
  final_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

If columns are missing, add them:
```sql
ALTER TABLE discount_code_usage
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10, 2);
```

---

### 🔴 **Error 5: CORS Errors**

**Error:**
```
Access-Control-Allow-Origin header is present on the requested resource
```

**Cause:** Supabase CORS configuration doesn't include your domain

**Solution:**

1. Go to Supabase Dashboard
2. Navigate to: **Settings** → **API** → **URL Configuration**
3. Add your domains to **Additional Allowed Origins:**
   ```
   https://www.aldenhamdoggydaycare.com
   https://aldenhamdoggydaycare.com
   http://localhost:3000
   ```

4. Save changes

**Temporary Fix:** Clear browser cache and cookies, then reload

---

### 🔴 **Error 6: Profile Query with id Parameter**

**Error:**
```
Failed to load resource: 400
/rest/v1/profiles?id=eq.c3219edf-97c6-4ebb-9af4-9ef7b3180de7
```

**Cause:** Using `id` instead of proper column name in query

**Fix:** Update the query to use the correct parameter format:

```tsx
// ❌ Wrong
.select('*')
.eq('id', userId)

// ✅ Correct (if using Supabase client)
.select('*')
.eq('id', userId)  // Should work, check if column exists

// OR fetch by auth user
const { data: { user } } = await supabase.auth.getUser()
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

---

## Quick Fix Checklist

Run these in order to fix most errors:

### 1. Enable RLS Policies for Staff
```sql
-- Run in Supabase SQL Editor

-- Dogs table
CREATE POLICY "Staff can view all dogs"
ON dogs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Subscriptions table
CREATE POLICY "Staff can view all subscriptions"
ON subscriptions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Bookings table
CREATE POLICY "Staff can view all bookings"
ON bookings FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);
```

### 2. Add CORS Origins
- Go to Supabase → Settings → API
- Add your production domain to allowed origins

### 3. Clear Browser Cache
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or clear site data in DevTools

### 4. Deploy Changes
```bash
git push
# Wait for Vercel to rebuild
```

---

## Debugging Tips

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'dogs';
```

### Check Foreign Keys
```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('dogs', 'subscriptions', 'refund_requests', 'discount_code_usage');
```

### Test Individual Queries
Use Supabase SQL Editor to test:
```sql
-- Test dogs query as staff user
SELECT * FROM dogs LIMIT 10;

-- Test subscription query
SELECT * FROM subscriptions WHERE user_id = 'USER_UUID';
```

---

## Priority Fixes

1. **HIGH**: Fix RLS policies for dogs table (500 errors)
2. **HIGH**: Add CORS origins (CORS errors)
3. **MEDIUM**: Create/fix refund_requests table (if needed)
4. **MEDIUM**: Fix discount_code_usage schema
5. **LOW**: Clean up console errors with try-catch blocks

---

## Need Help?

If errors persist:
1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Look for detailed error messages
3. Verify you're logged in as admin/staff user
4. Check browser Network tab for exact error responses
