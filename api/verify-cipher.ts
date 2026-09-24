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
import { isAllowedOrigin, json } from './_lib/shared';

export const config = { runtime: 'edge' };

function corsFor(origin: string): Record<string, string> {
  const h: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (isAllowedOrigin(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

// 8 attempts / 10 minutes / IP.
const hits = new Map<string, { n: number; reset: number }>();
const LIMIT = 8;
const WINDOW_MS = 10 * 60_000;

function rateLimited(req: Request): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.reset) {
    hits.set(ip, { n: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  rec.n += 1;
  return rec.n > LIMIT;
}

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
