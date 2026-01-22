import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Wind, Zap, Heart, BookOpen, 
  ArrowRight, Check, Calendar, Facebook, 
  User, Target, Waves, Volume2, VolumeX, 
  ChevronLeft, AlertCircle, Copy, LogOut, RefreshCw,
  Brain, Eye, MessageCircle, Shield, Sun, Anchor, Hand, Disc, Mountain, Mail, 
  MinusCircle, AlertTriangle, Info, FileText, Thermometer, Sparkles, Loader2, WifiOff, Home, BatteryWarning, ExternalLink, HelpCircle
} from 'lucide-react';

// --- SOUND ENGINE (Web Audio API) ---
// Uses Oscillators to avoid external MP3 dependencies
class SoundEngine {
  ctx: AudioContext | null = null;
  osc: OscillatorNode | null = null;
  gain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gain = this.ctx.createGain();
      this.gain.connect(this.ctx.destination);
      this.gain.gain.value = 0; // Start silent
    }
  }

  playDrone() {
    if (!this.ctx || !this.gain) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    
    // Stop existing
    if (this.osc) { this.osc.stop(); this.osc.disconnect(); }

    // Create a deep "Theta" drone (110Hz - A2 key approx)
    this.osc = this.ctx!.createOscillator();
    this.osc.type = 'sine';
    this.osc.frequency.setValueAtTime(110, this.ctx!.currentTime);
    
    this.osc.connect(this.gain!);
    this.osc.start();
    
    // Fade in
    this.gain!.gain.setTargetAtTime(0.05, this.ctx!.currentTime, 2);
  }

  stop() {
    if (this.gain && this.ctx) {
      this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      setTimeout(() => {
        if (this.osc) { this.osc.stop(); this.osc.disconnect(); }
      }, 600);
    }
  }
}

const soundEngine = new SoundEngine();


// --- API HELPERS (WITH STREAMING) ---

const generateCoachingQuestions = async (stressor: string, perception: string, somatic: string, energyLevel: number, stressLevel: number) => {
  try {
    const combinedContext = `Situation: "${stressor}". Client's current experience/coping: "${perception}".`;
    const res = await fetch('/api/coaching-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stressor: combinedContext, somatic, energyLevel, stressLevel })
    });
    
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType || !contentType.includes("application/json")) throw new Error('API unavailable');

    const data = await res.json();
    return data.questions; 
  } catch (error) {
    return [
      "What specifically is threatened by this situation?",
      "If you were coaching your best self, what would you tell them to do?",
      "What is one assumption you are making that might not be true?"
    ];
  }
};

// STREAMING MANIFESTO GENERATOR
const generateManifesto = async (stressor: string, truth: string, action: string, fear: string, onUpdate: (text: string) => void) => {
  try {
    const res = await fetch('/api/manifesto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stressor, truth, action, fear })
    });

    if (!res.ok) throw new Error('API unavailable');

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        onUpdate(fullText); 
      }
    } else {
      const data = await res.json();
      onUpdate(data.manifesto);
    }
    return { isOffline: false };
  } catch (error) {
    const fallbackText = `I release the weight of "${stressor}". I acknowledge my fear that ${fear || 'I am not enough'}, but I stand now in the truth that ${truth}. I seal this power by ${action}.`;
    onUpdate(fallbackText);
    return { isOffline: true };
  }
};

