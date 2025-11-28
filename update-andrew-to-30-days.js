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

async function updateAndrewTo30Days() {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'andrew_carrick@yahoo.co.uk')
      .single();

    if (!profile) {
      console.error('User not found');
      return;
    }

    // Calculate 30 days from today
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30); // 30 days

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('Updating to 30-day billing cycle:');
    console.log('Start Date:', startDateStr);
    console.log('End Date (30 days later):', endDateStr);

    const { data: updated, error } = await supabase
      .from('subscriptions')
      .update({
        end_date: endDateStr,
        next_billing_date: endDateStr,
        current_period_end: endDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .select();

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('\n✅ Subscription updated to 30-day cycle!');
      console.log('New end date:', updated[0].end_date);
      console.log('New next billing date:', updated[0].next_billing_date);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateAndrewTo30Days();
