# Technology Stack

**Analysis Date:** 2026-03-27

## Languages

**Primary:**
- TypeScript 5.8.2 - Full frontend codebase, React components, utilities, services, and configuration
- HTML5 - Application entry point (`index.html`)
- CSS3 - Inline styling in HTML, Tailwind utilities in JSX

**Secondary:**
- JSON - Configuration and type definitions

## Runtime

**Environment:**
- Node.js 16.17.1 - Development and build tooling

**Package Manager:**
- npm - Dependency management
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React 19.2.4 - UI framework, component-based architecture
- React DOM 19.2.4 - React rendering target for browser DOM

**Build/Dev:**
- Vite 6.2.0 - Build tool and development server
  - Entry point: `index.html`
  - Dev server port: 3000
  - Server host: 0.0.0.0
- @vitejs/plugin-react 5.0.0 - JSX/TSX support and Fast Refresh

**Styling:**
- Tailwind CSS (via CDN) - Utility-first CSS framework
  - Loaded from `https://cdn.tailwindcss.com`
  - Configuration: Inline in `index.html` via `tailwind.config`
  - Dark mode: Class-based (`dark` class on `<html>`)
  - Custom colors: `brand-primary` (#12C2DC), `brand-secondary` (#6FD9E8), `brand-accent` (#0FA9BF), `brand-dark` (#0B1622)
  - Custom fonts: Sora (sans), DM Mono (mono)

**UI Components:**
- lucide-react 0.563.0 - Icon library providing 50+ React icon components

## Key Dependencies

**Critical:**
- react (19.2.4) - Core UI library
- react-dom (19.2.4) - DOM rendering
- lucide-react (0.563.0) - Icon components used throughout UI
- vite (6.2.0) - Build and dev server

## Configuration

**Environment:**
- `.env` file present - Contains `VITE_API_BASE_URL` for backend API endpoint
  - Read via `import.meta.env.VITE_API_BASE_URL` (Vite environment variable)
  - Fallback: `http://localhost:8000/api` if not set
- Environment variable handling: Vite's `loadEnv()` in `vite.config.ts`

**Build:**
- `vite.config.ts` - Vite configuration with:
  - React plugin enabled for JSX/TSX
  - Path alias: `@` → project root (allows `import '@/src/...'`)
  - Environment variable exports to `process.env.GEMINI_API_KEY` and `process.env.API_KEY`
  - Dev server: port 3000, binds to 0.0.0.0
- `tsconfig.json` - TypeScript configuration:
  - Target: ES2022
  - Module: ESNext
  - JSX: react-jsx
  - Module resolution: bundler
  - Experimental decorators enabled
  - Path mapping: `@/*` → `./*`

## External Resources

**Fonts:**
- Google Fonts (preconnected)
  - Sora (400, 600, 700, 800 weights) - Main font
  - DM Mono (400, 500 weights) - Monospace font

**Telegram Integration:**
- Telegram Web App JavaScript SDK (`https://telegram.org/js/telegram-web-app.js`)
  - Loaded in `<head>` of `index.html`
  - Provides `window.Telegram.WebApp` API for Mini App functionality
  - Used for opening Telegram links and accessing initData

**Content Delivery:**
- ESM.sh CDN (import maps in HTML)
  - Provides ES modules for react, react-dom, lucide-react

## Platform Requirements

**Development:**
- Node.js 16.17.1+
- npm (any recent version)
- Modern browser with ES2022 support
- Telegram Bot Mini App support (optional, for full auth flow)

**Production:**
- Static hosting (Vite build output is pure HTML/CSS/JS)
- HTTPS required (for Telegram Mini App integration)
- Backend API endpoint (configurable via `VITE_API_BASE_URL`)
- CORS-enabled backend required for browser requests

## Build Output

**Commands:**
```bash
npm run dev       # Start dev server on port 3000 with hot reload
npm run build     # Vite build → dist/ directory
npm run preview   # Preview production build locally
```

**Production Artifacts:**
- `dist/` directory - Minified, optimized HTML/CSS/JS/assets ready for static hosting
- No server-side rendering (pure client-side SPA)

---

*Stack analysis: 2026-03-27*
