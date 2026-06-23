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

export const config = { runtime: 'edge' };

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const ALLOWED_ORIGINS = [
  "https://liveadaptiv.com",
  "https://www.liveadaptiv.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

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

function getToneInstruction(stressLevel: number, energyLevel: number): string {
  if (stressLevel >= 75) return "Tone: Slow. Grounding. Almost a whisper. The sentence should feel like a hand on the shoulder.";
  if (energyLevel <= 35) return "Tone: Gentle. Compassionate. The sentence should feel like permission to rest.";
  if (stressLevel <= 40 && energyLevel >= 65) return "Tone: Clear and direct. The sentence should feel like a precise observation.";
  return "Tone: Warm but honest. The sentence should feel like a trusted colleague pausing to notice.";
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("origin") ?? "";
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
  });

  const apiKey = (globalThis as any).GOOGLE_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "API not configured." }), {
    status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
  });

  try {
    const { somatic = "", stressor = "", stressLevel = 50, energyLevel = 50 } = await req.json();

    if (!somatic) return new Response(JSON.stringify({ error: "somatic field required." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

    const toneInstruction = getToneInstruction(Number(stressLevel), Number(energyLevel));

    const systemPrompt = `You are a somatic awareness guide trained in ANS regulation.

Client body sensation: "${somatic}"
Stressor context: "${stressor}"
Stress: ${stressLevel}/100 | Energy: ${energyLevel}/100

Generate exactly ONE sentence mirroring the client's body experience back to them.

RULES:
1. Do NOT analyze or interpret. Do NOT give advice.
2. No clinical language.
3. Reference the specific sensation: "${somatic}"
4. Second person ("Your..."). Maximum 20 words.
5. ${toneInstruction}

Return ONLY the sentence. No quotes. No extra punctuation.`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: "Generate the somatic echo." }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.85, maxOutputTokens: 60, topP: 0.92 }
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const echo = rawText.trim().replace(/^["']|["']$/g, "").replace(/\n/g, " ").trim();

    return new Response(
      JSON.stringify({ echo: echo || getSomaticFallback(somatic), source: echo ? "ai" : "fallback" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const { somatic = "" } = await req.json().catch(() => ({}));
    return new Response(
      JSON.stringify({ echo: getSomaticFallback(somatic), source: "fallback" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
