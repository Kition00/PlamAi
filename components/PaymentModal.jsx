'use client'
// components/PaymentModal.jsx
import { useState } from 'react'

export default function PaymentModal({ service, result, userName, lang, t, onClose, onSuccess }) {
  const p = t.payment

  const [step, setStep] = useState('choose') // choose | delivery | processing | done | error
  const [payMethod, setPayMethod] = useState('razorpay') // razorpay | stripe | paypal
  const [deliveryMethods, setDeliveryMethods] = useState(['inapp'])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [pdfBase64, setPdfBase64] = useState(null)
  const [error, setError] = useState('')

  const isIndia = payMethod === 'razorpay'

  function toggleDelivery(method) {
    setDeliveryMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    )
  }

  // ── RAZORPAY ──────────────────────────────────────────────────
  async function payRazorpay() {
    setStep('processing')
    setStatusMsg(p.processing)
    try {
      const res = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, lang }),
      })
      const order = await res.json()
      if (order.error) throw new Error(order.error)

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         order.keyId,
          amount:      order.amount,
          currency:    order.currency,
          order_id:    order.orderId,
          name:        'VedicAI',
          description: `${service} Reading`,
          prefill:     { name: userName || '', contact: phone || '' },
          theme:       { color: '#D4621A' },
          handler: async (response) => {
            // Verify
            const vRes = await fetch('/api/payment/razorpay', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            })
            const v = await vRes.json()
            if (v.verified) resolve()
            else reject(new Error('Payment verification failed'))
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        })
        rzp.open()
      })

      await deliverReport()
    } catch (err) {
      setError(err.message)
      setStep('error')
    }
  }

  // ── STRIPE ────────────────────────────────────────────────────
  async function payStripe() {
    setStep('processing')
    setStatusMsg(p.processing)
    try {
      const res = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, lang }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const stripe = window.Stripe(data.publishableKey)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: { token: 'tok_visa' }, // In production: use Stripe Elements
            billing_details: { name: userName || 'VedicAI Customer' },
          },
        }
      )
      if (stripeError) throw new Error(stripeError.message)
      if (paymentIntent.status === 'succeeded') {
        await deliverReport()
      }
    } catch (err) {
      setError(err.message)
      setStep('error')
    }
  }

  // ── PAYPAL ────────────────────────────────────────────────────
  async function payPayPal() {
    setStep('processing')
    setStatusMsg(p.processing)
    try {
      const res = await fetch('/api/payment/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, lang }),
      })
      const order = await res.json()
      if (order.error) throw new Error(order.error)

      // Open PayPal in popup
      const popup = window.open(
        `https://www.sandbox.paypal.com/checkoutnow?token=${order.orderId}`,
        'paypal_payment',
        'width=600,height=700'
      )

      // Poll for popup close (user completes payment externally)
      await new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
          if (popup.closed) {
            clearInterval(timer)
            // Capture the order
            const capRes = await fetch('/api/payment/paypal', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: order.orderId }),
            })
            const cap = await capRes.json()
            if (cap.verified) resolve()
            else reject(new Error('PayPal payment not completed'))
          }
        }, 1000)
        setTimeout(() => { clearInterval(timer); reject(new Error('Payment timeout')) }, 300000)
      })

      await deliverReport()
    } catch (err) {
      setError(err.message)
      setStep('error')
    }
  }

  // ── DELIVER ───────────────────────────────────────────────────
  async function deliverReport() {
    setStatusMsg(p.success)
    const deliveries = []

    if (deliveryMethods.includes('whatsapp') && phone) {
      setStatusMsg(p.whatsappSending)
      const wRes = await fetch('/api/deliver/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, service, result, userName, lang }),
      })
      const wData = await wRes.json()
      if (wData.pdfBase64) setPdfBase64(wData.pdfBase64)
      deliveries.push('whatsapp')
    }

    if (deliveryMethods.includes('email') && email) {
      setStatusMsg(p.emailSending)
      const eRes = await fetch('/api/deliver/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, service, result, userName, lang }),
      })
      const eData = await eRes.json()
      if (eData.pdfBase64 && !pdfBase64) setPdfBase64(eData.pdfBase64)
      deliveries.push('email')
    }

    if (deliveryMethods.includes('inapp') || deliveries.length === 0) {
      // Generate PDF for in-app download
      const pdfRes = await fetch('/api/deliver/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '_inapp_', service, result, userName, lang }),
      })
      // We only need the base64, not email sending
    }

    setStatusMsg(p.delivered)
    setStep('done')
    onSuccess?.()
  }

  function downloadPDF() {
    if (!pdfBase64) return
    const link = document.createElement('a')
    link.href = `data:application/pdf;base64,${pdfBase64}`
    link.download = `VedicAI_${service}_Reading.pdf`
    link.click()
  }

  function handlePay() {
    if (payMethod === 'razorpay') payRazorpay()
    else if (payMethod === 'stripe') payStripe()
    else payPayPal()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        {/* Header */}
        <div style={{background:'var(--saffron)',padding:'24px 28px',borderRadius:'20px 20px 0 0',position:'relative'}}>
          <button onClick={onClose} style={{position:'absolute',top:16,right:16,background:'rgba(255,255,255,.2)',border:'none',color:'#fff',width:32,height:32,borderRadius:'50%',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          <div style={{fontFamily:'var(--serif)',fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.7)',marginBottom:6}}>VedicAI</div>
          <div style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'#fff'}}>{p.title}</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,.75)',marginTop:4}}>{p.subtitle}</div>
        </div>

        <div style={{padding:'24px 28px'}}>

          {/* STEP: CHOOSE */}
          {step === 'choose' && <>

            {/* Price banner */}
            <div style={{display:'flex',gap:10,marginBottom:22}}>
              <div style={{flex:1,textAlign:'center',padding:'12px 8px',background:'rgba(212,98,26,.08)',border:'2px solid rgba(212,98,26,.25)',borderRadius:12}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--saffron)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>India 🇮🇳</div>
                <div style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:700,color:'var(--ink)'}}>{p.priceIndia}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>UPI · GPay · Cards</div>
              </div>
              <div style={{flex:1,textAlign:'center',padding:'12px 8px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>International 🌍</div>
                <div style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:700,color:'var(--ink)'}}>{p.priceIntl}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Cards · PayPal</div>
              </div>
            </div>

            {/* Payment methods */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>Payment Method</div>

              <button className={`pay-method-btn ${payMethod==='razorpay'?'active':''}`} onClick={()=>setPayMethod('razorpay')}>
                <div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#3395FF,#0070BA)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:18,flexShrink:0}}>₹</div>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'var(--ink)'}}>{p.upiLabel}</div>
                  <div style={{fontSize:13,color:'var(--muted)'}}>GPay · PhonePe · Paytm · UPI · All Indian Cards</div>
                </div>
                <div style={{marginLeft:'auto',width:18,height:18,borderRadius:'50%',border:`2px solid ${payMethod==='razorpay'?'var(--saffron)':'var(--border)'}`,background:payMethod==='razorpay'?'var(--saffron)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {payMethod==='razorpay'&&<div style={{width:8,height:8,borderRadius:'50%',background:'#fff'}}/>}
                </div>
              </button>

              <button className={`pay-method-btn ${payMethod==='stripe'?'active':''}`} onClick={()=>setPayMethod('stripe')}>
                <div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#635BFF,#4B42E0)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:18,flexShrink:0}}>💳</div>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'var(--ink)'}}>{p.stripeLabel}</div>
                  <div style={{fontSize:13,color:'var(--muted)'}}>Visa · Mastercard · Amex · Google Pay · Apple Pay</div>
                </div>
                <div style={{marginLeft:'auto',width:18,height:18,borderRadius:'50%',border:`2px solid ${payMethod==='stripe'?'var(--saffron)':'var(--border)'}`,background:payMethod==='stripe'?'var(--saffron)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {payMethod==='stripe'&&<div style={{width:8,height:8,borderRadius:'50%',background:'#fff'}}/>}
                </div>
              </button>

              <button className={`pay-method-btn ${payMethod==='paypal'?'active':''}`} onClick={()=>setPayMethod('paypal')}>
                <div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#003087,#009CDE)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:18,flexShrink:0}}>P</div>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'var(--ink)'}}>{p.paypalLabel}</div>
                  <div style={{fontSize:13,color:'var(--muted)'}}>PayPal balance · Linked bank · Cards</div>
                </div>
                <div style={{marginLeft:'auto',width:18,height:18,borderRadius:'50%',border:`2px solid ${payMethod==='paypal'?'var(--saffron)':'var(--border)'}`,background:payMethod==='paypal'?'var(--saffron)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {payMethod==='paypal'&&<div style={{width:8,height:8,borderRadius:'50%',background:'#fff'}}/>}
                </div>
              </button>
            </div>

            {/* Delivery options */}
            <div style={{marginBottom:22}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>{p.deliveryTitle}</div>
              <div style={{display:'flex',gap:8,marginBottom:14}}>
                {['whatsapp','email','inapp'].map(m => (
                  <button key={m} className={`delivery-tab ${deliveryMethods.includes(m)?'active':''}`} onClick={()=>toggleDelivery(m)}>
                    {m==='whatsapp'?'📱 WhatsApp':m==='email'?'📧 Email':'📱 In-App'}
                  </button>
                ))}
              </div>

              {deliveryMethods.includes('whatsapp') && (
                <div className="f-group" style={{marginBottom:12}}>
                  <label className="f-label" style={{fontSize:14}}>{p.whatsappLabel}</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:15,color:'var(--muted)'}}>📱</span>
                    <input className="f-input" placeholder={p.whatsappPlaceholder} value={phone} onChange={e=>setPhone(e.target.value)} style={{paddingLeft:40,fontSize:16}}/>
                  </div>
                  <div style={{fontSize:13,color:'var(--muted)',marginTop:6}}>We'll send your PDF report directly to WhatsApp</div>
                </div>
              )}

              {deliveryMethods.includes('email') && (
                <div className="f-group" style={{marginBottom:0}}>
                  <label className="f-label" style={{fontSize:14}}>{p.emailLabel}</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:15,color:'var(--muted)'}}>✉️</span>
                    <input className="f-input" type="email" placeholder={p.emailPlaceholder} value={email} onChange={e=>setEmail(e.target.value)} style={{paddingLeft:40,fontSize:16}}/>
                  </div>
                </div>
              )}
            </div>

            {/* What you get */}
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px',marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--saffron)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>What You Get</div>
              {p.features.map((f,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <span style={{color:'var(--saffron)',fontSize:14}}>✓</span>
                  <span style={{fontSize:14,color:'var(--ink3)'}}>{f}</span>
                </div>
              ))}
            </div>

            {/* Pay button */}
            <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:17,padding:'16px'}} onClick={handlePay}>
              {p.payNow} {isIndia ? p.priceIndia : p.priceIntl}
            </button>

            <div style={{textAlign:'center',fontSize:13,color:'var(--muted)',marginTop:12}}>{p.secureNote}</div>
          </>}

          {/* STEP: PROCESSING */}
          {step === 'processing' && (
            <div style={{textAlign:'center',padding:'32px 0'}}>
              <div className="ring-wrap" style={{margin:'0 auto 24px'}}>
                <div className="r1"/><div className="r2"/><div className="r3"/>
                <span>{payMethod==='razorpay'?'₹':payMethod==='stripe'?'💳':'P'}</span>
              </div>
              <div style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{statusMsg}</div>
              <div style={{fontSize:15,color:'var(--muted)'}}>Please do not close this window</div>
            </div>
          )}

          {/* STEP: DONE */}
          {step === 'done' && (
            <div style={{textAlign:'center',padding:'24px 0'}}>
              <div style={{fontSize:60,marginBottom:16}}>✨</div>
              <div style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:700,color:'var(--ink)',marginBottom:8}}>Report Delivered!</div>
              <div style={{fontSize:15,color:'var(--muted)',marginBottom:24,lineHeight:1.7}}>
                {deliveryMethods.includes('whatsapp')&&phone && <div>📱 Sent to WhatsApp: <strong>{phone}</strong></div>}
                {deliveryMethods.includes('email')&&email && <div>📧 Sent to: <strong>{email}</strong></div>}
                {deliveryMethods.includes('inapp') && <div>✓ Full report unlocked in app</div>}
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                {pdfBase64 && (
                  <button className="btn-primary" onClick={downloadPDF}>
                    ⬇ Download PDF
                  </button>
                )}
                <button className="btn-secondary" onClick={onClose}>
                  View Reading →
                </button>
              </div>
              <div style={{marginTop:20,padding:'14px 18px',background:'rgba(212,98,26,.07)',borderRadius:12,fontSize:14,color:'var(--saffron)',fontStyle:'italic'}}>
                "May the wisdom of this reading illuminate your sacred path." 🙏
              </div>
            </div>
          )}

          {/* STEP: ERROR */}
          {step === 'error' && (
            <div style={{textAlign:'center',padding:'24px 0'}}>
              <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
              <div style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:700,color:'var(--terracotta)',marginBottom:8}}>Payment Issue</div>
              <div style={{fontSize:15,color:'var(--muted)',marginBottom:24}}>{error}</div>
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button className="btn-primary" onClick={()=>{setStep('choose');setError('')}}>Try Again</button>
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
