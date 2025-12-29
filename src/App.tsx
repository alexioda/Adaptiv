import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Wind, Zap, Heart, BookOpen, 
  ArrowRight, Check, Calendar, Facebook, 
  User, Target, Battery,
  Waves, Volume2, VolumeX, ChevronLeft, AlertCircle, Copy, LogOut, BarChart, RefreshCw,
  Brain, Eye, MessageCircle, Shield, Sun, Flame, Anchor, Hand, Disc, Clock, Mountain, Mail, Map, Compass,
  Moon, Coffee, MinusCircle, Thermometer, TrendingUp, AlertTriangle, Lock, Info
} from 'lucide-react';

// --- TYPES ---

interface NavProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  isDashboard?: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  resetApp?: () => void;
  progress?: number;
}

interface WelcomeProps {
  onEnter: () => void;
}

interface ManifestoProps {
  onContinue: () => void;
}

interface GateProps {
  onUnlock: () => void;
}

interface IdentityProps {
  userName: string;
  setUserName: (name: string) => void;
  onComplete: () => void;
}

interface HorizonProps {
  userName: string;
  sessionCount: number;
  stressor: string;
  setStressor: (val: string) => void;
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

interface BurnoutCheckProps {
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
  setBurnoutPath: (isBurnout: boolean) => void;
}

interface PreservationProps {
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
  setGoal: (goal: any) => void;
  setExpandingBelief: (belief: string) => void;
  setViewToMolt: () => void;
}

interface VesselProps {
  somaticZones: string[];
  setSomaticZones: (zones: string[]) => void;
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
}

interface PartsWorkProps {
  selectedPart: string;
  sensation: string;
  setSensation: (val: string) => void;
  protection: string;
  setProtection: (val: string) => void;
  expandingBelief: string;
  setExpandingBelief: (val: string) => void;
  partsStep: string;
  setPartsStep: (val: string) => void;
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
}

interface LaserCoachingProps {
  stressor: string;
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
  setGoal: (val: any) => void;
  setExpandingBelief: (val: string) => void;
}

interface PerspectiveProps {
  pressure: number;
  setPressure: (val: number) => void;
  ability: number;
  setAbility: (val: number) => void;
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
}

interface CrossroadsProps {
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
  stressLevel: number;
  energyLevel: number;
}

interface BreathProps {
  breathing: boolean;
  setBreathing: (val: boolean) => void;
  breathCount: number;
  setBreathCount: (val: number) => void;
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
}

interface AlchemyProps {
  setView: (view: string) => void;
  toggleSound: () => void;
  soundEnabled: boolean;
}

interface EnergyAnalyzerProps {
  setView: (view: string) => void;
}

interface MoltProps {
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

// --- STYLES & FONTS ---
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@200;300;400;500&display=swap');
    
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans { font-family: 'Inter', sans-serif; }
    
