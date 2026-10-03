// api/verify-license.ts — Lemon Squeezy license keys unlock the app.
// ─────────────────────────────────────────────────────────────
// A Monthly Access purchase comes with a license key (in the receipt
// email and on the buyer's Lemon Squeezy order page). Entering it on the
// checkout screen unlocks the app. The client re-checks it about once a
// day, so access ends when the subscription does.
//
// First use on a device ACTIVATES the key, which takes one of its
// activation slots (the limit is set on the product in Lemon Squeezy).
// Re-checks VALIDATE that activation by its instance id, so a key posted
// publicly stops working once its slots are used.
//
// The License API needs no secret and answers "valid" for any Lemon
// Squeezy key from any store, so every answer is also checked against our
// store and the allowed variants before we say yes.
//
// Env (Vercel project `adaptiv`):
//   LEMONSQUEEZY_STORE_ID          numeric store id
//   LEMONSQUEEZY_ALLOWED_VARIANTS  comma-separated variant ids whose keys
//                                  unlock the app (monthly, yearly)
//   LEMONSQUEEZY_API_BASE          optional; local tests point it at a stub
//
// Like verify-cipher this does not use guard(): no AI, no API key, and a
// tighter rate limit, because a key check is a brute-force target.
// ─────────────────────────────────────────────────────────────
import { isAllowedOrigin, corsFor, json, createLimiter } from './_lib/shared';

export const config = { runtime: 'edge' };

// 8 attempts / 10 minutes / IP, the same budget as access codes.
const rateLimited = createLimiter(8, 10 * 60_000);

const INSTANCE_NAME = 'Adaptiv web app';
const TIMEOUT_MS = 8_000;

export type LicenseReason =
  | 'invalid' | 'wrong_product' | 'expired' | 'limit' | 'not_configured' | 'unavailable';

interface LsLicense {
  valid?: boolean;
  activated?: boolean;
  error?: string | null;
  license_key?: { status?: string; expires_at?: string | null };
  instance?: { id?: string } | null;
  meta?: { store_id?: number; product_id?: number; variant_id?: number };
}

type LsResult = { ok: true; data: LsLicense } | { ok: false };

async function callLs(path: 'validate' | 'activate', fields: Record<string, string>): Promise<LsResult> {
  const base = (process.env.LEMONSQUEEZY_API_BASE || 'https://api.lemonsqueezy.com').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/v1/licenses/${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields).toString(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // 4xx carries a JSON verdict (unknown key, limit reached); 5xx and 429
    // mean Lemon Squeezy couldn't answer, which is not the same as "no".
    if (res.status >= 500 || res.status === 429) return { ok: false };
    const data = (await res.json().catch(() => ({}))) as LsLicense;
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

// Our store, an allowed variant, not disabled, not expired.
function problem(d: LsLicense, storeId: string, variants: string[]): LicenseReason | null {
  const store = String(d.meta?.store_id ?? '');
  const variant = String(d.meta?.variant_id ?? '');
  if (store !== storeId || !variants.includes(variant)) {
    // Ids only, never the key: shows in the Vercel logs if a real purchase
    // is refused because the configured ids are wrong.
    console.warn('[liveadaptiv] license refused: store', store, 'product', d.meta?.product_id, 'variant', variant);
    return 'wrong_product';
  }
  const status = d.license_key?.status;
  if (status === 'expired') return 'expired';
  if (status === 'disabled') return 'invalid';
  const exp = d.license_key?.expires_at;
  if (exp && Date.parse(exp) < Date.now()) return 'expired';
  return null;
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
    if (raw.length > 1_000) return json({ valid: false }, 413, cors);
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return json({ valid: false }, 400, cors);
  }

  const verdict = (valid: boolean, extra: Record<string, unknown> = {}) =>
    json({ valid, ...extra }, 200, cors);

  const key = typeof body.key === 'string' ? body.key.trim() : '';
  const instanceId = typeof body.instanceId === 'string' ? body.instanceId.trim() : '';
  if (!/^[A-Za-z0-9-]{8,100}$/.test(key) || (instanceId && !/^[A-Za-z0-9_-]{1,100}$/.test(instanceId))) {
    return verdict(false, { reason: 'invalid' });
  }

  const storeId = (process.env.LEMONSQUEEZY_STORE_ID || '').trim();
  const variants = (process.env.LEMONSQUEEZY_ALLOWED_VARIANTS || '')
    .split(',').map(v => v.trim()).filter(Boolean);
  if (!storeId || variants.length === 0) {
    console.error('[liveadaptiv] LEMONSQUEEZY_STORE_ID / LEMONSQUEEZY_ALLOWED_VARIANTS missing');
    return verdict(false, { reason: 'not_configured' });
  }

  // ── Re-check on a device that already activated ──
  if (instanceId) {
    const r = await callLs('validate', { license_key: key, instance_id: instanceId });
    if (!r.ok) return verdict(false, { reason: 'unavailable' });
    if (!r.data.valid) {
      return verdict(false, { reason: r.data.license_key?.status === 'expired' ? 'expired' : 'invalid' });
    }
    const p = problem(r.data, storeId, variants);
    if (p) return verdict(false, { reason: p });
    return verdict(true, { instanceId, expiresAt: r.data.license_key?.expires_at ?? null });
  }

  // ── First use on this device ──
  // Validate before activating, so a key from another store or product
  // never spends one of its activation slots here.
  const pre = await callLs('validate', { license_key: key });
  if (!pre.ok) return verdict(false, { reason: 'unavailable' });
  // An unknown key comes back without meta. A real key that has never been
  // activated can answer valid:false with status "inactive", so store,
  // variant and status decide here, and activation has the last word.
  if (!pre.data.meta) return verdict(false, { reason: 'invalid' });
  const p = problem(pre.data, storeId, variants);
  if (p) return verdict(false, { reason: p });

  const act = await callLs('activate', { license_key: key, instance_name: INSTANCE_NAME });
  if (!act.ok) return verdict(false, { reason: 'unavailable' });
  if (!act.data.activated || !act.data.instance?.id) {
    const limit = /activation limit/i.test(act.data.error ?? '');
    return verdict(false, { reason: limit ? 'limit' : 'invalid' });
  }
  return verdict(true, {
    instanceId: act.data.instance.id,
    expiresAt: act.data.license_key?.expires_at ?? null,
  });
}
