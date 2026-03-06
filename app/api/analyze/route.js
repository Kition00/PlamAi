import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_key_here') {
      return Response.json(
        { error: "Add your ANTHROPIC_API_KEY to the .env.local file, then restart npm run dev." },
        { status: 500 }
      );
    }

    const { image, mimeType } = await request.json();
    if (!image) return Response.json({ error: "No image provided." }, { status: 400 });

    // Quality check — is this actually a hand?
    const qc = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 60,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: image } },
        { type: "text", text: "Is this a human hand or palm? Reply only: yes or no." }
      ]}]
    });

    if (qc.content[0].text.toLowerCase().trim().startsWith("no")) {
      return Response.json({
        quality: "no_hand",
        quality_message: "Please upload a clear open-palm photo with all fingers visible and good lighting."
      });
    }

    // Full Vedic reading
    const resp = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: image } },
        { type: "text", text: `You are Guru Hastalakshmi, a Vedic palmist with 40 years of wisdom. Analyze this palm and respond with ONLY raw JSON — no markdown, no backticks, no extra text:
{
  "dominant_trait": "2-4 word defining quality",
  "lucky_element": "Fire or Water or Earth or Air",
  "summary": {
    "life": "2-3 sentences about life energy and path",
    "finance": "2-3 sentences about wealth and finances",
    "relationships": "2-3 sentences about love and heart line"
  },
  "detailed_report": "300-400 word Vedic reading. Address the person directly. Cover life line, heart line, head line, fate line, the mounts of Jupiter and Venus, and hand shape. Use warm mystical language. End with a personal blessing."
}` }
      ]}]
    });

    const text = resp.content[0].text;
    let reading;
    try { reading = JSON.parse(text); }
    catch {
      const m = text.match(/\{[\s\S]*\}/);
      reading = m ? JSON.parse(m[0]) : null;
    }

    if (!reading) return Response.json({ error: "Could not decode the reading. Please try again." }, { status: 500 });
    return Response.json(reading);

  } catch (err) {
    console.error("PalmAI error:", err);
    return Response.json({ error: err.message || "Unexpected error." }, { status: 500 });
  }
}
