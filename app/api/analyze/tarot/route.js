// app/api/analyze/tarot/route.js
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req) {
  try {
    const { cards, question, spread, lang = 'en' } = await req.json()

    const systems = {
      en: 'You are a Tarot master with deep knowledge of Vedic symbolism and Jungian archetypes. Return ONLY valid JSON.',
      hi: 'आप टैरो और वैदिक प्रतीकवाद के विशेषज्ञ हैं। हिंदी में JSON।',
      gu: 'ટેરો અને વૈદિક પ્રતીકોના નિષ્ણાત. ગુજરાતી JSON.',
      ta: 'தாரோ மற்றும் வேத குறியீடுகளில் நிபுணர். தமிழ் JSON.',
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1400,
      system: systems[lang] || systems.en,
      messages: [{
        role: 'user',
        content: `Cards drawn: ${cards.join(', ')}
Spread: ${spread} (${cards.length} card${cards.length > 1 ? 's' : ''})
${question ? `Seeker's question: "${question}"` : ''}

Return ONLY JSON:
{
  "overall_energy": "Theme or energy of the reading in 5 words",
  "key_message": "One powerful sentence that summarizes the cosmic message",
  "summary": {
    "past": "2 sentences about past influence card",
    "present": "2 sentences about present situation card",
    "future": "2 sentences about future outcome card"
  },
  "card_meanings": [
    { "card": "Card Name", "position": "Past/Present/Future/etc", "meaning": "2-3 sentence Vedic+Jungian interpretation" }
  ],
  "vedic_connection": "How this reading connects to Vedic wisdom",
  "action_guidance": "1-2 sentences of specific actionable guidance",
  "detailed_report": "A rich 400-500 word narrative tarot reading integrating all cards, their interactions, the seeker's question, and ending with a personal blessing. Write in flowing paragraphs."
}`
      }]
    })

    const raw = response.content[0].text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(raw)
    return NextResponse.json({ success: true, result: data })
  } catch (err) {
    console.error('Tarot error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
