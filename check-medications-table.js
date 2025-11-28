const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkMedicationsTable() {
  const { data, error } = await supabase
    .from('dog_medications')
    .select('*')
    .limit(1)

  if (error) {
    console.log('❌ dog_medications table does not exist')
    console.log('Error:', error.message)
  } else {
    console.log('✅ dog_medications table exists')
    console.log('Sample data:', data)
  }
}

checkMedicationsTable().catch(console.error)
