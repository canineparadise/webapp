import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper function to process discount code usage and grant VIP membership
async function processDiscountCodeUsage({
  userId,
  discountCode,
  discountCodeId,
  usedFor,
  totalAmount,
  discountAmount,
  finalAmount,
}: {
  userId: string
  discountCode?: string
  discountCodeId?: string
  usedFor: string
  totalAmount: number
  discountAmount: number
  finalAmount: number
}) {
  if (!discountCodeId) return

  try {
    // Record discount code usage
    await supabase.from('discount_code_usage').insert({
      discount_code_id: discountCodeId,
      user_id: userId,
      used_for: usedFor,
      original_amount: totalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
    })

    // Increment usage count
    const { data: discountCodeData } = await supabase
      .from('discount_codes')
      .select('current_uses, code')
      .eq('id', discountCodeId)
      .single()

    if (discountCodeData) {
      await supabase
        .from('discount_codes')
        .update({ current_uses: discountCodeData.current_uses + 1 })
        .eq('id', discountCodeId)

      // Grant Golden Paw VIP Founders Club badge if using FIRST50
      if (discountCodeData.code === 'FIRST50' || discountCode?.toUpperCase() === 'FIRST50') {
        console.log('[Stripe Webhook] Granting VIP membership for FIRST50 user:', userId)
        const { error: vipError } = await supabase
          .from('profiles')
          .update({
            is_vip_member: true,
            vip_badge_type: 'golden_paw_founders',
            vip_granted_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (vipError) {
          console.error('[Stripe Webhook] Error granting VIP membership:', vipError.message)
        } else {
          console.log('[Stripe Webhook] VIP membership granted successfully')
        }
      }
    }
  } catch (err) {
    console.error('[Stripe Webhook] Error processing discount code:', err)
  }
}

// Helper function to record financial transactions
async function recordFinancialTransaction({
  userId,
  transactionType,
  amount,
  stripePaymentIntentId,
  stripeChargeId,
  stripeCustomerId,
  paymentMethod,
  subscriptionId,
  bookingId,
  status,
  description,
}: {
  userId: string
  transactionType: 'subscription' | 'assessment' | 'individual_days' | 'extra_days' | 'subscription_extra_days' | 'late_fee' | 'refund'
  amount: number
  stripePaymentIntentId?: string
  stripeChargeId?: string
  stripeCustomerId?: string
  paymentMethod?: string
  subscriptionId?: string
  bookingId?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  description?: string
}) {
  try {
    const { error } = await supabase
      .from('financial_transactions')
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        amount,
        currency: 'GBP',
        stripe_payment_intent_id: stripePaymentIntentId,
        stripe_charge_id: stripeChargeId,
        stripe_customer_id: stripeCustomerId,
        payment_method: paymentMethod || 'card',
        subscription_id: subscriptionId,
        booking_id: bookingId,
        status,
        payment_date: new Date().toISOString(),
        description,
      })

    if (error) {
      console.error('Error recording financial transaction:', error.message)
    }
  } catch (err) {
    console.error('Failed to record financial transaction:', err)
  }
}

