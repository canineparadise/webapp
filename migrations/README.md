# Database Migrations

This folder contains SQL migration scripts to update your production database schema.

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the **SQL Editor** tab
3. Click **New Query**
4. Copy the contents of the migration file you want to run
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Using psql Command Line
```bash
# Source your environment variables
source .env.local

# Run the migration
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$SUPABASE_DB_HOST" -U postgres -d postgres -f migrations/add-discount-tracking.sql
```

## Available Migrations

### add-discount-tracking.sql
**Status**: Pending - needs to be run on production

**Purpose**: Adds discount code tracking functionality to the admin dashboard

**What it does**:
- Creates `discount_codes` table to store discount codes (FIRST50, etc.)
- Creates `discount_code_usage` table to track when discounts are used
- Adds proper Row Level Security (RLS) policies
- Inserts the FIRST50 discount code
- Creates performance indexes

**Why it's needed**:
- The admin dashboard "Discount Usage" tab requires these tables
- Currently shows "Total Discounts Used: 0" because tables don't exist
- After running this migration, discount usage will be properly tracked and displayed

**Safe to run**: Yes, this migration uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING` to prevent errors if tables already exist

## Migration History

- **2025-11-27**: Created add-discount-tracking.sql for discount code tracking feature
