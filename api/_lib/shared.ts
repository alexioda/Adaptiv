// api/_lib/shared.ts — LiveAdaptiv shared server helpers
// ─────────────────────────────────────────────────────────────
// One place for: origin enforcement, rate limiting, crisis
// screening, scale normalisation, voice rules, and the Gemini
// call itself (timeout + safety + token caps + finishReason
// handling). Every endpoint imports from here.
// ─────────────────────────────────────────────────────────────

export const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const ALLOWED_ORIGINS = [
  'https://liveadaptiv.com',
  'https://www.liveadaptiv.com',
  'https://app.liveadaptiv.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

// Vercel preview deploys get a generated hostname on every push, so they
// can never be listed above. Without this, every preview build 403s and
// the whole app silently falls back to canned text — which looks exactly
// like a broken deploy. Previews are allowed only when NOT in production.
const ALLOW_VERCEL_PREVIEWS = process.env.VERCEL_ENV !== 'production';
const VERCEL_PREVIEW_RE = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

export function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (ALLOW_VERCEL_PREVIEWS && VERCEL_PREVIEW_RE.test(origin)) return true;
  return false;
}

const MAX_BODY_BYTES = 8_000;
const REQUEST_TIMEOUT_MS = 15_000;

// ── SAFETY ───────────────────────────────────────────────────
// BLOCK_ONLY_HIGH, not BLOCK_NONE.
//
// Gemini's default is BLOCK_MEDIUM_AND_ABOVE, which trips on
// ordinary distress language — "I'm exhausted", "I'm done",
// anything about a correctional setting. That is almost
// certainly why generation felt broken before. BLOCK_ONLY_HIGH
// is far more permissive than the default while still stopping
// genuinely egregious output. Real crisis handling happens in
// screenForCrisis() below, before the model is ever called.
export const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
];

// ── VOICE ────────────────────────────────────────────────────
export const VOICE = `
LIVEADAPTIV VOICE — these rules are absolute.

NEVER use these words: leverage, optimize, unlock, game-changer,
journey, passion, seamless, intentional (as a lifestyle adjective),
empower, holistic, transformative.

ALWAYS substitute:
  friction, not stress          metabolize, not manage
  sovereign, not in control     decree, not commitment
  protocol, not exercise        alchemy, not transformation

STYLE: Short declarative sentences. Specificity over abstraction.
Plain words. No therapy-speak, no coaching clichés, no mysticism,
no exclamation marks, no em-dash pile-ups.

BOUNDARIES: You are not a clinician. Never diagnose, never name a
disorder, never imply medical or clinical authority, never promise
an outcome. Reflect and direct — do not assess.`.trim();

// ── CRISIS GATE ──────────────────────────────────────────────
// The patterns live in ./crisis so the client can run the same screen
// before a request goes out (see that file for the rules on editing it).
import { screenForCrisis, CRISIS_MESSAGE } from './crisis';
export { screenForCrisis, CRISIS_MESSAGE };

export function crisisResponse(cors: Record<string, string>): Response {
  return json({ crisis: true, message: CRISIS_MESSAGE, source: 'crisis' }, 200, cors);
}

// ── SCALES ───────────────────────────────────────────────────
// The client sliders are 1–10. Older code assumed 0–100. Accept
// either, normalise to 0–100 so tone thresholds actually fire.
export function normalizeScale(raw: unknown, fallback = 50): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  if (n <= 10) return Math.round(Math.max(1, n) * 10);
  return Math.round(Math.min(100, Math.max(0, n)));
}

export const KINETIC_STATES: Record<number, string> = {
  1: 'Depleted', 2: 'Bracing', 3: 'Coping', 4: 'Absorbing',
  5: 'Momentum', 6: 'Flow', 7: 'Sovereign',
};

export const KINETIC_LADDER = Object.entries(KINETIC_STATES)
  .map(([n, label]) => `${n} = ${label}`).join(', ');

