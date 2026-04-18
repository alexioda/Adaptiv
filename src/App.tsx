import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Wind, Zap, Heart, BookOpen,
  ArrowRight, Check, Calendar, Facebook,
  User, Lock, PlayCircle, Target, Battery,
  Waves, Volume2, VolumeX, ChevronRight, ChevronLeft, X, AlertCircle, Copy, LogOut,
  BarChart, RefreshCw,
  Brain, Eye, MessageCircle, Shield, Sun, Flame, Anchor, Hand, Disc, Mountain, Mail,
  MinusCircle, AlertTriangle, Info, FileText, Thermometer, Sparkles, Loader2, WifiOff, Home,
  BatteryWarning, ExternalLink, HelpCircle,
  Split, CloudFog, Compass, Music, ArrowUp, TrendingDown, Share2
} from 'lucide-react';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Goal {
  what: string;
  measure: string;
  when: string;
  outcome: string;
  action: string;
}
interface NavProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  isDashboard?: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  resetApp?: () => void;
  progress?: number;
  aiActive?: boolean;
}
interface SomaticZone { id: string; label: string; icon: React.ElementType; }
interface EnergyAnalysis { level: number; reflection: string; }

// ── NEW: Session Record stored in localStorage ──
interface SessionRecord {
  date: string;           // ISO string
  stressor: string;
  preStress: number;
  postStress: number;
  preEnergy: number;
  postEnergy: number;
  coreFear: string;
  expandingBelief: string;
  commitment: string;
  energyLevel: number;    // ELI 1-7
}

interface CommonProps {
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
  onBack?: () => void;
}
interface EnergyReflectionProps extends CommonProps { energyAnalysis: EnergyAnalysis | null; }
interface HorizonProps extends CommonProps {
  userName: string;
  sessionCount: number;
  stressor: string;
  setStressor: (s: string) => void;
  perception: string;
  setPerception: (s: string) => void;
  stressLevel: number;
  setStressLevel: (n: number) => void;
  energyLevel: number;
  setEnergyLevel: (n: number) => void;
  isBurnout: boolean;
  resetApp: () => void;
  setEnergyAnalysis: (a: EnergyAnalysis) => void;
  soundType: 'drone' | 'brown';
  setSoundType: (t: 'drone' | 'brown') => void;
  sessionHistory: SessionRecord[];
}
interface ForkEntryProps extends CommonProps {}
interface DiffuserProps extends CommonProps { fear: string; setFear: (s: string) => void; }
interface VesselProps extends CommonProps {
  somaticZones: string[];
  setSomaticZones: (zones: string[]) => void;
}
interface PartsWorkProps extends CommonProps {
  selectedPart: string;
  sensation: string;
  setSensation: (s: string) => void;
  protection: string;
  setProtection: (s: string) => void;
  fear: string;
  setFear: (s: string) => void;
  expandingBelief: string;
  setExpandingBelief: (s: string) => void;
  partsStep: string;
  setPartsStep: (s: string) => void;
}
interface LaserCoachingProps extends CommonProps {
  stressor: string;
  perception: string;
  somatic: string;
  setGoal: (g: any) => void;
  setExpandingBelief: (s: string) => void;
  energyLevel: number;
  stressLevel: number;
}
interface PerspectiveProps extends CommonProps {
  pressure: number;
  setPressure: (n: number) => void;
  ability: number;
  setAbility: (n: number) => void;
}
interface CrossroadsProps extends CommonProps { stressLevel: number; energyLevel: number; }
interface BreathProps extends CommonProps {
  breathing: boolean;
  setBreathing: (b: boolean) => void;
  breathCount: number;
  setBreathCount: React.Dispatch<React.SetStateAction<number>>;
  soundEnabled: boolean;
}
interface InsightProps extends CommonProps {
  expandingBelief: string;
  setExpandingBelief: (s: string) => void;
}
interface AlchemyProps extends CommonProps {}
interface PrimingProps { onComplete: () => void; }
interface IntegrationProps extends CommonProps {
  goal: Goal;
  setGoal: React.Dispatch<React.SetStateAction<Goal>>;
  goalStep: number;
  setGoalStep: (n: number) => void;
  isLocked: boolean;
  setIsLocked: (b: boolean) => void;
  expandingBelief: string;
  stressor: string;
  fear: string;
  sessionCount: number;
  completeSession: () => void;
  resetApp: () => void;
  somaticZones: string[];
  isBurnoutPath: boolean;
  userName: string;
  energyAnalysis: EnergyAnalysis | null;
  stressLevel: number;
  energyLevel: number;
  postStressLevel: number;
  setPostStressLevel: (n: number) => void;
  postEnergyLevel: number;
  setPostEnergyLevel: (n: number) => void;
  // NEW: save session callback
  saveSession: (record: SessionRecord) => void;
}
interface PreservationProps extends CommonProps {
  setGoal: (g: any) => void;
  setExpandingBelief: (s: string) => void;
  setViewToIntegration: () => void;
}
interface VitalityScanProps extends CommonProps { setBurnoutPath: (b: boolean) => void; }
interface EnergyAnalyzerProps { setView: (view: string) => void; onBack?: () => void; }
interface ChatMessage { role: 'user' | 'ai'; text: string; isHtml: boolean; }

// ─────────────────────────────────────────────
// STORAGE HELPERS  (localStorage, graceful fallback)
// ─────────────────────────────────────────────
const STORAGE_KEYS = {
  USER_NAME:       'adaptiv_userName',
  SESSION_COUNT:   'adaptiv_sessionCount',
  SESSION_HISTORY: 'adaptiv_sessionHistory',
};

function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

function storageSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// Keep only the last 10 sessions to respect free-tier memory limits
function appendSession(record: SessionRecord): SessionRecord[] {
  const history = storageGet<SessionRecord[]>(STORAGE_KEYS.SESSION_HISTORY, []);
  const updated = [record, ...history].slice(0, 10);
  storageSet(STORAGE_KEYS.SESSION_HISTORY, updated);
  return updated;
}

// ─────────────────────────────────────────────
// SANITIZE – prevents XSS in dangerouslySetInnerHTML
// Strips everything except safe inline elements & attributes
// ─────────────────────────────────────────────
function sanitizeHtml(dirty: string): string {
  // Allow only span/strong/em/br with class attribute
  const allowed = /<(\/?)((span|strong|em|br)(\s+class="[^"]*")?)\s*\/?>/gi;
  // Replace all tags with either the allowed ones or nothing
  return dirty.replace(/<[^>]+>/g, (tag) => {
    const match = tag.match(/^<(\/?)((span|strong|em|br)(\s+class="[^"]*")?)\s*\/?>$/i);
    return match ? tag : '';
  });
}

// ─────────────────────────────────────────────
// 1. SOUND ENGINE
// ─────────────────────────────────────────────
class SoundEngine {
  ctx: AudioContext | null = null;
  activeNode: OscillatorNode | AudioBufferSourceNode | null = null;
  gain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtor();
      this.gain = this.ctx.createGain();
      this.gain.connect(this.ctx.destination);
      this.gain.gain.value = 0;
    }
  }

  play(type: 'drone' | 'brown') {
    this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    if (this.activeNode) {
      try { this.activeNode.stop(); this.activeNode.disconnect(); } catch {}
      this.activeNode = null;
    }
    if (type === 'drone') {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, this.ctx!.currentTime);
      osc.connect(this.gain!);
      osc.start();
      this.activeNode = osc;
      this.gain!.gain.setTargetAtTime(0.05, this.ctx!.currentTime, 2);
    } else {
      const bufferSize = this.ctx!.sampleRate * 2;
      const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        lastOut *= 3.5;
        data[i] = lastOut;
      }
      const noise = this.ctx!.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(this.gain!);
      noise.start();
      this.activeNode = noise;
      this.gain!.gain.setTargetAtTime(0.12, this.ctx!.currentTime, 2);
    }
  }

  // NEW: play a short tone for breath phase transitions
  playBreathTone(freq: number, duration = 0.3) {
    this.init();
    if (!this.ctx || !this.gain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration + 0.1);
  }

  stop() {
    if (this.gain && this.ctx) {
      this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      setTimeout(() => {
        if (this.activeNode) {
          try { this.activeNode.stop(); this.activeNode.disconnect(); } catch {}
          this.activeNode = null;
        }
      }, 600);
    }
  }
}
const soundEngine = new SoundEngine();

// ─────────────────────────────────────────────
// 2. API HELPERS
// IMPORTANT: Replace VITE_GOOGLE_API_KEY with your env var.
// For production, proxy through a serverless function so the key
// never ships in the client bundle.
// e.g. POST /api/ai  →  Vercel/Netlify Edge Function holding the key.
// ─────────────────────────────────────────────
const apiKey = (typeof window !== "undefined" && (window as any).__GOOGLE_API_KEY__) || "";
const aiModel = "gemini-2.5-flash";

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH",        threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",  threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT",  threshold: "BLOCK_NONE" },
];

/** Central AI caller – swap the URL here when you move to a proxy */
async function callAI(prompt: string, jsonMode = false): Promise<string> {
  const url = apiKey
    ? `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`
    : `/api/ai`;   // ← your serverless proxy endpoint

  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    safetySettings,
  };
  if (jsonMode) body.generationConfig = { responseMimeType: "application/json" };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('API unavailable');
  const data = await res.json();
  return data.candidates[0].content.parts[0].text ?? "";
}

