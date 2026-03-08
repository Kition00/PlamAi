// app/api/analyze/dream/route.js
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const { dreamText, emotion, recurring, lang = 'en' } = await req.json()

    const systems = {
      en: 'You are a master of Vedic Swapna Shastra and Jungian dream analysis. Return ONLY valid JSON.',
      hi: 'आप वैदिक स्वप्न शास्त्र और जुंगियन स्वप्न विश्लेषण के विशेषज्ञ हैं। हिंदी में JSON।',
      gu: 'વૈદિક સ્વપ્ન શાસ્ત્ર નિષ્ણાત. ગુજરાતી JSON.',
      ta: 'வேத சொப்ன சாஸ்திர நிபுணர். தமிழ் JSON.',
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1400,
      system: systems[lang] || systems.en,
      messages: [{
        role: 'user',
        content: `Interpret this dream using Vedic Swapna Shastra and Jungian symbolism:

Dream description: "${dreamText}"
Emotional feeling during dream: ${emotion || 'not specified'}
Is this recurring: ${recurring ? 'YES — this is a recurring dream (pay special attention)' : 'No'}

Return ONLY JSON:
{
  "primary_symbol": "The most significant symbol and its meaning in 5 words",
  "cosmic_message": "One powerful sentence — the universe's message through this dream",
  "dream_type": "Divya (divine) / Bhautika (worldly) / Manasika (mental)",
  "chakra_affected": "Which chakra this dream activates",
  "summary": {
    "subconscious": "2 sentences about what the subconscious is processing",
    "spiritual": "2 sentences about the spiritual significance",
    "action": "2 sentences of specific guidance to take from this dream"
  },
  "symbols": ["symbol 1", "symbol 2", "symbol 3", "symbol 4"],
  "symbol_meanings": [
    { "symbol": "Name", "vedic_meaning": "Its Vedic significance", "jungian_meaning": "Its Jungian archetype" }
  ],
  "recurring_note": "${recurring ? 'Special interpretation for why this dream keeps returning' : null}",
  "detailed_report": "400-500 word dream interpretation weaving Vedic Swapna Shastra with Jungian depth psychology. Interpret each key symbol, the emotional tone, chakra activation, and ${recurring ? 'why this recurring dream demands attention now' : 'the timing of this dream'}. End with a Vedic blessing."
}`
      }]
    })

    const raw = response.content[0].text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(raw)
    return NextResponse.json({ success: true, result: data })
  } catch (err) {
    console.error('Dream error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