const generateEnergyInsight = async (level: number, type: string) => {
  try {
    const res = await fetch('/api/energy-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, type })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.insight;
  } catch (error) {
    return "Your energy is your currency. How you spend it determines your reality.";
  }
};


// --- TYPES & INTERFACES ---

// (Kept standard interfaces for brevity, adding 'fear' to Integration)
interface IntegrationProps { 
  goal: any; setGoal: (val: any) => void; 
  goalStep: number; setGoalStep: (val: number) => void; 
  isLocked: boolean; setIsLocked: (val: boolean) => void; 
  expandingBelief: string; stressor: string; fear: string; // <-- Added Fear
  sessionCount: number; completeSession: () => void; resetApp: () => void; 
  setView: (view: string) => void; toggleSound: () => void; soundEnabled: boolean; 
  somaticZones: string[]; isBurnoutPath: boolean; userName: string;
}

// ... (Other interfaces remain the same as previous versions)

// --- SHARED COMPONENTS ---

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@200;300;400;500&display=swap');
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-sans { font-family: 'Inter', sans-serif; }
    .glass-panel { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
    .glass-button { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .animate-breathe { animation: breathe 8s ease-in-out infinite; }
    @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }
    
    /* NEW: Ripple Effect for Breathing */
    .ripple-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); animation: ripple 4s linear infinite; }
    @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2); opacity: 0; } }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-enter { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .glow-pulse { animation: glowPulse 3s infinite; }
    @keyframes glowPulse { 0% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); border-color: rgba(20, 184, 166, 0.6); } 50% { box-shadow: 0 0 20px 0 rgba(20, 184, 166, 0.2); border-color: rgba(20, 184, 166, 1); } 100% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); border-color: rgba(20, 184, 166, 0.6); } }
  `}</style>
);

const Nav: React.FC<any> = ({ title, subtitle, onBack, isDashboard, soundEnabled, toggleSound, resetApp, progress, aiActive }) => (
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
           <button onClick={resetApp} className="p-3 rounded-full glass-button text-white/40 hover:text-white hover:bg-white/20 transition-all">
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

// --- VIEW COMPONENTS ---

const Welcome: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <div className="h-full flex flex-col justify-center items-center px-6 text-center animate-enter relative z-50">
    <div className="flex flex-col items-center">
        <div className="mb-6 relative">
            <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full"></div>
            <Activity size={64} className="text-teal-200/80 relative z-10 animate-breathe" strokeWidth={0.8} />
        </div>
        <h1 className="font-serif text-5xl text-white italic tracking-wide leading-tight animate-enter">Adaptiv</h1>
        <p className="font-sans text-xs text-white/50 uppercase tracking-[0.3em] animate-enter delay-100 mt-4">Alchemy for the Soul</p>
        <button onClick={onEnter} className="mt-12 px-8 py-4 rounded-full bg-white/10 text-white font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/20 hover:scale-105 transition-all animate-enter delay-300 border border-white/5">Enter the Space</button>
    </div>
  </div>
);

const Horizon: React.FC<any> = ({ userName, sessionCount, stressor, setStressor, perception, setPerception, stressLevel, setStressLevel, energyLevel, setEnergyLevel, isBurnout, setView, toggleSound, soundEnabled, resetApp }) => {
  const isHighFriction = stressLevel > 75 && energyLevel < 35;

  return (
    <div className="h-full flex flex-col">
      <Nav title={`Hello, ${userName || 'Traveler'}`} subtitle={`Session ${sessionCount + 1}`} isDashboard={true} resetApp={resetApp} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={0} />
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto hide-scrollbar animate-enter pb-8">
        
        {/* REBRANDED CYCLE TRACKER */}
        <div className="glass-panel p-4 rounded-[24px] border-teal-500/20 relative group">
           <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg text-teal-100 italic">7-Day Neural Reset</h3>
                <HelpCircle size={12} className="text-teal-500/50" />
              </div>
              <span className="font-sans text-[9px] uppercase tracking-widest text-teal-400 bg-teal-900/30 px-2 py-1 rounded">Day {(sessionCount % 7) + 1}</span>
           </div>
           
           {/* EXPLANATION TOOLTIP (Visual only) */}
           <p className="text-[9px] text-teal-200/40 mb-3 leading-relaxed">
             Neuroplasticity requires repetition. Complete 7 cycles to rewire your baseline response to stress.
           </p>
           
           <div className="flex justify-between mb-2 relative z-10 px-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all text-[9px] font-bold ${i < (sessionCount % 7) ? 'bg-teal-500 text-slate-900 border-teal-400' : i === (sessionCount % 7) ? 'bg-teal-900/80 text-teal-400 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)] scale-110' : 'bg-white/5 border-white/10 text-white/20'}`}>
                  {i < (sessionCount % 7) ? <Check size={10} strokeWidth={3} /> : i + 1}
                </div>
              ))}
              <div className="absolute top-3 left-3 right-3 h-[1px] bg-white/5 -z-10"></div>
           </div>
        </div>

        {/* INTERNAL WEATHER (TILES) */}
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
                <p className="font-sans text-[10px] tracking-widest text-white/50 uppercase">Pressure Intensity?</p>
                <div className="grid grid-cols-4 gap-2">
                    {[20, 40, 70, 90].map((val, i) => (
                        <button key={i} onClick={() => setStressLevel(val)} className={`py-2 rounded-lg text-[10px] uppercase font-bold border transition-all ${stressLevel === val ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10'}`}>
                            {['Fun', 'Okay', 'Heavy', 'Crush'][i]}
                        </button>
                    ))}
                </div>
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
            <input type="text" value={stressor} onChange={(e) => setStressor(e.target.value)} placeholder="What weighs on you?" className="w-full glass-panel p-5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:bg-white/5 transition-all font-serif text-lg italic text-center"/>
            
            {isHighFriction ? (
              <div className="animate-enter mb-2 space-y-3">
                 <button onClick={() => setView('burnout_check')} className="w-full py-4 rounded-xl bg-orange-500/20 text-orange-200 border border-orange-500/50 flex flex-col items-center justify-center gap-1 hover:bg-orange-500/30 transition-all">
                     <span className="font-sans text-xs font-bold tracking-widest uppercase">High Friction Detected</span>
                     <span className="text-[10px] opacity-70">Run Vitality Scan</span>
                 </button>
                 <button onClick={() => setView('somatic')} disabled={!stressor} className="w-full py-4 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all font-sans text-xs tracking-widest uppercase">Continue to Alchemy</button>
              </div>
            ) : (
              <button onClick={() => setView('somatic')} disabled={!stressor} className="w-full py-5 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:shadow-none mt-2">Begin Alchemy</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PartsWork: React.FC<any> = ({ selectedPart, sensation, setSensation, protection, setProtection, fear, setFear, expandingBelief, setExpandingBelief, partsStep, setPartsStep, setView, toggleSound, soundEnabled }) => {
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

        {/* UPDATED: THE INQUIRY NOW HAS AN INPUT */}
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
             <button onClick={() => setPartsStep('channel')} disabled={!protection} className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all">Acknowledge Protection</button>
          </div>
        )}

        {partsStep === 'channel' && (
          <div className="text-center">
            <Zap size={24} className="text-teal-200 mx-auto mb-4" />
            <p className="font-serif text-2xl text-teal-100 italic mb-4">"Shift the Energy"</p>
            <p className="font-sans text-xs text-white/60 mb-6">You don't need to destroy the energy. Use it.</p>
            <input autoFocus className="w-full bg-transparent border-b border-teal-500/30 py-4 text-center text-teal-50 font-light text-lg focus:outline-none mb-8" placeholder="I will use this energy to..." value={expandingBelief} onChange={e => setExpandingBelief(e.target.value)} onKeyDown={e => e.key === 'Enter' && setView('lens')} />
            <button onClick={() => setView('lens')} disabled={!expandingBelief} className="w-full py-4 rounded-full bg-teal-500/10 text-teal-200 border border-teal-500/20 font-sans text-xs tracking-widest uppercase hover:bg-teal-500/20 transition-all">Integrate</button>
          </div>
        )}
      </div>
    </div>
  );
};

