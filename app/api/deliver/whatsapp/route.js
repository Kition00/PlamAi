// app/api/deliver/whatsapp/route.js
import twilio from 'twilio'
import { NextResponse } from 'next/server'
import { generatePDFReport } from '../../lib/pdf/generateReport'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// WhatsApp message templates per language
const WA_MESSAGES = {
  en: (name, service) => `
✨ *VedicAI — Your ${service} Reading is Ready* ✨

Namaste${name ? ` *${name}*` : ''}! 🙏

Your personalized Vedic reading has been prepared with care. Your full report PDF is attached to this message.

_"The cosmos speaks to those who listen. May this reading illuminate your sacred path."_

━━━━━━━━━━━━━━━━
🌟 *VedicAI* — Ancient Wisdom, Powered by AI
vedicai.com
━━━━━━━━━━━━━━━━
⚠️ For entertainment purposes only.
`.trim(),

  hi: (name, service) => `
✨ *VedicAI — आपकी ${service} तैयार है* ✨

नमस्ते${name ? ` *${name}*` : ''}! 🙏

आपकी व्यक्तिगत वैदिक पठन तैयार की गई है। आपकी पूरी रिपोर्ट PDF इस संदेश के साथ संलग्न है।

_"ब्रह्मांड उन लोगों से बात करता है जो सुनते हैं। यह पठन आपके पवित्र मार्ग को प्रकाशित करे।"_

━━━━━━━━━━━━━━━━
🌟 *VedicAI* — प्राचीन ज्ञान, AI द्वारा
vedicai.com
━━━━━━━━━━━━━━━━
⚠️ केवल मनोरंजन के लिए।
`.trim(),

  gu: (name, service) => `
✨ *VedicAI — તમારી ${service} તૈયાર છે* ✨

નમસ્તે${name ? ` *${name}*` : ''}! 🙏

તમારું વ્યક્તિગત વૈદિક વાંચન તૈયાર કરવામાં આવ્યું છે. તમારો સંપૂર્ણ અહેવાલ PDF આ સંદેશ સાથે જોડાયેલ છે।

_"બ્રહ્માંડ તે લોકો સાથે વાત કરે છે જે સાંભળે છે. આ વાંચન તમારો પવિત્ર માર્ગ પ્રકાશિત કરે।"_

━━━━━━━━━━━━━━━━
🌟 *VedicAI* — પ્રાચીન જ્ઞાન, AI દ્વારા
vedicai.com
━━━━━━━━━━━━━━━━
⚠️ માત્ર મનોરંજન માટે।
`.trim(),

  ta: (name, service) => `
✨ *VedicAI — உங்கள் ${service} தயார்* ✨

நமஸ்தே${name ? ` *${name}*` : ''}! 🙏

உங்கள் தனிப்பட்ட வேத வாசிப்பு தயாரிக்கப்பட்டுள்ளது. முழு அறிக்கை PDF இந்த செய்தியுடன் இணைக்கப்பட்டுள்ளது.

_"கேட்பவர்களிடம் பிரபஞ்சம் பேசுகிறது. இந்த வாசிப்பு உங்கள் புனிதமான பாதையை ஒளிரச் செய்யட்டும்."_

━━━━━━━━━━━━━━━━
🌟 *VedicAI* — பண்டைய ஞானம், AI மூலம்
vedicai.com
━━━━━━━━━━━━━━━━
⚠️ பொழுதுபோக்கு நோக்கங்களுக்கு மட்டும்.
`.trim(),
}

export async function POST(req) {
  try {
    const { phone, service, result, userName, lang = 'en' } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Normalize phone: ensure + prefix
    const normalizedPhone = phone.startsWith('+') ? phone : '+' + phone.replace(/\D/g, '')
    const waTo = `whatsapp:${normalizedPhone}`

    // Generate PDF
    const pdfBuffer = await generatePDFReport({
      service,
      result,
      userName,
      lang,
      readingDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
    })

    // Twilio requires a publicly accessible URL for media
    // For production: upload PDF to S3/Cloudinary and use the URL
    // For now we send the text message + note about PDF
    const serviceDisplayNames = {
      palm: { en: 'Palm Reading', hi: 'हस्त रेखा पठन', gu: 'હસ્ત રેખા વાંચન', ta: 'கை ரேகை வாசிப்பு' },
      kundli: { en: 'Kundli Reading', hi: 'कुंडली पठन', gu: 'કુંડળી વાંચન', ta: 'ஜாதக வாசிப்பு' },
      tarot: { en: 'Tarot Reading', hi: 'टैरो पठन', gu: 'ટેરો વાંચન', ta: 'தாரோ வாசிப்பு' },
      numerology: { en: 'Numerology', hi: 'अंक ज्योतिष', gu: 'અંક જ્યોતિષ', ta: 'எண் ஜோதிடம்' },
      face: { en: 'Face Reading', hi: 'मुख पठन', gu: 'મુખ વાંચન', ta: 'முக வாசிப்பு' },
      dream: { en: 'Dream Interpretation', hi: 'स्वप्न व्याख्या', gu: 'સ્વપ્ન વ્યાખ્યા', ta: 'கனவு விளக்கம்' },
    }
    const svcName = serviceDisplayNames[service]?.[lang] || service

    const msgFn = WA_MESSAGES[lang] || WA_MESSAGES.en
    const messageBody = msgFn(userName, svcName)

    // Send WhatsApp message
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   waTo,
      body: messageBody,
    })

    // NOTE: To send PDF as attachment, upload pdfBuffer to S3/Cloudinary
    // and add mediaUrl to the message above:
    //   mediaUrl: ['https://your-cdn.com/report.pdf']
    // The PDF buffer is returned so the caller can also offer in-app download

    return NextResponse.json({
      success:   true,
      messageSid: message.sid,
      to:         normalizedPhone,
      pdfBase64:  pdfBuffer.toString('base64'), // for in-app download
    })

  } catch (err) {
    console.error('WhatsApp delivery error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
