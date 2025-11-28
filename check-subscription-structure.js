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

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSubscriptionStructure() {
  try {
    // Get Andrew's subscription with tier info
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'andrew_carrick@yahoo.co.uk')
      .single();

    if (!profile) {
      console.error('User not found');
      return;
    }

    // Get subscription with tier details
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_tiers(*)
      `)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
    } else {
      console.log('\n=== Andrew\'s Subscription ===');
      console.log('Subscription ID:', subscription.id);
      console.log('Days Included:', subscription.days_included);
      console.log('Days Remaining:', subscription.days_remaining);
      console.log('Monthly Price:', subscription.monthly_price);
      console.log('Price Per Day:', subscription.price_per_day);
      console.log('\nTier Details:');
      console.log('Tier Name:', subscription.subscription_tiers?.name);
      console.log('Tier Days:', subscription.subscription_tiers?.days_included);
      console.log('Tier Price:', subscription.subscription_tiers?.monthly_price);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSubscriptionStructure();
