// src/lib/adaptivAI.ts
// ─────────────────────────────────────────────────────────────
// Replaces every inline AI helper in App.tsx. The old callAI()
// and its /api/ai proxy are gone — each call now hits a narrow,
// server-side endpoint that owns its own prompt.
//
// Two behaviours worth knowing:
//   1. Endpoints always return 200 with usable content. A network
//      failure is the only path to the local fallback.
//   2. Any endpoint may return { crisis: true }. Callers must
//      handle that before rendering anything generative.
//   3. Every function that sends user text runs the crisis screen
//      here first, with the same patterns the server uses. That is
//      what makes a failed request safe: a 403, 429, timeout or
//      offline browser can only reach the fallback after the text
//      has already been screened.
// ─────────────────────────────────────────────────────────────

import { screenForCrisis, CRISIS_MESSAGE } from '../../api/_lib/crisis';

export { CRISIS_MESSAGE };

// For screens that collect text which is never sent to the API, or is
// sent later (Parts Work, Laser answers, the Integration cue).
export function isCrisisText(...fields: unknown[]): boolean {
  return screenForCrisis(...fields);
}

function localCrisis(label: string, ...fields: unknown[]): boolean {
  if (!screenForCrisis(...fields)) return false;
  trace(label, { source: 'crisis', reason: 'client-screen' });
  return true;
}

export interface EnergyAnalysis { level: number; reflection: string; }
export interface SessionRecord {
  date: string; stressor: string;
  preStress: number; postStress: number;
  preEnergy: number; postEnergy: number;
  coreFear: string; expandingBelief: string;
  commitment: string; energyLevel: number;
  // Laser Coaching answers; blank when skipped, absent on older records.
  story?: string; truthCheck?: string; signal?: string;
}
export interface HorizonValidation {
  acknowledgment: string; validation: string; pivot: string;
}

export interface AIResult<T> {
  data: T;
  crisis: boolean;
  crisisMessage?: string;
  source: 'ai' | 'fallback' | 'partial' | 'crisis' | 'error';
}

const TIMEOUT_MS = 20_000;

async function post<T>(path: string, payload: unknown): Promise<
  { ok: true; json: any } | { ok: false }
> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) { trace(path, { source: `http-${res.status}` }); return { ok: false }; }
    return { ok: true, json: await res.json() };
  } catch (e: any) {
    trace(path, { source: 'network-error', reason: e?.message });
    return { ok: false };
  }
}

// Dev-only visibility into whether the AI layer is actually live.
// Previously a dead endpoint just looked like a working app.
// Also fires on *.vercel.app preview deploys, so a preview build shows in
// the console whether each call hit the AI, fell back, or errored.
function trace(label: string, body: any) {
  if (typeof window === 'undefined') return;
  const host = window.location.hostname;
  if (host === 'localhost' || host.endsWith('.vercel.app')) {
    // eslint-disable-next-line no-console
    console.info(`[adaptiv:${label}]`, body?.source ?? 'network-error', body?.reason ?? '');
  }
}

// ── REFLECTION ───────────────────────────────────────────────
export async function analyzeCurrentEnergy(
  stressor: string, perception: string,
  stressLevel: number, energyLevel: number, frictionSource: string,
): Promise<AIResult<EnergyAnalysis>> {
  const depleted = stressLevel > 6 || energyLevel < 4;
  const fallback: EnergyAnalysis = {
    level: depleted ? 2 : 3,
    reflection: depleted
      ? 'This is weighing on you, and you have been carrying it for a while.'
      : 'This is on your mind, and it matters to you how it turns out.',
  };

  if (localCrisis('reflection', stressor, perception)) {
    return { data: { level: 1, reflection: CRISIS_MESSAGE }, crisis: true, crisisMessage: CRISIS_MESSAGE, source: 'crisis' };
  }

  const r = await post('/api/reflection', {
    stressor, perception, stressLevel, energyLevel, frictionSource,
  });
  if (!r.ok) return { data: fallback, crisis: false, source: 'error' };
  trace('reflection', r.json);

  if (r.json.crisis) {
    return {
      data: { level: 1, reflection: r.json.message },
      crisis: true, crisisMessage: r.json.message, source: 'crisis',
    };
  }
  return {
    data: { level: r.json.level ?? fallback.level, reflection: r.json.reflection ?? fallback.reflection },
    crisis: false, source: r.json.source ?? 'ai',
  };
}

