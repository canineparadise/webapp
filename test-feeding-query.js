const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://hmlmazrdoglqfictjcnm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbG1henJkb2dscWZpY3RqY25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkyMDk0OSwiZXhwIjoyMDczNDk2OTQ5fQ.r-CdXvHM8e5HRAgnNOHuikXaIBpr-sBacVNAHR-FDRs'
)

async function testFeedingQuery() {
  const currentDate = new Date().toISOString().split('T')[0]
  console.log('Testing feeding query for:', currentDate)

  // Step 1: Get bookings that need feeding
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      id,
      dog_id,
      needs_breakfast,
      needs_lunch,
      needs_dinner,
      breakfast_completed,
      breakfast_completed_at,
      lunch_completed,
      lunch_completed_at,
      dinner_completed,
      dinner_completed_at
    `)
    .eq('booking_date', currentDate)
    .eq('status', 'confirmed')
    .or('needs_breakfast.eq.true,needs_lunch.eq.true,needs_dinner.eq.true')

  console.log('\n=== BOOKINGS WITH MEAL REQUIREMENTS ===')
  console.log('Error:', bookingsError)
  console.log('Found:', bookingsData?.length || 0, 'bookings')
  bookingsData?.forEach(b => {
    console.log('- Booking:', b.id)
    console.log('  Dog ID:', b.dog_id)
    console.log('  Needs Breakfast:', b.needs_breakfast)
    console.log('  Needs Lunch:', b.needs_lunch)
    console.log('  Needs Dinner:', b.needs_dinner)
  })

  if (!bookingsData || bookingsData.length === 0) {
    console.log('\n❌ No bookings found with meal requirements!')
    return
  }

  // Step 2: Get dog IDs
  const allDogIds = Array.from(new Set(bookingsData.map(b => b.dog_id)))
  console.log('\n=== DOG IDS ===')
  console.log('Dog IDs:', allDogIds)

  // Step 3: Get dogs data
  const { data: dogsData, error: dogsError } = await supabase
    .from('dogs')
    .select(`
      id,
      name,
      photo_url,
      feeding_schedule,
      dietary_requirements,
      profiles:owner_id (first_name, last_name)
    `)
    .in('id', allDogIds)

  console.log('\n=== DOGS DATA ===')
  console.log('Error:', dogsError)
  console.log('Found:', dogsData?.length || 0, 'dogs')
  dogsData?.forEach(d => {
    console.log('- Dog:', d.name, 'ID:', d.id)
    console.log('  Owner:', d.profiles)
    console.log('  Feeding Schedule:', d.feeding_schedule)
    console.log('  Dietary Requirements:', d.dietary_requirements)
  })

  // Step 4: Process into breakfast/lunch/dinner
  const breakfast = []
  const lunch = []
  const dinner = []

  bookingsData.forEach(booking => {
    const dog = dogsData?.find(d => d.id === booking.dog_id)
    if (!dog) {
      console.log('\n❌ Dog not found for booking:', booking.id, 'dog_id:', booking.dog_id)
      return
    }

    const owner = Array.isArray(dog.profiles) ? dog.profiles[0] : dog.profiles

    if (booking.needs_breakfast) breakfast.push({ dog_name: dog.name, owner_name: `${owner?.first_name} ${owner?.last_name}` })
    if (booking.needs_lunch) lunch.push({ dog_name: dog.name, owner_name: `${owner?.first_name} ${owner?.last_name}` })
    if (booking.needs_dinner) dinner.push({ dog_name: dog.name, owner_name: `${owner?.first_name} ${owner?.last_name}` })
  })

  console.log('\n=== FEEDING SCHEDULE RESULTS ===')
  console.log('Breakfast:', breakfast.length, breakfast)
  console.log('Lunch:', lunch.length, lunch)
  console.log('Dinner:', dinner.length, dinner)
}

testFeedingQuery().catch(console.error)
