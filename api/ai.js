const GEMINI_MODEL   = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export default async function handler(req, res) {
  // ── 1. DYNAMIC CORS ─────────
  const origin = req.headers.origin ?? "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── 2. API KEY VALIDATION ─────────────────────────────────
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("[/api/ai] CRITICAL: GOOGLE_API_KEY environment variable is not set.");
    return res.status(500).json({ error: "API not configured." });
  }

  // ── 3. HARDENED SAFETY SETTINGS ───────────────────────────
  const SAFE_SAFETY_SETTINGS = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  ];

  // ── 4. FORWARD REQUEST TO GEMINI ──────────────────────────
  try {
    const body = req.body;

    if (!body?.contents || !Array.isArray(body.contents)) {
      return res.status(400).json({ error: "Invalid request body." });
    }

    const { safetySettings, ...restBody } = body;
    const securePayload = {
      ...restBody,
      safetySettings: SAFE_SAFETY_SETTINGS,
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(securePayload),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("[/api/ai] Gemini error:", geminiRes.status, data);
      return res.status(geminiRes.status).json(data);
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("[/api/ai] Unexpected server error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
