import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Wind, Zap, Heart, BookOpen, 
  ArrowRight, Check, Calendar, Facebook, 
  User, Target,
  Waves, Volume2, VolumeX, ChevronLeft, AlertCircle, Copy, LogOut, RefreshCw,
  Brain, Eye, MessageCircle, Shield, Sun, Flame, Anchor, Hand, Disc, Mountain, Mail, 
  Moon, Coffee, MinusCircle, AlertTriangle, Info, FileText, Thermometer, Sparkles, Loader2, Wifi, WifiOff, Home, Lock, BatteryWarning, ExternalLink
} from 'lucide-react';

// --- CLIENT-SIDE ELI LOGIC (The "Inner Brain" for Offline Mode) ---

const getSmartQuestion = (energy: number, stress: number) => {
  // CATABOLIC ZONE (High Stress / Low Energy)
  if (stress > 60 || energy < 40) {
    return "What specifically is threatened by this situation?";
  }
  // ANABOLIC ZONE (High Energy / Flow)
  if (energy > 70) {
    return "If you were coaching your best self, what would you tell them to do?";
  }
  // TRANSITIONAL ZONE (Coping / Rationalizing)
  return "What is one assumption you are making that might not be true?";
};

// --- API HELPERS ---

const generateCoachingQuestions = async (stressor: string, perception: string, somatic: string, energyLevel: number, stressLevel: number) => {
  try {
    const combinedContext = `Situation: "${stressor}". Client's current experience/coping: "${perception}".`;
    const res = await fetch('/api/coaching-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stressor: combinedContext, somatic, energyLevel, stressLevel })
    });
    
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType || !contentType.includes("application/json")) {
       throw new Error('API unavailable');
    }

    const data = await res.json();
    // Return the array, we will pick the first one in the UI logic
    return data.questions; 
  } catch (error) {
    // FALLBACK: Use the Client-Side ELI Brain logic
    return [getSmartQuestion(energyLevel, stressLevel)];
  }
};

const generateManifesto = async (stressor: string, truth: string, action: string) => {
  try {
    const res = await fetch('/api/manifesto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stressor, truth, action })
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType || !contentType.includes("application/json")) {
       throw new Error('API unavailable');
    }

    const data = await res.json();
    return { text: data.manifesto, isOffline: false };
  } catch (error) {
    // Improved poetic fallback
    const fallbackText = `The heavy tide of "${stressor}" recedes. I stand firm in the truth: "${truth}". I seal this contract by ${action}, reclaiming my sovereign ground.`;
    return { text: fallbackText, isOffline: false }; // Hidden offline state
  }
};

// --- TYPES & INTERFACES ---

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
interface WelcomeProps { onEnter: () => void; }
interface ManifestoProps { onContinue: () => void; }
interface IdentityProps { userName: string; setUserName: (name: string) => void; onComplete: () => void; }

interface HorizonProps { 
  userName: string; 
  sessionCount: number; 
  stressor: string; 
  setStressor: (val: string) => void; 
  perception: string; 
  setPerception: (val: string) => void; 
  stressLevel: number; 
  setStressLevel: (val: number) => void; 
  energyLevel: number; 
  setEnergyLevel: (val: number) => void; 
  isBurnout: boolean; 
  setView: (view: string) => void; 
  toggleSound: () => void; 
  soundEnabled: boolean; 
  resetApp: () => void; 
}

interface BurnoutCheckProps { setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; setBurnoutPath: (val: boolean) => void; }
interface PreservationProps { setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; setGoal: (goal: any) => void; setExpandingBelief: (belief: string) => void; setViewToIntegration: () => void; }
interface VesselProps { somaticZones: string[]; setSomaticZones: (zones: string[]) => void; setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; }
interface PartsWorkProps { selectedPart: string; sensation: string; setSensation: (val: string) => void; protection: string; setProtection: (val: string) => void; expandingBelief: string; setExpandingBelief: (val: string) => void; partsStep: string; setPartsStep: (val: string) => void; setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; }
interface LaserCoachingProps { stressor: string; perception: string; somatic: string; setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; setGoal: (val: any) => void; setExpandingBelief: (val: string) => void; energyLevel: number; stressLevel: number; }
interface PerspectiveProps { pressure: number; setPressure: (val: number) => void; ability: number; setAbility: (val: number) => void; setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; }
interface CrossroadsProps { setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; stressLevel: number; energyLevel: number; }
interface BreathProps { breathing: boolean; setBreathing: (val: boolean) => void; breathCount: number; setBreathCount: React.Dispatch<React.SetStateAction<number>>; setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; }
interface InsightProps { expandingBelief: string; setExpandingBelief: (val: string) => void; setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; }
interface AlchemyProps { setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; }
interface EnergyAnalyzerProps { setView: (view: string) => void; }

interface IntegrationProps { 
  goal: { what: string; measure: string; when: string; outcome: string; action?: string }; 
  setGoal: (val: any) => void; 
  goalStep: number; 
  setGoalStep: (val: number) => void; 
  isLocked: boolean; 
  setIsLocked: (val: boolean) => void; 
  expandingBelief: string; 
  stressor: string; 
  sessionCount: number; 
  completeSession: () => void; 
  resetApp: () => void; 
  setView: (view: string) => void; 
  toggleSound: () => void; 
  soundEnabled: boolean; 
  somaticZones: string[]; 
  isBurnoutPath: boolean;
}

interface PrimingProps {
  onComplete: () => void;
}

// --- SHARED COMPONENTS ---

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
    .animate-subconscious { animation: subconscious 6s ease-in-out infinite; }
    @keyframes subconscious { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.05); opacity: 0.6; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-enter { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; background: white; cursor: pointer; margin-top: -8px; box-shadow: 0 0 20px rgba(255,255,255,0.5); }
    input[type=range]::-webkit-slider-runnable-track { height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; }
    .glow-pulse { animation: glowPulse 3s infinite; }
    @keyframes glowPulse { 0% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); border-color: rgba(20, 184, 166, 0.6); } 50% { box-shadow: 0 0 20px 0 rgba(20, 184, 166, 0.2); border-color: rgba(20, 184, 166, 1); } 100% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); border-color: rgba(20, 184, 166, 0.6); } }
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
        {/* AI STATUS INDICATOR - ONLY SHOW WHEN ACTIVE */}
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
      <div className="absolute top-[10%] left-[10%] w-[80%] h-[60%] bg-indigo-500/10 rounded-full blur-[100px] animate-subconscious"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] animate-subconscious" style={{ animationDelay: '3s' }}></div>
    </div>
  );
};

