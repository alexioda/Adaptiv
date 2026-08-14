// api/energy-analysis.ts — one-line shift insight for a Kinetic State.
// NOTE: filename must be energy-analysis.ts to match the client fetch.
import {
  guard, generate, json, clean, unquote, KINETIC_STATES, KINETIC_LADDER, VOICE,
} from './_lib/shared';

export const config = { runtime: 'edge' };

const FALLBACKS: Record<number, string> = {
  1: 'Nothing is required of you right now except to stop spending what you do not have.',
  2: 'The bracing kept you upright. It is not the same thing as being steady.',
  3: 'You are coping well enough that nobody is asking. That is the risk.',
  4: 'You give it away all day. Point some of it back at the asset before it breaks.',
  5: 'You have momentum. Build with it rather than spending it on maintenance.',
  6: 'You are creating rather than reacting. Protect the conditions that got you here.',
  7: 'You are sovereign in this. The work now is making it repeatable without a crisis.',
};

export default async function handler(req: Request): Promise<Response> {
  const g = await guard(req);
  if (!g.ok) return g.response;
  const { body, cors, apiKey } = g;

  const n = Number(body.level);
  const level = Number.isFinite(n) ? Math.min(7, Math.max(1, Math.round(n))) : 3;
  const type = clean(body.type, 120);
  const label = KINETIC_STATES[level];

  const system = `${VOICE}

The LiveAdaptiv Kinetic States ladder runs ${KINETIC_LADDER}.

This person is at Level ${level}: ${label}.${type ? ` Context: ${type}.` : ''}

Write ONE sentence that names the single move available to them from
this state.

RULES
- One sentence. Maximum 25 words. Second person.
- Grounded and plain. No mysticism, no grandeur, no clinical framing.
- Speak to Level ${level} specifically. A Depleted person and a
  Sovereign person do not get the same sentence.
- At levels 1 and 2, ask for less, not more. Do not push a depleted
  person toward output.
- No advice that sounds like a slogan.

Output the sentence only.`;

  const { text, blocked, reason } = await generate({
    apiKey, system, user: 'Write the insight.',
    temperature: 0.8, maxOutputTokens: 80,
  });

  const insight = unquote(text);
  return json({
    insight: insight.length > 10 ? insight : FALLBACKS[level],
    level, state: label,
    source: insight ? 'ai' : 'fallback',
    reason, blocked,
  }, 200, cors);
}
