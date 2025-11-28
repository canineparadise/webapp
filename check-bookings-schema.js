const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkSchema() {
  // Get a sample booking to see all columns
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .limit(1)
    .single()

  console.log('=== BOOKINGS TABLE COLUMNS ===')
  if (booking) {
    Object.keys(booking).sort().forEach(key => {
      console.log(`- ${key}: ${typeof booking[key]} = ${booking[key]}`)
    })
  }
}

checkSchema().catch(console.error)