// ── HORIZON ──────────────────────────────────────────────────
export async function generateHorizonQuestion(
  stressor: string, perception: string, history: string, turn = 1,
): Promise<AIResult<string>> {
  const fallback = 'What part of this bothers you most?';
  if (localCrisis('horizon-question', stressor, perception, history)) {
    return { data: CRISIS_MESSAGE, crisis: true, crisisMessage: CRISIS_MESSAGE, source: 'crisis' };
  }
  const r = await post('/api/horizon-question', { stressor, perception, history, turn });
  if (!r.ok) return { data: fallback, crisis: false, source: 'error' };
  trace('horizon-question', r.json);
  if (r.json.crisis) {
    return { data: r.json.message, crisis: true, crisisMessage: r.json.message, source: 'crisis' };
  }
  return { data: r.json.question || fallback, crisis: false, source: r.json.source ?? 'ai' };
}

export async function generateHorizonValidation(
  stressor: string, perception: string, history: string,
): Promise<AIResult<HorizonValidation>> {
  const fallback: HorizonValidation = {
    acknowledgment: 'I hear you.',
    validation: 'It makes sense that this is sitting heavily. You have been carrying it without much room to put it down.',
    pivot: 'We can clear this static and reclaim your bandwidth. To shift this, we need to locate it.',
  };
  if (localCrisis('horizon-validation', stressor, perception, history)) {
    return {
      data: { acknowledgment: '', validation: CRISIS_MESSAGE, pivot: '' },
      crisis: true, crisisMessage: CRISIS_MESSAGE, source: 'crisis',
    };
  }
  const r = await post('/api/horizon-validation', { stressor, perception, history });
  if (!r.ok) return { data: fallback, crisis: false, source: 'error' };
  trace('horizon-validation', r.json);
  if (r.json.crisis) {
    return {
      data: { acknowledgment: '', validation: r.json.message, pivot: '' },
      crisis: true, crisisMessage: r.json.message, source: 'crisis',
    };
  }
  return {
    data: {
      acknowledgment: r.json.acknowledgment || fallback.acknowledgment,
      validation: r.json.validation || fallback.validation,
      pivot: r.json.pivot || fallback.pivot,
    },
    crisis: false, source: r.json.source ?? 'ai',
  };
}

// ── PATTERN ──────────────────────────────────────────────────
// Crisis hits are returned, not swallowed: the dashboard raises the
// Crisis view for them the same way the session screens do.
export async function generatePatternInsight(history: SessionRecord[]): Promise<AIResult<string>> {
  if (history.length < 2) return { data: '', crisis: false, source: 'fallback' };
  const sessions = history.slice(0, 5).map(s => ({
    date: s.date, stressor: s.stressor, coreFear: s.coreFear,
    preStress: s.preStress, postStress: s.postStress,
  }));
  if (localCrisis('pattern-insight', ...sessions.flatMap(s => [s.stressor, s.coreFear]))) {
    return { data: '', crisis: true, crisisMessage: CRISIS_MESSAGE, source: 'crisis' };
  }
  const r = await post('/api/pattern-insight', { sessions });
  if (!r.ok) return { data: '', crisis: false, source: 'error' };
  trace('pattern-insight', r.json);
  if (r.json.crisis) {
    return { data: '', crisis: true, crisisMessage: r.json.message, source: 'crisis' };
  }
  return { data: r.json.insight ?? '', crisis: false, source: r.json.source ?? 'ai' };
}

