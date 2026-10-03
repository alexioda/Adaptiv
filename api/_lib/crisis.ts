// api/_lib/crisis.ts — the crisis gate, with no dependencies.
// ─────────────────────────────────────────────────────────────
// Deterministic, runs before any model call. Free, instant, and
// unaffected by whatever the model's filters happen to do today.
//
// This file must stay free of process.env, fetch, or anything else
// that isn't plain string work: the client imports it too
// (src/lib/adaptivAI.ts), so the same screen runs in the browser
// before a request goes out and still runs when the API is
// unreachable, rate-limited, or misconfigured.
// ─────────────────────────────────────────────────────────────

// Contractions are expanded before matching, so one pattern covers
// "don't" / "dont" / "do not". Expansion is restricted to an explicit list:
// a generic /(\w)n't/ rule silently mangled "want" into "wa not", which
// disabled every "want to die" pattern.
const CONTRACTIONS: [RegExp, string][] = [
  [/\bcan'?t\b/g, 'cannot'],
  [/\bcannot\b/g, 'cannot'],
  [/\bwon'?t\b/g, 'will not'],
  [/\bdon'?t\b/g, 'do not'],
  [/\bdoesn'?t\b/g, 'does not'],
  [/\bdidn'?t\b/g, 'did not'],
  [/\bisn'?t\b/g, 'is not'],
  [/\bain'?t\b/g, 'is not'],
  [/\baren'?t\b/g, 'are not'],
  [/\bwasn'?t\b/g, 'was not'],
  [/\bhaven'?t\b/g, 'have not'],
  [/\bhasn'?t\b/g, 'has not'],
  [/\bwouldn'?t\b/g, 'would not'],
  [/\bcouldn'?t\b/g, 'could not'],
  [/\bwanna\b/g, 'want to'],
  [/\bgonna\b/g, 'going to'],
  [/\bi'?d\b/g, 'i would'],
  [/\b(they|we|you|he|she)'d\b/g, '$1 would'],
  [/\btheyd\b/g, 'they would'],
];

function normalizeForScreening(text: string): string {
  let out = text.toLowerCase().replace(/[‘’ʼ]/g, "'");
  for (const [re, sub] of CONTRACTIONS) out = out.replace(re, sub);
  return out.replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

const CRISIS_PATTERNS = [
  // explicit intent
  'kill (myself|my self)', 'killing myself',
  'suicid(e|al)', 'take my (own )?life',
  'end (my life|it all)', 'ending my life',
  // ideation
  // "die on that hill" is a business idiom, never a crisis statement.
  'want to die(?!\\s+on (that|this) hill)',
  'wish (i was|i were|i am) dead', 'better off dead',
  'do not want to (be here|live|wake up|exist|be alive)',
  'no longer want to (be here|live|be alive)',
  'nothing (left )?to live for', 'no reason to (live|go on)',
  'no point (in )?(living|being alive|going on)',
  'tired of (living|being alive)',
  // "cannot go on with the vendor" is a work sentence, not a crisis one —
  // the lookahead keeps the phrase without catching ordinary complaints.
  'cannot go on(?!\\s+(with|about|for|to|without))',
  'cannot do this anymore', 'cannot keep going',
  // indirect ideation. Each is anchored to a wording that only reads one
  // way: "disappear forever", not "disappear into a book"; "sleep and
  // never wake up", not "I never wake up on time"; a person or group
  // "better off without me", not "the project is better without me".
  'disappear (forever|for good|permanently)',
  'sleep and (never|not) wake( up)?',
  '(never|not) wake up again',
  '(everyone|everybody|they|people|the world|my family|my kids|my children|my wife|my husband|my partner)( would| will)?( be| is| are)? better (off )?without me',
  // self-harm
  'self harm', 'harm(ing)? myself', 'hurt(ing)? myself',
  // "cut myself some slack" is self-kindness, not self-harm.
  'cut(ting)? myself(?!\\s+(some )?slack)', 'overdose',
];

const CRISIS_RE = new RegExp(CRISIS_PATTERNS.join('|'), 'i');

export const CRISIS_MESSAGE =
  'What you wrote sounds heavy, and this tool is not the right ' +
  'support for it. Please talk to someone who can help. In the US ' +
  'you can call or text 988 any time, or text HOME to 741741. ' +
  'Outside the US, findahelpline.com lists local services. If you ' +
  'are in immediate danger, call your local emergency number.';

export function screenForCrisis(...fields: unknown[]): boolean {
  const raw = fields.filter(f => typeof f === 'string').join(' . ');
  return CRISIS_RE.test(normalizeForScreening(raw));
}
