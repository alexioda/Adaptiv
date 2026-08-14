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
// ─────────────────────────────────────────────────────────────

export interface EnergyAnalysis { level: number; reflection: string; }
export interface SessionRecord {
  date: string; stressor: string;
  preStress: number; postStress: number;
  preEnergy: number; postEnergy: number;
  coreFear: string; expandingBelief: string;
  commitment: string; energyLevel: number;
}
export interface HorizonValidation {
  acknowledgment: string; validation: string; pivot: string;
}

export const CRISIS_FLAG = '__CRISIS__';

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
    if (!res.ok) return { ok: false };
    return { ok: true, json: await res.json() };
  } catch {
    return { ok: false };
  }
}

// Dev-only visibility into whether the AI layer is actually live.
// Previously a dead endpoint just looked like a working app.
function trace(label: string, body: any) {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
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
      ? 'You are carrying the weight of this and bracing against what it might cost you.'
      : 'You are handling this on logic, and you may be tolerating more than you have admitted.',
  };

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
  const fallback = 'What specifically feels most threatened by this situation right now?';
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
export async function generatePatternInsight(history: SessionRecord[]): Promise<string> {
  if (history.length < 2) return '';
  const sessions = history.slice(0, 5).map(s => ({
    date: s.date, stressor: s.stressor, coreFear: s.coreFear,
    preStress: s.preStress, postStress: s.postStress,
  }));
  const r = await post('/api/pattern-insight', { sessions });
  if (!r.ok) return '';
  trace('pattern-insight', r.json);
  if (r.json.crisis) return '';
  return r.json.insight ?? '';
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
): Promise<string> {
  const lower = (somatic || '').toLowerCase();
  const key = Object.keys(ECHO_FALLBACKS).find(k => k !== 'default' && lower.includes(k));
  const fallback = ECHO_FALLBACKS[key ?? 'default'];

  const r = await post('/api/somatic-echo', { somatic, stressor, stressLevel, energyLevel });
  if (!r.ok) return fallback;
  trace('somatic-echo', r.json);
  if (r.json.crisis) return '';
  return r.json.echo || fallback;
}

// ── COACHING QUESTIONS ───────────────────────────────────────
export async function generateCoachingQuestions(
  stressor: string, perception: string, somatic: string,
  energyLevel: number, stressLevel: number,
  fear = '', distortionType: 'fact' | 'assumption' | null = null,
): Promise<AIResult<string[]>> {
  const fallback = [
    stressLevel > 6 || energyLevel < 4
      ? 'What specifically is threatened by this situation?'
      : 'What is one assumption you are making that might not be true?',
    'If this shifted tonight, what would you actually feel different?',
    'What permission do you need to give yourself to move?',
    'What is the smallest bold move that makes the rest easier?',
  ];

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
    data: [0, 1, 2, 3].map(i => qs[i] || fallback[i]),
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
  onUpdate: (text: string) => void,
): Promise<{ isOffline: boolean; crisis: boolean; crisisMessage?: string }> {
  // currentLevel was previously accepted and never sent, so the
  // endpoint could not tone-match. It is sent now, with the path.
  const r = await post('/api/manifesto', {
    stressor, truth, action, fear, currentLevel, isBurnoutPath,
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
