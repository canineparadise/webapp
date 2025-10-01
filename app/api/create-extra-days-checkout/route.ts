import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, userId, numDays, pricePerDay, totalPrice } = await req.json()

    // Create Stripe Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Extra Daycare Days`,
              description: `${numDays} additional daycare ${numDays === 1 ? 'day' : 'days'} at £${parseFloat(pricePerDay).toFixed(2)}/day`,
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions/success?session_id={CHECKOUT_SESSION_ID}&type=extra_days`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscriptions?cancelled=true`,
      client_reference_id: userId,
      metadata: {
        subscriptionId,
        userId,
        numDays,
        pricePerDay,
        type: 'extra_days',
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
