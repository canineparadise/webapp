import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface AuditResult {
  totalDbSubscriptions: number
  totalStripeSubscriptions: number
  matching: Array<{
    db_id: string
    stripe_id: string
    user_email: string
    dog_name: string
    status: string
  }>
  missingStripeId: Array<{
    db_id: string
    user_email: string
    dog_name: string
    created_at: string
  }>
  stripeNotInDb: Array<{
    stripe_id: string
    customer_email: string
    status: string
    created: number
  }>
  statusMismatch: Array<{
    db_id: string
    stripe_id: string
    user_email: string
    db_status: string
    stripe_status: string
  }>
  summary: {
    healthScore: number
    issues: string[]
  }
}

async function auditSubscriptions(): Promise<AuditResult> {
  console.log('🔍 Starting subscription audit...\n')

  // Check Stripe key mode
  const stripeKey = process.env.STRIPE_SECRET_KEY || ''
  const isTestMode = stripeKey.startsWith('sk_test_')
  const isLiveMode = stripeKey.startsWith('sk_live_')

  console.log('🔑 Stripe Configuration')
  console.log('─────────────────────────────────────────────────────')
  console.log(`Mode: ${isTestMode ? '🧪 TEST MODE' : isLiveMode ? '🔴 LIVE MODE' : '❓ UNKNOWN'}`)
  console.log(`Key: ${stripeKey.substring(0, 12)}...`)
  console.log()

  const result: AuditResult = {
    totalDbSubscriptions: 0,
    totalStripeSubscriptions: 0,
    matching: [],
    missingStripeId: [],
    stripeNotInDb: [],
    statusMismatch: [],
    summary: {
      healthScore: 0,
      issues: []
    }
  }

  // Step 1: Fetch all subscriptions from database
  console.log('📊 Fetching subscriptions from database...')
  const { data: dbSubscriptions, error: dbError } = await supabase
    .from('subscriptions')
    .select(`
      id,
      user_id,
      dog_id,
      stripe_subscription_id,
      is_active,
      days_remaining,
      days_included,
      created_at,
      profiles!user_id(email, first_name, last_name),
      dogs(name)
    `)
    .order('created_at', { ascending: false })

  if (dbError) {
    console.error('❌ Error fetching database subscriptions:', dbError)
    throw dbError
  }

  result.totalDbSubscriptions = dbSubscriptions?.length || 0
  console.log(`   Found ${result.totalDbSubscriptions} subscriptions in database\n`)

  // Check if DB has subscriptions with Stripe IDs
  const dbWithStripeIds = dbSubscriptions?.filter(s => s.stripe_subscription_id) || []
  if (dbWithStripeIds.length > 0 && isTestMode) {
    console.log('⚠️  WARNING: Found subscriptions with Stripe IDs in database, but using TEST mode key')
    console.log('   If these are live subscriptions, you need to use a LIVE mode Stripe key!\n')
  }

  // Step 2: Fetch all subscriptions from Stripe
  console.log('💳 Fetching subscriptions from Stripe...')
  const stripeSubscriptions: Stripe.Subscription[] = []

  try {
    for await (const subscription of stripe.subscriptions.list({
      limit: 100,
      expand: ['data.customer']
    })) {
      stripeSubscriptions.push(subscription)
    }

    result.totalStripeSubscriptions = stripeSubscriptions.length
    console.log(`   Found ${result.totalStripeSubscriptions} subscriptions in Stripe\n`)

    if (result.totalStripeSubscriptions === 0 && dbWithStripeIds.length > 0) {
      console.log('⚠️  WARNING: No subscriptions found in Stripe, but database has subscription IDs!')
      console.log('   This usually means you\'re using the wrong Stripe key (test vs live mode)\n')
    }
  } catch (stripeError) {
    console.error('❌ Error fetching Stripe subscriptions:', stripeError)
    throw stripeError
  }

  // Step 3: Create lookup maps
  const stripeMap = new Map<string, Stripe.Subscription>()
  stripeSubscriptions.forEach(sub => {
    stripeMap.set(sub.id, sub)
  })

  const dbStripeIds = new Set<string>()

  // Step 4: Analyze each database subscription
  console.log('🔬 Analyzing subscriptions...\n')

  for (const dbSub of dbSubscriptions || []) {
    const userEmail = (dbSub.profiles as any)?.email || 'Unknown'
    const dogName = (dbSub.dogs as any)?.name || 'Unknown Dog'

    // Check if subscription has Stripe ID
    if (!dbSub.stripe_subscription_id) {
      result.missingStripeId.push({
        db_id: dbSub.id,
        user_email: userEmail,
        dog_name: dogName,
        created_at: dbSub.created_at
      })
      continue
    }

    dbStripeIds.add(dbSub.stripe_subscription_id)

    // Check if Stripe subscription exists
    const stripeSub = stripeMap.get(dbSub.stripe_subscription_id)

    if (!stripeSub) {
      result.stripeNotInDb.push({
        stripe_id: dbSub.stripe_subscription_id,
        customer_email: userEmail,
        status: 'Not found in Stripe',
        created: 0
      })
      continue
    }

    // Check status consistency
    const dbIsActive = dbSub.is_active
    const stripeIsActive = stripeSub.status === 'active' || stripeSub.status === 'trialing'

    if (dbIsActive !== stripeIsActive) {
      result.statusMismatch.push({
        db_id: dbSub.id,
        stripe_id: dbSub.stripe_subscription_id,
        user_email: userEmail,
        db_status: dbIsActive ? 'active' : 'inactive',
        stripe_status: stripeSub.status
      })
    } else {
      // Matching subscription
      result.matching.push({
        db_id: dbSub.id,
        stripe_id: dbSub.stripe_subscription_id,
        user_email: userEmail,
        dog_name: dogName,
        status: stripeSub.status
      })
    }
  }

  // Step 5: Find Stripe subscriptions not in database
  for (const stripeSub of stripeSubscriptions) {
    if (!dbStripeIds.has(stripeSub.id)) {
      const customer = stripeSub.customer as Stripe.Customer
      result.stripeNotInDb.push({
        stripe_id: stripeSub.id,
        customer_email: customer?.email || 'Unknown',
        status: stripeSub.status,
        created: stripeSub.created
      })
    }
  }

  // Step 6: Calculate health score and generate summary
  const totalIssues =
    result.missingStripeId.length +
    result.stripeNotInDb.length +
    result.statusMismatch.length

  result.summary.healthScore = Math.round(
    ((result.matching.length / result.totalDbSubscriptions) * 100) || 0
  )

  if (result.missingStripeId.length > 0) {
    result.summary.issues.push(
      `${result.missingStripeId.length} subscription(s) in database without Stripe ID`
    )
  }

  if (result.stripeNotInDb.length > 0) {
    result.summary.issues.push(
      `${result.stripeNotInDb.length} subscription(s) in Stripe not found in database`
    )
  }

  if (result.statusMismatch.length > 0) {
    result.summary.issues.push(
      `${result.statusMismatch.length} subscription(s) with status mismatch`
    )
  }

  return result
}

