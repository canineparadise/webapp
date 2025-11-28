const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  }
});

console.log('NEXT_PUBLIC_SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', envVars.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'NOT FOUND');

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndCreateSubscription() {
  try {
    // Step 1: Get Andrew's user ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('email', 'andrew_carrick@yahoo.co.uk')
      .single();

    if (profileError) {
      console.error('Error finding user:', profileError);
      return;
    }

    console.log('User found:', profile);

    // Step 2: Check if subscription already exists
    const { data: existingSubscription, error: subCheckError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile.id);

    if (subCheckError) {
      console.error('Error checking subscription:', subCheckError);
    } else {
      console.log('Existing subscriptions:', existingSubscription);
    }

    // Step 3: Get the tier ID for "4 Days" (full day)
    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('id, name, days_included, monthly_price, session_type')
      .eq('days_included', 4)
      .eq('session_type', 'full_day')
      .single();

    if (tierError) {
      console.error('Error finding tier:', tierError);
      return;
    }

    console.log('Tier found:', tier);

    // Step 4: Create subscription
    const startDate = new Date();
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const { data: newSubscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: profile.id,
        tier_id: tier.id,
        days_included: 4,
        days_remaining: 4,
        monthly_price: 110.00,
        price_per_day: 27.50,
        is_active: true,
        auto_renew: true,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        next_billing_date: endDate.toISOString().split('T')[0],
        payment_status: 'paid',
      })
      .select();

    if (insertError) {
      console.error('Error creating subscription:', insertError);
    } else {
      console.log('Subscription created successfully:', newSubscription);
    }

    // Step 5: Verify the subscription was created
    const { data: verifySubscription, error: verifyError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_tiers(name),
        profiles(email)
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (verifyError) {
      console.error('Error verifying subscription:', verifyError);
    } else {
      console.log('Verification - Latest subscription:', verifySubscription);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAndCreateSubscription();