    .glass-panel {
      background: rgba(15, 23, 42, 0.85); 
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .glass-button {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .glass-button:active { transform: scale(0.98); }
    
    .animate-breathe { animation: breathe 8s ease-in-out infinite; }
    @keyframes breathe {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .animate-subconscious { animation: subconscious 6s ease-in-out infinite; }
    @keyframes subconscious {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.05); opacity: 0.6; }
    }

    .animate-flash { animation: flashRelease 1.5s ease-out forwards; }
    @keyframes flashRelease {
      0% { background-color: rgba(255, 255, 255, 0.8); }
      100% { background-color: transparent; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-enter { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fadeIn 1s ease-out forwards; }

    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      margin-top: -8px;
      box-shadow: 0 0 20px rgba(255,255,255,0.5);
    }
    input[type=range]::-webkit-slider-runnable-track {
      height: 4px;
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
    }
    
    .glow-pulse { animation: glowPulse 3s infinite; }
    @keyframes glowPulse {
      0% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); border-color: rgba(20, 184, 166, 0.6); }
      50% { box-shadow: 0 0 20px 0 rgba(20, 184, 166, 0.2); border-color: rgba(20, 184, 166, 1); }
      100% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); border-color: rgba(20, 184, 166, 0.6); }
    }
  `}</style>
);

// --- SHARED COMPONENTS ---

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

const Nav: React.FC<NavProps> = ({ title, subtitle, onBack, isDashboard, soundEnabled, toggleSound, resetApp, progress }) => (
  <div className="flex flex-col mb-4 pt-4 animate-enter shrink-0 relative z-50">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="font-sans text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">{subtitle}</h2>
        <h1 className="font-serif text-3xl text-white/90 italic">{title}</h1>
      </div>
      <div className="flex gap-2">
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
          <button 
            onClick={onBack} 
            className="p-3 rounded-full glass-button text-white/80 hover:text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
    </div>
    
    {progress && progress > 0 ? (
      <div className="w-full h-[2px] bg-white/5 mt-4 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-1000 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    ) : null}
  </div>
);

// --- VIEW COMPONENTS ---

const Gate: React.FC<GateProps> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    // Simple hardcoded codes for beta/corporate access
    const validCodes = ['GENESIS', 'ADAPTIV', 'EYLEADERS', 'RESILIENCE'];
    if (validCodes.includes(code.toUpperCase().trim())) {
      localStorage.setItem('adaptiv_access', 'granted');
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col justify-center items-center px-6 text-center animate-enter relative z-50">
      <div className="mb-8">
        <Lock size={48} className="text-white/80 mx-auto mb-4" strokeWidth={1} />
        <h1 className="font-serif text-3xl text-white italic">Restricted Access</h1>
        <p className="font-sans text-[10px] uppercase tracking-widest text-white/40 mt-2">Enter Access Code</p>
      </div>
      
      <div className="w-full max-w-xs space-y-6">
        <input 
          type="password" 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          placeholder="ACCESS CODE"
          className={`w-full bg-transparent border-b ${error ? 'border-red-500 text-red-500' : 'border-white/20 text-white'} py-3 text-center text-xl font-serif placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-colors`}
        />
        {error && <p className="text-red-400 text-[10px] uppercase tracking-widest animate-pulse">Invalid Code</p>}
        <button 
          onClick={handleUnlock}
          className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs font-medium tracking-widest uppercase hover:bg-white/20 transition-all"
        >
          Enter System
        </button>
      </div>
    </div>
  );
};

const Welcome: React.FC<WelcomeProps> = ({ onEnter }) => (
  <div className="h-full flex flex-col justify-center items-center px-6 text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <div className="min-h-full flex flex-col justify-center items-center py-10">
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full"></div>
        <Activity size={56} className="text-teal-200/80 relative z-10" strokeWidth={0.8} />
      </div>
      
      <div className="space-y-6 max-w-sm">
        <h2 className="font-sans text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] animate-enter">Adaptiv</h2>
        
        <h1 className="font-serif text-5xl text-white italic tracking-wide leading-tight animate-enter delay-100">
          Architecture for <br/> the Soul.
        </h1>
        
        <p className="font-sans text-sm text-white/50 leading-relaxed max-w-[280px] mx-auto animate-enter delay-200">
          Kinetic Resilience for the Modern Leader.
        </p>
      </div>
      
      <button 
        onClick={onEnter}
        className="mt-12 px-8 py-4 rounded-full bg-white/10 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/20 hover:scale-105 transition-all animate-enter delay-300 border border-white/5"
      >
        Enter the Crucible
      </button>
    </div>
  </div>
);

const Manifesto: React.FC<ManifestoProps> = ({ onContinue }) => (
  <div className="h-full flex flex-col justify-center animate-enter px-6 overflow-y-auto hide-scrollbar text-center">
     <div className="max-w-md mx-auto py-10">
       <div className="mb-10">
          <Waves size={48} className="text-teal-400/80 mx-auto mb-6 animate-pulse" strokeWidth={0.8} />
          <h1 className="font-serif text-3xl text-white italic mb-3">Alchemy, not Management.</h1>
          <p className="font-sans text-xs text-white/40 uppercase tracking-[0.2em] leading-relaxed">
            A Kinetic Shift for the Modern Mind
          </p>
       </div>

       <div className="space-y-8 font-serif text-lg text-white/80 leading-relaxed">
         <p>
           Stress is not an error. It is simply energy trapped in a loop.
         </p>
         <p>
           Most tools ask you to <em>think</em> your way out. Adaptiv asks you to <em>feel</em> your way through.
         </p>
         <p className="text-white">
           In the next few minutes, we will locate the friction in the body, listen to its message, and transmute it into fuel.
         </p>
       </div>

       <div className="my-12 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

       <p className="font-sans text-[10px] uppercase tracking-widest text-white/40 mb-6">
         The Only Requirement
       </p>
       <p className="font-serif text-white/90 italic mb-10">
         "Do not rush. When the screen says breathe, actually breathe."
       </p>

       <button 
        onClick={onContinue}
        className="w-full py-5 rounded-full bg-white/5 border border-white/10 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/30 transition-all"
       >
         Begin
       </button>
     </div>
  </div>
);

const Identity: React.FC<IdentityProps> = ({ userName, setUserName, onComplete }) => (
  <div className="h-full flex flex-col justify-center items-center px-6 text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <div className="min-h-full flex flex-col justify-center items-center py-10 w-full">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
        <Activity size={48} className="text-white/80 relative z-10" strokeWidth={1} />
      </div>
      <h1 className="font-serif text-5xl text-white mb-2 italic tracking-wide">Adaptiv</h1>
      <p className="font-sans text-white/40 text-xs tracking-[0.2em] uppercase mb-12">Architecture for the Soul</p>
      
      <div className="w-full max-w-xs space-y-6 relative z-50">
        <input 
          type="text" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && userName && onComplete()}
          placeholder="Enter Name / Alias"
          className="w-full bg-transparent border-b border-white/20 py-3 text-center text-white text-xl font-serif placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-colors"
        />
        <button 
          onClick={onComplete}
          disabled={!userName}
          className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs font-medium tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Begin
        </button>
      </div>
    </div>
  </div>
);

const Horizon: React.FC<HorizonProps> = ({ userName, sessionCount, stressor, setStressor, stressLevel, setStressLevel, energyLevel, setEnergyLevel, isBurnout, setView, toggleSound, soundEnabled, resetApp }) => {
  // PROTOCOL LOGIC
  const [activeDay, setActiveDay] = useState(1);
  const [showWorkCheck, setShowWorkCheck] = useState(false);
  
  useEffect(() => {
    const savedDay = localStorage.getItem('adaptiv_protocol_day');
    if (savedDay) setActiveDay(parseInt(savedDay));
  }, []);

  // DETECT WORK KEYWORDS
  useEffect(() => {
    const workKeywords = ['work', 'job', 'boss', 'career', 'project', 'deadline', 'email', 'client', 'business', 'manager', 'shift', 'hospital', 'patient'];
    const hasKeyword = workKeywords.some(keyword => stressor.toLowerCase().includes(keyword));
    setShowWorkCheck(hasKeyword);
  }, [stressor]);

  const days = [
    { day: 1, title: "The Vessel", focus: "Somatic Map", icon: Map },
    { day: 2, title: "The Protector", focus: "Parts Work", icon: Shield },
    { day: 3, title: "The Drain", focus: "Energy Audit", icon: Battery },
    { day: 4, title: "The Pivot", focus: "Reframing", icon: RefreshCw },
    { day: 5, title: "The Stillness", focus: "Regulation", icon: Wind },
    { day: 6, title: "The Vision", focus: "Future Self", icon: Compass },
    { day: 7, title: "Genesis", focus: "Integration", icon: Mountain },
  ];

  const startProtocolDay = (day: { day: number; focus: string }) => {
    setStressor(`Day ${day.day}: ${day.focus}`);
    setView('somatic');
  };

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
        
        {/* PROTOCOL TRACKER */}
        <div className="glass-panel p-6 rounded-[32px] border-teal-500/20 relative overflow-hidden">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl text-teal-100 italic">Genesis Protocol</h3>
              <span className="font-sans text-[10px] uppercase tracking-widest text-teal-400 bg-teal-900/30 px-2 py-1 rounded">Day {activeDay} / 7</span>
           </div>
           
           <div className="flex justify-between mb-6 relative z-10">
              {days.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2">
                   <div 
                     className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                       d.day === activeDay ? 'bg-teal-500 text-slate-900 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.5)]' : 
                       d.day < activeDay ? 'bg-teal-900/50 text-teal-400 border-teal-800' : 
                       'bg-white/5 text-white/20 border-white/10'
                     }`}
                   >
                     {d.day < activeDay ? <Check size={12}/> : d.day}
                   </div>
                </div>
              ))}
              <div className="absolute top-4 left-4 right-4 h-[1px] bg-white/10 -z-10"></div>
           </div>

           <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 mb-4">
              <div className="p-3 bg-teal-500/20 rounded-full text-teal-200">
                 {React.createElement(days[activeDay-1].icon, { size: 20 })}
              </div>
              <div>
                 <p className="font-sans text-[10px] text-white/40 uppercase tracking-widest">Current Mission</p>
                 <p className="font-serif text-lg text-white italic">{days[activeDay-1].title}</p>
              </div>
           </div>

           <button 
             onClick={() => startProtocolDay(days[activeDay-1])}
             className="w-full py-3 rounded-xl bg-teal-500 text-slate-900 font-sans text-xs font-bold tracking-widest uppercase hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]"
           >
             Begin Day {activeDay}
           </button>
        </div>

        {/* CHECK-IN */}
        <div className={`glass-panel p-8 rounded-[32px] transition-all duration-700 ${isBurnout ? 'border-orange-500/20' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-serif text-xl text-white/90 italic">Internal Weather</h3>
            {isBurnout && <AlertCircle size={18} className="text-orange-400/80 animate-pulse"/>}
          </div>
          <p className="font-sans text-xs text-white/50 mb-8 leading-relaxed">
            Calibrate your current state.
          </p>
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between font-sans text-[10px] tracking-widest text-white/50">
                <span>PRESSURE</span>
                <span>{stressLevel}%</span>
              </div>
              <input type="range" min="0" max="100" value={stressLevel} onChange={(e) => setStressLevel(Number(e.target.value))} className="w-full appearance-none bg-white/10 h-1 rounded-full cursor-pointer" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between font-sans text-[10px] tracking-widest text-white/50">
                <span>VITALITY</span>
                <span>{energyLevel}%</span>
              </div>
              <input type="range" min="0" max="100" value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value))} className="w-full appearance-none bg-white/10 h-1 rounded-full cursor-pointer" />
            </div>
          </div>
        </div>

        {isBurnout ? (
          <div className="animate-enter delay-100">
            <p className="font-serif text-2xl text-orange-100/90 text-center italic mb-2">The vessel is depleted.</p>
            <p className="font-sans text-xs text-orange-200/50 text-center mb-6 max-w-[280px] mx-auto">
              Ambition without fuel is destruction. We must preserve.
            </p>
            <button 
              onClick={() => setView('preservation')}
              className="w-full py-5 rounded-full bg-gradient-to-r from-orange-900/40 to-amber-900/40 border border-orange-500/20 text-orange-100 font-sans text-xs tracking-widest uppercase hover:border-orange-500/40 transition-all"
            >
              Enter Preservation
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-enter delay-100">
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 px-2">
                 <span className="font-sans text-[10px] uppercase tracking-widest text-white/30">Quick Session</span>
              </div>
              <input 
                type="text"
                value={stressor}
                onChange={(e) => setStressor(e.target.value)}
                placeholder="What weighs on you?"
                className="w-full glass-panel p-6 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:bg-white/5 transition-all font-serif text-lg italic text-center"
              />
            </div>
            
            {/* THE SOUL DRAIN DETECTOR - NOW A PROMINENT CARD */}
            {showWorkCheck && (
              <div className="animate-enter">
                <button 
                  onClick={() => setView('burnout_check')}
                  className="w-full py-4 rounded-xl bg-orange-900/40 border border-orange-500/50 text-orange-200 flex items-center justify-center gap-3 hover:bg-orange-900/60 transition-all shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                >
                  <Coffee size={16} className="text-orange-400"/>
                  <div className="text-left">
                    <p className="font-serif text-sm italic">Is this draining your soul?</p>
                    <p className="font-sans text-[9px] uppercase tracking-widest opacity-60">Take the Spark Check</p>
                  </div>
                  <ArrowRight size={14} className="ml-auto opacity-50"/>
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setView('somatic')}
              disabled={!stressor}
              className="w-full py-5 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:shadow-none"
            >
              Begin Alchemy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- BURNOUT ASSESSMENT (UPDATED: 6 QUESTIONS + RESULTS CARD + SCROLL) ---
const BurnoutCheck: React.FC<BurnoutCheckProps> = ({ setView, toggleSound, soundEnabled, setBurnoutPath }) => {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0); // Using score instead of simple count
  const [selected, setSelected] = useState<number | null>(null); // 0 = No, 1 = Yes
  const [showResult, setShowResult] = useState(false);

  const questions = [
    { q: "Physical State", text: "Do you feel tired even after sleep, or have physical symptoms like headaches or stomach knots?" },
    { q: "Emotional State", text: "Do you feel increasingly cynical, detached, or negative about your work or the people you work with?" },
    { q: "Cognitive Fog", text: "Are you finding it hard to concentrate, or do you feel like you're working harder but accomplishing less?" },
    { q: "Relational Snap", text: "Are you more irritable or impatient with colleagues, friends, or family than usual?" },
    { q: "Anticipatory Dread", text: "Do you feel a sense of dread or heavy anxiety on Sunday nights or before starting your shift?" },
    { q: "Recovery Lag", text: "Does it take you longer than a weekend to feel like yourself again?" }
  ];

  const confirmAnswer = () => {
    if (selected === null) return;
    const newScore = score + selected;
    setScore(newScore);
    setSelected(null);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const getResult = () => {
    if (score <= 2) return { 
      type: "Friction (Acute Stress)", 
      desc: "You are under pressure, but the engine is still intact. You need to discharge the stress, not stop the car.", 
      action: "Use 'Laser Coaching' to reframe the immediate stressor.",
      isBurnout: false 
    };
    if (score <= 4) return { 
      type: "Smoldering (Early Burnout)", 
      desc: "The warning lights are on. Your cynicism is a defense mechanism. If you push harder now, you will break.", 
      action: "You need boundaries. Use 'Preservation Mode' to audit your energy leaks.",
      isBurnout: true 
    };
    return { 
      type: "Inferno (Full Burnout)", 
      desc: "Your battery isn't just empty; it's damaged. You cannot 'mindset' your way out of this. You need physiological safety.", 
      action: "Emergency Brake. Stop. Use 'Preservation Mode' to find one safe harbor.",
      isBurnout: true 
    };
  };

  const resultData = getResult();

  if (showResult) {
    return (
      <div className="h-full flex flex-col justify-center animate-enter px-6 overflow-y-auto hide-scrollbar">
        <div className="flex-1 flex flex-col justify-center items-center text-center py-10">
          <div className={`mb-6 p-6 rounded-full border ${resultData.isBurnout ? 'bg-orange-900/30 border-orange-500/50' : 'bg-teal-900/30 border-teal-500/50'}`}>
             {resultData.isBurnout ? <Thermometer size={48} className="text-orange-400" /> : <Activity size={48} className="text-teal-400" />}
          </div>
          
          <p className="font-sans text-[10px] uppercase tracking-widest opacity-60 mb-2">Diagnostic Result</p>
          <h2 className="font-serif text-3xl text-white italic mb-4">{resultData.type}</h2>
          <p className="font-sans text-sm text-white/70 leading-relaxed mb-8 max-w-xs">
            {resultData.desc}
          </p>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 w-full mb-8">
            <h4 className="font-serif text-white italic mb-2 text-sm flex items-center justify-center gap-2"><Info size={14}/> The Deeper Why</h4>
            <p className="font-sans text-[10px] uppercase tracking-widest text-white/50 mb-2">Recommended Protocol</p>
            <p className="font-serif text-lg text-white italic">{resultData.action}</p>
            <p className="font-sans text-[10px] text-white/40 mt-4 leading-relaxed border-t border-white/5 pt-4">
              This quick scan captures your current state. To understand the root cause—your Energy Leadership levels—and fix this permanently, the full ELI Assessment is required.
            </p>
          </div>

          <button 
            onClick={() => {
              setBurnoutPath(resultData.isBurnout);
              setView(resultData.isBurnout ? 'preservation' : 'laser');
            }}
            className={`w-full py-4 rounded-full font-sans text-xs font-bold tracking-widest uppercase transition-all ${resultData.isBurnout ? 'bg-orange-500 text-slate-900 hover:bg-orange-400' : 'bg-teal-500 text-slate-900 hover:bg-teal-400'}`}
          >
            Begin Protocol
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
       <Nav title="The Spark Audit" subtitle={`Question ${step + 1} / 6`} onBack={() => setView('dashboard')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={((step + 1) / 6) * 100} />
       
       <div className="flex-1 flex flex-col justify-start items-center text-center overflow-y-auto hide-scrollbar pb-8 animate-enter px-6 pt-8">
          <h3 className="font-serif text-2xl text-white italic mb-2 shrink-0">{questions[step].q}</h3>
          <p className="font-sans text-sm text-white/70 leading-relaxed mb-8 max-w-xs shrink-0">
            {questions[step].text}
          </p>

          <div className="w-full space-y-4 shrink-0">
             <button 
                onClick={() => setSelected(1)} 
                className={`w-full py-5 rounded-xl border font-sans text-xs tracking-widest uppercase transition-all ${selected === 1 ? 'bg-orange-500/20 border-orange-500 text-orange-200' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
             >
                Yes, frequently
             </button>
             <button 
                onClick={() => setSelected(0)} 
                className={`w-full py-5 rounded-xl border font-sans text-xs tracking-widest uppercase transition-all ${selected === 0 ? 'bg-teal-500/20 border-teal-500 text-teal-200' : 'bg-transparent border-white/5 text-white/50 hover:bg-white/5'}`}
             >
                No, rarely
             </button>

             <button 
                onClick={confirmAnswer}
                disabled={selected === null}
                className="w-full mt-6 py-4 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-0 disabled:translate-y-2"
             >
                Next
             </button>
          </div>
       </div>
    </div>
  );
};