// ── SOMATIC ECHO ─────────────────────────────────────────────
const ECHO_FALLBACKS: Record<string, string> = {
  chest: "Your chest is holding something your words haven't named yet.",
  throat: 'There is something in your throat that knows it needs to be said.',
  stomach: 'Your gut already has an answer your mind is still debating.',
  gut: 'Your gut already has an answer your mind is still debating.',
  solar: 'Something in your centre has been braced for a while now.',
  jaw: 'Your jaw has been bracing against something longer than today.',
  shoulders: 'The weight on your shoulders has been accumulating quietly.',
  back: 'Your back has been carrying the shape of this for a while.',
  hands: 'Your hands are holding a readiness nothing has asked for yet.',
  eyes: 'Your eyes have been scanning for a threat that already passed.',
  head: 'Your mind is moving faster than your body can follow right now.',
  default: 'Your body arrived here carrying something worth listening to.',
};

export async function getSomaticEcho(
  somatic: string, stressor: string, stressLevel: number, energyLevel: number,
): Promise<AIResult<string>> {
  const lower = (somatic || '').toLowerCase();
  const key = Object.keys(ECHO_FALLBACKS).find(k => k !== 'default' && lower.includes(k));
  const fallback = ECHO_FALLBACKS[key ?? 'default'];

  if (localCrisis('somatic-echo', somatic, stressor)) {
    return { data: '', crisis: true, crisisMessage: CRISIS_MESSAGE, source: 'crisis' };
  }
  const r = await post('/api/somatic-echo', { somatic, stressor, stressLevel, energyLevel });
  if (!r.ok) return { data: fallback, crisis: false, source: 'error' };
  trace('somatic-echo', r.json);
  if (r.json.crisis) {
    return { data: '', crisis: true, crisisMessage: r.json.message, source: 'crisis' };
  }
  return { data: r.json.echo || fallback, crisis: false, source: r.json.source ?? 'ai' };
}

// ── COACHING QUESTIONS ───────────────────────────────────────
// Laser Coaching asks three questions (The Story, True or Familiar, The
// Signal); The Move's action question comes back in the same call. Every
// question has a simpler alternate for "Say it another way".
export interface QuestionPair { question: string; alternate: string }
export interface LaserQuestion extends QuestionPair { id: 'story' | 'truth' | 'signal' }
export interface CoachingQuestions { questions: LaserQuestion[]; move: QuestionPair }

// Same wording as api/coaching-questions.ts (truthPair and fallbacks), used
// when the network fails. The depleted test matches the server's on the
// 1-10 scale.
function coachingFallback(
  stressLevel: number, energyLevel: number, distortionType: 'fact' | 'assumption' | null,
): CoachingQuestions {
  const depleted = stressLevel > 6 || energyLevel < 4;
  const truth: QuestionPair = distortionType === 'assumption'
    ? { question: 'If that’s an assumption, what else could it mean?', alternate: 'What’s another way to read this?' }
    : distortionType === 'fact'
      ? { question: 'If that’s a fact, what part is still up to you?', alternate: 'What can you still choose here?' }
      : { question: 'Is that true, or just familiar?', alternate: 'Is this what’s happening, or what usually happens?' };
  return {
    questions: [
      { id: 'story', question: 'When this happens, what do you tell yourself it means?', alternate: 'What does your mind say this means?' },
      { id: 'truth', ...truth },
      { id: 'signal', question: 'What does this show you that you care about?', alternate: 'What matters to you here?' },
    ],
    move: depleted
      ? { question: 'What can you stop doing about this for now?', alternate: 'What can you put down tonight?' }
      : { question: 'What will you do differently the next time this comes up?', alternate: 'What will you do next time?' },
  };
}

function isPair(p: any): p is QuestionPair {
  return p && typeof p.question === 'string' && p.question.trim() && typeof p.alternate === 'string' && p.alternate.trim();
}

