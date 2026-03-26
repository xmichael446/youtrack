# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on port 3000
npm run build     # Build for production
npm run preview   # Preview production build
```

No test runner is configured in this project.

## Environment

Create a `.env` file:
```
VITE_API_BASE_URL=https://api.youtrack.com
```

The API base URL is read by `ApiService` via `import.meta.env.VITE_API_BASE_URL`.

## Architecture

### Navigation & Layout
The app uses a simple `ViewState` string (`'dashboard' | 'leaderboard' | 'lessons' | 'rewards'`) held in `App.tsx` — there is no router. Authentication state is stored in `localStorage` (`isLogged`, `authToken`, `refreshToken`, `studentCode`). Theme (dark/light) is persisted in `localStorage` and toggled by adding/removing the `dark` class on `<html>`.

### API Layer (`src/services/`)
- `ApiService.ts` — singleton class exported as `apiService`. Wraps `fetch` with automatic JWT token refresh (via `POST /api/auth/token/refresh/`). On 401/403 responses it inspects the response body for SimpleJWT error messages, refreshes once, then retries. Uses a shared `refreshPromise` to prevent token rotation races from concurrent requests. Force-logouts by clearing `localStorage` and reloading the page.
- `apiTypes.ts` — all TypeScript interfaces for API request/response shapes.
- Always use the `apiService` singleton for network calls; never use `fetch` directly.

### Context / State Management (`src/context/`)
Each major feature has its own React Context:
- `DashboardContext` — wraps the entire authenticated app; fetches and exposes enrollment/course data from `POST /api/dashboard/`.
- `LeaderboardContext` — wraps `AppContent`; fetches group + course rankings.
- `LessonsContext` — wraps the `Lessons` page; manages attendance marking, assignment submission, and quiz flow.
- `ShopContext` — wraps the `Rewards` page; manages reward listing and claiming.
- `NotificationContext` — wraps `AppContent`; polls for notifications.
- `LanguageContext` — wraps the entire app (including Login); provides the `t()` translation function.

Provider nesting order in `App.tsx`: `LanguageContext` (outermost) → `DashboardProvider` → `NotificationProvider` → `LeaderboardProvider` (inside `AppContent`).

### Internationalization
Translations live in `src/constants/translations/en.ts` and `uz.ts` as plain key-value objects. The `t()` helper from `useLanguage()` supports simple `{placeholder}` interpolation (e.g., `t('quizReadyDesc', { count: 5 })`).

### Styling
Tailwind CSS with a custom `brand-primary` color (`#12c2dc`). Dark mode via the `dark` class strategy. Use `brand-primary` for primary actions and highlights. The `@` alias maps to the project root.

### Login Flow
Telegram-based authentication: student enters code → `POST /api/login/` (validate) → `POST /api/auth/init/` (get deep link) → student taps Telegram link → client polls `POST /api/auth/verify/` (up to 30 s) → receives `access` + `refresh` JWT tokens.

### Quiz Flow
Quizzes are linked to lesson sessions. The key UX constraint: calling `/api/quiz/review/` permanently disqualifies the enrollment from earning rewards on that session. The UI must warn users before they access detailed review.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**YouTrack UI Overhaul**

A comprehensive UI standardization and redesign of the YouTrack LMS — a gamified education app for managing online courses. The app has leaderboards, a rewards shop, quizzes, and attendance tracking. The current UI was built incrementally and looks inconsistent, as if different developers built different pages with different instructions. This project brings it all under one cohesive, playful visual language inspired by Khan Academy.

**Core Value:** Every page feels like it was designed by one person — consistent, playful, and polished enough that users never think "this looks AI-generated."

### Constraints

