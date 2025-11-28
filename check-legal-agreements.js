const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkLegalAgreements() {
  const { data: agreements, error } = await supabase
    .from('legal_agreements')
    .select('*')
    .limit(5)

  if (error) {
    console.log('Error:', error.message)
    return
  }

  console.log('=== LEGAL AGREEMENTS ===')
  console.log('Total found:', agreements?.length || 0)
  agreements?.forEach(a => {
    console.log('\nUser ID:', a.user_id)
    console.log('Terms Accepted:', a.terms_accepted)
    console.log('Injury Waiver Agreed:', a.injury_waiver_agreed)
    console.log('Photo Permission Agreed:', a.photo_permission_agreed)
    console.log('Recurring Billing Agreed:', a.recurring_billing_agreed)
    console.log('Password Policy Agreed:', a.password_policy_agreed)
    console.log('Signed At:', a.signed_at)
  })
}

checkLegalAgreements().catch(console.error)
