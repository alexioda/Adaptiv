import fs from 'fs';
import path from 'path';

// 1. Define correct file contents
const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Adaptiv</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- FORCED FIX: Points to .tsx -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const mainTsxContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

const packageJsonContent = `{
  "name": "adaptiv-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}`;

// 2. Perform Clean-up
console.log('🧹 Cleaning up...');

// Delete dist folder
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('✅ Deleted dist/ folder');
}

// Delete public/index.html if it exists (Common cause of this error)
if (fs.existsSync('public/index.html')) {
  fs.unlinkSync('public/index.html');
  console.log('✅ Deleted conflicting public/index.html');
}

// 3. Overwrite Critical Files
console.log('📝 Writing correct files...');

fs.writeFileSync('index.html', indexHtmlContent);
console.log('✅ Fixed index.html (pointing to main.tsx)');

// Ensure src directory exists
if (!fs.existsSync('src')) fs.mkdirSync('src');

fs.writeFileSync('src/main.tsx', mainTsxContent);
console.log('✅ Fixed src/main.tsx');

fs.writeFileSync('package.json', packageJsonContent);
console.log('✅ Fixed package.json build scripts');

console.log('\n🎉 REPAIR COMPLETE.');
console.log('👉 Please click "Push to GitHub" now.');