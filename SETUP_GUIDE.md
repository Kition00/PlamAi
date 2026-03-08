# VedicAI v2 — Complete Setup Guide
## Multi-Language · Multi-Payment · WhatsApp + Email Delivery

---

## 🌟 What's Included

### Languages
| Language | Code | Coverage |
|----------|------|---------|
| English | `en` | Full UI + AI responses |
| Hindi | `hi` | Full UI + AI responses |
| Gujarati | `gu` | Full UI + AI responses |
| Tamil | `ta` | Full UI + AI responses |

### Payment Methods
| Gateway | Market | Methods | Currency |
|---------|--------|---------|---------|
| **Razorpay** | 🇮🇳 India | GPay, PhonePe, Paytm, UPI, All Indian Cards | ₹499 |
| **Stripe** | 🌍 International | Visa, Mastercard, Amex, Google Pay, Apple Pay | $5.99 |
| **PayPal** | 🌐 Global | PayPal balance, bank, linked cards | $5.99 |

### Report Delivery
- 📱 **WhatsApp** — PDF sent directly via Twilio WhatsApp API
- 📧 **Email** — Branded HTML email + PDF attachment via SMTP
- 📱 **In-App** — Instant unlock on screen + PDF download
- Customer can select multiple delivery methods simultaneously

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Extract the zip
unzip VedicAI_v2.zip
cd vedicai

# 2. Copy and fill environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys (see sections below)

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev
# → http://localhost:3000
```

---

## 🔑 API Keys Setup

### 1. Anthropic (AI Readings)
1. Go to https://console.anthropic.com
2. API Keys → Create Key
3. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

---

### 2. Razorpay (India — GPay/UPI)
1. Sign up at https://razorpay.com
2. Dashboard → Settings → API Keys → Generate Key
3. Add to `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=...
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
   ```

**Pricing:** Change `PRICE_INR_PAISE=49900` (49900 paise = ₹499)

**Enable GPay:** In Razorpay Dashboard → Settings → Payment Methods → Enable UPI/Google Pay

---

### 3. Stripe (International)
1. Sign up at https://stripe.com
2. Developers → API Keys → Reveal live keys
3. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. For webhooks: `stripe listen --forward-to localhost:3000/api/payment/stripe`

**For production Stripe Elements** (real card form), replace the card token in `PaymentModal.jsx`
with actual Stripe Elements. The current implementation uses a test token.

---

### 4. PayPal
1. Go to https://developer.paypal.com/dashboard
2. Apps & Credentials → Create App
3. Change `PAYPAL_MODE=live` for production
4. Add to `.env.local`:
   ```
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_MODE=live
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
   ```

---

### 5. Twilio WhatsApp (PDF Delivery)
1. Sign up at https://twilio.com
2. **For testing:** Use WhatsApp Sandbox
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Send "join <your-keyword>" to +1 415 523 8886
3. **For production:** Apply for WhatsApp Business API
4. Add to `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

**To send PDF as attachment** (not just text message):
Upload the PDF to Cloudflare R2 / AWS S3 / Cloudinary and add `mediaUrl` to the Twilio message.
In `app/api/deliver/whatsapp/route.js`, uncomment:
```js
mediaUrl: ['https://your-cdn.com/report.pdf']
```

---

### 6. Email (SMTP)
**Option A — Gmail:**
1. Google Account → Security → 2-Step Verification → App Passwords
2. Create App Password for "Mail"
3. Add to `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=your-16-char-app-password
   EMAIL_FROM=VedicAI <your@gmail.com>
   ```

**Option B — SendGrid (recommended for production):**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
```

**Option C — Resend:**
```
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_your-key
```

---

## 🌐 Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Or via GitHub:**
1. Push code to GitHub
2. Import at vercel.com/new
3. Add ALL environment variables in Settings → Environment Variables
4. Deploy

**Custom domain:** Settings → Domains → Add `vedicai.com`

---

## 📱 WhatsApp Sandbox Testing

1. Send message to Twilio sandbox: `join <keyword>` to +1 415 523 8886
2. You'll receive: "You have joined the sandbox"
3. Now test by making a payment on localhost
4. Your phone receives the WhatsApp message instantly

---

## 💰 Pricing Configuration

Edit `.env.local`:
```
PRICE_INR_PAISE=49900    # ₹499 (49900 paise)
PRICE_USD_CENTS=599      # $5.99 (599 cents)
PRICE_USD_PAYPAL=5.99    # PayPal string
```

---

## 🗣️ Adding More Languages

In `lib/i18n/translations.js`, copy the `en` block, change the key (e.g., `'te'` for Telugu),
translate all strings, and add the button in `components/Nav.jsx`.

The AI will automatically respond in the correct language based on the `lang` parameter
sent to each API route.

---

## 📁 File Structure

```
vedicai/
├── app/
│   ├── page.jsx              ← Main app (all pages, i18n, state)
│   ├── layout.js             ← HTML shell, font loading
│   ├── globals.css           ← Complete design system
│   └── api/
│       ├── analyze/          ← AI reading endpoints
│       │   ├── palm/
│       │   ├── kundli/
│       │   ├── tarot/
│       │   ├── numerology/
│       │   ├── face/
│       │   └── dream/
│       ├── payment/          ← Payment processing
│       │   ├── razorpay/     ← GPay/UPI/Indian cards
│       │   ├── stripe/       ← International cards
│       │   └── paypal/       ← Global PayPal
│       └── deliver/          ← Report delivery
│           ├── whatsapp/     ← Twilio WhatsApp PDF
│           └── email/        ← SMTP email + PDF
├── components/
│   ├── Nav.jsx               ← Nav + language switcher
│   └── PaymentModal.jsx      ← Payment flow UI
├── lib/
│   ├── i18n/
│   │   └── translations.js   ← All 4 languages
│   └── pdf/
│       └── generateReport.js ← Branded PDF generator
├── .env.local                ← Your API keys
└── package.json
```

---

## 🔒 Security Notes

- Payment signatures verified server-side (Razorpay HMAC, Stripe webhook)
- Images compressed to 800px before sending to Claude API
- All API keys in `.env.local` (never committed to git)
- Add `.env.local` to `.gitignore`

---

## 📞 Support

For questions about setup, payment integration, or WhatsApp API approval,
refer to the respective platform documentation:
- Razorpay: https://razorpay.com/docs
- Stripe: https://stripe.com/docs
- PayPal: https://developer.paypal.com/docs
- Twilio: https://www.twilio.com/docs/whatsapp
