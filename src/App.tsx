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
  Split, Compass, Music, ArrowUp, TrendingDown, Share2, Phone
} from 'lucide-react';
import {
  analyzeCurrentEnergy,
  generateHorizonQuestion,
  generateHorizonValidation,
  generatePatternInsight,
  getSomaticEcho,
  generateCoachingQuestions,
  generateEnergyInsight,
  generateManifesto,
} from './lib/adaptivAI';


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
interface ChatMessage { role: 'user' | 'ai'; text: any; isHtml: boolean; }


// ── Session Record stored in localStorage ──
interface SessionRecord {
  date: string;
  stressor: string;
  preStress: number;
  postStress: number;
  preEnergy: number;
  postEnergy: number;
  coreFear: string;
  expandingBelief: string;
  commitment: string;
  energyLevel: number;
}


// ── FIX 9: Horizon conversation state lives in App so it survives navigation ──
interface HorizonState {
  step: 'intake' | 'chat' | 'routing';
  chatHistory: ChatMessage[];
  aiQuestionCount: number;
  showChatInput: boolean;
  showRouteButton: boolean;
  burnoutIntercept: boolean;
  pickingZone: boolean;
  patternInsight: string;
  patternLoaded: boolean;
}
const INITIAL_HORIZON: HorizonState = {
  step: 'intake',
  chatHistory: [],
  aiQuestionCount: 0,
  showChatInput: true,
  showRouteButton: false,
  burnoutIntercept: false,
  pickingZone: false,
  patternInsight: '',
  patternLoaded: false,
};
type HorizonPatch = Partial<HorizonState> | ((h: HorizonState) => Partial<HorizonState>);


interface CommonProps {
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
  onBack?: () => void;
  raiseCrisis: (message: string) => void;
}
interface EnergyReflectionProps extends CommonProps { energyAnalysis: EnergyAnalysis | null; frictionSource: string; }
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
  setFrictionSource: (s: string) => void;
  setSomaticZones: (zones: string[]) => void;
  hasCompletedFreeCycle: boolean;
  horizon: HorizonState;
  patchHorizon: (p: HorizonPatch) => void;
}
interface DiffuserProps extends CommonProps {
  fear: string;
  setFear: (s: string) => void;
  setDistortionType: (t: 'fact' | 'assumption') => void;
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
  needed: string;
  setNeeded: (s: string) => void;
  resourceMemory: string;
  setResourceMemory: (s: string) => void;
}
interface LaserCoachingProps extends CommonProps {
  stressor: string;
  perception: string;
  somatic: string;
  fear: string;
  distortionType: 'fact' | 'assumption' | null;
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
  saveSession: (record: SessionRecord) => void;
  updateLatestSession: (patch: Partial<SessionRecord>) => void;
  setHasCompletedFreeCycle: (b: boolean) => void;
  goHome: () => void;
}
interface PreservationProps extends CommonProps {
  setGoal: (g: any) => void;
  setExpandingBelief: (s: string) => void;
  setViewToIntegration: () => void;
}
interface VitalityScanProps extends CommonProps { setBurnoutPath: (b: boolean) => void; }
interface EnergyAnalyzerProps { setView: (view: string) => void; onBack?: () => void; }


