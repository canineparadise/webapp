/**
 * Find customers who paid for individual day bookings
 * Run with: node scripts/find-individual-day-customers.js
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function findIndividualDayCustomers() {
  console.log('Looking for individual day payments in financial_transactions...\n')

  // Find all individual day transactions
  const { data: transactions, error: txError } = await supabase
    .from('financial_transactions')
    .select('*')
    .or('transaction_type.eq.individual_days,description.ilike.%individual%')
    .order('created_at', { ascending: false })

  if (txError) {
    console.error('Error fetching transactions:', txError)
  } else {
    console.log('Individual Day Transactions:')
    console.log('='.repeat(60))
    if (transactions && transactions.length > 0) {
      transactions.forEach(tx => {
        console.log(`User: ${tx.user_id}`)
        console.log(`Amount: £${tx.amount}`)
        console.log(`Type: ${tx.transaction_type}`)
        console.log(`Description: ${tx.description}`)
        console.log(`Created: ${tx.created_at}`)
        console.log('-'.repeat(40))
      })
    } else {
      console.log('No individual day transactions found')
    }
  }

  // Also check for any transactions around £50
  console.log('\n\nTransactions around £50:')
  console.log('='.repeat(60))

  const { data: fiftyTransactions, error: fiftyError } = await supabase
    .from('financial_transactions')
    .select('*')
    .gte('amount', 45)
    .lte('amount', 55)
    .order('created_at', { ascending: false })

  if (fiftyError) {
    console.error('Error:', fiftyError)
  } else if (fiftyTransactions && fiftyTransactions.length > 0) {
    fiftyTransactions.forEach(tx => {
      console.log(`User: ${tx.user_id}`)
      console.log(`Amount: £${tx.amount}`)
      console.log(`Type: ${tx.transaction_type}`)
      console.log(`Description: ${tx.description}`)
      console.log(`Created: ${tx.created_at}`)
      console.log('-'.repeat(40))
    })
  } else {
    console.log('No transactions around £50 found')
  }

  // Check all financial transactions
  console.log('\n\nAll Financial Transactions (last 20):')
  console.log('='.repeat(60))

  const { data: allTx, error: allError } = await supabase
    .from('financial_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (allError) {
    console.error('Error:', allError)
  } else if (allTx && allTx.length > 0) {
    allTx.forEach(tx => {
      console.log(`User: ${tx.user_id}`)
      console.log(`Amount: £${tx.amount}`)
      console.log(`Type: ${tx.transaction_type}`)
      console.log(`Description: ${tx.description}`)
      console.log(`Status: ${tx.status}`)
      console.log(`Stripe: ${tx.stripe_payment_intent_id || 'N/A'}`)
      console.log(`Created: ${tx.created_at}`)
      console.log('-'.repeat(40))
    })
  } else {
    console.log('No financial transactions found in database')
  }

  // Check individual_day_bookings table
  console.log('\n\nIndividual Day Bookings Table:')
  console.log('='.repeat(60))

  const { data: bookings, error: bookingError } = await supabase
    .from('individual_day_bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (bookingError) {
    console.error('Error:', bookingError)
  } else if (bookings && bookings.length > 0) {
    bookings.forEach(b => {
      console.log(`ID: ${b.id}`)
      console.log(`User: ${b.user_id}`)
      console.log(`Dog: ${b.dog_id}`)
      console.log(`Date: ${b.booking_date}`)
      console.log(`Amount: £${b.amount_paid}`)
      console.log(`Status: ${b.payment_status}`)
      console.log(`Created: ${b.created_at}`)
      console.log('-'.repeat(40))
    })
  } else {
    console.log('No individual day bookings found')
  }

  // Check profiles for the 4 specific users
  const userIds = [
    '85b6400f-c923-4c8c-9431-58d2793886f8',
    '4fb64361-f6f0-40d4-acb2-4ab37cb63a28',
    '58e7ff44-385d-422a-a6ab-0955ce9f7c7b',
    '71fac134-8493-4795-891a-b8dc9a71dcbb'
  ]

  console.log('\n\nSpecific User Profiles:')
  console.log('='.repeat(60))

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, is_vip_member, vip_badge_type')
    .in('id', userIds)

  if (profileError) {
    console.error('Error:', profileError)
  } else if (profiles && profiles.length > 0) {
    profiles.forEach(p => {
      console.log(`${p.first_name} ${p.last_name} (${p.email})`)
      console.log(`ID: ${p.id}`)
      console.log(`VIP: ${p.is_vip_member ? 'Yes - ' + p.vip_badge_type : 'No'}`)
      console.log('-'.repeat(40))
    })
  } else {
    console.log('No matching profiles found for specified user IDs')
  }

  // Check all tables that might have payment data
  console.log('\n\nChecking all payment-related data for these users...')

  // Subscriptions
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .in('user_id', userIds)
  console.log(`Subscriptions: ${subs?.length || 0} records`)

  // Extra days purchases
  const { data: extras } = await supabase
    .from('extra_days_purchases')
    .select('*')
    .in('user_id', userIds)
  console.log(`Extra days purchases: ${extras?.length || 0} records`)

  // Discount code usage
  const { data: discounts } = await supabase
    .from('discount_code_usage')
    .select('*')
    .in('user_id', userIds)
  console.log(`Discount code usage: ${discounts?.length || 0} records`)

  // Assessment bookings if table exists
  const { data: assessments } = await supabase
    .from('assessment_bookings')
    .select('*')
    .in('user_id', userIds)
  console.log(`Assessment bookings: ${assessments?.length || 0} records`)
}

findIndividualDayCustomers().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
