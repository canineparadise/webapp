const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function testNoticeQuery() {
  console.log('=== TESTING NOTICE PERIOD QUERY (OLD SYNTAX) ===\n')

  const today = new Date().toISOString().split('T')[0]

  // Test old syntax
  const { data: oldData, error: oldError } = await supabase
    .from('subscriptions')
    .select(`
      id,
      user_id,
      notice_given_date,
      cancellation_effective_date,
      notice_period_days,
      monthly_price,
      user:profiles!subscriptions_user_id_fkey (
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('cancellation_requested', true)
    .eq('notice_status', 'given')
    .gte('cancellation_effective_date', today)
    .order('cancellation_effective_date', { ascending: true })

  if (oldError) {
    console.log('❌ Old syntax failed:', oldError.message)
  } else {
    console.log('✅ Old syntax worked! Found:', oldData?.length || 0, 'notices')
  }

  console.log('\n=== TESTING NOTICE PERIOD QUERY (NEW SYNTAX) ===\n')

  // Test new syntax
  const { data: newData, error: newError } = await supabase
    .from('subscriptions')
    .select(`
      id,
      user_id,
      notice_given_date,
      cancellation_effective_date,
      notice_period_days,
      monthly_price,
      profiles:user_id (
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('cancellation_requested', true)
    .eq('notice_status', 'given')
    .gte('cancellation_effective_date', today)
    .order('cancellation_effective_date', { ascending: true })

  if (newError) {
    console.log('❌ New syntax failed:', newError.message)
  } else {
    console.log('✅ New syntax worked! Found:', newData?.length || 0, 'notices')
  }

  console.log('\n=== SUMMARY ===\n')
  if (!oldError && !newError) {
    console.log('Both syntaxes work!')
  } else if (!oldError) {
    console.log('Only OLD syntax works (needs update)')
  } else if (!newError) {
    console.log('Only NEW syntax works (already updated)')
  } else {
    console.log('Both failed - check query')
  }
}

testNoticeQuery().catch(console.error)