const formatGoalOutcome = (text: string) => {
  if (!text) return "";
  let clean = text.trim().replace(
    /^(My goal is to|My goal is|I would like to|I would|I want to|I will|I am going to|I'd like to)\s+/i, ""
  );
  if (/^To\s/i.test(clean)) return clean;
  clean = clean.charAt(0).toLowerCase() + clean.slice(1);
  return "To " + clean;
};

const getSmartQuestion = (energy: number, stress: number) => {
  if (stress > 60 || energy < 40) return "What specifically is threatened by this situation?";
  if (energy > 70) return "If you were coaching your best self, what would you tell them to do?";
  return "What is one assumption you are making that might not be true?";
};

// ─────────────────────────────────────────────
// VOICE IDENTITY — used across all AI calls
// ─────────────────────────────────────────────
// Short, warm sentences. One question at a time.
// Validate before questioning. Normalize without minimizing.
// Respond to emotional texture, not just content.
// Never mention energy levels, framework language, or ELI by name.
// Lead with the human. The assessment happens underneath.
// ─────────────────────────────────────────────

const COACH_VOICE = `You are a world-class transformational coach, brilliant psychologist, and expert motivational interviewer with deep mastery of Energy Leadership.

Your voice:
- Short, warm, direct sentences. Never more than 3 sentences in a reflection.
- You validate before you question. Always.
- You normalize without minimizing. "No wonder you feel this way" is more powerful than any technique.
- You ask ONE question at a time. Never two. Never a question with a sub-question inside it.
- Your questions open something in the person — they don't seek information, they create movement.
- You respond to what's underneath the words, not just the words themselves.
- You use metaphor naturally. "If this had a voice, what would it say?" lands deeper than "How does this make you feel?"
- You never explain your framework. You never mention energy levels. You just use what you know.
- You are comfortable being brief. Less is always more.

Your signature move: brief validation → normalization → one question that moves from cognitive to experiential.`;

const analyzeCurrentEnergy = async (
  stressor: string, perception: string, stressLevel: number, energyLevel: number
): Promise<EnergyAnalysis> => {
  try {
    const prompt = `${COACH_VOICE}

A person has shared what's weighing on them:
- What's happening: "${stressor}"
- How they're experiencing it: "${perception}"
- Stress level (self-rated): ${stressLevel}%
- Energy level (self-rated): ${energyLevel}%

Your task has two parts:

PART 1 — Assess their current energy level (1-7) based on the emotional and cognitive content of what they shared. Use the numbers only as secondary context. What matters most is the quality of their perception and relationship to the situation.

ELI levels (internal reference only — never name these in your response):
1: Victim — powerless, "why me," no sense of agency
2: Fighter — defensive, conflicted, "I win you lose"
3: Rationalizer — coping, explaining, tolerating
4: Caregiver — compassion-led but self-depleting, "you win"
5: Opportunist — sees possibility, "we both win"
6: Visionary — intuitive, systemic awareness, "everyone wins"
7: Creator — pure purpose, generative, "I create"

PART 2 — Write a reflection in your voice. 2 sentences maximum.
- First sentence: validate what it must feel like. Use "It must feel..." or "That sounds..." or "Of course you'd feel..."
- Second sentence: name something specific underneath what they described — the thing they may not have said directly but that you sense is there.

Do not ask a question here. Just reflect. The question comes later.

Return ONLY raw JSON: { "level": number, "reflection": "string" }`;
    const raw = await callAI(prompt, true);
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    const isCatabolic = stressLevel > 60 || energyLevel < 40;
    return {
      level: isCatabolic ? 2 : 3,
      reflection: isCatabolic
        ? "It must feel hard — not knowing what to do and how to handle it. No wonder you feel this way. You've been carrying something that was never meant to be carried alone."
        : "That kind of quiet pressure is its own kind of exhausting. It makes sense that your system is looking for a way through.",
    };
  }
};

const generateCoachingQuestions = async (
  stressor: string, perception: string, somatic: string, energyLevel: number, stressLevel: number
): Promise<string[]> => {
  try {
    const prompt = `${COACH_VOICE}

A person is working through something:
- What's happening: "${stressor}"
- How they experience it: "${perception}"
- Where they feel it in their body: "${somatic}"

Generate 4 coaching questions in your voice. Each one should be short, open, and do a specific kind of work:

Question 1 — Mirror: Reflect something back that names what's underneath the situation. Not what they said — what you sense beneath it. Example style: "What's the part of this that feels most unfair?"

Question 2 — Pivot: Gently shift their relationship to the situation. Not toxic positivity — a genuine reframe. Example style: "If this situation had something to teach you, what would it be trying to say?"

Question 3 — Experiential bridge: Move them from thinking about it to feeling into it. Use metaphor. Example style: "If this stress had a voice right now, what would it say to you?"

Question 4 — Vision: Open something forward. Not "what do you want" — something more specific and alive. Example style: "What would it feel like in your body if this wasn't weighing on you anymore?"

Rules:
- Each question is one sentence. Under 20 words.
- Never two questions in one.
- Never start with "How" — it's too analytical. Start with "What," "When," "Where," or a soft statement that opens into a question.

Return ONLY raw JSON: { "questions": ["q1", "q2", "q3", "q4"] }`;
    const raw = await callAI(prompt, true);
    return JSON.parse(raw.replace(/```json|```/g, '').trim()).questions;
  } catch {
    return [getSmartQuestion(energyLevel, stressLevel)];
  }
};

const generateManifesto = async (
  stressor: string, truth: string, action: string, fear: string,
  currentLevel: number, onUpdate: (text: string) => void
): Promise<{ isOffline: boolean }> => {
  try {
    const prompt = `${COACH_VOICE}

A person has just completed a deep transformation session. Here is what they worked through:
- What was weighing on them: "${stressor}"
- The fear underneath it: "${fear}"
- The new truth they've claimed: "${truth}"
- The action they've committed to: "${action}"

Write their Alchemist Decree — a personal declaration they will carry with them.

Voice and form:
- First person. Spoken directly from them, not about them.
- Begin by acknowledging what they were carrying — one brief line that honors the weight without dwelling in it.
- Move to the turn — the moment they chose differently.
- Land on the truth they now stand in and the action that seals it.
- Under 60 words total.
- No jargon. No coaching language. No framework references.
- It should feel like something worth reading twice.

Output ONLY the decree text. Nothing else.`;
    const text = (await callAI(prompt)).trim();
    onUpdate(text);
    return { isOffline: false };
  } catch {
    const fallback = `I carried "${stressor}" longer than it deserved. Underneath it lived the fear that ${fear || 'I am not enough'}. I see it now — and I choose differently. The truth I stand in: ${truth}. The action that seals it: ${action}. This is my decree.`;
    onUpdate(fallback);
    return { isOffline: true };
  }
};

const generateEnergyInsight = async (level: number, type: string): Promise<string> => {
  try {
    const prompt = `${COACH_VOICE}

Someone is experiencing "${type}" right now.

Write ONE sentence — a grounded, warm insight about energy and transformation that speaks directly to where they are.

Not advice. Not a question. A truth that lands.
Under 20 words. No jargon. No technical language. Make it feel like something a wise person would say quietly, not announce loudly.

Output ONLY the sentence.`;
    return (await callAI(prompt)).trim();
  } catch {
    return "What you're feeling is information — not a verdict.";
  }
};

const generateHorizonQuestion = async (stressor: string, perception: string, historyText: string): Promise<string> => {
  try {
    const prompt = `${COACH_VOICE}

Someone is working through something real:
- What's happening: "${stressor}"
- How they experience it: "${perception}"
- Some context about their pattern: ${historyText}

Ask them ONE question in your voice.

It should do one of these things:
- Name what's underneath what they've described
- Use a metaphor that creates experiential contact ("If this had a voice...")
- Open something forward without bypassing where they are

Under 20 words. One sentence. No sub-questions.
Start with "What" or "Where" or a soft statement that opens into a question.

Output ONLY the question.`;
    return (await callAI(prompt)).trim();
  } catch {
    return "What is the part of this you haven't let yourself say out loud yet?";
  }
};

const generateHorizonValidation = async (stressor: string, perception: string, historyText: string): Promise<string> => {
  try {
    const prompt = `${COACH_VOICE}

Someone has just shared what's weighing on them:
- What's happening: "${stressor}"
- How they're experiencing it: "${perception}"

Deliver a warm, grounded validation in three parts. Use these exact HTML spans:

1. <span class="block mb-2 font-bold text-teal-300">A short, specific acknowledgment — not "I hear you" but something that names what they're actually in. 5 words or fewer.</span>

2. <span class="block mb-4 text-white/80 italic">Two sentences that honor the specific weight of their situation. Validate the experience without fixing it. Use "It must feel..." or "Of course..." or "No wonder...". Name something underneath what they said — the thing they may not have said directly but that you sense is there.</span>

3. <span class="block font-bold text-white">One sentence that opens a door forward — not a pep talk, not a promise. Something that creates a felt sense of possibility without bypassing where they are.</span>

Return ONLY the raw HTML. No markdown. No extra text.`;
    const raw = (await callAI(prompt)).trim().replace(/```html|```/g, '').trim();
    return sanitizeHtml(raw);
  } catch {
    return sanitizeHtml(`<span class="block mb-2 font-bold text-teal-300">That's real weight.</span><span class="block mb-4 text-white/80 italic">It must feel hard, not knowing what to do and how to handle it. No wonder you feel this way — you've been holding something that has no clean answer.</span><span class="block font-bold text-white">What if this is the moment it starts to shift.</span>`);
  }
};

const generatePatternInsight = async (history: SessionRecord[]): Promise<string> => {
  if (history.length < 2) return "";
  try {
    const summary = history.slice(0, 5).map((s, i) =>
      `Session ${i + 1} (${new Date(s.date).toLocaleDateString()}): Stressor="${s.stressor}", Fear="${s.coreFear}", Stress ${s.preStress}→${s.postStress}`
    ).join('\n');
    const prompt = `${COACH_VOICE}

You are reviewing a person's recent session history:
${summary}

In 1-2 sentences, name the single most important pattern you see across these sessions.
Be direct, warm, and specific. Not clinical. Not generic.
Start with "I notice..." — then say something true that they may not have seen yet.
No jargon. No framework language.`;
    return (await callAI(prompt)).trim();
  } catch {
    return "";
  }
};

const assessExitEnergy = async (
  stressor: string,
  expandingBelief: string,
  commitment: string,
  postStress: number,
  postEnergy: number,
  entryLevel: number
): Promise<number> => {
  try {
    const prompt = `You are an expert Energy Leadership Master Practitioner (ELI-MP) assessing a client's energetic state after a transformation session.

Entry: They began at Level ${entryLevel}.

What they worked through:
- Original stressor: "${stressor}"
- New truth they claimed: "${expandingBelief}"
- Action they committed to: "${commitment}"
- Post-session stress (1-10, lower is better): ${postStress}
- Post-session energy (1-10, higher is better): ${postEnergy}

ELI reference:
Level 1: Victim — "I lose." No agency. Pure catabolic.
Level 2: Fighter — "I win, you lose." Defensive. Catabolic.
Level 3: Rationalizer — "I cope." Tolerating. Mildly anabolic.
Level 4: Caregiver — "You win." Compassion-led, self-depleting. Anabolic.
Level 5: Opportunist — "We both win." Possibility-oriented. Anabolic.
Level 6: Visionary — "Everyone wins." Intuition-led. High anabolic.
Level 7: Creator — "I create." Purpose-aligned. Pure anabolic.

Assessment criteria — weight in this order:
1. Quality and depth of their expanding belief — is it a genuine reframe or a surface-level positive statement?
2. Specificity of their commitment — vague intentions stay at entry level, concrete actions suggest movement
3. Post-session self-ratings — confirming context, not primary driver

The exit level should be equal to or higher than entry. Only go lower if the belief and commitment show no real shift AND stress increased.

Return ONLY raw JSON: { "level": number, "rationale": "one sentence" }`;
    const raw = await callAI(prompt, true);
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return Math.min(7, Math.max(1, parsed.level));
  } catch {
    return Math.min(7, Math.max(entryLevel,
      entryLevel + (postStress <= 3 ? 2 : postStress <= 5 ? 1 : 0)
    ));
  }
};
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@200;300;400;500&display=swap');
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans  { font-family: 'Inter', sans-serif; }
    .glass-panel { background: rgba(15,23,42,0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .glass-button { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
    .glass-button:active { transform: scale(0.98); }
    .animate-breathe { animation: breathe 8s ease-in-out infinite; }
    @keyframes breathe { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.1);opacity:0.8} }
    .ripple-ring { position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,0.1);animation:ripple 4s linear infinite; }
    @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2);opacity:0} }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    .animate-enter { animation: fadeInUp 0.8s cubic-bezier(0.2,0.8,0.2,1) forwards; }
    .hide-scrollbar::-webkit-scrollbar { display:none; }
    .hide-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
    .glow-pulse { animation: glowPulse 3s infinite; }
    @keyframes glowPulse { 0%{box-shadow:0 0 0 0 rgba(20,184,166,0.4);border-color:rgba(20,184,166,0.6)} 50%{box-shadow:0 0 20px 0 rgba(20,184,166,0.2);border-color:rgba(20,184,166,1)} 100%{box-shadow:0 0 0 0 rgba(20,184,166,0.4);border-color:rgba(20,184,166,0.6)} }
    input[type=range] { -webkit-appearance:none; width:100%; background:transparent; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; height:20px; width:20px; border-radius:50%; background:#14b8a6; cursor:pointer; margin-top:-8px; box-shadow:0 0 10px rgba(20,184,166,0.5); }
    input[type=range]::-webkit-slider-runnable-track { width:100%; height:4px; cursor:pointer; background:rgba(255,255,255,0.2); border-radius:2px; }
    input[type=range]:focus { outline:none; }
    input[type=range].slider-amber::-webkit-slider-thumb { background:#f59e0b; box-shadow:0 0 10px rgba(245,158,11,0.5); }
    input[type=range].slider-indigo::-webkit-slider-thumb { background:#6366f1; box-shadow:0 0 10px rgba(99,102,241,0.5); }
    .slide-up-fade { animation: slideUpFade 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes slideUpFade { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    /* NEW: toast notification */
    .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(20,184,166,0.9); color:#0f172a; padding:10px 20px; border-radius:100px; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; animation: toastIn 0.3s ease, toastOut 0.3s ease 2s forwards; z-index:9999; }
    @keyframes toastIn  { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    @keyframes toastOut { from{opacity:1} to{opacity:0} }
  `}</style>
);

// ─────────────────────────────────────────────
// TOAST  (replaces alert() for copy confirmations)
// ─────────────────────────────────────────────
const Toast: React.FC<{ message: string; onDone: () => void }> = ({ message, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return <div className="toast">{message}</div>;
};

// ─────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────
const Nav: React.FC<NavProps> = ({ title, subtitle, onBack, isDashboard, soundEnabled, toggleSound, resetApp, progress, aiActive }) => (
  <div className="flex flex-col mb-4 pt-4 animate-enter shrink-0 relative z-50">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="font-sans text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">{subtitle}</h2>
        <div className="flex items-center gap-2">
          {!isDashboard && <Activity size={20} className="text-white/80" />}
          <h1 className="font-serif text-3xl text-white/90 italic">{title}</h1>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        {aiActive && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full border mr-1 bg-teal-500/10 border-teal-500/20 text-teal-400 animate-pulse">
            <Sparkles size={10} /><span className="text-[8px] font-bold uppercase tracking-wider">AI Active</span>
          </div>
        )}
        {!isDashboard && (
          <button onClick={toggleSound} className={`p-3 rounded-full glass-button transition-all ${soundEnabled ? 'text-teal-200 bg-teal-500/10' : 'text-white/40'}`}>
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        )}
        {isDashboard && resetApp && (
          <button onClick={resetApp} className="p-3 rounded-full glass-button text-white/40 hover:text-white hover:bg-white/20 transition-all" title="Reset Identity">
            <LogOut size={20} />
          </button>
        )}
        {onBack && (
          <button onClick={onBack} className="p-3 rounded-full glass-button text-white/80 hover:text-white hover:bg-white/20 transition-all">
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
    </div>
    {progress !== undefined && progress > 0 ? (
      <div className="w-full h-[2px] bg-white/5 mt-4 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
      </div>
    ) : null}
  </div>
);

// ─────────────────────────────────────────────
// ATMOSPHERE
// ─────────────────────────────────────────────
const Atmosphere: React.FC<{ bgState: string }> = ({ bgState }) => {
  const themes: Record<string, string> = {
    neutral:      "from-[#0f172a] via-[#1e1b4b] to-[#0f172a]",
    friction:     "from-[#2a0a12] via-[#1a0505] to-[#2a0a12]",
    flow:         "from-[#042f2e] via-[#022c22] to-[#042f2e]",
    preservation: "from-[#1c1917] via-[#292524] to-[#0c0a09]",
    laser:        "from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]",
  };
  return (
    <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-[3000ms] ${themes[bgState] || themes.neutral}`}>
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  );
};

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────
const Welcome: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <div className="h-full flex flex-col justify-center items-center px-6 text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <div className="min-h-full flex flex-col justify-center items-center py-10">
      <div className="flex-1" />
      <div className="flex flex-col items-center">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full" />
          <Activity size={64} className="text-teal-200/80 relative z-10 animate-breathe" strokeWidth={0.8} />
        </div>
        <h1 className="font-serif text-5xl text-white italic tracking-wide leading-tight animate-enter">Adaptiv</h1>
        <p className="font-sans text-xs text-white/50 uppercase tracking-[0.3em] animate-enter mt-4">Alchemy for the Soul</p>
        <button onClick={onEnter} className="mt-12 px-8 py-4 rounded-full bg-white/10 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/20 hover:scale-105 transition-all animate-enter border border-white/5">
          Enter the Space
        </button>
      </div>
      <div className="flex-1" />
      <div className="mt-8 flex flex-col items-center opacity-60 shrink-0">
        <p className="font-sans text-[8px] text-white/30 uppercase tracking-widest mb-2">Powered By</p>
        <p className="font-serif italic text-white/80 text-xs">LiveAdaptiv</p>
      </div>
    </div>
  </div>
);

const Manifesto: React.FC<{ onContinue: () => void; onBack: () => void }> = ({ onContinue, onBack }) => (
  <div className="h-full flex flex-col justify-center animate-enter px-6 overflow-y-auto hide-scrollbar text-center relative">
    <button onClick={onBack} className="absolute top-6 left-2 p-3 rounded-full text-white/50 hover:text-white transition-colors z-50"><ChevronLeft size={24} /></button>
    <div className="max-w-md mx-auto py-10">
      <div className="mb-10">
        <Waves size={48} className="text-teal-400/80 mx-auto mb-6 animate-pulse" strokeWidth={0.8} />
        <h1 className="font-serif text-3xl text-white italic mb-3">Alchemy.</h1>
        <p className="font-sans text-xs text-white/40 uppercase tracking-[0.2em] leading-relaxed">A Kinetic Shift for the Modern Mind</p>
      </div>
      <div className="space-y-8 font-serif text-lg text-white/80 leading-relaxed">
        <p>Stress is not an error. It is simply energy trapped in a loop.</p>
        <p>Most tools ask you to <em>think</em> your way out. Adaptiv asks you to <em>feel</em> your way through.</p>
        <p className="text-white">In the next few minutes, we will locate the friction in the body, listen to its message, and shift it into fuel.</p>
      </div>
      <div className="my-12 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <button onClick={onContinue} className="w-full py-5 rounded-full bg-white/5 border border-white/10 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/30 transition-all">Begin</button>
    </div>
  </div>
);

const Identity: React.FC<{ userName: string; setUserName: (n: string) => void; onComplete: () => void; onBack: () => void }> = ({ userName, setUserName, onComplete, onBack }) => (
  <div className="h-full flex flex-col px-6 text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <button onClick={onBack} className="absolute top-6 left-2 p-3 rounded-full text-white/50 hover:text-white transition-colors z-50"><ChevronLeft size={24} /></button>
    <div className="min-h-full flex flex-col items-center py-10 w-full">
      <div className="flex-1" />
      <div className="w-full max-w-xs flex flex-col items-center">
        <h1 className="font-serif text-4xl text-white mb-2 italic tracking-wide">Adaptiv</h1>
        <div className="w-full space-y-6 mt-12">
          <input
            type="text" value={userName}
            onChange={e => setUserName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && userName && onComplete()}
            placeholder="Enter Name / Alias"
            className="w-full bg-transparent border-b border-white/20 py-3 text-center text-white text-xl font-serif placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-colors"
          />
          <button onClick={onComplete} disabled={!userName} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs font-medium tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Begin
          </button>
        </div>
      </div>
      <div className="flex-1" />
    </div>
  </div>
);

const ELI_DATA: Record<number, { name: string; type: string; core: string; color: string }> = {
  1: { name: "The Victim",       type: "Catabolic",  core: "I lose.",             color: "text-rose-400"   },
  2: { name: "The Fighter",      type: "Catabolic",  core: "I win, you lose.",    color: "text-orange-400" },
  3: { name: "The Rationalizer", type: "Anabolic",   core: "I cope.",             color: "text-yellow-400" },
  4: { name: "The Caregiver",    type: "Anabolic",   core: "You win.",            color: "text-sky-400"    },
  5: { name: "The Opportunist",  type: "Anabolic",   core: "We both win.",        color: "text-teal-400"   },
  6: { name: "The Visionary",    type: "Anabolic",   core: "Everyone wins.",      color: "text-indigo-400" },
  7: { name: "The Creator",      type: "Anabolic",   core: "I create.",           color: "text-violet-400" },
};

const EnergyReflection: React.FC<EnergyReflectionProps> = ({ energyAnalysis, setView, toggleSound, soundEnabled, onBack }) => {
  const level = energyAnalysis?.level ?? null;
  const eli   = level ? ELI_DATA[level] : null;

  return (
    <div className="h-full flex flex-col justify-center px-4 animate-enter">
      <Nav title="Current Resonance" subtitle="The Lens" isDashboard={false} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={5} onBack={onBack} />
      <div className="flex-1 flex flex-col justify-center items-center text-center pb-8 overflow-y-auto hide-scrollbar">

        <div className="mb-6 p-5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Compass size={40} className="text-indigo-300" />
        </div>

        <h3 className="font-serif text-2xl text-white italic mb-5">"Here is what I sense..."</h3>

        {/* AI Reflection */}
        <div className="p-5 rounded-[20px] bg-white/5 border border-white/10 mb-5 max-w-sm w-full">
          <p className="font-serif text-lg text-white/90 italic leading-relaxed">
            "{energyAnalysis?.reflection || "Connecting to your field..."}"
          </p>
        </div>

        {/* Entry Level — introduced here for the first time */}
        {eli && level && (
          <div className="w-full max-w-sm mb-6">
            <div className="bg-white/5 border border-white/10 rounded-[20px] p-5 text-left">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-3">Your Entry Energy Level</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className={`font-serif text-xl font-bold ${eli.color}`}>{level}</span>
                </div>
                <div>
                  <p className={`font-bold text-sm ${eli.color}`}>{eli.name}</p>
                  <p className="text-[9px] uppercase tracking-widest text-white/30">{eli.type} Energy</p>
                </div>
              </div>
              <p className="font-serif text-sm text-white/60 italic border-t border-white/5 pt-3">
                Core thought at this level: <span className="text-white/80">"{eli.core}"</span>
              </p>
              <p className="text-[9px] text-white/30 mt-2 leading-relaxed">
                Energy levels run from 1 (Catabolic — draining) to 7 (Anabolic — generative). This session will shift yours.
              </p>
            </div>
          </div>
        )}

        <button onClick={() => setView('fork_entry')} className="w-full py-5 rounded-full bg-indigo-500 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-indigo-400 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all max-w-sm">
          Shift This Energy
        </button>
      </div>
    </div>
  );
};

const ForkEntry: React.FC<ForkEntryProps> = ({ setView, toggleSound, soundEnabled, onBack }) => (
  <div className="h-full flex flex-col px-4">
    <Nav title="The Source" subtitle="Origin Point" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={10} />
    <div className="flex-1 flex flex-col justify-center gap-6 animate-enter overflow-y-auto hide-scrollbar pb-4">
      <div className="text-center mb-4">
        <h2 className="font-serif text-2xl text-white italic mb-2">Where is the friction loudest?</h2>
        <p className="text-xs text-white/50">Stress has two addresses. Choose the one calling for attention.</p>
      </div>
      <button onClick={() => setView('somatic')} className="p-6 rounded-[24px] glass-panel group text-left hover:bg-white/5 transition-all border border-transparent hover:border-teal-500/30">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-full bg-teal-500/10 text-teal-300 group-hover:scale-110 transition-transform"><Activity size={24} /></div>
          <div><h3 className="font-serif text-xl text-white italic">The Body</h3><p className="text-[10px] uppercase tracking-widest text-white/40">Heaviness & Tension</p></div>
        </div>
        <p className="text-xs text-white/60 leading-relaxed pl-[60px]">Tightness in chest, knot in gut, heavy shoulders, exhaustion.</p>
      </button>
      <button onClick={() => setView('diffuser')} className="p-6 rounded-[24px] glass-panel group text-left hover:bg-white/5 transition-all border border-transparent hover:border-indigo-500/30">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-300 group-hover:scale-110 transition-transform"><CloudFog size={24} /></div>
          <div><h3 className="font-serif text-xl text-white italic">The Mind</h3><p className="text-[10px] uppercase tracking-widest text-white/40">Racing Thoughts & Loops</p></div>
        </div>
        <p className="text-xs text-white/60 leading-relaxed pl-[60px]">Mental fog, analyzing, planning, replaying scenarios.</p>
      </button>
    </div>
  </div>
);

const Diffuser: React.FC<DiffuserProps> = ({ fear, setFear, setView, toggleSound, soundEnabled, onBack }) => {
  const [step, setStep] = useState(0);
  return (
    <div className="h-full flex flex-col">
      <Nav title="The Filter" subtitle="Fact vs. Fiction" onBack={() => step > 0 ? setStep(0) : onBack?.()} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={25} />
      <div className="flex-1 flex flex-col justify-center px-4 animate-enter overflow-y-auto hide-scrollbar pb-4">
        {step === 0 ? (
          <>
            <h3 className="font-serif text-2xl text-white italic mb-6 text-center">"What is the loudest loop?"</h3>
            <input autoFocus className="w-full bg-transparent border-b border-indigo-500/50 py-4 text-center text-white font-light text-lg focus:outline-none mb-8" placeholder="I keep thinking about..." value={fear} onChange={e => setFear(e.target.value)} onKeyDown={e => e.key === 'Enter' && setStep(1)} />
            <button onClick={() => setStep(1)} disabled={!fear} className="w-full py-4 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-sans text-xs tracking-widest uppercase hover:bg-indigo-500/30 transition-all">Capture Thought</button>
          </>
        ) : (
          <div className="text-center">
            <Split size={48} className="text-indigo-300 mx-auto mb-6" />
            <h3 className="font-serif text-2xl text-white italic mb-4">The Filter</h3>
            <p className="text-sm text-white/70 mb-8">Is this thought an absolute <strong>Fact</strong> (provable in court) or an <strong>Assumption</strong> (an interpretation)?</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setView('lens')} className="py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs uppercase tracking-widest">It's a Fact</button>
              <button onClick={() => setView('lens')} className="py-4 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/30 transition-all text-xs uppercase tracking-widest">It's an Assumption</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// HORIZON  (with session-memory panel & AI trigger)
// ─────────────────────────────────────────────
const Horizon: React.FC<HorizonProps> = ({
  userName, sessionCount, stressor, setStressor, perception, setPerception,
  setView, toggleSound, soundEnabled, resetApp, setEnergyAnalysis,
  soundType, setSoundType, onBack, sessionHistory,
  stressLevel, setStressLevel, energyLevel, setEnergyLevel, isBurnout,
}) => {
  const [step, setStep]                   = useState<'intake'|'chat'>('intake');
  const [chatInput, setChatInput]         = useState('');
  const [chatHistory, setChatHistory]     = useState<ChatMessage[]>([]);
  const [aiQuestionCount, setAiQuestionCount] = useState(0);
  const [showChatInput, setShowChatInput] = useState(true);
  const [showRouteButton, setShowRouteButton] = useState(false);
  const [isTyping, setIsTyping]           = useState(false);
  const [isBurnoutIntercept, setIsBurnoutIntercept] = useState(false);
  const [patternInsight, setPatternInsight]   = useState('');
  const [loadingPattern, setLoadingPattern]   = useState(false);
  const [isAnalyzing, setIsAnalyzing]         = useState(false); // NEW: loading state for final AI read
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isTyping, isBurnoutIntercept]);

  // Load pattern insight when there's history
  useEffect(() => {
    if (sessionHistory.length >= 2 && step === 'intake') {
      setLoadingPattern(true);
      generatePatternInsight(sessionHistory).then(insight => {
        setPatternInsight(insight);
        setLoadingPattern(false);
      });
    }
  }, []);

  const handleInternalBack = () => {
    if (step === 'chat') setStep('intake');
    else if (onBack) onBack();
  };

  const checkDepletion = (text: string) => {
    const triggers = ['burnout','exhausted','drained','empty','depleted','overwhelm','overwhelmed','done','tired'];
    return triggers.some(w => text.toLowerCase().includes(w));
  };

  const startAIConversation = async () => {
    if (stressor.length < 5 || perception.length < 5) return;
    
    setStep('chat');
    setAiQuestionCount(0);
    setShowChatInput(false);
    setShowRouteButton(false);
    setIsBurnoutIntercept(false);

    if (checkDepletion(stressor) || checkDepletion(perception)) {
      setTimeout(() => {
        setChatHistory([{ role: 'ai', text: sanitizeHtml(`<span class="block mb-2 font-bold text-orange-300">Pause: Deep Exhaustion Sensed</span><br/>I am hearing a lot of heavy exhaustion in what you just shared. When you are running on empty, trying to push through can drain you further. Would you like to take a quick Vitality Scan to check your reserves?`), isHtml: true }]);
        setIsBurnoutIntercept(true);
      }, 800);
      return;
    }

    setIsTyping(true);
    const firstQ = await generateHorizonQuestion(stressor, perception, "No history yet.");
    setChatHistory([{ role: 'ai', text: firstQ, isHtml: false }]);
    setIsTyping(false);
    setShowChatInput(true);
  };

  const sendUserMessage = async () => {
    if (!chatInput.trim()) return;
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: chatInput, isHtml: false }];
    setChatHistory(newHistory);
    const currentUserText = chatInput;
    setChatInput('');
    setShowChatInput(false);

    if (checkDepletion(currentUserText)) {
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: sanitizeHtml(`<span class="block mb-2 font-bold text-orange-300">Pause: Deep Exhaustion Sensed</span><br/>It sounds like you are running on absolute empty. Before we try to solve this, we need to make sure you have the energy for it.`), isHtml: true }]);
        setIsBurnoutIntercept(true);
      }, 800);
      return;
    }

    setIsTyping(true);
    const newCount = aiQuestionCount + 1;
    setAiQuestionCount(newCount);
    const historyText = newHistory.map(m => `${m.role}: ${m.text}`).join(' | ');

    if (newCount < 3) {
      const nextQ = await generateHorizonQuestion(stressor, perception, historyText);
      setChatHistory(prev => [...prev, { role: 'ai', text: nextQ, isHtml: false }]);
      setShowChatInput(true);
    } else {
      const validationHtml = await generateHorizonValidation(stressor, perception, historyText);
      setChatHistory(prev => [...prev, { role: 'ai', text: validationHtml, isHtml: true }]);
      setTimeout(() => setShowRouteButton(true), 1500);
    }
    setIsTyping(false);
  };

  const bypassBurnout = async () => {
    setIsBurnoutIntercept(false);
    setIsTyping(true);
    const historyText = chatHistory.map(m => `${m.role}: ${m.text}`).join(' | ');
    const nextQ = await generateHorizonQuestion(stressor, perception, historyText + " | User bypassed burnout scan, proceeding.");
    setChatHistory(prev => [...prev, { role: 'ai', text: nextQ, isHtml: false }]);
    setIsTyping(false);
    setShowChatInput(true);
  };

  const handleProceed = async () => {
    setIsAnalyzing(true);
    // Fire the AI to calculate the ELI level based on the chat
    const analysis = await analyzeCurrentEnergy(stressor, perception, stressLevel, energyLevel);
    setEnergyAnalysis(analysis);
    setIsAnalyzing(false);
    // Route to the reflection screen
    setView('energy_reflection'); 
  };

  return (
    <div className="h-full flex flex-col">
      <Nav
        title={`Hello, ${userName || 'Traveler'}`}
        subtitle={`Session ${sessionCount + 1}`}
        onBack={handleInternalBack} isDashboard={step === 'intake'}
        resetApp={resetApp} toggleSound={toggleSound} soundEnabled={soundEnabled}
        progress={step === 'intake' ? 10 : 20}
      />
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto hide-scrollbar animate-enter pb-8 px-4">

        {step === 'intake' && (
          <>
            {/* ── 7-DAY TRACKER ── */}
            <div className="glass-panel p-4 rounded-[24px] border-teal-500/20 relative group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-teal-100 italic">7-Day Neural Reset</h3>
                  <HelpCircle size={12} className="text-teal-500/50" />
                </div>
                <span className="font-sans text-[9px] uppercase tracking-widest text-teal-400 bg-teal-900/30 px-2 py-1 rounded">Day {(sessionCount % 7) + 1}</span>
              </div>
              <p className="text-[9px] text-teal-200/40 mb-3 leading-relaxed">Neuroplasticity requires repetition. Complete 7 cycles to rewire your baseline.</p>
              <div className="flex justify-between mb-2 relative z-10 px-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all text-[9px] font-bold ${i < (sessionCount % 7) ? 'bg-teal-500 text-slate-900 border-teal-400' : i === (sessionCount % 7) ? 'bg-teal-900/80 text-teal-400 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-110' : 'bg-white/5 border-white/10 text-white/20'}`}>
                    {i < (sessionCount % 7) ? <Check size={10} strokeWidth={3} /> : i + 1}
                  </div>
                ))}
                <div className="absolute top-3 left-3 right-3 h-[1px] bg-white/5 -z-10" />
              </div>
            </div>

            {/* ── PATTERN INSIGHT (new – shows if ≥2 sessions) ── */}
            {sessionHistory.length >= 2 && (
              <div className="glass-panel p-5 rounded-[20px] border border-indigo-500/20 bg-indigo-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-indigo-400" />
                  <span className="font-sans text-[9px] uppercase tracking-widest text-indigo-400 font-bold">Pattern Recognition</span>
                </div>
                {loadingPattern ? (
                  <div className="flex items-center gap-2 text-white/30 text-xs"><Loader2 size={12} className="animate-spin" /> Analyzing your history...</div>
                ) : (
                  <p className="font-serif text-sm text-white/80 italic leading-relaxed">{patternInsight || "Connecting patterns..."}</p>
                )}
                {/* Last session delta */}
                {sessionHistory[0] && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] text-white/30 uppercase tracking-widest">Last session</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/50">{sessionHistory[0].stressor.slice(0, 28)}{sessionHistory[0].stressor.length > 28 ? '…' : ''}</span>
                      <span className={`text-[10px] font-bold ${sessionHistory[0].postStress < sessionHistory[0].preStress ? 'text-teal-400' : 'text-rose-400'}`}>
                        {sessionHistory[0].preStress}→{sessionHistory[0].postStress}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── INTAKE FORM ── */}
            <div className="glass-panel p-8 rounded-[2rem] border border-white/10 shadow-sm animate-[slideUpFade_0.5s_ease-out_forwards]">
              <h2 className="text-3xl font-serif italic text-white mb-2">The Horizon</h2>
              <p className="text-xs text-white/50 mb-8 uppercase tracking-widest font-bold">Current State Diagnostic</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">What is weighing on you?</label>
                  <textarea value={stressor} onChange={e => setStressor(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm h-24 outline-none focus:border-teal-400 transition-all resize-none text-white font-serif italic placeholder:text-white/20" placeholder="The team missed another deadline..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">How are you experiencing this?</label>
                  <textarea value={perception} onChange={e => setPerception(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm h-24 outline-none focus:border-teal-400 transition-all resize-none text-white font-serif italic placeholder:text-white/20" placeholder="I am exhausted and resentful..." />
                </div>
                {/* Inline validation */}
                {(stressor.length > 0 && stressor.length < 5) || (perception.length > 0 && perception.length < 5) ? (
                  <p className="text-[10px] text-rose-400 uppercase tracking-widest">Please add a bit more detail to both fields.</p>
                ) : null}
              </div>
              <button onClick={startAIConversation} disabled={stressor.length < 5 || perception.length < 5} className="w-full mt-8 py-4 bg-white text-slate-900 font-bold rounded-xl text-[10px] uppercase tracking-widest text-center shadow-lg hover:bg-teal-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Begin Calibration
              </button>
            </div>
          </>
        )}

        {step === 'chat' && (
          <div className="glass-panel p-6 rounded-[2rem] border border-white/10 shadow-sm flex flex-col h-[70vh] animate-[slideUpFade_0.5s_ease-out_forwards]">
            <div className="text-center mb-4">
              <h2 className="text-xl font-serif italic text-white">Kinetic Calibration</h2>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col mb-4 pr-2 pb-4 space-y-2 hide-scrollbar">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`animate-[slideUpFade_0.3s_ease-out_forwards] ${msg.role === 'ai' ? 'bg-white/10 border border-white/10 text-white rounded-[1rem_1rem_1rem_0] p-4 max-w-[90%] self-start mb-3 font-serif text-[1.1rem] leading-relaxed shadow-sm' : 'bg-teal-500/20 text-teal-100 border border-teal-500/30 rounded-[1rem_1rem_0_1rem] p-3 px-4 max-w-[85%] self-end mb-3 text-sm'}`}>
                  {msg.isHtml
                    ? <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
                    : msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="bg-white/10 border border-white/10 text-white rounded-[1rem_1rem_1rem_0] p-4 max-w-[90%] self-start mb-3 font-serif text-[1.1rem] shadow-sm animate-pulse flex items-center gap-2">
                  <Loader2 className="animate-spin text-teal-400" size={16} />
                  <span className="text-sm opacity-50">Calibrating...</span>
                </div>
              )}
              {isBurnoutIntercept && (
                <div className="animate-enter flex flex-col gap-3 mt-4">
                  <button onClick={() => setView('burnout_check')} className="w-full py-4 bg-orange-500/20 border border-orange-500/50 text-orange-200 font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-lg hover:bg-orange-500/30 transition-all flex flex-col items-center">
                    <span>Run Vitality Scan</span>
                    <span className="text-[8px] opacity-70 mt-1">(Recommended)</span>
                  </button>
                  <button onClick={bypassBurnout} className="w-full py-3 bg-transparent border border-white/10 text-white/50 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all">
                    I have the energy to continue
                  </button>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {showChatInput && !isBurnoutIntercept && (
              <div className="mt-auto bg-white/5 p-2 rounded-2xl border border-white/10 flex items-center shadow-sm">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendUserMessage()} className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-white placeholder:text-white/40" placeholder="Type your response..." />
                <button onClick={sendUserMessage} className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-slate-900 hover:bg-teal-400 transition-colors"><ArrowUp size={20} /></button>
              </div>
            )}
            {showRouteButton && (
              <button onClick={handleProceed} disabled={isAnalyzing} className="w-full mt-4 py-4 bg-teal-500 text-slate-900 font-bold rounded-xl text-[10px] uppercase tracking-widest text-center shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:bg-teal-400 transition-all animate-[slideUpFade_0.5s_ease-out_forwards]">
                {isAnalyzing ? (
                  <><Loader2 size={14} className="animate-spin inline mr-2" /> Synthesizing Baseline...</>
                ) : (
                  "See Energetic Baseline →"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// VESSEL / BODY SCAN
// ─────────────────────────────────────────────
const Vessel: React.FC<VesselProps> = ({ somaticZones, setSomaticZones, setView, toggleSound, soundEnabled, onBack }) => {
  const zones: SomaticZone[] = [
    { id: 'Head', label: 'Head', icon: Brain }, { id: 'Eyes', label: 'Eyes', icon: Eye },
    { id: 'Throat', label: 'Throat', icon: MessageCircle }, { id: 'Chest', label: 'Chest', icon: Shield },
    { id: 'Solar', label: 'Solar Plexus', icon: Sun }, { id: 'Gut', label: 'Gut', icon: Disc },
    { id: 'Back', label: 'Back', icon: Anchor }, { id: 'Hands', label: 'Hands', icon: Hand },
  ];
  return (
    <div className="h-full flex flex-col">
      <Nav title="Body Scan" subtitle="Locate the Sensation" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={15} />
      <div className="flex-1 grid grid-cols-2 gap-3 content-start overflow-y-auto hide-scrollbar pb-4 min-h-0 animate-enter delay-100 px-4">
        {zones.map(z => {
          const Icon = z.icon;
          return (
            <button key={z.id} onClick={() => setSomaticZones([z.id])} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${somaticZones.includes(z.id) ? 'bg-slate-800/90 border-white/60' : 'glass-panel hover:bg-white/10'}`}>
              <Icon size={28} className={somaticZones.includes(z.id) ? 'text-white' : 'text-white/40'} />
              <span className={`font-serif italic ${somaticZones.includes(z.id) ? 'text-white' : 'text-white/90'}`}>{z.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={() => setView('partswork')} disabled={somaticZones.length === 0} className="mt-4 w-full py-5 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase border border-white/10 hover:bg-white/20 transition-all disabled:opacity-0 disabled:translate-y-4 shrink-0 animate-enter delay-200">
        Connect with Part
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// PARTS WORK
// ─────────────────────────────────────────────
const PartsWork: React.FC<PartsWorkProps> = ({ selectedPart, sensation, setSensation, protection, setProtection, fear, setFear, expandingBelief, setExpandingBelief, partsStep, setPartsStep, setView, toggleSound, soundEnabled, onBack }) => {
  const handleBack = () => {
    if (partsStep === 'experience') onBack?.();
    else if (partsStep === 'unblend')  setPartsStep('experience');
    else if (partsStep === 'connect')  setPartsStep('unblend');
    else if (partsStep === 'message')  setPartsStep('connect');
    else if (partsStep === 'channel')  setPartsStep('message');
  };
  return (
    <div className="h-full flex flex-col">
      <Nav title="Parts Dialogue" subtitle={selectedPart} onBack={handleBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={30} />
      <div className="flex-1 flex flex-col justify-start pt-8 space-y-6 animate-enter overflow-y-auto hide-scrollbar pb-20 px-4">
        {partsStep === 'experience' && (
          <div className="text-center">
            <Activity size={24} className="text-white/80 mx-auto mb-4" />
            <p className="font-serif text-2xl text-white/90 italic mb-4">"How does the {selectedPart} feel?"</p>
            <input autoFocus className="w-full bg-transparent border-b border-white/20 py-4 text-center text-white font-light text-lg focus:outline-none mb-6" placeholder="It feels like..." value={sensation} onChange={e => setSensation(e.target.value)} onKeyDown={e => e.key === 'Enter' && setPartsStep('unblend')} />
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Tightness","Heat","Heaviness","Buzzing"].map(s => <button key={s} onClick={() => setSensation(s)} className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] text-white/90 hover:bg-white/20 transition-all">{s}</button>)}
            </div>
            <button onClick={() => setPartsStep('unblend')} disabled={!sensation} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all">Next</button>
          </div>
        )}
        {partsStep === 'unblend' && (
          <div className="text-center">
            <Wind size={64} className="text-teal-200 mx-auto mb-8" />
            <h3 className="font-serif text-2xl text-white italic mb-4">Separation</h3>
            <p className="font-sans text-sm text-white/70 leading-relaxed mb-8">Can you ask the <strong>{sensation}</strong> to step back just a few inches?</p>
            <button onClick={() => setPartsStep('connect')} className="w-full py-4 rounded-full bg-teal-500/10 text-teal-200 font-sans text-xs tracking-widest uppercase hover:bg-teal-500/20 transition-all border border-teal-500/20">I have created space</button>
          </div>
        )}
        {partsStep === 'connect' && (
          <div className="text-center">
            <Waves size={64} className="text-indigo-200 mx-auto mb-8" />
            <h3 className="font-serif text-2xl text-white italic mb-4">The Inquiry</h3>
            <p className="font-sans text-sm text-white/70 leading-relaxed mb-6">Ask internally: <em>"What are you afraid would happen if you didn't do this job?"</em></p>
            <input autoFocus className="w-full bg-transparent border-b border-indigo-500/30 py-4 text-center text-white font-light text-lg focus:outline-none mb-8" placeholder="It is afraid that..." value={fear} onChange={e => setFear(e.target.value)} onKeyDown={e => e.key === 'Enter' && setPartsStep('message')} />
            <button onClick={() => setPartsStep('message')} disabled={!fear} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all border border-white/5">Acknowledge Fear</button>
          </div>
        )}
        {partsStep === 'message' && (
          <div className="text-center">
            <Shield size={24} className="text-white/80 mx-auto mb-4" />
            <p className="font-serif text-2xl text-white/90 italic mb-4">"What is it trying to do?"</p>
            <input autoFocus className="w-full bg-transparent border-b border-white/20 py-4 text-center text-white font-light text-lg focus:outline-none mb-6" placeholder="It is trying to..." value={protection} onChange={e => setProtection(e.target.value)} onKeyDown={e => e.key === 'Enter' && setPartsStep('channel')} />
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Prevent Failure","Keep me Safe","Control Outcomes"].map(p => <button key={p} onClick={() => setProtection(p)} className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] text-white/90 hover:bg-white/20 transition-all">{p}</button>)}
            </div>
            <button onClick={() => setPartsStep('channel')} disabled={!protection} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all">Acknowledge</button>
          </div>
        )}
        {partsStep === 'channel' && (
          <div className="text-center">
            <Zap size={24} className="text-teal-200 mx-auto mb-4" />
            <p className="font-serif text-2xl text-teal-100 italic mb-4">"Shift the Energy"</p>
            <p className="font-sans text-xs text-white/60 mb-6">You don't need to destroy the energy. Use it.</p>
            <input autoFocus className="w-full bg-transparent border-b border-teal-500/30 py-4 text-center text-teal-50 font-light text-lg focus:outline-none mb-8" placeholder="I will use this energy to..." value={expandingBelief} onChange={e => setExpandingBelief(e.target.value)} onKeyDown={e => e.key === 'Enter' && setView('lens')} />
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Fuel my boundaries","Deepen my focus","Drive my commitment"].map(ex => (
                <button key={ex} onClick={() => setExpandingBelief(ex)} className="px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/10 text-[10px] text-teal-200 hover:bg-teal-500/20 transition-all">{ex}</button>
              ))}
            </div>
            <button onClick={() => setView('lens')} disabled={!expandingBelief} className="w-full py-4 rounded-full bg-teal-500/10 text-teal-200 border border-teal-500/20 font-sans text-xs tracking-widest uppercase hover:bg-teal-500/20 transition-all">Integrate</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LASER COACHING
// ─────────────────────────────────────────────
const LaserCoaching: React.FC<LaserCoachingProps> = ({ stressor, perception, somatic, setView, toggleSound, soundEnabled, setGoal, setExpandingBelief, energyLevel, stressLevel, onBack }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({ topic: '', result: '', permission: '', action: '' });
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (aiQuestions.length === 0) {
      setLoading(true);
      generateCoachingQuestions(stressor || "General Stress", perception || "Feeling Stuck", somatic || "Body", energyLevel, stressLevel)
        .then(q => { setAiQuestions(q); setLoading(false); });
    }
  }, []);

  const starters: Record<number, string[]> = {
    0: ["My insight is...","The real issue is...","I'm realizing that...","I sense..."],
    1: ["To feel...","To achieve...","To experience...","To become..."],
    2: ["To make a mess.","To prioritize me.","To let go.","To trust myself."],
    3: ["I will call...","I will write...","I will stop...","I will start..."],
  };

  const currentQ = [
    { id: 'topic',      label: 'The Insight',   q: aiQuestions[0] || "Connecting to the field...", ph: 'My insight is...' },
    { id: 'result',     label: 'The Vision',     q: aiQuestions[1] || "If this shifted, what state or outcome would you experience?", ph: 'I want to...' },
    { id: 'permission', label: 'Permission',     q: aiQuestions[2] || "What permission do you need to give yourself to move forward?", ph: 'I give myself permission to...' },
    { id: 'action',     label: 'The Move',       q: aiQuestions[3] || "What is the single boldest step that makes everything else easier?", ph: 'I will...' },
  ][step];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      setExpandingBelief(answers.topic);
      setGoal((prev: any) => ({ ...prev, outcome: answers.result, action: answers.action }));
      setView('integration');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Nav title="Breakthrough Laser" subtitle="Rapid Shift" onBack={() => step > 0 ? setStep(step - 1) : onBack?.()} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={80} aiActive={!loading} />
      <div className="flex-1 px-4 pt-4 overflow-y-auto hide-scrollbar">
        <div className="glass-panel p-6 rounded-[32px] mb-4">
          {loading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-teal-400" /></div>
          ) : (
            <div className="animate-enter">
              <span className="font-sans text-[10px] text-white/40 uppercase tracking-widest mb-4 block">{currentQ.label}</span>
              <h3 className="font-serif text-2xl text-white italic mb-8 leading-snug">{currentQ.q}</h3>
              <input autoFocus className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none mb-6 text-lg placeholder:text-white/20" placeholder={currentQ.ph} value={answers[currentQ.id]} onChange={e => setAnswers({ ...answers, [currentQ.id]: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleNext()} />
              <div className="flex flex-wrap gap-2 mb-6">
                {(starters[step] || []).map(s => (
                  <button key={s} onClick={() => setAnswers({ ...answers, [currentQ.id]: s })} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] text-white/60 hover:bg-white/10 transition-colors">{s}</button>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={handleNext} disabled={!answers[currentQ.id]} className="px-8 py-3 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-widest uppercase disabled:opacity-50">
                  {step === 3 ? "Lock It In" : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PERSPECTIVE
// ─────────────────────────────────────────────
const Perspective: React.FC<PerspectiveProps> = ({ pressure, setPressure, ability, setAbility, setView, toggleSound, soundEnabled, onBack }) => {
  const flowState = ability >= pressure;
  const deficit   = pressure - ability;
  return (
    <div className="h-full flex flex-col">
      <Nav title="The Perspective" subtitle="Calibration" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={50} />
      <div className="flex-1 flex flex-col items-center justify-start pt-4 px-4 overflow-y-auto hide-scrollbar pb-8">
        <div className="text-center mb-8 max-w-sm animate-enter">
          <p className="font-serif text-lg text-white/70 italic leading-relaxed">Friction is a mathematical equation. It occurs when external demand exceeds internal bandwidth. Quantify the gap.</p>
        </div>
        <div className={`relative w-48 h-48 rounded-full border border-white/10 flex items-center justify-center transition-all duration-1000 mb-8 animate-enter delay-100 ${flowState ? 'shadow-[0_0_60px_rgba(20,184,166,0.2)] bg-teal-900/10' : 'shadow-[0_0_60px_rgba(244,63,94,0.2)] bg-rose-900/10'}`}>
          <div className="text-center relative z-10 px-2">
            <h2 className={`font-serif text-3xl italic mb-1 ${flowState ? 'text-teal-300' : 'text-rose-300'}`}>{flowState ? 'Flow State' : 'High Friction'}</h2>
            <p className="font-sans text-[10px] tracking-widest uppercase text-white/60">{flowState ? 'Capacity exceeds demand.' : `Capacity deficit: -${deficit}%`}</p>
          </div>
          <div className={`absolute inset-4 rounded-full border border-dashed opacity-30 ${flowState ? 'border-teal-400 animate-[spin_20s_linear_infinite]' : 'border-rose-400 animate-pulse'}`} />
        </div>
        <div className="w-full glass-panel p-6 rounded-[24px] border-white/10 space-y-8 animate-enter delay-200">
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <div><p className="font-sans text-[10px] tracking-widest text-amber-300 uppercase font-bold">Requirement Intensity</p><p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">External Demand</p></div>
              <div className="text-2xl font-serif italic text-amber-400">{pressure}%</div>
            </div>
            <input type="range" min="1" max="100" value={pressure} onChange={e => setPressure(parseInt(e.target.value))} className="w-full slider-amber" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <div><p className="font-sans text-[10px] tracking-widest text-indigo-300 uppercase font-bold">Internal Capacity</p><p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Current Bandwidth</p></div>
              <div className="text-2xl font-serif italic text-indigo-400">{ability}%</div>
            </div>
            <input type="range" min="1" max="100" value={ability} onChange={e => setAbility(parseInt(e.target.value))} className="w-full slider-indigo" />
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 animate-enter delay-300">
        <button onClick={() => setView('fork')} className="w-full py-5 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
          Direct the Energy
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CROSSROADS
// ─────────────────────────────────────────────
const Crossroads: React.FC<CrossroadsProps> = ({ setView, toggleSound, soundEnabled, stressLevel, energyLevel, onBack }) => {
  const recommendStillness = stressLevel > 70 && energyLevel < 40;
  return (
    <div className="h-full flex flex-col justify-center px-6">
      <Nav title="The Crossroads" subtitle="Choice Point" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={65} />
      <div className="flex-1 flex flex-col justify-center overflow-y-auto hide-scrollbar pb-4">
        <h1 className="font-serif text-4xl text-white text-center italic mb-8">Transformation</h1>
        <div className="grid gap-4">
          <button onClick={() => setView('regulate')} className={`p-8 rounded-[32px] glass-panel text-left hover:bg-white/10 ${recommendStillness ? 'border-teal-500/50 glow-pulse' : ''}`}>
            <Wind size={32} className="text-teal-200/50 mb-4" />
            <h3 className="font-serif text-2xl text-white italic">Stillness</h3>
            {recommendStillness && <span className="text-[10px] uppercase tracking-widest text-teal-400">Recommended</span>}
          </button>
          <button onClick={() => setView('laser')} className={`p-8 rounded-[32px] glass-panel text-left hover:bg-white/10 ${!recommendStillness ? 'border-amber-500/50 glow-pulse' : ''}`}>
            <Zap size={32} className="text-amber-200/50 mb-4" />
            <h3 className="font-serif text-2xl text-white italic">Motion</h3>
            {!recommendStillness && <span className="text-[10px] uppercase tracking-widest text-amber-400">Recommended</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// BREATH  (enhanced with sound engine integration)
// ─────────────────────────────────────────────
const Breath: React.FC<BreathProps> = ({ breathing, setBreathing, breathCount, setBreathCount, setView, toggleSound, soundEnabled, onBack }) => {
  // Box breathing: 4 in, 4 hold, 4 out, 4 hold
  const PHASE_LEN = 4;
  const CYCLE_LEN = PHASE_LEN * 4;
  const phaseIndex = breathCount % CYCLE_LEN;

  let phase = "Begin";
  let phaseCount = phaseIndex + 1;
  let scale = 1;
  let color = "text-white";

  if (phaseIndex < PHASE_LEN) {
    phase = "Inhale"; scale = 1 + (phaseIndex / PHASE_LEN) * 0.5; color = "text-teal-300";
  } else if (phaseIndex < PHASE_LEN * 2) {
    phase = "Hold"; scale = 1.5; color = "text-indigo-300"; phaseCount = phaseIndex - PHASE_LEN + 1;
  } else if (phaseIndex < PHASE_LEN * 3) {
    phase = "Exhale"; scale = 1.5 - ((phaseIndex - PHASE_LEN * 2) / PHASE_LEN) * 0.5; color = "text-teal-200"; phaseCount = phaseIndex - PHASE_LEN * 2 + 1;
  } else {
    phase = "Hold"; scale = 1; color = "text-white/60"; phaseCount = phaseIndex - PHASE_LEN * 3 + 1;
  }

  const completedCycles = Math.floor(breathCount / CYCLE_LEN);

  useEffect(() => {
    if (!breathing) return;
    const i = setInterval(() => {
      setBreathCount((c: number) => {
        const next = c + 1;
        // Play breath tone on phase transitions
        const idx = next % CYCLE_LEN;
        if (idx === 0)              soundEngine.playBreathTone(523, 0.4);  // C5 – inhale start
        else if (idx === PHASE_LEN) soundEngine.playBreathTone(392, 0.3);  // G4 – hold
        else if (idx === PHASE_LEN * 2) soundEngine.playBreathTone(349, 0.5); // F4 – exhale
        return next;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [breathing]);

  const handleToggle = () => {
    if (breathing) {
      setBreathing(false);
      setBreathCount(0);
    } else {
      setBreathing(true);
      setBreathCount(0);
      soundEngine.playBreathTone(523, 0.4);
    }
  };

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <Nav title="Regulation" subtitle="Box Breath" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} />
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto hide-scrollbar pb-4">

        {/* Cycle counter */}
        {breathing && (
          <div className="mb-6 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i < completedCycles % 4 ? 'bg-teal-400' : 'bg-white/10'}`} />
            ))}
          </div>
        )}

        <div className="relative flex items-center justify-center">
          {breathing && <div className="absolute w-64 h-64 rounded-full border border-teal-500/30 ripple-ring" />}
          <div
            className={`w-64 h-64 rounded-full border border-white/10 flex flex-col items-center justify-center transition-all duration-1000 z-10 ${breathing ? 'bg-teal-900/20 shadow-[0_0_50px_rgba(20,184,166,0.2)]' : 'bg-white/5'}`}
            style={{ transform: `scale(${breathing ? scale : 1})` }}
          >
            <span className={`font-serif text-2xl italic transition-colors duration-500 ${breathing ? color : 'text-white'}`}>
              {breathing ? phase : "Stillness"}
            </span>
            {breathing && <span className="font-sans text-4xl text-white/50 font-light mt-2">{phaseCount}</span>}
          </div>
        </div>

        {/* Phase label */}
        {breathing && (
          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
            {phase === 'Inhale' ? 'Through the nose' : phase === 'Exhale' ? 'Through the mouth' : 'Still'}
          </p>
        )}

        <div className="h-16" />
        <button onClick={handleToggle} className="px-10 py-4 rounded-full bg-white text-slate-900 font-bold text-xs uppercase mb-4">
          {breathing ? 'Complete' : 'Begin'}
        </button>
        {!breathing && (
          <button onClick={() => setView('insight')} className="text-teal-200 text-xs uppercase tracking-widest">
            Capture Insight
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// INSIGHT
// ─────────────────────────────────────────────
const Insight: React.FC<InsightProps> = ({ expandingBelief, setExpandingBelief, setView, toggleSound, soundEnabled, onBack }) => (
  <div className="h-full flex flex-col justify-center px-6 text-center">
    <Nav title="The Clarity" subtitle="Harvesting" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} />
    <div className="flex-1 flex flex-col justify-center overflow-y-auto hide-scrollbar pb-4">
      <h3 className="font-serif text-2xl text-white italic mb-6">"In the stillness, what became clear?"</h3>
      <input autoFocus className="w-full bg-transparent border-b border-white/20 py-4 text-center text-white font-light text-lg focus:outline-none mb-12" placeholder="The truth is..." value={expandingBelief} onChange={e => setExpandingBelief(e.target.value)} onKeyDown={e => e.key === 'Enter' && setView('alchemy')} />
      <button onClick={() => setView('alchemy')} disabled={!expandingBelief} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-0">
        Direct this Energy
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// ALCHEMY  (chemistry type now stored in state)
// ─────────────────────────────────────────────
const Alchemy: React.FC<AlchemyProps & { setAlchemyType: (t: string) => void }> = ({ setView, toggleSound, soundEnabled, onBack, setAlchemyType }) => (
  <div className="h-full flex flex-col">
    <Nav title="Vitality Alchemy" subtitle="Select Chemistry" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} />
    <div className="flex-1 space-y-4 px-4 pt-4 overflow-y-auto hide-scrollbar pb-4">
      {[
        { id: 'perform',  label: 'Performance', desc: 'Sharpen focus and executive capacity.',    icon: Zap   },
        { id: 'connect',  label: 'Connection',  desc: 'Open the heart. Deepen relationships.',    icon: Heart },
        { id: 'learn',    label: 'Expansion',   desc: 'Build new neural pathways. Grow.',         icon: BookOpen },
      ].map(i => (
        <button key={i.id} onClick={() => { setAlchemyType(i.id); setView('integration'); }} className="w-full p-6 rounded-[24px] glass-panel text-left hover:bg-white/5 transition-all">
          <i.icon className="text-white/80 mb-2" size={24} />
          <h3 className="font-serif text-2xl text-white italic">{i.label}</h3>
          <p className="font-serif text-white/60 italic text-sm">{i.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// PRIMING
// ─────────────────────────────────────────────
const Priming: React.FC<PrimingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: Mountain, title: "Physiology",      instruction: "Change your state immediately. Stand up. Shoulders back. Deep breath. Look up.", action: "I am ready." },
    { icon: Anchor,   title: "Somatic Anchor",  instruction: "Where do you feel this new power in your body? Put your hand there now.", action: "I feel it." },
    { icon: Eye,      title: "Visualization",   instruction: "Close your eyes. See the goal achieved. Feel the emotion of the win in your body.", action: "Seal it." },
  ];
  const current = steps[step];
  const next = () => { if (step < steps.length - 1) setStep(step + 1); else onComplete(); };
  return (
    <div className="h-full flex flex-col justify-center items-center text-center animate-enter overflow-y-auto hide-scrollbar">
      <div className="min-h-full flex flex-col justify-center items-center py-10 w-full">
        <div className="mb-8 relative"><div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full" /><current.icon size={64} className="text-white relative z-10 animate-pulse" strokeWidth={1} /></div>
        <h2 className="font-serif text-3xl text-white italic mb-4 animate-enter" key={`t-${step}`}>{current.title}</h2>
        <p className="font-sans text-lg text-white/80 leading-relaxed max-w-[280px] mx-auto mb-12 animate-enter delay-100" key={`i-${step}`}>{current.instruction}</p>
        <button onClick={next} className="px-10 py-5 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-[0.2em] uppercase hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all animate-enter delay-200">{current.action}</button>
        <div className="flex gap-2 mt-8">{steps.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />))}</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// INTEGRATION  (with AI-assessed exit level)
// ─────────────────────────────────────────────
const Integration: React.FC<IntegrationProps> = ({
  goal, setGoal, goalStep, setGoalStep, isLocked, setIsLocked,
  expandingBelief, stressor, fear, sessionCount, completeSession,
  resetApp, setView, toggleSound, soundEnabled, somaticZones,
  isBurnoutPath, userName, energyAnalysis, stressLevel, energyLevel,
  postStressLevel, setPostStressLevel, postEnergyLevel, setPostEnergyLevel,
  onBack, saveSession,
}: any) => {
  const [primingDone,   setPrimingDone]   = useState(false);
  const [manifesto,     setManifesto]     = useState("");
  const [generating,    setGenerating]    = useState(false);
  const [isOffline,     setIsOffline]     = useState(false);
  const [showToast,     setShowToast]     = useState(false);
  const [toastMsg,      setToastMsg]      = useState("");
  const [sessionSaved,  setSessionSaved]  = useState(false);
  const [exitLevel,     setExitLevel]     = useState<number | null>(null);
  const [assessingExit, setAssessingExit] = useState(false);
  const assessTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre/post sliders
  const [preStress,  setPreStress]  = useState(stressLevel);
  const [postStress, setPostStress] = useState(stressLevel);
  const [postEnergy, setPostEnergy] = useState(energyLevel);

  const stressDelta = postStress - preStress;
  const entryLevel  = energyAnalysis?.level ?? 2;

  // Run AI exit assessment whenever sliders change (debounced 800ms)
  useEffect(() => {
    if (!isLocked) return;
    if (assessTimeout.current) clearTimeout(assessTimeout.current);
    assessTimeout.current = setTimeout(async () => {
      setAssessingExit(true);
      const level = await assessExitEnergy(
        stressor, expandingBelief, goal.action || '', postStress, postEnergy, entryLevel
      );
      setExitLevel(level);
      setAssessingExit(false);
    }, 800);
    return () => { if (assessTimeout.current) clearTimeout(assessTimeout.current); };
  }, [postStress, postEnergy, isLocked]);

  // Save session once when locked
  useEffect(() => {
    if (isLocked && !sessionSaved) {
      const record: SessionRecord = {
        date:            new Date().toISOString(),
        stressor,
        preStress:       preStress,
        postStress:      postStress,
        preEnergy:       energyLevel,
        postEnergy:      postEnergy,
        coreFear:        fear,
        expandingBelief,
        commitment:      `${goal.action} (${goal.when})`,
        energyLevel:     exitLevel ?? entryLevel,
      };
      saveSession(record);
      setSessionSaved(true);
      completeSession();
    }
  }, [isLocked]);

  useEffect(() => {
    if (isLocked) {
      setPostStressLevel(postStress);
      setPostEnergyLevel(postEnergy);
    }
  }, [isLocked]);

  useEffect(() => {
    if (isLocked && !isBurnoutPath && !manifesto) {
      setGenerating(true);
      generateManifesto(stressor, expandingBelief, goal.action || "action", fear, entryLevel, (text) => setManifesto(text))
        .then(res => { setIsOffline(res.isOffline); setGenerating(false); });
    }
  }, [isLocked, isBurnoutPath, manifesto]);

  const quickTimes = ["Now", "Within 1 Hr", "Today", "Tomorrow"];
  const steps = [
    { id: 'outcome', q: 'The Goal',       ph: 'Desired outcome?' },
    { id: 'action',  q: 'The Action',     ph: 'Single step?'     },
    { id: 'when',    q: 'The Commitment', ph: 'When?'            },
  ];
  const current = steps[Math.min(goalStep, 2)];
  const handleBack     = () => { if (goalStep > 0) setGoalStep(goalStep - 1); else onBack?.(); };
  const handleNextStep = () => { if (goalStep < 2) setGoalStep(goalStep + 1); else setIsLocked(true); };

  // Copy decree — async, with toast
  const copyArtifact = async () => {
    const text = `ADAPTIV DECREE\n\n${manifesto}\n\nCommitment: ${goal.action} (${goal.when})`;
    try {
      await navigator.clipboard.writeText(text);
      setToastMsg("Decree copied");
    } catch {
      setToastMsg("Copy failed — try long-press");
    }
    setShowToast(true);
  };

  const generateEmailLink = () => {
    const subject = `My Adaptiv Decree`;
    const body    = `${manifesto}\n\nMy Commitment: ${goal.action} (${goal.when})`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const generateCalendarLink = () => {
    const text    = `Adaptiv Commitment: ${goal.action}`;
    const details = `${manifesto}\n\nGenerated by Adaptiv`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&details=${encodeURIComponent(details)}`;
  };

  if (isLocked && !primingDone && !isBurnoutPath) {
    return (
      <div className="h-full flex flex-col relative z-20">
        <Nav title="Integration" subtitle="Embodiment" onBack={() => setIsLocked(false)} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={90} />
        <Priming onComplete={() => setPrimingDone(true)} />
      </div>
    );
  }

  if (isLocked) {
    const displayExitLevel = exitLevel ?? entryLevel;
    const entryELI = ELI_DATA[entryLevel];
    const exitELI  = ELI_DATA[displayExitLevel];
    const levelMoved = displayExitLevel > entryLevel;
    const levelSame  = displayExitLevel === entryLevel;

    return (
      <div className="h-full flex flex-col px-4 text-center justify-center">
        <Nav title="Integration" subtitle="Blueprint Complete" onBack={() => setView('dashboard')} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={100} aiActive={generating || assessingExit} />
        {showToast && <Toast message={toastMsg} onDone={() => setShowToast(false)} />}

        <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 pt-4">

          {/* ── KINETIC SHIFT CARD ── */}
          <div className="glass-panel p-6 rounded-[2rem] border-t-4 border-teal-500 shadow-2xl text-center mb-6 animate-enter">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-5">Kinetic Shift Detected</h2>

            {/* ELI level transition — AI assessed, with names and meanings */}
            {assessingExit ? (
              <div className="flex items-center justify-center gap-2 mb-6 text-white/40">
                <Loader2 size={14} className="animate-spin text-teal-400" />
                <span className="text-xs">Assessing your exit energy...</span>
              </div>
            ) : (
              <div className="mb-5">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {/* Entry level card */}
                  <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[8px] uppercase tracking-widest text-white/30 mb-2">Entry</p>
                    <div className={`text-2xl font-serif italic mb-1 ${entryELI?.color ?? 'text-rose-400'}`}>L{entryLevel}</div>
                    <p className={`text-[10px] font-bold ${entryELI?.color ?? 'text-rose-400'}`}>{entryELI?.name ?? '—'}</p>
                    <p className="text-[9px] text-white/30 italic mt-1">"{entryELI?.core ?? '—'}"</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">{entryELI?.type}</p>
                  </div>
                  {/* Arrow */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <ArrowRight size={18} className={levelMoved ? 'text-teal-400' : 'text-white/20'} />
                    {levelMoved && <span className="text-[8px] font-bold text-teal-400">+{displayExitLevel - entryLevel}</span>}
                  </div>
                  {/* Exit level card */}
                  <div className={`flex-1 rounded-2xl p-4 border ${levelMoved ? 'bg-teal-500/10 border-teal-500/30' : 'bg-white/5 border-white/5'}`}>
                    <p className="text-[8px] uppercase tracking-widest text-white/30 mb-2">Exit</p>
                    <div className={`text-2xl font-serif italic mb-1 ${exitELI?.color ?? 'text-teal-400'}`}>L{displayExitLevel}</div>
                    <p className={`text-[10px] font-bold ${exitELI?.color ?? 'text-teal-400'}`}>{exitELI?.name ?? '—'}</p>
                    <p className="text-[9px] text-white/30 italic mt-1">"{exitELI?.core ?? '—'}"</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">{exitELI?.type}</p>
                  </div>
                </div>
                {/* Shift summary sentence */}
                <div className={`text-xs leading-relaxed px-3 py-3 rounded-xl ${levelMoved ? 'bg-teal-500/10 text-teal-300' : levelSame ? 'bg-white/5 text-white/40' : 'bg-rose-500/10 text-rose-300'}`}>
                  {levelMoved
                    ? `You shifted from ${entryELI?.name} to ${exitELI?.name}. The core thought moved from "${entryELI?.core}" to "${exitELI?.core}." That is a real energetic shift.`
                    : levelSame
                    ? `Holding at ${entryELI?.name}. Adjust the sliders below if your state has changed — the AI will reassess.`
                    : `More metabolizing needed. Rate where you actually are below and the assessment will update.`
                  }
                </div>
              </div>
            )}

            {/* Stress delta meters */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">Stress</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-serif text-xl text-rose-400">{preStress}</span>
                  <TrendingDown size={14} className={stressDelta < 0 ? "text-teal-400" : "text-rose-400"} />
                  <span className="font-serif text-xl text-teal-400">{postStress}</span>
                </div>
                <p className={`text-[10px] font-bold mt-1 ${stressDelta < 0 ? 'text-teal-400' : stressDelta === 0 ? 'text-white/30' : 'text-rose-400'}`}>
                  {stressDelta < 0 ? `${Math.abs(stressDelta)} pts metabolized` : stressDelta === 0 ? 'Baseline held' : `+${stressDelta} (review)`}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">Energy</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-serif text-xl text-white/50">{energyLevel}</span>
                  <ArrowRight size={14} className="text-teal-400" />
                  <span className="font-serif text-xl text-teal-400">{postEnergy}</span>
                </div>
                <p className="text-[10px] font-bold mt-1 text-teal-400/60">Exit baseline</p>
              </div>
            </div>

            {/* Post-session sliders */}
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-3">Rate where you actually are right now</p>
            <div className="text-left mb-5 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Stress (1 low → 10 high)</label>
                  <span className="text-teal-400 font-serif text-lg">{postStress}</span>
                </div>
                <input type="range" min={1} max={10} value={postStress} onChange={e => setPostStress(parseInt(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Energy (1 depleted → 10 full)</label>
                  <span className="text-teal-400 font-serif text-lg">{postEnergy}</span>
                </div>
                <input type="range" min={1} max={10} value={postEnergy} onChange={e => setPostEnergy(parseInt(e.target.value))} className="w-full" />
              </div>
            </div>

            {/* Manifesto */}
            <div className="text-left bg-white/5 border border-white/10 p-5 rounded-2xl mb-5">
              {generating ? (
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Synthesizing your decree...
                </div>
              ) : (
                <p className="font-serif text-sm text-white/80 leading-relaxed italic">"{manifesto}"</p>
              )}
            </div>

            {/* Action row */}
            {!generating && manifesto && (
              <div className="flex gap-3 mb-6">
                <button onClick={copyArtifact} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                  <Copy size={12} /> Copy
                </button>
                <a href={generateEmailLink()} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                  <Mail size={12} /> Email
                </a>
                <a href={generateCalendarLink()} target="_blank" rel="noreferrer" className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                  <Calendar size={12} /> Calendar
                </a>
              </div>
            )}

            {/* Upsells */}
            <p className="text-xs font-bold uppercase tracking-widest text-white/90 mb-4">Secure Your Baseline</p>
            <div className="space-y-3">
              <a href="https://billing.liveadaptiv.com/checkout/buy/d29e3b81-78a4-4611-83f8-11fe76d9d82e" target="_blank" rel="noreferrer" className="block w-full py-4 bg-teal-500 text-slate-900 font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-lg hover:bg-teal-400 transition-all">
                Install Stress Transformation Protocol ($47)
              </a>
              <a href="https://calendly.com/alexioda" target="_blank" rel="noreferrer" className="block w-full py-4 bg-white/5 border border-white/20 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:border-teal-400 hover:text-teal-400 transition-all">
                Book Clinical Strategy Session ($495)
              </a>
            </div>
          </div>

          <div className="flex gap-4 justify-center pb-8 pt-4 border-t border-white/5">
            <button onClick={resetApp} className="flex items-center justify-center gap-2 text-white/40 hover:text-white uppercase text-[10px] tracking-widest"><RefreshCw size={12} /> Reset System</button>
            <button onClick={() => setView('dashboard')} className="flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest border px-4 py-2 rounded-full text-teal-400 border-teal-500/30 hover:bg-teal-900/20"><Home size={12} /> Return to Orbit</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Nav title="Integration" subtitle="Blueprint" onBack={onBack} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={90} />
      <div className="glass-panel p-8 rounded-[32px] m-4">
        <h3 className="font-serif text-xl text-white italic mb-6">{current.q}</h3>
        {current.id === 'when' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {quickTimes.map(time => (
                <button key={time} onClick={() => { setGoal({ ...goal, when: time }); setIsLocked(true); }} className="py-3 rounded-xl border border-white/20 bg-white/5 text-sm font-sans text-white/90 hover:bg-white/20 hover:border-white/40 hover:text-white transition-all shadow-sm">
                  {time}
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-white/30 uppercase tracking-widest mt-4">Select to Seal</p>
          </div>
        ) : (
          <>
            {current.id === 'outcome' ? (
              <div className="flex items-start bg-white/5 border border-white/10 focus-within:border-teal-500/50 rounded-2xl overflow-hidden transition-all relative z-10 mb-6">
                <div className="pl-4 pt-4 text-white/40 font-serif italic text-lg select-none">To</div>
                <textarea value={goal.outcome} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoal({ ...goal, outcome: e.target.value })} className="w-full bg-transparent p-4 pl-2 pt-4 text-white text-sm outline-none resize-none font-serif italic leading-relaxed h-28" placeholder="execute the strategy without absorbing the team's anxiety..." />
              </div>
            ) : (
              <input autoFocus className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none mb-6" placeholder={current.ph} value={goal[current.id as keyof Goal]} onChange={e => setGoal({ ...goal, [current.id]: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleNextStep()} />
            )}
            <div className="flex gap-3">
              <button onClick={handleBack} className="px-4 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white transition-colors">Back</button>
              <button onClick={handleNextStep} disabled={!goal[current.id as keyof Goal]} className="flex-1 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs uppercase disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PRESERVATION MODE
// ─────────────────────────────────────────────
const Preservation: React.FC<PreservationProps> = ({ setView, toggleSound, soundEnabled, setGoal, setExpandingBelief, setViewToIntegration, onBack }) => {
  const [step, setStep] = useState(0);
  const recoverySteps = [
    { title: "Emergency Brake", icon: Anchor,      desc: "We cannot push through burnout. We must stop. Locate one part of your body that feels neutral — hands, feet. Focus there only.", action: "I am anchored." },
    { title: "Boundary Alchemy", icon: MinusCircle, desc: "Burnout is cured by subtraction. What is one thing you will REFUSE to do today? Name it, then release it.", action: "I let it go." },
    { title: "Identity Shift",   icon: User,        desc: "You are not the worker. You are the Asset. If the Asset breaks, the work stops. Protecting the Asset IS the work.", action: "I am the Asset." },
  ];
  const current = recoverySteps[step];
  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else {
      setExpandingBelief("I am the Asset. Rest is my strategy.");
      setGoal({ outcome: "Status: Unavailable", action: "I am offline to realign.", when: "Now" });
      setViewToIntegration();
    }
  };
  const handleBack = () => { if (step > 0) setStep(step - 1); else onBack?.(); };
  return (
    <div className="h-full flex flex-col">
      <Nav title="Preservation Mode" subtitle="Recovery Loop" onBack={handleBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={33 * (step + 1)} />
      <div className="flex-1 flex flex-col justify-center items-center animate-enter text-center px-4 overflow-y-auto hide-scrollbar">
        <div className="mb-8 relative mx-auto"><div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full" /><current.icon size={64} className="text-orange-200 relative z-10" strokeWidth={1} /></div>
        <h2 className="font-serif text-3xl text-white italic mb-4">{current.title}</h2>
        <p className="font-sans text-sm text-orange-100/70 leading-relaxed mb-12 max-w-xs mx-auto">{current.desc}</p>
        <button onClick={handleNext} className="w-full py-5 rounded-full bg-gradient-to-r from-orange-900/60 to-amber-900/60 border border-orange-500/30 text-orange-100 font-sans text-xs tracking-widest uppercase hover:border-orange-500/50 transition-all">{current.action}</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// VITALITY SCAN
// ─────────────────────────────────────────────
const VitalityScan: React.FC<VitalityScanProps> = ({ setView, setBurnoutPath, toggleSound, soundEnabled, onBack }) => {
  const [step, setStep]           = useState(0);
  const [score, setScore]         = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading]     = useState(false);

  const questions = [
    { q: "Physical State",       text: "Do you feel tired even after sleep, or have physical symptoms like headaches or stomach knots?" },
    { q: "Emotional State",      text: "Do you feel increasingly cynical, detached, or negative about your work or the people you work with?" },
    { q: "Cognitive Fog",        text: "Are you finding it hard to concentrate, or do you feel like you're working harder but accomplishing less?" },
    { q: "Relational Snap",      text: "Are you more irritable or impatient with colleagues, friends, or family than usual?" },
    { q: "Anticipatory Dread",   text: "Do you feel a sense of dread or heavy anxiety on Sunday nights or before starting your shift?" },
    { q: "Recovery Lag",         text: "Does it take you longer than a weekend to feel like yourself again?" },
  ];

  const handleBack = () => { if (step > 0) setStep(step - 1); else onBack?.(); };

  const confirmAnswer = (val: number) => {
    const newScore = score + val;
    setScore(newScore);
    if (step < questions.length - 1) setStep(step + 1);
    else {
      const result = getResult(newScore);
      setShowResult(true);
      setLoading(true);
      generateEnergyInsight(result.isBurnout ? 1 : 2, `Burnout Phase: ${result.type}`)
        .then(res => { setAiInsight(res); setLoading(false); });
    }
  };

  const getResult = (s: number) => {
    if (s <= 2) return { type: "Friction (Acute Stress)",    desc: "You are under pressure, but the engine is still intact. You need to discharge the stress, not stop the car.", action: "Use Laser Coaching to reframe the immediate stressor.", isBurnout: false };
    if (s <= 4) return { type: "Smoldering (Early Burnout)", desc: "The warning lights are on. Your cynicism is a defense mechanism. If you push harder now, you will break.",     action: "You need boundaries. Use Preservation Mode to audit your energy leaks.", isBurnout: true };
    return            { type: "Inferno (Full Burnout)",       desc: "Your battery isn't just empty — it's damaged. You cannot mindset your way out of this. You need physiological safety.", action: "Emergency Brake. Stop. Use Preservation Mode to find one safe harbor.", isBurnout: true };
  };

  const resultData = getResult(score);

  if (showResult) {
    return (
      <div className="h-full flex flex-col justify-center animate-enter px-6 overflow-y-auto hide-scrollbar">
        <div className="flex-1 flex flex-col justify-center items-center text-center py-10">
          <div className={`mb-6 p-6 rounded-full border ${resultData.isBurnout ? 'bg-orange-900/30 border-orange-500/50' : 'bg-teal-900/30 border-teal-500/50'}`}>
            {resultData.isBurnout ? <Thermometer size={48} className="text-orange-400" /> : <Activity size={48} className="text-teal-400" />}
          </div>
          <p className="font-sans text-[10px] uppercase tracking-widest opacity-60 mb-2">Diagnostic Result</p>
          <h2 className="font-serif text-3xl text-white italic mb-4">{resultData.type}</h2>
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 w-full">
            <div className="flex items-center justify-center gap-2 mb-2"><Sparkles size={12} className="text-teal-400" /><span className="text-[9px] uppercase tracking-widest text-teal-400">Energy Shift Recommendation</span></div>
            <p className="font-serif text-sm italic text-white/90">{loading ? "Analyzing Energy Pattern..." : `"${aiInsight}"`}</p>
          </div>
          <p className="font-sans text-sm text-white/70 leading-relaxed mb-8 max-w-xs">{resultData.desc}</p>
          <button onClick={() => { setBurnoutPath(resultData.isBurnout); setView(resultData.isBurnout ? 'preservation' : 'dashboard'); }} className={`w-full py-4 rounded-full font-sans text-xs font-bold tracking-widest uppercase transition-all ${resultData.isBurnout ? 'bg-orange-500 text-slate-900 hover:bg-orange-400' : 'bg-teal-500 text-slate-900 hover:bg-teal-400'}`}>
            Begin Protocol
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Nav title="Vitality Scan" subtitle={`Question ${step + 1} / 6`} onBack={handleBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={((step + 1) / 6) * 100} />
      <div className="flex-1 flex flex-col justify-start items-center text-center overflow-y-auto hide-scrollbar pb-8 animate-enter px-6 pt-8">
        <h3 className="font-serif text-2xl text-white italic mb-2 shrink-0">{questions[step].q}</h3>
        <p className="font-sans text-sm text-white/70 leading-relaxed mb-8 max-w-xs shrink-0">{questions[step].text}</p>
        <div className="w-full space-y-4 shrink-0">
          <button onClick={() => confirmAnswer(1)} className="w-full py-5 rounded-xl border border-orange-500/50 bg-orange-500/20 text-orange-200 font-sans text-xs tracking-widest uppercase transition-all hover:bg-orange-500/30">Yes, frequently</button>
          <button onClick={() => confirmAnswer(0)} className="w-full py-5 rounded-xl border border-teal-500/50 bg-teal-500/20 text-teal-200 font-sans text-xs tracking-widest uppercase transition-all hover:bg-teal-500/30">No, rarely</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ENERGY ANALYZER
// ─────────────────────────────────────────────
const EnergyAnalyzer: React.FC<EnergyAnalyzerProps> = ({ setView, onBack }) => {
  const [step, setStep]       = useState(0);
  const [score, setScore]     = useState(0);
  const [result, setResult]   = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const questions = [
    { q: "Reaction to Challenge", options: [{ text: "I feel like a victim. Why me?", val: 1 }, { text: "I have to fight to win.", val: 2 }, { text: "I look for the opportunity.", val: 5 }] },
    { q: "Inner Monologue",       options: [{ text: "I'm not good enough.", val: 1 }, { text: "I'm better than them.", val: 2 }, { text: "I'm curious about this.", val: 5 }] },
    { q: "Motivation Source",     options: [{ text: "I have to do this (Fear).", val: 1 }, { text: "I need to prove myself (Ego).", val: 2 }, { text: "I want to create this (Purpose).", val: 6 }] },
    { q: "View of Others",        options: [{ text: "They just don't get it.", val: 2 }, { text: "They are doing their best.", val: 4 }, { text: "We are partners in this.", val: 6 }] },
    { q: "Energy at 3 PM",        options: [{ text: "Completely drained / Foggy.", val: 1 }, { text: "Wired / Anxious / Tense.", val: 2 }, { text: "Steady / Calm.", val: 5 }] },
    { q: "Goal Driver",           options: [{ text: "Avoiding failure.", val: 1 }, { text: "Beating the competition.", val: 2 }, { text: "Expressing my potential.", val: 6 }] },
  ];

  const confirmAnswer = () => {
    if (selected === null) return;
    const newScore = score + selected;
    setScore(newScore);
    setSelected(null);
    if (step < questions.length - 1) setStep(step + 1);
    else setResult(Math.round(newScore / questions.length));
  };

  const getResultText = (level: number) => {
    const levels: Record<number, any> = {
      1: { title: "Level 1: The Victim",       type: "Catabolic",  desc: "Core Thought: 'I lose.' You feel at the effect of the situation.", shift: "Where do I actually have a choice right now?",              recommendation: "Re-engage agency." },
      2: { title: "Level 2: The Fighter",      type: "Catabolic",  desc: "Core Thought: 'I win, you lose.' High energy, but fueled by conflict.", shift: "How can I win without making anyone else wrong?",       recommendation: "Shift from conflict to construction." },
      3: { title: "Level 3: The Rationalizer", type: "Anabolic",   desc: "Core Thought: 'I win.' You are coping well, but may be tolerating things.", shift: "What is the emotion I am explaining away?",        recommendation: "Move from coping to feeling." },
      4: { title: "Level 4: The Caregiver",    type: "Anabolic",   desc: "Core Thought: 'You win.' Driven by compassion and service.", shift: "If I said No to them, what would I be saying Yes to for myself?", recommendation: "Balance service with self-preservation." },
      5: { title: "Level 5: The Opportunist",  type: "Anabolic",   desc: "Core Thought: 'We both win.' You see problems as opportunities.", shift: "What is the gift in this challenge?",                     recommendation: "Lock in this perspective." },
      6: { title: "Level 6: The Visionary",    type: "Anabolic",   desc: "Core Thought: 'Everyone wins.' Connected to intuition and purpose.", shift: "What does my intuition know that my logic hasn't caught up to?", recommendation: "Create from this space." },
    };
    return levels[level] || levels[3];
  };

  if (result) {
    const data = getResultText(result);
    const isCatabolic = data.type === "Catabolic";
    return (
      <div className="h-full flex flex-col justify-center animate-enter text-center px-4 overflow-y-auto hide-scrollbar">
        <div className="py-10">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] border-2 ${isCatabolic ? 'bg-red-500/20 border-red-500' : 'bg-teal-500/20 border-teal-500'}`}>
            {isCatabolic ? <AlertTriangle size={40} className="text-red-400" /> : <Zap size={40} className="text-teal-400" />}
          </div>
          <p className="font-sans text-[10px] uppercase tracking-widest opacity-60 mb-2">Conscious Growth Energy Profile</p>
          <h2 className="font-serif text-3xl text-white italic mb-2">{data.title}</h2>
          <div className="flex items-center justify-center gap-2 mb-6"><p className="font-sans text-xs text-white/50 uppercase tracking-widest border border-white/10 inline-block px-3 py-1 rounded-full">{data.type} Energy</p></div>
          <p className="font-sans text-sm text-white/70 mb-10 leading-relaxed max-w-xs mx-auto">{data.desc}</p>
          <div className="bg-white/5 rounded-xl p-6 mb-8 text-left border border-white/10">
            <h4 className="font-serif text-white italic mb-2 text-sm flex items-center justify-center gap-2"><Info size={14} /> Shift Tactic</h4>
            <p className="font-sans text-[10px] uppercase tracking-widest text-white/50 mb-4 text-center">{data.recommendation}</p>
            <p className="font-serif text-lg text-teal-200 italic text-center">"{data.shift}"</p>
          </div>
          <button onClick={() => setView('dashboard')} className="mt-6 text-xs text-white/30 hover:text-white uppercase tracking-widest">Return to Horizon</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center animate-enter">
      <Nav title="Energy Lens" subtitle={`Question ${step + 1} / 6`} onBack={onBack} soundEnabled={false} toggleSound={() => {}} progress={((step + 1) / 6) * 100} />
      <div className="flex-1 flex flex-col justify-start items-center text-center overflow-y-auto hide-scrollbar pb-8 animate-enter px-2 pt-8">
        <h2 className="font-serif text-2xl text-white italic mb-8 text-center px-4">{questions[step].q}</h2>
        <div className="grid gap-3 w-full shrink-0">
          {questions[step].options.map((opt, i) => (
            <button key={i} onClick={() => setSelected(opt.val)} className={`p-5 rounded-2xl border text-left transition-all font-sans text-sm ${selected === opt.val ? 'bg-indigo-500/20 border-indigo-400 text-indigo-100' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}>{opt.text}</button>
          ))}
        </div>
        <button onClick={confirmAnswer} disabled={selected === null} className="w-full mt-8 py-4 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-0 disabled:translate-y-2 shrink-0">Next</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// VIEW MAP (replaces the 15-screen if/else chain)
// ─────────────────────────────────────────────
const VIEW_NAMES = [
  'welcome','manifesto','profile','dashboard','energy_reflection','preservation',
  'burnout_check','fork_entry','diffuser','somatic','partswork','laser','lens',
  'fork','regulate','alchemy','integration','insight','energy',
] as const;

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
const App = () => {
  // ── Persisted state (localStorage) ──
  const [userName,       setUserNameState]  = useState(() => storageGet<string>(STORAGE_KEYS.USER_NAME, ''));
  const [sessionCount,   setSessionCount]   = useState(() => storageGet<number>(STORAGE_KEYS.SESSION_COUNT, 0));
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>(() => storageGet<SessionRecord[]>(STORAGE_KEYS.SESSION_HISTORY, []));

  const setUserName = (n: string) => { setUserNameState(n); storageSet(STORAGE_KEYS.USER_NAME, n); };

  // ── Ephemeral session state ──
  const [view,             setView]           = useState(userName ? 'dashboard' : 'welcome');
  const [bgState,          setBgState]        = useState('neutral');
  const [stressor,         setStressor]       = useState('');
  const [perception,       setPerception]     = useState('');
  const [fear,             setFear]           = useState('');
  const [stressLevel,      setStressLevel]    = useState(50);
  const [energyLevel,      setEnergyLevel]    = useState(50);
  const [postStressLevel,  setPostStressLevel] = useState(50);
  const [postEnergyLevel,  setPostEnergyLevel] = useState(50);
  const [isBurnoutPath,    setIsBurnoutPath]  = useState(false);
  const [somaticZones,     setSomaticZones]   = useState<string[]>([]);
  const [partsStep,        setPartsStep]      = useState('experience');
  const [sensation,        setSensation]      = useState('');
  const [protection,       setProtection]     = useState('');
  const [expandingBelief,  setExpandingBelief] = useState('');
  const [pressure,         setPressure]       = useState(50);
  const [ability,          setAbility]        = useState(50);
  const [goal,             setGoal]           = useState<Goal>({ what: '', measure: '', when: '', outcome: '', action: '' });
  const [goalStep,         setGoalStep]       = useState(0);
  const [isLocked,         setIsLocked]       = useState(false);
  const [breathing,        setBreathing]      = useState(false);
  const [breathCount,      setBreathCount]    = useState(0);
  const [soundEnabled,     setSoundEnabled]   = useState(false);
  const [soundType,        setSoundType]      = useState<'drone' | 'brown'>('drone');
  const [energyAnalysis,   setEnergyAnalysis] = useState<EnergyAnalysis | null>(null);
  const [alchemyType,      setAlchemyType]    = useState('perform');

  useEffect(() => {
    if (view === 'preservation') setBgState('preservation');
    else if (view === 'laser')   setBgState('laser');
    else if (view === 'regulate') setBgState('flow');
    else                          setBgState('neutral');
  }, [view]);

  useEffect(() => { if (soundEnabled) soundEngine.play(soundType); }, [soundType]);

  const toggleSound = () => {
    if (soundEnabled) { soundEngine.stop(); setSoundEnabled(false); }
    else              { soundEngine.play(soundType); setSoundEnabled(true); }
  };

  const saveSession = (record: SessionRecord) => {
    const updated = appendSession(record);
    setSessionHistory(updated);
    const newCount = sessionCount + 1;
    setSessionCount(newCount);
    storageSet(STORAGE_KEYS.SESSION_COUNT, newCount);
  };

  const completeSession = () => {}; // session saving now handled by saveSession

  const resetApp = () => {
    setView('welcome');
    setStressor(''); setPerception(''); setSomaticZones([]);
    setIsLocked(false); setIsBurnoutPath(false);
    setPartsStep('experience'); setSensation(''); setProtection('');
    setExpandingBelief(''); setFear('');
    setGoal({ what: '', measure: '', when: '', outcome: '', action: '' });
    setGoalStep(0);
  };

  // ── Shared props ──
  const common: CommonProps = { setView, toggleSound, soundEnabled };

  return (
    <>
      <FontStyles />
      <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden flex justify-center">
        <Atmosphere bgState={bgState} />
        <div className="w-full max-w-md h-full relative z-10 p-6">

          {view === 'welcome'           && <Welcome onEnter={() => setView('manifesto')} />}
          {view === 'manifesto'         && <Manifesto onContinue={() => setView('profile')} onBack={() => setView('welcome')} />}
          {view === 'profile'           && <Identity userName={userName} setUserName={setUserName} onComplete={() => setView('dashboard')} onBack={() => setView('manifesto')} />}

          {view === 'dashboard'         && (
            <Horizon
              {...common}
              userName={userName} sessionCount={sessionCount}
              stressor={stressor} setStressor={setStressor}
              perception={perception} setPerception={setPerception}
              stressLevel={stressLevel} setStressLevel={setStressLevel}
              energyLevel={energyLevel} setEnergyLevel={setEnergyLevel}
              isBurnout={isBurnoutPath} resetApp={resetApp}
              setEnergyAnalysis={setEnergyAnalysis}
              soundType={soundType} setSoundType={setSoundType}
              sessionHistory={sessionHistory}
              onBack={() => setView('profile')}
            />
          )}

          {view === 'energy_reflection' && <EnergyReflection {...common} energyAnalysis={energyAnalysis} onBack={() => setView('dashboard')} />}
          {view === 'fork_entry'        && <ForkEntry {...common} onBack={() => setView('dashboard')} />}
          {view === 'diffuser'          && <Diffuser {...common} fear={fear} setFear={setFear} onBack={() => setView('fork_entry')} />}
          {view === 'somatic'           && <Vessel {...common} somaticZones={somaticZones} setSomaticZones={setSomaticZones} onBack={() => setView('dashboard')} />}

          {view === 'partswork'         && (
            <PartsWork {...common}
              selectedPart={somaticZones[0] || 'Part'}
              sensation={sensation} setSensation={setSensation}
              protection={protection} setProtection={setProtection}
              fear={fear} setFear={setFear}
              expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief}
              partsStep={partsStep} setPartsStep={setPartsStep}
              onBack={() => setView('somatic')}
            />
          )}

          {view === 'laser'             && (
            <LaserCoaching {...common}
              stressor={stressor} perception={perception} somatic={somaticZones[0] || 'Body'}
              setGoal={setGoal} setExpandingBelief={setExpandingBelief}
              energyLevel={energyLevel} stressLevel={stressLevel}
              onBack={() => setView('dashboard')}
            />
          )}

          {view === 'lens'              && <Perspective {...common} pressure={pressure} setPressure={setPressure} ability={ability} setAbility={setAbility} onBack={() => setView('dashboard')} />}
          {view === 'fork'              && <Crossroads {...common} stressLevel={stressLevel} energyLevel={energyLevel} onBack={() => setView('lens')} />}

          {view === 'regulate'          && (
            <Breath {...common}
              breathing={breathing} setBreathing={setBreathing}
              breathCount={breathCount} setBreathCount={setBreathCount}
              onBack={() => setView('fork')}
            />
          )}

          {view === 'insight'           && <Insight {...common} expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief} onBack={() => setView('regulate')} />}
          {view === 'alchemy'           && <Alchemy {...common} setAlchemyType={setAlchemyType} onBack={() => setView('fork')} />}

          {view === 'integration'       && (
            <Integration {...common}
              goal={goal} setGoal={setGoal} goalStep={goalStep} setGoalStep={setGoalStep}
              isLocked={isLocked} setIsLocked={setIsLocked}
              expandingBelief={expandingBelief} stressor={stressor} fear={fear}
              sessionCount={sessionCount} completeSession={completeSession}
              resetApp={resetApp} somaticZones={somaticZones}
              isBurnoutPath={isBurnoutPath} userName={userName}
              energyAnalysis={energyAnalysis}
              stressLevel={stressLevel} energyLevel={energyLevel}
              postStressLevel={postStressLevel} setPostStressLevel={setPostStressLevel}
              postEnergyLevel={postEnergyLevel} setPostEnergyLevel={setPostEnergyLevel}
              saveSession={saveSession}
              onBack={() => setView('alchemy')}
            />
          )}

          {view === 'preservation'      && (
            <Preservation {...common}
              setGoal={setGoal} setExpandingBelief={setExpandingBelief}
              setViewToIntegration={() => { setIsLocked(true); setView('integration'); }}
              onBack={() => setView('dashboard')}
            />
          )}

          {view === 'burnout_check'     && <VitalityScan {...common} setBurnoutPath={setIsBurnoutPath} onBack={() => setView('dashboard')} />}
          {view === 'energy'            && <EnergyAnalyzer setView={setView} onBack={() => setView('dashboard')} />}

        </div>
      </div>
    </>
  );
};

export default App;