// Print formatted audit report
function printAuditReport(result: AuditResult) {
  console.log('═══════════════════════════════════════════════════════')
  console.log('           SUBSCRIPTION AUDIT REPORT')
  console.log('═══════════════════════════════════════════════════════\n')

  console.log('📈 OVERVIEW')
  console.log('─────────────────────────────────────────────────────')
  console.log(`Database Subscriptions:     ${result.totalDbSubscriptions}`)
  console.log(`Stripe Subscriptions:       ${result.totalStripeSubscriptions}`)
  console.log(`Matching Records:           ${result.matching.length}`)
  console.log(`Health Score:               ${result.summary.healthScore}%\n`)

  if (result.summary.issues.length === 0) {
    console.log('✅ PERFECT MATCH - No issues found!\n')
  } else {
    console.log('⚠️  ISSUES FOUND:')
    result.summary.issues.forEach(issue => {
      console.log(`   • ${issue}`)
    })
    console.log()
  }

  // Missing Stripe IDs
  if (result.missingStripeId.length > 0) {
    console.log('❌ SUBSCRIPTIONS WITHOUT STRIPE ID')
    console.log('─────────────────────────────────────────────────────')
    result.missingStripeId.forEach(sub => {
      console.log(`   • ${sub.user_email} - ${sub.dog_name}`)
      console.log(`     DB ID: ${sub.db_id}`)
      console.log(`     Created: ${new Date(sub.created_at).toLocaleDateString()}`)
      console.log()
    })
  }

  // Stripe not in DB
  if (result.stripeNotInDb.length > 0) {
    console.log('❌ STRIPE SUBSCRIPTIONS NOT IN DATABASE')
    console.log('─────────────────────────────────────────────────────')
    result.stripeNotInDb.forEach(sub => {
      console.log(`   • ${sub.customer_email}`)
      console.log(`     Stripe ID: ${sub.stripe_id}`)
      console.log(`     Status: ${sub.status}`)
      if (sub.created > 0) {
        console.log(`     Created: ${new Date(sub.created * 1000).toLocaleDateString()}`)
      }
      console.log()
    })
  }

  // Status mismatches
  if (result.statusMismatch.length > 0) {
    console.log('⚠️  STATUS MISMATCHES')
    console.log('─────────────────────────────────────────────────────')
    result.statusMismatch.forEach(sub => {
      console.log(`   • ${sub.user_email}`)
      console.log(`     DB ID: ${sub.db_id}`)
      console.log(`     Stripe ID: ${sub.stripe_id}`)
      console.log(`     Database Status: ${sub.db_status}`)
      console.log(`     Stripe Status: ${sub.stripe_status}`)
      console.log()
    })
  }

  // Matching subscriptions (summary only)
  if (result.matching.length > 0) {
    console.log(`✅ MATCHING SUBSCRIPTIONS (${result.matching.length})`)
    console.log('─────────────────────────────────────────────────────')
    console.log('All subscriptions have matching Stripe records with consistent status.\n')
  }

  console.log('═══════════════════════════════════════════════════════\n')
}

// Main execution
async function main() {
  try {
    const result = await auditSubscriptions()
    printAuditReport(result)

    // Exit with error code if issues found
    if (result.summary.issues.length > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Audit failed:', error)
    process.exit(1)
  }
}

main()
