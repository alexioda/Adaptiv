import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Wind, Zap, Heart, BookOpen, 
  ArrowRight, Check, Calendar, Facebook, 
  User, Lock, PlayCircle, Target, Battery, 
  Waves, Volume2, VolumeX, ChevronRight, ChevronLeft, X, AlertCircle, Copy, LogOut, BarChart, RefreshCw,
  Brain, Eye, MessageCircle, Shield, Sun, Flame, Anchor, Hand, Disc, Mountain, Mail,
  MinusCircle, AlertTriangle, Info, FileText, Thermometer, Sparkles, Loader2, WifiOff, Home, BatteryWarning, ExternalLink, HelpCircle,
  Split, CloudFog, Compass, Music
} from 'lucide-react';

// --- TYPES ---
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

interface SomaticZone {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface EnergyAnalysis {
  level: number;
  reflection: string;
}

interface CommonProps {
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
}

interface EnergyReflectionProps extends CommonProps {
  energyAnalysis: EnergyAnalysis | null;
}

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
}

interface ForkEntryProps extends CommonProps {}

interface DiffuserProps extends CommonProps {
  fear: string;
  setFear: (s: string) => void;
}

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

interface CrossroadsProps extends CommonProps {
  stressLevel: number;
  energyLevel: number;
}

interface BreathProps extends CommonProps {
  breathing: boolean;
  setBreathing: (b: boolean) => void;
  breathCount: number;
  setBreathCount: React.Dispatch<React.SetStateAction<number>>;
}

interface InsightProps extends CommonProps {
  expandingBelief: string;
  setExpandingBelief: (s: string) => void;
}

interface AlchemyProps extends CommonProps {}

interface PrimingProps {
  onComplete: () => void;
}

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
}

interface PreservationProps extends CommonProps {
  setGoal: (g: any) => void;
  setExpandingBelief: (s: string) => void;
  setViewToIntegration: () => void;
}

interface VitalityScanProps extends CommonProps {
  setBurnoutPath: (b: boolean) => void;
}

interface EnergyAnalyzerProps {
  setView: (view: string) => void;
}

// --- 1. SOUND ENGINE ---
class SoundEngine {
  ctx: AudioContext | null;
  activeNode: OscillatorNode | AudioBufferSourceNode | null;
  gain: GainNode | null;

  constructor() {
    this.ctx = null;
    this.activeNode = null;
    this.gain = null;
  }

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
    if (!this.ctx || !this.gain) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();

    if (this.activeNode) {
      try { this.activeNode.stop(); this.activeNode.disconnect(); } catch (e) {}
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
        lastOut = (lastOut + (0.02 * white)) / 1.02;
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

  stop() {
    if (this.gain && this.ctx) {
      this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      setTimeout(() => {
        if (this.activeNode) { try { this.activeNode.stop(); this.activeNode.disconnect(); } catch (e) {} this.activeNode = null; }
      }, 600);
    }
  }
}
const soundEngine = new SoundEngine();

// --- 2. API HELPERS ---
let viteKey = "";
try {
  // @ts-ignore
  viteKey = import.meta.env.VITE_GOOGLE_API_KEY;
} catch (e) {}
const apiKey = viteKey || "";
const aiModel = apiKey ? "gemini-2.5-flash" : "gemini-2.5-flash-preview-09-2025";

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
];

const formatGoalOutcome = (text: string) => {
  if (!text) return "";
  let clean = text.trim();
  clean = clean.replace(/^(My goal is to|My goal is|I would like to|I would|I want to|I will|I am going to|I'd like to)\s+/i, "");
  if (/^To\s/i.test(clean)) return clean;
  clean = clean.charAt(0).toLowerCase() + clean.slice(1);
  return "To " + clean;
};

const getSmartQuestion = (energy: number, stress: number) => {
  if (stress > 60 || energy < 40) return "What specifically is threatened by this situation?";
  if (energy > 70) return "If you were coaching your best self, what would you tell them to do?";
  return "What is one assumption you are making that might not be true?";
};

const analyzeCurrentEnergy = async (stressor: string, perception: string, stressLevel: number, energyLevel: number) => {
  try {
    const prompt = `Act as an expert Energy Leadership Master Practitioner (ELI-MP). Analyze the client's state based on the following:
    Inputs:
    - Situation/Stressor: "${stressor}"
    - Perception/Thoughts: "${perception}"
    - Self-Rated Stress: ${stressLevel}%
    - Self-Rated Energy: ${energyLevel}%

    Task:
    1. Identify the likely Energy Level (1-7) dominating this specific situation (Catabolic vs Anabolic).
    2. Write a "Reflection": A compassionate, direct, 2-sentence mirror statement to the client about how they are likely viewing this.
    Constraints for Reflection:
    - Use "You" statements.
    - NO ELI jargon (Do NOT use words like "Level 1", "Catabolic", "Anabolic", "Victim", "Conflict").
    - Focus on the *feeling* and the *perspective* (e.g., "You are feeling cornered...", "You are carrying the weight of...", "You are seeing this as a battle...").
    - Be empathetic but truthful.
    Return ONLY a raw JSON object: { "level": number, "reflection": "string" }. Do not use markdown formatting.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
        safetySettings
      })
    });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    const isCatabolic = stressLevel > 60 || energyLevel < 40;
    return {
      level: isCatabolic ? 2 : 3,
      reflection: isCatabolic
        ? "You are feeling the weight of this situation and perhaps a need to protect yourself from a negative outcome."
        : "You are coping with this situation logically, but may be tolerating more than you realize."
    };
  }
};

const generateCoachingQuestions = async (stressor: string, perception: string, somatic: string, energyLevel: number, stressLevel: number): Promise<string[]> => {
  try {
    const prompt = `Act as a world-class transformational coach and master of energy dynamics. Your goal is to elevate the client's perspective, shifting them gracefully from contraction/fear into expansion/opportunity, without using any technical coaching or "Energy Leadership" jargon.
    Context:
    - Situation: ${stressor}
    - Experience: ${perception}
    - Body sensation: ${somatic}
    - Energy Level: ${energyLevel}%
    - Stress Level: ${stressLevel}%
    Return ONLY a raw JSON object with a key "questions" containing an array of exactly 4 strings. The questions must be short, powerful, and follow this transformational arc:
    1. The Mirror: A question that gently exposes the hidden assumption, story, or blind spot in their current perspective.
    2. The Pivot: A question that invites them to view this exact situation from a higher, more empowering vantage point.
    3. The Vision: If they embody this new perspective, what desired feeling, outcome, or state of being becomes possible?
    4. The Catalyst: What is one bold, aligned step they can take right now to anchor this new energy?
    Do not use markdown formatting. Return raw JSON.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
        safetySettings
      })
    });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json|```/g, '').trim();
    return JSON.parse(text).questions;
  } catch (error) {
    return [getSmartQuestion(energyLevel, stressLevel)];
  }
};

const generateManifesto = async (stressor: string, truth: string, action: string, fear: string, currentLevel: number, onUpdate: (text: string) => void) => {
  try {
    const prompt = `Act as a wise, grounded high-performance coach. Write a powerful "Alchemist Decree" for your client.
    Inputs:
    - Stressor: "${stressor}"
    - Hidden Fear: "${fear}"
    - New Truth: "${truth}"
    - Commitment Action: "${action}"
    Guidelines:
    - First person ("I").
    - Acknowledge the challenge but explicitly choose the higher power/truth.
    - Use empowering, resonant, universal language.
    - Keep it under 50 words.
    - CRITICAL: Do NOT use technical jargon.
    - Output ONLY the text.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings
      })
    });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text.trim();
    onUpdate(text);
    return { isOffline: false };
  } catch (error) {
    const fallbackText = `I observe the heavy energy of "${stressor}" and the quiet fear that ${fear || 'I am not enough'}. I honor it, but I do not reside there. I choose to shift. Standing in the truth that ${truth}, I reclaim my power. My action is my seal: ${action}.`;
    onUpdate(fallbackText);
    return { isOffline: true };
  }
};

