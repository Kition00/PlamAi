import './globals.css'

export const metadata = {
  title: 'VedicAI — Ancient Vedic Wisdom Powered by AI',
  description: 'Palm reading, Kundli, Tarot, Numerology, Face reading & Dream interpretation in Hindi, Gujarati, English & Tamil. Pay with GPay, UPI, Stripe or PayPal.',
  keywords: 'vedic astrology, palm reading, kundli, tarot, numerology, face reading, dream interpretation, jyotish, AI astrology',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap" rel="stylesheet"/>
        {/* Razorpay */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async/>
        {/* Stripe */}
        <script src="https://js.stripe.com/v3/" async/>
      </head>
      <body>{children}</body>
    </html>
  )
}
