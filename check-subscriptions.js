const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkSubscriptions() {
  console.log('=== CHECKING SUBSCRIPTIONS TABLE ===\n')

  // Check subscriptions table
  const { data: subsData, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(10)

  if (subsError) {
    console.log('❌ subscriptions table error:', subsError.message)
  } else {
    console.log('Found:', subsData?.length || 0, 'subscription records')
    if (subsData && subsData.length > 0) {
      console.log('\nColumns in subscriptions table:')
      Object.keys(subsData[0]).sort().forEach(key => {
        console.log(`  - ${key}`)
      })

      console.log('\nSample subscriptions:')
      subsData.forEach(s => {
        console.log(`  - User ID: ${s.user_id}, Status: ${s.status}, Tier: ${s.subscription_tier || s.tier || 'N/A'}`)
      })
    }
  }

  console.log('\n=== CHECKING PROFILES TABLE FOR SUBSCRIPTION INFO ===\n')

  // Check if profiles has subscription columns
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5)

  if (profileError) {
    console.log('Error:', profileError.message)
  } else if (profileData && profileData.length > 0) {
    console.log('Subscription-related columns in profiles:')
    Object.keys(profileData[0]).sort().forEach(key => {
      if (key.includes('subscription') || key.includes('tier')) {
        console.log(`  - ${key}: ${typeof profileData[0][key]}`)
      }
    })

    console.log('\nSample profiles with subscription info:')
    profileData.forEach(p => {
      const subStatus = p.subscription_status || p.subscription_tier || p.tier || 'None'
      console.log(`  - ${p.first_name} ${p.last_name}: ${subStatus}`)
    })
  }

  console.log('\n=== CHECKING BOOKINGS TABLE ===\n')

  // Check bookings (subscription bookings)
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .limit(5)

  if (bookingsError) {
    console.log('Error:', bookingsError.message)
  } else {
    console.log('Found:', bookingsData?.length || 0, 'confirmed bookings')
    if (bookingsData && bookingsData.length > 0) {
      console.log('\nSample booking:')
      const b = bookingsData[0]
      console.log(`  User ID: ${b.user_id}`)
      console.log(`  Dog ID: ${b.dog_id}`)
      console.log(`  Date: ${b.booking_date}`)
      console.log(`  Status: ${b.status}`)
      console.log(`  Session Type: ${b.session_type}`)
    }
  }
}

checkSubscriptions().catch(console.error)
