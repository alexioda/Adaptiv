// api/somatic-echo.ts — Vercel Serverless Function
// ─────────────────────────────────────────────────
// Fires BEFORE coaching questions are generated.
// Returns a single sentence that mirrors the client's
// body state back to them — no analysis, no advice.
// Nervous system first. Cognition second.
//
// Called from aiservice.ts as the first step in
// the coaching sequence.
// ─────────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const ALLOWED_ORIGINS = [
  "https://liveadaptiv.com",
  "https://www.liveadaptiv.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

// ── Fallbacks keyed by somatic zone ──────────────────────────
// Used when API is unavailable. Broad enough to land,
// specific enough to feel intentional.
const SOMATIC_FALLBACKS: Record<string, string> = {
  chest: "Your chest is holding something your words haven't named yet.",
  throat: "There is something in your throat that knows it needs to be said.",
  stomach: "Your gut already has an answer your mind is still debating.",
  jaw: "Your jaw has been bracing against something longer than today.",
  shoulders: "The weight on your shoulders has been accumulating quietly.",
  head: "Your mind is moving faster than your body can follow right now.",
  default: "Your body arrived here carrying something worth listening to.",
};

function getSomaticFallback(somatic: string): string {
  const lower = somatic.toLowerCase();
  for (const key of Object.keys(SOMATIC_FALLBACKS)) {
    if (lower.includes(key)) return SOMATIC_FALLBACKS[key];
  }
  return SOMATIC_FALLBACKS.default;
}

// ── Tone routing by stress + energy ──────────────────────────
function getToneInstruction(stressLevel: number, energyLevel: number): string {
  if (stressLevel >= 75) {
    return "Tone: Slow. Grounding. Almost a whisper. No urgency. The sentence should feel like a hand on the shoulder.";
  }
  if (energyLevel <= 35) {
    return "Tone: Gentle. Compassionate. No demand. The sentence should feel like permission to rest for a moment.";
  }
  if (stressLevel <= 40 && energyLevel >= 65) {
    return "Tone: Clear and direct. Slightly challenging. The sentence should feel like a precise observation from someone who sees them clearly.";
  }
  return "Tone: Warm but honest. Neither soft nor sharp. The sentence should feel like a trusted colleague pausing to notice.";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // ── CORS ────────────────────────────────────────────────────
  const origin = req.headers.origin ?? "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("[/api/somatic-echo] GOOGLE_API_KEY not set.");
    return res.status(500).json({ error: "API not configured." });
  }

  try {
    const { somatic, stressLevel = 50, energyLevel = 50, stressor } = req.body;

    if (!somatic || typeof somatic !== "string") {
      return res.status(400).json({ error: "somatic field is required." });
    }

    const toneInstruction = getToneInstruction(Number(stressLevel), Number(energyLevel));

    const systemPrompt = `You are a somatic awareness guide trained in ANS regulation and body-based coaching.

Client's reported body sensation: "${somatic}"
Current stressor context: "${stressor || 'unspecified'}"
Stress level: ${stressLevel}/100 | Energy level: ${energyLevel}/100

TASK:
Generate exactly ONE sentence that mirrors the client's body experience back to them.

STRICT RULES:
1. Do NOT analyze, interpret, or explain the sensation.
2. Do NOT offer advice, reframes, or questions.
3. Do NOT use clinical language (no "nervous system", "cortisol", "dysregulation").
4. The sentence must reference the specific body location or sensation: "${somatic}"
5. The sentence should make the client feel witnessed — not diagnosed.
6. Write in second person ("Your...").
7. Maximum 20 words.
8. ${toneInstruction}

GOOD EXAMPLES:
- "Your shoulders have been carrying this longer than this moment."
- "Something in your chest arrived here before you did."
- "Your jaw knows what your calendar hasn't admitted yet."

BAD EXAMPLES (never do these):
- "It sounds like you're experiencing stress." (analyzing)
- "Try to notice your breath." (advice)
- "Your nervous system is activated." (clinical)

Return ONLY the sentence. No quotes. No punctuation beyond the final period.`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: "Generate the somatic echo sentence now." }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.85, // Slightly creative — each echo should feel fresh
        maxOutputTokens: 60, // Hard cap — one sentence only
        topP: 0.92,
      }
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("[/api/somatic-echo] Gemini error:", geminiRes.status, data);
      return res.status(200).json({ 
        echo: getSomaticFallback(somatic),
        source: "fallback"
      });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const echo = rawText
      .trim()
      .replace(/^["']|["']$/g, "") // Strip surrounding quotes if model adds them
      .replace(/\n/g, " ") // Collapse any line breaks
      .trim();

    if (!echo || echo.length < 5) {
      return res.status(200).json({ 
        echo: getSomaticFallback(somatic),
        source: "fallback" 
      });
    }

    return res.status(200).json({ echo, source: "ai" });

  } catch (err) {
    console.error("[/api/somatic-echo] Unexpected error:", err);
    return res.status(200).json({ 
      echo: getSomaticFallback(req.body?.somatic ?? ""),
      source: "fallback"
    });
  }
}
