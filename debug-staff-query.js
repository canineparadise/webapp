const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function debugStaffQuery() {
  const currentDate = new Date().toISOString().split('T')[0]
  console.log('Current date:', currentDate)

  // Simulate exact query from staff dashboard
  console.log('\n=== STEP 1: Get today\'s bookings ===')
  const [{ data: bookingsData, error: bookingsError }, { data: individualDayBookingsData, error: individualError }] = await Promise.all([
    supabase
      .from('bookings')
      .select('dog_id')
      .eq('booking_date', currentDate)
      .eq('status', 'confirmed'),
    supabase
      .from('individual_day_bookings')
      .select('dog_id')
      .eq('booking_date', currentDate)
      .eq('status', 'confirmed')
  ])

  console.log('Subscription bookings:', bookingsData)
  console.log('Subscription error:', bookingsError)
  console.log('Individual bookings:', individualDayBookingsData)
  console.log('Individual error:', individualError)

  const subscriptionDogIds = bookingsData?.map(b => b.dog_id) || []
  const individualDayDogIds = individualDayBookingsData?.map(b => b.dog_id) || []
  const todayDogIds = Array.from(new Set([...subscriptionDogIds, ...individualDayDogIds]))

  console.log('\nDog IDs for today:', todayDogIds)

  if (todayDogIds.length === 0) {
    console.log('NO DOG IDS FOUND!')
    return
  }

  console.log('\n=== STEP 2: Get dogs data ===')
  const { data: dogsData, error: dogsError } = await supabase
    .from('dogs')
    .select(`
      *,
      profiles:owner_id (
        first_name,
        last_name,
        phone,
        email
      )
    `)
    .in('id', todayDogIds)
    .eq('is_draft', false)

  console.log('Dogs query error:', dogsError)
  console.log('Dogs found:', dogsData?.length || 0)
  if (dogsData) {
    dogsData.forEach(dog => {
      console.log('- Dog:', dog.name, 'ID:', dog.id, 'Is Draft:', dog.is_draft)
    })
  }

  console.log('\n=== STEP 3: Get bookings with times ===')
  const { data: bookingsWithTimes, error: timesError } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', currentDate)
    .eq('status', 'confirmed')

  console.log('Bookings with times error:', timesError)
  console.log('Bookings with times:', bookingsWithTimes?.length || 0)
  if (bookingsWithTimes) {
    bookingsWithTimes.forEach(booking => {
      console.log('- Booking ID:', booking.id, 'Dog ID:', booking.dog_id, 'Check In:', booking.check_in_time, 'Check Out:', booking.check_out_time)
    })
  }
}

debugStaffQuery().catch(console.error)
