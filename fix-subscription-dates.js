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

async function fixSubscriptionDates() {
  try {
    // Get Andrew's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'andrew_carrick@yahoo.co.uk')
      .single();

    if (!profile) {
      console.error('User not found');
      return;
    }

    // Calculate correct dates
    const startDate = new Date(); // Today
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 28); // 4 weeks = 28 days

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('Start Date:', startDateStr);
    console.log('End Date (4 weeks later):', endDateStr);
    console.log('Next Billing Date:', endDateStr);

    // Update the subscription with correct dates
    const { data: updated, error } = await supabase
      .from('subscriptions')
      .update({
        start_date: startDateStr,
        end_date: endDateStr,
        next_billing_date: endDateStr,
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .select();

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('\n✅ Subscription dates updated successfully!');
      console.log('Updated subscription:', updated[0]);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixSubscriptionDates();
