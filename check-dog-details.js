const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkDog() {
  const dogId = '232f26bb-1601-435a-a577-1250cdef3c1b'

  // Check if dog exists
  const { data: dog, error: dogError } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', dogId)
    .single()

  console.log('=== DOG DETAILS ===')
  if (dogError) {
    console.log('Error:', dogError.message)
  } else {
    console.log('Dog found:', dog.name)
    console.log('Breed:', dog.breed)
    console.log('Owner ID:', dog.owner_id)
    console.log('Is Draft:', dog.is_draft)
    console.log('Is Approved:', dog.is_approved)
  }

  // Get booking with full details
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, dogs(*)')
    .eq('id', '3fa8672a-ffed-403e-96ca-36d285362221')
    .single()

  console.log('\n=== BOOKING DETAILS ===')
  if (bookingError) {
    console.log('Error:', bookingError.message)
  } else {
    console.log('Booking Date:', booking.booking_date)
    console.log('Status:', booking.status)
    console.log('Check In Time:', booking.check_in_time)
    console.log('Check Out Time:', booking.check_out_time)
    console.log('Dog:', booking.dogs)
  }
}

checkDog().catch(console.error)
