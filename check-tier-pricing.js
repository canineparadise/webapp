const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function checkTierPricing() {
  const { data } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('session_type', 'full_day')
    .order('days_included');

  console.log('\n=== Subscription Tier Pricing ===\n');
  data.forEach(t => {
    console.log(`${t.name}:`);
    console.log(`  Monthly: £${t.monthly_price}`);
    console.log(`  Days: ${t.days_included}`);
    console.log(`  Price per day: £${t.price_per_day}`);
    console.log('');
  });
}

checkTierPricing();
