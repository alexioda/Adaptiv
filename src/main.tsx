// main.tsx
// Replace your existing main.tsx with this file.
// The only change is wrapping <App /> with <CipherGate>.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CipherGate from './CipherGate';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CipherGate>
      <App />
    </CipherGate>
  </React.StrictMode>
);
