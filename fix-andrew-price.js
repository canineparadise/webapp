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

async function fixAndrewPrice() {
  try {
    // Get Andrew's subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'andrew_carrick@yahoo.co.uk')
      .single();

    if (!profile) {
      console.error('User not found');
      return;
    }

    // Correct calculation: £160 - 10% = £144
    const correctPrice = 144.00;
    const correctPricePerDay = correctPrice / 4; // £36 per day

    // Update the subscription with correct price
    const { data: updated, error } = await supabase
      .from('subscriptions')
      .update({
        monthly_price: correctPrice,
        price_per_day: correctPricePerDay,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .select();

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('Subscription updated successfully!');
      console.log('New monthly price:', correctPrice);
      console.log('New price per day:', correctPricePerDay);
      console.log('Updated subscription:', updated);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixAndrewPrice();
