import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Wind, Zap, Heart, BookOpen, 
  ArrowRight, Check, Calendar, Facebook, 
  User, Lock, PlayCircle, Target, Battery,
  Waves, Volume2, VolumeX, ChevronRight, ChevronLeft, X, AlertCircle, Copy, LogOut, BarChart, RefreshCw,
  Brain, Eye, MessageCircle, Shield, Sun, Flame, Anchor, Hand, Disc, Clock, Mountain
} from 'lucide-react';

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

const Atmosphere = ({ bgState }) => {
  const themes = {
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

const Nav = ({ title, subtitle, onBack, isDashboard, soundEnabled, toggleSound, resetApp, progress }) => (
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
        
        {isDashboard && (
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

const Welcome = ({ onEnter }) => (
  // ADDED overflow-y-auto to allow scrolling on small screens
  <div className="h-full flex flex-col justify-center items-center px-6 text-center animate-enter relative z-50 overflow-y-auto hide-scrollbar">
    <div className="min-h-full flex flex-col justify-center items-center py-10">
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full"></div>
        <Activity size={56} className="text-teal-200/80 relative z-10" strokeWidth={0.8} />
      </div>
      
      <div className="space-y-6 max-w-sm">
        <h2 className="font-sans text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] animate-enter">Architecture for the Soul</h2>
        
        <h1 className="font-serif text-5xl text-white italic tracking-wide leading-tight animate-enter delay-100">
          Alchemy for the <br/> Modern Mind.
        </h1>
        
        <p className="font-sans text-sm text-white/50 leading-relaxed max-w-[280px] mx-auto animate-enter delay-200">
          You are not here to fix yourself. You are here to transmute friction into fuel.
          <br/><br/>
          In the next few minutes, we will locate the block, listen to its wisdom, and turn it into power.
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

const Identity = ({ userName, setUserName, onComplete }) => (
  // ADDED overflow-y-auto
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
          placeholder="Who enters?"
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

const Horizon = ({ userName, sessionCount, stressor, setStressor, stressLevel, setStressLevel, energyLevel, setEnergyLevel, isBurnout, setView, toggleSound, soundEnabled, resetApp }) => (
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
    
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto hide-scrollbar animate-enter">
      <div className={`glass-panel p-8 rounded-[32px] transition-all duration-700 ${isBurnout ? 'border-orange-500/20' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-xl text-white/90 italic">Internal Weather</h3>
          {isBurnout && <AlertCircle size={18} className="text-orange-400/80 animate-pulse"/>}
        </div>
        
        <p className="font-sans text-xs text-white/50 mb-8 leading-relaxed">
          Calibrate your current state. High pressure is sustainable only if vitality matches it.
        </p>

        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between font-sans text-[10px] tracking-widest text-white/50">
              <span>PRESSURE</span>
              <span>{stressLevel}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={stressLevel} onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-full appearance-none bg-white/10 h-1 rounded-full cursor-pointer"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between font-sans text-[10px] tracking-widest text-white/50">
              <span>VITALITY</span>
              <span>{energyLevel}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full appearance-none bg-white/10 h-1 rounded-full cursor-pointer"
            />
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
        <div className="space-y-6 animate-enter delay-100">
          <div className="relative">
            <input 
              type="text"
              value={stressor}
              onChange={(e) => setStressor(e.target.value)}
              placeholder="What weighs on you?"
              className="w-full glass-panel p-6 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:bg-white/5 transition-all font-serif text-lg italic text-center"
            />
          </div>
          
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

const Vessel = ({ somaticZones, setSomaticZones, setView, toggleSound, soundEnabled }) => {
  const zones = [
    { id: 'Head', label: 'Head', sub: 'Racing thoughts • Fog', icon: Brain },
    { id: 'Eyes', label: 'Eyes', sub: 'Strain • Tiredness', icon: Eye },
    { id: 'Throat', label: 'Throat', sub: 'Unspoken words', icon: MessageCircle },
    { id: 'Chest', label: 'Chest', sub: 'Heavy heart • Protection', icon: Shield },
    { id: 'Solar', label: 'Solar Plexus', sub: 'Willpower • Anxiety', icon: Sun },
    { id: 'Gut', label: 'Gut/Belly', sub: 'Fear • Intuition', icon: Disc },
    { id: 'Back', label: 'Back', sub: 'Burden • Support', icon: Anchor },
    { id: 'Hands', label: 'Hands', sub: 'Grasping • Fighting', icon: Hand },
  ];
  
  const selectZone = (id) => {
    setSomaticZones([id]); 
  };

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
          const active = somaticZones.includes(z.id);
          return (
            <button
              key={z.id}
              onClick={() => selectZone(z.id)}
              className={`group relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 w-full flex flex-col items-center justify-center text-center gap-2 min-h-[140px] h-auto ${
                active ? 'bg-slate-800/90 border-white/60' : 'glass-panel hover:bg-white/10'
              }`}
            >
              <z.icon className={`${active ? 'text-white' : 'text-white/40'} mb-1`} size={28} strokeWidth={1}/>
              <div>
                <h3 className={`font-serif text-lg italic leading-none mb-2 transition-colors ${active ? 'text-white' : 'text-white/90'}`}>{z.label}</h3>
                <p className={`font-sans text-[9px] tracking-wider uppercase leading-snug ${active ? 'text-indigo-100' : 'text-slate-400'}`}>{z.sub}</p>
              </div>
            </button>
          )
        })}
      </div>

      <button 
        onClick={() => setView('partswork')}
        disabled={somaticZones.length === 0}
        className="mt-4 w-full py-5 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase border border-white/10 hover:bg-white/20 transition-all disabled:opacity-0 disabled:translate-y-4 shrink-0 animate-enter delay-200"
      >
        Connect with Part
      </button>
    </div>
  );
};

const PartsWork = ({ selectedPart, sensation, setSensation, protection, setProtection, expandingBelief, setExpandingBelief, partsStep, setPartsStep, setView, toggleSound, soundEnabled }) => {
  
  const commonSensations = ["Tightness", "Heat", "Heaviness", "Empty", "Buzzing", "Numbness"];
  const commonProtections = ["Protecting me from failure", "Keeping me safe", "Stopping me from getting hurt", "Trying to control the uncontrollable"];
  
  return (
    <div className="h-full flex flex-col">
      <Nav title="Parts Dialogue" subtitle={selectedPart} onBack={() => setView('somatic')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={30} />
      
      <div className="flex-1 flex flex-col justify-start pt-8 space-y-6 animate-enter overflow-y-auto hide-scrollbar pb-20">
        
        {partsStep === 'experience' && (
          <div className="animate-enter w-full">
            <div className="mb-8 text-center px-4">
               <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <Activity size={24} className="text-white/80" strokeWidth={1} />
               </div>
               {/* INCREASED FONT SIZE HERE */}
               <p className="font-serif text-2xl text-white/90 italic leading-relaxed mb-4">
                 "How does the {selectedPart} feel right now?"
               </p>
               <p className="font-sans text-sm text-white/70 leading-relaxed">
                 Describe the sensation. Is it hot, cold, tight, heavy?
               </p>
            </div>

            <input 
              autoFocus
              className="w-full bg-transparent border-b border-white/20 py-4 text-center text-white font-light text-lg focus:outline-none focus:border-white/60 transition-all placeholder:text-white/20 mb-6"
              placeholder="It feels like..."
              value={sensation}
              onChange={e => setSensation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setPartsStep('message')}
            />
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
               {commonSensations.map(s => (
                 <button key={s} onClick={() => setSensation(s)} className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] uppercase tracking-wider text-white/90 hover:bg-white/20 hover:text-white transition-all shadow-sm">
                   {s}
                 </button>
               ))}
            </div>

            <button 
              onClick={() => setPartsStep('message')}
              disabled={!sensation}
              className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {partsStep === 'message' && (
          <div className="animate-enter w-full">
             <div className="mb-8 text-center px-4">
               <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <Shield size={24} className="text-white/80" strokeWidth={1} />
               </div>
               {/* INCREASED FONT SIZE AND REMOVED 'TIP' LABEL */}
               <p className="font-serif text-2xl text-white/90 italic leading-relaxed mb-4">
                 "What is it protecting you from?"
               </p>
               <p className="font-sans text-sm text-white/70 leading-relaxed">
                 Ask the part: "What are you trying to do for me?"
               </p>
               <p className="font-serif text-teal-200/90 italic text-lg mt-6 bg-teal-900/10 p-4 rounded-xl border border-teal-500/20">
                 When you hear the answer, say "Thank you for protecting me."
               </p>
            </div>

            <input 
              autoFocus
              className="w-full bg-transparent border-b border-white/20 py-4 text-center text-white font-light text-lg focus:outline-none focus:border-white/60 transition-all placeholder:text-white/20 mb-6"
              placeholder="It is trying to..."
              value={protection}
              onChange={e => setProtection(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setPartsStep('channel')}
            />

            <div className="flex flex-wrap justify-center gap-2 mb-8">
               {commonProtections.map(p => (
                 <button key={p} onClick={() => setProtection(p)} className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] uppercase tracking-wider text-white/90 hover:bg-white/20 hover:text-white transition-all shadow-sm">
                   {p}
                 </button>
               ))}
            </div>

            <button 
              onClick={() => setPartsStep('channel')}
              disabled={!protection}
              className="w-full py-4 rounded-full bg-white/10 text-white font-sans text-xs tracking-widest uppercase hover:bg-white/20 transition-all disabled:opacity-50"
            >
              Acknowledge
            </button>
          </div>
        )}

        {partsStep === 'channel' && (
          <div className="animate-enter w-full">
            <div className="mb-8 text-center px-4">
               <div className="w-16 h-16 mx-auto bg-teal-500/10 rounded-full flex items-center justify-center mb-6 border border-teal-500/20">
                  <Zap size={24} className="text-teal-200" strokeWidth={1} />
               </div>
               {/* INCREASED FONT SIZE */}
               <p className="font-serif text-2xl text-teal-100 italic leading-relaxed mb-4">
                 "Now, channel the energy."
               </p>
               <p className="font-sans text-sm text-teal-200/70 leading-relaxed mb-4">
                 Tell the part: "I appreciate your protection, but I can handle this now."
               </p>
               <p className="font-serif text-white/80 italic text-lg">
                 "Let's use your energy for..."
               </p>
            </div>

            <input 
              autoFocus
              className="w-full bg-transparent border-b border-teal-500/30 py-4 text-center text-teal-50 font-light text-lg focus:outline-none focus:border-teal-500/60 transition-all placeholder:text-teal-500/20 mb-8"
              placeholder="I will use this energy to..."
              value={expandingBelief}
              onChange={e => setExpandingBelief(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setView('lens')}
            />
            <button 
               onClick={() => setView('lens')}
               disabled={!expandingBelief}
               className="w-full py-4 rounded-full bg-teal-500/10 text-teal-200 border border-teal-500/20 font-sans text-xs tracking-widest uppercase hover:bg-teal-500/20 transition-all disabled:opacity-0"
            >
              Integrate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LaserCoaching = ({ stressor, setView, toggleSound, soundEnabled, setGoal, setExpandingBelief }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ topic: '', result: '', permission: '', action: '' });
  
  const questions = [
    { id: 'topic', label: 'The Truth', q: `Looking at "${stressor}" from this new energy, what is the truth now?`, ph: "The truth is..." },
    { id: 'result', label: 'The Vision', q: "If this problem were already solved, what would be different?", ph: "I would be..." },
    { id: 'permission', label: 'The Permission', q: "What permission do you need to give yourself to move forward?", ph: "I give myself permission to..." },
    { id: 'action', label: 'The Move', q: "What is the single boldest step that makes everything else easier?", ph: "I will..." },
  ];
  
  const current = questions[step];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      setExpandingBelief(answers.topic);
      setGoal(prev => ({ 
        ...prev, 
        outcome: answers.result, 
        action: answers.action 
      }));
      setView('molt');
    }
  };

  return (
    <div className="h-full flex flex-col">
       <Nav title="Breakthrough Laser" subtitle="Rapid Shift" onBack={() => setView('fork')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={80} />
       
       <div className="flex-1 flex flex-col justify-center animate-enter">
          <div className="glass-panel p-8 rounded-[32px] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Target size={100} />
             </div>
             
             <span className="font-sans text-[10px] uppercase tracking-widest text-white/40 mb-2 block">{current.label}</span>
             <h3 className="font-serif text-2xl text-white italic mb-8 leading-snug">{current.q}</h3>
             
             <input 
               autoFocus
               key={current.id}
               className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors mb-8 placeholder:text-white/10 text-lg"
               placeholder={current.ph}
               value={answers[current.id]}
               onChange={e => setAnswers({...answers, [current.id]: e.target.value})}
               onKeyDown={e => e.key === 'Enter' && answers[current.id] && handleNext()}
             />
             
             <div className="flex justify-end">
               <button 
                 onClick={handleNext}
                 disabled={!answers[current.id]}
                 className="px-8 py-3 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50"
               >
                 {step === 3 ? 'Lock It In' : 'Next'}
               </button>
             </div>
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}></div>
            ))}
          </div>
       </div>
    </div>
  );
};

const Perspective = ({ pressure, setPressure, ability, setAbility, setView, toggleSound, soundEnabled }) => {
  const flowState = ability >= pressure;
  return (
    <div className="h-full flex flex-col">
      <Nav title="The Perspective" subtitle="Calibration" onBack={() => setView('partswork')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={50} />
      
      <div className="mb-4 animate-enter text-center px-4 shrink-0">
        <p className="font-sans text-xs text-white/60 leading-relaxed">
          Stress is simply a ratio. High pressure is safe if capacity is high. Be honest about your current reserves.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start relative overflow-y-auto hide-scrollbar min-h-0 pt-4 animate-enter delay-100">
        <div className={`relative w-48 h-48 rounded-full border border-white/10 flex items-center justify-center transition-all duration-1000 shrink-0 ${flowState ? 'shadow-[0_0_100px_rgba(20,184,166,0.2)]' : 'shadow-[0_0_100px_rgba(244,63,94,0.2)]'}`}>
           <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-1000 ${flowState ? 'bg-teal-500' : 'bg-rose-500'}`}></div>
           <div className="text-center relative z-10 px-4">
             <h2 className={`font-serif text-3xl italic transition-colors duration-500 ${flowState ? 'text-teal-100' : 'text-rose-100'}`}>
               {flowState ? 'Flow' : 'Friction'}
             </h2>
             <p className="font-sans text-[10px] tracking-widest uppercase text-white/60 mt-2 leading-relaxed">
               {flowState ? 'Challenge accepted. Systems go.' : 'System under-resourced. Bracing for impact.'}
             </p>
           </div>
        </div>

        <div className="w-full space-y-6 mt-8 px-2 shrink-0 pb-4">
          <div className="space-y-3">
             <div className="flex justify-between font-sans text-[10px] tracking-widest text-white/50">
                <span>THE DEMAND</span>
                <span>{pressure}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={pressure} onChange={(e) => setPressure(Number(e.target.value))} 
                className="w-full appearance-none bg-white/10 h-1 rounded-full cursor-pointer"
              />
          </div>
          <div className="space-y-3">
             <div className="flex justify-between font-sans text-[10px] tracking-widest text-white/50">
                <span>MY RESOURCES</span>
                <span>{ability}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={ability} onChange={(e) => setAbility(Number(e.target.value))} 
                className="w-full appearance-none bg-white/10 h-1 rounded-full cursor-pointer"
              />
          </div>
        </div>
      </div>

      <button 
         onClick={() => setView('fork')}
         className="mt-6 w-full py-5 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all shrink-0 animate-enter delay-200"
      >
        Direct the Energy
      </button>
    </div>
  );
}

const Crossroads = ({ setView, toggleSound, soundEnabled, stressLevel, energyLevel }) => {
  // INTELLIGENT CROSSROADS LOGIC
  const recommendStillness = parseInt(stressLevel) > 70 && parseInt(energyLevel) < 40;

  return (
    <div className="h-full flex flex-col justify-center animate-enter">
      <Nav title="The Crossroads" subtitle="Choice Point" onBack={() => setView('lens')} toggleSound={toggleSound} soundEnabled={soundEnabled} progress={65} />
      <h1 className="font-serif text-4xl text-white text-center italic mb-2">Transmutation</h1>
      
      <div className="mb-10 text-center px-6">
         <p className="font-sans text-xs text-white/40 leading-relaxed uppercase tracking-widest mb-4">How shall we use this energy?</p>
         <p className="font-sans text-xs text-white/30 leading-relaxed">
            Based on your vitals, your body may prefer <strong>{recommendStillness ? 'Stillness' : 'Motion'}</strong>.
         </p>
      </div>

      <div className="grid gap-4">
        <button 
          onClick={() => setView('regulate')} 
          className={`group relative overflow-hidden p-8 rounded-[32px] glass-panel text-left transition-all hover:bg-white/10 ${recommendStillness ? 'border-teal-500/50 glow-pulse' : ''}`}
        >
          <Wind size={32} className="text-teal-200/50 mb-4" strokeWidth={1} />
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl text-white italic mb-1">Stillness</h3>
            {recommendStillness && <span className="text-[10px] uppercase tracking-widest text-teal-400 bg-teal-900/40 px-2 py-1 rounded">Recommended</span>}
          </div>
          <p className="font-sans text-xs text-white/40 leading-relaxed">I am flooded. I need to ground, breathe, and reset safety.</p>
        </button>
        
        <button 
          onClick={() => setView('laser')} 
          className={`group relative overflow-hidden p-8 rounded-[32px] glass-panel text-left transition-all hover:bg-white/10 ${!recommendStillness ? 'border-amber-500/50 glow-pulse' : ''}`}
        >
          <Zap size={32} className="text-amber-200/50 mb-4" strokeWidth={1} />
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl text-white italic mb-1">Motion</h3>
            {!recommendStillness && <span className="text-[10px] uppercase tracking-widest text-amber-400 bg-amber-900/40 px-2 py-1 rounded">Recommended</span>}
          </div>
          <p className="font-sans text-xs text-white/40 leading-relaxed">I am charged. I need to channel this heat into focus or connection.</p>
        </button>
      </div>
    </div>
  );
};

const Breath = ({ breathing, setBreathing, breathCount, setBreathCount, setView, toggleSound, soundEnabled }) => {
  const phase = breathCount < 4 ? "Inhale" : breathCount < 8 ? "Hold" : "Exhale";
  // Smooth 4-4-8 rhythm scaling
  const scale = breathCount < 4 
    ? 1 + (breathCount / 4) * 0.5 
    : breathCount < 8 
      ? 1.5 
      : 1.5 - ((breathCount - 8) / 8) * 0.5;

  return (
    <div className="h-full flex flex-col items-center justify-center relative animate-enter">
      <Nav title="Regulation" subtitle="Breathe" onBack={() => setView('fork')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
      <div className="relative mb-16">
         <div className="absolute inset-0 bg-teal-400/20 blur-[80px] rounded-full transition-transform duration-1000 ease-in-out" style={{ transform: `scale(${breathing ? scale * 1.5 : 1})` }}></div>
         <div 
           className="w-64 h-64 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all duration-1000 ease-in-out shadow-2xl"
           style={{ transform: `scale(${breathing ? scale : 1})` }}
         >
           <span className="font-serif text-2xl text-white italic tracking-wider transition-opacity duration-500">
             {breathing ? phase : "Stillness"}
           </span>
         </div>
      </div>
      
      <div className="flex gap-4 items-center relative z-10">
          <button 
              onClick={() => { setBreathing(!breathing); if (breathing) setBreathCount(0); }}
              className={`px-10 py-4 rounded-full font-sans text-xs font-bold tracking-widest uppercase transition-all ${breathing ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
          >
              {breathing ? 'Complete' : 'Begin'}
          </button>
      </div>
      
      {/* FIXED: VISIBLE SKIP BUTTON */}
      <button 
        onClick={() => setView('molt')} 
        className="absolute bottom-8 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30 text-[10px] tracking-widest uppercase transition-all"
      >
          Skip to Integration
      </button>
    </div>
  );
};

const Alchemy = ({ setPathway, setView, toggleSound, soundEnabled }) => (
  <div className="h-full flex flex-col animate-enter">
    <Nav title="Vitality Alchemy" subtitle="Select Chemistry" onBack={() => setView('fork')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
    <div className="flex-1 space-y-4 overflow-y-auto hide-scrollbar pb-4">
      {[
          { id: 'perform', label: 'Performance', sub: 'Adrenaline', desc: 'Sharpen focus. Slow time.', icon: Zap, color: 'text-amber-200' },
          { id: 'connect', label: 'Connection', sub: 'Oxytocin', desc: 'Soften defense. Open heart.', icon: Heart, color: 'text-rose-200' },
          { id: 'learn', label: 'Expansion', sub: 'DHEA', desc: 'Molt the shell. Build new paths.', icon: BookOpen, color: 'text-indigo-200' },
      ].map(i => (
          <button 
              key={i.id}
              onClick={() => setView('molt')}
              className="w-full p-6 rounded-[24px] glass-panel text-left hover:bg-white/5 transition-all group"
          >
              <div className="flex justify-between items-start mb-2">
                  <i.icon className={`${i.color} opacity-80`} size={24} strokeWidth={1} />
                  <ArrowRight className="text-white/20 group-hover:text-white transition-colors" size={20} />
              </div>
              <h3 className="font-serif text-2xl text-white italic">{i.label}</h3>
              <p className="font-sans text-[10px] tracking-widest uppercase text-white/40 mb-2">{i.sub}</p>
              <p className="font-serif text-white/60 italic text-sm">{i.desc}</p>
          </button>
      ))}
    </div>
  </div>
);

// --- ENERGY ANALYZER ---
const EnergyAnalyzer = ({ setView }) => {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [result, setResult] = useState(null);

    const questions = [
        {
            q: "When the friction started, what was your initial instinct?",
            options: [
                { text: "I felt like a victim of circumstance.", val: 1 },
                { text: "I wanted to fight or force a solution.", val: 2 },
                { text: "I tried to rationalize or fix it logically.", val: 3 },
                { text: "I saw an opportunity to grow.", val: 5 }
            ]
        },
        {
            q: "What emotional fuel drove your Molt?",
            options: [
                { text: "Apathy or doubt.", val: 1 },
                { text: "Anger or defiance.", val: 2 },
                { text: "Concern or responsibility.", val: 3 },
                { text: "Passion or joy.", val: 5 }
            ]
        },
        {
            q: "What is the outcome you are committed to?",
            options: [
                { text: "I just want to survive.", val: 1 },
                { text: "I want to win.", val: 2 },
                { text: "I want a solution that works.", val: 3 },
                { text: "I want a win-win for everyone.", val: 4 }
            ]
        }
    ];

    const handleAnswer = (val) => {
        const newScore = score + val;
        if (step < 2) {
            setScore(newScore);
            setStep(step + 1);
        } else {
            const final = Math.round(newScore / 3);
            setResult(final);
        }
    };

    const getResultText = (level) => {
        const levels = {
            1: { title: "Level 1: The Filter", desc: "You are identifying as the effect, not the cause. Coaching can help you regain agency." },
            2: { title: "Level 2: The Fighter", desc: "You have high energy, but it's fueled by conflict. We can transmute this into construction." },
            3: { title: "Level 3: The Rationalizer", desc: "You are coping well and taking responsibility. The next step is accessing intuition." },
            4: { title: "Level 4: The Caregiver", desc: "You are driven by compassion. Ensure you aren't sacrificing yourself for others." },
            5: { title: "Level 5: The Opportunist", desc: "You see problems as possibilities. You are in a high-growth state." },
            6: { title: "Level 6: The Visionary", desc: "You are connected to a larger purpose. This is the zone of genius." }
        };
        return levels[level] || levels[3]; 
    };

    if (result) {
        const data = getResultText(result);
        return (
            <div className="h-full flex flex-col justify-center animate-enter text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(251,191,36,0.4)]">
                    <Zap size={40} className="text-white" />
                </div>
                <h2 className="font-serif text-3xl text-white italic mb-2">{data.title}</h2>
                <p className="font-sans text-sm text-white/60 mb-8 leading-relaxed px-4">{data.desc}</p>
                
                <a href="https://calendly.com/alexioda" target="_blank" rel="noopener noreferrer" className="w-full py-4 rounded-full bg-white text-slate-900 font-sans text-xs tracking-widest uppercase font-bold hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all">
                    Stabilize at Level {result + 1} (Book Session)
                </a>
                <button onClick={() => setView('dashboard')} className="mt-6 text-xs text-white/30 hover:text-white uppercase tracking-widest">Return to Horizon</button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col justify-center animate-enter">
            <Nav title="Energy Scan" subtitle={`Question ${step + 1} / 3`} onBack={() => setView('molt')} toggleSound={() => {}} soundEnabled={false} />
            <h2 className="font-serif text-2xl text-white italic mb-8 text-center px-4">{questions[step].q}</h2>
            <div className="grid gap-3">
                {questions[step].options.map((opt, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleAnswer(opt.val)}
                        className="p-5 rounded-2xl glass-panel text-left hover:bg-white/10 transition-all font-sans text-sm text-white/80"
                    >
                        {opt.text}
                    </button>
                ))}
            </div>
        </div>
    )
};

const Priming = ({ onComplete }) => {
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

const Molt = ({ goal, setGoal, goalStep, setGoalStep, isLocked, setIsLocked, expandingBelief, stressor, sessionCount, completeSession, resetApp, setView, toggleSound, soundEnabled, somaticZones }) => {
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
      alert("Session Artifact copied to clipboard.");
  };

  const quickTimes = ["Now", "Within 1 Hr", "Today", "Tomorrow"];

  // RENDER LOGIC FOR PRIMING VS SUMMARY
  if (isLocked && !primingDone) {
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
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500/20 to-teal-500/20 rounded-full flex items-center justify-center mb-4 border border-white/10">
              <Check className="text-white" size={24} />
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
                             value={goal[current.id] || ''}
                             onChange={e => setGoal({...goal, [current.id]: e.target.value})}
                             onKeyDown={e => {
                                 if (e.key === 'Enter' && goal[current.id]) {
                                     if (goalStep < 2) setGoalStep(goalStep + 1);
                                     else setIsLocked(true);
                                 }
                             }}
                          />
                          <div className="flex gap-3">
                               {goalStep > 0 && <button onClick={() => setGoalStep(goalStep - 1)} className="px-4 py-3 rounded-xl border border-white/10 text-white/40">Back</button>}
                               <button 
                                  disabled={!goal[current.id]}
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
                      {/* Energy Affirmation Card */}
                      <div className="mb-8 p-6 rounded-2xl bg-teal-900/20 border border-teal-500/20 text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 opacity-20">
                              <Zap size={40} />
                          </div>
                          <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-teal-200/60 mb-3">Power Reclaimed from {partName}</p>
                          <h2 className="font-serif text-xl text-teal-100 italic leading-snug">"{expandingBelief}"</h2>
                      </div>
                  
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                          <Check size={20} className="text-teal-200" />
                      </div>
                      <p className="font-serif text-lg text-white/90 italic mb-1">"{goal.outcome}"</p>
                      
                      <div className="flex items-center justify-center gap-2 text-white/50 text-xs mb-6">
                        <span>{goal.action}</span>
                        <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                        <span className="text-teal-200">{goal.when}</span>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                          <button onClick={copyArtifact} className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wide">
                              <Copy size={14}/> Copy Session Artifact
                          </button>
                          <a href={generateLink()} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-teal-900/30 border border-teal-500/30 text-teal-200 hover:bg-teal-900/50 transition-colors text-xs font-bold uppercase tracking-wide">
                              <Calendar size={14}/> Add to Calendar
                          </a>
                      </div>
                  </div>
              )}
          </div>

          {/* WORKBOOK DOWNLOAD BUTTON */}
          <a 
            href="https://drive.google.com/file/d/1i75xJFlb-21Q5cTqiTlg22AkdcEQa4Cx/view?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full mb-8 py-4 rounded-2xl border border-indigo-500/30 bg-indigo-900/10 flex items-center justify-center gap-3 group hover:bg-indigo-900/30 transition-all"
          >
            <div className="p-2 bg-indigo-500/20 rounded-full group-hover:bg-indigo-500/40 transition-colors">
              <BookOpen size={18} className="text-indigo-200" />
            </div>
            <div className="text-left">
              <p className="font-serif text-indigo-100 italic text-lg leading-none">The Stress Workbook</p>
              <p className="font-sans text-[10px] text-indigo-300 uppercase tracking-wider mt-1">Download the Blueprints</p>
            </div>
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
  
const Preservation = ({ setView, setPathway, setExpandingBelief, toggleSound, soundEnabled }) => (
      <div className="h-full flex flex-col">
          <Nav title="Preservation" subtitle="Energy Triage" onBack={() => setView('dashboard')} toggleSound={toggleSound} soundEnabled={soundEnabled} />
          <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="glass-panel p-8 rounded-[32px] border-orange-500/10">
                  <Battery size={24} className="text-orange-400 mb-4" />
                  <h3 className="font-serif text-2xl text-orange-100 italic mb-4">Minimize Output</h3>
                  <div className="space-y-4">
                      {['Close all open loops.', 'Hydrate immediately.', '15 minutes of silence.'].map((step, i) => (
                          <div key={i} className="flex items-center gap-4 text-orange-200/60">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                              <span className="font-sans text-sm">{step}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <button 
                onClick={() => { setPathway('recovery'); setExpandingBelief("I protect my energy."); setView('molt'); }}
                className="w-full py-5 rounded-full bg-orange-900/40 border border-orange-500/20 text-orange-100 font-sans text-xs tracking-widest uppercase hover:bg-orange-900/60 transition-all"
              >
                  Commit to Rest
              </button>
          </div>
      </div>
  );

  // --- MAIN RENDER ---
  const AdaptivEthereal = () => {
  // --- STATE ---
  const [view, setView] = useState('welcome'); // Starts at welcome
  const [bgState, setBgState] = useState('neutral'); 
  
  // User & Data
  const [userName, setUserName] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const [stressor, setStressor] = useState(''); 
  const [stressLevel, setStressLevel] = useState(50);
  const [energyLevel, setEnergyLevel] = useState(50);
  const [isBurnout, setIsBurnout] = useState(false);
  
  // Protocol State
  const [somaticZones, setSomaticZones] = useState([]);
  const [partsStep, setPartsStep] = useState('experience'); // experience, message, channel
  const [sensation, setSensation] = useState('');
  const [protection, setProtection] = useState('');
  const [expandingBelief, setExpandingBelief] = useState('');
  
  const [pressure, setPressure] = useState(50);
  const [ability, setAbility] = useState(50);
  const [pathway, setPathway] = useState(null);
  
  // Goals & Tools
  const [goal, setGoal] = useState({ what: '', measure: '', when: '', outcome: '' });
  const [goalStep, setGoalStep] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  
  // Audio
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef(null);
  const noiseNodeRef = useRef(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('adaptiv_user');
      const savedCount = localStorage.getItem('adaptiv_sessions');
      
      if (savedUser) {
        setUserName(savedUser);
        setSessionCount(savedCount ? parseInt(savedCount) : 0);
        setView('dashboard');
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
    } catch (e) {}
  };

  const resetApp = () => {
    try {
      localStorage.removeItem('adaptiv_user');
      localStorage.removeItem('adaptiv_sessions');
    } catch (e) {}
    setUserName('');
    setSessionCount(0);
    setStressor('');
    setSomaticZones([]);
    setSensation('');
    setProtection('');
    setExpandingBelief('');
    setGoal({ what: '', measure: '', when: '', outcome: '' });
    setIsLocked(false);
    setPartsStep('experience');
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
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const bufferSize = 4096;
      const brownNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
      
      brownNoise.onaudioprocess = (e) => {
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
    if (view === 'preservation') setBgState('preservation');
    else if (view === 'laser') setBgState('laser');
    else if (view === 'regulate' || breathing) setBgState('flow');
    else if (stressLevel > 75 && energyLevel > 40) setBgState('friction');
    else if (stressLevel > 80 && energyLevel < 30) setBgState('preservation');
    else setBgState('neutral');
  }, [view, stressLevel, energyLevel, breathing]);

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
           {view === 'welcome' && <Welcome onEnter={() => setView('profile')} />}
           {view === 'profile' && <Identity userName={userName} setUserName={setUserName} onComplete={saveProfile} />}
           {view === 'dashboard' && <Horizon 
              userName={userName} sessionCount={sessionCount} 
              stressor={stressor} setStressor={setStressor} 
              stressLevel={stressLevel} setStressLevel={setStressLevel} 
              energyLevel={energyLevel} setEnergyLevel={setEnergyLevel} 
              isBurnout={isBurnout} setView={setView} 
              toggleSound={toggleSound} soundEnabled={soundEnabled} resetApp={resetApp}
           />}
           {view === 'preservation' && <Preservation setView={setView} setPathway={setPathway} setExpandingBelief={setExpandingBelief} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
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
           {view === 'alchemy' && <Alchemy setPathway={setPathway} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} />}
           {view === 'molt' && <Molt goal={goal} setGoal={setGoal} goalStep={goalStep} setGoalStep={setGoalStep} isLocked={isLocked} setIsLocked={setIsLocked} expandingBelief={expandingBelief} stressor={stressor} sessionCount={sessionCount} completeSession={completeSession} resetApp={resetApp} setView={setView} toggleSound={toggleSound} soundEnabled={soundEnabled} somaticZones={somaticZones} />}
           {view === 'energy' && <EnergyAnalyzer setView={setView} />}
        </div>
      </div>
    </>
  );
};

export default AdaptivEthereal;