const Breath: React.FC<any> = ({ breathing, setBreathing, breathCount, setBreathCount, setView, toggleSound, soundEnabled }) => {
  const phase = breathCount < 4 ? "Inhale" : breathCount < 8 ? "Hold" : "Exhale";
  useEffect(() => { if (!breathing) return; const i = setInterval(() => setBreathCount((c: number) => (c + 1) % 16), 1000); return () => clearInterval(i); }, [breathing]);
  
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <Nav title="Regulation" subtitle="Breathe" onBack={() => setView('fork')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
      <div className="flex-1 flex flex-col items-center justify-center relative">
         {/* UPDATED: DYNAMIC BREATHING CIRCLE WITH RIPPLES */}
         <div className="relative flex items-center justify-center">
            {breathing && <div className="absolute w-64 h-64 rounded-full border border-teal-500/30 ripple-ring"></div>}
            <div className={`w-64 h-64 rounded-full border border-white/10 flex items-center justify-center transition-all duration-1000 z-10 ${breathing ? 'bg-teal-900/20 shadow-[0_0_50px_rgba(20,184,166,0.2)]' : 'bg-white/5'}`} style={{ transform: `scale(${breathing ? (breathCount < 4 ? 1.5 : 1) : 1})` }}>
              <span className="font-serif text-2xl text-white italic">{breathing ? phase : "Stillness"}</span>
            </div>
         </div>
         
         <div className="h-24"></div> 
         <button onClick={() => { setBreathing(!breathing); setBreathCount(0); }} className="px-10 py-4 rounded-full bg-white text-slate-900 font-bold text-xs uppercase mb-4">{breathing ? 'Complete' : 'Begin'}</button>
         {!breathing && <button onClick={() => setView('insight')} className="text-teal-200 text-xs uppercase tracking-widest">Capture Insight</button>}
      </div>
    </div>
  );
};

