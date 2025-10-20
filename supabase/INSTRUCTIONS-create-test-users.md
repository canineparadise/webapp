# Instructions: Creating Test Users

## Problem
The `profiles` table has a foreign key to `auth.users`, so we can't create test data without first creating the authentication users.

## Solution: Two Options

### Option 1: Manual Creation (Tedious but Complete)

1. **Create each user in Supabase Auth Dashboard:**
   - Go to Authentication > Users > Add user
   - Create users with these emails:
     - liam.evans@test.com
     - charlotte.moore@test.com
     - ethan.jackson@test.com
     - mia.white@test.com
     - lucas.hall@test.com
     - grace.allen@test.com
     - henry.young@test.com
     - ella.king@test.com
     - sebastian.wright@test.com
     - scarlett.lopez@test.com
     - jack.hill@test.com
   - Password: CanineParadise2025! (for all)
   - **IMPORTANT:** Copy each UUID after creation

2. **Update the script:**
   - Open `test-data-04-users-approved-continued.sql`
   - Replace all `REPLACE_WITH_AUTH_UUID_X` with actual UUIDs
   - Run the script

### Option 2: Use SQL to Query Existing Users (RECOMMENDED)

If you already have some test user accounts created, we can use their actual UUIDs. Let me create a script that:
1. Lists all your existing auth users
2. Picks random ones to assign profiles to

Would you like me to create that instead?

### Option 3: Simplified Test Data

Create just a few test users manually (3-5) and we can create rich data for those instead of 20+ users.

## Which approach would you prefer?