export async function POST(req: NextRequest) {
  console.log('[Stripe Webhook] Received webhook request')

  // Initialize Stripe lazily to avoid build-time errors
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
  })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  console.log('[Stripe Webhook] Signature present:', !!sig)
  console.log('[Stripe Webhook] Body length:', body.length)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  console.log('[Stripe Webhook] Event type:', event.type)
  console.log('[Stripe Webhook] Event ID:', event.id)

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      console.log('[Stripe Webhook] Processing checkout.session.completed')
      console.log('[Stripe Webhook] Session ID:', session.id)
      console.log('[Stripe Webhook] Metadata:', JSON.stringify(session.metadata))
      await handleCheckoutCompleted(session)
      break

    case 'customer.subscription.created':
      // Subscription created in Stripe - handled by checkout.session.completed
      break

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(updatedSubscription)
      break

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(deletedSubscription)
      break

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(failedInvoice)
      break

    case 'invoice.paid':
      // Invoice paid successfully - subscription should remain active
      break

    default:
      // Unhandled event type
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata, client_reference_id, subscription } = session

  // Allow processing if we have metadata with userId OR client_reference_id
  if (!metadata) {
    console.error('[Stripe Webhook] Missing metadata')
    return
  }

  const userId = metadata.userId || client_reference_id

  if (!userId) {
    console.error('[Stripe Webhook] Missing userId - no metadata.userId or client_reference_id')
    return
  }

  console.log('[Stripe Webhook] Processing checkout for userId:', userId, 'type:', metadata.type)

  // Processing checkout session

  // NEW FORMAT: dogSubscriptions in metadata
  if (metadata.dogSubscriptions) {
    try {
      const dogSubscriptions = JSON.parse(metadata.dogSubscriptions)
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 30)

      for (const dogSub of dogSubscriptions) {
        const { error, data: newSub } = await supabase
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
          .single()

        if (error) {
          console.error('Error creating subscription for dog:', dogSub.dogId, error.message)
        } else {
          // Record financial transaction for this subscription
          await recordFinancialTransaction({
            userId,
            transactionType: 'subscription',
            amount: parseFloat(dogSub.monthlyPrice),
            stripePaymentIntentId: session.payment_intent as string,
            stripeCustomerId: session.customer as string,
            paymentMethod: 'card',
            subscriptionId: newSub?.id,
            status: 'completed',
            description: `Subscription for dog - ${dogSub.daysIncluded} days`,
          })
        }
      }
      // Process discount code usage and VIP membership after successful subscription creation
      if (metadata.discountCodeId) {
        await processDiscountCodeUsage({
          userId,
          discountCode: metadata.discountCode,
          discountCodeId: metadata.discountCodeId,
          usedFor: 'subscription',
          totalAmount: parseFloat(metadata.totalAmount || '0'),
          discountAmount: parseFloat(metadata.discountAmount || '0'),
          finalAmount: parseFloat(metadata.finalAmount || '0'),
        })
      }
    } catch (error) {
      console.error('Error parsing dogSubscriptions')
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
    const { error, data: newSub } = await supabase
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
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error.message)
    } else {
      // Record financial transaction
      await recordFinancialTransaction({
        userId,
        transactionType: 'subscription',
        amount,
        stripePaymentIntentId: session.payment_intent as string,
        stripeCustomerId: session.customer as string,
        paymentMethod: 'card',
        subscriptionId: newSub?.id,
        status: 'completed',
        description: `Subscription - ${days} days`,
      })
    }

  } else if (metadata.type === 'extra_days') {
    // Handle extra days purchase
    const { subscriptionId, numDays } = metadata
    const amount = session.amount_total ? session.amount_total / 100 : 0

    // Add days to existing subscription
    const { error } = await supabase.rpc('add_subscription_days', {
      p_subscription_id: subscriptionId,
      p_days_to_add: parseInt(numDays)
    })

    if (error) {
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
    }

    // Record financial transaction for extra days
    await recordFinancialTransaction({
      userId,
      transactionType: 'extra_days',
      amount,
      stripePaymentIntentId: session.payment_intent as string,
      stripeCustomerId: session.customer as string,
      paymentMethod: 'card',
      subscriptionId,
      status: 'completed',
      description: `Extra days purchase - ${numDays} days`,
    })

    // Process discount code usage if applicable
    if (metadata.discountCodeId) {
      await processDiscountCodeUsage({
        userId,
        discountCode: metadata.discountCode,
        discountCodeId: metadata.discountCodeId,
        usedFor: 'extra_days',
        totalAmount: parseFloat(metadata.totalAmount || '0'),
        discountAmount: parseFloat(metadata.discountAmount || '0'),
        finalAmount: parseFloat(metadata.finalAmount || '0'),
      })
    }

  } else if (metadata.type === 'individual_days') {
    // Handle individual day bookings
    console.log('[Stripe Webhook] Processing individual_days booking')
    const { dogId, dates, pricePerDay, needsBreakfast, needsLunch, needsDinner, specialInstructions } = metadata
    console.log('[Stripe Webhook] Individual days - dogId:', dogId, 'dates:', dates, 'pricePerDay:', pricePerDay)
    const datesArray = dates.split(',')

    // Get dog details
    const { data: dog, error: dogError } = await supabase
      .from('dogs')
      .select('size')
      .eq('id', dogId)
      .single()

    if (dogError) {
      console.error('[Stripe Webhook] Error fetching dog:', dogError.message)
    }

    if (!dog) {
      console.error('[Stripe Webhook] Dog not found for individual day booking, dogId:', dogId)
      return
    }

    console.log('[Stripe Webhook] Dog size:', dog.size)

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

    console.log('[Stripe Webhook] Creating bookings:', JSON.stringify(bookings))

    const { error, data: insertedBookings } = await supabase
      .from('individual_day_bookings')
      .insert(bookings)
      .select()

    if (error) {
      console.error('[Stripe Webhook] Error creating individual day bookings:', error.message, error.details, error.hint)
    } else {
      console.log('[Stripe Webhook] Successfully created individual day bookings:', insertedBookings?.length)
      // Record financial transaction for individual days
      const amount = session.amount_total ? session.amount_total / 100 : 0
      await recordFinancialTransaction({
        userId,
        transactionType: 'individual_days',
        amount,
        stripePaymentIntentId: session.payment_intent as string,
        stripeCustomerId: session.customer as string,
        paymentMethod: 'card',
        status: 'completed',
        description: `Individual day booking - ${datesArray.length} day${datesArray.length > 1 ? 's' : ''}`,
      })
      console.log('[Stripe Webhook] Financial transaction recorded for individual days')

      // Process discount code usage if applicable
      if (metadata.discountCodeId) {
        await processDiscountCodeUsage({
          userId,
          discountCode: metadata.discountCode,
          discountCodeId: metadata.discountCodeId,
          usedFor: 'individual_days',
          totalAmount: parseFloat(metadata.totalAmount || '0'),
          discountAmount: parseFloat(metadata.discountAmount || '0'),
          finalAmount: parseFloat(metadata.finalAmount || '0'),
        })
      }
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
        console.error('Error creating included day bookings:', includedError.message)
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
        console.error('Error creating extra day bookings:', extraError.message)
      } else {
        // Record financial transaction for subscription extra days
        const amount = session.amount_total ? session.amount_total / 100 : 0
        await recordFinancialTransaction({
          userId,
          transactionType: 'subscription_extra_days',
          amount,
          stripePaymentIntentId: session.payment_intent as string,
          stripeCustomerId: session.customer as string,
          paymentMethod: 'card',
          subscriptionId,
          status: 'completed',
          description: `Subscription extra days - ${extraDates.length} day${extraDates.length > 1 ? 's' : ''}`,
        })
      }
    }
  } else if (metadata.type === 'assessment') {
    // Handle assessment payment
    console.log('[Stripe Webhook] Processing assessment booking')
    const amount = session.amount_total ? session.amount_total / 100 : 0
    const dogIds = metadata.dogIds?.split(',') || []
    const slotId = metadata.slotId

    // Record financial transaction
    await recordFinancialTransaction({
      userId,
      transactionType: 'assessment',
      amount,
      stripePaymentIntentId: session.payment_intent as string,
      stripeCustomerId: session.customer as string,
      paymentMethod: 'card',
      status: 'completed',
      description: `Assessment booking - ${dogIds.length} dog${dogIds.length > 1 ? 's' : ''}`,
    })

    // Create assessment bookings if slotId is provided
    // This is a backup in case the success page fails to create bookings
    if (slotId && dogIds.length > 0) {
      console.log('[Stripe Webhook] Creating assessment bookings for slot:', slotId, 'dogs:', dogIds)

      // Get slot details
      const { data: slot } = await supabase
        .from('assessment_slots')
        .select('*')
        .eq('id', slotId)
        .single()

      if (slot) {
        // Check if bookings already exist (success page may have created them)
        const { data: existingBookings } = await supabase
          .from('assessment_bookings')
          .select('id')
          .eq('user_id', userId)
          .eq('slot_id', slotId)
          .in('booking_status', ['confirmed', 'pending'])

        if (!existingBookings || existingBookings.length === 0) {
          console.log('[Stripe Webhook] No existing bookings found, creating new ones')

          // Create bookings for each dog
          for (const dogId of dogIds) {
            const { error: bookingError } = await supabase
              .from('assessment_bookings')
              .insert({
                slot_id: slotId,
                dog_id: dogId,
                user_id: userId,
                booking_status: 'confirmed',
              })

            if (bookingError) {
              console.error('[Stripe Webhook] Error creating assessment booking for dog:', dogId, bookingError.message)
            }
          }

          // Mark slot as booked
          await supabase
            .from('assessment_slots')
            .update({
              booked_by_user_id: userId,
              is_available: false
            })
            .eq('id', slotId)

          // Update dogs with assessment info
          for (const dogId of dogIds) {
            await supabase
              .from('dogs')
              .update({
                assessment_date: slot.assessment_date,
                assessment_slot_id: slotId
              })
              .eq('id', dogId)
          }

          console.log('[Stripe Webhook] Assessment bookings created successfully')
        } else {
          console.log('[Stripe Webhook] Bookings already exist, skipping creation')
        }
      } else {
        console.error('[Stripe Webhook] Assessment slot not found:', slotId)
      }
    }

    // Process discount code usage if applicable
    if (metadata.discountCodeId) {
      await processDiscountCodeUsage({
        userId,
        discountCode: metadata.discountCode,
        discountCodeId: metadata.discountCodeId,
        usedFor: 'assessment',
        totalAmount: parseFloat(metadata.totalAmount || '0'),
        discountAmount: parseFloat(metadata.discountAmount || '0'),
        finalAmount: parseFloat(metadata.finalAmount || '0'),
      })
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Subscription updated

  // Update subscription status based on Stripe status
  let isActive = true
  let paymentStatus = 'paid'

  switch (subscription.status) {
    case 'active':
      isActive = true
      paymentStatus = 'paid'
      break
    case 'past_due':
      isActive = true // Keep active but mark payment as failed
      paymentStatus = 'past_due'
      break
    case 'unpaid':
      isActive = false
      paymentStatus = 'unpaid'
      break
    case 'canceled':
      isActive = false
      paymentStatus = 'canceled'
      break
    case 'incomplete':
    case 'incomplete_expired':
      isActive = false
      paymentStatus = 'incomplete'
      break
    default:
      // Unknown status - default to keeping current state
      break
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({
      is_active: isActive,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription status:', error.message)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Get subscription ID from invoice - use type assertion for API compatibility
  const invoiceData = invoice as unknown as { subscription?: string | { id: string } | null }
  const subscriptionId = typeof invoiceData.subscription === 'string'
    ? invoiceData.subscription
    : invoiceData.subscription?.id

  if (subscriptionId) {
    // Mark the subscription as having a payment issue
    const { error } = await supabase
      .from('subscriptions')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription payment status:', error.message)
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as inactive
  const { error } = await supabase
    .from('subscriptions')
    .update({
      is_active: false,
      auto_renew: false,
      payment_status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error marking subscription as inactive:', error.message)
  }
}
