# LiveAdaptiv — Adaptiv App

React + TypeScript (Vite) client in `src/`, Vercel Edge Functions in `api/`,
deployed by the Vercel project `adaptiv`. Pushing to `main` deploys to
production.

## Layout
- `src/App.tsx` — the whole client: every screen is a `viewState` string, not a
  router. Add screens the same way.
- `src/lib/adaptivAI.ts` — the only place the client calls the API. Each
  function returns usable data even when the network fails.
- `api/*.ts` — one endpoint per AI job (`reflection`, `horizon-question`,
  `horizon-validation`, `coaching-questions`, `somatic-echo`, `manifesto`,
  `energy-analysis`, `pattern-insight`), plus `verify-cipher` (access codes, no AI).
- `api/_lib/shared.ts` — shared server code: origin check, rate limit, crisis
  gate, scale normalisation, voice rules, the Gemini call. The underscore stops
  Vercel from deploying `_lib` as an endpoint. `src/lib/adaptivAI.ts` lives in
  `src/`, not `api/` — a misplaced copy of either broke the build once (#5).

## Architecture rules
- Every endpoint is `export default async function handler(req: Request)` with
  `export const config = { runtime: 'edge' }`. Never `export async function
  POST` — that is Next.js App Router and does not route here.
- AI endpoints start with `guard(req)`. It refuses non-POST, disallowed origins,
  oversized bodies (8 KB), and more than 20 requests/minute/IP, and checks the
  API key.
- Endpoints return 200 with usable content even when the model fails. Callers
  never see a 500 for a model failure.
- Every AI response carries `source: 'ai' | 'fallback' | 'partial' | 'crisis'`,
  and the label must match what is actually returned. `trace()` in
  `adaptivAI.ts` logs it on localhost and `*.vercel.app` previews.
- Prompts live server-side only. User text goes into prompts through `clean()`
  and `asData()` as delimited data, never as bare interpolation.
- Model: `gemini-2.5-flash`, `thinkingBudget: 0`. Output cut off at the token
  limit is discarded, not shown half-finished.

## Safety — non-negotiable
- Safety settings stay at `BLOCK_ONLY_HIGH`. Never `BLOCK_NONE`. (Gemini's
  default, `BLOCK_MEDIUM_AND_ABOVE`, trips on ordinary distress language.)
- `screenForCrisis()` runs before any model call on every endpoint that touches
  user text. Never remove it or move it after generation.
- A crisis response is never followed by generated content, upsells, share
  buttons, or level readouts. The client shows the bare `Crisis` view.
- Tuning the crisis gate: `CRISIS_PATTERNS` and `CONTRACTIONS` in `shared.ts`.
  Test both directions every time. It must fire on "I do not want to be here
  anymore" / "don't" / "dont", "I can't go on", "I want to kill myself", and
  stay quiet on "I cannot go on with this vendor", "die on that hill", "this
  project is killing me", "I'm dead tired", "I could kill for a coffee".

## Origins and domains
- `ALLOWED_ORIGINS` in `api/_lib/shared.ts`: `liveadaptiv.com`,
  `www.liveadaptiv.com`, `app.liveadaptiv.com`, localhost 3000/5173.
  `*.vercel.app` previews are allowed only when `VERCEL_ENV !== 'production'`.
- Requests from any other origin get 403. A new production domain must be added
  here, or every AI call on it silently falls back to canned text.

## Environment variables (Vercel project `adaptiv`)
- `GEMINI_API_KEY` (falls back to `GOOGLE_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`).
- `ACCESS_CIPHERS` — comma-separated access codes for `api/verify-cipher.ts`,
  case-insensitive. This is the only name for it. Do not add `VALID_CIPHERS`.
- Read them with `process.env`, never `globalThis`.

## Access and payment
- Free first cycle, then `CheckoutGate` (Lemon Squeezy links at
  `billing.liveadaptiv.com`). "Have an access code?" on the same screen calls
  `/api/verify-cipher`; a valid code sets `la_adaptiv_manual_access` in
  localStorage and the user is never routed back to checkout.
- Access is client-side state only, not server-side entitlement.

## Voice (the `VOICE` block in `shared.ts` applies it to every prompt)
Never: leverage, optimize, unlock, game-changer, journey, passion, seamless,
intentional (as a lifestyle adjective), empower, holistic, transformative.
Always: friction not stress · metabolize not manage · sovereign not in control ·
decree not commitment · protocol not exercise · alchemy not transformation.
Short declarative sentences. No therapy-speak. Never diagnose or imply clinical
authority. Avoid iPEC's trademarked "Energy Leadership", "catabolic" and
"anabolic" — use "Kinetic States" (1 Depleted … 7 Sovereign).

## Coaching questions
The standard lives in the `coaching-questions.ts` prompt: four questions
(MIRROR, PIVOT, VISION, CATALYST), each tied to the person's own details. Never
the generic shapes ("what would it look like if", "what's holding you back",
"best self", "one small step", "how does that make you feel", anything starting
"Why", anything answerable yes/no). The fallback questions follow the same rule,
and the server and client copies must stay identical.

## Careful with
- Every slider in the app is 1–10. `normalizeScale()` converts to 0–100 for
  prompt thresholds. Don't "simplify" it — a mismatch once made three of four
  somatic-echo tones unreachable.
- Scroll containers need `min-h-0` alongside `flex-1 overflow-y-auto`, or
  buttons fall off the bottom of the viewport.
- Vite loads `vite.config.js` before `vite.config.ts`. Both are committed and
  currently identical; change them together (or delete the `.js`).
- `clearCycleState()` in `App.tsx` resets one cycle's answers. When adding cycle
  state, add it there too, or it bleeds into the next session.

## Verify before pushing
```bash
npm ci
npm run build        # tsc -b && vite build
```
There is no test suite, and `npm run lint` currently fails on its own config.
For AI changes, check the browser console on a preview: `[adaptiv:*]` lines
show `ai` or `fallback` for each call. `fallback` on every call means the
endpoints aren't being reached.

## How we work
- Change code on a branch and merge through a PR. Don't upload files through
  GitHub's web editor — that is how `adaptivAI.ts` and `shared.ts` once landed
  in the wrong folders and broke the build for weeks.
- One Claude session per repo at a time. Parallel sessions produced
  overlapping branches that conflicted.
