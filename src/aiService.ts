// aiservice.ts
// ─────────────────────────────────────────────────────────────
// Connects the frontend to all serverless API functions.
// Execution order for a full coaching session:
//
// Step 1 → getSomaticEcho() body witnessed first
// Step 2 → generateCoachingQuestions() cognition engaged
// Step 3 → generateManifesto() identity sealed
//
// Each function degrades gracefully with a fallback
// so the session never breaks for the client.
// ─────────────────────────────────────────────────────────────

// ── Shared fetch helper ───────────────────────────────────────
async function postToApi<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      console.warn(`[aiservice] ${endpoint} unavailable (${res.status})`);
      return null;
    }

    return await res.json() as T;
  } catch (err) {
    console.warn(`[aiservice] ${endpoint} fetch failed:`, err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// STEP 1 — Somatic Echo
// One sentence that mirrors the body state before
// any questions are asked. Nervous system first.
// ─────────────────────────────────────────────────────────────

const SOMATIC_FALLBACKS: Record<string, string> = {
  chest: "Your chest is holding something your words haven't named yet.",
  throat: "There is something in your throat that knows it needs to be said.",
  stomach: "Your gut already has an answer your mind is still debating.",
  jaw: "Your jaw has been bracing against something longer than today.",
  shoulders: "The weight on your shoulders has been accumulating quietly.",
  head: "Your mind is moving faster than your body can follow right now.",
  default: "Your body arrived here carrying something worth listening to.",
};

function getSomaticFallback(somatic: string): string {
  const lower = somatic.toLowerCase();
  for (const key of Object.keys(SOMATIC_FALLBACKS)) {
    if (lower.includes(key)) return SOMATIC_FALLBACKS[key];
  }
  return SOMATIC_FALLBACKS.default;
}

export interface SomaticEchoResult {
  echo: string;
  source: "ai" | "fallback";
}

export async function getSomaticEcho(
  somatic: string,
  stressor: string,
  stressLevel: number,
  energyLevel: number
): Promise<SomaticEchoResult> {
  const data = await postToApi<SomaticEchoResult>("/api/somatic-echo", {
    somatic,
    stressor,
    stressLevel,
    energyLevel,
  });

  if (data?.echo) return data;

  return {
    echo: getSomaticFallback(somatic),
    source: "fallback",
  };
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — Coaching Questions
// Three surgical questions after the body has been
// witnessed. Contextual routing by stress + energy.
// ─────────────────────────────────────────────────────────────

const QUESTION_FALLBACKS = {
  highStress: [
    "What is the smallest thing your body is asking for right now?",
    "Where did this weight first arrive — was it today, or older than that?",
    "If the pressure dropped by half, what would you do first?",
  ],
  lowEnergy: [
    "What would feel like enough, just for today?",
    "What are you still carrying that was never yours to hold?",
    "If rest were the answer, what would you need to believe to accept it?",
  ],
  default: [
    "What does this tension know that your mind hasn't caught up to yet?",
    "When you handle this well, what do you notice first?",
    "What is the assumption underneath this that you haven't examined?",
  ],
};

export async function generateCoachingQuestions(
  stressor: string,
  somatic: string,
  stressLevel = 50,
  energyLevel = 50
): Promise<string[]> {
  const data = await postToApi<{ questions: string[] }>("/api/coaching-questions", {
    stressor,
    somatic,
    stressLevel,
    energyLevel,
  });

  if (data?.questions?.length) return data.questions;

  // Contextual fallback — not generic
  if (stressLevel >= 75) return QUESTION_FALLBACKS.highStress;
  if (energyLevel <= 35) return QUESTION_FALLBACKS.lowEnergy;
  return QUESTION_FALLBACKS.default;
}

// ─────────────────────────────────────────────────────────────
// STEP 3 — Manifesto / Decree
// Identity sealed after the questions have done their work.
// ─────────────────────────────────────────────────────────────

export async function generateManifesto(
  stressor: string,
  truth: string,
  action: string,
  fear: string,
  archetype?: "Rusher" | "Freezer" | "Fixer"
): Promise<string> {
  const data = await postToApi<{ manifesto: string }>("/api/manifesto", {
    stressor,
    truth,
    action,
    fear,
    archetype,
  });

  if (data?.manifesto) return data.manifesto;

  // Fallback now includes fear — matches the live API signature
  return `I have felt ${fear}, and I release its claim on me. ${truth} is not a hope — it is my ground. I seal this with ${action}, my sovereign oath.`;
}

// ─────────────────────────────────────────────────────────────
// ENERGY ANALYSIS — Power Shift Insight
// Separate from the coaching sequence.
// Requires session context to be meaningful.
// ─────────────────────────────────────────────────────────────

export async function generateEnergyInsight(
  level: number,
  type: string,
  stressor: string,
  currentBelief: string
): Promise<string> {
  const data = await postToApi<{ insight: string }>("/api/energy-analysis", {
    level,
    type,
    stressor,
    currentBelief,
  });

  if (data?.insight) return data.insight;

  return `At Level ${level}, the shift isn't about doing more — it's about choosing differently.`;
}
