# How to Audit Subscriptions Against Stripe

I've created two ways to audit your subscriptions to ensure database records match Stripe payments.

## ⚠️ IMPORTANT: Live vs Test Mode

Your database contains **LIVE** Stripe subscriptions (IDs starting with `sub_1S...`), but your `.env.local` file is using a **TEST** mode Stripe key (`sk_test_...`).

**You need to use your LIVE Stripe key to audit properly.**

## Option 1: Quick SQL Audit (Recommended to Start)

This gives you immediate insights without needing to configure Stripe API access.

### How to Run:

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Open the file: `/supabase/audit-subscriptions.sql`
4. Run each query section to see:
   - Total subscriptions overview
   - Active subscriptions with user details
   - Subscriptions missing Stripe IDs (potential issues)
   - Multi-dog owners
   - Subscriptions by tier
   - Recent subscriptions (last 30 days)
   - Paused subscriptions
   - Expiring subscriptions
   - Duplicate Stripe IDs (shouldn't exist)
   - Revenue summary

### What to Look For:

✅ **Good Signs:**
- All active subscriptions have Stripe IDs
- No duplicate Stripe IDs
- Days remaining matches what customers expect

⚠️ **Warning Signs:**
- Subscriptions without Stripe IDs (means payment might have failed)
- Duplicate Stripe IDs (data integrity issue)
- Days remaining = 0 but subscription still active

## Option 2: Full Stripe API Audit

This compares your database against actual Stripe records to find discrepancies.

### Step 1: Get Your LIVE Stripe Secret Key

1. Go to https://dashboard.stripe.com/apikeys
2. **Make sure you're in LIVE mode** (toggle in top-left should say "LIVE")
3. Copy your "Secret key" (starts with `sk_live_...`)

### Step 2: Temporarily Update .env.local

```bash
# BACKUP your current test key first!
# Then replace with live key:
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE
```

### Step 3: Run the Audit Script

```bash
npm run audit:subscriptions
```

This will output a detailed report showing:

- **Database Subscriptions:** Total count in your database
- **Stripe Subscriptions:** Total count in Stripe
- **Matching Records:** Subscriptions that match perfectly
- **Health Score:** Percentage of subscriptions that match

**Issues it will find:**

❌ **Missing Stripe IDs** - Database subscriptions without Stripe ID (payment failed)
❌ **Stripe Not in Database** - Stripe payments without database record (webhook failed)
⚠️ **Status Mismatches** - Active in database but cancelled in Stripe (or vice versa)

### Step 4: Save the Report

```bash
npm run audit:subscriptions > audit-report-$(date +%Y-%m-%d).txt
```

This saves the output to a timestamped file.

### Step 5: Restore Test Key

After auditing, restore your test key in `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE
```

## Current Database Stats (as of audit)

Based on the audit, you have:
- **34 total subscriptions** in database
- **33 subscriptions with Stripe IDs**
- **1 subscription without Stripe ID** (Andrew Carrick - needs investigation)

## What the Numbers Mean

### Scenario 1: Perfect Match
```
Database Subscriptions: 34
Stripe Subscriptions: 34
Matching Records: 34
Health Score: 100%
```
✅ Everything is perfect!

### Scenario 2: Missing Stripe IDs
```
Database Subscriptions: 34
Matching Records: 33
Missing Stripe ID: 1
```
⚠️ One subscription was created but payment never completed. Contact the user.

### Scenario 3: Webhook Failure
```
Database Subscriptions: 30
Stripe Subscriptions: 34
Stripe Not in Database: 4
```
❌ 4 people paid but didn't get database records. Create their subscriptions manually!

### Scenario 4: Status Mismatch
```
Status Mismatches: 5
```
⚠️ Stripe status doesn't match database. Update database to match Stripe (Stripe is source of truth).

## Action Items Based on Audit

### For Missing Stripe IDs:
1. Contact the user via email
2. Check if they intended to purchase
3. If yes, send them a new payment link
4. If no, delete the subscription record

### For Stripe Not in Database:
1. **URGENT** - Customer paid but has no access!
2. Create subscription record manually in database
3. Send welcome email
4. Investigate why webhook failed

### For Status Mismatches:
1. Update database status to match Stripe
2. If Stripe says "cancelled", mark database as inactive
3. If Stripe says "active", mark database as active

## Questions?

If you see unexpected results or need help interpreting the audit:
1. Check that you used the correct Stripe key (test vs live)
2. Verify environment variables are loaded correctly
3. Review the SQL queries to understand what's being checked
