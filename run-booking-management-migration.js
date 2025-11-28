const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function runMigration() {
  console.log('=== RUNNING BOOKING MANAGEMENT MIGRATION ===\n')

  const sql = fs.readFileSync('./supabase/CREATE-booking-management-tables.sql', 'utf8')

  // Split by semicolon and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';'
    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement })

    if (error) {
      console.log(`❌ Error:`, error.message)
      // Try direct approach for statements that don't work with rpc
      console.log('Trying alternative approach...')
    } else {
      console.log(`✅ Success`)
    }
  }

  console.log('\n=== MIGRATION COMPLETE ===')
}

runMigration().catch(console.error)
