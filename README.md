# Adaptiv

A React/Vite single-page app for real-time stress and energy regulation, part of the LiveAdaptiv ecosystem. Users work through a guided flow — naming a stressor, noticing the somatic response, reframing it with AI-generated coaching questions, and sealing a personal "manifesto" — before moving on to goal-setting and integration.

## Stack

- **Frontend:** React 18 + TypeScript, built with Vite 5, styled with Tailwind CSS, icons from `lucide-react`.
- **Backend:** Five Vercel Edge Functions under `api/`, each calling the Google Gemini API (either directly via `fetch` or through the Vercel AI SDK's `@ai-sdk/google` provider).
- **Deployment:** Vercel (see `vercel.json`).

## API routes

| Route | Purpose |
|---|---|
| `api/ai.ts` | Generic Gemini passthrough (raw REST call) |
| `api/somatic-echo.ts` | Mirrors the user's body sensation back in one sentence |
| `api/coaching-questions.ts` | Generates the four reframing questions |
| `api/energy-analysis.ts` | One-sentence "Power Shift" insight for the energy analyzer |
| `api/manifesto.ts` | Generates the closing personal decree |

All five expect a Gemini API key in one of `GEMINI_API_KEY`, `GOOGLE_API_KEY`, or `GOOGLE_GENERATIVE_AI_API_KEY` (checked in that order) — set at least one in the Vercel project's environment variables. Locally, put it in a `.env` file (already gitignored).

## Development

```bash
npm install
npm run dev       # start the Vite dev server
npm run build     # type-check (tsc -b) and build for production
npm run lint      # eslint
npm run preview   # preview the production build locally
```

## Project structure

```
api/            Vercel Edge Functions (Gemini calls)
src/
  App.tsx       Main application — all views and state
  App.css
  index.css
  main.tsx      Entry point
public/         Static assets
```

## Checkout

Paid upgrade links point to `billing.liveadaptiv.com` (Lemon Squeezy checkout URLs embedded in `src/App.tsx`).
