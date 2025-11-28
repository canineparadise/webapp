const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkHarveyFeeding() {
  const today = new Date().toISOString().split('T')[0]

  // Get Harvey's booking for today
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', today)
    .eq('dog_id', '232f26bb-1601-435a-a577-1250cdef3c1b')
    .single()

  console.log('=== HARVEY\'S BOOKING FOR TODAY ===')
  if (bookingError) {
    console.log('Error:', bookingError.message)
  } else {
    console.log('Booking ID:', booking.id)
    console.log('Needs Breakfast:', booking.needs_breakfast)
    console.log('Needs Lunch:', booking.needs_lunch)
    console.log('Needs Dinner:', booking.needs_dinner)
    console.log('Breakfast Completed:', booking.breakfast_completed)
    console.log('Lunch Completed:', booking.lunch_completed)
    console.log('Dinner Completed:', booking.dinner_completed)
  }

  // Get Harvey's dog profile
  const { data: dog, error: dogError } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', '232f26bb-1601-435a-a577-1250cdef3c1b')
    .single()

  console.log('\n=== HARVEY\'S DOG PROFILE ===')
  if (dogError) {
    console.log('Error:', dogError.message)
  } else {
    console.log('Name:', dog.name)
    console.log('Feeding Schedule:', dog.feeding_schedule)
    console.log('Dietary Requirements:', dog.dietary_requirements)
    console.log('Feeding Instructions:', dog.feeding_instructions)
    console.log('Feeding Times:', dog.feeding_times)
  }
}

checkHarveyFeeding().catch(console.error)
