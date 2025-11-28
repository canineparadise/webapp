const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkSubscriptionTiers() {
  console.log('=== CHECKING subscription_tiers TABLE ===\n')

  const { data: tiersData, error: tiersError } = await supabase
    .from('subscription_tiers')
    .select('*')

  if (tiersError) {
    console.log('❌ subscription_tiers table error:', tiersError.message)
  } else {
    console.log('Found:', tiersData?.length || 0, 'tier records')
    if (tiersData && tiersData.length > 0) {
      console.log('\nAll tiers:')
      tiersData.forEach(t => {
        console.log(`  - ID: ${t.id}`)
        console.log(`    Name: ${t.name || 'N/A'}`)
        console.log(`    Identifier: ${t.identifier || 'N/A'}`)
        console.log(`    Days Included: ${t.days_included || 'N/A'}`)
        console.log('')
      })
    }
  }

  console.log('=== TESTING SUBSCRIPTION JOIN ===\n')

  // Try the actual query from the dashboard
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('tier_id, created_at, subscription_tiers(name, identifier, days_included)')
    .eq('is_active', true)
    .maybeSingle()

  if (subError) {
    console.log('❌ Subscription query error:', subError.message)
    console.log('Full error:', subError)
  } else if (subscription) {
    console.log('✅ Subscription query succeeded!')
    console.log('Result:', JSON.stringify(subscription, null, 2))
  } else {
    console.log('No active subscription found')
  }

  console.log('\n=== CHECKING SUBSCRIPTION DETAILS ===\n')

  // Get subscription without join first
  const { data: rawSub, error: rawError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()

  if (rawError) {
    console.log('Error:', rawError.message)
  } else if (rawSub) {
    console.log('Subscription found:')
    console.log(`  User ID: ${rawSub.user_id}`)
    console.log(`  Tier ID: ${rawSub.tier_id}`)
    console.log(`  Is Active: ${rawSub.is_active}`)
    console.log(`  Start Date: ${rawSub.start_date}`)
    console.log(`  Created At: ${rawSub.created_at}`)
  } else {
    console.log('No active subscription')
  }
}

checkSubscriptionTiers().catch(console.error)
