import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_MODEL   = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // ── 1. DYNAMIC CORS (Fixes Vercel Preview blocks) ─────────
  // This allows the API to work regardless of which Vercel URL you are on
  const origin = req.headers.origin ?? "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Pre-flight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── 2. API KEY VALIDATION ─────────────────────────────────
  // CRITICAL: Ensure your Vercel Environment Variable is named EXACTLY: GOOGLE_API_KEY
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("[/api/ai] CRITICAL: GOOGLE_API_KEY environment variable is not set.");
    return res.status(500).json({ error: "API not configured." });
  }

  // ── 3. FORWARD REQUEST TO GEMINI ──────────────────────────
  try {
    const body = req.body;

    if (!body?.contents || !Array.isArray(body.contents)) {
      return res.status(400).json({ error: "Invalid request body." });
    }

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
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
