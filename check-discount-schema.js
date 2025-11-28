const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkDiscountSchema() {
  console.log('=== CHECKING DISCOUNT TRACKING ===\n')

  // Check if discount_code_usage table exists
  const { data: usageData, error: usageError } = await supabase
    .from('discount_code_usage')
    .select('*')
    .limit(1)

  if (usageError) {
    console.log('❌ discount_code_usage table does not exist')
    console.log('Error:', usageError.message)
  } else {
    console.log('✅ discount_code_usage table exists')
    if (usageData && usageData.length > 0) {
      console.log('Sample columns:', Object.keys(usageData[0]))
    }
  }

  console.log('\n=== CHECKING BOOKINGS TABLE FOR DISCOUNT COLUMNS ===\n')

  // Get a booking to see what columns exist
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .limit(1)
    .single()

  if (bookingError) {
    console.log('Error:', bookingError.message)
  } else {
    console.log('All booking columns:')
    Object.keys(bookingData).sort().forEach(key => {
      if (key.includes('discount') || key.includes('code') || key.includes('price') || key.includes('amount')) {
        console.log(`  ✓ ${key}: ${typeof bookingData[key]}`)
      }
    })
  }

  console.log('\n=== CHECKING INDIVIDUAL_DAY_BOOKINGS TABLE ===\n')

  // Check individual_day_bookings
  const { data: individualData, error: individualError } = await supabase
    .from('individual_day_bookings')
    .select('*')
    .limit(1)
    .single()

  if (individualError) {
    console.log('Error:', individualError.message)
  } else {
    console.log('Individual booking columns with discount/price:')
    Object.keys(individualData).sort().forEach(key => {
      if (key.includes('discount') || key.includes('code') || key.includes('price') || key.includes('amount')) {
        console.log(`  ✓ ${key}: ${typeof individualData[key]}`)
      }
    })
  }
}

checkDiscountSchema().catch(console.error)
