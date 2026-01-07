import fs from 'fs';

// 1. CONFIGURATION FILES
const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`;

const tsConfigContent = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;

const tsConfigNodeContent = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`;

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

// 2. EXECUTE REPAIR
console.log('🛠️  Starting Comprehensive Build Repair...');

// Write Config Files
fs.writeFileSync('vite.config.ts', viteConfigContent);
console.log('✅ Wrote vite.config.ts');

fs.writeFileSync('tsconfig.json', tsConfigContent);
console.log('✅ Wrote tsconfig.json');

fs.writeFileSync('tsconfig.node.json', tsConfigNodeContent);
console.log('✅ Wrote tsconfig.node.json');

// Write Entry Files
fs.writeFileSync('index.html', indexHtmlContent);
console.log('✅ Wrote index.html');

if (!fs.existsSync('src')) fs.mkdirSync('src');
fs.writeFileSync('src/main.tsx', mainTsxContent);
console.log('✅ Wrote src/main.tsx');

// Cleanup
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('🧹 Cleaned dist folder');
}
if (fs.existsSync('public/index.html')) {
  fs.unlinkSync('public/index.html');
  console.log('🧹 Removed conflicting public/index.html');
}

console.log('\n🚀 REPAIR COMPLETE. Click "Push to GitHub" to rebuild.');