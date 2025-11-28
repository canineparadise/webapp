const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkFirst50Code() {
  console.log('=== CHECKING FIRST50 DISCOUNT CODE ===\n')

  const { data: code, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', 'FIRST50')
    .single()

  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('FIRST50 Code Details:')
    console.log(JSON.stringify(code, null, 2))
  }
}

checkFirst50Code().catch(console.error)