// ── INPUT HYGIENE ────────────────────────────────────────────
// User text goes into the prompt as clearly-delimited data, never
// as bare interpolation, and always length-capped.
export function clean(raw: unknown, max = 400): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/```/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function asData(label: string, value: string): string {
  return value ? `<${label}>\n${value}\n</${label}>` : '';
}

// ── HTTP ─────────────────────────────────────────────────────
export function json(payload: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function corsFor(origin: string): Record<string, string> {
  const h: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (isAllowedOrigin(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

// Weak per-instance limiter. Edge instances are ephemeral, so this
// blunts casual abuse rather than stopping a determined attacker.
// For hard limits put Upstash/Vercel KV behind this function.
const hits = new Map<string, { n: number; reset: number }>();
const LIMIT = 20;
const WINDOW_MS = 60_000;

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

export type Guard =
  | { ok: true; body: Record<string, unknown>; cors: Record<string, string>; apiKey: string }
  | { ok: false; response: Response };

// Every endpoint starts with this. Enforces method, origin,
// body size and rate limit, and reads the API key.
export async function guard(req: Request): Promise<Guard> {
  const origin = req.headers.get('origin') ?? '';
  const cors = corsFor(origin);

  if (req.method === 'OPTIONS') {
    return { ok: false, response: new Response(null, { status: 204, headers: cors }) };
  }
  if (req.method !== 'POST') {
    return { ok: false, response: json({ error: 'Method not allowed' }, 405, cors) };
  }

  // The old code set CORS headers but still served every request —
  // CORS is a browser convention, so curl sailed straight through.
  // Now a disallowed origin is actually refused.
  const sameSite = req.headers.get('sec-fetch-site');
  const originOk = isAllowedOrigin(origin) || (!origin && sameSite === 'same-origin');
  if (!originOk) {
    return { ok: false, response: json({ error: 'Forbidden' }, 403, cors) };
  }

  if (rateLimited(req)) {
    return { ok: false, response: json({ error: 'Too many requests' }, 429, cors) };
  }

  const raw = await req.text().catch(() => '');
  if (raw.length > MAX_BODY_BYTES) {
    return { ok: false, response: json({ error: 'Payload too large' }, 413, cors) };
  }

  let body: Record<string, unknown> = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch {
    return { ok: false, response: json({ error: 'Invalid JSON' }, 400, cors) };
  }

  const apiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // A missing key must not stop the request here: every endpoint runs its
  // crisis screen after guard(), and a 500 at this point skipped it.
  // generate() returns an empty result without a key, so the endpoint
  // still screens and then falls back to its canned content.
  if (!apiKey) console.error('[liveadaptiv] GEMINI_API_KEY missing');

  return { ok: true, body, cors, apiKey: apiKey ?? '' };
}

// ── GEMINI ───────────────────────────────────────────────────
export interface GenOpts {
  apiKey: string;
  system: string;
  user?: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}

export interface GenResult {
  text: string;
  blocked: boolean;
  reason: string;
}

export async function generate(opts: GenOpts): Promise<GenResult> {
  const {
    apiKey, system, user = 'Proceed.',
    temperature = 0.8, maxOutputTokens = 300, jsonMode = false,
  } = opts;

  // Gemini 2.5 counts internal reasoning tokens against maxOutputTokens.
  // With a tight ceiling the model can spend the entire budget thinking and
  // return a truncated fragment ("There is a") with finishReason MAX_TOKENS.
  // These are all short, single-shot generations that need no deliberation,
  // so thinking is disabled and a floor is applied as belt-and-braces.
  const generationConfig: Record<string, unknown> = {
    temperature,
    maxOutputTokens: Math.max(maxOutputTokens, 256),
    topP: 0.92,
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (jsonMode) generationConfig.responseMimeType = 'application/json';

  if (!apiKey) return { text: '', blocked: false, reason: 'no_api_key' };

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: user }] }],
        systemInstruction: { parts: [{ text: system }] },
        safetySettings: SAFETY_SETTINGS,
        generationConfig,
      }),
    });

    if (!res.ok) {
      console.error('[liveadaptiv] gemini http', res.status);
      return { text: '', blocked: false, reason: `http_${res.status}` };
    }

    const data = await res.json();

    // A prompt-level block returns no candidates at all.
    const promptBlock = data?.promptFeedback?.blockReason;
    if (promptBlock) {
      console.warn('[liveadaptiv] prompt blocked:', promptBlock);
      return { text: '', blocked: true, reason: `prompt_${promptBlock}` };
    }

    const candidate = data?.candidates?.[0];
    const finish = candidate?.finishReason ?? '';
    const text = (candidate?.content?.parts?.[0]?.text ?? '').trim();

    if (!text) {
      if (finish === 'SAFETY') {
        console.warn('[liveadaptiv] candidate blocked by safety');
        return { text: '', blocked: true, reason: 'candidate_safety' };
      }
      return { text: '', blocked: false, reason: finish || 'empty' };
    }

    // Truncated output is worse than no output — a half sentence shown to a
    // user reads as a broken app. Reject it so the caller's fallback runs.
    if (finish === 'MAX_TOKENS' && !/[.!?"'\}\]]\s*$/.test(text)) {
      console.warn('[liveadaptiv] truncated generation discarded');
      return { text: '', blocked: false, reason: 'MAX_TOKENS_truncated' };
    }

    return { text, blocked: false, reason: finish || 'STOP' };

  } catch (err) {
    const reason = (err as Error)?.name === 'TimeoutError' ? 'timeout' : 'network';
    console.error('[liveadaptiv] gemini error:', reason);
    return { text: '', blocked: false, reason };
  }
}

// Strip fences/preamble and pull the first JSON object out.
export function extractJson<T>(text: string): T | null {
  if (!text) return null;
  const stripped = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped) as T; } catch { /* fall through */ }
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try { return JSON.parse(stripped.slice(start, end + 1)) as T; } catch { return null; }
}

// Model sometimes wraps a single line in quotes despite instructions.
export function unquote(s: string): string {
  return s.trim().replace(/^["'“”']+|["'“”']+$/g, '').replace(/\s+/g, ' ').trim();
}
