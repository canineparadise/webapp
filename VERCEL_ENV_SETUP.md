# Vercel Environment Variables Setup

## Copy These Values to Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add each of these variables:

### 1. NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL=https://hmlmazrdoglqfictjcnm.supabase.co

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MjA5NDksImV4cCI6MjA3MzQ5Njk0OX0.IwnxUelSp8ZiOeaW_TOvchE61TupTeAcpHfdymNZHII

### 3. NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_URL=https://canineparadise-p88d.vercel.app

### 4. NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_BASE_URL=https://canineparadise-p88d.vercel.app

### 5. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_IKcpiEby3CoJ09HTiPsyZaJN00BdTMZFZZ

### 6. STRIPE_SECRET_KEY (Server-side only)
STRIPE_SECRET_KEY=your_stripe_secret_key_here

### 7. SUPABASE_SERVICE_ROLE_KEY (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

### 8. PAYPAL_CLIENT_ID
PAYPAL_CLIENT_ID=your_paypal_client_id_here

### 9. PAYPAL_CLIENT_SECRET (Server-side only)
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

## Important Steps:

1. For EACH variable above:
   - Click "Add New" in Vercel
   - Copy the variable name (e.g., NEXT_PUBLIC_SUPABASE_URL)
   - Copy the value after the = sign
   - Select ALL THREE environments: Production, Preview, Development
   - Click "Save"

2. After adding ALL variables:
   - Go to "Deployments" tab
   - Click the 3 dots on your latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache" 
   - Click "Redeploy"

3. Wait 1-2 minutes for deployment to complete

4. Try logging in again at your Vercel URL