// --- VIEW COMPONENTS ---

const Welcome: React.FC<WelcomeProps> = ({ onEnter }) => (
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
        <p className="font-serif italic text-white/80 text-xs">Conscious Growth Coaching</p>
      </div>
    </div>
  </div>
);

const Manifesto: React.FC<ManifestoProps> = ({ onContinue }) => (
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
       <p className="font-sans text-[10px] uppercase tracking-widest text-white/40 mb-6">The Only Requirement</p>
       <p className="font-serif text-white/90 italic mb-10">"Do not rush. When the screen says breathe, actually breathe."</p>
       <button onClick={onContinue} className="w-full py-5 rounded-full bg-white/5 border border-white/10 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/30 transition-all">Begin</button>
      </div>
  </div>
);

const Identity: React.FC<IdentityProps> = ({ userName, setUserName, onComplete }) => (
  <div className="h-full flex flex-col px-6 text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <div className="min-h-full flex flex-col items-center py-10 w-full">
      <div className="flex-1"></div>
      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="mb-8 relative">
            <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
            <Activity size={40} className="text-white/80 relative z-10" strokeWidth={1} />
        </div>
        <h1 className="font-serif text-4xl text-white mb-2 italic tracking-wide">Adaptiv</h1>
        <p className="font-sans text-white/40 text-xs tracking-[0.2em] uppercase mb-12">Alchemy for the Soul</p>
        <div className="w-full space-y-6 mt-12">
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && userName && onComplete()} placeholder="Enter Name / Alias" className="w-full bg-transparent border-b border-white/20 py-3 text-center text-white text-xl font-serif placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-colors" />
            <button onClick={onComplete} disabled={!userName} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs font-medium tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Begin</button>
        </div>
      </div>
      <div className="flex-1"></div>
    </div>
  </div>
);

