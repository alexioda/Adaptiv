import React from 'react';
import { RefreshCw, Heart } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-6 z-50">
          <div className="glass-panel p-8 rounded-[32px] border border-white/10 max-w-sm w-full text-center animate-enter" style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(16px)' }}>
            <Heart size={48} className="text-teal-400 mx-auto mb-6" strokeWidth={1} />
            <h1 className="font-serif text-2xl text-white italic mb-4">Gentle Pause</h1>
            <p className="font-sans text-sm text-white/60 mb-8 leading-relaxed">
              A minor instability occurred in the neural interface. Your progress is safe. Take a breath and we'll restore the connection.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-4 rounded-full bg-teal-500 text-slate-900 font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-teal-400 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Restore Session
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full mt-3 py-3 rounded-full bg-transparent border border-white/10 text-white/50 font-sans text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
            >
              Hard Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
