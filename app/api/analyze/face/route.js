// app/api/analyze/face/route.js
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const { imageBase64, lang = 'en' } = await req.json()

    const systems = {
      en: 'You are a master of Samudrika Shastra (Vedic face reading). Respond in English. Return ONLY valid JSON.',
      hi: 'आप समुद्रिका शास्त्र के महान विशेषज्ञ हैं। हिंदी में JSON।',
      gu: 'સમુદ્રિક શાસ્ત્ર નિષ્ણાત. ગુજરાતી JSON.',
      ta: 'சமுத்திரிக்க சாஸ்திர நிபுணர். தமிழ் JSON.',
    }

    // Quality check
    const check = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 20,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: 'Is this a clear front-facing photo of a human face? Answer only YES or NO.' }
        ]
      }]
    })

    const isValid = check.content[0].text.trim().toUpperCase().startsWith('YES')
    if (!isValid) {
      return NextResponse.json({ error: 'Please upload a clear front-facing photo.', code: 'INVALID_IMAGE' }, { status: 422 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: systems[lang] || systems.en,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: `Perform a Samudrika Shastra face reading. Return ONLY JSON:
{
  "dominant_trait": "Primary personality quality",
  "element": "Fire/Water/Earth/Air/Ether",
  "summary": {
    "personality": "2 sentences about overall personality",
    "career": "2 sentences about career destiny",
    "relationships": "2 sentences about relationship nature"
  },
  "features": {
    "forehead": "Vedic reading of the forehead",
    "eyes": "Reading of the eyes",
    "nose": "Reading of the nose",
    "lips": "Reading of the lips",
    "chin": "Reading of the chin and jaw"
  },
  "detailed_report": "400-500 word Samudrika Shastra reading interpreting all facial features, elemental nature, planetary influence on face zones, past-life indicators, and ending with a Vedic blessing."
}` }
        ]
      }]
    })

    const raw = response.content[0].text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(raw)
    return NextResponse.json({ success: true, result: data })
  } catch (err) {
    console.error('Face error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