const Horizon: React.FC<HorizonProps> = ({ userName, sessionCount, stressor, setStressor, perception, setPerception, stressLevel, setStressLevel, energyLevel, setEnergyLevel, isBurnout, setView, toggleSound, soundEnabled, resetApp }) => {
  const triggers = ['work', 'job', 'boss', 'career', 'team', 'project', 'deadline', 'email', 'monday', 'shift', 'burnout', 'tired', 'exhausted', 'drained', 'overwhelm', 'client'];
  const showWorkCheck = triggers.some(t => stressor.toLowerCase().includes(t));
  
  // High friction check: High Stress (>75) AND Low Energy (<35)
  const isHighFriction = stressLevel > 75 && energyLevel < 35;

  return (
    <div className="h-full flex flex-col">
      <Nav 
          title={`Hello, ${userName || 'Traveler'}`} 
          subtitle={`Session ${sessionCount + 1}`} 
          isDashboard={true} 
          resetApp={resetApp}
          toggleSound={toggleSound}
          soundEnabled={soundEnabled}
          progress={0}
      />
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto hide-scrollbar animate-enter pb-8">
        
        {/* PROTOCOL TRACKER - Compacted */}
        <div className="glass-panel p-4 rounded-[24px] border-teal-500/20 relative">
           <div className="flex justify-between items-center mb-2">
              <h3 className="font-serif text-lg text-teal-100 italic">The Alchemist's Cycle</h3>
              <span className="font-sans text-[9px] uppercase tracking-widest text-teal-400 bg-teal-900/30 px-2 py-1 rounded">
                  Cycle {(sessionCount % 7) + 1} / 7
              </span>
           </div>
           
           <div className="flex justify-between mb-6 relative z-10 px-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all text-[9px] font-bold ${
                  i < (sessionCount % 7) 
                  ? 'bg-teal-500 text-slate-900 border-teal-400' 
                  : i === (sessionCount % 7)
                    ? 'bg-teal-900/80 text-teal-400 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-110'
                    : 'bg-white/5 border-white/10 text-white/20'
                }`}>
                  {i < (sessionCount % 7) ? <Check size={10} strokeWidth={3} /> : i + 1}
                </div>
              ))}
              <div className="absolute top-3 left-3 right-3 h-[1px] bg-white/5 -z-10"></div>
           </div>
        </div>

        {/* INTERNAL WEATHER - RESTORED & PROMINENT */}
        <div className="glass-panel p-6 rounded-[24px] border-white/10">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-serif text-xl text-white/90 italic">Internal Weather</h3>
            {isBurnout && <AlertCircle size={18} className="text-orange-400/80 animate-pulse"/>}
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
                <p className="font-sans text-[10px] tracking-widest text-white/50 uppercase">How is your mental energy?</p>
                <div className="grid grid-cols-4 gap-2">
                    {[10, 30, 70, 90].map((val, i) => (
                        <button key={i} onClick={() => setEnergyLevel(val)} className={`py-2 rounded-lg text-[10px] uppercase font-bold border transition-all ${energyLevel === val ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10'}`}>
                            {['Empty', 'Low', 'Stable', 'Full'][i]}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="space-y-2">
                <p className="font-sans text-[10px] tracking-widest text-white/50 uppercase">How does the pressure feel?</p>
                <div className="grid grid-cols-4 gap-2">
                    {[20, 40, 70, 90].map((val, i) => (
                        <button key={i} onClick={() => setStressLevel(val)} className={`py-2 rounded-lg text-[10px] uppercase font-bold border transition-all ${stressLevel === val ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10'}`}>
                            {['Fun', 'Okay', 'Heavy', 'Crushing'][i]}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {isBurnout ? (
          <div className="animate-enter delay-100 p-4 rounded-2xl bg-orange-900/10 border border-orange-500/30">
            <p className="font-serif text-xl text-orange-200 text-center italic mb-2">System Alert: Depletion</p>
            <p className="font-sans text-[10px] text-orange-200/60 text-center mb-4 leading-relaxed">
              Your biometrics indicate high friction. Standard protocols may cause further strain.
            </p>
            <button 
              onClick={() => setView('preservation')}
              className="w-full py-4 rounded-full bg-gradient-to-r from-orange-900/60 to-amber-900/60 border border-orange-500/30 text-orange-100 font-sans text-xs tracking-widest uppercase hover:border-orange-500/50 transition-all shadow-lg shadow-orange-900/20"
            >
              Enter Preservation
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-enter delay-100">
            {/* CONTEXT INPUTS */}
            <div className="relative space-y-3">
              <input 
                type="text"
                value={stressor}
                onChange={(e) => setStressor(e.target.value)}
                placeholder="What weighs on you?"
                className="w-full glass-panel p-5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:bg-white/5 transition-all font-serif text-lg italic text-center"
              />
              <input 
                type="text"
                value={perception}
                onChange={(e) => setPerception(e.target.value)}
                placeholder="How are you experiencing this?"
                className="w-full glass-panel p-4 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:bg-white/5 transition-all font-sans text-sm text-center"
              />
            </div>
            
            {/* Conditional Buttons based on State */}
            {(showWorkCheck || isHighFriction) ? (
              <div className="animate-enter mb-2 space-y-3">
                 <button onClick={() => setView('burnout_check')} className="w-full py-4 rounded-xl bg-orange-500/20 text-orange-200 border border-orange-500/50 flex flex-col items-center justify-center gap-1 hover:bg-orange-500/30 transition-all">
                     <div className="flex items-center gap-2">
                        <AlertTriangle size={16} />
                        <span className="font-sans text-xs font-bold tracking-widest uppercase">High Friction Detected</span>
                     </div>
                     <span className="text-[10px] opacity-70">Check Burnout Risk?</span>
                 </button>

                 <button 
                  onClick={() => setView('somatic')}
                  disabled={!stressor}
                  className="w-full py-4 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all font-sans text-xs tracking-widest uppercase"
                >
                  Continue to Alchemy
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setView('somatic')}
                disabled={!stressor}
                className="w-full py-5 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:shadow-none mt-2"
              >
                Begin Alchemy
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Vessel: React.FC<VesselProps> = ({ somaticZones, setSomaticZones, setView, toggleSound, soundEnabled }) => {
  const zones = [
    { id: 'Head', label: 'Head', icon: Brain }, { id: 'Eyes', label: 'Eyes', icon: Eye },
    { id: 'Throat', label: 'Throat', icon: MessageCircle }, { id: 'Chest', label: 'Chest', icon: Shield },
    { id: 'Solar', label: 'Solar Plexus', icon: Sun }, { id: 'Gut', label: 'Gut', icon: Disc },
    { id: 'Back', label: 'Back', icon: Anchor }, { id: 'Hands', label: 'Hands', icon: Hand },
  ];
  return (
    <div className="h-full flex flex-col">
      <Nav title="The Vessel" subtitle="Locate the Part" onBack={() => setView('dashboard')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={15} />
      
      <div className="mb-4 animate-enter shrink-0 px-4">
        <p className="font-serif text-lg text-white/80 italic leading-relaxed">
          "Where does the tension live?"
        </p>
        <p className="font-sans text-xs text-white/40 mt-1 leading-relaxed max-w-[90%]">
          Select the physical part that is calling for attention right now.
        </p>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-3 content-start overflow-y-auto hide-scrollbar pb-4 min-h-0 animate-enter delay-100">
        {zones.map(z => {
          const Icon = z.icon;
          return (
            <button key={z.id} onClick={() => setSomaticZones([z.id])} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${somaticZones.includes(z.id) ? 'bg-slate-800/90 border-white/60' : 'glass-panel hover:bg-white/10'}`}>
              <Icon size={28} className={somaticZones.includes(z.id) ? 'text-white' : 'text-white/40'}/>
              <span className={`font-serif italic ${somaticZones.includes(z.id) ? 'text-white' : 'text-white/90'}`}>{z.label}</span>
            </button>
        )})}
      </div>
      <button onClick={() => setView('partswork')} disabled={somaticZones.length === 0} className="mt-4 w-full py-5 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase border border-white/10 hover:bg-white/20 transition-all disabled:opacity-0 disabled:translate-y-4 shrink-0 animate-enter delay-200">Connect with Part</button>
    </div>
  );
};

const PartsWork: React.FC<PartsWorkProps> = ({ selectedPart, sensation, setSensation, protection, setProtection, expandingBelief, setExpandingBelief, partsStep, setPartsStep, setView, toggleSound, soundEnabled }) => {
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
             <p className="font-sans text-sm text-white/70 leading-relaxed mb-8">Can you ask the <strong>{sensation}</strong> to step back just a few inches, so you can look <em>at</em> it, rather than <em>through</em> it?</p>
             <button onClick={() => setPartsStep('connect')} className="w-full py-4 rounded-full bg-teal-500/10 text-teal-200 font-sans text-xs tracking-widest uppercase hover:bg-teal-500/20 transition-all border border-teal-500/20">I have created space</button>
          </div>
        )}

        {partsStep === 'connect' && (
          <div className="text-center">
             <Waves size={64} className="text-indigo-200 mx-auto mb-8" />
             <h3 className="font-serif text-2xl text-white italic mb-6">The Inquiry</h3>
             <p className="font-sans text-sm text-white/70 leading-relaxed mb-8">Ask internally:<br/><br/><em>"What are you afraid would happen if you didn't do this job?"</em></p>
             <button onClick={() => setPartsStep('message')} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all border border-white/5">I have the answer</button>
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

const Perspective: React.FC<PerspectiveProps> = ({ pressure, setPressure, ability, setAbility, setView, toggleSound, soundEnabled }) => {
  const flowState = ability >= pressure;
  return (
    <div className="h-full flex flex-col">
      <Nav title="The Perspective" subtitle="Calibration" onBack={() => setView('partswork')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={50} />
      <div className="mb-4 text-center px-6">
        <p className="font-sans text-xs text-white/60 leading-relaxed max-w-xs mx-auto">We calibrate here to check your bandwidth. If Demand exceeds Resource, we need Safety (Stillness). If Resource exceeds Demand, we need Action (Motion).</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-start pt-4 px-4 overflow-y-auto hide-scrollbar">
        <div className={`relative w-40 h-40 rounded-full border border-white/10 flex items-center justify-center transition-all duration-1000 ${flowState ? 'shadow-[0_0_50px_rgba(20,184,166,0.2)]' : 'shadow-[0_0_50px_rgba(244,63,94,0.2)]'}`}>
           <div className="text-center relative z-10 px-2">
             <h2 className={`font-serif text-2xl italic ${flowState ? 'text-teal-100' : 'text-rose-100'}`}>{flowState ? 'Flow' : 'Friction'}</h2>
             <p className="font-sans text-[9px] tracking-widest uppercase text-white/60 mt-1">{flowState ? 'Systems go.' : 'Brace for impact.'}</p>
           </div>
        </div>
        <div className="w-full space-y-6 mt-8">
          <div className="space-y-2">
             <p className="font-sans text-[10px] tracking-widest text-white/50 uppercase">Requirement Intensity</p>
             <div className="grid grid-cols-4 gap-2">
                {[20, 50, 80, 100].map((val, i) => <button key={i} onClick={() => setPressure(val)} className={`py-2 rounded-lg text-[10px] uppercase font-bold border ${pressure === val ? 'bg-white text-slate-900' : 'bg-white/5 text-white/40 border-transparent'}`}>{['Low', 'Med', 'High', 'Max'][i]}</button>)}
             </div>
          </div>
          <div className="space-y-2">
             <p className="font-sans text-[10px] tracking-widest text-white/50 uppercase">Internal Capacity</p>
             <div className="grid grid-cols-4 gap-2">
                {[20, 50, 80, 100].map((val, i) => <button key={i} onClick={() => setAbility(val)} className={`py-2 rounded-lg text-[10px] uppercase font-bold border ${ability === val ? 'bg-white text-slate-900' : 'bg-white/5 text-white/40 border-transparent'}`}>{['Low', 'Med', 'High', 'Max'][i]}</button>)}
             </div>
          </div>
        </div>
      </div>
      <button onClick={() => setView('fork')} className="mt-4 w-full py-5 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">Direct the Energy</button>
    </div>
  );
}

const LaserCoaching: React.FC<LaserCoachingProps> = ({ stressor, perception, somatic, setView, toggleSound, soundEnabled, setGoal, setExpandingBelief, energyLevel, stressLevel }) => {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState<any>({ topic: '', result: '', permission: '', action: '' });
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ONCE on mount
    if (aiQuestions.length === 0) {
      setLoading(true);
      generateCoachingQuestions(stressor, perception, somatic, energyLevel, stressLevel).then(q => {
        setAiQuestions(q);
        setLoading(false);
      });
    }
  }, [stressor, perception, somatic, energyLevel, stressLevel]);

  // Answer chips - Broader to fit any AI question
  const starters: Record<number, string[]> = {
    0: ["My insight is...", "The real issue is...", "I'm realizing that...", "I sense..."],
    1: ["I would look like...", "I would feel...", "It would be done.", "I would be free."],
    2: ["To make a mess.", "To prioritize me.", "To let go.", "To trust myself."],
    3: ["I will call...", "I will write...", "I will stop...", "I will start..."]
  };

  const currentQ = [
    // Step 0: THE AI QUESTION (using the first one from the list)
    { id: 'topic', label: 'The Insight', q: aiQuestions[0] || "Connecting to the field...", ph: 'My insight is...' },
    // Step 1: Vision
    { id: 'result', label: 'The Vision', q: "If this problem were already solved, what would be different?", ph: 'I would be...' },
    // Step 2: Permission
    { id: 'permission', label: 'Permission', q: "What permission do you need to give yourself to move forward?", ph: 'I give myself permission to...' },
    // Step 3: Action
    { id: 'action', label: 'The Move', q: "What is the single boldest step that makes everything else easier?", ph: 'I will...' }
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
             <div className="text-center py-10">
               <Loader2 className="animate-spin mx-auto text-teal-400"/>
               <p className="text-xs text-white/50 mt-2">Consulting the field...</p>
             </div>
           ) : (
             <div className="animate-enter">
               <span className="font-sans text-[10px] text-white/40 uppercase tracking-widest mb-4 block">{currentQ.label}</span>
               
               {/* Display the Question */}
               <h3 className="font-serif text-2xl text-white italic mb-8 leading-snug">{currentQ.q}</h3>

               {/* Input */}
               <input 
                 autoFocus
                 className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none mb-6 text-lg placeholder:text-white/20" 
                 placeholder={currentQ.ph} 
                 value={answers[currentQ.id]} 
                 onChange={e => setAnswers({...answers, [currentQ.id]: e.target.value})} 
                 onKeyDown={e => e.key === 'Enter' && handleNext()} 
               />
               
               {/* Chips */}
               <div className="flex flex-wrap gap-2 mb-6">
                 {(starters[step] || []).map(s => (
                   <button key={s} onClick={() => setAnswers({...answers, [currentQ.id]: s})} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] text-white/60 hover:bg-white/10 transition-colors">{s}</button>
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

// --- REST OF THE COMPONENTS (Unchanged logic, just simplified for file length) ---
// Crossroads, Breath, Alchemy, Integration, Insight, EnergyAnalyzer included below

const Crossroads: React.FC<CrossroadsProps> = ({ setView, toggleSound, soundEnabled, stressLevel, energyLevel }) => {
  const recommendStillness = parseInt(stressLevel.toString()) > 70 && parseInt(energyLevel.toString()) < 40;
  return (
    <div className="h-full flex flex-col justify-center px-6">
      <Nav title="The Crossroads" subtitle="Choice Point" onBack={() => setView('lens')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={65} />
      <div className="flex-1 flex flex-col justify-center">
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

const Breath: React.FC<BreathProps> = ({ breathing, setBreathing, breathCount, setBreathCount, setView, toggleSound, soundEnabled }) => {
  const phase = breathCount < 4 ? "Inhale" : breathCount < 8 ? "Hold" : "Exhale";
  useEffect(() => { if (!breathing) return; const i = setInterval(() => setBreathCount((c: number) => (c + 1) % 16), 1000); return () => clearInterval(i); }, [breathing]);
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <Nav title="Regulation" subtitle="Breathe" onBack={() => setView('fork')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
      <div className="flex-1 flex flex-col items-center justify-center">
         <div className="w-64 h-64 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-16 transition-all duration-1000" style={{ transform: `scale(${breathing ? (breathCount < 4 ? 1.5 : 1) : 1})` }}>
           <span className="font-serif text-2xl text-white italic">{breathing ? phase : "Stillness"}</span>
         </div>
         <button onClick={() => { setBreathing(!breathing); setBreathCount(0); }} className="px-10 py-4 rounded-full bg-white text-slate-900 font-bold text-xs uppercase mb-4">{breathing ? 'Complete' : 'Begin'}</button>
         {!breathing && <button onClick={() => setView('insight')} className="text-teal-200 text-xs uppercase tracking-widest">Capture Insight</button>}
      </div>
    </div>
  );
};

const Insight: React.FC<InsightProps> = ({ expandingBelief, setExpandingBelief, setView, toggleSound, soundEnabled }) => (
  <div className="h-full flex flex-col justify-center px-6 text-center">
    <Nav title="The Clarity" subtitle="Harvesting" onBack={() => setView('regulate')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
    <div className="flex-1 flex flex-col justify-center">
      <h3 className="font-serif text-2xl text-white italic mb-6">"In the stillness, what became clear?"</h3>
      <input autoFocus className="w-full bg-transparent border-b border-white/20 py-4 text-center text-white font-light text-lg focus:outline-none mb-12" placeholder="The truth is..." value={expandingBelief} onChange={e => setExpandingBelief(e.target.value)} onKeyDown={e => e.key === 'Enter' && setView('alchemy')} />
      <button onClick={() => setView('alchemy')} disabled={!expandingBelief} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-0">Direct this Energy</button>
    </div>
  </div>
);

const Alchemy: React.FC<AlchemyProps> = ({ setView, toggleSound, soundEnabled }) => (
  <div className="h-full flex flex-col">
    <Nav title="Vitality Alchemy" subtitle="Select Chemistry" onBack={() => setView('fork')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
    <div className="flex-1 space-y-4 px-4 pt-4">
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

const Preservation: React.FC<PreservationProps> = ({ setView, toggleSound, soundEnabled, setGoal, setExpandingBelief, setViewToIntegration }) => {
  const [step, setStep] = useState(0);

  const recoverySteps = [
    {
      title: "Emergency Brake",
      icon: Anchor,
      desc: "We cannot 'push' through burnout. We must stop. Locate one part of your body that feels neutral (hands, feet). Focus there only.",
      action: "I am anchored."
    },
    {
      title: "Boundary Alchemy",
      icon: MinusCircle,
      desc: "Burnout is cured by subtraction. What is one thing you will REFUSE to do today?",
      action: "I let it go."
    },
    {
      title: "Identity Shift",
      icon: User,
      desc: "You are not the worker. You are the Asset. If the Asset breaks, the work stops. Protecting the Asset IS the work.",
      action: "I am the Asset."
    }
  ];

  const current = recoverySteps[step];

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setExpandingBelief("I am the Asset. Rest is my strategy.");
      setGoal({ 
        outcome: "Status: Unavailable", 
        action: "I am offline to realign.", 
        when: "Now" 
      });
      setViewToIntegration();
    }
  };
  
  const handleBack = () => {
      if (step > 0) setStep(step - 1);
      else setView('dashboard');
  }

  return (
    <div className="h-full flex flex-col">
       <Nav title="Preservation Mode" subtitle="Recovery Loop" onBack={handleBack} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={33 * (step+1)} />
       
       <div className="flex-1 flex flex-col justify-center items-center animate-enter text-center px-4 overflow-y-auto hide-scrollbar">
          <div className="mb-8 relative mx-auto">
             <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
             <current.icon size={64} className="text-orange-200 relative z-10" strokeWidth={1} />
          </div>

          <h2 className="font-serif text-3xl text-white italic mb-4">{current.title}</h2>
          <p className="font-sans text-sm text-orange-100/70 leading-relaxed mb-12 max-w-xs mx-auto">
             {current.desc}
          </p>

          <button 
            onClick={handleNext}
            className="w-full py-5 rounded-full bg-gradient-to-r from-orange-900/60 to-amber-900/60 border border-orange-500/30 text-orange-100 font-sans text-xs tracking-widest uppercase hover:border-orange-500/50 transition-all"
          >
             {current.action}
          </button>
       </div>
    </div>
  );
};

const Priming: React.FC<PrimingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Mountain,
      title: "Physiology",
      instruction: "Change your state immediately. Stand up. Shoulders back. Deep breath. Look up.",
      action: "I am ready."
    },
    {
      icon: Anchor,
      title: "Somatic Anchor",
      instruction: "Where do you feel this new power in your body? Put your hand there now.",
      action: "I feel it."
    },
    {
      icon: Eye,
      title: "Visualization",
      instruction: "Close your eyes. See the goal achieved. Feel the emotion of the win in your body.",
      action: "Seal it."
    }
  ];

  const current = steps[step];

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-full flex flex-col justify-center items-center text-center animate-enter overflow-y-auto hide-scrollbar">
      <div className="min-h-full flex flex-col justify-center items-center py-10 w-full">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full"></div>
          <current.icon size={64} className="text-white relative z-10 animate-pulse" strokeWidth={1} />
        </div>
        
        <h2 className="font-serif text-3xl text-white italic mb-4 animate-enter" key={`t-${step}`}>
          {current.title}
        </h2>
        
        <p className="font-sans text-lg text-white/80 leading-relaxed max-w-[280px] mx-auto mb-12 animate-enter delay-100" key={`i-${step}`}>
          {current.instruction}
        </p>

        <button 
          onClick={next}
          className="px-10 py-5 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-[0.2em] uppercase hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all animate-enter delay-200"
        >
          {current.action}
        </button>

        <div className="flex gap-2 mt-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Integration: React.FC<IntegrationProps> = ({ goal, setGoal, goalStep, setGoalStep, isLocked, setIsLocked, expandingBelief, stressor, sessionCount, completeSession, resetApp, setView, toggleSound, soundEnabled, somaticZones, isBurnoutPath }) => {
  const [primingDone, setPrimingDone] = useState(false);
  const [manifesto, setManifesto] = useState("");
  const [generating, setGenerating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (isLocked && !isBurnoutPath && !manifesto) {
      setGenerating(true);
      generateManifesto(stressor, expandingBelief, goal.action || "action").then(res => {
        setManifesto(res.text);
        setIsOffline(res.isOffline);
        setGenerating(false);
      });
    }
  }, [isLocked, isBurnoutPath, manifesto]);

  const quickTimes = ["Now", "Within 1 Hr", "Today", "Tomorrow"];
  const steps = [{ id: 'outcome', q: 'The Goal', ph: 'Desired outcome?' }, { id: 'action', q: 'The Action', ph: 'Single step?' }, { id: 'when', q: 'The Commitment', ph: 'When?' }];
  const current = steps[Math.min(goalStep, 2)];

  const handleBack = () => {
    if (goalStep > 0) setGoalStep(goalStep - 1);
    else setView('alchemy');
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
    return (
      <div className="h-full flex flex-col px-4 text-center justify-center">
        <Nav title="Integration" subtitle="Blueprint Complete" onBack={() => setView('fork')} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={100} aiActive={generating} />
        
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">
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
              </p>

              <div className="font-serif text-lg leading-relaxed text-white/90 italic mb-8 text-center">
                {generating ? (
                  <div className="flex flex-col items-center gap-3 animate-pulse">
                    <Loader2 className="animate-spin text-teal-400" size={24}/>
                    <span>Forging Decree...</span>
                  </div>
                ) : isBurnoutPath ? (
                  `"I, ${'The Sovereign'}, grant myself full permission to pause. The world will wait. My energy is my most precious asset, and I choose to protect it now."`
                ) : (
                  `"${manifesto || expandingBelief}"`
                )}
              </div>

              {/* UTILITIES (Copy/Email/Cal) */}
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

            {/* UPSELL / NEXT STEPS SECTION */}
            {!isBurnoutPath && (
              <div className="space-y-4 mb-8">
                 <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-white/90 italic mb-2">The Architecture of Change</h3>
                    <p className="font-sans text-xs text-white/50 max-w-xs mx-auto leading-relaxed">
                      You have shifted your state. Now, anchor this new reality.
                    </p>
                 </div>

                 {/* ENERGY LENS PROFILE */}
                 <button onClick={() => setView('energy')} className="w-full block relative overflow-hidden p-6 rounded-[24px] glass-panel group transition-all hover:bg-white/5 border border-teal-500/20 hover:border-teal-400/40 text-left">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={80} className="text-teal-300" /></div>
                    <div className="relative z-10">
                       <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 rounded-md bg-teal-500/20 text-[9px] font-bold uppercase tracking-widest text-teal-300">Baseline Check</span></div>
                       <h3 className="font-serif text-xl text-white italic mb-1">Energy Lens Profile</h3>
                       <p className="font-sans text-xs text-white/50 mb-4 leading-relaxed max-w-[85%]">Understand your default patterns. Take the 6-question diagnostic.</p>
                       <div className="inline-flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Start Profile <ArrowRight size={14} /></div>
                    </div>
                 </button>

                 {/* CALENDLY (Full ELI) */}
                 <a href="https://calendly.com/alexioda" target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden p-6 rounded-[24px] glass-panel group transition-all hover:bg-white/5 border border-indigo-500/20 hover:border-indigo-400/40">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap size={80} className="text-indigo-300" /></div>
                    <div className="relative z-10">
                       <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 rounded-md bg-indigo-500/20 text-[9px] font-bold uppercase tracking-widest text-indigo-300">1:1 Coaching</span></div>
                       <h3 className="font-serif text-xl text-white italic mb-1">Lock in the Shift</h3>
                       <p className="font-sans text-xs text-white/50 mb-4 leading-relaxed max-w-[85%]">To rewire your baseline permanently, book a Full Energy Leadership Index (ELI) Assessment.</p>
                       <div className="inline-flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Book Full ELI Assessment <ArrowRight size={14} /></div>
                    </div>
                 </a>

                 {/* WORKBOOK */}
                 <a href="https://alexioda.gumroad.com/l/roxaxf" target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden p-6 rounded-[24px] glass-panel group transition-all hover:bg-white/5 border border-blue-500/20 hover:border-blue-400/40">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><BookOpen size={80} className="text-blue-300" /></div>
                    <div className="relative z-10">
                       <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 rounded-md bg-blue-500/20 text-[9px] font-bold uppercase tracking-widest text-blue-300">Self-Paced</span></div>
                       <h3 className="font-serif text-xl text-white italic mb-1">The Field Guide</h3>
                       <p className="font-sans text-xs text-white/50 mb-4 leading-relaxed max-w-[85%]">Get the interactive workbook to master this protocol.</p>
                       <div className="inline-flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Get the Guide <ExternalLink size={14} /></div>
                    </div>
                 </a>
                 
                 {/* FACEBOOK COMMUNITY */}
                 <a href="https://www.facebook.com/share/1RmJbo4Gdt/" target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden p-6 rounded-[24px] glass-panel group transition-all hover:bg-white/5 border border-purple-500/20 hover:border-purple-400/40">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Facebook size={80} className="text-purple-300" /></div>
                    <div className="relative z-10">
                       <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 rounded-md bg-purple-500/20 text-[9px] font-bold uppercase tracking-widest text-purple-300">Community</span></div>
                       <h3 className="font-serif text-xl text-white italic mb-1">Join the Circle</h3>
                       <p className="font-sans text-xs text-white/50 mb-4 leading-relaxed max-w-[85%]">Connect with other Sovereign Leaders. Daily insights and tools.</p>
                       <div className="inline-flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Join Facebook Group <ExternalLink size={14} /></div>
                    </div>
                 </a>
              </div>
            )}

            {/* NAV FOOTER */}
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
             <input autoFocus className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none mb-6" placeholder={current.ph} value={goal[current.id as keyof typeof goal]} onChange={e => setGoal({...goal, [current.id]: e.target.value})} onKeyDown={e => e.key === 'Enter' && (goalStep < 2 ? setGoalStep(goalStep+1) : setIsLocked(true))} />
             <div className="flex gap-3">
                 <button onClick={handleBack} className="px-4 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white transition-colors">Back</button>
                 <button onClick={() => goalStep < 2 ? setGoalStep(goalStep+1) : setIsLocked(true)} disabled={!goal[current.id]} className="flex-1 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs uppercase disabled:opacity-50">Next</button>
             </div>
           </>
         )}
      </div>
    </div>
  );
};

const BurnoutCheck: React.FC<BurnoutCheckProps> = ({ setView, setBurnoutPath }) => (
  <div className="h-full flex flex-col justify-center text-center px-6">
    <AlertTriangle size={48} className="text-orange-400 mx-auto mb-6" />
    <h2 className="font-serif text-3xl text-white italic mb-4">Spark Check</h2>
    <p className="font-sans text-sm text-white/70 mb-8">Do you feel a sense of dread or heavy anxiety before starting your work?</p>
    <div className="space-y-4">
      <button onClick={() => { setBurnoutPath(true); setView('preservation'); }} className="w-full py-4 rounded-xl bg-orange-500/20 text-orange-200 border border-orange-500">Yes, frequently</button>
      <button onClick={() => { setBurnoutPath(false); setView('somatic'); }} className="w-full py-4 rounded-xl border border-white/10 text-white/50">No, rarely</button>
    </div>
  </div>
);

// --- ENERGY ANALYZER ---
const EnergyAnalyzer: React.FC<EnergyAnalyzerProps> = ({ setView }) => {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [result, setResult] = useState<number | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const [showInfo, setShowInfo] = useState<number | null>(null);

    const questions = [
        {
            q: "Reaction to Challenge",
            options: [
                { text: "I feel like a victim. Why me?", val: 1 },
                { text: "I have to fight to win.", val: 2 },
                { text: "I look for the opportunity.", val: 5 }
            ]
        },
        {
            q: "Inner Monologue",
            options: [
                { text: "I'm not good enough.", val: 1 },
                { text: "I'm better than them.", val: 2 },
                { text: "I'm curious about this.", val: 5 }
            ]
        },
        {
            q: "Motivation Source",
            options: [
                { text: "I have to do this (Fear).", val: 1 },
                { text: "I need to prove myself (Ego).", val: 2 },
                { text: "I want to create this (Purpose).", val: 6 }
            ]
        },
        {
            q: "View of Others",
            options: [
                { text: "They just don't get it.", val: 2 },
                { text: "They are doing their best.", val: 4 },
                { text: "We are partners in this.", val: 6 }
            ]
        },
        {
            q: "Energy at 3 PM",
            options: [
                { text: "Completely drained / Foggy.", val: 1 },
                { text: "Wired / Anxious / Tense.", val: 2 },
                { text: "Steady / Calm.", val: 5 }
            ]
        },
        {
            q: "Goal Driver",
            options: [
                { text: "Avoiding failure.", val: 1 },
                { text: "Beating the competition.", val: 2 },
                { text: "Expressing my potential.", val: 6 }
            ]
        }
    ];

    const confirmAnswer = () => {
        if (selected === null) return;
        
        const newScore = score + selected;
        setScore(newScore);
        setSelected(null); // Reset selection

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            const final = Math.round(newScore / questions.length);
            setResult(final);
        }
    };

    const getResultText = (level: number) => {
        const levels: Record<number, { title: string; desc: string; type: string; shift: string; recommendation: string }> = {
            1: { 
                title: "Level 1: The Victim", 
                type: "Catabolic", 
                desc: "Core Thought: 'I lose.' You feel at the effect of the situation. Apathy or lethargy is a protective mechanism.", 
                shift: "Where do I actually have a choice right now, even a small one?",
                recommendation: "Re-engage agency."
            },
            2: { 
                title: "Level 2: The Fighter", 
                type: "Catabolic", 
                desc: "Core Thought: 'I win, you lose.' High energy, but fueled by conflict, defiance, or struggle. It burns dirty.", 
                shift: "How can I win without making anyone else wrong?",
                recommendation: "Shift from conflict to construction."
            },
            3: { 
                title: "Level 3: The Rationalizer", 
                type: "Anabolic", 
                desc: "Core Thought: 'I win.' You are taking responsibility and coping well, but may be tolerating things to keep the peace.", 
                shift: "What is the emotion I am explaining away?",
                recommendation: "Move from coping to feeling."
            },
            4: { 
                title: "Level 4: The Caregiver", 
                type: "Anabolic", 
                desc: "Core Thought: 'You win.' Driven by compassion and service. Great for teams, but dangerous if you give until you deplete.", 
                shift: "If I said 'No' to them, what would I be saying 'Yes' to for myself?",
                recommendation: "Balance service with self-preservation."
            },
            5: { 
                title: "Level 5: The Opportunist", 
                type: "Anabolic", 
                desc: "Core Thought: 'We both win.' You see problems strictly as opportunities. High performance, low stress.", 
                shift: "What is the gift in this challenge?",
                recommendation: "Lock in this perspective."
            },
            6: { 
                title: "Level 6: The Visionary", 
                type: "Anabolic", 
                desc: "Core Thought: 'Everyone wins.' Connected to intuition and purpose. The 'Zone of Genius'.", 
                shift: "What does my intuition know that my logic hasn't caught up to?",
                recommendation: "Create from this space."
            }
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
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <p className="font-sans text-xs text-white/50 uppercase tracking-widest border border-white/10 inline-block px-3 py-1 rounded-full">{data.type} Energy</p>
                         <button onClick={() => setShowInfo(showInfo ? null : 1)} className="text-white/40 hover:text-white transition-colors"><Info size={14}/></button>
                    </div>
                    
                    {showInfo && (
                        <div className="bg-slate-800 p-4 rounded-xl mb-6 text-left border border-white/10 animate-enter">
                            <p className="text-xs text-white/80 mb-2 font-bold">{data.type === 'Catabolic' ? 'Catabolic Energy:' : 'Anabolic Energy:'}</p>
                            <p className="text-xs text-white/60 leading-relaxed">
                                {data.type === 'Catabolic' 
                                 ? "Draining, destructive energy. Useful for short-term survival (fight/flight) but causes burnout long-term."
                                 : "Fueling, constructive energy. Creates growth, solution-finding, and sustainable high performance."}
                            </p>
                        </div>
                    )}
                    
                    <p className="font-sans text-sm text-white/70 mb-10 leading-relaxed max-w-xs mx-auto">{data.desc}</p>
                    
                    <div className="bg-white/5 rounded-xl p-6 mb-8 text-left border border-white/10">
                        <h4 className="font-serif text-white italic mb-2 text-sm flex items-center justify-center gap-2"><Info size={14}/> Shift Tactic</h4>
                        <p className="font-sans text-[10px] uppercase tracking-widest text-white/50 mb-4 text-center">{data.recommendation}</p>
                        <p className="font-serif text-lg text-teal-200 italic text-center">"{data.shift}"</p>
                    </div>

                    <a href="https://calendly.com/alexioda" target="_blank" rel="noopener noreferrer" className="w-full block py-4 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all">
                        Book Full Energy Audit (ELI)
                    </a>
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
                        <button 
                            key={i} 
                            onClick={() => setSelected(opt.val)}
                            className={`p-5 rounded-2xl border text-left transition-all font-sans text-sm ${selected === opt.val ? 'bg-indigo-500/20 border-indigo-400 text-indigo-100' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
                        >
                            {opt.text}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={confirmAnswer}
                    disabled={selected === null}
                    className="w-full mt-8 py-4 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-0 disabled:translate-y-2 shrink-0"
                >
                    Next
                </button>
            </div>
        </div>
    )
};


// --- MAIN RENDER ---
const App = () => {
  const [view, setView] = useState('welcome'); 
  const [bgState, setBgState] = useState('neutral'); 
  const [userName, setUserName] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const [stressor, setStressor] = useState(''); 
  const [perception, setPerception] = useState('');
  const [stressLevel, setStressLevel] = useState(50);
  const [energyLevel, setEnergyLevel] = useState(50);
  const [isBurnout, setIsBurnout] = useState(false);
  const [isBurnoutPath, setIsBurnoutPath] = useState(false); 
  const [somaticZones, setSomaticZones] = useState<string[]>([]);
  const [partsStep, setPartsStep] = useState('experience'); 
  const [sensation, setSensation] = useState('');
  const [protection, setProtection] = useState('');
  const [expandingBelief, setExpandingBelief] = useState('');
  const [pressure, setPressure] = useState(50);
  const [ability, setAbility] = useState(50);
  const [goal, setGoal] = useState<any>({ what: '', measure: '', when: '', outcome: '', action: '' });
  const [goalStep, setGoalStep] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<any>(null);

  useEffect(() => {
    if (view === 'preservation') setBgState('preservation');
    else if (view === 'laser') setBgState('laser');
    else if (view === 'regulate') setBgState('flow');
    else setBgState('neutral');
  }, [view]);

  // Sync isBurnout with isBurnoutPath when auto-detected
  useEffect(() => {
    if (isBurnout) setIsBurnoutPath(true);
  }, [isBurnout]);

  const toggleSound = () => { setSoundEnabled(!soundEnabled); /* Audio logic omitted for brevity */ };
  const resetApp = () => { setView('welcome'); setStressor(''); setPerception(''); setSomaticZones([]); setIsLocked(false); setIsBurnoutPath(false); };
  
  // Simple session completion handler to increment count
  const completeSession = () => {
    setSessionCount(prev => prev + 1);
  };

  return (
    <>
      <FontStyles />
      <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden flex justify-center">
        <Atmosphere bgState={bgState} />
        <div className="w-full max-w-md h-full relative z-10 p-6">
           {view === 'welcome' && <Welcome onEnter={() => setView('manifesto')} />}
           {view === 'manifesto' && <Manifesto onContinue={() => setView('profile')} />}
           {view === 'profile' && <Identity userName={userName} setUserName={setUserName} onComplete={() => setView('dashboard')} />}
           {view === 'dashboard' && <Horizon 
             userName={userName} 
             sessionCount={sessionCount} 
             stressor={stressor} setStressor={setStressor} 
             perception={perception} setPerception={setPerception}
             stressLevel={stressLevel} setStressLevel={setStressLevel} 
             energyLevel={energyLevel} setEnergyLevel={setEnergyLevel} 
             isBurnout={isBurnout} 
             setView={setView} 
             toggleSound={toggleSound} 
             soundEnabled={soundEnabled} 
             resetApp={resetApp} 
           />}
           {view === 'preservation' && <Preservation setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} setGoal={setGoal} setExpandingBelief={setExpandingBelief} setViewToIntegration={() => { setIsLocked(true); setView('integration'); }} />}
           {view === 'burnout_check' && <BurnoutCheck setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} setBurnoutPath={setIsBurnoutPath} />}
           {view === 'somatic' && <Vessel somaticZones={somaticZones} setSomaticZones={setSomaticZones} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'partswork' && <PartsWork selectedPart={somaticZones[0] || 'Part'} sensation={sensation} setSensation={setSensation} protection={protection} setProtection={setProtection} expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief} partsStep={partsStep} setPartsStep={setPartsStep} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'laser' && <LaserCoaching stressor={stressor} perception={perception} somatic={somaticZones[0] || 'Body'} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} setGoal={setGoal} setExpandingBelief={setExpandingBelief} energyLevel={energyLevel} stressLevel={stressLevel} />}
           {view === 'lens' && <Perspective pressure={pressure} setPressure={setPressure} ability={ability} setAbility={setAbility} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'fork' && <Crossroads stressLevel={stressLevel} energyLevel={energyLevel} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'regulate' && <Breath breathing={breathing} setBreathing={setBreathing} breathCount={breathCount} setBreathCount={setBreathCount} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'alchemy' && <Alchemy setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'integration' && <Integration goal={goal} setGoal={setGoal} goalStep={goalStep} setGoalStep={setGoalStep} isLocked={isLocked} setIsLocked={setIsLocked} expandingBelief={expandingBelief} stressor={stressor} sessionCount={sessionCount} completeSession={completeSession} resetApp={resetApp} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} somaticZones={somaticZones} isBurnoutPath={isBurnoutPath} />}
           {view === 'insight' && <Insight expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'energy' && <EnergyAnalyzer setView={setView} />}
        </div>
      </div>
    </>
  );
};

export default App;