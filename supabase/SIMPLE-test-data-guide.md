# Simple Test Data Creation Guide

## The Problem
All the SQL scripts I created won't work because `profiles` table requires users to exist in `auth.users` first, and we can't create auth users via SQL.

## The Solution: Create Users Through Your App

Instead of manually creating 20 users in Supabase dashboard, let's use your signup page to create realistic test data.

### Option 1: Quick Manual Signup (Recommended)
1. Open your app: https://canineparadise-p88d.vercel.app/signup
2. Sign up as a few test users (3-5 is enough to test the staff portal)
3. For each user:
   - Complete profile
   - Add 1-3 dogs
   - Upload vaccination docs
   - Sign legal agreements
   - Book assessment
   - Then go to Supabase and approve some, leave some pending

### Option 2: Use Existing Data
- You already have 1 user
- Just create 2-3 more users through signup
- That's enough to test the staff/admin portals

### Option 3: Staff Can Create Test Data
Once you have staff/admin users, they can:
1. See the pending users
2. Approve/reject them
3. Test the workflows

## What You Actually Need
- **1 staff user** - create manually in Supabase Auth, set role='staff'
- **1 admin user** - create manually in Supabase Auth, set role='admin'
- **3-5 regular users** - create through signup page

This is MUCH faster than creating 20+ users manually!

Would you like me to:
1. Create a simple script to set up just the staff and admin users?
2. Or help you create test users another way?
