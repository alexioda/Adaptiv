// api/verify-cipher.ts — Manual access-code unlock.
// ─────────────────────────────────────────────────────────────
// Lets Alex hand a code to someone (comp, beta tester, partner)
// that grants full access without Lemon Squeezy checkout. Checked
// against ACCESS_CIPHERS — a comma-separated allowlist env var,
// e.g. "BETA2026,FRIEND-ALEX,COMP-PODCAST".
//
// This does NOT use guard() from ./_lib/shared: guard() requires
// a Gemini API key and applies the AI endpoints' rate limit, and
// this endpoint calls no AI. It gets its own tighter limit — a
// short code is a brute-force target, not a cost-abuse target.
// ─────────────────────────────────────────────────────────────
import { isAllowedOrigin, corsFor, json, createLimiter } from './_lib/shared';

export const config = { runtime: 'edge' };

// 8 attempts / 10 minutes / IP.
const rateLimited = createLimiter(8, 10 * 60_000);

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin') ?? '';
  const cors = corsFor(origin);

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);

  const sameSite = req.headers.get('sec-fetch-site');
  const originOk = isAllowedOrigin(origin) || (!origin && sameSite === 'same-origin');
  if (!originOk) return json({ valid: false }, 403, cors);

  if (rateLimited(req)) return json({ valid: false }, 429, cors);

  let body: Record<string, unknown> = {};
  try {
    const raw = await req.text();
    if (raw.length > 1_000) return json({ valid: false }, 413, cors);
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return json({ valid: false }, 400, cors);
  }

  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!code) return json({ valid: false }, 400, cors);

  const validCiphers = (process.env.ACCESS_CIPHERS || '')
    .split(',')
    .map(c => c.trim().toUpperCase())
    .filter(Boolean);

  const valid = validCiphers.includes(code.toUpperCase());
  return json({ valid }, 200, cors);
}