const generateEnergyInsight = async (level: number, type: string) => {
  try {
    const prompt = `Provide a single, profound, 1-sentence insight about personal energy and leadership for someone experiencing '${type}'. Tone: Mystical, grounded, empowering. Do NOT use technical terms like 'Level ${level}'.`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings
      })
    });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    return "Your energy is your currency. How you spend it determines your reality.";
  }
};

// --- SHARED STYLES ---
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@200;300;400;500&display=swap');
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans { font-family: 'Inter', sans-serif; }
    .glass-panel { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
    .glass-button { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .glass-button:active { transform: scale(0.98); }
    .animate-breathe { animation: breathe 8s ease-in-out infinite; }
    @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }
    .ripple-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); animation: ripple 4s linear infinite; }
    @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2); opacity: 0; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-enter { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .glow-pulse { animation: glowPulse 3s infinite; }
    @keyframes glowPulse { 0% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); border-color: rgba(20, 184, 166, 0.6); } 50% { box-shadow: 0 0 20px 0 rgba(20, 184, 166, 0.2); border-color: rgba(20, 184, 166, 1); } 100% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); border-color: rgba(20, 184, 166, 0.6); } }
    
    /* CUSTOM RANGE SLIDERS FOR DARK MODE */
    input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; background: #14b8a6; cursor: pointer; margin-top: -8px; box-shadow: 0 0 10px rgba(20,184,166,0.5); }
    input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: rgba(255,255,255,0.2); border-radius: 2px; }
    input[type=range]:focus { outline: none; }
    input[type=range].slider-amber::-webkit-slider-thumb { background: #f59e0b; box-shadow: 0 0 10px rgba(245,158,11,0.5); }
    input[type=range].slider-indigo::-webkit-slider-thumb { background: #6366f1; box-shadow: 0 0 10px rgba(99,102,241,0.5); }
  `}</style>
);

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
            <Sparkles size={10} />
            <span className="text-[8px] font-bold uppercase tracking-wider">AI Active</span>
          </div>
        )}
        {!isDashboard && (
          <button onClick={toggleSound} className={`p-3 rounded-full glass-button transition-all ${soundEnabled ? 'text-teal-200 bg-teal-500/10' : 'text-white/40'}`}>
            {soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
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
        <div className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
      </div>
    ) : null}
  </div>
);

const Atmosphere: React.FC<{ bgState: string }> = ({ bgState }) => {
  const themes: Record<string, string> = {
    neutral: "from-[#0f172a] via-[#1e1b4b] to-[#0f172a]",
    friction: "from-[#2a0a12] via-[#1a0505] to-[#2a0a12]",
    flow: "from-[#042f2e] via-[#022c22] to-[#042f2e]",
    preservation: "from-[#1c1917] via-[#292524] to-[#0c0a09]",
    laser: "from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]"
  };
  return (
    <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-[3000ms] ${themes[bgState] || themes.neutral}`}>
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
    </div>
  );
};

// --- COMPONENTS ---

const Welcome: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <div className="h-full flex flex-col justify-center items-center px-6 text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <div className="min-h-full flex flex-col justify-center items-center py-10">
      <div className="flex-1"></div>
      <div className="flex flex-col items-center">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full"></div>
          <Activity size={64} className="text-teal-200/80 relative z-10 animate-breathe" strokeWidth={0.8} />
        </div>
        <h1 className="font-serif text-5xl text-white italic tracking-wide leading-tight animate-enter">Adaptiv</h1>
        <p className="font-sans text-xs text-white/50 uppercase tracking-[0.3em] animate-enter delay-100 mt-4">Alchemy for the Soul</p>
        <button onClick={onEnter} className="mt-12 px-8 py-4 rounded-full bg-white/10 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/20 hover:scale-105 transition-all animate-enter delay-300 border border-white/5">Enter the Space</button>
      </div>
      <div className="flex-1"></div>
      <div className="mt-8 flex flex-col items-center opacity-60 shrink-0">
        <p className="font-sans text-[8px] text-white/30 uppercase tracking-widest mb-2">Powered By</p>
        <p className="font-serif italic text-white/80 text-xs">LiveAdaptiv</p>
      </div>
    </div>
  </div>
);

const Manifesto: React.FC<{ onContinue: () => void }> = ({ onContinue }) => (
  <div className="h-full flex flex-col justify-center animate-enter px-6 overflow-y-auto hide-scrollbar text-center">
    <div className="max-w-md mx-auto py-10">
      <div className="mb-10">
        <Waves size={48} className="text-teal-400/80 mx-auto mb-6 animate-pulse" strokeWidth={0.8} />
        <h1 className="font-serif text-3xl text-white italic mb-3">Alchemy.</h1>
        <p className="font-sans text-xs text-white/40 uppercase tracking-[0.2em] leading-relaxed">
          A Kinetic Shift for the Modern Mind
        </p>
      </div>
      <div className="space-y-8 font-serif text-lg text-white/80 leading-relaxed">
        <p>Stress is not an error. It is simply energy trapped in a loop.</p>
        <p>Most tools ask you to <em>think</em> your way out. Adaptiv asks you to <em>feel</em> your way through.</p>
        <p className="text-white">In the next few minutes, we will locate the friction in the body, listen to its message, and shift it into fuel.</p>
      </div>
      <div className="my-12 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <button onClick={onContinue} className="w-full py-5 rounded-full bg-white/5 border border-white/10 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/30 transition-all">Begin</button>
    </div>
  </div>
);

const Identity: React.FC<{ userName: string; setUserName: (n: string) => void; onComplete: () => void }> = ({ userName, setUserName, onComplete }) => (
  <div className="h-full flex flex-col px-6 text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <div className="min-h-full flex flex-col items-center py-10 w-full">
      <div className="flex-1"></div>
      <div className="w-full max-w-xs flex flex-col items-center">
        <h1 className="font-serif text-4xl text-white mb-2 italic tracking-wide">Adaptiv</h1>
        <div className="w-full space-y-6 mt-12">
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && userName && onComplete()} placeholder="Enter Name / Alias" className="w-full bg-transparent border-b border-white/20 py-3 text-center text-white text-xl font-serif placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-colors" />
          <button onClick={onComplete} disabled={!userName} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs font-medium tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Begin</button>
        </div>
      </div>
      <div className="flex-1"></div>
    </div>
  </div>
);

const EnergyReflection: React.FC<EnergyReflectionProps> = ({ energyAnalysis, setView, toggleSound, soundEnabled }) => {
  return (
    <div className="h-full flex flex-col justify-center px-4 animate-enter">
      <Nav title="Current Resonance" subtitle="The Lens" isDashboard={false} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={5} />
      <div className="flex-1 flex flex-col justify-center items-center text-center pb-12 overflow-y-auto hide-scrollbar">
        <div className="mb-8 p-6 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Compass size={48} className="text-indigo-300" />
        </div>
        <h3 className="font-serif text-2xl text-white italic mb-6">"Here is what I sense..."</h3>
        <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 mb-8 max-w-sm">
          <p className="font-serif text-lg text-white/90 italic leading-relaxed">
            "{energyAnalysis?.reflection || "Connecting to your field..."}"
          </p>
        </div>
        <p className="font-sans text-xs text-white/40 max-w-xs leading-relaxed mb-10">
          This is your current energetic baseline. We will now shift this frequency.
        </p>
        <button onClick={() => setView('fork_entry')} className="w-full py-5 rounded-full bg-indigo-500 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-indigo-400 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all">
          Shift This Energy
        </button>
      </div>
    </div>
  );
};

