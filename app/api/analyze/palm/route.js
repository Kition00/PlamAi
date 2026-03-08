// app/api/analyze/palm/route.js
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM = {
  en: 'You are a master Vedic palmist. Respond in English. Return ONLY valid JSON.',
  hi: 'आप वैदिक हस्त रेखा विशेषज्ञ हैं। हिंदी में उत्तर दें। केवल valid JSON।',
  gu: 'તમે વૈદિક હસ્ત રેખા નિષ્ણાત છો. ગુજરાતીમાં. Valid JSON.',
  ta: 'நீங்கள் வேத கை ரேகை நிபுணர். தமிழில். Valid JSON.',
}

export async function POST(req) {
  try {
    const { imageBase64, lang = 'en' } = await req.json()

    // Quality check first
    const check = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 20,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: 'Does this image show a human palm clearly enough for palm line reading? Answer only YES or NO.' }
        ]
      }]
    })

    const isValid = check.content[0].text.trim().toUpperCase().startsWith('YES')
    if (!isValid) {
      return NextResponse.json({ error: 'Please upload a clear palm photo with lines visible.', code: 'INVALID_IMAGE' }, { status: 422 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: SYSTEM[lang] || SYSTEM.en,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: `Read this palm using Vedic Hasta Rekha Shastra. Return ONLY JSON:
{
  "dominant_trait": "Primary personality trait revealed",
  "lucky_element": "Fire/Water/Earth/Air/Ether",
  "summary": {
    "life": "2 sentences about life line reading",
    "finance": "2 sentences about fate/sun line",
    "relationships": "2 sentences about heart line"
  },
  "mounts": "Brief reading of the strongest mount",
  "special_signs": "Any special marks or formations",
  "detailed_report": "400-500 word rich reading of all palm lines, mounts, special signs, Vedic interpretation with a personal blessing at the end."
}` }
        ]
      }]
    })

    const raw = response.content[0].text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(raw)
    return NextResponse.json({ success: true, result: data })
  } catch (err) {
    console.error('Palm error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
