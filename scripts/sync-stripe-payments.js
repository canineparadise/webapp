/**
 * Sync Stripe payments to database
 * Run with: node scripts/sync-stripe-payments.js
 */

const { createClient } = require('@supabase/supabase-js')
const Stripe = require('stripe')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const stripe = new Stripe(stripeSecretKey)

async function syncStripePayments() {
  console.log('Fetching completed checkout sessions from Stripe...\n')

  // Get all completed checkout sessions
  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
    status: 'complete',
  })

  console.log(`Found ${sessions.data.length} completed sessions\n`)

  let created = 0
  let skipped = 0
  let errors = 0

  for (const session of sessions.data) {
    const metadata = session.metadata || {}
    const amount = session.amount_total ? session.amount_total / 100 : 0

    console.log('='.repeat(60))
    console.log(`Session: ${session.id}`)
    console.log(`Amount: £${amount}`)
    console.log(`Created: ${new Date(session.created * 1000).toISOString()}`)
    console.log(`Email: ${session.customer_details?.email}`)
    console.log(`Type: ${metadata.type || 'unknown'}`)
    console.log(`Metadata:`, metadata)

    // Handle individual_days
    if (metadata.type === 'individual_days') {
      const { userId, dogId, dates, pricePerDay, needsBreakfast, needsLunch, needsDinner, specialInstructions } = metadata

      if (!userId || !dogId || !dates) {
        console.log('Missing required metadata, skipping')
        skipped++
        continue
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from('individual_day_bookings')
        .select('id')
        .eq('stripe_session_id', session.id)

      if (existing && existing.length > 0) {
        console.log('Already exists in database, skipping')
        skipped++
        continue
      }

      // Get dog details
      const { data: dog, error: dogError } = await supabase
        .from('dogs')
        .select('size, name')
        .eq('id', dogId)
        .single()

      if (!dog) {
        console.log(`Dog not found: ${dogId}`)
        errors++
        continue
      }

      console.log(`Dog: ${dog.name} (${dog.size})`)

      const datesArray = dates.split(',').map(d => d.trim())
      console.log(`Dates: ${datesArray.join(', ')}`)

      const bookings = datesArray.map(date => ({
        user_id: userId,
        dog_id: dogId,
        booking_date: date,
        dog_size: dog.size,
        price: parseFloat(pricePerDay || '50'),
        payment_status: 'paid',
        payment_method: 'stripe',
        stripe_session_id: session.id,
        status: 'confirmed',
        needs_breakfast: needsBreakfast === 'true',
        needs_lunch: needsLunch === 'true',
        needs_dinner: needsDinner === 'true',
        special_instructions: specialInstructions || null,
      }))

      const { error: insertError } = await supabase
        .from('individual_day_bookings')
        .insert(bookings)

      if (insertError) {
        console.log(`Insert error: ${insertError.message}`)
        errors++
      } else {
        console.log(`Created ${bookings.length} booking(s)`)
        created += bookings.length

        // Record financial transaction
        const { error: txError } = await supabase.from('financial_transactions').insert({
          user_id: userId,
          transaction_type: 'individual_days',
          amount,
          currency: 'GBP',
          stripe_payment_intent_id: session.payment_intent,
          stripe_customer_id: session.customer,
          payment_method: 'card',
          status: 'completed',
          payment_date: new Date(session.created * 1000).toISOString(),
          description: `Individual day booking - ${datesArray.length} day${datesArray.length > 1 ? 's' : ''} (synced from Stripe)`,
        })

        if (txError) {
          console.log(`Transaction record error: ${txError.message}`)
        } else {
          console.log('Financial transaction recorded')
        }
      }
    }

    // Handle extra_days
    if (metadata.type === 'extra_days' && metadata.extraDaysPurchases) {
      console.log('Extra days purchase detected')

      // Check if payment status was updated
      const { data: existing } = await supabase
        .from('extra_days_purchases')
        .select('*')
        .eq('user_id', metadata.userId)
        .eq('payment_status', 'pending')

      if (existing && existing.length > 0) {
        console.log(`Found ${existing.length} pending extra day purchases, updating to paid`)

        for (const purchase of existing) {
          await supabase
            .from('extra_days_purchases')
            .update({ payment_status: 'paid' })
            .eq('id', purchase.id)
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('SYNC COMPLETE')
  console.log(`Created: ${created} bookings`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Errors: ${errors}`)
  console.log('='.repeat(60))

  // Show final state of individual_day_bookings
  console.log('\n\nAll Individual Day Bookings in Database:')
  const { data: allBookings } = await supabase
    .from('individual_day_bookings')
    .select('*, dogs(name)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (allBookings && allBookings.length > 0) {
    allBookings.forEach(b => {
      console.log(`- ${b.booking_date}: ${b.dogs?.name || 'Unknown'} - £${b.price} - ${b.payment_status}`)
    })
  } else {
    console.log('No individual day bookings found')
  }
}

syncStripePayments().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
