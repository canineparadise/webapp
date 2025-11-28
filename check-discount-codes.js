const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkDiscountCodes() {
  console.log('=== CHECKING discount_codes TABLE ===\n')

  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .limit(5)

  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('Found:', data?.length || 0, 'discount codes')
    if (data && data.length > 0) {
      console.log('\nColumns in discount_codes:')
      Object.keys(data[0]).sort().forEach(key => {
        console.log(`  - ${key}: ${typeof data[0][key]} = ${data[0][key]}`)
      })

      console.log('\nAll discount codes:')
      data.forEach(d => {
        console.log(`  ${d.code} - Active: ${d.is_active}`)
      })
    } else {
      console.log('No discount codes found')
    }
  }

  console.log('\n=== CHECKING discount_code_usage TABLE ===\n')

  const { data: usageData, error: usageError } = await supabase
    .from('discount_code_usage')
    .select('*')
    .limit(5)

  if (usageError) {
    console.log('Error:', usageError.message)
  } else {
    console.log('Found:', usageData?.length || 0, 'usage records')
    if (usageData && usageData.length > 0) {
      console.log('\nColumns in discount_code_usage:')
      Object.keys(usageData[0]).sort().forEach(key => {
        console.log(`  - ${key}`)
      })
    } else {
      console.log('✅ Table exists but is empty (no discount codes have been used yet)')
    }
  }
}

checkDiscountCodes().catch(console.error)
