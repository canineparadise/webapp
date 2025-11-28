const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function checkTodayBookings() {
  const today = new Date().toISOString().split('T')[0]
  console.log('Checking bookings for:', today, '\n')

  console.log('=== SUBSCRIPTION BOOKINGS ===\n')

  const { data: subscriptionBookings, error: subError } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles:user_id (first_name, last_name, phone),
      dogs:dog_id (id, name, breed, photo_url, owner_id, profiles:owner_id (first_name, last_name, email, phone))
    `)
    .eq('booking_date', today)
    .eq('status', 'confirmed')

  if (subError) {
    console.log('Error:', subError.message)
  } else {
    console.log('Found:', subscriptionBookings?.length || 0, 'subscription bookings')
    if (subscriptionBookings && subscriptionBookings.length > 0) {
      subscriptionBookings.forEach(booking => {
        console.log('\nBooking ID:', booking.id)
        console.log('  Dog:', booking.dogs)
        console.log('  User (profiles):', booking.profiles)
        console.log('  Session Type:', booking.session_type)
      })
    }
  }

  console.log('\n=== INDIVIDUAL DAY BOOKINGS ===\n')

  const { data: individualBookings, error: indError } = await supabase
    .from('individual_day_bookings')
    .select(`
      *,
      profiles:user_id (first_name, last_name, phone),
      dogs:dog_id (id, name, breed, photo_url, owner_id, profiles:owner_id (first_name, last_name, email, phone))
    `)
    .eq('booking_date', today)
    .eq('status', 'confirmed')

  if (indError) {
    console.log('Error:', indError.message)
  } else {
    console.log('Found:', individualBookings?.length || 0, 'individual bookings')
    if (individualBookings && individualBookings.length > 0) {
      individualBookings.forEach(booking => {
        console.log('\nBooking ID:', booking.id)
        console.log('  Dog:', booking.dogs)
        console.log('  User (profiles):', booking.profiles)
        console.log('  Session Type:', booking.session_type)
      })
    }
  }
}

checkTodayBookings().catch(console.error)
