const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkDiscountData() {
  console.log('=== CHECKING discount_code_usage TABLE ===\n')

  // Get all discount usages
  const { data, error } = await supabase
    .from('discount_code_usage')
    .select(`
      *,
      discount_codes (code, type, value, is_active),
      profiles (first_name, last_name, email)
    `)
    .order('used_at', { ascending: false })
    .limit(10)

  if (error) {
    console.log('Error:', error.message)
    console.log('Error details:', error)
  } else {
    console.log('Found:', data?.length || 0, 'discount usages')
    if (data && data.length > 0) {
      console.log('\nSample discount usage:')
      console.log(JSON.stringify(data[0], null, 2))

      console.log('\nAll columns:')
      Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}`)
      })
    } else {
      console.log('No discount usage records found')
    }
  }

  // Also try without joins to see raw structure
  console.log('\n=== RAW TABLE STRUCTURE ===\n')
  const { data: rawData, error: rawError } = await supabase
    .from('discount_code_usage')
    .select('*')
    .limit(1)

  if (rawError) {
    console.log('Error:', rawError.message)
  } else if (rawData && rawData.length > 0) {
    console.log('Raw columns:')
    Object.keys(rawData[0]).sort().forEach(key => {
      console.log(`  - ${key}: ${typeof rawData[0][key]}`)
    })
  }
}

checkDiscountData().catch(console.error)
