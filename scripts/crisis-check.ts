// scripts/crisis-check.ts — both directions of the crisis gate.
// Run: npm run test:crisis
// Add a line here every time CRISIS_PATTERNS or CONTRACTIONS change.
import { screenForCrisis } from '../api/_lib/crisis.ts';

const MUST_FIRE = [
  'I do not want to be here anymore',
  "I don't want to be here anymore",
  'I dont want to be here anymore',
  "I can't go on",
  'I want to kill myself',
  "I'm so tired I want to die",
  'I want to disappear forever',
  'I just want to disappear for good',
  'I wish I could sleep and never wake up',
  'I want to go to sleep and not wake up',
  'everyone would be better without me',
  'my family would be better off without me',
  "They'd be better off without me",
  "I don't want to be alive",
  "There's no point in living",
  "I'm tired of being alive",
  "I'm exhausted and I want to kill myself",
];

const MUST_STAY_QUIET = [
  'I cannot go on with this vendor',
  "I'd die on that hill",
  'this project is killing me',
  "I'm dead tired",
  'I could kill for a coffee',
  'I want to disappear into a good book this weekend',
  'I never wake up on time',
  'The project is better without me micromanaging it',
  'I want to sleep in and wake up late',
  "I'm done with this meeting",
  "I'm exhausted and drained",
  'The deadline will kill the launch',
  'I need to cut myself some slack',
];

let failed = 0;
for (const s of MUST_FIRE) {
  if (!screenForCrisis(s)) { failed++; console.error(`MISSED   ${s}`); }
}
for (const s of MUST_STAY_QUIET) {
  if (screenForCrisis(s)) { failed++; console.error(`FALSE+   ${s}`); }
}
console.log(`${MUST_FIRE.length + MUST_STAY_QUIET.length - failed}/${MUST_FIRE.length + MUST_STAY_QUIET.length} passed`);
process.exit(failed ? 1 : 0);