const Horizon: React.FC<HorizonProps> = ({ userName, sessionCount, stressor, setStressor, perception, setPerception, stressLevel, setStressLevel, energyLevel, setEnergyLevel, isBurnout, setView, toggleSound, soundEnabled, resetApp, setEnergyAnalysis, soundType, setSoundType }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const triggers = ['work', 'job', 'boss', 'career', 'team', 'project', 'deadline', 'email', 'monday', 'shift', 'burnout', 'tired', 'exhausted', 'drained', 'overwhelm', 'client'];
  const showWorkCheck = triggers.some(t => stressor.toLowerCase().includes(t));
  const isHighFriction = stressLevel > 75 && energyLevel < 35;

  const handleBeginAlchemy = async () => {
    setAnalyzing(true);
    const analysis = await analyzeCurrentEnergy(stressor, perception, stressLevel, energyLevel);
    setEnergyAnalysis(analysis);
    setAnalyzing(false);
    setView('energy_reflection');
  };

  return (
    <div className="h-full flex flex-col">
      <Nav title={`Hello, ${userName || 'Traveler'}`} subtitle={`Session ${sessionCount + 1}`} isDashboard={true} resetApp={resetApp} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={0} aiActive={analyzing} />
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto hide-scrollbar animate-enter pb-8">
        
        {/* 7-Day Neural Reset */}
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
            <div className="absolute top-3 left-3 right-3 h-[1px] bg-white/5 -z-10"></div>
          </div>
        </div>

        {/* INTERNAL WEATHER - UPGRADED TO SLIDERS */}
        <div className="glass-panel p-6 rounded-[24px] border-white/10">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-serif text-xl text-white/90 italic">Internal Weather</h3>
            {isBurnout && <AlertCircle size={18} className="text-orange-400/80 animate-pulse"/>}
          </div>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-2">
                <p className="font-sans text-[10px] tracking-widest text-white/50 uppercase">Mental Energy</p>
                <div className="text-2xl font-serif italic text-indigo-400">{energyLevel}%</div>
              </div>
              <input type="range" min="1" max="100" value={energyLevel} onChange={(e) => setEnergyLevel(parseInt(e.target.value))} className="w-full slider-indigo" />
              <div className="flex justify-between text-[9px] uppercase font-bold text-white/30 mt-1">
                <span>Drained</span>
                <span>Optimized</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end mb-2">
                <p className="font-sans text-[10px] tracking-widest text-white/50 uppercase">Pressure / Friction</p>
                <div className="text-2xl font-serif italic text-amber-400">{stressLevel}%</div>
              </div>
              <input type="range" min="1" max="100" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full slider-amber" />
              <div className="flex justify-between text-[9px] uppercase font-bold text-white/30 mt-1">
                <span>Flow</span>
                <span>Overload</span>
              </div>
            </div>

            {/* SOUND SELECTION */}
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Music size={14} className="text-white/50"/>
                <span className="font-sans text-[10px] tracking-widest text-white/50 uppercase">Ambience</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSoundType('drone')} className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest transition-all border ${soundType === 'drone' ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}>Drone</button>
                <button onClick={() => setSoundType('brown')} className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest transition-all border ${soundType === 'brown' ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}>Brown Noise</button>
              </div>
            </div>

            {/* ELI ASSESSMENT ENTRY POINT */}
            <div className="pt-4 border-t border-white/5">
              <button onClick={() => setView('energy')} className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300"><Zap size={16} /></div>
                  <div className="text-left">
                    <span className="block font-serif text-sm text-white italic">Deep Energy Lens</span>
                    <span className="block text-[9px] text-white/50 uppercase tracking-wider">Access ELI Assessment</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {isBurnout ? (
          <div className="animate-enter delay-100 p-4 rounded-2xl bg-orange-900/10 border border-orange-500/30">
            <p className="font-serif text-xl text-orange-200 text-center italic mb-2">System Alert: Depletion</p>
            <button onClick={() => setView('preservation')} className="w-full py-4 rounded-full bg-gradient-to-r from-orange-900/60 to-amber-900/60 border border-orange-500/30 text-orange-100 font-sans text-xs tracking-widest uppercase hover:border-orange-500/50 transition-all shadow-lg shadow-orange-900/20">Enter Preservation</button>
          </div>
        ) : (
          <div className="space-y-4 animate-enter delay-100">
            <div className="relative space-y-3">
              <input type="text" value={stressor} onChange={(e) => setStressor(e.target.value)} placeholder="What weighs on you?" className="w-full glass-panel p-5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:bg-white/5 transition-all font-serif text-lg italic text-center"/>
              <input type="text" value={perception} onChange={(e) => setPerception(e.target.value)} placeholder="How are you experiencing this? (Thoughts/Feelings)" className="w-full glass-panel p-4 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:bg-white/5 transition-all font-sans text-sm text-center"/>
            </div>
            
            {(showWorkCheck || isHighFriction) ? (
              <div className="animate-enter mb-2 space-y-3">
                <button onClick={() => setView('burnout_check')} className="w-full py-4 rounded-xl bg-orange-500/20 text-orange-200 border border-orange-500/50 flex flex-col items-center justify-center gap-1 hover:bg-orange-500/30 transition-all">
                  <span className="font-sans text-xs font-bold tracking-widest uppercase">High Friction Detected</span>
                  <span className="text-[10px] opacity-70">Run Vitality Scan</span>
                </button>
                <button onClick={handleBeginAlchemy} disabled={!stressor || analyzing} className="w-full py-4 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all font-sans text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                  {analyzing ? <Loader2 className="animate-spin" size={14} /> : "Continue to Alchemy"}
                </button>
              </div>
            ) : (
              <button onClick={handleBeginAlchemy} disabled={!stressor || analyzing} className="w-full py-5 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:shadow-none mt-2 flex items-center justify-center gap-2">
                {analyzing ? <Loader2 className="animate-spin" size={16} /> : "Begin Alchemy"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ForkEntry: React.FC<ForkEntryProps> = ({ setView, toggleSound, soundEnabled }) => (
  <div className="h-full flex flex-col px-4">
    <Nav title="The Source" subtitle="Origin Point" onBack={() => setView('dashboard')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={10} />
    <div className="flex-1 flex flex-col justify-center gap-6 animate-enter overflow-y-auto hide-scrollbar pb-4">
      <div className="text-center mb-4">
        <h2 className="font-serif text-2xl text-white italic mb-2">Where is the friction loudest?</h2>
        <p className="text-xs text-white/50">Stress has two addresses. Choose the one calling for attention.</p>
      </div>
      <button onClick={() => setView('somatic')} className="p-6 rounded-[24px] glass-panel group text-left hover:bg-white/5 transition-all border border-transparent hover:border-teal-500/30">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-full bg-teal-500/10 text-teal-300 group-hover:scale-110 transition-transform"><Activity size={24} /></div>
          <div>
            <h3 className="font-serif text-xl text-white italic">The Body</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Heaviness & Tension</p>
          </div>
        </div>
        <p className="text-xs text-white/60 leading-relaxed pl-[60px]">Tightness in chest, knot in gut, heavy shoulders, exhaustion.</p>
      </button>
      <button onClick={() => setView('diffuser')} className="p-6 rounded-[24px] glass-panel group text-left hover:bg-white/5 transition-all border border-transparent hover:border-indigo-500/30">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-300 group-hover:scale-110 transition-transform"><CloudFog size={24} /></div>
          <div>
            <h3 className="font-serif text-xl text-white italic">The Mind</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Racing Thoughts & Loops</p>
          </div>
        </div>
        <p className="text-xs text-white/60 leading-relaxed pl-[60px]">Mental fog, analyzing, planning, replaying scenarios.</p>
      </button>
    </div>
  </div>
);

const Diffuser: React.FC<DiffuserProps> = ({ fear, setFear, setView, toggleSound, soundEnabled }) => {
  const [step, setStep] = useState(0);
  return (
    <div className="h-full flex flex-col">
      <Nav title="The Filter" subtitle="Fact vs. Fiction" onBack={() => setView('fork_entry')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={25} />
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

const Vessel: React.FC<VesselProps> = ({ somaticZones, setSomaticZones, setView, toggleSound, soundEnabled }) => {
  const zones: SomaticZone[] = [
    { id: 'Head', label: 'Head', icon: Brain }, { id: 'Eyes', label: 'Eyes', icon: Eye },
    { id: 'Throat', label: 'Throat', icon: MessageCircle }, { id: 'Chest', label: 'Chest', icon: Shield },
    { id: 'Solar', label: 'Solar Plexus', icon: Sun }, { id: 'Gut', label: 'Gut', icon: Disc },
    { id: 'Back', label: 'Back', icon: Anchor }, { id: 'Hands', label: 'Hands', icon: Hand },
  ];
  return (
    <div className="h-full flex flex-col">
      <Nav title="Body Scan" subtitle="Locate the Sensation" onBack={() => setView('fork_entry')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={15} />
      <div className="flex-1 grid grid-cols-2 gap-3 content-start overflow-y-auto hide-scrollbar pb-4 min-h-0 animate-enter delay-100 px-4">
        {zones.map(z => {
          const Icon = z.icon;
          return (
            <button key={z.id} onClick={() => setSomaticZones([z.id])} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${somaticZones.includes(z.id) ? 'bg-slate-800/90 border-white/60' : 'glass-panel hover:bg-white/10'}`}>
              <Icon size={28} className={somaticZones.includes(z.id) ? 'text-white' : 'text-white/40'}/>
              <span className={`font-serif italic ${somaticZones.includes(z.id) ? 'text-white' : 'text-white/90'}`}>{z.label}</span>
            </button>
          )
        })}
      </div>
      <button onClick={() => setView('partswork')} disabled={somaticZones.length === 0} className="mt-4 w-full py-5 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase border border-white/10 hover:bg-white/20 transition-all disabled:opacity-0 disabled:translate-y-4 shrink-0 animate-enter delay-200">Connect with Part</button>
    </div>
  );
};

const PartsWork: React.FC<PartsWorkProps> = ({ selectedPart, sensation, setSensation, protection, setProtection, fear, setFear, expandingBelief, setExpandingBelief, partsStep, setPartsStep, setView, toggleSound, soundEnabled }) => {
  const handleBack = () => {
    if (partsStep === 'experience') setView('somatic');
    else if (partsStep === 'unblend') setPartsStep('experience');
    else if (partsStep === 'connect') setPartsStep('unblend');
    else if (partsStep === 'message') setPartsStep('connect');
    else if (partsStep === 'channel') setPartsStep('message');
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
              {["Tightness", "Heat", "Heaviness", "Buzzing"].map(s => <button key={s} onClick={() => setSensation(s)} className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] text-white/90 hover:bg-white/20 transition-all">{s}</button>)}
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
              {["Prevent Failure", "Keep me Safe", "Control Outcomes"].map(p => <button key={p} onClick={() => setProtection(p)} className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] text-white/90 hover:bg-white/20 transition-all">{p}</button>)}
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
              {["Fuel my boundaries", "Deepen my focus", "Drive my commitment"].map(ex => (
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

// --- UPDATED PERSPECTIVE WITH SLIDERS AND CLINICAL PRIMER ---
const Perspective: React.FC<PerspectiveProps> = ({ pressure, setPressure, ability, setAbility, setView, toggleSound, soundEnabled }) => {
  const flowState = ability >= pressure;
  const deficit = pressure - ability;

  return (
    <div className="h-full flex flex-col">
      <Nav title="The Perspective" subtitle="Calibration" onBack={() => setView('fork_entry')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={50} />
      <div className="flex-1 flex flex-col items-center justify-start pt-4 px-4 overflow-y-auto hide-scrollbar pb-8">
        
        {/* --- CLINICAL PRIMER --- */}
        <div className="text-center mb-8 max-w-sm animate-enter">
            <p className="font-serif text-lg text-white/70 italic leading-relaxed">
                Friction is a mathematical equation. It occurs when external demand exceeds internal bandwidth. Quantify the gap.
            </p>
        </div>

        {/* THE VISUALIZER */}
        <div className={`relative w-48 h-48 rounded-full border border-white/10 flex items-center justify-center transition-all duration-1000 mb-8 animate-enter delay-100 ${flowState ? 'shadow-[0_0_60px_rgba(20,184,166,0.2)] bg-teal-900/10' : 'shadow-[0_0_60px_rgba(244,63,94,0.2)] bg-rose-900/10'}`}>
          <div className="text-center relative z-10 px-2">
            <h2 className={`font-serif text-3xl italic mb-1 ${flowState ? 'text-teal-300' : 'text-rose-300'}`}>
              {flowState ? 'Flow State' : 'High Friction'}
            </h2>
            <p className="font-sans text-[10px] tracking-widest uppercase text-white/60">
              {flowState ? 'Capacity exceeds demand.' : `Capacity deficit: -${deficit}%`}
            </p>
          </div>
          <div className={`absolute inset-4 rounded-full border border-dashed opacity-30 ${flowState ? 'border-teal-400 animate-[spin_20s_linear_infinite]' : 'border-rose-400 animate-pulse'}`}></div>
        </div>

        <div className="w-full glass-panel p-6 rounded-[24px] border-white/10 space-y-8 animate-enter delay-200">
          
          {/* PRESSURE SLIDER */}
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="font-sans text-[10px] tracking-widest text-amber-300 uppercase font-bold">Requirement Intensity</p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">External Demand</p>
              </div>
              <div className="text-2xl font-serif italic text-amber-400">{pressure}%</div>
            </div>
            <input type="range" min="1" max="100" value={pressure} onChange={(e) => setPressure(parseInt(e.target.value))} className="w-full slider-amber" />
          </div>

          {/* ABILITY SLIDER */}
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="font-sans text-[10px] tracking-widest text-indigo-300 uppercase font-bold">Internal Capacity</p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Current Bandwidth</p>
              </div>
              <div className="text-2xl font-serif italic text-indigo-400">{ability}%</div>
            </div>
            <input type="range" min="1" max="100" value={ability} onChange={(e) => setAbility(parseInt(e.target.value))} className="w-full slider-indigo" />
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

const Crossroads: React.FC<CrossroadsProps> = ({ setView, toggleSound, soundEnabled, stressLevel, energyLevel }) => {
  const recommendStillness = parseInt(stressLevel.toString()) > 70 && parseInt(energyLevel.toString()) < 40;
  return (
    <div className="h-full flex flex-col justify-center px-6">
      <Nav title="The Crossroads" subtitle="Choice Point" onBack={() => setView('lens')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={65} />
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

const LaserCoaching: React.FC<LaserCoachingProps> = ({ stressor, perception, somatic, setView, toggleSound, soundEnabled, setGoal, setExpandingBelief, energyLevel, stressLevel }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({ topic: '', result: '', permission: '', action: '' });
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (aiQuestions.length === 0) {
      setLoading(true);
      generateCoachingQuestions(
        stressor || "General Stress",
        perception || "Feeling Stuck",
        somatic || "Body",
        energyLevel,
        stressLevel
      ).then(q => {
        setAiQuestions(q);
        setLoading(false);
      });
    }
  }, []);

  const starters: Record<number, string[]> = {
    0: ["My insight is...", "The real issue is...", "I'm realizing that...", "I sense..."],
    1: ["To feel...", "To achieve...", "To experience...", "To become..."],
    2: ["To make a mess.", "To prioritize me.", "To let go.", "To trust myself."],
    3: ["I will call...", "I will write...", "I will stop...", "I will start..."]
  };

  const currentQ = [
    { id: 'topic', label: 'The Insight', q: aiQuestions[0] || "Connecting to the field...", ph: 'My insight is...' },
    { id: 'result', label: 'The Vision', q: aiQuestions[1] || "If this shifted, what state or outcome would you experience?", ph: 'I want to...' },
    { id: 'permission', label: 'Permission', q: aiQuestions[2] || "What permission do you need to give yourself to move forward?", ph: 'I give myself permission to...' },
    { id: 'action', label: 'The Move', q: aiQuestions[3] || "What is the single boldest step that makes everything else easier?", ph: 'I will...' }
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
      <Nav title="Breakthrough Laser" subtitle="Rapid Shift" onBack={() => step > 0 ? setStep(step - 1) : setView('fork')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={80} aiActive={!loading} />
      <div className="flex-1 px-4 pt-4 overflow-y-auto hide-scrollbar">
        <div className="glass-panel p-6 rounded-[32px] mb-4">
          {loading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-teal-400"/></div>
          ) : (
            <div className="animate-enter">
              <span className="font-sans text-[10px] text-white/40 uppercase tracking-widest mb-4 block">{currentQ.label}</span>
              <h3 className="font-serif text-2xl text-white italic mb-8 leading-snug">{currentQ.q}</h3>
              <input autoFocus className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none mb-6 text-lg placeholder:text-white/20" placeholder={currentQ.ph} value={answers[currentQ.id]} onChange={e => setAnswers({...answers, [currentQ.id]: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleNext()} />
              <div className="flex flex-wrap gap-2 mb-6">
                {(starters[step] || []).map(s => (
                  <button key={s} onClick={() => setAnswers({...answers, [currentQ.id]: s})} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] text-white/60 hover:bg-white/10 transition-colors">{s}</button>
                ))}
              </div>
              <div className="flex justify-end"><button onClick={handleNext} disabled={!answers[currentQ.id]} className="px-8 py-3 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-widest uppercase disabled:opacity-50">{step === 3 ? "Lock It In" : "Next"}</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Breath: React.FC<BreathProps> = ({ breathing, setBreathing, breathCount, setBreathCount, setView, toggleSound, soundEnabled }) => {
  const phase = breathCount < 4 ? "Inhale" : breathCount < 8 ? "Hold" : "Exhale";
  let displayCount = 0;
  if (breathCount < 4) displayCount = breathCount + 1; 
  else if (breathCount < 8) displayCount = breathCount - 3; 
  else displayCount = breathCount - 7; 

  useEffect(() => { if (!breathing) return; const i = setInterval(() => setBreathCount((c: number) => (c + 1) % 16), 1000); return () => clearInterval(i); }, [breathing]);

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <Nav title="Regulation" subtitle="Breathe" onBack={() => setView('fork')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto hide-scrollbar pb-4">
        <div className="relative flex items-center justify-center">
          {breathing && <div className="absolute w-64 h-64 rounded-full border border-teal-500/30 ripple-ring"></div>}
          <div className={`w-64 h-64 rounded-full border border-white/10 flex flex-col items-center justify-center transition-all duration-1000 z-10 ${breathing ? 'bg-teal-900/20 shadow-[0_0_50px_rgba(20,184,166,0.2)]' : 'bg-white/5'}`} style={{ transform: `scale(${breathing ? (breathCount < 4 ? 1.5 : 1) : 1})` }}>
            <span className="font-serif text-2xl text-white italic">{breathing ? phase : "Stillness"}</span>
            {breathing && <span className="font-sans text-4xl text-white/50 font-light mt-2">{displayCount}</span>}
          </div>
        </div>
        <div className="h-24"></div>
        <button onClick={() => { setBreathing(!breathing); setBreathCount(0); }} className="px-10 py-4 rounded-full bg-white text-slate-900 font-bold text-xs uppercase mb-4">{breathing ? 'Complete' : 'Begin'}</button>
        {!breathing && <button onClick={() => setView('insight')} className="text-teal-200 text-xs uppercase tracking-widest">Capture Insight</button>}
      </div>
    </div>
  );
};

const Insight: React.FC<InsightProps> = ({ expandingBelief, setExpandingBelief, setView, toggleSound, soundEnabled }) => (
  <div className="h-full flex flex-col justify-center px-6 text-center">
    <Nav title="The Clarity" subtitle="Harvesting" onBack={() => setView('regulate')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
    <div className="flex-1 flex flex-col justify-center overflow-y-auto hide-scrollbar pb-4">
      <h3 className="font-serif text-2xl text-white italic mb-6">"In the stillness, what became clear?"</h3>
      <input autoFocus className="w-full bg-transparent border-b border-white/20 py-4 text-center text-white font-light text-lg focus:outline-none mb-12" placeholder="The truth is..." value={expandingBelief} onChange={e => setExpandingBelief(e.target.value)} onKeyDown={e => e.key === 'Enter' && setView('alchemy')} />
      <button onClick={() => setView('alchemy')} disabled={!expandingBelief} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-0">Direct this Energy</button>
    </div>
  </div>
);

const Alchemy: React.FC<AlchemyProps> = ({ setView, toggleSound, soundEnabled }) => (
  <div className="h-full flex flex-col">
    <Nav title="Vitality Alchemy" subtitle="Select Chemistry" onBack={() => setView('fork')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
    <div className="flex-1 space-y-4 px-4 pt-4 overflow-y-auto hide-scrollbar pb-4">
      {[{ id: 'perform', label: 'Performance', desc: 'Sharpen focus.', icon: Zap }, { id: 'connect', label: 'Connection', desc: 'Open heart.', icon: Heart }, { id: 'learn', label: 'Expansion', desc: 'Build new paths.', icon: BookOpen }].map(i => (
        <button key={i.id} onClick={() => setView('integration')} className="w-full p-6 rounded-[24px] glass-panel text-left hover:bg-white/5 transition-all">
          <i.icon className="text-white/80 mb-2" size={24} />
          <h3 className="font-serif text-2xl text-white italic">{i.label}</h3>
          <p className="font-serif text-white/60 italic text-sm">{i.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

const Priming: React.FC<PrimingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: Mountain, title: "Physiology", instruction: "Change your state immediately. Stand up. Shoulders back. Deep breath. Look up.", action: "I am ready." },
    { icon: Anchor, title: "Somatic Anchor", instruction: "Where do you feel this new power in your body? Put your hand there now.", action: "I feel it." },
    { icon: Eye, title: "Visualization", instruction: "Close your eyes. See the goal achieved. Feel the emotion of the win in your body.", action: "Seal it." }
  ];
  const current = steps[step];
  const next = () => { if (step < steps.length - 1) setStep(step + 1); else onComplete(); };

  return (
    <div className="h-full flex flex-col justify-center items-center text-center animate-enter overflow-y-auto hide-scrollbar">
      <div className="min-h-full flex flex-col justify-center items-center py-10 w-full">
        <div className="mb-8 relative"><div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full"></div><current.icon size={64} className="text-white relative z-10 animate-pulse" strokeWidth={1} /></div>
        <h2 className="font-serif text-3xl text-white italic mb-4 animate-enter" key={`t-${step}`}>{current.title}</h2>
        <p className="font-sans text-lg text-white/80 leading-relaxed max-w-[280px] mx-auto mb-12 animate-enter delay-100" key={`i-${step}`}>{current.instruction}</p>
        <button onClick={next} className="px-10 py-5 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-[0.2em] uppercase hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all animate-enter delay-200">{current.action}</button>
        <div className="flex gap-2 mt-8">{steps.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}></div>))}</div>
      </div>
    </div>
  );
};

// --- INTEGRATION & POST-AUDIT ---
const Integration: React.FC<IntegrationProps> = ({ goal, setGoal, goalStep, setGoalStep, isLocked, setIsLocked, expandingBelief, stressor, fear, sessionCount, completeSession, resetApp, setView, toggleSound, soundEnabled, somaticZones, isBurnoutPath, userName, energyAnalysis, stressLevel, energyLevel, postStressLevel, setPostStressLevel, postEnergyLevel, setPostEnergyLevel }: any) => {
  const [primingDone, setPrimingDone] = useState(false);
  const [manifesto, setManifesto] = useState("");
  const [generating, setGenerating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (isLocked) {
      setPostStressLevel(stressLevel);
      setPostEnergyLevel(energyLevel);
    }
  }, [isLocked]);

  useEffect(() => {
    if (isLocked && !isBurnoutPath && !manifesto) {
      setGenerating(true);
      const currentLevel = energyAnalysis?.level || 3;
      generateManifesto(stressor, expandingBelief, goal.action || "action", fear, currentLevel, (text) => setManifesto(text))
        .then(res => { setIsOffline(res.isOffline); setGenerating(false); });
    }
  }, [isLocked, isBurnoutPath, manifesto]);

  const quickTimes = ["Now", "Within 1 Hr", "Today", "Tomorrow"];
  const steps = [
    { id: 'outcome', q: 'The Goal', ph: 'Desired outcome?' },
    { id: 'action', q: 'The Action', ph: 'Single step?' },
    { id: 'when', q: 'The Commitment', ph: 'When?' }
  ];
  const current = steps[Math.min(goalStep, 2)];

  const handleBack = () => { if (goalStep > 0) setGoalStep(goalStep - 1); else setView('alchemy'); };
  const handleNextStep = () => {
    if (current.id === 'outcome') {
      const formatted = formatGoalOutcome(goal.outcome);
      setGoal((prev: Goal) => ({ ...prev, outcome: formatted }));
    }
    if (goalStep < 2) setGoalStep(goalStep + 1);
    else setIsLocked(true);
  };

  const copyArtifact = () => {
    const text = `ADAPTIV DECREE\n\n${manifesto}\n\nCommitment: ${goal.action} (${goal.when})`;
    navigator.clipboard.writeText(text);
    alert("Decree copied to clipboard");
  };

  const generateEmailLink = () => {
    const subject = `My Adaptiv Decree`;
    const body = `${manifesto}\n\nMy Commitment: ${goal.action} (${goal.when})`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const generateCalendarLink = () => {
    const text = `Adaptiv Commitment: ${goal.action}`;
    const details = `${manifesto}\n\nGenerated by Adaptiv`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&details=${encodeURIComponent(details)}`;
  };

  if (isLocked && !primingDone && !isBurnoutPath) {
    return (
      <div className="h-full flex flex-col relative z-20">
        <Nav title="Integration" subtitle="Embodiment" onBack={() => { setIsLocked(false); }} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={90} />
        <Priming onComplete={() => setPrimingDone(true)} />
      </div>
    );
  }

  if (isLocked) {
    const stressDelta = postStressLevel - stressLevel;
    const energyDelta = postEnergyLevel - energyLevel;

    return (
      <div className="h-full flex flex-col px-4 text-center justify-center">
        <Nav title="Integration" subtitle="Blueprint Complete" onBack={() => setView('fork')} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={100} aiActive={generating} />
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 pt-4">
          
          {/* THE DECREE CARD */}
          <div className={`glass-panel p-8 rounded-[32px] mb-8 relative overflow-hidden transition-all ${isBurnoutPath ? 'border-orange-500/50' : ''}`}>
            <div className="flex justify-center mb-6">
              {isBurnoutPath ? (
                <div className="p-4 bg-orange-900/30 rounded-full border border-orange-500/50">
                  <BatteryWarning size={48} className="text-orange-300" />
                </div>
              ) : (
                <FileText size={64} className="text-teal-200 opacity-80" />
              )}
            </div>
            <p className={`font-sans text-[9px] uppercase tracking-widest mb-6 flex items-center justify-center gap-2 ${isBurnoutPath ? 'text-orange-200/80' : 'text-teal-200/60'}`}>
              {isBurnoutPath ? "Permission Slip" : "Alchemist Decree"}
              {isOffline && <span className="bg-red-500/20 text-red-300 px-1 rounded flex items-center gap-1"><WifiOff size={8}/> Offline Mode</span>}
            </p>
            <div className="font-serif text-lg leading-relaxed text-white/90 italic mb-8 text-center min-h-[100px]">
              {isBurnoutPath ? (
                `"I, ${userName || 'The Conscious Leader'}, grant myself full permission to pause. The world will wait. My energy is my most precious asset, and I choose to protect it now."`
              ) : (
                `"${manifesto || expandingBelief}"`
              )}
            </div>
            {!generating && (
              <div className="flex justify-center gap-6 border-t border-white/10 pt-6">
                <button onClick={copyArtifact} className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors">
                  <Copy size={18}/>
                  <span className="text-[8px] uppercase tracking-widest">Copy</span>
                </button>
                <a href={generateEmailLink()} className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors">
                  <Mail size={18}/>
                  <span className="text-[8px] uppercase tracking-widest">Email</span>
                </a>
                <a href={generateCalendarLink()} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors">
                  <Calendar size={18}/>
                  <span className="text-[8px] uppercase tracking-widest">Calendar</span>
                </a>
              </div>
            )}
          </div>

          {/* THE POST-SESSION AUDIT (NEW SLIDERS) */}
          {!isBurnoutPath && (
            <div className="glass-panel p-6 rounded-[24px] mb-8 text-left border border-teal-500/20">
              <h3 className="font-serif text-xl text-white/90 italic mb-2">Post-Protocol Audit</h3>
              <p className="font-sans text-[10px] text-white/50 uppercase tracking-widest mb-6">Re-evaluate your internal weather</p>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="font-sans text-[10px] tracking-widest text-indigo-300 uppercase font-bold">Mental Energy</p>
                    <div className="text-xl font-serif italic text-indigo-400">{postEnergyLevel}%</div>
                  </div>
                  <input type="range" min="1" max="100" value={postEnergyLevel} onChange={(e) => setPostEnergyLevel(parseInt(e.target.value))} className="w-full slider-indigo" />
                  <div className="mt-2 text-[10px] font-bold tracking-widest text-right">
                    {energyDelta > 0 ? <span className="text-teal-400">+{energyDelta}% Energy Restored</span> : energyDelta < 0 ? <span className="text-rose-400">{energyDelta}% Energy Lost</span> : <span className="text-white/40">Baseline Maintained</span>}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="font-sans text-[10px] tracking-widest text-amber-300 uppercase font-bold">Pressure Intensity</p>
                    <div className="text-xl font-serif italic text-amber-400">{postStressLevel}%</div>
                  </div>
                  <input type="range" min="1" max="100" value={postStressLevel} onChange={(e) => setPostStressLevel(parseInt(e.target.value))} className="w-full slider-amber" />
                  <div className="mt-2 text-[10px] font-bold tracking-widest text-right">
                    {stressDelta < 0 ? <span className="text-teal-400">{Math.abs(stressDelta)}% Pressure Metabolized</span> : stressDelta > 0 ? <span className="text-rose-400">+{stressDelta}% Pressure Gained</span> : <span className="text-white/40">Baseline Maintained</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isBurnoutPath && (
            <div className="space-y-4 mb-8 mt-12">
              <div className="text-center mb-6">
                <h3 className="font-serif text-xl text-white/90 italic mb-2">The Architecture of Change</h3>
                <p className="font-sans text-xs text-white/50 max-w-xs mx-auto leading-relaxed">You have shifted your state. Now, anchor this new reality.</p>
              </div>

              {/* ENERGY LENS */}
              <button onClick={() => setView('energy')} className="w-full block relative overflow-hidden p-6 rounded-[24px] glass-panel group transition-all hover:bg-white/5 border border-teal-500/20 hover:border-teal-400/40 text-left">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={80} className="text-teal-300" /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 rounded-md bg-teal-500/20 text-[9px] font-bold uppercase tracking-widest text-teal-300">Baseline Check</span></div>
                  <h3 className="font-serif text-xl text-white italic mb-1">Energy Lens Profile</h3>
                  <p className="font-sans text-xs text-white/50 mb-4 leading-relaxed max-w-[85%]">Understand your default patterns. Take the 6-question diagnostic.</p>
                  <div className="inline-flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Start Profile <ArrowRight size={14} /></div>
                </div>
              </button>

              {/* COACHING */}
              <a href="https://calendly.com/alexioda" target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden p-6 rounded-[24px] glass-panel group transition-all hover:bg-white/5 border border-indigo-500/20 hover:border-indigo-400/40">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap size={80} className="text-indigo-300" /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 rounded-md bg-indigo-500/20 text-[9px] font-bold uppercase tracking-widest text-indigo-300">1:1 Coaching</span></div>
                  <h3 className="font-serif text-xl text-white italic mb-1">Lock in the Shift</h3>
                  <p className="font-sans text-xs text-white/50 mb-4 leading-relaxed max-w-[85%]">To rewire your baseline permanently, book a Full Energy Leadership Index (ELI) Assessment.</p>
                  <div className="inline-flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Book Full ELI Assessment <ArrowRight size={14} /></div>
                </div>
              </a>
            </div>
          )}

          <div className="flex gap-4 justify-center pb-8 pt-4 border-t border-white/5">
            <button onClick={resetApp} className="flex items-center justify-center gap-2 text-white/40 hover:text-white uppercase text-[10px] tracking-widest"><RefreshCw size={12}/> Reset System</button>
            <button onClick={() => setView('dashboard')} className={`flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest border px-4 py-2 rounded-full ${isBurnoutPath ? 'text-orange-300 border-orange-500/30 hover:bg-orange-900/20' : 'text-teal-400 border-teal-500/30 hover:bg-teal-900/20'}`}><Home size={12}/> Return to Orbit</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Nav title="Integration" subtitle="Blueprint" onBack={() => setView('fork')} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={90} />
      <div className="glass-panel p-8 rounded-[32px] m-4">
        <h3 className="font-serif text-xl text-white italic mb-6">{current.q}</h3>
        {current.id === 'when' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {quickTimes.map(time => (
                <button key={time} onClick={() => { setGoal({...goal, when: time}); setIsLocked(true); }} className="py-3 rounded-xl border border-white/20 bg-white/5 text-sm font-sans text-white/90 hover:bg-white/20 hover:border-white/40 hover:text-white transition-all shadow-sm">
                  {time}
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-white/30 uppercase tracking-widest mt-4">Select to Seal</p>
          </div>
        ) : (
          <>
            <input autoFocus className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none mb-6" placeholder={current.ph} value={goal[current.id as keyof Goal]} onChange={e => setGoal({...goal, [current.id]: current.id === 'outcome' ? formatGoalOutcome(e.target.value) : e.target.value})} onKeyDown={e => e.key === 'Enter' && handleNextStep()} />
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

const Preservation: React.FC<PreservationProps> = ({ setView, toggleSound, soundEnabled, setGoal, setExpandingBelief, setViewToIntegration }) => {
  const [step, setStep] = useState(0);
  const recoverySteps = [
    { title: "Emergency Brake", icon: Anchor, desc: "We cannot 'push' through burnout. We must stop. Locate one part of your body that feels neutral (hands, feet). Focus there only.", action: "I am anchored." },
    { title: "Boundary Alchemy", icon: MinusCircle, desc: "Burnout is cured by subtraction. What is one thing you will REFUSE to do today?", action: "I let it go." },
    { title: "Identity Shift", icon: User, desc: "You are not the worker. You are the Asset. If the Asset breaks, the work stops. Protecting the Asset IS the work.", action: "I am the Asset." }
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
  const handleBack = () => { if (step > 0) setStep(step - 1); else setView('dashboard'); }

  return (
    <div className="h-full flex flex-col">
      <Nav title="Preservation Mode" subtitle="Recovery Loop" onBack={handleBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={33 * (step+1)} />
      <div className="flex-1 flex flex-col justify-center items-center animate-enter text-center px-4 overflow-y-auto hide-scrollbar">
        <div className="mb-8 relative mx-auto"><div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div><current.icon size={64} className="text-orange-200 relative z-10" strokeWidth={1} /></div>
        <h2 className="font-serif text-3xl text-white italic mb-4">{current.title}</h2>
        <p className="font-sans text-sm text-orange-100/70 leading-relaxed mb-12 max-w-xs mx-auto">{current.desc}</p>
        <button onClick={handleNext} className="w-full py-5 rounded-full bg-gradient-to-r from-orange-900/60 to-amber-900/60 border border-orange-500/30 text-orange-100 font-sans text-xs tracking-widest uppercase hover:border-orange-500/50 transition-all">{current.action}</button>
      </div>
    </div>
  );
};

const VitalityScan: React.FC<VitalityScanProps> = ({ setView, setBurnoutPath, toggleSound, soundEnabled }) => {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const questions = [
    { q: "Physical State", text: "Do you feel tired even after sleep, or have physical symptoms like headaches or stomach knots?" },
    { q: "Emotional State", text: "Do you feel increasingly cynical, detached, or negative about your work or the people you work with?" },
    { q: "Cognitive Fog", text: "Are you finding it hard to concentrate, or do you feel like you're working harder but accomplishing less?" },
    { q: "Relational Snap", text: "Are you more irritable or impatient with colleagues, friends, or family than usual?" },
    { q: "Anticipatory Dread", text: "Do you feel a sense of dread or heavy anxiety on Sunday nights or before starting your shift?" },
    { q: "Recovery Lag", text: "Does it take you longer than a weekend to feel like yourself again?" }
  ];

  const handleBack = () => {
    if (step > 0) { setStep(step - 1); setScore(score - (selected !== null ? selected : 0)); setSelected(null); }
    else { setView('dashboard'); }
  };

  const confirmAnswer = (val: number) => {
    const newScore = score + val;
    setScore(newScore);
    if (step < questions.length - 1) setStep(step + 1);
    else {
      const result = getResult(newScore);
      setShowResult(true);
      setLoading(true);
      generateEnergyInsight(result.isBurnout ? 1 : 2, `Burnout Phase: ${result.type}`).then(res => { setAiInsight(res); setLoading(false); });
    }
  };

  const getResult = (currentScore: number) => {
    if (currentScore <= 2) return { type: "Friction (Acute Stress)", desc: "You are under pressure, but the engine is still intact. You need to discharge the stress, not stop the car.", action: "Use 'Laser Coaching' to reframe the immediate stressor.", isBurnout: false };
    if (currentScore <= 4) return { type: "Smoldering (Early Burnout)", desc: "The warning lights are on. Your cynicism is a defense mechanism. If you push harder now, you will break.", action: "You need boundaries. Use 'Preservation Mode' to audit your energy leaks.", isBurnout: true };
    return { type: "Inferno (Full Burnout)", desc: "Your battery isn't just empty; it's damaged. You cannot 'mindset' your way out of this. You need physiological safety.", action: "Emergency Brake. Stop. Use 'Preservation Mode' to find one safe harbor.", isBurnout: true };
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
            <div className="flex items-center justify-center gap-2 mb-2"><Sparkles size={12} className="text-teal-400"/><span className="text-[9px] uppercase tracking-widest text-teal-400">Energy Shift Recommendation</span></div>
            <p className="font-serif text-sm italic text-white/90">{loading ? "Analyzing Energy Pattern..." : `"${aiInsight}"`}</p>
          </div>
          <p className="font-sans text-sm text-white/70 leading-relaxed mb-8 max-w-xs">{resultData.desc}</p>
          <button onClick={() => { setBurnoutPath(resultData.isBurnout); setView(resultData.isBurnout ? 'preservation' : 'fork_entry'); }} className={`w-full py-4 rounded-full font-sans text-xs font-bold tracking-widest uppercase transition-all ${resultData.isBurnout ? 'bg-orange-500 text-slate-900 hover:bg-orange-400' : 'bg-teal-500 text-slate-900 hover:bg-teal-400'}`}>Begin Protocol</button>
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

const EnergyAnalyzer: React.FC<EnergyAnalyzerProps> = ({ setView }) => {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const questions = [
    { q: "Reaction to Challenge", options: [{ text: "I feel like a victim. Why me?", val: 1 }, { text: "I have to fight to win.", val: 2 }, { text: "I look for the opportunity.", val: 5 }] },
    { q: "Inner Monologue", options: [{ text: "I'm not good enough.", val: 1 }, { text: "I'm better than them.", val: 2 }, { text: "I'm curious about this.", val: 5 }] },
    { q: "Motivation Source", options: [{ text: "I have to do this (Fear).", val: 1 }, { text: "I need to prove myself (Ego).", val: 2 }, { text: "I want to create this (Purpose).", val: 6 }] },
    { q: "View of Others", options: [{ text: "They just don't get it.", val: 2 }, { text: "They are doing their best.", val: 4 }, { text: "We are partners in this.", val: 6 }] },
    { q: "Energy at 3 PM", options: [{ text: "Completely drained / Foggy.", val: 1 }, { text: "Wired / Anxious / Tense.", val: 2 }, { text: "Steady / Calm.", val: 5 }] },
    { q: "Goal Driver", options: [{ text: "Avoiding failure.", val: 1 }, { text: "Beating the competition.", val: 2 }, { text: "Expressing my potential.", val: 6 }] }
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
      1: { title: "Level 1: The Victim", type: "Catabolic", desc: "Core Thought: 'I lose.' You feel at the effect of the situation.", shift: "Where do I actually have a choice right now?", recommendation: "Re-engage agency." },
      2: { title: "Level 2: The Fighter", type: "Catabolic", desc: "Core Thought: 'I win, you lose.' High energy, but fueled by conflict.", shift: "How can I win without making anyone else wrong?", recommendation: "Shift from conflict to construction." },
      3: { title: "Level 3: The Rationalizer", type: "Anabolic", desc: "Core Thought: 'I win.' You are coping well, but may be tolerating things.", shift: "What is the emotion I am explaining away?", recommendation: "Move from coping to feeling." },
      4: { title: "Level 4: The Caregiver", type: "Anabolic", desc: "Core Thought: 'You win.' Driven by compassion and service.", shift: "If I said 'No' to them, what would I be saying 'Yes' to for myself?", recommendation: "Balance service with self-preservation." },
      5: { title: "Level 5: The Opportunist", type: "Anabolic", desc: "Core Thought: 'We both win.' You see problems as opportunities.", shift: "What is the gift in this challenge?", recommendation: "Lock in this perspective." },
      6: { title: "Level 6: The Visionary", type: "Anabolic", desc: "Core Thought: 'Everyone wins.' Connected to intuition and purpose.", shift: "What does my intuition know that my logic hasn't caught up to?", recommendation: "Create from this space." }
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
            <h4 className="font-serif text-white italic mb-2 text-sm flex items-center justify-center gap-2"><Info size={14}/> Shift Tactic</h4>
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
      <Nav title="Energy Lens" subtitle={`Question ${step + 1} / 6`} onBack={() => setView('integration')} toggleSound={() => {}} soundEnabled={false} progress={((step + 1) / 6) * 100} />
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
  )
};

// --- MAIN APP RENDER ---
const App = () => {
  const [view, setView] = useState('welcome');
  const [bgState, setBgState] = useState('neutral');
  const [userName, setUserName] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const [stressor, setStressor] = useState('');
  const [perception, setPerception] = useState('');
  const [fear, setFear] = useState('');
  
  // Base State (Entry)
  const [stressLevel, setStressLevel] = useState(50);
  const [energyLevel, setEnergyLevel] = useState(50);
  
  // Post-Protocol State (Exit)
  const [postStressLevel, setPostStressLevel] = useState(50);
  const [postEnergyLevel, setPostEnergyLevel] = useState(50);

  const [isBurnout, setIsBurnout] = useState(false);
  const [isBurnoutPath, setIsBurnoutPath] = useState(false);
  const [somaticZones, setSomaticZones] = useState<string[]>([]);
  const [partsStep, setPartsStep] = useState('experience');
  const [sensation, setSensation] = useState('');
  const [protection, setProtection] = useState('');
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

  useEffect(() => {
    if (view === 'preservation') setBgState('preservation');
    else if (view === 'laser') setBgState('laser');
    else if (view === 'regulate') setBgState('flow');
    else setBgState('neutral');
  }, [view]);

  useEffect(() => { if (isBurnout) setIsBurnoutPath(true); }, [isBurnout]);
  useEffect(() => { if (soundEnabled) { soundEngine.play(soundType); } }, [soundType]);

  const toggleSound = () => {
    if (soundEnabled) { soundEngine.stop(); setSoundEnabled(false); } 
    else { soundEngine.play(soundType); setSoundEnabled(true); }
  };

  const enterApp = () => { setView('manifesto'); };
  const resetApp = () => { setView('welcome'); setStressor(''); setPerception(''); setSomaticZones([]); setIsLocked(false); setIsBurnoutPath(false); };
  const completeSession = () => { setSessionCount(prev => prev + 1); };

  return (
    <>
      <FontStyles />
      <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden flex justify-center">
        <Atmosphere bgState={bgState} />
        <div className="w-full max-w-md h-full relative z-10 p-6">
          {view === 'welcome' && <Welcome onEnter={enterApp} />}
          {view === 'manifesto' && <Manifesto onContinue={() => setView('profile')} />}
          {view === 'profile' && <Identity userName={userName} setUserName={setUserName} onComplete={() => setView('dashboard')} />}
          
          {view === 'dashboard' && <Horizon 
            userName={userName} sessionCount={sessionCount}
            stressor={stressor} setStressor={setStressor}
            perception={perception} setPerception={setPerception}
            stressLevel={stressLevel} setStressLevel={setStressLevel}
            energyLevel={energyLevel} setEnergyLevel={setEnergyLevel}
            isBurnout={isBurnout} setView={setView}
            toggleSound={toggleSound} soundEnabled={soundEnabled}
            resetApp={resetApp} setEnergyAnalysis={setEnergyAnalysis}
            soundType={soundType} setSoundType={setSoundType}
          />}
          
          {view === 'energy_reflection' && <EnergyReflection energyAnalysis={energyAnalysis} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          {view === 'preservation' && <Preservation setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} setGoal={setGoal} setExpandingBelief={setExpandingBelief} setViewToIntegration={() => { setIsLocked(true); setView('integration'); }} />}
          {view === 'burnout_check' && <VitalityScan setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} setBurnoutPath={setIsBurnoutPath} />}
          {view === 'fork_entry' && <ForkEntry setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          {view === 'diffuser' && <Diffuser fear={fear} setFear={setFear} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          {view === 'somatic' && <Vessel somaticZones={somaticZones} setSomaticZones={setSomaticZones} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          {view === 'partswork' && <PartsWork selectedPart={somaticZones[0] || 'Part'} sensation={sensation} setSensation={setSensation} protection={protection} setProtection={setProtection} fear={fear} setFear={setFear} expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief} partsStep={partsStep} setPartsStep={setPartsStep} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          {view === 'laser' && <LaserCoaching stressor={stressor} perception={perception} somatic={somaticZones[0] || 'Body'} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} setGoal={setGoal} setExpandingBelief={setExpandingBelief} energyLevel={energyLevel} stressLevel={stressLevel} />}
          
          {view === 'lens' && <Perspective pressure={pressure} setPressure={setPressure} ability={ability} setAbility={setAbility} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          
          {view === 'fork' && <Crossroads stressLevel={stressLevel} energyLevel={energyLevel} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          {view === 'regulate' && <Breath breathing={breathing} setBreathing={setBreathing} breathCount={breathCount} setBreathCount={setBreathCount} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          {view === 'alchemy' && <Alchemy setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          
          {view === 'integration' && <Integration 
            goal={goal} setGoal={setGoal} goalStep={goalStep} setGoalStep={setGoalStep} 
            isLocked={isLocked} setIsLocked={setIsLocked} 
            expandingBelief={expandingBelief} stressor={stressor} fear={fear} 
            sessionCount={sessionCount} completeSession={completeSession} 
            resetApp={resetApp} setView={setView} toggleSound={toggleSound} 
            soundEnabled={soundEnabled} somaticZones={somaticZones} 
            isBurnoutPath={isBurnoutPath} userName={userName} energyAnalysis={energyAnalysis}
            stressLevel={stressLevel} energyLevel={energyLevel}
            postStressLevel={postStressLevel} setPostStressLevel={setPostStressLevel}
            postEnergyLevel={postEnergyLevel} setPostEnergyLevel={setPostEnergyLevel}
          />}
          
          {view === 'insight' && <Insight expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
          {view === 'energy' && <EnergyAnalyzer setView={setView} />}
        </div>
      </div>
    </>
  );
};

export default App;