// --- ENERGY ANALYZER (UPDATED: 6 QUESTIONS + RESULTS CARD + SCROLL) ---
const EnergyAnalyzer: React.FC<EnergyAnalyzerProps> = ({ setView }) => {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [result, setResult] = useState<number | null>(null);
    const [selected, setSelected] = useState<number | null>(null);

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
        setSelected(null);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            const final = Math.round(newScore / questions.length);
            setResult(final);
        }
    };

    const getResultText = (level: number) => {
        const levels: Record<number, { title: string; desc: string; type: string }> = {
            1: { title: "Level 1: The Victim", type: "Catabolic", desc: "You are identifying as the effect, not the cause. Coaching can help you regain agency." },
            2: { title: "Level 2: The Fighter", type: "Catabolic", desc: "You have high energy, but it's fueled by conflict. We can transmute this into construction." },
            3: { title: "Level 3: The Rationalizer", type: "Anabolic", desc: "You are coping well. You take responsibility and rationalize stress to get through the day." },
            4: { title: "Level 4: The Caregiver", type: "Anabolic", desc: "You are driven by compassion and service. Be careful not to give so much that you deplete yourself." },
            5: { title: "Level 5: The Opportunist", type: "Anabolic", desc: "You see problems as possibilities. You don't fight stress; you transform it. This is high-performance." },
            6: { title: "Level 6: The Visionary", type: "Anabolic", desc: "You are connected to a larger purpose. Intuition guides you. This is the zone of genius." }
        };
        return levels[level] || levels[3]; 
    };

    if (result) {
        const data = getResultText(result);
        return (
            <div className="h-full flex flex-col justify-center animate-enter text-center px-4 overflow-y-auto hide-scrollbar">
                <div className="py-10">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] border-2 ${data.type === 'Catabolic' ? 'bg-red-500/20 border-red-500' : 'bg-teal-500/20 border-teal-500'}`}>
                        {data.type === 'Catabolic' ? <AlertTriangle size={40} className="text-red-400" /> : <Zap size={40} className="text-teal-400" />}
                    </div>
                    
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-60 mb-2">Your Energy Leadership Level</p>
                    <h2 className="font-serif text-3xl text-white italic mb-2">{data.title}</h2>
                    <p className="font-sans text-xs text-white/50 uppercase tracking-widest mb-6 border border-white/10 inline-block px-3 py-1 rounded-full">{data.type} Energy</p>
                    
                    <p className="font-sans text-sm text-white/70 mb-10 leading-relaxed max-w-xs mx-auto">{data.desc}</p>
                    
                    <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
                        <h4 className="font-serif text-white italic mb-2 text-sm flex items-center justify-center gap-2"><Info size={14}/> The Deeper Why</h4>
                        <h4 className="font-serif text-white italic mb-2">The Prescription:</h4>
                        <p className="font-sans text-xs text-white/60">
                           {data.type === 'Catabolic' 
                             ? "Your engine is running on 'dirty fuel' (fear/anger). This causes burnout. We need to shift you to Level 3 (Responsibility) immediately."
                             : "You are running clean fuel. To sustain this, focus on 'The Vision' protocol to lock in this state."
                           }
                        </p>
                        <p className="font-sans text-[10px] text-white/40 mt-4 leading-relaxed border-t border-white/5 pt-4">
                           This quick scan captures your current state. To understand the root cause—your Energy Leadership levels—and fix this permanently, the full ELI Assessment is required.
                        </p>
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
            <Nav title="Energy Lens" subtitle={`Question ${step + 1} / 6`} onBack={() => setView('molt')} toggleSound={() => {}} soundEnabled={false} progress={((step + 1) / 6) * 100} />
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
    // ADDED overflow-y-auto to this view as well
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

const Molt: React.FC<MoltProps> = ({ goal, setGoal, goalStep, setGoalStep, isLocked, setIsLocked, expandingBelief, stressor, sessionCount, completeSession, resetApp, setView, toggleSound, soundEnabled, somaticZones, isBurnoutPath }) => {
  const [primingDone, setPrimingDone] = useState(false);
  
  const steps = [
      { id: 'outcome', q: 'The Goal', ph: 'What is the desired outcome?' },
      { id: 'action', q: 'The Action', ph: 'What is the single step?' },
      { id: 'when', q: 'The Commitment', ph: 'When will you do it?' }
  ];
  
  useEffect(() => {
      if (goal.outcome && goal.action && goalStep === 0) {
          setGoalStep(2);
      }
      if (goal.outcome === undefined) {
          setGoal({ outcome: '', action: '', when: '' });
      }
  }, [goal.outcome, goal.action, goalStep]);

  const current = steps[Math.min(goalStep, steps.length - 1)];
  const partName = somaticZones[0] || 'Body';

  const generateLink = () => `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Adaptiv: ' + (goal.action || 'Action'))}&details=${encodeURIComponent('Goal: ' + (goal.outcome || 'Outcome') + '\n\nMindset: ' + expandingBelief)}`;
  
  const copyArtifact = () => {
      const artifact = `ADAPTIV SESSION #${sessionCount + 1}\n\nSTRESSOR: ${stressor}\nENERGY RECLAIMED FROM: ${partName}\nNEW TRUTH: ${expandingBelief}\nGOAL: ${goal.outcome}\nACTION: ${goal.action} (by ${goal.when})\n\nGenerated by Adaptiv.`;
      navigator.clipboard.writeText(artifact);
      completeSession();
      alert("Session Artifact copied to clipboard. Share it on your story.");
  };

  const generateEmailLink = () => {
      const subject = `Adaptiv Session #${sessionCount + 1}: ${stressor}`;
      const body = `ADAPTIV SESSION ARTIFACT\n\nSTRESSOR: ${stressor}\nENERGY RECLAIMED FROM: ${partName}\n\nTHE NEW TRUTH: "${expandingBelief}"\n\nGOAL: ${goal.outcome}\nACTION: ${goal.action}\nWHEN: ${goal.when}\n\n(CC save@alexioda.com to log this session)`;
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const quickTimes = ["Now", "Within 1 Hr", "Today", "Tomorrow"];
  
  // DYNAMIC WORKBOOK LOGIC
  const isBurnout = isBurnoutPath;
  const workbookTitle = isBurnout ? "Burnout Rescue Kit" : "The Alchemist's Field Guide";
  const workbookDesc = isBurnout ? "Emergency Protocol + Audio ($27)" : "Get the 7-Day Protocol ($27)";
  const workbookLink = "https://alexioda.gumroad.com/l/hltqhb";

  // RENDER LOGIC FOR PRIMING VS SUMMARY
  if (isLocked && !primingDone && !isBurnoutPath) { // No priming needed for burnout path (already done in preservation)
    return (
      <div className="h-full flex flex-col relative z-20">
         <Nav 
            title="Integration" 
            subtitle="Embodiment" 
            onBack={() => { setIsLocked(false); }} 
            soundEnabled={soundEnabled} 
            toggleSound={toggleSound} 
            progress={90}
         />
         <Priming onComplete={() => setPrimingDone(true)} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative z-20">
       <Nav 
          title="Integration" 
          subtitle="Molt Complete" 
          onBack={() => setView('fork')} 
          soundEnabled={soundEnabled} 
          toggleSound={toggleSound} 
          progress={100}
       />
       <div className="text-center pt-2 mb-8 animate-enter">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 border border-white/10 ${isBurnoutPath ? 'bg-orange-500/20' : 'bg-gradient-to-tr from-indigo-500/20 to-teal-500/20'}`}>
              {isBurnoutPath ? <Moon className="text-orange-200" size={24}/> : <Check className="text-white" size={24} />}
          </div>
          <h1 className="font-serif text-3xl text-white italic">Integration</h1>
          <p className="font-sans text-[10px] uppercase tracking-widest text-white/40 mt-2">The Molt is Complete</p>
       </div>

       <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 animate-enter delay-100">
          <div className={`glass-panel p-8 rounded-[32px] mb-6 relative overflow-hidden transition-all duration-1000 ${isLocked ? 'animate-flash' : ''}`}>
              {!isLocked ? (
                  <div className="animate-fade-in relative z-10">
                      <div className="flex justify-between items-center mb-6">
                          <span className="font-sans text-[10px] uppercase tracking-widest text-white/40">Seal the Contract</span>
                          <span className="font-sans text-[10px] text-white/20">{goalStep + 1} / 3</span>
                      </div>
                      <h3 className="font-serif text-xl text-white italic mb-6">{current.q}</h3>
                      
                      {current.id === 'when' ? (
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-3">
                              {quickTimes.map(time => (
                                <button
                                  key={time}
                                  onClick={() => {
                                    setGoal({...goal, when: time});
                                    setIsLocked(true);
                                  }}
                                  className="py-3 rounded-xl border border-white/20 bg-white/5 text-sm font-sans text-white/90 hover:bg-white/20 hover:border-white/40 hover:text-white transition-all shadow-sm"
                                >
                                  {time}
                                </button>
                              ))}
                           </div>
                           <p className="text-center text-[10px] text-white/30 uppercase tracking-widest mt-4">Select to Seal</p>
                        </div>
                      ) : (
                        <>
                          <input 
                             autoFocus
                             className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors mb-6 placeholder:text-white/10"
                             placeholder={current.ph}
                             value={goal[current.id as keyof typeof goal]}
                             onChange={e => setGoal({...goal, [current.id]: e.target.value})}
                             onKeyDown={e => {
                                 if (e.key === 'Enter' && goal[current.id as keyof typeof goal]) {
                                     if (goalStep < 2) setGoalStep(goalStep + 1);
                                     else setIsLocked(true);
                                 }
                             }}
                          />
                          <div className="flex gap-3">
                               {goalStep > 0 && <button onClick={() => setGoalStep(goalStep - 1)} className="px-4 py-3 rounded-xl border border-white/10 text-white/40">Back</button>}
                               <button 
                                  disabled={!goal[current.id as keyof typeof goal]}
                                  onClick={() => { if (goalStep < 2) setGoalStep(goalStep + 1); else setIsLocked(true); }}
                                  className="flex-1 py-3 rounded-xl bg-white text-slate-900 font-bold font-sans text-xs uppercase tracking-widest disabled:opacity-50"
                               >
                                  Next
                               </button>
                          </div>
                        </>
                      )}
                  </div>
              ) : (
                  <div className="text-center animate-fade-in relative z-10">
                      {/* REDESIGNED VISUAL ARTIFACT CARD */}
                      <div className={`mb-8 p-8 rounded-2xl border text-center relative overflow-hidden shadow-2xl ${isBurnoutPath ? 'bg-slate-900 border-orange-900/50' : 'bg-gradient-to-br from-teal-900/40 to-slate-900/80 border-teal-500/30'}`}>
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                              {isBurnoutPath ? <Moon size={80} className="text-orange-200" /> : <Zap size={80} />}
                          </div>
                          <div className="absolute top-4 left-4">
                              <Activity size={16} className={isBurnoutPath ? "text-orange-400" : "text-teal-400"} />
                          </div>
                          
                          <p className={`font-sans text-[9px] uppercase tracking-[0.3em] mb-6 mt-2 ${isBurnoutPath ? 'text-orange-200/60' : 'text-teal-200/60'}`}>
                            {isBurnoutPath ? 'Permission Slip' : 'Adaptiv Artifact'}
                          </p>
                          
                          <h2 className="font-serif text-2xl text-white italic leading-snug mb-2">"{expandingBelief}"</h2>
                          <div className={`w-12 h-[1px] mx-auto mb-6 ${isBurnoutPath ? 'bg-orange-500/50' : 'bg-teal-500/50'}`}></div>
                          
                          <div className="space-y-2">
                             <p className="font-sans text-[10px] text-white/40 uppercase tracking-widest">
                                {isBurnoutPath ? 'Current Status' : 'Goal'}
                             </p>
                             <p className={`font-serif text-lg italic ${isBurnoutPath ? 'text-orange-100' : 'text-teal-100'}`}>"{goal.outcome}"</p>
                          </div>
                      </div>
                      
                      <div className="text-center space-y-4 mb-8">
                         <p className="font-serif text-white/90 italic">Mission Complete.</p>
                         <p className="font-sans text-xs text-white/60 leading-relaxed max-w-[280px] mx-auto">
                            You have mapped the friction and forged a new truth. Carry this state into your next task. You are the Architect.
                         </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                          <button onClick={copyArtifact} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors gap-2">
                              <Copy size={20}/> 
                              <span className="text-[10px] font-bold uppercase tracking-wide">Copy Text</span>
                          </button>
                          
                          {/* NEW EMAIL TO SELF FEATURE */}
                          <a href={generateEmailLink()} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors gap-2">
                              <Mail size={20}/>
                              <span className="text-[10px] font-bold uppercase tracking-wide">Email Self</span>
                          </a>
                      </div>
                      
                      <a href={generateLink()} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-teal-900/30 border border-teal-500/30 text-teal-200 hover:bg-teal-900/50 transition-colors text-xs font-bold uppercase tracking-wide">
                          <Calendar size={14}/> Add to Calendar
                      </a>
                  </div>
              )}
          </div>

          {/* WORKBOOK UPSELL BUTTON */}
          <a 
            href={workbookLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`w-full mb-8 py-4 rounded-2xl border flex items-center justify-center gap-3 group transition-all cursor-pointer ${isBurnoutPath ? 'border-orange-500/30 bg-orange-900/10 hover:bg-orange-900/30' : 'border-indigo-500/30 bg-indigo-900/10 hover:bg-indigo-900/30'}`}
          >
            <div className={`p-2 rounded-full transition-colors ${isBurnoutPath ? 'bg-orange-500/20 group-hover:bg-orange-500/40' : 'bg-indigo-500/20 group-hover:bg-indigo-500/40'}`}>
              <BookOpen size={18} className={isBurnoutPath ? "text-orange-200" : "text-indigo-200"} />
            </div>
            <div className="text-left">
              <p className={`font-serif italic text-lg leading-none ${isBurnoutPath ? "text-orange-100" : "text-indigo-100"}`}>{workbookTitle}</p>
              <p className={`font-sans text-[10px] uppercase tracking-wider mt-1 ${isBurnoutPath ? "text-orange-300" : "text-indigo-300"}`}>{workbookDesc}</p>
            </div>
            <ArrowRight size={16} className={`group-hover:translate-x-1 transition-all ${isBurnoutPath ? "text-orange-300/50 group-hover:text-orange-300" : "text-indigo-300/50 group-hover:text-indigo-300"}`}/>
          </a>

          {isLocked && (
              <button 
                onClick={() => setView('energy')}
                className="w-full mb-6 py-5 rounded-[24px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-100 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all flex items-center justify-center gap-3"
              >
                  <BarChart size={16} /> Unlock Energy Profile
              </button>
          )}

          <div className="relative overflow-hidden p-8 rounded-[32px] glass-panel group cursor-pointer transition-all hover:bg-white/5">
               <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                   <Facebook size={100} className="text-blue-400" />
               </div>
               <h3 className="font-serif text-xl text-white italic mb-2">Deepen the Work</h3>
               <p className="font-sans text-xs text-white/50 mb-6 leading-relaxed max-w-[80%]">
                  You have begun the shift. Cement this architecture with a 1:1 session at Conscious Growth Coaching.
               </p>
               <a href="https://www.facebook.com/alexiodacoaching" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-200 hover:bg-blue-600/40 transition-colors text-xs font-bold uppercase tracking-wide">
                  Visit Facebook Page <ArrowRight size={14} />
               </a>
          </div>
          
          <button onClick={resetApp} className="mt-8 mx-auto flex items-center gap-2 text-white/20 hover:text-white transition-colors text-[10px] uppercase tracking-widest">
              <RefreshCw size={12} /> Reset System
          </button>
       </div>
    </div>
  );
};
  
  // --- MAIN RENDER ---
  const AdaptivEthereal = () => {
  // --- STATE ---
  const [view, setView] = useState('welcome'); // Starts at welcome (removed gate)
  const [bgState, setBgState] = useState('neutral'); 
  
  // User & Data
  const [userName, setUserName] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const [stressor, setStressor] = useState(''); 
  const [stressLevel, setStressLevel] = useState(50);
  const [energyLevel, setEnergyLevel] = useState(50);
  const [isBurnout, setIsBurnout] = useState(false);
  const [isBurnoutPath, setBurnoutPath] = useState(false); // NEW STATE FOR BRANCHING
  
  // Protocol State
  const [somaticZones, setSomaticZones] = useState<string[]>([]);
  const [partsStep, setPartsStep] = useState('experience'); // experience, connect, message, channel
  const [sensation, setSensation] = useState('');
  const [protection, setProtection] = useState('');
  const [expandingBelief, setExpandingBelief] = useState('');
  
  const [pressure, setPressure] = useState(50);
  const [ability, setAbility] = useState(50);
  
  // Goals & Tools
  const [goal, setGoal] = useState({ what: '', measure: '', when: '', outcome: '', action: '' });
  const [goalStep, setGoalStep] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  
  // Audio
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<any>(null);
  const noiseNodeRef = useRef<any>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    try {
      const savedAccess = localStorage.getItem('adaptiv_access');
      if (savedAccess === 'granted') {
          setView('welcome');
      }

      const savedUser = localStorage.getItem('adaptiv_user');
      const savedCount = localStorage.getItem('adaptiv_sessions');
      
      if (savedUser) {
        setUserName(savedUser);
        setSessionCount(savedCount ? parseInt(savedCount) : 0);
        if (savedAccess === 'granted') setView('dashboard');
      }
    } catch (e) {
      console.log("Storage access denied or empty, starting fresh.");
    }
  }, []);

  const saveProfile = () => {
    setUserName(userName);
    try {
      localStorage.setItem('adaptiv_user', userName);
      localStorage.setItem('adaptiv_sessions', '0');
    } catch (e) {}
    setView('dashboard');
  };

  const completeSession = () => {
    const newCount = sessionCount + 1;
    setSessionCount(newCount);
    try {
      localStorage.setItem('adaptiv_sessions', newCount.toString());
      // Logic to advance the protocol day (optional)
      const currentDay = localStorage.getItem('adaptiv_protocol_day') || '1';
      if (parseInt(currentDay) < 7) {
         localStorage.setItem('adaptiv_protocol_day', (parseInt(currentDay) + 1).toString());
      }
    } catch (e) {}
  };

  const resetApp = () => {
    try {
      localStorage.removeItem('adaptiv_user');
      localStorage.removeItem('adaptiv_sessions');
      localStorage.removeItem('adaptiv_protocol_day');
      // Note: We deliberately do NOT remove 'adaptiv_access' so they don't have to re-enter code.
    } catch (e) {}
    setUserName('');
    setSessionCount(0);
    setStressor('');
    setSomaticZones([]);
    setSensation('');
    setProtection('');
    setExpandingBelief('');
    setGoal({ what: '', measure: '', when: '', outcome: '', action: '' });
    setIsLocked(false);
    setPartsStep('experience');
    setBurnoutPath(false);
    setView('welcome');
  };

  // --- AUDIO ENGINE ---
  const toggleSound = () => {
    if (soundEnabled) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setSoundEnabled(false);
    } else {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const bufferSize = 4096;
      const brownNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
      
      brownNoise.onaudioprocess = (e: any) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; 
        }
      };
      
      let lastOut = 0;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.05; 
      
      brownNoise.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      audioContextRef.current = ctx;
      noiseNodeRef.current = brownNoise;
      setSoundEnabled(true);
    }
  };

  // --- LOGIC ---
  useEffect(() => {
    if (view === 'preservation' || isBurnoutPath) setBgState('preservation');
    else if (view === 'laser') setBgState('laser');
    else if (view === 'regulate' || breathing) setBgState('flow');
    else if (stressLevel > 75 && energyLevel > 40) setBgState('friction');
    else if (stressLevel > 80 && energyLevel < 30) setBgState('preservation');
    else setBgState('neutral');
  }, [view, stressLevel, energyLevel, breathing, isBurnoutPath]);

  useEffect(() => {
    setIsBurnout(stressLevel > 80 && energyLevel < 30);
  }, [stressLevel, energyLevel]);

  useEffect(() => {
    if (!breathing) return;
    const interval = setInterval(() => setBreathCount(c => (c + 1) % 16), 1000);
    return () => clearInterval(interval);
  }, [breathing]);

  return (
    <>
      <FontStyles />
      <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden flex justify-center">
        <Atmosphere bgState={bgState} />
        <div className="w-full max-w-md h-full relative z-10 p-6">
           {view === 'loading' && <div />}
           {view === 'gate' && <Gate onUnlock={() => setView('welcome')} />}
           {view === 'welcome' && <Welcome onEnter={() => setView('manifesto')} />}
           {view === 'manifesto' && <Manifesto onContinue={() => setView('profile')} />}
           {view === 'profile' && <Identity userName={userName} setUserName={setUserName} onComplete={saveProfile} />}
           {view === 'dashboard' && <Horizon 
              userName={userName} sessionCount={sessionCount} 
              stressor={stressor} setStressor={setStressor} 
              stressLevel={stressLevel} setStressLevel={setStressLevel} 
              energyLevel={energyLevel} setEnergyLevel={setEnergyLevel} 
              isBurnout={isBurnout} setView={setView} 
              toggleSound={toggleSound} soundEnabled={soundEnabled} resetApp={resetApp}
           />}
           {view === 'preservation' && <Preservation 
              setView={setView} 
              toggleSound={toggleSound} 
              soundEnabled={soundEnabled} 
              setGoal={setGoal} 
              setExpandingBelief={setExpandingBelief} 
              setViewToMolt={() => { setIsLocked(true); setView('molt'); }}
           />}
           {view === 'burnout_check' && <BurnoutCheck setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} setBurnoutPath={setBurnoutPath} />}
           
           {view === 'somatic' && <Vessel somaticZones={somaticZones} setSomaticZones={setSomaticZones} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           
           {/* Replaced Narrative with PartsWork */}
           {view === 'partswork' && <PartsWork 
              selectedPart={somaticZones[0] || 'Part'} 
              sensation={sensation} setSensation={setSensation}
              protection={protection} setProtection={setProtection}
              expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief}
              partsStep={partsStep} setPartsStep={setPartsStep}
              setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} 
           />}
           
           {view === 'laser' && <LaserCoaching stressor={stressor} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} setGoal={setGoal} setExpandingBelief={setExpandingBelief} />}
           {view === 'lens' && <Perspective pressure={pressure} setPressure={setPressure} ability={ability} setAbility={setAbility} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'fork' && <Crossroads stressLevel={stressLevel} energyLevel={energyLevel} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'regulate' && <Breath breathing={breathing} setBreathing={setBreathing} breathCount={breathCount} setBreathCount={setBreathCount} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'alchemy' && <Alchemy setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'molt' && <Molt goal={goal} setGoal={setGoal} goalStep={goalStep} setGoalStep={setGoalStep} isLocked={isLocked} setIsLocked={setIsLocked} expandingBelief={expandingBelief} stressor={stressor} sessionCount={sessionCount} completeSession={completeSession} resetApp={resetApp} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} somaticZones={somaticZones} isBurnoutPath={isBurnoutPath} />}
           {view === 'energy' && <EnergyAnalyzer setView={setView} />}
        </div>
      </div>
    </>
  );
};

export default AdaptivEthereal;