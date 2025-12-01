import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  // Initialize Stripe lazily to avoid build-time errors
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
  })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
      break

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata, client_reference_id, subscription } = session

  if (!metadata || !client_reference_id) {
    console.error('Missing metadata or client_reference_id')
    return
  }

  const userId = metadata.userId || client_reference_id

  console.log('Processing checkout session:', session.id)
  console.log('Metadata:', JSON.stringify(metadata))

  // NEW FORMAT: dogSubscriptions in metadata
  if (metadata.dogSubscriptions) {
    try {
      const dogSubscriptions = JSON.parse(metadata.dogSubscriptions)
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 30)

      console.log('Creating subscriptions for dogs:', dogSubscriptions)

      for (const dogSub of dogSubscriptions) {
        console.log('Inserting subscription with data:', {
          user_id: userId,
          dog_id: dogSub.dogId,
          tier_id: dogSub.tierId,
          days_included: parseInt(dogSub.daysIncluded),
          days_remaining: parseInt(dogSub.daysIncluded),
          stripe_subscription_id: subscription
        })

        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            dog_id: dogSub.dogId,
            tier_id: dogSub.tierId,
            days_included: parseInt(dogSub.daysIncluded),
            days_remaining: parseInt(dogSub.daysIncluded),
            days_used: 0,
            monthly_price: parseFloat(dogSub.monthlyPrice),
            price_per_day: parseFloat(dogSub.pricePerDay),
            is_active: true,
            auto_renew: true,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            next_billing_date: endDate.toISOString().split('T')[0],
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString(),
            stripe_subscription_id: subscription as string,
            payment_status: 'paid',
          })
          .select()

        if (error) {
          console.error('❌ ERROR creating subscription for dog:', dogSub.dogId)
          console.error('Error details:', JSON.stringify(error, null, 2))
        } else {
          console.log('✅ Subscription created successfully for dog:', dogSub.dogId)
          console.log('Created subscription data:', JSON.stringify(data, null, 2))
        }
      }
    } catch (error) {
      console.error('Error parsing dogSubscriptions:', error)
    }
  } else if (metadata.type === 'subscription') {
    // Handle new subscription
    const { tierId, days } = metadata
    const amount = session.amount_total ? session.amount_total / 100 : 0

    // Calculate end date (30 days from start date)
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 30) // Monthly billing = 30 days

    // Create subscription in database
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier_id: tierId,
        days_included: parseInt(days),
        days_remaining: parseInt(days),
        monthly_price: amount,
        price_per_day: amount / parseInt(days),
        is_active: true,
        auto_renew: true,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        next_billing_date: endDate.toISOString().split('T')[0],
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
        stripe_subscription_id: subscription as string,
        payment_status: 'paid',
      })

    if (error) {
      console.error('Error creating subscription:', error)
    } else {
      console.log('Subscription created successfully for user:', userId)
    }

  } else if (metadata.type === 'extra_days') {
    // Handle extra days purchase
    const { subscriptionId, numDays } = metadata

    // Add days to existing subscription
    const { error } = await supabase.rpc('add_subscription_days', {
      p_subscription_id: subscriptionId,
      p_days_to_add: parseInt(numDays)
    })

    if (error) {
      console.error('Error adding extra days:', error)

      // Fallback: manual update
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('days_remaining')
        .eq('id', subscriptionId)
        .single()

      if (sub) {
        await supabase
          .from('subscriptions')
          .update({
            days_remaining: sub.days_remaining + parseInt(numDays)
          })
          .eq('id', subscriptionId)
      }
    } else {
      console.log('Extra days added successfully for subscription:', subscriptionId)
    }
  } else if (metadata.type === 'individual_days') {
    // Handle individual day bookings
    const { dogId, dates, pricePerDay, needsBreakfast, needsLunch, needsDinner, specialInstructions } = metadata
    const datesArray = dates.split(',')

    // Get dog details
    const { data: dog } = await supabase
      .from('dogs')
      .select('size')
      .eq('id', dogId)
      .single()

    if (!dog) {
      console.error('Dog not found for individual day booking')
      return
    }

    // Create individual day bookings
    const bookings = datesArray.map((date: string) => ({
      user_id: userId,
      dog_id: dogId,
      booking_date: date,
      dog_size: dog.size,
      price: parseFloat(pricePerDay),
      payment_status: 'paid',
      payment_method: 'stripe',
      stripe_session_id: session.id,
      status: 'confirmed',
      needs_breakfast: needsBreakfast === 'true',
      needs_lunch: needsLunch === 'true',
      needs_dinner: needsDinner === 'true',
      special_instructions: specialInstructions || null,
    }))

    const { error } = await supabase
      .from('individual_day_bookings')
      .insert(bookings)

    if (error) {
      console.error('Error creating individual day bookings:', error)
    } else {
      console.log('Individual day bookings created successfully for user:', userId)
    }
  } else if (metadata.type === 'subscription_extra_days') {
    // Handle subscription extra days purchase with bookings
    const {
      subscriptionId,
      numExtraDays,
      pricePerDay,
      selectedDates,
      selectedDogs,
      mealBreakfast,
      mealLunch,
      mealDinner,
      specialNotes,
      includedDays
    } = metadata

    const datesArray = selectedDates.split(',')
    const dogsArray = selectedDogs.split(',')

    // Get subscription details
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('days_remaining, days_used')
      .eq('id', subscriptionId)
      .single()

    if (!subscription) {
      console.error('Subscription not found for extra days booking')
      return
    }

    // Build meal requirements text
    const mealRequirements = []
    if (mealBreakfast === 'true') mealRequirements.push('Breakfast')
    if (mealLunch === 'true') mealRequirements.push('Lunch')
    if (mealDinner === 'true') mealRequirements.push('Dinner')
    const mealText = mealRequirements.length > 0
      ? `MEALS REQUIRED: ${mealRequirements.join(', ')}. `
      : ''
    const fullInstructions = mealText + (specialNotes || '')

    const includedDaysCount = parseInt(includedDays)
    const daysRemaining = subscription.days_remaining || 0

    // Split dates into included (FREE) and extra (PAID)
    const includedDates = datesArray.slice(0, includedDaysCount)
    const extraDates = datesArray.slice(includedDaysCount)

    // Create bookings for included days (FREE - use subscription)
    if (includedDates.length > 0) {
      const includedBookings = includedDates.map((date: string) => ({
        user_id: userId,
        dog_ids: dogsArray,
        booking_date: date,
        total_dogs: dogsArray.length,
        daily_rate: parseFloat(pricePerDay),
        total_amount: parseFloat(pricePerDay) * dogsArray.length,
        status: 'confirmed',
        payment_status: 'paid',
        subscription_id: subscriptionId,
        is_subscription_booking: true,
        special_instructions: fullInstructions.trim() || null,
        needs_breakfast: mealBreakfast === 'true',
        needs_lunch: mealLunch === 'true',
        needs_dinner: mealDinner === 'true'
      }))

      const { error: includedError } = await supabase
        .from('bookings')
        .insert(includedBookings)

      if (includedError) {
        console.error('Error creating included day bookings:', includedError)
      }

      // Update subscription days remaining for included days
      await supabase
        .from('subscriptions')
        .update({
          days_remaining: daysRemaining - includedDates.length,
          days_used: (subscription.days_used || 0) + includedDates.length
        })
        .eq('id', subscriptionId)
    }

    // Create bookings for extra days (PAID - charged at subscription rate)
    if (extraDates.length > 0) {
      const extraBookings = extraDates.map((date: string) => ({
        user_id: userId,
        dog_ids: dogsArray,
        booking_date: date,
        total_dogs: dogsArray.length,
        daily_rate: parseFloat(pricePerDay),
        total_amount: parseFloat(pricePerDay) * dogsArray.length,
        status: 'confirmed',
        payment_status: 'paid',
        subscription_id: subscriptionId,
        is_subscription_booking: false, // Extra days, not subscription days
        stripe_session_id: session.id,
        special_instructions: fullInstructions.trim() || null,
        needs_breakfast: mealBreakfast === 'true',
        needs_lunch: mealLunch === 'true',
        needs_dinner: mealDinner === 'true'
      }))

      const { error: extraError } = await supabase
        .from('bookings')
        .insert(extraBookings)

      if (extraError) {
        console.error('Error creating extra day bookings:', extraError)
      } else {
        console.log('Extra day bookings created successfully:', extraDates.length)
      }
    }

    console.log(`Subscription extra days handled: ${includedDates.length} included, ${extraDates.length} extra`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as inactive
  const { error } = await supabase
    .from('subscriptions')
    .update({
      is_active: false,
      auto_renew: false
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error deleting subscription:', error)
  } else {
    console.log('Subscription marked as inactive:', subscription.id)
  }
}
