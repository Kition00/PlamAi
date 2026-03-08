// app/api/deliver/email/route.js
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'
import { generatePDFReport } from '../../../../lib/pdf/generateReport'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Email subject lines by language
const SUBJECTS = {
  en: (svc) => `✨ Your VedicAI ${svc} Report is Ready`,
  hi: (svc) => `✨ आपकी VedicAI ${svc} रिपोर्ट तैयार है`,
  gu: (svc) => `✨ તમારો VedicAI ${svc} અહેવાલ તૈયાર છે`,
  ta: (svc) => `✨ உங்கள் VedicAI ${svc} அறிக்கை தயார்`,
}

function buildEmailHTML(userName, svcName, result, lang) {
  const greetings = { en: 'Namaste', hi: 'नमस्ते', gu: 'નમસ્તે', ta: 'நமஸ்தே' }
  const greeting = greetings[lang] || 'Namaste'

  const summaryRows = Object.entries(result?.summary || {}).slice(0, 3).map(([k, v]) => `
    <tr>
      <td style="padding:10px 14px;background:#FAF7F2;border-left:3px solid #D4621A;margin-bottom:6px">
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#D4621A;font-family:sans-serif">${k.toUpperCase()}</p>
        <p style="margin:0;font-size:13px;color:#3D2B1F;line-height:1.6;font-family:Georgia,serif">${v || ''}</p>
      </td>
    </tr>
  `).join('<tr><td style="height:6px"></td></tr>')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F4EFE6;font-family:sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE6;padding:32px 16px">
<tr><td>
<table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(100,60,30,.1)">

  <!-- Header -->
  <tr>
    <td style="background:#D4621A;padding:32px 36px 24px;text-align:center">
      <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#fff;letter-spacing:-.01em">VedicAI</p>
      <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.7)">Ancient Wisdom · Powered by AI</p>
      <p style="margin:16px auto 0;font-family:Georgia,serif;font-size:52px;color:rgba(255,255,255,.1);line-height:1">OM</p>
    </td>
  </tr>

  <!-- Greeting -->
  <tr>
    <td style="padding:32px 36px 20px">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#D4621A;letter-spacing:.14em;text-transform:uppercase">Your Reading is Ready</p>
      <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:26px;color:#1C1410;font-weight:700">${greeting}${userName ? `, ${userName}` : ''}! 🙏</h1>
      <p style="margin:0;font-size:15px;color:#6B4C3B;line-height:1.7">Your personalized <strong style="color:#D4621A">${svcName}</strong> reading has been prepared. Your full report PDF is attached to this email.</p>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="padding:0 36px"><hr style="border:none;border-top:1px solid rgba(180,130,100,.2)"/></td></tr>

  <!-- Summary -->
  <tr>
    <td style="padding:20px 36px">
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#D4621A;letter-spacing:.14em;text-transform:uppercase">Reading Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${summaryRows}
      </table>
    </td>
  </tr>

  <!-- Quote -->
  <tr>
    <td style="padding:8px 36px 24px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#FAF7F2;border-radius:10px;padding:18px 24px;text-align:center;border:1px solid rgba(180,130,100,.2)">
            <p style="margin:0;font-family:Georgia,serif;font-size:15px;font-style:italic;color:#6B4C3B;line-height:1.75">"The cosmos speaks to those who listen. May this reading illuminate your sacred path."</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="padding:0 36px 28px;text-align:center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vedicai.com'}" style="display:inline-block;background:#D4621A;color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none">Get Another Reading →</a>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#1C1410;padding:24px 36px;text-align:center">
      <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:18px;color:#D4621A">VedicAI</p>
      <p style="margin:0 0 10px;font-size:10px;color:rgba(250,247,242,.4);letter-spacing:.12em;text-transform:uppercase">Ancient Vedic Wisdom · Powered by AI</p>
      <p style="margin:0;font-size:10px;color:rgba(250,247,242,.25)">⚠️ For entertainment purposes only. Not a substitute for professional advice.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export async function POST(req) {
  try {
    const { email, service, result, userName, lang = 'en' } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const serviceNames = {
      palm: { en:'Palm Reading', hi:'हस्त रेखा', gu:'હસ્ત રેખા', ta:'கை ரேகை' },
      kundli: { en:'Kundli Reading', hi:'कुंडली', gu:'કુંડળી', ta:'ஜாதகம்' },
      tarot: { en:'Tarot Reading', hi:'टैरो', gu:'ટેરો', ta:'தாரோ' },
      numerology: { en:'Numerology', hi:'अंक ज्योतिष', gu:'અંક જ્યોતિષ', ta:'எண் ஜோதிடம்' },
      face: { en:'Face Reading', hi:'मुख पठन', gu:'મુખ વાંચન', ta:'முக வாசிப்பு' },
      dream: { en:'Dream Interpretation', hi:'स्वप्न व्याख्या', gu:'સ્વપ્ન વ્યાખ્યા', ta:'கனவு விளக்கம்' },
    }
    const svcName = serviceNames[service]?.[lang] || service

    // Generate PDF
    const pdfBuffer = await generatePDFReport({
      service, result, userName, lang,
      readingDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
    })

    const subjectFn = SUBJECTS[lang] || SUBJECTS.en
    const htmlBody  = buildEmailHTML(userName, svcName, result, lang)

    await transporter.sendMail({
      from:        process.env.EMAIL_FROM || 'VedicAI <noreply@vedicai.com>',
      to:          email,
      subject:     subjectFn(svcName),
      html:        htmlBody,
      attachments: [{
        filename:    `VedicAI_${svcName.replace(/\s+/g,'_')}_Report.pdf`,
        content:     pdfBuffer,
        contentType: 'application/pdf',
      }],
    })

    return NextResponse.json({
      success:   true,
      to:        email,
      pdfBase64: pdfBuffer.toString('base64'),
    })

  } catch (err) {
    console.error('Email delivery error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
