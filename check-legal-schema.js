const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkSchema() {
  const { data, error } = await supabase
    .from('legal_agreements')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.log('Error:', error.message)
    return
  }

  console.log('=== LEGAL AGREEMENTS COLUMNS ===')
  Object.keys(data).sort().forEach(key => {
    console.log(`- ${key}: ${typeof data[key]} = ${data[key]}`)
  })
}

checkSchema().catch(console.error)
