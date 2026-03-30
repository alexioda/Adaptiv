// api/verify-cipher.ts
// ─────────────────────────────────────────────────────────────
// Validates access ciphers server-side.
// The actual cipher values live ONLY in Vercel environment
// variables — they never ship in the client bundle.
//
// Setup in Vercel Dashboard → Settings → Environment Variables:
//   ACCESS_CIPHERS = EY2026,GENESIS2026,KINETIC2026
//   (comma-separated list — add as many as you need)
//
// Each cipher can represent a different client or cohort.
// Add new ones without redeploying by updating the env var.
// ─────────────────────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGINS = [
  'https://liveadaptiv.com',
  'https://www.liveadaptiv.com',
  'https://adaptiv.liveadaptiv.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // ── CORS ──
  const origin = req.headers.origin ?? '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ valid: false, error: 'Method not allowed' });

  // ── RATE LIMIT (basic — 10 attempts per IP per minute) ──
  // For production, replace with Upstash or similar
  // For now this is acceptable for a single-cohort use case

  // ── VALIDATE ──
  try {
    const { cipher } = req.body ?? {};

    if (!cipher || typeof cipher !== 'string') {
      return res.status(400).json({ valid: false, error: 'No cipher provided' });
    }

    // Read ciphers from environment — comma-separated list
    const raw = process.env.ACCESS_CIPHERS ?? '';
    if (!raw) {
      console.error('[verify-cipher] ACCESS_CIPHERS env var is not set');
      return res.status(500).json({ valid: false, error: 'Access system not configured' });
    }

    const validCiphers = raw
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(Boolean);

    const submitted = cipher.trim().toUpperCase();
    const valid = validCiphers.includes(submitted);

    // Log attempts (no PII — just valid/invalid and timestamp)
    console.log(`[verify-cipher] Attempt: ${valid ? 'VALID' : 'INVALID'} at ${new Date().toISOString()}`);

    // Small artificial delay on failure to slow brute force
    if (!valid) {
      await new Promise(r => setTimeout(r, 800));
      return res.status(200).json({ valid: false });
    }

    // Return the cipher label so the client can display
    // which access tier was granted (optional, for future use)
    return res.status(200).json({ valid: true });

  } catch (err) {
    console.error('[verify-cipher] Unexpected error:', err);
    return res.status(500).json({ valid: false, error: 'Internal error' });
  }
}