export async function generateCoachingQuestions(
  stressor: string, perception: string, somatic: string,
  energyLevel: number, stressLevel: number,
  fear = '', distortionType: 'fact' | 'assumption' | null = null,
): Promise<AIResult<CoachingQuestions>> {
  const fallback = coachingFallback(stressLevel, energyLevel, distortionType);

  if (localCrisis('coaching-questions', stressor, perception, somatic, fear)) {
    return { data: fallback, crisis: true, crisisMessage: CRISIS_MESSAGE, source: 'crisis' };
  }
  const r = await post('/api/coaching-questions', {
    stressor, perception, somatic, energyLevel, stressLevel, fear, distortionType,
  });
  if (!r.ok) return { data: fallback, crisis: false, source: 'error' };
  trace('coaching-questions', r.json);
  if (r.json.crisis) {
    return { data: fallback, crisis: true, crisisMessage: r.json.message, source: 'crisis' };
  }
  const qs = Array.isArray(r.json.questions) ? r.json.questions : [];
  return {
    data: {
      questions: fallback.questions.map((fb, i) => (isPair(qs[i]) ? { ...qs[i], id: fb.id } : fb)),
      move: isPair(r.json.move) ? r.json.move : fallback.move,
    },
    crisis: false, source: r.json.source ?? 'ai',
  };
}

// ── ENERGY INSIGHT ───────────────────────────────────────────
export async function generateEnergyInsight(level: number, type: string): Promise<string> {
  const r = await post('/api/energy-analysis', { level, type });
  if (!r.ok) return 'Your energy is your currency. How you spend it determines your reality.';
  trace('energy-analysis', r.json);
  return r.json.insight ?? 'Your energy is your currency. How you spend it determines your reality.';
}

// ── DECREE ───────────────────────────────────────────────────
export async function generateManifesto(
  stressor: string, truth: string, action: string, fear: string,
  currentLevel: number, isBurnoutPath: boolean,
  reflection: { story: string; truthCheck: string; signal: string },
  onUpdate: (text: string) => void,
): Promise<{ isOffline: boolean; crisis: boolean; crisisMessage?: string }> {
  if (localCrisis('manifesto', stressor, truth, action, fear, reflection.story, reflection.truthCheck, reflection.signal)) {
    return { isOffline: false, crisis: true, crisisMessage: CRISIS_MESSAGE };
  }
  // currentLevel was previously accepted and never sent, so the
  // endpoint could not tone-match. It is sent now, with the path.
  const r = await post('/api/manifesto', {
    stressor, truth, action, fear, currentLevel, isBurnoutPath, ...reflection,
  });

  if (!r.ok) return { isOffline: true, crisis: false };
  trace('manifesto', r.json);

  if (r.json.crisis) {
    return { isOffline: false, crisis: true, crisisMessage: r.json.message };
  }
  if (r.json.manifesto) {
    onUpdate(r.json.manifesto);
    return { isOffline: r.json.source !== 'ai', crisis: false };
  }
  return { isOffline: true, crisis: false };
}

// ── ACCESS CODE ──────────────────────────────────────────────
// Manual unlock, alongside Lemon Squeezy checkout — for comps,
// beta testers, partners. No AI, no crisis handling; a network
// failure or any non-2xx just means "not valid".
export async function verifyCipher(code: string): Promise<boolean> {
  const r = await post('/api/verify-cipher', { code });
  if (!r.ok) return false;
  return r.json.valid === true;
}

// ── LICENSE KEY (Monthly Access) ─────────────────────────────
// A Lemon Squeezy license key from a Monthly Access purchase. First use
// activates this device (no instanceId); later calls re-check that
// activation. 'unavailable' means we couldn't reach a verdict (network,
// Lemon Squeezy down, a 429) — never treat it as a "no".
export type LicenseReason = 'invalid' | 'wrong_product' | 'expired' | 'limit' | 'not_configured' | 'unavailable';
export interface LicenseResult {
  valid: boolean;
  instanceId?: string;
  expiresAt?: string | null;
  reason?: LicenseReason;
}

// Lemon Squeezy keys are UUID-shaped; access codes are short words.
export const looksLikeLicenseKey = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());

export async function verifyLicense(key: string, instanceId?: string): Promise<LicenseResult> {
  const r = await post('/api/verify-license', instanceId ? { key, instanceId } : { key });
  if (!r.ok) return { valid: false, reason: 'unavailable' };
  if (r.json.valid === true && typeof r.json.instanceId === 'string') {
    return { valid: true, instanceId: r.json.instanceId, expiresAt: r.json.expiresAt ?? null };
  }
  return { valid: false, reason: r.json.reason ?? 'invalid' };
}
