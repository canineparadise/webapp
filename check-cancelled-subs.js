const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkCancelledSubscriptions() {
  console.log('=== CHECKING CANCELLED SUBSCRIPTIONS ===\n')

  // Check for any cancelled subscriptions
  const { data: cancelledSubs, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('cancellation_requested', true)

  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('Found:', cancelledSubs?.length || 0, 'cancelled subscriptions')
    if (cancelledSubs && cancelledSubs.length > 0) {
      cancelledSubs.forEach(sub => {
        console.log('\nSubscription:', sub.id)
        console.log('  User ID:', sub.user_id)
        console.log('  Cancellation Requested:', sub.cancellation_requested)
        console.log('  Cancellation Date:', sub.cancellation_date)
        console.log('  Cancellation Reason:', sub.cancellation_reason || 'N/A')
        console.log('  Is Active:', sub.is_active)
      })
    }
  }

  console.log('\n=== CHECKING FOR SUBSCRIPTIONS WITH NOTICE STATUS ===\n')

  // Check for subscriptions in notice period
  const { data: noticeSubs, error: noticeError } = await supabase
    .from('subscriptions')
    .select('*')
    .not('notice_status', 'is', null)

  if (noticeError) {
    console.log('Error:', noticeError.message)
  } else {
    console.log('Found:', noticeSubs?.length || 0, 'subscriptions with notice status')
    if (noticeSubs && noticeSubs.length > 0) {
      noticeSubs.forEach(sub => {
        console.log('\nSubscription:', sub.id)
        console.log('  User ID:', sub.user_id)
        console.log('  Notice Status:', sub.notice_status)
        console.log('  Notice Given Date:', sub.notice_given_date)
        console.log('  Is Active:', sub.is_active)
      })
    }
  }

  console.log('\n=== CHECKING ALL SUBSCRIPTIONS ===\n')

  // Get all subscriptions to see their status
  const { data: allSubs, error: allError } = await supabase
    .from('subscriptions')
    .select('user_id, is_active, cancellation_requested, notice_status')

  if (allError) {
    console.log('Error:', allError.message)
  } else {
    console.log('Total subscriptions:', allSubs?.length || 0)
    console.log('\nBreakdown:')
    const active = allSubs?.filter(s => s.is_active === true).length || 0
    const cancelled = allSubs?.filter(s => s.cancellation_requested === true).length || 0
    const withNotice = allSubs?.filter(s => s.notice_status !== null).length || 0
    console.log('  Active:', active)
    console.log('  Cancelled:', cancelled)
    console.log('  With Notice:', withNotice)
  }
}

checkCancelledSubscriptions().catch(console.error)
