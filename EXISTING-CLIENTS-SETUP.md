# Existing Clients Auto-Approval System

This system automatically approves existing Canine Paradise clients when they sign up, skipping the assessment requirement.

## Overview

When someone signs up with an email address that matches one in the existing clients database (~550 clients), they will:
- ✅ Be **auto-approved** (no manual approval needed)
- ✅ Have **assessment marked as completed** (no assessment booking required)
- ✅ Have **all their dogs auto-approved** when they add them

## Setup Instructions

### Step 1: Create the Database Table

Run this SQL in your Supabase SQL Editor:

```bash
# File: supabase/existing-clients-table.sql
```

This creates the `existing_clients` table with proper RLS policies.

### Step 2: Import the CSV Data

Run the import script to load all 550+ existing clients into the database:

```bash
node scripts/import-existing-clients.js
```

**Expected output:**
```
🔍 Reading CSV files from exisitingclients folder...

Found 6 CSV files

📄 102449315169296c1515f5c6.63661867.csv: 49 clients
📄 110858554169296bd8b10573.85396485.csv: 100 clients
📄 207071034469296c09cc6334.06036464.csv: 100 clients
📄 59794641569296be8de9d72.13651927.csv: 100 clients
📄 71632244469296bf45c7853.50032232.csv: 100 clients
📄 73990419469296bff652a83.98381040.csv: 100 clients

📊 Total unique clients: 549
📊 Duplicates removed: 0

⬆️  Importing to Supabase...

✅ Imported batch 1 (100/549)
✅ Imported batch 2 (200/549)
✅ Imported batch 3 (300/549)
✅ Imported batch 4 (400/549)
✅ Imported batch 5 (500/549)
✅ Imported batch 6 (549/549)

==================================================
✅ Import complete!
   Imported: 549
   Errors: 0
==================================================
```

### Step 3: Update the Profile Trigger

Run this SQL to update the profile creation trigger:

```bash
# File: supabase/update-profile-trigger-existing-clients.sql
```

This modifies the `handle_new_user()` function to:
- Check if the new user's email exists in `existing_clients`
- If yes: Set `approval_status='approved'` and `assessment_completed=TRUE`
- If no: Use default behavior (pending approval)

### Step 4: Add the Dog Auto-Approval Trigger

Run this SQL to auto-approve dogs for existing clients:

```bash
# File: supabase/auto-approve-existing-client-dogs.sql
```

This creates a trigger that runs when a dog is added:
- Checks if the user is an existing client
- If yes: Auto-approve the dog (`is_approved=TRUE`, `is_draft=FALSE`)
- If no: Use default behavior (requires approval)

## How It Works

### When an Existing Client Signs Up:

1. **User creates account** with email matching `existing_clients` table
2. **Profile trigger fires** → Sets `approval_status='approved'` and `assessment_completed=TRUE`
3. **User adds dogs** → Dog trigger fires → All dogs auto-approved
4. **User can immediately** → Book daycare days, purchase subscriptions, etc.

### When a New Client Signs Up:

1. **User creates account** with email NOT in `existing_clients` table
2. **Profile trigger fires** → Uses default values (pending approval)
3. **User must** → Book and complete assessment
4. **Admin must** → Manually approve profile and dogs
5. **Then user can** → Book daycare days, purchase subscriptions, etc.

## Database Schema

### existing_clients Table

```sql
CREATE TABLE existing_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_existing_clients_email` on `LOWER(email)` for fast case-insensitive lookups

**RLS Policies:**
- Authenticated users can SELECT (to check if they're existing clients)
- Only admins can INSERT/UPDATE/DELETE

## Files Created

1. **Database Schema:**
   - `supabase/existing-clients-table.sql` - Creates the table

2. **Import Script:**
   - `scripts/import-existing-clients.js` - Imports CSV data

3. **Database Triggers:**
   - `supabase/update-profile-trigger-existing-clients.sql` - Auto-approve profiles
   - `supabase/auto-approve-existing-client-dogs.sql` - Auto-approve dogs

4. **Source Data:**
   - `exisitingclients/*.csv` - 6 CSV files with ~550 client emails

## Testing

To test the system works correctly:

1. Pick an email from one of the CSV files (e.g., `suejolly01@gmail.com`)
2. Sign up with that email
3. Check the profile:
   ```sql
   SELECT approval_status, assessment_completed
   FROM profiles
   WHERE email = 'suejolly01@gmail.com';
   ```
   Should return: `approval_status='approved'`, `assessment_completed=TRUE`

4. Add a dog
5. Check the dog:
   ```sql
   SELECT is_approved, is_draft
   FROM dogs
   WHERE user_id = (SELECT id FROM profiles WHERE email = 'suejolly01@gmail.com');
   ```
   Should return: `is_approved=TRUE`, `is_draft=FALSE`

## Maintenance

### Adding New Existing Clients

If you need to add more existing clients later:

1. Create a new CSV file in `exisitingclients/` folder with format:
   ```
   Name,E-mail
   John Doe,john@example.com
   ```

2. Run the import script again:
   ```bash
   node scripts/import-existing-clients.js
   ```

   The script uses `UPSERT` so it won't create duplicates.

### Viewing Existing Clients

To see all existing clients in Supabase:

```sql
SELECT name, email, created_at
FROM existing_clients
ORDER BY name;
```

## Security Notes

- Email matching is **case-insensitive** (`LOWER(email)`)
- RLS policies prevent non-admins from modifying the existing clients list
- Triggers use `SECURITY DEFINER` to bypass RLS for the lookup
- All existing clients are treated equally (no special permissions beyond auto-approval)

---

## Summary

This system ensures that your ~550 existing clients have a seamless onboarding experience without needing to go through the assessment process again. They are automatically recognized and approved based on their email address matching the existing client database.
