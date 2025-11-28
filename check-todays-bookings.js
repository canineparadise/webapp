const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkBookings() {
  const today = new Date().toISOString().split('T')[0]
  console.log('Checking bookings for:', today)

  // Check subscription bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', today)

  console.log('\n=== SUBSCRIPTION BOOKINGS ===')
  if (bookingsError) {
    console.log('Error:', bookingsError.message)
  } else {
    console.log('Found:', bookings?.length || 0, 'bookings')
    bookings?.forEach(b => {
      console.log('- Booking ID:', b.id, 'Dog ID:', b.dog_id, 'Status:', b.status)
    })
  }

  // Check individual day bookings
  const { data: individualBookings, error: individualError } = await supabase
    .from('individual_day_bookings')
    .select('*')
    .eq('booking_date', today)

  console.log('\n=== INDIVIDUAL DAY BOOKINGS ===')
  if (individualError) {
    console.log('Error:', individualError.message)
  } else {
    console.log('Found:', individualBookings?.length || 0, 'bookings')
    individualBookings?.forEach(b => {
      console.log('- Booking ID:', b.id, 'Dog ID:', b.dog_id, 'Status:', b.status)
    })
  }

  // Show recent bookings
  const { data: recentBookings, error: recentError } = await supabase
    .from('bookings')
    .select('booking_date')
    .order('booking_date', { ascending: false })
    .limit(10)

  console.log('\n=== RECENT BOOKING DATES ===')
  if (!recentError && recentBookings) {
    const uniqueDates = [...new Set(recentBookings.map(b => b.booking_date))].slice(0, 5)
    console.log('Most recent booking dates:', uniqueDates)
  }
}

checkBookings().catch(console.error)
