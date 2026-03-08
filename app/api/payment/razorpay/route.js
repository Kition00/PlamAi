// app/api/payment/razorpay/route.js
import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// POST /api/payment/razorpay — create order
export async function POST(req) {
  try {
    const { service, lang } = await req.json()
    const amount = parseInt(process.env.PRICE_INR_PAISE || '49900') // ₹499

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt:  `vedicai_${service}_${Date.now()}`,
      notes: { service, lang },
    })

    return NextResponse.json({
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      keyId:     process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Razorpay create order error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/payment/razorpay — verify payment signature
export async function PUT(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    const body      = razorpay_order_id + '|' + razorpay_payment_id
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return NextResponse.json({ verified: false }, { status: 400 })
    }

    return NextResponse.json({ verified: true, paymentId: razorpay_payment_id })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
