const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function createTables() {
  console.log('=== CREATING BOOKING MANAGEMENT TABLES ===\n')

  // Check if tables already exist
  console.log('Step 1: Checking existing tables...\n')

  const { data: credits, error: creditsError } = await supabase
    .from('booking_credits')
    .select('id')
    .limit(1)

  if (!creditsError) {
    console.log('✅ booking_credits table already exists')
  } else {
    console.log('❌ booking_credits table does not exist:', creditsError.message)
  }

  const { data: refunds, error: refundsError } = await supabase
    .from('refund_requests')
    .select('id')
    .limit(1)

  if (!refundsError) {
    console.log('✅ refund_requests table already exists')
  } else {
    console.log('❌ refund_requests table does not exist:', refundsError.message)
  }

  console.log('\n=== INSTRUCTIONS ===')
  console.log('Please run the following SQL in your Supabase SQL Editor:')
  console.log('File: supabase/CREATE-booking-management-tables.sql')
  console.log('\nOR copy and run this command in Supabase SQL Editor:\n')
  console.log('(Open https://supabase.com/dashboard/project/hmlmazrdoglqfictjcnm/sql/new)\n')
}

createTables().catch(console.error)
