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
