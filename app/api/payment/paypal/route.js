// app/api/payment/paypal/route.js
import { NextResponse } from 'next/server'

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken() {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

// POST — create PayPal order
export async function POST(req) {
  try {
    const { service, lang } = await req.json()
    const amount = process.env.PRICE_USD_PAYPAL || '5.99'
    const token  = await getAccessToken()

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount:      { currency_code: 'USD', value: amount },
          description: `VedicAI ${service} reading`,
          custom_id:   `${service}_${lang}_${Date.now()}`,
        }],
        application_context: {
          brand_name:          'VedicAI',
          landing_page:        'NO_PREFERENCE',
          user_action:         'PAY_NOW',
          return_url:          `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          cancel_url:          `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        },
      }),
    })

    const order = await res.json()
    return NextResponse.json({ orderId: order.id, status: order.status })
  } catch (err) {
    console.error('PayPal create error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT — capture PayPal order after approval
export async function PUT(req) {
  try {
    const { orderId } = await req.json()
    const token = await getAccessToken()

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
    })
    const data = await res.json()

    if (data.status === 'COMPLETED') {
      return NextResponse.json({ verified: true, captureId: data.id })
    }
    return NextResponse.json({ verified: false, data }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