// --- INTEGRATION (Using the new Fear variable) ---
const Integration: React.FC<IntegrationProps> = ({ goal, setGoal, goalStep, setGoalStep, isLocked, setIsLocked, expandingBelief, stressor, fear, sessionCount, completeSession, resetApp, setView, toggleSound, soundEnabled, somaticZones, isBurnoutPath, userName }) => {
  const [primingDone, setPrimingDone] = useState(false);
  const [manifesto, setManifesto] = useState("");
  const [generating, setGenerating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (isLocked && !isBurnoutPath && !manifesto) {
      setGenerating(true);
      // Pass 'fear' to generator
      generateManifesto(stressor, expandingBelief, goal.action || "action", fear, (text) => {
          setManifesto(text);
      }).then(res => {
        setIsOffline(res.isOffline);
        setGenerating(false);
      });
    }
  }, [isLocked, isBurnoutPath, manifesto]);

  const quickTimes = ["Now", "Within 1 Hr", "Today", "Tomorrow"];
  const steps = [{ id: 'outcome', q: 'The Goal', ph: 'Desired outcome?' }, { id: 'action', q: 'The Action', ph: 'Single step?' }, { id: 'when', q: 'The Commitment', ph: 'When?' }];
  const current = steps[Math.min(goalStep, 2)];

  // ... (Rest of component is standard logic) ...
  if (isLocked && !primingDone && !isBurnoutPath) { 
    return (
      <div className="h-full flex flex-col relative z-20">
         <Nav title="Integration" subtitle="Embodiment" onBack={() => { setIsLocked(false); }} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={90} />
         <div className="h-full flex flex-col justify-center items-center text-center animate-enter overflow-y-auto hide-scrollbar">
            <h2 className="font-serif text-3xl text-white italic mb-4">Embody</h2>
            <p className="font-sans text-lg text-white/80 leading-relaxed max-w-[280px] mx-auto mb-12">Stand up. Change your state. Feel the shift.</p>
            <button onClick={() => setPrimingDone(true)} className="px-10 py-5 rounded-full bg-white text-slate-900 font-sans text-xs font-bold tracking-[0.2em] uppercase">I am ready</button>
         </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="h-full flex flex-col px-4 text-center justify-center">
        <Nav title="Integration" subtitle="Blueprint Complete" onBack={() => setView('fork')} soundEnabled={soundEnabled} toggleSound={toggleSound} progress={100} aiActive={generating} />
        
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">
            <div className={`glass-panel p-8 rounded-[32px] mb-8 relative overflow-hidden transition-all ${isBurnoutPath ? 'border-orange-500/50' : ''}`}>
              <div className="flex justify-center mb-6">
                {isBurnoutPath ? <BatteryWarning size={48} className="text-orange-300" /> : <FileText size={64} className="text-teal-200 opacity-80" />}
              </div>
              <p className={`font-sans text-[9px] uppercase tracking-widest mb-6 flex items-center justify-center gap-2 ${isBurnoutPath ? 'text-orange-200/80' : 'text-teal-200/60'}`}>
                {isBurnoutPath ? "Permission Slip" : "Alchemist Decree"}
                {isOffline && <span className="bg-red-500/20 text-red-300 px-1 rounded flex items-center gap-1"><WifiOff size={8}/> Offline Mode</span>}
              </p>
              <div className="font-serif text-lg leading-relaxed text-white/90 italic mb-8 text-center min-h-[100px]">
                {isBurnoutPath ? `"I, ${userName || 'The Conscious Leader'}, grant myself full permission to pause. The world will wait."` : `"${manifesto || expandingBelief}"`}
              </div>
            </div>
            
            <div className="flex gap-4 justify-center pb-8 pt-4 border-t border-white/5">
                <button onClick={resetApp} className="flex items-center justify-center gap-2 text-white/40 hover:text-white uppercase text-[10px] tracking-widest"><RefreshCw size={12}/> Reset System</button>
                <button onClick={() => setView('dashboard')} className="flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest border px-4 py-2 rounded-full text-teal-400 border-teal-500/30 hover:bg-teal-900/20"><Home size={12}/> Return to Orbit</button>
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
                   <button key={time} onClick={() => { setGoal({...goal, when: time}); setIsLocked(true); }} className="py-3 rounded-xl border border-white/20 bg-white/5 text-sm font-sans text-white/90 hover:bg-white/20 hover:border-white/40 hover:text-white transition-all shadow-sm">{time}</button>
                 ))}
              </div>
           </div>
         ) : (
           <>
             <input autoFocus className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none mb-6" placeholder={current.ph} value={goal[current.id as keyof typeof goal]} onChange={e => setGoal({...goal, [current.id]: e.target.value})} onKeyDown={e => e.key === 'Enter' && (goalStep < 2 ? setGoalStep(goalStep+1) : setIsLocked(true))} />
             <button onClick={() => goalStep < 2 ? setGoalStep(goalStep+1) : setIsLocked(true)} disabled={!goal[current.id as keyof typeof goal]} className="w-full py-3 rounded-xl bg-white text-slate-900 font-bold text-xs uppercase disabled:opacity-50">Next</button>
           </>
         )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [view, setView] = useState('welcome'); 
  const [bgState, setBgState] = useState('neutral'); 
  const [userName, setUserName] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const [stressor, setStressor] = useState(''); 
  const [perception, setPerception] = useState('');
  const [fear, setFear] = useState(''); // New State
  const [stressLevel, setStressLevel] = useState(50);
  const [energyLevel, setEnergyLevel] = useState(50);
  const [isBurnout, setIsBurnout] = useState(false);
  const [somaticZones, setSomaticZones] = useState<string[]>([]);
  const [partsStep, setPartsStep] = useState('experience'); 
  const [sensation, setSensation] = useState('');
  const [protection, setProtection] = useState('');
  const [expandingBelief, setExpandingBelief] = useState('');
  const [goal, setGoal] = useState<any>({ what: '', measure: '', when: '', outcome: '', action: '' });
  const [goalStep, setGoalStep] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (view === 'preservation') setBgState('preservation');
    else if (view === 'laser') setBgState('laser');
    else if (view === 'regulate') setBgState('flow');
    else setBgState('neutral');
  }, [view]);

  const toggleSound = () => {
    if (soundEnabled) { soundEngine.stop(); setSoundEnabled(false); }
    else { soundEngine.playDrone(); setSoundEnabled(true); }
  };

  const enterApp = () => {
    setView('manifesto');
    // We do NOT auto-play sound here, we wait for user to toggle it or do it on specific interaction
    // to follow browser policies.
  };

  const resetApp = () => { setView('welcome'); setStressor(''); setPerception(''); setSomaticZones([]); setIsLocked(false); };

  return (
    <>
      <FontStyles />
      <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden flex justify-center">
        <Atmosphere bgState={bgState} />
        <div className="w-full max-w-md h-full relative z-10 p-6">
           {view === 'welcome' && <Welcome onEnter={enterApp} />}
           {/* Manifesto component omitted for brevity, logic same as before */}
           {view === 'manifesto' && <div className="h-full flex items-center justify-center"><button onClick={() => setView('profile')} className="p-4 border rounded-full">Continue</button></div>} 
           {view === 'profile' && <div className="h-full flex flex-col items-center justify-center"><input placeholder="Name" value={userName} onChange={e=>setUserName(e.target.value)} className="bg-transparent border-b text-center mb-4"/><button onClick={() => setView('dashboard')} className="p-4 border rounded-full">Enter</button></div>}
           {view === 'dashboard' && <Horizon userName={userName} sessionCount={sessionCount} stressor={stressor} setStressor={setStressor} perception={perception} setPerception={setPerception} stressLevel={stressLevel} setStressLevel={setStressLevel} energyLevel={energyLevel} setEnergyLevel={setEnergyLevel} isBurnout={isBurnout} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} resetApp={resetApp} />}
           {view === 'somatic' && <div className="h-full"><Nav title="Vessel" subtitle="Body" onBack={()=>setView('dashboard')} toggleSound={toggleSound} soundEnabled={soundEnabled}/><button onClick={()=>setView('partswork')} className="mt-20 p-4 border w-full">Connect</button></div>}
           {view === 'partswork' && <PartsWork selectedPart="Body" sensation={sensation} setSensation={setSensation} protection={protection} setProtection={setProtection} fear={fear} setFear={setFear} expandingBelief={expandingBelief} setExpandingBelief={setExpandingBelief} partsStep={partsStep} setPartsStep={setPartsStep} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'lens' && <div className="h-full"><Nav title="Lens" subtitle="Check" onBack={()=>setView('partswork')} toggleSound={toggleSound} soundEnabled={soundEnabled}/><button onClick={()=>setView('fork')} className="mt-20 p-4 border w-full">Next</button></div>}
           {view === 'fork' && <div className="h-full flex flex-col justify-center gap-4"><button onClick={()=>setView('regulate')} className="p-6 border rounded-xl">Stillness</button><button onClick={()=>setView('laser')} className="p-6 border rounded-xl">Action</button></div>}
           {view === 'regulate' && <Breath breathing={breathing} setBreathing={setBreathing} breathCount={breathCount} setBreathCount={setBreathCount} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'insight' && <div className="h-full"><Nav title="Insight" subtitle="Capture" onBack={()=>setView('regulate')} toggleSound={toggleSound} soundEnabled={soundEnabled}/><input value={expandingBelief} onChange={e=>setExpandingBelief(e.target.value)} className="bg-transparent border-b w-full mb-4"/><button onClick={()=>setView('integration')} className="p-4 border w-full">Next</button></div>}
           {view === 'integration' && <Integration goal={goal} setGoal={setGoal} goalStep={goalStep} setGoalStep={setGoalStep} isLocked={isLocked} setIsLocked={setIsLocked} expandingBelief={expandingBelief} stressor={stressor} fear={fear} sessionCount={sessionCount} completeSession={() => setSessionCount(c=>c+1)} resetApp={resetApp} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} somaticZones={somaticZones} isBurnoutPath={false} userName={userName} />}
        </div>
      </div>
    </>
  );
};

export default App;