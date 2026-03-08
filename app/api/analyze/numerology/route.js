// app/api/analyze/numerology/route.js
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req) {
  try {
    const { name, dob, lang = 'en' } = await req.json()

    const systems = {
      en: 'You are a Vedic numerologist with deep knowledge of Chaldean and Pythagorean systems. Return ONLY valid JSON.',
      hi: 'आप वैदिक अंक ज्योतिष विशेषज्ञ हैं। हिंदी में JSON।',
      gu: 'વૈદિક અંક જ્યોતિષ નિષ્ણાત. ગુજરાતી JSON.',
      ta: 'வேத எண் ஜோதிட நிபுணர். தமிழ் JSON.',
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1400,
      system: systems[lang] || systems.en,
      messages: [{
        role: 'user',
        content: `Calculate a complete Vedic numerology reading for:
Name: ${name}
Date of Birth: ${dob}

Calculate all numbers from the name and date. Return ONLY JSON:
{
  "life_path_number": 7,
  "destiny_number": 3,
  "soul_urge_number": 9,
  "personality_number": 4,
  "birth_day_number": 11,
  "lucky_numbers": [3, 7, 9],
  "summary": {
    "purpose": "2 sentences about life path and soul purpose",
    "strengths": "2 sentences about key strengths and gifts",
    "challenges": "2 sentences about growth areas"
  },
  "compatibility": "2 sentences about best compatible life path numbers",
  "personal_year": "Current personal year number and its meaning",
  "karmic_lessons": ["lesson 1", "lesson 2"],
  "detailed_report": "Rich 400-500 word numerology reading covering all numbers, their deep meaning, how they interact, karmic patterns, and guidance for this year. End with a Vedic blessing."
}`
      }]
    })

    const raw = response.content[0].text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(raw)
    return NextResponse.json({ success: true, result: data })
  } catch (err) {
    console.error('Numerology error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