- **Tech stack**: Must stay on React + Tailwind + Vite — no new UI frameworks
- **Functionality**: All existing features must continue working — this is a reskin + redesign, not a rebuild
- **Telegram**: Must preserve Telegram Mini App integration and login flow
- **i18n**: Must support both English and Uzbek translations
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.8.2 - Full frontend codebase, React components, utilities, services, and configuration
- HTML5 - Application entry point (`index.html`)
- CSS3 - Inline styling in HTML, Tailwind utilities in JSX
- JSON - Configuration and type definitions
## Runtime
- Node.js 16.17.1 - Development and build tooling
- npm - Dependency management
- Lockfile: `package-lock.json` (present)
## Frameworks
- React 19.2.4 - UI framework, component-based architecture
- React DOM 19.2.4 - React rendering target for browser DOM
- Vite 6.2.0 - Build tool and development server
- @vitejs/plugin-react 5.0.0 - JSX/TSX support and Fast Refresh
- Tailwind CSS (via CDN) - Utility-first CSS framework
- lucide-react 0.563.0 - Icon library providing 50+ React icon components
## Key Dependencies
- react (19.2.4) - Core UI library
- react-dom (19.2.4) - DOM rendering
- lucide-react (0.563.0) - Icon components used throughout UI
- vite (6.2.0) - Build and dev server
## Configuration
- `.env` file present - Contains `VITE_API_BASE_URL` for backend API endpoint
- Environment variable handling: Vite's `loadEnv()` in `vite.config.ts`
- `vite.config.ts` - Vite configuration with:
- `tsconfig.json` - TypeScript configuration:
## External Resources
- Google Fonts (preconnected)
- Telegram Web App JavaScript SDK (`https://telegram.org/js/telegram-web-app.js`)
- ESM.sh CDN (import maps in HTML)
## Platform Requirements
- Node.js 16.17.1+
- npm (any recent version)
- Modern browser with ES2022 support
- Telegram Bot Mini App support (optional, for full auth flow)
- Static hosting (Vite build output is pure HTML/CSS/JS)
- HTTPS required (for Telegram Mini App integration)
- Backend API endpoint (configurable via `VITE_API_BASE_URL`)
- CORS-enabled backend required for browser requests
## Build Output
- `dist/` directory - Minified, optimized HTML/CSS/JS/assets ready for static hosting
- No server-side rendering (pure client-side SPA)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase (e.g., `Dashboard.tsx`, `BackButton.tsx`)
- Utility/helper files: camelCase (e.g., `formatDateTime.ts`, `profileHelpers.ts`)
- Type definition files: camelCase (e.g., `apiTypes.ts`, `language.ts`)
- Context files: PascalCase with "Context" suffix (e.g., `DashboardContext.tsx`, `LanguageContext.tsx`)
- Pages in `src/pages/`: PascalCase (e.g., `Profile.tsx`, `Lessons.tsx`)
- Features in `src/features/`: kebab-case directories with PascalCase component files
- camelCase for utility/helper functions: `formatDateTime()`, `getInitials()`, `buildHeatmapGrid()`
- camelCase for hook functions: `useCountdown()`, `useRouter()`, `useBodyScrollLock()`
- camelCase for event handlers: `handleLogin()`, `toggleTheme()`, `navigateTo()`
- Custom hooks always start with `use`: `useLanguage()`, `useDashboard()`, `useLessons()`
- camelCase for local variables and state: `currentView`, `isDark`, `timeLeft`, `submittingAssignment`
- camelCase for object properties: `enrollment`, `loading`, `error`, `lastUpdated`
- SCREAMING_SNAKE_CASE for constants/enums: `RARITY_COLORS`, `CURRENT_USER`, `LEADERBOARD_DATA`
- Underscore prefix for private/internal methods: `_doRefresh()`, `_buildURL()` (not consistently used; follow pattern when encountered)
- PascalCase for interface names: `HeaderProps`, `DashboardContextType`, `ApiResponse<T>`
- PascalCase for type aliases: `ViewState`, `Language`, `ContestStatus`
- PascalCase for enum names: `AttachmentType`
- Suffix Context interfaces with "ContextType": `LanguageContextType`, `DashboardContextType`, `ContestContextType`
- Suffix component props with "Props": `HeaderProps`, `FooterProps`, `LoadingScreenProps`
## Code Style
- No explicit linter/formatter configured in project (`.eslintrc`, `.prettierrc` not present)
- 2-space indentation observed in vite.config.ts
- Line length varies, no strict enforced limit
- Import statements use single quotes: `import { useState } from 'react'`
- No ESLint configuration detected
- No Prettier configuration detected
- TypeScript strict mode enabled in `tsconfig.json`
- `skipLibCheck: true`, `isolatedModules: true` in compiler options
## Import Organization
- `@/*` maps to project root (configured in `tsconfig.json`)
- Used sparingly in codebase; most imports use relative paths
- Modules exported from feature directories via barrel files: `src/features/profile/index.ts`
## Error Handling
- Try-catch blocks used for async operations (`fetch`, API calls, `JSON.parse`)
- `catch` blocks typically catch errors but may silently fall back to defaults (e.g., Header.tsx line 48-56 catches profile fetch errors and falls back to dashboard user avatar)
- Errors propagated as thrown objects with shape `ApiError` from ApiService
- No centralized error logger; errors handled inline at call sites
- `ApiError` interface with `message`, `status`, `statusText`, and optional `data` fields
- Network errors normalized to `status: 0, statusText: 'Network Error'`
- Response validation before throwing (checks `response.ok` after fetch)
## Logging
- `console.log()` used minimally (observed in App.tsx line 113 for login flow)
- No structured logging approach; logging used for debugging only
- No log levels (info, warn, error) enforced
- Consider logs for: critical user actions (login), API failures, state changes during development
## Comments
- Complex business logic: token refresh race condition prevention (ApiService.ts lines 35-37, 170-204)
- Algorithm explanations: heatmap grid building (profileHelpers.ts lines 42-66)
- Non-obvious workarounds: Vite URL normalization (ApiService.ts lines 42-45)
- Temporary debugging markers rarely used
- JSDoc comments used for public methods in ApiService: `/** GET request */`, `/** POST request */`
- Method-level documentation: parameter and return types inferred from TypeScript signatures
- Minimal inline documentation; code structure is often self-documenting
## Function Design
- Functions kept concise (10-40 lines typical for components and utilities)
- Hooks generally 5-30 lines
- Larger functions decomposed into smaller utility functions
- React components receive props as single object with explicit interface: `const Header: React.FC<HeaderProps>`
- Utility functions accept typed parameters: `formatDateTime(iso: string): string`
- Optional parameters use TypeScript `?` operator: `buildPath(view: ViewState, params?: RouteParams)`
- Callback parameters typed explicitly: `const goBack = useCallback((fallbackView: ViewState = 'dashboard') => ...)`
- React components return `React.ReactNode` (implicitly via JSX)
- Hooks return single value or tuple: `useCountdown()` returns `string`, `useRouter()` returns object with multiple properties
- Async functions return Promise: `fetchAndStore<T>(): Promise<T>`
- Generic return types used for API calls: `ApiResponse<T>` wraps response data
## Module Design
- Named exports preferred for utilities and helper functions
- Default exports used for React components (pages and major components)
- Type exports use `export type` for type-only imports
- Context providers exported as named exports: `export const DashboardProvider`
- Singleton instances exported as named exports: `export const apiService = new ApiService()`
- Used selectively in feature directories: `src/features/profile/index.ts` exports main profile feature
- Central index files aggregate related utilities (e.g., `context/index.ts` would export all context hooks)
- Not overused; many directories import directly from individual files
## Tailwind CSS Conventions
- Brand color token `brand-primary` (#12c2dc) used throughout
- Dark mode via `dark:` prefix strategy
- Responsive design with `md:` breakpoint prefix
- Utility classes for spacing, sizing, positioning (no custom CSS files observed)
- No CSS-in-JS; 100% Tailwind-based styling
- State classes for interactivity: `group-hover:`, `active:scale-95`
- Animation classes: `animate-in`, `fade-in`, `duration-500`, `transition-all`, `animate-pulse`
- Text color classes follow pattern: `text-brand-primary`, `text-gray-500`, `dark:text-slate-400`
## Types and Interfaces
- Props interfaces defined at top of component file before component definition
- API response types centralized in `src/services/apiTypes.ts` (contains 100+ type definitions)
- Domain models in `src/types.ts` and feature-specific type files
- Generic types for API wrappers: `ApiResponse<T>`, `ApiState<T>`
- Context types suffixed with "Type" or "ContextType"
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Client-side router with browser history integration (no external router library)
- Feature-based Context API architecture for state management
- Singleton API service with automatic token refresh and error interception
- View-based navigation model using `ViewState` string type
- Parametric routes supporting deep-linking (e.g., `/profile/:id`, `/contests/:id/:subview`)
## Layers
- Purpose: Render UI and handle user interactions
- Location: `src/pages/`, `src/components/`, `src/features/`
- Contains: Page components, feature-specific components, reusable UI components
- Depends on: Context API providers, hooks, services
- Used by: React application root
- Purpose: Manage application and feature-specific state
- Location: `src/context/`
- Contains: React Context providers for Dashboard, Leaderboard, Lessons, Contests, Profile, Notifications, Language, Navigation
- Depends on: API service, custom hooks
- Used by: All page and feature components via hooks
- Purpose: Handle all HTTP communication, token refresh, error handling
- Location: `src/services/ApiService.ts`
- Contains: Singleton API service instance with request/response interceptors
- Depends on: localStorage (token storage), environment variables (base URL)
- Used by: Context providers and custom hooks
- Purpose: Manage browser history and route parameter parsing
- Location: `src/router/`
- Contains: URL pattern matching, parameter extraction, history state management
- Depends on: browser History API, window location
- Used by: App.tsx for view switching
- Purpose: Shared helper functions and constants
- Location: `src/utils/`, `src/constants/`
- Contains: Date formatting, contest helpers, Telegram integration, translations
- Depends on: None (standalone utilities)
- Used by: Various components and services
## Data Flow
- Router params passed through `NavigationContext` to all components
- Feature-specific Context providers (Lessons, Contests) convert route params to internal navigation state
- When route params change (browser back/forward), `useEffect` in feature components syncs internal state
- Example: In `Contests.tsx`, route param changes update `ContestNav` state via `paramsToNav()`
## Key Abstractions
- Purpose: Type-safe navigation targets
- Examples: `'dashboard' | 'leaderboard' | 'lessons' | 'rewards' | 'profile' | 'contests'`
- Pattern: Discriminated union type, used in `useRouter()` and `navigate()`
- Definition: `src/types.ts`
- Purpose: Route parameter extraction and URL building
- Examples: `{ id: '123', subview: 'play' }`
- Pattern: Plain object, matched against route segments (`:id`, `:subview` in routes)
- Definition: `src/router/routes.ts`
- Purpose: Feature-specific state management
- Examples: `DashboardProvider`, `LessonsProvider`, `ContestProvider`
- Pattern: React Context + useState, data fetched on mount via `useEffect`
- Key providers:
- Purpose: Standardized loading/error/data states for async operations
- Pattern: `{ data: T | null, loading: boolean, error: ApiError | null, lastUpdated: Date | null }`
- Used in: `ApiService.fetchAndStore()`, `ApiService.postAndStore()`
- Exposed via: `apiService.getState(key)`, `apiService.subscribe(key, listener)`
- Purpose: Automatic token rotation on 401/403 responses
- Pattern: `isTokenExpiredResponse()` → `tryRefreshToken()` → retry original request
- Key feature: Shared `refreshPromise` to prevent "thundering herd" on concurrent 401s
- Location: `src/services/ApiService.ts` lines 170-204
## Entry Points
- Location: `src/index.tsx`
- Triggers: Browser loads HTML
- Responsibilities: Mount React app, wrap with LanguageProvider
- Location: `src/App.tsx`
- Triggers: index.tsx render
- Responsibilities:
- Location: `src/pages/`
- Triggers: App.tsx renders view based on currentView
- Responsibilities:
- Location: `src/features/{feature}/`
- Triggers: Page component renders
- Responsibilities: Render feature-specific UI, handle user interactions, dispatch state updates
## Error Handling
- **API Errors:** Caught in ApiService request/response, re-thrown as `ApiError` interface with message/status/data
- **Token Expiry:** Detected by status code (401/403) + body inspection for token-related messages, triggers automatic refresh
- **Network Errors:** Caught in ApiService, wrapped as `ApiError` with status 0 and "Network Error" message
- **Context Fetch Errors:** Stored in Context state `.error` field, displayed by component or shown via Toast
- **Force Logout:** Triggered on permanent 401 (refresh failed), clears localStorage and reloads page
```typescript
```
## Cross-Cutting Concerns
- Token stored in localStorage (authToken, refreshToken, studentCode, isLogged)
- Passed via Authorization header: `Bearer ${token}`
- Automatic refresh on 401/403 via `POST /api/auth/token/refresh/`
- Force logout clears localStorage and reloads page
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
