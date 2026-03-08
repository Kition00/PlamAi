// app/api/analyze/kundli/route.js
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = {
  en: 'You are a master Vedic astrologer with deep knowledge of Jyotish Shastra. Respond in English. Return ONLY valid JSON, no markdown, no preamble.',
  hi: 'आप एक महान वैदिक ज्योतिषी हैं। हिंदी में उत्तर दें। केवल valid JSON लौटाएं, कोई markdown नहीं।',
  gu: 'તમે એક મહાન વૈદિક જ્યોતિષી છો. ગુજરાતીમાં જવાબ આપો. માત્ર valid JSON પરત કરો.',
  ta: 'நீங்கள் ஒரு சிறந்த வேத ஜோதிடர். தமிழில் பதில் தர வேண்டும். Valid JSON மட்டும் திரும்பவும்.',
}

export async function POST(req) {
  try {
    const { name, dob, tob, pob, gender, lang = 'en' } = await req.json()

    const prompt = `Generate a detailed Vedic Kundli birth chart analysis for:
Name: ${name || 'Not provided'}
Date of Birth: ${dob}
Time of Birth: ${tob || 'Unknown'}
Place of Birth: ${pob}
Gender: ${gender || 'Not specified'}

Return ONLY this JSON structure (no markdown, no extra text):
{
  "rashi": "Moon sign name",
  "nakshatra": "Birth star name",
  "lagna": "Ascendant sign",
  "dominant_planet": "Most influential planet",
  "summary": {
    "career": "2-sentence career prediction",
    "relationships": "2-sentence relationship prediction",
    "health": "2-sentence health reading"
  },
  "doshas": ["list", "of", "relevant", "doshas", "if any"],
  "lucky": {
    "number": 7,
    "color": "Lucky color",
    "day": "Lucky day",
    "gemstone": "Recommended gemstone"
  },
  "yogas": ["list of auspicious yogas present"],
  "mahadasha": "Current major planetary period",
  "detailed_report": "A rich 400-500 word detailed Vedic birth chart reading covering planetary positions, key yogas, major life themes, current dasha period, and a personal blessing. Write in flowing paragraphs."
}`

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system:     SYSTEM[lang] || SYSTEM.en,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw  = response.content[0].text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(raw)
    return NextResponse.json({ success: true, result: data })
  } catch (err) {
    console.error('Kundli error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
