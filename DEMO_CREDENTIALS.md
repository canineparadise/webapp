# Aldenham Doggy Day Care - Demo Credentials

## Live Site URL
**https://canineparadise-p88d.vercel.app/**

---

## Demo Accounts for Client Preview

### 👤 User Portal (Client Dashboard)
**URL**: https://canineparadise-p88d.vercel.app/login

**Email**: `demo.user@canineparadise.com`
**Password**: `DemoUser2025!`

**What they can see:**
- Complete user onboarding flow
- Dashboard with progress tracking
- Add and manage dogs
- View/sign legal agreements
- Schedule assessments
- Book daycare days (once approved)
- Purchase subscriptions
- View profile settings

---

### 👨‍💼 Staff Portal
**URL**: https://canineparadise-p88d.vercel.app/staff

**Email**: `demo.staff@canineparadise.com`
**Password**: `DemoStaff2025!`

**What they can see:**
- Daily schedule view
- Manage bookings
- View all dogs and owners
- Assessment management
- Play group assignments
- Quick actions dashboard

---

### 🔒 Admin Portal (Full Access)
**URL**: https://canineparadise-p88d.vercel.app/staff

**Email**: `demo.admin@canineparadise.com`
**Password**: `DemoAdmin2025!`

**What they can see:**
- Everything staff can see, PLUS:
- **Settings**: Configure pricing, assessment days, capacity
- **User Management**: View all users and their details
- **Play Groups**: Create and manage dog play groups
- **Analytics**: Overview of bookings, revenue, capacity
- **Newsletter**: Send updates to all users
- Full admin dashboard with all controls

---

## Setup Instructions

To create these demo accounts in your Supabase database:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** for each account above
3. Enter the email and password
4. ✅ Check **"Auto Confirm User"** (so they don't need email verification)
5. After creating all 3 users in Auth, go to **SQL Editor**
6. Run the SQL from `create-demo-accounts.sql`

This will:
- Set correct roles for each user
- Add sample data (dog, legal agreements) for the demo client
- Set up complete profiles

---

## Notes for Your Client

- The demo user account has a sample dog named "Max" already added
- All legal agreements are pre-signed for the demo user
- No real payments will be processed (Stripe is in test mode)
- Staff/Admin can approve dogs for daycare after assessments
- Admin can adjust all pricing and settings in real-time

---

## What's Working

✅ User authentication and role-based access
✅ User onboarding flow (profile, dogs, agreements, assessment)
✅ Staff dashboard with schedule view
✅ Admin dashboard with full settings control
✅ Play groups management
✅ Subscription pricing (admin-configurable)
✅ Booking system UI
✅ Assessment scheduling

## What Needs Completion

🔧 Stripe payment integration (needs real API keys)
🔧 Email notifications
🔧 Document upload to Supabase Storage
🔧 Admin approval workflow
🔧 Booking system backend logic (capacity checks, subscription tracking)

---

**Questions or feedback?** Let your client explore and note what they'd like changed or added!
