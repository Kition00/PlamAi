// app/api/payment/stripe/route.js
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// POST — create PaymentIntent
export async function POST(req) {
  try {
    const { service, lang } = await req.json()
    const amount = parseInt(process.env.PRICE_USD_CENTS || '599') // $5.99

    const intent = await stripe.paymentIntents.create({
      amount,
      currency:            'usd',
      automatic_payment_methods: { enabled: true },
      metadata:            { service, lang },
      description:         `VedicAI ${service} reading`,
    })

    return NextResponse.json({
      clientSecret:   intent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      amount,
    })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/payment/stripe/webhook — handle Stripe events
export async function PUT(req) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')
  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    console.log('Stripe payment succeeded:', pi.id, pi.metadata)
    // Trigger delivery here if needed
  }

  return NextResponse.json({ received: true })
}