// ─────────────────────────────────────────────
// STORAGE HELPERS (localStorage)
// ─────────────────────────────────────────────
const STORAGE_KEYS = {
  USER_NAME: 'adaptiv_userName',
  SESSION_COUNT: 'adaptiv_sessionCount',
  SESSION_HISTORY: 'adaptiv_sessionHistory',
  FREE_CYCLE: 'la_adaptiv_free_cycle_done',
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


function appendSession(record: SessionRecord): SessionRecord[] {
  const history = storageGet<SessionRecord[]>(STORAGE_KEYS.SESSION_HISTORY, []);
  const updated = [record, ...history].slice(0, 10);
  storageSet(STORAGE_KEYS.SESSION_HISTORY, updated);
  return updated;
}


// ─────────────────────────────────────────────
// SANITIZE
// ─────────────────────────────────────────────
function sanitizeHtml(dirty: string): string {
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
// 2. AI SERVICE
// ─────────────────────────────────────────────
// All prompts and the Gemini call now live server-side, one narrow
// endpoint per task. The old client-side callAI() and the open
// /api/ai proxy are gone.

const formatGoalOutcome = (text: string) => {
  if (!text) return "";
  let clean = text.trim().replace(
    /^(My goal is to|My goal is|I would like to|I would|I want to|I will|I am going to|I'd like to)\s+/i, ""
  );
  if (/^To\s/i.test(clean)) return clean;
  clean = clean.charAt(0).toLowerCase() + clean.slice(1);
  return "To " + clean;
};

// ─────────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────────
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@200;300;400;500;700&display=swap');
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans { font-family: 'Inter', sans-serif; }
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
    .hide-scrollbar { -ms-overflow-style:none; scrollbar-width:none; -webkit-overflow-scrolling:touch; overscroll-behavior-y:contain; }

    .glow-pulse { animation: glowPulse 3s infinite; }
    @keyframes glowPulse { 0%{box-shadow:0 0 0 0 rgba(20,184,166,0.4);border-color:rgba(20,184,166,0.6)} 50%{box-shadow:0 0 20px 0 rgba(20,184,166,0.2);border-color:rgba(20,184,166,1)} 100%{box-shadow:0 0 0 0 rgba(20,184,166,0.4);border-color:rgba(20,184,166,0.6)} }

    input[type=range] { -webkit-appearance:none; width:100%; background:transparent; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; height:26px; width:26px; border-radius:50%; background:#14b8a6; cursor:pointer; margin-top:-11px; box-shadow:0 0 10px rgba(20,184,166,0.5); }
    input[type=range]::-webkit-slider-runnable-track { width:100%; height:4px; cursor:pointer; background:rgba(255,255,255,0.2); border-radius:2px; }
    input[type=range]::-moz-range-thumb { height:26px; width:26px; border:none; border-radius:50%; background:#14b8a6; }
    input[type=range]::-moz-range-track { height:4px; background:rgba(255,255,255,0.2); border-radius:2px; }
    input[type=range]:focus { outline:none; }
    input[type=range].slider-amber::-webkit-slider-thumb { background:#f59e0b; box-shadow:0 0 10px rgba(245,158,11,0.5); }
    input[type=range].slider-amber::-moz-range-thumb { background:#f59e0b; }
    input[type=range].slider-indigo::-webkit-slider-thumb { background:#6366f1; box-shadow:0 0 10px rgba(99,102,241,0.5); }
    input[type=range].slider-indigo::-moz-range-thumb { background:#6366f1; }

    .slide-up-fade { animation: slideUpFade 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes slideUpFade { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(20,184,166,0.9); color:#0f172a; padding:10px 20px; border-radius:100px; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; animation: toastIn 0.3s ease, toastOut 0.3s ease 2s forwards; z-index:9999; }
    @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    @keyframes toastOut { from{opacity:1} to{opacity:0} }

    :focus-visible { outline:2px solid rgba(45,212,191,0.8); outline-offset:2px; }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; }
    }
  `}</style>
);


// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
const Toast: React.FC<{ message: string; onDone: () => void }> = ({ message, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return <div className="toast">{message}</div>;
};


// ─────────────────────────────────────────────
// FIX 2 + 3: FLOW INPUT
// Auto-growing field. Wraps instead of scrolling sideways, grows past two
// lines instead of hiding text, 18px so iOS does not zoom the viewport.
// ─────────────────────────────────────────────
const FlowInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
  accent?: 'teal' | 'indigo' | 'white';
  className?: string;
}> = ({ value, onChange, placeholder, onSubmit, autoFocus = false, accent = 'white', className = '' }) => {
  const ref = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);


  const border =
    accent === 'teal' ? 'focus:border-teal-400/70'
    : accent === 'indigo' ? 'focus:border-indigo-400/70'
    : 'focus:border-white/50';


  return (
    <textarea
      ref={ref}
      rows={2}
      value={value}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit?.(); }
      }}
      className={`w-full bg-white/5 border border-white/10 ${border} rounded-2xl px-4 py-3 text-white text-lg font-serif italic leading-relaxed text-left placeholder:text-white/25 outline-none resize-none overflow-hidden transition-colors ${className}`}
    />
  );
};


// ─────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────
const Nav: React.FC<NavProps> = ({ title, subtitle, onBack, isDashboard, soundEnabled, toggleSound, resetApp, progress, aiActive }) => (
  <div className="w-full flex flex-col mb-4 pt-1 animate-enter shrink-0 relative z-50">
    <div className="flex justify-between items-start gap-2">
      <div className="min-w-0 flex-1">
        <h2 className="font-sans text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-1 truncate">{subtitle}</h2>
        <div className="flex items-center gap-2 min-w-0">
          {!isDashboard && <Activity size={18} className="text-white/80 shrink-0" />}
          <h1 className="font-serif text-2xl sm:text-3xl text-white/90 italic leading-tight break-words">{title}</h1>
        </div>
      </div>
      <div className="flex gap-1.5 items-center shrink-0">
        {aiActive && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full border bg-teal-500/10 border-teal-500/20 text-teal-400 animate-pulse">
            <Sparkles size={10} /><span className="text-[9px] font-bold uppercase tracking-wider">AI</span>
          </div>
        )}
        {!isDashboard && (
          <button aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'} onClick={toggleSound} className={`p-2 rounded-full glass-button transition-all ${soundEnabled ? 'text-teal-200 bg-teal-500/10' : 'text-white/40'}`}>
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        )}
        {isDashboard && resetApp && (
          <button aria-label="Reset identity" onClick={resetApp} className="p-2 rounded-full glass-button text-white/40 hover:text-white hover:bg-white/20 transition-all" title="Reset Identity">
            <LogOut size={18} />
          </button>
        )}
        {onBack && (
          <button aria-label="Go back" onClick={onBack} className="p-2 rounded-full glass-button text-white/80 hover:text-white hover:bg-white/20 transition-all">
            <ChevronLeft size={18} />
          </button>
        )}
      </div>
    </div>
    {progress !== undefined && progress > 0 ? (
      <div className="w-full h-[2px] bg-white/5 mt-3 rounded-full overflow-hidden">
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
    neutral: "from-[#0f172a] via-[#1e1b4b] to-[#0f172a]",
    friction: "from-[#2a0a12] via-[#1a0505] to-[#2a0a12]",
    flow: "from-[#042f2e] via-[#022c22] to-[#042f2e]",
    preservation: "from-[#1c1917] via-[#292524] to-[#0c0a09]",
    laser: "from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]",
  };
  return (
    <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-[3000ms] ${themes[bgState] || themes.neutral}`}>
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  );
};


// ─────────────────────────────────────────────
// CRISIS
// ─────────────────────────────────────────────
// Reached when any endpoint returns { crisis: true }. Deliberately
// bare: no decree, no level readout, no protocol recommendation, no
// upsell, no share. Nothing here should feel like a product.
const Crisis: React.FC<{ message: string; onBack: () => void }> = ({ message, onBack }) => (
  <div className="h-full flex flex-col">
    <div className="shrink-0 pt-1 pb-2">
      <button aria-label="Go back" onClick={onBack} className="p-2 rounded-full glass-button text-white/70 hover:text-white transition-colors">
        <ChevronLeft size={18} />
      </button>
    </div>

    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pb-8 animate-enter">
      <div className="flex flex-col items-center text-center pt-6">
        <div className="mb-6 p-5 rounded-full bg-white/5 border border-white/10">
          <Heart size={32} className="text-rose-300" strokeWidth={1.4} />
        </div>
        <h2 className="font-serif text-3xl text-white italic mb-5">Let's pause here.</h2>
        <p className="font-sans text-base text-white/80 leading-relaxed max-w-sm mb-8">
          {message}
        </p>
      </div>

      <div className="space-y-3">
        <a href="tel:988" className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/15 hover:border-white/30 transition-colors">
          <Phone size={18} className="text-teal-300 shrink-0" />
          <span className="text-left">
            <span className="block text-white font-bold text-sm">Call or text 988</span>
            <span className="block text-white/50 text-xs mt-0.5">Suicide &amp; Crisis Lifeline — US, 24/7</span>
          </span>
        </a>
        <a href="sms:741741&body=HOME" className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/15 hover:border-white/30 transition-colors">
          <MessageCircle size={18} className="text-teal-300 shrink-0" />
          <span className="text-left">
            <span className="block text-white font-bold text-sm">Text HOME to 741741</span>
            <span className="block text-white/50 text-xs mt-0.5">Crisis Text Line — US, 24/7</span>
          </span>
        </a>
        <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/15 hover:border-white/30 transition-colors">
          <ExternalLink size={18} className="text-teal-300 shrink-0" />
          <span className="text-left">
            <span className="block text-white font-bold text-sm">findahelpline.com</span>
            <span className="block text-white/50 text-xs mt-0.5">Local services outside the US</span>
          </span>
        </a>
      </div>

      <p className="text-center text-[11px] text-white/35 leading-relaxed mt-8 max-w-xs mx-auto">
        Adaptiv is a self-guided reflection tool. It is not therapy, and it is
        not a substitute for talking to a person.
      </p>

      <button onClick={onBack} className="w-full mt-8 py-4 rounded-full border border-white/15 text-white/60 font-sans text-xs tracking-widest uppercase hover:text-white hover:bg-white/5 transition-all">
        Go back
      </button>
    </div>
  </div>
);


// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────
const Welcome: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <div className="h-full flex flex-col justify-center items-center text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <div className="min-h-full flex flex-col justify-center items-center py-10">
      <div className="flex-1" />
      <div className="flex flex-col items-center">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full" />
          <Activity size={64} className="text-teal-200/80 relative z-10 animate-breathe" strokeWidth={0.8} />
        </div>
        <h1 className="font-serif text-5xl text-white italic tracking-wide leading-tight animate-enter">Adaptiv</h1>
        <p className="font-sans text-xs text-white/60 uppercase tracking-[0.3em] animate-enter mt-4">Alchemy for the Soul</p>
        <button onClick={onEnter} className="mt-12 px-8 py-4 rounded-full bg-white/10 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/20 hover:scale-105 transition-all animate-enter border border-white/5">
          Enter the Space
        </button>
      </div>
      <div className="flex-1" />
      <div className="mt-8 flex flex-col items-center opacity-70 shrink-0">
        <p className="font-sans text-[9px] text-white/40 uppercase tracking-widest mb-2">Powered By</p>
        <p className="font-serif italic text-white/80 text-sm">LiveAdaptiv</p>
      </div>
    </div>
  </div>
);


const Manifesto: React.FC<{ onContinue: () => void; onBack: () => void }> = ({ onContinue, onBack }) => (
  <div className="h-full flex flex-col justify-center animate-enter overflow-y-auto hide-scrollbar text-center relative">
    <button aria-label="Go back" onClick={onBack} className="absolute top-1 left-0 p-3 rounded-full text-white/50 hover:text-white transition-colors z-50"><ChevronLeft size={24} /></button>
    <div className="max-w-md mx-auto py-12">
      <div className="mb-10">
        <Waves size={48} className="text-teal-400/80 mx-auto mb-6 animate-pulse" strokeWidth={0.8} />
        <h1 className="font-serif text-3xl text-white italic mb-3">Alchemy.</h1>
        <p className="font-sans text-[11px] text-white/50 uppercase tracking-[0.2em] leading-relaxed">A Kinetic Shift for the Modern Mind</p>
      </div>
      <div className="space-y-8 font-serif text-xl text-white/80 leading-relaxed">
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
  <div className="h-full flex flex-col text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <button aria-label="Go back" onClick={onBack} className="absolute top-1 left-0 p-3 rounded-full text-white/50 hover:text-white transition-colors z-50"><ChevronLeft size={24} /></button>
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
            className="w-full bg-transparent border-b border-white/20 py-3 text-center text-white text-xl font-serif placeholder:text-white/25 focus:outline-none focus:border-white/60 transition-colors"
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


const EnergyReflection: React.FC<EnergyReflectionProps> = ({ energyAnalysis, frictionSource, setView, toggleSound, soundEnabled, onBack }) => (
  <div className="h-full flex flex-col animate-enter">
    <Nav title="Current Resonance" subtitle="The Lens" isDashboard={false} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={5} onBack={onBack} />
    <div className="flex-1 min-h-0 flex flex-col justify-center items-center text-center pb-8 overflow-y-auto hide-scrollbar">
      <div className="mb-8 p-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 shrink-0">
        <Compass size={48} className="text-indigo-300" />
      </div>
      <h3 className="font-serif text-2xl text-white italic mb-6">"Here is what I sense..."</h3>
      <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 mb-8 max-w-sm">
        <p className="font-serif text-xl text-white/90 italic leading-relaxed">"{energyAnalysis?.reflection || "Connecting to your field..."}"</p>
      </div>
      <p className="font-sans text-sm text-white/50 max-w-xs leading-relaxed mb-10">This is your current energetic baseline. We will now shift this frequency.</p>
      <button onClick={() => setView(frictionSource === 'mind' ? 'diffuser' : 'partswork')} className="w-full py-5 rounded-full bg-indigo-500 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-indigo-400 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all">
        Shift This Energy
      </button>
    </div>
  </div>
);


const Diffuser: React.FC<DiffuserProps> = ({ fear, setFear, setDistortionType, setView, toggleSound, soundEnabled, onBack }) => {
  const [step, setStep] = useState(0);
  const chooseDistortion = (t: 'fact' | 'assumption') => { setDistortionType(t); setView('laser'); };
  return (
    <div className="h-full flex flex-col">
      <Nav title="The Filter" subtitle="Fact vs. Fiction" onBack={() => step > 0 ? setStep(0) : onBack?.()} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={25} />
      <div className="flex-1 min-h-0 flex flex-col justify-center animate-enter overflow-y-auto hide-scrollbar pb-8">
        {step === 0 ? (
          <>
            <h3 className="font-serif text-2xl text-white italic mb-6 text-center">"What is the loudest loop?"</h3>
            <FlowInput
              value={fear}
              onChange={setFear}
              placeholder="I keep thinking about..."
              onSubmit={() => fear && setStep(1)}
              accent="indigo"
              className="mb-8"
            />
            <button onClick={() => setStep(1)} disabled={!fear} className="w-full py-4 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-sans text-xs tracking-widest uppercase hover:bg-indigo-500/30 transition-all disabled:opacity-40">Capture Thought</button>
          </>
        ) : (
          <div className="text-center">
            <Split size={48} className="text-indigo-300 mx-auto mb-6" />
            <h3 className="font-serif text-2xl text-white italic mb-4">The Filter</h3>
            <p className="text-base text-white/70 mb-8 leading-relaxed">Is this thought an absolute <strong>Fact</strong> (provable in court) or an <strong>Assumption</strong> (an interpretation)?</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => chooseDistortion('fact')} className="py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-[11px] uppercase tracking-widest">It's a Fact</button>
              <button onClick={() => chooseDistortion('assumption')} className="py-4 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/30 transition-all text-[11px] uppercase tracking-widest">It's an Assumption</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// HORIZON
// ─────────────────────────────────────────────
const Horizon: React.FC<HorizonProps> = ({
  userName, sessionCount, stressor, setStressor, perception, setPerception,
  setView, toggleSound, soundEnabled, resetApp, setEnergyAnalysis,
  soundType, setSoundType, onBack, sessionHistory,
  stressLevel, setStressLevel, energyLevel, setEnergyLevel, isBurnout,
  setFrictionSource, setSomaticZones, hasCompletedFreeCycle,
  horizon, patchHorizon, raiseCrisis
}) => {
  const { step, chatHistory, aiQuestionCount, showChatInput, showRouteButton, burnoutIntercept, pickingZone, patternInsight, patternLoaded } = horizon;
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingPattern, setLoadingPattern] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);


  const bodyZones: SomaticZone[] = [
    { id: 'Head', label: 'Head', icon: Brain }, { id: 'Eyes', label: 'Eyes', icon: Eye },
    { id: 'Throat', label: 'Throat', icon: MessageCircle }, { id: 'Chest', label: 'Chest', icon: Shield },
    { id: 'Solar', label: 'Solar Plexus', icon: Sun }, { id: 'Gut', label: 'Gut', icon: Disc },
    { id: 'Back', label: 'Back', icon: Anchor }, { id: 'Hands', label: 'Hands', icon: Hand },
  ];


  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isTyping, burnoutIntercept]);


  useEffect(() => {
    if (patternLoaded || sessionHistory.length < 2) return;
    setLoadingPattern(true);
    generatePatternInsight(sessionHistory).then(insight => {
      patchHorizon({ patternInsight: insight, patternLoaded: true });
      setLoadingPattern(false);
    });
  }, [patternLoaded, sessionHistory.length]);


  const handleFrictionSelect = (source: string) => {
    setFrictionSource(source);
    setView('energy_reflection');
    analyzeCurrentEnergy(stressor, perception, stressLevel, energyLevel, source)
      .then(res => {
        if (res.crisis) { raiseCrisis(res.crisisMessage!); return; }
        setEnergyAnalysis(res.data);
      });
  };


  const handleInternalBack = () => {
    if (step === 'routing' && pickingZone) patchHorizon({ pickingZone: false });
    else if (step === 'routing') patchHorizon({ step: 'chat' });
    else if (step === 'chat') patchHorizon({ step: 'intake' });
    else if (onBack) onBack();
  };


  const checkDepletion = (text: string) => {
    const triggers = ['burnout','exhausted','drained','empty','depleted','overwhelm','overwhelmed','done','tired'];
    return triggers.some(w => text.toLowerCase().includes(w));
  };


  const startAIConversation = async () => {
    if (stressor.length < 5 || perception.length < 5) return;
    if (hasCompletedFreeCycle) { setView('checkout'); return; }


    patchHorizon({
      step: 'chat', aiQuestionCount: 0, chatHistory: [],
      showChatInput: false, showRouteButton: false, burnoutIntercept: false, pickingZone: false,
    });


    if (checkDepletion(stressor) || checkDepletion(perception)) {
      setTimeout(() => {
        patchHorizon({
          chatHistory: [{ role: 'ai', text: sanitizeHtml(`<span class="block mb-2 font-bold text-orange-300">Pause: Deep Exhaustion Sensed</span><br/>I am hearing a lot of heavy exhaustion in what you just shared. When you are running on empty, trying to push through can drain you further. Would you like to take a quick Vitality Scan to check your reserves?`), isHtml: true }],
          burnoutIntercept: true,
        });
      }, 800);
      return;
    }


    setIsTyping(true);
    const firstQ = await generateHorizonQuestion(stressor, perception, "No history yet.", 1);
    setIsTyping(false);
    if (firstQ.crisis) { raiseCrisis(firstQ.crisisMessage!); return; }
    patchHorizon({ chatHistory: [{ role: 'ai', text: firstQ.data, isHtml: false }], showChatInput: true });
  };


  const sendUserMessage = async () => {
    if (!chatInput.trim()) return;
    const currentUserText = chatInput;
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: currentUserText, isHtml: false }];
    patchHorizon({ chatHistory: newHistory, showChatInput: false });
    setChatInput('');


    if (checkDepletion(currentUserText)) {
      setTimeout(() => {
        patchHorizon(h => ({
          chatHistory: [...h.chatHistory, { role: 'ai', text: sanitizeHtml(`<span class="block mb-2 font-bold text-orange-300">Pause: Deep Exhaustion Sensed</span><br/>It sounds like you are running on absolute empty. Before we try to solve this, we need to make sure you have the energy for it.`), isHtml: true }],
          burnoutIntercept: true,
        }));
      }, 800);
      return;
    }


    setIsTyping(true);
    const newCount = aiQuestionCount + 1;
    patchHorizon({ aiQuestionCount: newCount });
    const historyText = newHistory.map(m => `${m.role}: ${m.text}`).join(' | ');


    if (newCount < 3) {
      const nextQ = await generateHorizonQuestion(stressor, perception, historyText, newCount + 1);
      setIsTyping(false);
      if (nextQ.crisis) { raiseCrisis(nextQ.crisisMessage!); return; }
      patchHorizon(h => ({ chatHistory: [...h.chatHistory, { role: 'ai', text: nextQ.data, isHtml: false }], showChatInput: true }));
      return;
    }

    const validation = await generateHorizonValidation(stressor, perception, historyText);
    setIsTyping(false);
    if (validation.crisis) { raiseCrisis(validation.crisisMessage!); return; }
    patchHorizon(h => ({ chatHistory: [...h.chatHistory, { role: 'ai', text: validation.data, isHtml: true }] }));
    setTimeout(() => patchHorizon({ showRouteButton: true }), 1500);
  };


  const bypassBurnout = async () => {
    patchHorizon({ burnoutIntercept: false });
    setIsTyping(true);
    const historyText = chatHistory.map(m => `${m.role}: ${m.text}`).join(' | ');
    const nextQ = await generateHorizonQuestion(stressor, perception, historyText + " | User bypassed burnout scan, proceeding.", 1);
    setIsTyping(false);
    if (nextQ.crisis) { raiseCrisis(nextQ.crisisMessage!); return; }
    patchHorizon(h => ({ chatHistory: [...h.chatHistory, { role: 'ai', text: nextQ.data, isHtml: false }], showChatInput: true }));
  };


  return (
    <div className="h-full flex flex-col">
      <Nav
        title={`Hello, ${userName || 'Traveler'}`}
        subtitle={`Session ${sessionCount + 1}`}
        onBack={handleInternalBack} isDashboard={step === 'intake'}
        resetApp={resetApp} toggleSound={toggleSound} soundEnabled={soundEnabled}
        progress={step === 'intake' ? 10 : step === 'chat' ? 20 : 30}
      />
      <div className="flex-1 min-h-0 flex flex-col gap-5 overflow-y-auto hide-scrollbar animate-enter pb-10">


        {step === 'intake' && (
          <>
            <div className="glass-panel p-5 rounded-[24px] border-teal-500/20 relative">
              <div className="flex justify-between items-center mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-serif text-lg text-teal-100 italic truncate">7-Day Neural Reset</h3>
                  <HelpCircle size={12} className="text-teal-500/50 shrink-0" />
                </div>
                <span className="font-sans text-[10px] uppercase tracking-widest text-teal-400 bg-teal-900/30 px-2 py-1 rounded shrink-0">Day {(sessionCount % 7) + 1}</span>
              </div>
              <p className="text-[11px] text-teal-200/50 mb-4 leading-relaxed">Neuroplasticity requires repetition. Complete 7 cycles to rewire your baseline.</p>
              <div className="flex justify-between mb-1 relative z-10 px-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all text-[10px] font-bold ${i < (sessionCount % 7) ? 'bg-teal-500 text-slate-900 border-teal-400' : i === (sessionCount % 7) ? 'bg-teal-900/80 text-teal-400 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-110' : 'bg-white/5 border-white/10 text-white/25'}`}>
                    {i < (sessionCount % 7) ? <Check size={10} strokeWidth={3} /> : i + 1}
                  </div>
                ))}
                <div className="absolute top-3.5 left-3 right-3 h-[1px] bg-white/5 -z-10" />
              </div>
            </div>


            {sessionHistory.length >= 2 && (
              <div className="glass-panel p-5 rounded-[20px] border border-indigo-500/20 bg-indigo-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-indigo-400" />
                  <span className="font-sans text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Pattern Recognition</span>
                </div>
                {loadingPattern ? (
                  <div className="flex items-center gap-2 text-white/40 text-sm"><Loader2 size={12} className="animate-spin" /> Analyzing your history...</div>
                ) : (
                  <p className="font-serif text-base text-white/85 italic leading-relaxed">{patternInsight || "Connecting patterns..."}</p>
                )}
                {sessionHistory[0] && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest shrink-0">Last session</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] text-white/60 truncate">{sessionHistory[0].stressor.slice(0, 24)}{sessionHistory[0].stressor.length > 24 ? '…' : ''}</span>
                      <span className={`text-[11px] font-bold shrink-0 ${sessionHistory[0].postStress < sessionHistory[0].preStress ? 'text-teal-400' : 'text-rose-400'}`}>
                        {sessionHistory[0].preStress}→{sessionHistory[0].postStress}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}


            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 shadow-sm slide-up-fade">
              <h2 className="text-3xl font-serif italic text-white mb-2">The Horizon</h2>
              <p className="text-[11px] text-white/50 mb-8 uppercase tracking-widest font-bold">Current State Diagnostic</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-teal-400 mb-3">What is weighing on you?</label>
                  <textarea value={stressor} onChange={e => setStressor(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-base h-28 outline-none focus:border-teal-400 transition-all resize-none text-white font-serif italic leading-relaxed placeholder:text-white/25" placeholder="The team missed another deadline..." />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-teal-400 mb-3">How are you experiencing this?</label>
                  <textarea value={perception} onChange={e => setPerception(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-base h-28 outline-none focus:border-teal-400 transition-all resize-none text-white font-serif italic leading-relaxed placeholder:text-white/25" placeholder="I am exhausted and resentful..." />
                </div>
              </div>


              <div className="mt-8 pt-8 border-t border-white/10 space-y-7">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-2">Internal Weather Baseline</h3>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[11px] text-white/70 uppercase tracking-widest">Stress / Friction</label>
                    <span className="text-rose-400 font-serif text-2xl">{stressLevel}</span>
                  </div>
                  <input aria-label="Stress level" type="range" min={1} max={10} value={stressLevel} onChange={e => setStressLevel(parseInt(e.target.value))} className="w-full slider-amber" />
                </div>


                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[11px] text-white/70 uppercase tracking-widest">Available Energy</label>
                    <span className="text-teal-400 font-serif text-2xl">{energyLevel}</span>
                  </div>
                  <input aria-label="Energy level" type="range" min={1} max={10} value={energyLevel} onChange={e => setEnergyLevel(parseInt(e.target.value))} className="w-full slider-indigo" />
                </div>
              </div>


              {(stressor.length > 0 && stressor.length < 5) || (perception.length > 0 && perception.length < 5) ? (
                <p className="text-[11px] text-rose-400 uppercase tracking-widest mt-4">Add a bit more detail to both fields.</p>
              ) : null}


              {hasCompletedFreeCycle && (
                <p className="text-[11px] text-teal-300/70 mt-5 leading-relaxed">
                  Your first cycle is complete. Starting a new one opens the access options.
                </p>
              )}


              <button onClick={startAIConversation} disabled={stressor.length < 5 || perception.length < 5} className="w-full mt-8 py-4 bg-white text-slate-900 font-bold rounded-xl text-[11px] uppercase tracking-widest text-center shadow-lg hover:bg-teal-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Begin Calibration
              </button>
            </div>
          </>
        )}


        {step === 'chat' && (
          <div className="glass-panel p-5 rounded-[2rem] border border-white/10 shadow-sm flex flex-col h-[70vh] slide-up-fade">
            <div className="text-center mb-4 shrink-0">
              <h2 className="text-xl font-serif italic text-white">Kinetic Calibration</h2>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col mb-4 pr-1 pb-4 hide-scrollbar">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`slide-up-fade ${msg.role === 'ai' ? 'bg-white/10 border border-white/10 text-white rounded-[1rem_1rem_1rem_0] p-4 max-w-[92%] self-start mb-3 font-serif text-[1.15rem] leading-relaxed shadow-sm' : 'bg-teal-500/20 text-teal-100 border border-teal-500/30 rounded-[1rem_1rem_0_1rem] p-3 px-4 max-w-[88%] self-end mb-3 text-base'}`}>
                  {msg.isHtml ? (
                    typeof msg.text === 'string' ? <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} /> : (
                      <>
                        <span className="block mb-2 font-bold text-teal-300">{msg.text.acknowledgment}</span>
                        <span className="block mb-4 text-white/85 italic">{msg.text.validation}</span>
                        <span className="block font-bold text-white">{msg.text.pivot}</span>
                      </>
                    )
                  ) : msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="bg-white/10 border border-white/10 text-white rounded-[1rem_1rem_1rem_0] p-4 max-w-[92%] self-start mb-3 shadow-sm animate-pulse flex items-center gap-2">
                  <Loader2 className="animate-spin text-teal-400" size={16} />
                  <span className="text-sm opacity-60">Calibrating...</span>
                </div>
              )}
              {burnoutIntercept && (
                <div className="animate-enter flex flex-col gap-3 mt-4">
                  <button onClick={() => setView('burnout_check')} className="w-full py-4 bg-orange-500/20 border border-orange-500/50 text-orange-200 font-bold rounded-xl text-[11px] uppercase tracking-widest shadow-lg hover:bg-orange-500/30 transition-all flex flex-col items-center">
                    <span>Run Vitality Scan</span>
                    <span className="text-[9px] opacity-70 mt-1">(Recommended)</span>
                  </button>
                  <button onClick={bypassBurnout} className="w-full py-3 bg-transparent border border-white/10 text-white/60 font-bold rounded-xl text-[11px] uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all">
                    I have the energy to continue
                  </button>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {showChatInput && !burnoutIntercept && (
              <div className="mt-auto shrink-0 bg-white/5 p-2 rounded-2xl border border-white/10 flex items-center shadow-sm">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendUserMessage()} className="flex-1 min-w-0 bg-transparent border-none outline-none px-3 text-base text-white placeholder:text-white/40" placeholder="Type your response..." />
                <button aria-label="Send" onClick={sendUserMessage} className="w-11 h-11 shrink-0 bg-teal-500 rounded-xl flex items-center justify-center text-slate-900 hover:bg-teal-400 transition-colors"><ArrowUp size={20} /></button>
              </div>
            )}
            {showRouteButton && (
              <button onClick={() => patchHorizon({ step: 'routing' })} className="w-full mt-4 shrink-0 py-4 bg-teal-500 text-slate-900 font-bold rounded-xl text-[11px] uppercase tracking-widest text-center shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:bg-teal-400 transition-all slide-up-fade">
                Locate the Friction →
              </button>
            )}
          </div>
        )}


        {step === 'routing' && !pickingZone && (
          <div className="glass-panel p-6 rounded-[2rem] border border-white/10 shadow-sm text-center slide-up-fade">
            <Compass size={32} className="text-teal-400 mx-auto mb-4" />
            <h2 className="text-2xl font-serif italic text-white mb-2">Initiate Shift</h2>
            <p className="text-base text-white/60 mb-8">Where is this pressure residing right now?</p>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => patchHorizon({ pickingZone: true })} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-teal-500/50 transition-all group relative overflow-hidden text-left">
                <div className="absolute inset-0 bg-teal-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="flex items-center gap-3 mb-2">
                  <Activity size={20} className="text-white/40 group-hover:text-teal-400 transition-colors" />
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase group-hover:text-teal-400 transition-colors">My Body</h3>
                </div>
                <p className="text-sm text-white/55">Tension, shallow breathing, physical static.</p>
              </button>
              <button onClick={() => handleFrictionSelect('mind')} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-indigo-500/50 transition-all group relative overflow-hidden text-left">
                <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="flex items-center gap-3 mb-2">
                  <Brain size={20} className="text-white/40 group-hover:text-indigo-400 transition-colors" />
                  <h3 className="font-bold text-white text-sm tracking-wide uppercase group-hover:text-indigo-400 transition-colors">My Mind</h3>
                </div>
                <p className="text-sm text-white/55">Racing thoughts, looping narratives, cognitive fog.</p>
              </button>
            </div>
          </div>
        )}


        {step === 'routing' && pickingZone && (
          <div className="glass-panel p-6 rounded-[2rem] border border-white/10 shadow-sm text-center slide-up-fade">
            <Activity size={32} className="text-teal-400 mx-auto mb-4" />
            <h2 className="text-2xl font-serif italic text-white mb-2">Locate It</h2>
            <p className="text-base text-white/60 mb-8">Which part of the body is holding it?</p>
            <div className="grid grid-cols-2 gap-3">
              {bodyZones.map(z => {
                const Icon = z.icon;
                return (
                  <button key={z.id} onClick={() => { setSomaticZones([z.id]); handleFrictionSelect('body'); }} className="p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 hover:border-teal-500/50 hover:bg-white/10 transition-all">
                    <Icon size={24} className="text-white/50" />
                    <span className="font-serif italic text-white/90 text-base">{z.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// PARTS WORK
// ─────────────────────────────────────────────
const PartsWork: React.FC<PartsWorkProps> = ({ selectedPart, sensation, setSensation, protection, setProtection, fear, setFear, expandingBelief, setExpandingBelief, partsStep, setPartsStep, needed, setNeeded, resourceMemory, setResourceMemory, setView, toggleSound, soundEnabled, onBack }) => {
  const handleBack = () => {
    if (partsStep === 'experience') onBack?.();
    else if (partsStep === 'unblend') setPartsStep('experience');
    else if (partsStep === 'connect') setPartsStep('unblend');
    else if (partsStep === 'message') setPartsStep('connect');
    else if (partsStep === 'appreciate') setPartsStep('message');
    else if (partsStep === 'resource') setPartsStep('appreciate');
    else if (partsStep === 'channel') setPartsStep('resource');
  };

  const PARTS_ORDER = ['experience','unblend','connect','message','appreciate','resource','channel'];
  const partsProgress = 30 + (PARTS_ORDER.indexOf(partsStep) / (PARTS_ORDER.length - 1)) * 15;
  const tidy = (s: string) => s.trim().replace(/\.$/, '').toLowerCase();
  const chip = "px-4 py-2 rounded-full border border-white/20 bg-white/5 text-xs text-white/90 hover:bg-white/20 transition-all";
  // Chips used to overwrite whatever was already typed. Now they only fill
  // an empty field, and append otherwise.
  const applyChip = (current: string, value: string, setter: (s: string) => void) => {
    setter(current.trim() ? `${current.trim()} ${value.toLowerCase()}` : value);
  };
  return (
    <div className="h-full flex flex-col">
      <Nav title="Parts Dialogue" subtitle={selectedPart} onBack={handleBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={partsProgress} />
      <div className="flex-1 min-h-0 flex flex-col justify-start pt-6 space-y-6 animate-enter overflow-y-auto hide-scrollbar pb-16">
        {partsStep === 'experience' && (
          <div className="text-center">
            <Activity size={24} className="text-white/80 mx-auto mb-4" />
            <p className="font-serif text-2xl text-white/90 italic mb-6">"How does the {selectedPart} feel?"</p>
            <FlowInput value={sensation} onChange={setSensation} placeholder="It feels like..." onSubmit={() => sensation && setPartsStep('unblend')} className="mb-6" />
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Tight","Heavy","Hot","Buzzing","Hollow","Knotted"].map(s => <button key={s} onClick={() => applyChip(sensation, s, setSensation)} className={chip}>{s}</button>)}
            </div>
            <button onClick={() => setPartsStep('unblend')} disabled={!sensation} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-40">Next</button>
          </div>
        )}
        {partsStep === 'unblend' && (
          <div className="text-center">
            <Wind size={64} className="text-teal-200 mx-auto mb-8" />
            <h3 className="font-serif text-2xl text-white italic mb-4">Separation</h3>
            <p className="font-sans text-base text-white/70 leading-relaxed mb-8">Can you ask the <strong>{sensation}</strong> to step back just a few inches?</p>
            <button onClick={() => setPartsStep('connect')} className="w-full py-4 rounded-full bg-teal-500/10 text-teal-200 font-sans text-xs tracking-widest uppercase hover:bg-teal-500/20 transition-all border border-teal-500/20">I have created space</button>
          </div>
        )}
        {partsStep === 'connect' && (
          <div className="text-center">
            <Waves size={64} className="text-indigo-200 mx-auto mb-8" />
            <h3 className="font-serif text-2xl text-white italic mb-4">The Inquiry</h3>
            <p className="font-sans text-base text-white/70 leading-relaxed mb-6">Ask internally: <em>"What are you afraid would happen if you didn't do this job?"</em></p>
            <FlowInput value={fear} onChange={setFear} placeholder="It is afraid that..." onSubmit={() => fear && setPartsStep('message')} accent="indigo" className="mb-8" />
            <button onClick={() => setPartsStep('message')} disabled={!fear} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all border border-white/5 disabled:opacity-40">Acknowledge Fear</button>
          </div>
        )}
        {partsStep === 'message' && (
          <div className="text-center">
            <Shield size={24} className="text-white/80 mx-auto mb-4" />
            <p className="font-serif text-2xl text-white/90 italic mb-6">"What is it trying to do?"</p>
            <FlowInput value={protection} onChange={setProtection} placeholder="It is trying to..." onSubmit={() => protection && setPartsStep('channel')} className="mb-6" />
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Keep me safe","Stop me being caught out","Keep me in control","Spare me the disappointment","Make sure I am ready"].map(p => <button key={p} onClick={() => applyChip(protection, p, setProtection)} className={chip}>{p}</button>)}
            </div>
            <button onClick={() => setPartsStep('appreciate')} disabled={!protection} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-40">Continue</button>
          </div>
        )}

        {/* APPRECIATION — the part is thanked before anything is asked of it.
            Skipping this is what makes the sequence feel like management
            rather than dialogue. */}
        {partsStep === 'appreciate' && (
          <div className="text-center">
            <Heart size={24} className="text-teal-200 mx-auto mb-4" strokeWidth={1.6} />
            <p className="font-serif text-2xl text-teal-100 italic mb-5">Acknowledge It</p>
            <p className="font-sans text-base text-white/75 leading-relaxed mb-4">
              This part has been {protection ? tidy(protection) : 'holding the line'} for a long time. Nobody asked it to, and nobody thanked it.
            </p>
            <p className="font-sans text-base text-white/75 leading-relaxed mb-8">
              Before you ask it to change anything, let it know you see what it has been carrying. Say it inwardly, in your own words. Take a breath before you move on.
            </p>
            <button onClick={() => setPartsStep('resource')} className="w-full py-4 rounded-full bg-teal-500/10 text-teal-200 border border-teal-500/20 font-sans text-xs tracking-widest uppercase hover:bg-teal-500/20 transition-all">
              I have acknowledged it
            </button>
          </div>
        )}

        {/* RESOURCE — a protective part rarely lets go on request. It lets go
            when something else can hold the weight. */}
        {partsStep === 'resource' && (
          <div className="text-center">
            <Anchor size={24} className="text-indigo-200 mx-auto mb-4" strokeWidth={1.6} />
            <p className="font-serif text-2xl text-indigo-100 italic mb-4">What It Needs</p>
            <p className="font-sans text-base text-white/75 leading-relaxed mb-6">
              A part this committed does not stand down because you asked. It stands down when something else can hold the weight.
            </p>

            <label className="block font-sans text-[11px] uppercase tracking-widest text-indigo-300/80 mb-3 text-left">
              What would this part need in order to loosen its grip?
            </label>
            <FlowInput value={needed} onChange={setNeeded} placeholder="It would need..." accent="indigo" className="mb-4" />
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Steadiness","Backup","Permission to stop","Certainty","Rest"].map(n => (
                <button key={n} onClick={() => applyChip(needed, n, setNeeded)} className="px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs text-indigo-200 hover:bg-indigo-500/20 transition-all">{n}</button>
              ))}
            </div>

            <label className="block font-sans text-[11px] uppercase tracking-widest text-indigo-300/80 mb-3 text-left">
              When have you already had that? Any moment counts.
            </label>
            <FlowInput value={resourceMemory} onChange={setResourceMemory} placeholder="I had it when..." onSubmit={() => needed && resourceMemory && setPartsStep('channel')} accent="indigo" className="mb-4" />
            <p className="font-sans text-xs text-white/40 mb-8 text-left">
              That part of you still exists. Bring it alongside the one holding the {sensation ? tidy(sensation) : 'weight'} — not to argue with it, just to stand there.
            </p>

            <button onClick={() => setPartsStep('channel')} disabled={!needed || !resourceMemory} className="w-full py-4 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-500/25 font-sans text-xs tracking-widest uppercase hover:bg-indigo-500/25 transition-all disabled:opacity-40">
              They are standing together
            </button>

            {/* Searching for a resourced memory can come up empty, and for
                some people that search is itself loaded. It must be a normal
                exit, not a failure to complete the step. */}
            <button onClick={() => setPartsStep('channel')} className="w-full mt-3 py-3 text-white/40 hover:text-white/70 font-sans text-[11px] tracking-widest uppercase transition-colors">
              Nothing comes to mind
            </button>
            <p className="font-sans text-xs text-white/30 mt-2 leading-relaxed">
              That is a common answer and not a wrong one. You can carry on without it.
            </p>
          </div>
        )}
        {partsStep === 'channel' && (
          <div className="text-center">
            <Zap size={24} className="text-teal-200 mx-auto mb-4" />
            <p className="font-serif text-2xl text-teal-100 italic mb-4">Shift the Energy</p>
            <p className="font-sans text-base text-white/75 leading-relaxed mb-3">
              It is not empty-handed now{needed ? `, it has ${tidy(needed)}` : ''}. The effort it has been spending on {protection ? tidy(protection) : 'holding the line'} is real energy, and it is yours.
            </p>
            <p className="font-sans text-base text-white/75 leading-relaxed mb-6">
              You are not shutting it down. You are giving it a job you actually chose.
            </p>
            <label className="block font-sans text-[11px] uppercase tracking-widest text-teal-300/80 mb-3 text-left">
              If this energy worked for you instead of against you, what would it do?
            </label>
            <FlowInput value={expandingBelief} onChange={setExpandingBelief} placeholder="I will use this energy to..." onSubmit={() => expandingBelief && setView('lens')} accent="teal" className="mb-4" />
            <p className="font-sans text-xs text-white/40 mb-6 text-left">One line. Something the part can actually do tomorrow.</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Hold one boundary today","Say the thing I have avoided","Protect my recovery time","Finish one thing properly"].map(ex => (
                <button key={ex} onClick={() => applyChip(expandingBelief, ex, setExpandingBelief)} className="px-4 py-2 rounded-full border border-teal-500/20 bg-teal-500/10 text-xs text-teal-200 hover:bg-teal-500/20 transition-all">{ex}</button>
              ))}
            </div>
            <button onClick={() => setView('lens')} disabled={!expandingBelief} className="w-full py-4 rounded-full bg-teal-500/10 text-teal-200 border border-teal-500/20 font-sans text-xs tracking-widest uppercase hover:bg-teal-500/20 transition-all disabled:opacity-40">Integrate</button>
          </div>
        )}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// LASER COACHING
// ─────────────────────────────────────────────
const LaserCoaching: React.FC<LaserCoachingProps> = ({ stressor, perception, somatic, fear, distortionType, setView, toggleSound, soundEnabled, setGoal, setExpandingBelief, energyLevel, stressLevel, onBack, raiseCrisis }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({ topic: '', result: '', permission: '', action: '' });
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [somaticEcho, setSomaticEcho] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (aiQuestions.length === 0) {
      setLoading(true);
      Promise.all([
        generateCoachingQuestions(stressor || "General Stress", perception || "Feeling Stuck", somatic, energyLevel, stressLevel, fear, distortionType),
        getSomaticEcho(somatic, stressor, stressLevel, energyLevel),
      ]).then(([q, echo]) => {
        if (q.crisis) { raiseCrisis(q.crisisMessage!); return; }
        setAiQuestions(q.data);
        setSomaticEcho(echo);
        setLoading(false);
      });
    }
  }, []);


  const starters: Record<number, string[]> = {
    0: ["My insight is...","The real issue is...","I'm realizing that...","I sense..."],
    1: ["To feel...","To achieve...","To experience...","To become..."],
    2: ["To make a mess.","To prioritize me.","To let go.","To trust myself."],
    3: ["I will call...","I will write...","I will stop...","I will start..."],
  };


  const currentQ = [
    { id: 'topic', label: 'The Insight', q: aiQuestions[0] || "Connecting to the field...", ph: 'My insight is...' },
    { id: 'result', label: 'The Vision', q: aiQuestions[1] || "If this shifted, what state or outcome would you experience?", ph: 'I want to...' },
    { id: 'permission', label: 'Permission', q: aiQuestions[2] || "What permission do you need to give yourself to move forward?", ph: 'I give myself permission to...' },
    { id: 'action', label: 'The Move', q: aiQuestions[3] || "What is the single boldest step that makes everything else easier?", ph: 'I will...' },
  ][step];


  // ── FIX 8: never advance on an empty field ──
  const handleNext = () => {
    if (!answers[currentQ.id]) return;
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
      <div className="flex-1 min-h-0 pt-2 overflow-y-auto hide-scrollbar pb-10">
        <div className="glass-panel p-6 rounded-[32px]">
          {loading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-teal-400" /></div>
          ) : (
            <div className="animate-enter">
              {step === 0 && somaticEcho && (
                <p className="font-serif text-base text-white/55 italic mb-6 leading-relaxed border-l-2 border-teal-500/30 pl-3">{somaticEcho}</p>
              )}
              <span className="font-sans text-[10px] text-white/50 uppercase tracking-widest mb-4 block">{currentQ.label}</span>
              <h3 className="font-serif text-2xl text-white italic mb-8 leading-snug">{currentQ.q}</h3>
              <FlowInput
                key={currentQ.id}
                value={answers[currentQ.id]}
                onChange={v => setAnswers({ ...answers, [currentQ.id]: v })}
                placeholder={currentQ.ph}
                onSubmit={handleNext}
                accent="teal"
                className="mb-6"
              />
              <div className="flex flex-wrap gap-2 mb-6">
                {(starters[step] || []).map(s => (
                  <button key={s} onClick={() => setAnswers({ ...answers, [currentQ.id]: s })} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10 transition-colors">{s}</button>
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
  const deficit = pressure - ability;
  return (
    <div className="h-full flex flex-col">
      <Nav title="The Perspective" subtitle="Calibration" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={50} />
      <div className="flex-1 min-h-0 flex flex-col items-center justify-start pt-2 overflow-y-auto hide-scrollbar pb-6">
        <div className="text-center mb-8 max-w-sm animate-enter">
          <p className="font-serif text-lg text-white/70 italic leading-relaxed">Friction is a mathematical equation. It occurs when external demand exceeds internal bandwidth. Quantify the gap.</p>
        </div>
        <div className={`relative w-48 h-48 shrink-0 rounded-full border border-white/10 flex items-center justify-center transition-all duration-1000 mb-8 animate-enter ${flowState ? 'shadow-[0_0_60px_rgba(20,184,166,0.2)] bg-teal-900/10' : 'shadow-[0_0_60px_rgba(244,63,94,0.2)] bg-rose-900/10'}`}>
          <div className="text-center relative z-10 px-2">
            <h2 className={`font-serif text-3xl italic mb-1 ${flowState ? 'text-teal-300' : 'text-rose-300'}`}>{flowState ? 'Flow State' : 'High Friction'}</h2>
            <p className="font-sans text-[10px] tracking-widest uppercase text-white/60">{flowState ? 'Capacity exceeds demand.' : `Capacity deficit: -${deficit}%`}</p>
          </div>
          <div className={`absolute inset-4 rounded-full border border-dashed opacity-30 ${flowState ? 'border-teal-400 animate-[spin_20s_linear_infinite]' : 'border-rose-400 animate-pulse'}`} />
        </div>
        <div className="w-full glass-panel p-6 rounded-[24px] border-white/10 space-y-8 animate-enter">
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-3 gap-2">
              <div className="min-w-0"><p className="font-sans text-[11px] tracking-widest text-amber-300 uppercase font-bold">Requirement Intensity</p><p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">External Demand</p></div>
              <div className="text-2xl font-serif italic text-amber-400 shrink-0">{pressure}%</div>
            </div>
            <input aria-label="Requirement intensity" type="range" min="1" max="100" value={pressure} onChange={e => setPressure(parseInt(e.target.value))} className="w-full slider-amber" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-3 gap-2">
              <div className="min-w-0"><p className="font-sans text-[11px] tracking-widest text-indigo-300 uppercase font-bold">Internal Capacity</p><p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Current Bandwidth</p></div>
              <div className="text-2xl font-serif italic text-indigo-400 shrink-0">{ability}%</div>
            </div>
            <input aria-label="Internal capacity" type="range" min="1" max="100" value={ability} onChange={e => setAbility(parseInt(e.target.value))} className="w-full slider-indigo" />
          </div>
        </div>
      </div>
      <div className="pt-4 shrink-0 animate-enter">
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
  const recommendStillness = stressLevel > 7 || energyLevel < 4;
  return (
    <div className="h-full flex flex-col">
      <Nav title="The Crossroads" subtitle="Choice Point" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={65} />
      <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto hide-scrollbar pb-6">
        <h1 className="font-serif text-4xl text-white text-center italic mb-8">Transformation</h1>
        <div className="grid gap-4">
          <button onClick={() => setView('regulate')} className={`p-8 rounded-[32px] glass-panel text-left hover:bg-white/10 ${recommendStillness ? 'border-teal-500/50 glow-pulse' : ''}`}>
            <Wind size={32} className="text-teal-200/50 mb-4" />
            <h3 className="font-serif text-2xl text-white italic">Stillness</h3>
            {recommendStillness && <span className="text-[11px] uppercase tracking-widest text-teal-400">Recommended</span>}
          </button>
          <button onClick={() => setView('laser')} className={`p-8 rounded-[32px] glass-panel text-left hover:bg-white/10 ${!recommendStillness ? 'border-amber-500/50 glow-pulse' : ''}`}>
            <Zap size={32} className="text-amber-200/50 mb-4" />
            <h3 className="font-serif text-2xl text-white italic">Motion</h3>
            {!recommendStillness && <span className="text-[11px] uppercase tracking-widest text-amber-400">Recommended</span>}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// BREATH
// FIX 1: outer column no longer uses items-center, which was shrinking Nav
// ─────────────────────────────────────────────
const Breath: React.FC<BreathProps> = ({ breathing, setBreathing, breathCount, setBreathCount, setView, toggleSound, soundEnabled, onBack }) => {
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
        const idx = next % CYCLE_LEN;
        if (idx === 0) soundEngine.playBreathTone(523, 0.4);
        else if (idx === PHASE_LEN) soundEngine.playBreathTone(392, 0.3);
        else if (idx === PHASE_LEN * 2) soundEngine.playBreathTone(349, 0.5);
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
    <div className="h-full flex flex-col">
      <Nav title="Regulation" subtitle="Box Breath" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} />
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative overflow-y-auto hide-scrollbar pb-6">


        {breathing && (
          <div className="mb-6 flex gap-2 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i < completedCycles % 4 ? 'bg-teal-400' : 'bg-white/10'}`} />
            ))}
          </div>
        )}


        <div className="relative flex items-center justify-center shrink-0">
          {breathing && <div className="absolute w-60 h-60 rounded-full border border-teal-500/30 ripple-ring" />}
          <div
            className={`w-56 h-56 rounded-full border border-white/10 flex flex-col items-center justify-center transition-all duration-1000 z-10 ${breathing ? 'bg-teal-900/20 shadow-[0_0_50px_rgba(20,184,166,0.2)]' : 'bg-white/5'}`}
            style={{ transform: `scale(${breathing ? scale : 1})` }}
          >
            <span className={`font-serif text-2xl italic transition-colors duration-500 ${breathing ? color : 'text-white'}`}>
              {breathing ? phase : "Stillness"}
            </span>
            {breathing && <span className="font-sans text-4xl text-white/50 font-light mt-2">{phaseCount}</span>}
          </div>
        </div>


        {breathing && (
          <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-white/40 font-bold shrink-0">
            {phase === 'Inhale' ? 'Through the nose' : phase === 'Exhale' ? 'Through the mouth' : 'Still'}
          </p>
        )}


        <div className="h-12 shrink-0" />
        <button onClick={handleToggle} className="px-10 py-4 shrink-0 rounded-full bg-white text-slate-900 font-bold text-xs uppercase tracking-widest mb-4">
          {breathing ? 'Complete' : 'Begin'}
        </button>
        {!breathing && (
          <button onClick={() => setView('insight')} className="text-teal-200 text-xs uppercase tracking-widest shrink-0">
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
  <div className="h-full flex flex-col">
    <Nav title="The Clarity" subtitle="Harvesting" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} />
    <div className="flex-1 min-h-0 flex flex-col justify-center text-center overflow-y-auto hide-scrollbar pb-6">
      <h3 className="font-serif text-2xl text-white italic mb-6">"In the stillness, what became clear?"</h3>
      <FlowInput
        value={expandingBelief}
        onChange={setExpandingBelief}
        placeholder="The truth is..."
        onSubmit={() => expandingBelief && setView('alchemy')}
        accent="teal"
        className="mb-10"
      />
      <button onClick={() => setView('alchemy')} disabled={!expandingBelief} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-40">
        Direct this Energy
      </button>
    </div>
  </div>
);


// ─────────────────────────────────────────────
// ALCHEMY
// ─────────────────────────────────────────────
const Alchemy: React.FC<AlchemyProps & { setAlchemyType: (t: string) => void }> = ({ setView, toggleSound, soundEnabled, onBack, setAlchemyType }) => (
  <div className="h-full flex flex-col">
    <Nav title="Vitality Alchemy" subtitle="Select Chemistry" onBack={onBack} toggleSound={toggleSound} soundEnabled={soundEnabled} />
    <div className="flex-1 min-h-0 space-y-4 pt-2 overflow-y-auto hide-scrollbar pb-6">
      {[
        { id: 'perform', label: 'Performance', desc: 'Sharpen focus and executive capacity.', icon: Zap },
        { id: 'connect', label: 'Connection', desc: 'Open the heart. Deepen relationships.', icon: Heart },
        { id: 'learn', label: 'Expansion', desc: 'Build new neural pathways. Grow.', icon: BookOpen },
      ].map(i => (
        <button key={i.id} onClick={() => { setAlchemyType(i.id); setView('integration'); }} className="w-full p-6 rounded-[24px] glass-panel text-left hover:bg-white/5 transition-all">
          <i.icon className="text-white/80 mb-2" size={24} />
          <h3 className="font-serif text-2xl text-white italic">{i.label}</h3>
          <p className="font-serif text-white/60 italic text-base">{i.desc}</p>
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
    { icon: Mountain, title: "Physiology", instruction: "Change your state immediately. Stand up. Shoulders back. Deep breath. Look up.", action: "I am ready." },
    { icon: Anchor, title: "Somatic Anchor", instruction: "Where do you feel this new power in your body? Put your hand there now.", action: "I feel it." },
    { icon: Eye, title: "Visualization", instruction: "Close your eyes. See the goal achieved. Feel the emotion of the win in your body.", action: "Seal it." },
  ];
  const current = steps[step];
  const next = () => { if (step < steps.length - 1) setStep(step + 1); else onComplete(); };
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-center items-center text-center animate-enter overflow-y-auto hide-scrollbar">
      <div className="min-h-full flex flex-col justify-center items-center py-10 w-full">
        <div className="mb-8 relative"><div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full" /><current.icon size={64} className="text-white relative z-10 animate-pulse" strokeWidth={1} /></div>
        <h2 className="font-serif text-3xl text-white italic mb-4 animate-enter" key={`t-${step}`}>{current.title}</h2>
        <p className="font-sans text-lg text-white/80 leading-relaxed max-w-[280px] mx-auto mb-12 animate-enter" key={`i-${step}`}>{current.instruction}</p>
        <button onClick={next} className="px-10 py-5 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-[0.2em] uppercase hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all animate-enter">{current.action}</button>
        <div className="flex gap-2 mt-8">{steps.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />))}</div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// INTEGRATION
// ─────────────────────────────────────────────
const Integration: React.FC<IntegrationProps> = ({
  goal, setGoal, goalStep, setGoalStep, isLocked, setIsLocked,
  expandingBelief, stressor, fear, sessionCount, completeSession,
  resetApp, setView, toggleSound, soundEnabled, somaticZones,
  isBurnoutPath, userName, energyAnalysis, stressLevel, energyLevel,
  postStressLevel, setPostStressLevel, postEnergyLevel, setPostEnergyLevel,
  onBack, saveSession, updateLatestSession, setHasCompletedFreeCycle, goHome, raiseCrisis
}: any) => {
  const [primingDone, setPrimingDone] = useState(false);
  const [manifesto, setManifesto] = useState("");
  const [generating, setGenerating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [sessionSaved, setSessionSaved] = useState(false);


  const [postStress, setPostStress] = useState(stressLevel);
  const [postEnergy, setPostEnergy] = useState(energyLevel);


  const stressDelta = postStress - stressLevel;
  const energyDelta = postEnergy - energyLevel;
  const entryLevel = energyAnalysis?.level ?? 2;


  // ── Dynamic Level Math ──
  const exitLevel = Math.min(7, Math.max(entryLevel,
    entryLevel + (stressDelta <= -4 ? 3 : stressDelta <= -2 ? 2 : stressDelta < 0 ? 1 : 0)
  ));


  const KINETIC_STATES: Record<number, string> = {
    1: "Depleted", 2: "Bracing", 3: "Coping",
    4: "Absorbing", 5: "Momentum", 6: "Flow", 7: "Sovereign",
  };


  const getAssessment = () => {
    if (stressDelta === 0 && energyDelta === 0) {
      return {
        status: "Baseline Unchanged",
        color: "text-white/70",
        read: "Your internal weather has not shifted yet. This is normal. Sometimes the protocol merely stops the downward spiral. Focus on grounding and revisit this architecture when you have more bandwidth.",
      };
    } else if (stressDelta >= 0 && energyDelta <= 0) {
      return {
        status: "Persistent Friction",
        color: "text-rose-400",
        read: `Your system is heavily gripping the stress of "${(stressor || '').substring(0, 30)}...". Do not force high-output action today. Lower your expectations, strip away non-essential tasks, and focus purely on biological regulation.`,
      };
    } else if (stressDelta < 0 && postStress <= 4) {
      return {
        status: "Deep Metabolic Shift",
        color: "text-teal-400",
        read: `Exceptional. You successfully metabolized ${Math.abs(stressDelta)} points of active friction and dropped your stress into the clear zone. You have reclaimed your cognitive bandwidth. Execute your commitment now.`,
      };
    } else {
      return {
        status: "Friction Metabolized",
        color: "text-indigo-400",
        read: `You successfully discharged ${Math.abs(stressDelta)} points of stress. You are stabilizing. The storm has passed, but guard your energy closely over the next 48 hours to lock in this new baseline.`,
      };
    }
  };
  const assessment = getAssessment();


  useEffect(() => {
    if (isLocked && !sessionSaved) {
      const record: SessionRecord = {
        date: new Date().toISOString(),
        stressor,
        preStress: stressLevel,
        postStress: postStress,
        preEnergy: energyLevel,
        postEnergy: postEnergy,
        coreFear: fear,
        expandingBelief,
        commitment: commitmentSentence(),
        energyLevel: exitLevel,
      };
      saveSession(record);
      setSessionSaved(true);
      completeSession();
      storageSet(STORAGE_KEYS.FREE_CYCLE, true);
      setHasCompletedFreeCycle(true);
    }
  }, [isLocked]);


  useEffect(() => {
    if (!sessionSaved) return;
    setPostStressLevel(postStress);
    setPostEnergyLevel(postEnergy);
    updateLatestSession({ postStress, postEnergy, energyLevel: exitLevel });
  }, [postStress, postEnergy, sessionSaved]);


  // ── FIX 7: seed the decree synchronously so the panel is never empty quotes ──
  useEffect(() => {
    if (!isLocked || manifesto) return;


    const truth = expandingBelief || (isBurnoutPath ? "I am the Asset. Rest is my strategy." : "I am the one who decides what I carry");
    const action = goal.action || (isBurnoutPath ? "I am offline to realign" : "I move on this now");


    const seed = isBurnoutPath
      ? `I am the Asset. The work does not survive my collapse. I refuse to let "${stressor || 'this'}" spend what I do not have. Standing in the truth that ${truth}, I am reclaiming my sovereignty. My action is my seal: ${action}.`
      : `I hear the noise of "${stressor || 'this'}" and the fear that ${fear || 'I am not enough'}. I honor the friction, but I refuse to reside in it. Standing in the undeniable truth that ${truth}, I am reclaiming my sovereignty. My action is my seal: ${action}.`;


    setManifesto(seed);
    setIsOffline(true);
    setGenerating(true);


    generateManifesto(stressor, truth, action, fear, entryLevel, isBurnoutPath, (text) => setManifesto(text))
      .then(res => {
        setGenerating(false);
        // The server refuses to write a decree on top of crisis language.
        // Drop the seeded text so it is never shown, and hand off.
        if (res.crisis) { setManifesto(''); raiseCrisis(res.crisisMessage!); return; }
        setIsOffline(res.isOffline);
      })
      .catch(() => setGenerating(false));
  }, [isLocked, isBurnoutPath, manifesto]);


  // A cue beats a deadline. "Today" is a deadline; "when I close my laptop"
  // is a cue, and cues are the part that actually drives follow-through.
  const ACTION_CHIPS = [
    'Send the message I have been avoiding',
    'Close the laptop',
    'Say no to one thing',
    'Ask someone for help with this',
  ];
  const TRIGGER_CHIPS = [
    'When I close this app',
    'Before I open my laptop tomorrow',
    'At the end of this shift',
    'Next time it comes up',
  ];

  const commitmentSentence = () => {
    const raw = (goal.action || '').trim().replace(/\.$/, '');
    const cue = (goal.when || '').trim().replace(/\.$/, '');
    if (!raw) return '';

    // Preservation Mode writes a full statement ("I am offline to realign"),
    // and chips arrive capitalised. Both need handling or the sentence reads
    // "I will I am offline to realign".
    const alreadyASentence = /^i\s/i.test(raw);
    const verb = raw.replace(/^I will\s+/i, '');
    const lower = verb.charAt(0).toLowerCase() + verb.slice(1);
    const clause = alreadyASentence ? raw.charAt(0).toUpperCase() + raw.slice(1) : `I will ${lower}`;

    if (!cue) return `${clause}.`;
    if (/^(when|before|after|at|next|the moment|first thing|tonight|tomorrow|now|today)\b/i.test(cue)) {
      const head = cue.charAt(0).toUpperCase() + cue.slice(1);
      return `${head}, ${clause}.`;
    }
    return `${clause} — ${cue}.`;
  };

  const applyChip = (current: string, value: string, key: 'action' | 'when') => {
    setGoal({ ...goal, [key]: current.trim() ? `${current.trim()} ${value.toLowerCase()}` : value });
  };

  const handleBack = () => onBack?.();
  const handleNextStep = () => { if (goal.action?.trim()) setIsLocked(true); };


  const copyArtifact = async () => {
    const text = `ADAPTIV DECREE\n\n${manifesto}\n\n${commitmentSentence()}`;
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
    const body = `${manifesto}\n\n${commitmentSentence()}`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };


  const generateCalendarLink = () => {
    const text = `Adaptiv: ${goal.action}`;
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
    return (
      <div className="h-full flex flex-col">
        <Nav title="Integration" subtitle="Blueprint Complete" onBack={goHome} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={100} aiActive={generating} />
        {showToast && <Toast message={toastMsg} onDone={() => setShowToast(false)} />}


        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pb-16 pt-1">


          {/* FIX 4: panel down to p-5, no extra px-4 on the column */}
          <div className="glass-panel p-5 rounded-[2rem] border-t-4 border-teal-500 shadow-2xl text-center mb-6 animate-enter">

            {/* ── 1. SLIDERS ── */}
            <div className="text-left mb-8 space-y-6">
              <h3 className="text-[11px] uppercase tracking-widest text-white/50 font-bold mb-4">1. Re-Assess Internal Weather</h3>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] uppercase tracking-widest text-white/70">Current Stress</label>
                  <span className="text-rose-400 font-serif text-2xl">{postStress}</span>
                </div>
                <input aria-label="Current stress" type="range" min={1} max={10} value={postStress} onChange={e => setPostStress(parseInt(e.target.value))} className="w-full slider-amber" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] uppercase tracking-widest text-white/70">Current Energy</label>
                  <span className="text-teal-400 font-serif text-2xl">{postEnergy}</span>
                </div>
                <input aria-label="Current energy" type="range" min={1} max={10} value={postEnergy} onChange={e => setPostEnergy(parseInt(e.target.value))} className="w-full slider-indigo" />
              </div>
            </div>


            {/* ── 2. SHIFT READOUT ── */}
            <div className="pt-6 border-t border-white/10 mb-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50 mb-6">2. Kinetic Shift Detected</h2>

              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="text-center min-w-0">
                  <div className="text-2xl font-serif italic text-rose-400">Level {entryLevel}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1 truncate">{KINETIC_STATES[entryLevel]}</div>
                </div>
                <ArrowRight size={20} className={`shrink-0 ${stressDelta < 0 || energyDelta > 0 ? "text-teal-400" : "text-white/20"}`} />
                <div className="text-center min-w-0">
                  <div className="text-2xl font-serif italic text-teal-400">Level {exitLevel}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1 truncate">{KINETIC_STATES[exitLevel]}</div>
                </div>
              </div>


              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Stress</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-serif text-xl text-rose-400">{stressLevel}</span>
                    <TrendingDown size={14} className={stressDelta < 0 ? "text-teal-400" : stressDelta === 0 ? "text-white/30" : "text-rose-400"} />
                    <span className="font-serif text-xl text-teal-400">{postStress}</span>
                  </div>
                  <p className={`text-[10px] font-bold mt-1 leading-tight ${stressDelta < 0 ? 'text-teal-400' : stressDelta === 0 ? 'text-white/50' : 'text-rose-400'}`}>
                    {stressDelta < 0 ? `${Math.abs(stressDelta)} pts metabolized` : stressDelta === 0 ? 'Baseline held' : `+${stressDelta} (review)` }
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Energy</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-serif text-xl text-white/50">{energyLevel}</span>
                    <ArrowRight size={14} className={energyDelta > 0 ? "text-teal-400" : energyDelta === 0 ? "text-white/30" : "text-rose-400"} />
                    <span className="font-serif text-xl text-teal-400">{postEnergy}</span>
                  </div>
                  <p className={`text-[10px] font-bold mt-1 leading-tight ${energyDelta > 0 ? 'text-teal-400' : energyDelta === 0 ? 'text-white/50' : 'text-rose-400'}`}>
                    {energyDelta > 0 ? `+${energyDelta} expanded` : energyDelta === 0 ? 'Exit baseline' : `${energyDelta} drained`}
                  </p>
                </div>
              </div>
            </div>


            {/* ── 3. CLINICAL READ ── */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-8 text-left shadow-sm transition-all duration-500">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 mb-3">3. Clinical Read</p>
              <h3 className={`font-serif text-2xl italic mb-3 transition-colors duration-500 ${assessment.color}`}>{assessment.status}</h3>
              <p className="font-sans text-[15px] text-white/75 leading-relaxed">{assessment.read}</p>
            </div>


            {/* ── 4. THE DECREE ── */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-6 text-center shadow-inner">
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">4. Your Decree</p>
                {generating && <Loader2 size={11} className="animate-spin text-teal-400" />}
              </div>
              {!manifesto ? (
                <div className="flex items-center justify-center gap-2 text-white/40 text-sm py-4"><Loader2 size={16} className="animate-spin" /> Synthesizing your decree...</div>
              ) : (
                <p className="font-serif text-2xl text-white leading-relaxed italic drop-shadow-md">"{manifesto}"</p>
              )}
              {isOffline && manifesto && !generating && (
                <p className="text-[10px] uppercase tracking-widest text-white/30 mt-4 flex items-center justify-center gap-1"><WifiOff size={10} /> Offline decree</p>
              )}
            </div>


            {/* ── 5. NEXT MOVE ── */}
            {manifesto && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-indigo-400 shrink-0" />
                  <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                    Your Next Move at Level {exitLevel}
                  </span>
                </div>
                <p className="font-serif text-lg text-white italic mb-3 leading-snug">
                  {exitLevel <= 2 && `"You are beginning to reclaim your agency. The shift from survival to strategy starts with one sovereign decision. Make it now."`}
                  {exitLevel === 3 && `"You have moved from reaction to command. Now stop tolerating what you have been explaining away. Name it. Then eliminate it."`}
                  {exitLevel === 4 && `"Your compassion is your strength and your drain. The next level requires you to direct that care inward first. Protect the Asset."`}
                  {exitLevel === 5 && `"You are operating in momentum. Most people never reach this frequency. Now build — don't just reframe. Execute from this state."`}
                  {exitLevel >= 6 && `"You are creating, not reacting. This is your natural state. The work now is to architect systems that sustain this frequency without requiring a crisis to access it."`}
                </p>
                <div className="pt-3 border-t border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Recommended Protocol</span>
                  <span className="text-[13px] text-teal-300 font-bold leading-relaxed">
                    {exitLevel <= 2 && "Vitality Scan → Preservation Mode → Return daily for 7 sessions"}
                    {exitLevel === 3 && "Laser Coaching → Parts Work → Set one boundary today"}
                    {exitLevel === 4 && "Parts Work → Identify one energy leak to eliminate this week"}
                    {exitLevel === 5 && "Laser Coaching → Integration → Book a Clinical Strategy Session to lock in baseline"}
                    {exitLevel >= 6 && "Clinical Strategy Session → Kinetic Leader → Architect your next 90 days from this state"}
                  </span>
                </div>
              </div>
            )}


            {/* ── ACTION BUTTONS ── */}
            {manifesto && (
              <div className="flex gap-2 mb-6">
                <button onClick={copyArtifact} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Copy size={12} /> Copy
                </button>
                <a href={generateEmailLink()} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Mail size={12} /> Email
                </a>
                <a href={generateCalendarLink()} target="_blank" rel="noreferrer" className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Calendar size={12} /> Calendar
                </a>
              </div>
            )}


            {/* ── 6. UPSELLS (Hidden for Burnout Path) ── */}
            {!isBurnoutPath && (
              <>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/90 mb-4">Sustain This Shift</p>
                <div className="space-y-3">
                  <a href="https://billing.liveadaptiv.com/checkout/buy/db8aa0f8-12f1-4024-950f-d016d0e35373" target="_blank" rel="noreferrer" className="block w-full py-4 bg-teal-500 text-slate-900 font-bold rounded-xl text-[11px] uppercase tracking-widest shadow-lg hover:bg-teal-400 transition-all">
                    Continue in the App — Monthly Access
                  </a>
                  <a href="https://billing.liveadaptiv.com/checkout/buy/d29e3b81-78a4-4611-83f8-11fe76d9d82e" target="_blank" rel="noreferrer" className="block w-full py-4 bg-white/5 border border-white/20 text-white font-bold rounded-xl text-[11px] uppercase tracking-widest hover:border-teal-400 hover:text-teal-400 transition-all">
                    Stress Transformation Guide — $47
                  </a>
                  <a href="https://calendly.com/alexioda" target="_blank" rel="noreferrer" className="block w-full py-4 bg-white/5 border border-white/20 text-white font-bold rounded-xl text-[11px] uppercase tracking-widest hover:border-teal-400 hover:text-teal-400 transition-all">
                    Book Clinical Strategy Session ($495)
                  </a>
                </div>
              </>
            )}


          </div>


          <div className="flex gap-4 justify-center pb-6 pt-4 border-t border-white/5">
            <button onClick={resetApp} className="flex items-center justify-center gap-2 text-white/50 hover:text-white uppercase text-[11px] tracking-widest"><RefreshCw size={12} /> Reset System</button>
            <button onClick={goHome} className="flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest border px-4 py-2 rounded-full text-teal-400 border-teal-500/30 hover:bg-teal-900/20"><Home size={12} /> Return to Orbit</button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col">
      <Nav title="Integration" subtitle="The Move" onBack={handleBack} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={90} />
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pb-8">
        <div className="glass-panel p-6 rounded-[32px]">

          <h3 className="font-serif text-2xl text-white italic mb-2">The Move</h3>
          <p className="font-sans text-sm text-white/50 mb-8 leading-relaxed">
            One action, and the moment that will remind you. Not a plan — a cue.
          </p>

          <label className="block font-sans text-[11px] uppercase tracking-widest text-teal-400 mb-3">
            What are you doing about it?
          </label>
          <FlowInput
            value={goal.action || ''}
            onChange={v => setGoal({ ...goal, action: v })}
            placeholder="I will..."
            accent="teal"
            className="mb-4"
          />
          <div className="flex flex-wrap gap-2 mb-8">
            {ACTION_CHIPS.map(a => (
              <button key={a} onClick={() => applyChip(goal.action || '', a, 'action')}
                className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10 transition-colors">{a}</button>
            ))}
          </div>

          <label className="block font-sans text-[11px] uppercase tracking-widest text-teal-400 mb-3">
            What will remind you?
          </label>
          <FlowInput
            value={goal.when || ''}
            onChange={v => setGoal({ ...goal, when: v })}
            placeholder="When I..."
            onSubmit={handleNextStep}
            accent="teal"
            className="mb-4"
          />
          <div className="flex flex-wrap gap-2 mb-8">
            {TRIGGER_CHIPS.map(t => (
              <button key={t} onClick={() => applyChip(goal.when || '', t, 'when')}
                className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10 transition-colors">{t}</button>
            ))}
          </div>

          {/* The sentence assembles live, so they seal something they can read
              back rather than three disconnected fields. */}
          {goal.action?.trim() && (
            <div className="bg-white/5 border border-teal-500/20 rounded-2xl p-5 mb-6 animate-enter">
              <span className="block font-sans text-[10px] uppercase tracking-widest text-white/40 mb-2">Your move</span>
              <p className="font-serif text-lg text-white italic leading-relaxed">{commitmentSentence()}</p>
            </div>
          )}

          <button onClick={handleNextStep} disabled={!goal.action?.trim()}
            className="w-full py-4 rounded-xl bg-white text-slate-900 font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-40">
            Seal It
          </button>
          {!goal.when?.trim() && goal.action?.trim() && (
            <p className="text-center font-sans text-xs text-white/35 mt-3">
              A cue makes it far more likely to happen, but you can seal without one.
            </p>
          )}
        </div>
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
    { title: "Emergency Brake", icon: Anchor, desc: "We cannot push through burnout. We must stop. Locate one part of your body that feels neutral — hands, feet. Focus there only.", action: "I am anchored." },
    { title: "Boundary Alchemy", icon: MinusCircle, desc: "Burnout is cured by subtraction. What is one thing you will REFUSE to do today? Name it, then release it.", action: "I let it go." },
    { title: "Identity Shift", icon: User, desc: "You are not the worker. You are the Asset. If the Asset breaks, the work stops. Protecting the Asset IS the work.", action: "I am the Asset." },
  ];
  const current = recoverySteps[step];
  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else {
      setExpandingBelief("I am the Asset. Rest is my strategy.");
      setGoal({ outcome: "Status: Unavailable", action: "I am offline to realign.", when: "Now", what: '', measure: '' });
      setViewToIntegration();
    }
  };
  const handleBack = () => { if (step > 0) setStep(step - 1); else onBack?.(); };
  return (
    <div className="h-full flex flex-col">
      <Nav title="Preservation Mode" subtitle="Recovery Loop" onBack={handleBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={33 * (step + 1)} />
      <div className="flex-1 min-h-0 flex flex-col justify-center items-center animate-enter text-center overflow-y-auto hide-scrollbar pb-6">
        <div className="mb-8 relative mx-auto shrink-0"><div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full" /><current.icon size={64} className="text-orange-200 relative z-10" strokeWidth={1} /></div>
        <h2 className="font-serif text-3xl text-white italic mb-4">{current.title}</h2>
        <p className="font-sans text-base text-orange-100/75 leading-relaxed mb-12 max-w-xs mx-auto">{current.desc}</p>
        <button onClick={handleNext} className="w-full py-5 rounded-full bg-gradient-to-r from-orange-900/60 to-amber-900/60 border border-orange-500/30 text-orange-100 font-sans text-xs tracking-widest uppercase hover:border-orange-500/50 transition-all">{current.action}</button>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// VITALITY SCAN
// ─────────────────────────────────────────────
const VitalityScan: React.FC<VitalityScanProps> = ({ setView, setBurnoutPath, toggleSound, soundEnabled, onBack }) => {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(false);


  const questions = [
    { q: "Physical State", text: "Do you feel tired even after sleep, or have physical symptoms like headaches or stomach knots?" },
    { q: "Emotional State", text: "Do you feel increasingly cynical, detached, or negative about your work or the people you work with?" },
    { q: "Cognitive Fog", text: "Are you finding it hard to concentrate, or do you feel like you're working harder but accomplishing less?" },
    { q: "Relational Snap", text: "Are you more irritable or impatient with colleagues, friends, or family than usual?" },
    { q: "Anticipatory Dread", text: "Do you feel a sense of dread or heavy anxiety on Sunday nights or before starting your shift?" },
    { q: "Recovery Lag", text: "Does it take you longer than a weekend to feel like yourself again?" },
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
    if (s <= 2) return { type: "Friction (Acute Stress)", desc: "You are under pressure, but the engine is still intact. You need to discharge the stress, not stop the car.", action: "Use Laser Coaching to reframe the immediate stressor.", isBurnout: false };
    if (s <= 4) return { type: "Smoldering (Early Burnout)", desc: "The warning lights are on. Your cynicism is a defense mechanism. If you push harder now, you will break.", action: "You need boundaries. Use Preservation Mode to audit your energy leaks.", isBurnout: true };
    return { type: "Inferno (Full Burnout)", desc: "Your battery isn't just empty — it's damaged. You cannot mindset your way out of this. You need physiological safety.", action: "Emergency Brake. Stop. Use Preservation Mode to find one safe harbor.", isBurnout: true };
  };


  const resultData = getResult(score);


  if (showResult) {
    return (
      <div className="h-full flex flex-col justify-center animate-enter overflow-y-auto hide-scrollbar">
        <div className="flex-1 flex flex-col justify-center items-center text-center py-10">
          <div className={`mb-6 p-6 rounded-full border shrink-0 ${resultData.isBurnout ? 'bg-orange-900/30 border-orange-500/50' : 'bg-teal-900/30 border-teal-500/50'}`}>
            {resultData.isBurnout ? <Thermometer size={48} className="text-orange-400" /> : <Activity size={48} className="text-teal-400" />}
          </div>
          <p className="font-sans text-[11px] uppercase tracking-widest text-white/60 mb-2">Diagnostic Result</p>
          <h2 className="font-serif text-3xl text-white italic mb-4">{resultData.type}</h2>
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 w-full">
            <div className="flex items-center justify-center gap-2 mb-2"><Sparkles size={12} className="text-teal-400" /><span className="text-[10px] uppercase tracking-widest text-teal-400">Energy Shift Recommendation</span></div>
            <p className="font-serif text-base italic text-white/90">{loading ? "Analyzing Energy Pattern..." : `"${aiInsight}"`}</p>
          </div>
          <p className="font-sans text-base text-white/70 leading-relaxed mb-8 max-w-xs">{resultData.desc}</p>
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
      <div className="flex-1 min-h-0 flex flex-col justify-start items-center text-center overflow-y-auto hide-scrollbar pb-8 animate-enter pt-6">
        <h3 className="font-serif text-2xl text-white italic mb-3 shrink-0">{questions[step].q}</h3>
        <p className="font-sans text-base text-white/70 leading-relaxed mb-8 max-w-xs shrink-0">{questions[step].text}</p>
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
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);


  const questions = [
    { q: "Reaction to Challenge", options: [{ text: "I feel like this is happening to me. Why me?", val: 1 }, { text: "I have to protect my position.", val: 2 }, { text: "I look for what's useful here.", val: 5 }] },
    { q: "Inner Monologue", options: [{ text: "I'm not good enough.", val: 1 }, { text: "I'm better than them.", val: 2 }, { text: "I'm curious about this.", val: 5 }] },
    { q: "Motivation Source", options: [{ text: "I have to do this (Fear).", val: 1 }, { text: "I need to prove myself (Ego).", val: 2 }, { text: "I want to create this (Purpose).", val: 6 }] },
    { q: "View of Others", options: [{ text: "They just don't get it.", val: 2 }, { text: "They are doing their best.", val: 4 }, { text: "We are partners in this.", val: 6 }] },
    { q: "Energy at 3 PM", options: [{ text: "Completely drained / Foggy.", val: 1 }, { text: "Wired / Anxious / Tense.", val: 2 }, { text: "Steady / Calm.", val: 5 }] },
    { q: "Goal Driver", options: [{ text: "Avoiding failure.", val: 1 }, { text: "Beating the competition.", val: 2 }, { text: "Expressing my potential.", val: 6 }] },
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
      1: { title: "State 1: The Overwhelmed", type: "High-Friction", desc: "Core Thought: 'This is happening to me.' You feel at the effect of the situation.", shift: "Where do I actually have a choice right now?", recommendation: "Re-engage agency." },
      2: { title: "State 2: The Defender", type: "High-Friction", desc: "Core Thought: 'I have to protect my position.' High energy, but fueled by conflict.", shift: "How can I hold my ground without making anyone else wrong?", recommendation: "Shift from defense to construction." },
      3: { title: "State 3: The Manager", type: "Flow", desc: "Core Thought: 'I can push through this.' You are coping well, but may be tolerating things.", shift: "What is the emotion I am explaining away?", recommendation: "Move from coping to feeling." },
      4: { title: "State 4: The Giver", type: "Flow", desc: "Core Thought: 'Everyone else comes first.' Driven by compassion and service.", shift: "If I said No to them, what would I be saying Yes to for myself?", recommendation: "Balance service with self-preservation." },
      5: { title: "State 5: The Builder", type: "Flow", desc: "Core Thought: 'There is something useful here.' You see problems as opportunities.", shift: "What is the gift in this challenge?", recommendation: "Lock in this perspective." },
      6: { title: "State 6: The Architect", type: "Flow", desc: "Core Thought: 'I can design a better outcome for everyone.' Connected to intuition and purpose.", shift: "What does my intuition know that my logic hasn't caught up to?", recommendation: "Create from this space." },
    };
    return levels[level] || levels[3];
  };


  if (result) {
    const data = getResultText(result);
    const isDraining = data.type === "High-Friction";
    return (
      <div className="h-full flex flex-col justify-center animate-enter text-center overflow-y-auto hide-scrollbar">
        <div className="py-10">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] border-2 ${isDraining ? 'bg-red-500/20 border-red-500' : 'bg-teal-500/20 border-teal-500'}`}>
            {isDraining ? <AlertTriangle size={40} className="text-red-400" /> : <Zap size={40} className="text-teal-400" />}
          </div>
          <p className="font-sans text-[11px] uppercase tracking-widest text-white/60 mb-2">LiveAdaptiv Energy Profile</p>
          <h2 className="font-serif text-3xl text-white italic mb-2">{data.title}</h2>
          <div className="flex items-center justify-center gap-2 mb-6"><p className="font-sans text-[11px] text-white/60 uppercase tracking-widest border border-white/10 inline-block px-3 py-1 rounded-full">{data.type} Energy</p></div>
          <p className="font-sans text-base text-white/70 mb-10 leading-relaxed max-w-xs mx-auto">{data.desc}</p>
          <div className="bg-white/5 rounded-xl p-6 mb-8 text-left border border-white/10">
            <h4 className="font-serif text-white italic mb-2 text-base flex items-center justify-center gap-2"><Info size={14} /> Shift Tactic</h4>
            <p className="font-sans text-[11px] uppercase tracking-widest text-white/50 mb-4 text-center">{data.recommendation}</p>
            <p className="font-serif text-lg text-teal-200 italic text-center">"{data.shift}"</p>
          </div>
          <button onClick={() => setView('dashboard')} className="mt-6 text-xs text-white/40 hover:text-white uppercase tracking-widest">Return to Horizon</button>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col">
      <Nav title="Energy Lens" subtitle={`Question ${step + 1} / 6`} onBack={onBack} soundEnabled={false} toggleSound={() => {}} progress={((step + 1) / 6) * 100} />
      <div className="flex-1 min-h-0 flex flex-col justify-start items-center text-center overflow-y-auto hide-scrollbar pb-8 animate-enter pt-6">
        <h2 className="font-serif text-2xl text-white italic mb-8 text-center">{questions[step].q}</h2>
        <div className="grid gap-3 w-full shrink-0">
          {questions[step].options.map((opt, i) => (
            <button key={i} onClick={() => setSelected(opt.val)} className={`p-5 rounded-2xl border text-left transition-all font-sans text-base leading-relaxed ${selected === opt.val ? 'bg-indigo-500/20 border-indigo-400 text-indigo-100' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}>{opt.text}</button>
          ))}
        </div>
        <button onClick={confirmAnswer} disabled={selected === null} className="w-full mt-8 py-4 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-0 disabled:translate-y-2 shrink-0">Next</button>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// CHECKOUT GATE (PAYWALL)
// ─────────────────────────────────────────────
const CheckoutGate: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="h-full flex flex-col overflow-y-auto hide-scrollbar">
    <div className="shrink-0 pt-1 pb-2">
      <button aria-label="Go back" onClick={onBack} className="p-2 rounded-full glass-button text-white/70 hover:text-white transition-colors">
        <ChevronLeft size={20} />
      </button>
    </div>
    <div className="flex-1 flex flex-col justify-center text-center py-6">
      <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border border-teal-500/30 bg-teal-500/10 shrink-0">
        <Lock size={32} className="text-teal-400" />
      </div>
      <p className="font-sans text-[11px] uppercase tracking-widest text-white/60 mb-2">The Baseline is Set</p>
      <h2 className="font-serif text-3xl text-white italic mb-6">Sustained Architecture</h2>
      <p className="font-sans text-base text-white/70 mb-10 leading-relaxed max-w-sm mx-auto">
        You have run the initial protocol and metabolized your friction. Sustained performance requires sustained architecture. Continue your daily practice in the app, or go deeper with a focused protocol.
      </p>


      <div className="space-y-4">
        <a href="https://billing.liveadaptiv.com/checkout/buy/db8aa0f8-12f1-4024-950f-d016d0e35373" target="_blank" rel="noopener noreferrer" className="block w-full py-4 rounded-xl border border-teal-500/50 bg-teal-500/20 text-teal-200 font-sans text-[11px] tracking-widest uppercase transition-all hover:bg-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
          Continue in the App — Monthly Access
        </a>
        <a href="https://billing.liveadaptiv.com/checkout/buy/670a3228-4463-41a4-8520-54bddffcf5d1" target="_blank" rel="noopener noreferrer" className="block w-full py-4 rounded-xl border border-white/20 bg-white/5 text-white/80 font-sans text-[11px] tracking-widest uppercase transition-all hover:bg-white/10 hover:text-white">
          Go Deeper: Alchemist Field Guide — $97
        </a>
        <a href="https://billing.liveadaptiv.com/checkout/buy/d29e3b81-78a4-4611-83f8-11fe76d9d82e" target="_blank" rel="noopener noreferrer" className="block w-full py-4 rounded-xl border border-white/20 bg-white/5 text-white/80 font-sans text-[11px] tracking-widest uppercase transition-all hover:bg-white/10 hover:text-white">
          Stress Transformation Guide — $47
        </a>
      </div>


      <button onClick={onBack} className="mt-8 text-[11px] text-white/40 hover:text-white uppercase tracking-widest">
        Back to my sessions
      </button>
    </div>
  </div>
);


// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
const App = () => {
  const [userName, setUserNameState] = useState(() => storageGet<string>(STORAGE_KEYS.USER_NAME, ''));
  const [sessionCount, setSessionCount] = useState(() => storageGet<number>(STORAGE_KEYS.SESSION_COUNT, 0));
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>(() => storageGet<SessionRecord[]>(STORAGE_KEYS.SESSION_HISTORY, []));
  const [hasCompletedFreeCycle, setHasCompletedFreeCycle] = useState(() => storageGet<boolean>(STORAGE_KEYS.FREE_CYCLE, false));


  const setUserName = (n: string) => { setUserNameState(n); storageSet(STORAGE_KEYS.USER_NAME, n); };


  const [viewState, setViewState] = useState(userName ? 'dashboard' : 'welcome');


  // ── FIX 5: real navigation history, so Back returns where you actually were ──
  const [navHistory, setNavHistory] = useState<string[]>([]);


  const setView = (v: string) => {
    if (v === viewState) return;
    setNavHistory(h => [...h, viewState].slice(-25));
    setViewState(v);
  };


  const goBack = () => {
    if (navHistory.length === 0) { setViewState('dashboard'); return; }
    const prev = navHistory[navHistory.length - 1];
    setNavHistory(h => h.slice(0, -1));
    setViewState(prev);
  };


  const [crisisMessage, setCrisisMessage] = useState('');

  // Everything that belongs to ONE cycle. Identity, streak, history and
  // entitlement survive; the working answers do not. Without this, a second
  // cycle inherits the first one's fear, sensation, belief and goal.
  const clearCycleState = () => {
    setStressor(''); setPerception(''); setFear(''); setDistortionType(null);
    setSomaticZones([]); setFrictionSource('body');
    setPartsStep('experience'); setSensation(''); setProtection('');
    setNeeded(''); setResourceMemory('');
    setExpandingBelief('');
    setGoal({ what: '', measure: '', when: '', outcome: '', action: '' });
    setGoalStep(0); setIsLocked(false); setIsBurnoutPath(false);
    setEnergyAnalysis(null);
    setStressLevel(5); setEnergyLevel(5);
    setPostStressLevel(5); setPostEnergyLevel(5);
    setPressure(50); setAbility(50);
    setHorizon({ ...INITIAL_HORIZON });
    setCrisisMessage('');
  };

  // "Return to Orbit" ends the cycle. It used to land on whatever Horizon
  // step was left over — usually the body/mind chooser — instead of a
  // clean start or the paywall.
  const goHome = () => {
    clearCycleState();
    setNavHistory([]);
    setViewState(hasCompletedFreeCycle ? 'checkout' : 'dashboard');
  };

  // ── CRISIS ──
  // Any endpoint may return { crisis: true }. When it does we stop the
  // session flow entirely rather than degrading to generated content.
  const raiseCrisis = (message: string) => {
    setCrisisMessage(message || 'Please reach out to someone who can help. In the US, call or text 988 any time.');
    setNavHistory(h => [...h, viewState].slice(-25));
    setViewState('crisis');
  };


  const [bgState, setBgState] = useState('neutral');
  const [stressor, setStressor] = useState('');
  const [perception, setPerception] = useState('');
  const [fear, setFear] = useState('');
  const [distortionType, setDistortionType] = useState<'fact' | 'assumption' | null>(null);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [postStressLevel, setPostStressLevel] = useState(5);
  const [postEnergyLevel, setPostEnergyLevel] = useState(5);
  const [isBurnoutPath, setIsBurnoutPath] = useState(false);
  const [somaticZones, setSomaticZones] = useState<string[]>([]);


  // ── Global Friction Source State ──
  const [frictionSource, setFrictionSource] = useState('body');


  // ── FIX 9: Horizon conversation state lives here so back is lossless ──
  const [horizon, setHorizon] = useState<HorizonState>(INITIAL_HORIZON);
  const patchHorizon = (p: HorizonPatch) =>
    setHorizon(h => ({ ...h, ...(typeof p === 'function' ? p(h) : p) }));


  const [partsStep, setPartsStep] = useState('experience');
  const [sensation, setSensation] = useState('');
  const [protection, setProtection] = useState('');
  const [needed, setNeeded] = useState('');
  const [resourceMemory, setResourceMemory] = useState('');
  const [expandingBelief, setExpandingBelief] = useState('');
  const [pressure, setPressure] = useState(50);
  const [ability, setAbility] = useState(50);
  const [goal, setGoal] = useState<Goal>({ what: '', measure: '', when: '', outcome: '', action: '' });
  const [goalStep, setGoalStep] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundType, setSoundType] = useState<'drone' | 'brown'>('drone');
  const [energyAnalysis, setEnergyAnalysis] = useState<EnergyAnalysis | null>(null);
  const [alchemyType, setAlchemyType] = useState('perform');


  useEffect(() => {
    if (viewState === 'preservation') setBgState('preservation');
    else if (viewState === 'laser') setBgState('laser');
    else if (viewState === 'regulate') setBgState('flow');
    else setBgState('neutral');
  }, [viewState]);


  useEffect(() => { if (soundEnabled) soundEngine.play(soundType); }, [soundType]);


  const toggleSound = () => {
    if (soundEnabled) { soundEngine.stop(); setSoundEnabled(false); }
    else { soundEngine.play(soundType); setSoundEnabled(true); }
  };


  const saveSession = (record: SessionRecord) => {
    const updated = appendSession(record);
    setSessionHistory(updated);
    const newCount = sessionCount + 1;
    setSessionCount(newCount);
    storageSet(STORAGE_KEYS.SESSION_COUNT, newCount);
  };


  const updateLatestSession = (patch: Partial<SessionRecord>) => {
    setSessionHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [{ ...prev[0], ...patch }, ...prev.slice(1)];
      storageSet(STORAGE_KEYS.SESSION_HISTORY, updated);
      return updated;
    });
  };


  const completeSession = () => {};


  const resetApp = () => {
    clearCycleState();
    setNavHistory([]);
    setViewState(hasCompletedFreeCycle ? 'checkout' : 'welcome');
  };


  const common: CommonProps = { setView, toggleSound, soundEnabled, raiseCrisis };


  return (
    <>
      <FontStyles />
      <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden flex justify-center">
        <Atmosphere bgState={bgState} />
        {/* FIX 4: one source of horizontal padding, plus notch / home-bar insets */}
        <div className="w-full max-w-md h-full relative z-10 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">


          {viewState === 'welcome' && <Welcome onEnter={() => setView('manifesto')} />}
          {viewState === 'manifesto' && <Manifesto onContinue={() => setView('profile')} onBack={goBack} />}
          {viewState === 'profile' && <Identity userName={userName} setUserName={setUserName} onComplete={() => setView('dashboard')} onBack={goBack} />}


          {viewState === 'dashboard' && (
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
              setFrictionSource={setFrictionSource}
              setSomaticZones={setSomaticZones}
              hasCompletedFreeCycle={hasCompletedFreeCycle}
              horizon={horizon} patchHorizon={patchHorizon}
              onBack={goBack}
            />
          )}


          {viewState === 'energy_reflection' && <EnergyReflection {...common} energyAnalysis={energyAnalysis} frictionSource={frictionSource} onBack={goBack} />}
          {viewState === 'diffuser' && <Diffuser {...common} fear={fear} setFear={setFear} setDistortionType={setDistortionType} onBack={goBack} />}


          {viewState === 'partswork' && (
            <PartsWork {...common}
              selectedPart={somaticZones[0] || 'Part'}
              sensation={sensation} setSensation={setSensation}
              protection={protection} setProtection={setProtection}
              fear={fear} setFear={setFear}
              expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief}
              partsStep={partsStep} setPartsStep={setPartsStep}
              needed={needed} setNeeded={setNeeded}
              resourceMemory={resourceMemory} setResourceMemory={setResourceMemory}
              onBack={goBack}
            />
          )}


          {viewState === 'laser' && (
            <LaserCoaching {...common}
              stressor={stressor} perception={perception}
              somatic={[somaticZones[0], sensation && `sensation: ${sensation}`, needed && `the part needs: ${needed}`, resourceMemory && `their resource: ${resourceMemory}`].filter(Boolean).join('. ') || 'Mental Loops / Cognitive Fog'}
              fear={fear} distortionType={distortionType}
              setGoal={setGoal} setExpandingBelief={setExpandingBelief}
              energyLevel={energyLevel} stressLevel={stressLevel}
              onBack={goBack}
            />
          )}


          {viewState === 'lens' && <Perspective {...common} pressure={pressure} setPressure={setPressure} ability={ability} setAbility={setAbility} onBack={goBack} />}
          {viewState === 'fork' && <Crossroads {...common} stressLevel={stressLevel} energyLevel={energyLevel} onBack={goBack} />}


          {viewState === 'regulate' && (
            <Breath {...common}
              breathing={breathing} setBreathing={setBreathing}
              breathCount={breathCount} setBreathCount={setBreathCount}
              onBack={goBack}
            />
          )}


          {viewState === 'insight' && <Insight {...common} expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief} onBack={goBack} />}
          {viewState === 'alchemy' && <Alchemy {...common} setAlchemyType={setAlchemyType} onBack={goBack} />}


          {viewState === 'integration' && (
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
              updateLatestSession={updateLatestSession}
              setHasCompletedFreeCycle={setHasCompletedFreeCycle}
              goHome={goHome}
              raiseCrisis={raiseCrisis}
              onBack={goBack}
            />
          )}


          {viewState === 'preservation' && (
            <Preservation {...common}
              setGoal={setGoal} setExpandingBelief={setExpandingBelief}
              setViewToIntegration={() => { setIsLocked(true); setView('integration'); }}
              onBack={goBack}
            />
          )}


          {viewState === 'burnout_check' && <VitalityScan {...common} setBurnoutPath={setIsBurnoutPath} onBack={goBack} />}
          {viewState === 'energy' && <EnergyAnalyzer setView={setView} onBack={goBack} />}
          {viewState === 'checkout' && <CheckoutGate onBack={goHome} />}
          {viewState === 'crisis' && <Crisis message={crisisMessage} onBack={goBack} />}


        </div>
      </div>
    </>
  );
};


export default App;
