// CipherGate.tsx
// ─────────────────────────────────────────────────────────────
// Drop this component into your project alongside App.tsx.
// It wraps the entire app and blocks access until a valid
// cipher is confirmed by the server-side API.
//
// Usage in main.tsx (or wherever you render App):
//
//   import CipherGate from './CipherGate';
//   import App from './App';
//
//   ReactDOM.createRoot(document.getElementById('root')!).render(
//     <CipherGate>
//       <App />
//     </CipherGate>
//   );
//
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

// ── STORAGE KEY ──
// Stores the authenticated state in localStorage so returning
// users within 90 days don't have to re-enter the cipher.
const AUTH_KEY     = 'adaptiv_auth_v1';
const AUTH_EXPIRY  = 90 * 24 * 60 * 60 * 1000; // 90 days in ms

interface AuthRecord {
  timestamp: number;
}

function isAuthValid(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const record: AuthRecord = JSON.parse(raw);
    return Date.now() - record.timestamp < AUTH_EXPIRY;
  } catch {
    return false;
  }
}

function persistAuth() {
  try {
    const record: AuthRecord = { timestamp: Date.now() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(record));
  } catch {}
}

function clearAuth() {
  try { localStorage.removeItem(AUTH_KEY); } catch {}
}

// ── STYLES (injected — no external CSS dependency) ──
const gateStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');

  #adaptiv-gate {
    position: fixed;
    inset: 0;
    background: #020617;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Inter', sans-serif;
    animation: gateIn 0.4s ease forwards;
  }

  #adaptiv-gate.exiting {
    animation: gateOut 0.6s ease forwards;
  }

  @keyframes gateIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes gateOut {
    from { opacity: 1; transform: scale(1); }
    to   { opacity: 0; transform: scale(1.02); }
  }

  .gate-card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 20px;
    padding: 40px 36px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
    animation: cardUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
  }

  @keyframes cardUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .gate-logo {
    width: 56px;
    height: 56px;
    border: 1px solid rgba(178,148,94,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    background: rgba(178,148,94,0.05);
  }

  .gate-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-style: italic;
    color: #f1f5f9;
    text-align: center;
    margin: 0 0 6px;
    line-height: 1.2;
  }

  .gate-subtitle {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(148,163,184,0.6);
    text-align: center;
    margin: 0 0 32px;
  }

  .gate-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(148,163,184,0.5);
    margin-bottom: 10px;
    display: block;
  }

  .gate-input-wrap {
    position: relative;
    margin-bottom: 14px;
  }

  .gate-input {
    width: 100%;
    padding: 14px 48px 14px 16px;
    background: #020617;
    border: 1px solid #334155;
    border-radius: 10px;
    color: #f1f5f9;
    font-family: 'Inter', monospace;
    font-size: 14px;
    letter-spacing: 0.15em;
    text-align: center;
    outline: none;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
  }

  .gate-input::placeholder {
    color: #334155;
    letter-spacing: 0.1em;
  }

  .gate-input:focus {
    border-color: #b2945e;
  }

  .gate-input.error {
    border-color: #f43f5e;
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }

  .gate-btn {
    width: 100%;
    padding: 14px;
    background: #b2945e;
    border: none;
    border-radius: 10px;
    color: #020617;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .gate-btn:hover:not(:disabled) {
    background: #c9a870;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(178,148,94,0.25);
  }

  .gate-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .gate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .gate-error {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #f43f5e;
    margin-top: 12px;
    text-align: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .gate-footer {
    margin-top: 28px;
    text-align: center;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(71,85,105,0.7);
  }

  .gate-footer span {
    color: #b2945e;
  }

  .gate-divider {
    width: 40px;
    height: 1px;
    background: rgba(178,148,94,0.2);
    margin: 20px auto;
  }

  .gate-access-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(20,184,166,0.6);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .gate-pulse {
    width: 6px;
    height: 6px;
    background: #14b8a6;
    border-radius: 50%;
    animation: pulse 2s ease infinite;
  }

  @keyframes pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.4; transform: scale(0.8); }
  }
`;

// ── COMPONENT ──
interface CipherGateProps {
  children: React.ReactNode;
}

const CipherGate: React.FC<CipherGateProps> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(() => isAuthValid());
  const [cipher,        setCipher]        = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [exiting,       setExiting]       = useState(false);
  const [attempts,      setAttempts]      = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when gate appears
  useEffect(() => {
    if (!authenticated) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [authenticated]);

  const handleSubmit = async () => {
    if (!cipher.trim() || loading) return;

    // Throttle after 5 failed attempts
    if (attempts >= 5) {
      setError('Too many attempts. Please contact LiveAdaptiv for access.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-cipher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cipher: cipher.trim() }),
      });

      const data = await res.json();

      if (data.valid) {
        // Persist auth then animate out
        persistAuth();
        setExiting(true);
        setTimeout(() => setAuthenticated(true), 600);
      } else {
        setAttempts(prev => prev + 1);
        setError('Invalid access code. Contact your facilitator.');
        setCipher('');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch {
      // Network error — fail open with a message
      // For offline/dev use, you can remove this and fail closed
      setError('Connection error. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // Already authenticated — render app directly
  if (authenticated) return <>{children}</>;

  return (
    <>
      <style>{gateStyles}</style>
      <div id="adaptiv-gate" className={exiting ? 'exiting' : ''}>
        <div className="gate-card">

          {/* Logo */}
          <div className="gate-logo">
            <Activity size={24} color="#b2945e" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h1 className="gate-title">Adaptiv</h1>
          <p className="gate-subtitle">LiveAdaptiv · Secure Access</p>

          {/* Access indicator */}
          <div className="gate-access-label" style={{ marginBottom: '24px' }}>
            <div className="gate-pulse" />
            Protected Session
          </div>

          {/* Input */}
          <label className="gate-label">Access Code</label>
          <div className="gate-input-wrap">
            <input
              ref={inputRef}
              type="password"
              value={cipher}
              onChange={e => { setCipher(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="ENTER CODE"
              className={`gate-input ${error ? 'error' : ''}`}
              autoComplete="off"
              autoCapitalize="characters"
              disabled={loading || attempts >= 5}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={!cipher.trim() || loading || attempts >= 5}
            className="gate-btn"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Verifying...</>
              : <>Authenticate <ArrowRight size={14} /></>
            }
          </button>

          {/* Error */}
          {error && (
            <div className="gate-error">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          {/* Divider + footer */}
          <div className="gate-divider" />
          <div className="gate-footer">
            <span>LiveAdaptiv</span> · Performance Systems · 2026
          </div>

        </div>
      </div>
    </>
  );
};

export default CipherGate;

