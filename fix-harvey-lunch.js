const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function fixHarveyLunch() {
  const today = new Date().toISOString().split('T')[0]

  // Update Harvey's booking to set needs_lunch = true
  const { data, error } = await supabase
    .from('bookings')
    .update({ needs_lunch: true })
    .eq('booking_date', today)
    .eq('dog_id', '232f26bb-1601-435a-a577-1250cdef3c1b')
    .select()

  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('✅ Updated Harvey\'s booking to require lunch')
    console.log('Booking ID:', data[0]?.id)
    console.log('Needs Lunch:', data[0]?.needs_lunch)
  }
}

fixHarveyLunch().catch(console.error)
