const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function testSubscriptionQuery() {
  console.log('=== TESTING FIXED SUBSCRIPTION QUERY ===\n')

  // Try the fixed query
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('tier_id, created_at, subscription_tiers(name, days_included)')
    .eq('is_active', true)
    .maybeSingle()

  if (subError) {
    console.log('❌ Query failed:', subError.message)
  } else if (subscription) {
    console.log('✅ Query succeeded!')
    console.log('\nSubscription data:')
    console.log(JSON.stringify(subscription, null, 2))

    // Test the tier name generation logic
    if (subscription && subscription.subscription_tiers) {
      const tier = subscription.subscription_tiers
      const tierDays = tier.days_included || ''
      const subscriptionStatus = `${tierDays} Days (Full Day)`
      console.log('\nGenerated subscription status:', subscriptionStatus)
    }
  } else {
    console.log('No active subscription found')
  }

  console.log('\n=== TESTING ALL USERS QUERY ===\n')

  // Get the user with active subscription
  const { data: userData } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .eq('id', 'c5e76355-e017-4492-80b5-40ad9a93e379')
    .single()

  if (userData) {
    console.log('User found:', userData.first_name, userData.last_name)

    const { data: userSub, error: userSubError } = await supabase
      .from('subscriptions')
      .select('tier_id, created_at, subscription_tiers(name, days_included)')
      .eq('user_id', userData.id)
      .eq('is_active', true)
      .maybeSingle()

    if (userSubError) {
      console.log('❌ User subscription query error:', userSubError.message)
    } else if (userSub) {
      console.log('✅ User has active subscription!')
      console.log('Tier:', userSub.subscription_tiers?.name)
      console.log('Days:', userSub.subscription_tiers?.days_included)

      const tier = userSub.subscription_tiers
      const subscriptionStatus = `${tier.days_included} Days (Full Day)`
      console.log('Status:', subscriptionStatus)
    } else {
      console.log('❌ No subscription found for user')
    }
  }
}

testSubscriptionQuery().catch(console.error)
