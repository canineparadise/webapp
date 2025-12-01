# Subscription Audit Script

This script audits your database subscriptions against Stripe to ensure everything matches up correctly.

## What It Checks

✅ **Matching Records** - Subscriptions that exist in both database and Stripe with consistent status

❌ **Missing Stripe IDs** - Subscriptions in database without a Stripe subscription ID

❌ **Stripe Not in Database** - Stripe subscriptions that don't have a corresponding database record

⚠️ **Status Mismatches** - Subscriptions where database status doesn't match Stripe status

## How to Run

1. Make sure you have your environment variables set up in `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. Run the audit:
   ```bash
   npm run audit:subscriptions
   ```

3. The script will output a detailed report showing:
   - Total subscriptions in database vs Stripe
   - Health score (percentage of matching records)
   - List of any issues found
   - Details for each problematic subscription

## Output Example

```
═══════════════════════════════════════════════════════
           SUBSCRIPTION AUDIT REPORT
═══════════════════════════════════════════════════════

📈 OVERVIEW
─────────────────────────────────────────────────────
Database Subscriptions:     15
Stripe Subscriptions:       14
Matching Records:           13
Health Score:               87%

⚠️  ISSUES FOUND:
   • 2 subscription(s) in database without Stripe ID

❌ SUBSCRIPTIONS WITHOUT STRIPE ID
─────────────────────────────────────────────────────
   • john@example.com - Max
     DB ID: abc-123-def
     Created: 11/20/2024
```

## What to Do If Issues Are Found

### Missing Stripe IDs
These are subscriptions created in the database but never got a Stripe subscription ID. This usually happens when:
- Payment failed during checkout
- User closed browser during payment
- Webhook didn't fire properly

**Action:** Contact the user to verify if they actually paid. If not, delete the subscription.

### Stripe Not in Database
These are Stripe subscriptions that don't have a database record. This could happen if:
- Webhook failed to create database record
- Manual subscription created in Stripe dashboard

**Action:** Create the missing database subscription record or cancel the Stripe subscription if it's invalid.

### Status Mismatches
Database says subscription is active but Stripe says it's cancelled (or vice versa).

**Action:** Update the database to match Stripe's status, as Stripe is the source of truth for payment status.

## Troubleshooting

If the script fails to run:

1. **Check environment variables** - Make sure `.env.local` has all required keys
2. **Check Stripe API key** - Ensure you're using the correct live/test key
3. **Check Supabase permissions** - Service role key is required to read all subscriptions

## Running in Production

To run this audit on your production database:

1. Use production environment variables
2. Run during off-peak hours (fewer concurrent changes)
3. Save the output to a file for records:
   ```bash
   npm run audit:subscriptions > audit-report-$(date +%Y-%m-%d).txt
   ```
