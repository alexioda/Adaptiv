// /api/ai.ts  —  Vercel Serverless Function (Edge-compatible)
// ─────────────────────────────────────────────────────────────
// This file lives at:  your-project/api/ai.ts
//
// It proxies all Gemini API calls from the client so your
// GOOGLE_API_KEY never ships in the browser bundle.
//
// Setup:
//   1. Add GOOGLE_API_KEY to your Vercel project environment variables
//      Dashboard → Your Project → Settings → Environment Variables
//   2. Deploy. The function is automatically available at /api/ai
// ─────────────────────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_MODEL   = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Allowed origins — update with your actual production domain
const ALLOWED_ORIGINS = [
  "https://liveadaptiv.com",
  "https://www.liveadaptiv.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // ── CORS ──────────────────────────────────────────────────
  const origin = req.headers.origin ?? "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Pre-flight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── API KEY (server-side only, never sent to client) ──────
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("[/api/ai] GOOGLE_API_KEY environment variable is not set.");
    return res.status(500).json({ error: "API not configured." });
  }

  // ── FORWARD REQUEST TO GEMINI ─────────────────────────────
  try {
    const body = req.body;

    // Basic validation — must have contents array
    if (!body?.contents || !Array.isArray(body.contents)) {
      return res.status(400).json({ error: "Invalid request body." });
    }

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    // Forward the exact status and body from Gemini
    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("[/api/ai] Gemini error:", geminiRes.status, data);
      return res.status(geminiRes.status).json(data);
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("[/api/ai] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
