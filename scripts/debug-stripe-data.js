/**
 * Debug Stripe data
 * Run with: node scripts/debug-stripe-data.js
 */

const { createClient } = require('@supabase/supabase-js')
const Stripe = require('stripe')

require('dotenv').config({ path: '.env.local' })

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY')
  process.exit(1)
}

const stripe = new Stripe(stripeSecretKey)

async function debugStripe() {
  console.log('Stripe Secret Key starts with:', stripeSecretKey.substring(0, 7))
  console.log('Mode:', stripeSecretKey.startsWith('sk_test') ? 'TEST' : 'LIVE')
  console.log('')

  // Check charges
  console.log('=== CHARGES ===')
  try {
    const charges = await stripe.charges.list({ limit: 10 })
    console.log(`Found ${charges.data.length} charges`)
    charges.data.forEach(c => {
      console.log(`- ${c.id}: £${c.amount/100} - ${c.status} - ${new Date(c.created * 1000).toISOString()}`)
      if (c.metadata) console.log('  Metadata:', JSON.stringify(c.metadata))
    })
  } catch (err) {
    console.log('Error fetching charges:', err.message)
  }

  // Check payment intents
  console.log('\n=== PAYMENT INTENTS ===')
  try {
    const paymentIntents = await stripe.paymentIntents.list({ limit: 10 })
    console.log(`Found ${paymentIntents.data.length} payment intents`)
    paymentIntents.data.forEach(pi => {
      console.log(`- ${pi.id}: £${pi.amount/100} - ${pi.status} - ${new Date(pi.created * 1000).toISOString()}`)
      if (pi.metadata) console.log('  Metadata:', JSON.stringify(pi.metadata))
    })
  } catch (err) {
    console.log('Error fetching payment intents:', err.message)
  }

  // Check checkout sessions (all statuses)
  console.log('\n=== CHECKOUT SESSIONS (ALL) ===')
  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 10 })
    console.log(`Found ${sessions.data.length} checkout sessions`)
    sessions.data.forEach(s => {
      console.log(`- ${s.id}: £${(s.amount_total || 0)/100} - ${s.status} - ${s.payment_status}`)
      console.log(`  Email: ${s.customer_details?.email || 'N/A'}`)
      console.log(`  Created: ${new Date(s.created * 1000).toISOString()}`)
      if (s.metadata) console.log('  Metadata:', JSON.stringify(s.metadata))
    })
  } catch (err) {
    console.log('Error fetching checkout sessions:', err.message)
  }

  // Check subscriptions
  console.log('\n=== SUBSCRIPTIONS ===')
  try {
    const subscriptions = await stripe.subscriptions.list({ limit: 10 })
    console.log(`Found ${subscriptions.data.length} subscriptions`)
    subscriptions.data.forEach(sub => {
      console.log(`- ${sub.id}: ${sub.status} - ${new Date(sub.created * 1000).toISOString()}`)
    })
  } catch (err) {
    console.log('Error fetching subscriptions:', err.message)
  }

  // Check customers
  console.log('\n=== CUSTOMERS ===')
  try {
    const customers = await stripe.customers.list({ limit: 10 })
    console.log(`Found ${customers.data.length} customers`)
    customers.data.forEach(c => {
      console.log(`- ${c.email}: ${c.id} - ${new Date(c.created * 1000).toISOString()}`)
    })
  } catch (err) {
    console.log('Error fetching customers:', err.message)
  }

  // Check webhooks
  console.log('\n=== WEBHOOK ENDPOINTS ===')
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 })
    console.log(`Found ${webhooks.data.length} webhook endpoints`)
    webhooks.data.forEach(w => {
      console.log(`- ${w.url}`)
      console.log(`  Status: ${w.status}`)
      console.log(`  Events: ${w.enabled_events.join(', ')}`)
    })
  } catch (err) {
    console.log('Error fetching webhooks:', err.message)
  }
}

debugStripe().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
