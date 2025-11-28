const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkSubscriptionFields() {
  console.log('=== CHECKING ANDREW\'S FULL SUBSCRIPTION RECORD ===\n')

  const andrewId = 'c5e76355-e017-4492-80b5-40ad9a93e379'

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', andrewId)
    .single()

  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('Full subscription record:')
    console.log(JSON.stringify(subscription, null, 2))

    console.log('\n=== DISCOUNT-RELATED FIELDS ===')
    const discountFields = Object.keys(subscription).filter(key =>
      key.includes('discount') || key.includes('code') || key.includes('price') || key.includes('amount')
    )

    discountFields.forEach(field => {
      console.log(`${field}: ${subscription[field]}`)
    })
  }
}

checkSubscriptionFields().catch(console.error)
