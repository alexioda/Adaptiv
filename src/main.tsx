import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CipherGate from './CipherGate';
import './index.css'; // ← THIS IS THE MISSING PIECE THAT FIXES THE WHITE SCREEN

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CipherGate>
      <App />
    </CipherGate>
  </React.StrictMode>
);
