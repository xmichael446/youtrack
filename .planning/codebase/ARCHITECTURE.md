# Architecture

**Analysis Date:** 2026-03-27

## Pattern Overview

**Overall:** Client-side SPA with custom client-side router and layered Context API state management.

**Key Characteristics:**
- Client-side router with browser history integration (no external router library)
- Feature-based Context API architecture for state management
- Singleton API service with automatic token refresh and error interception
- View-based navigation model using `ViewState` string type
- Parametric routes supporting deep-linking (e.g., `/profile/:id`, `/contests/:id/:subview`)

## Layers

**Presentation Layer:**
- Purpose: Render UI and handle user interactions
- Location: `src/pages/`, `src/components/`, `src/features/`
- Contains: Page components, feature-specific components, reusable UI components
- Depends on: Context API providers, hooks, services
- Used by: React application root

**State Management Layer:**
- Purpose: Manage application and feature-specific state
- Location: `src/context/`
- Contains: React Context providers for Dashboard, Leaderboard, Lessons, Contests, Profile, Notifications, Language, Navigation
- Depends on: API service, custom hooks
- Used by: All page and feature components via hooks

**API Service Layer:**
- Purpose: Handle all HTTP communication, token refresh, error handling
- Location: `src/services/ApiService.ts`
- Contains: Singleton API service instance with request/response interceptors
- Depends on: localStorage (token storage), environment variables (base URL)
- Used by: Context providers and custom hooks

**Router Layer:**
- Purpose: Manage browser history and route parameter parsing
- Location: `src/router/`
- Contains: URL pattern matching, parameter extraction, history state management
- Depends on: browser History API, window location
- Used by: App.tsx for view switching

**Utility Layer:**
- Purpose: Shared helper functions and constants
- Location: `src/utils/`, `src/constants/`
- Contains: Date formatting, contest helpers, Telegram integration, translations
- Depends on: None (standalone utilities)
- Used by: Various components and services

## Data Flow

**Authentication Flow:**

1. User enters code on Login page
2. Login component calls `POST /api/login/` and `POST /api/auth/init/`
3. User taps Telegram deep link
4. Client polls `POST /api/auth/verify/` (max 30 seconds)
5. On success, tokens stored in localStorage (`authToken`, `refreshToken`, `studentCode`)
6. `isLogged` flag set to `true` in localStorage
7. App transitions from Login view to authenticated layout

**Request/Response Flow:**

1. Page/Component requests data via Context hook (e.g., `useDashboard()`)
2. Context uses `usePost` or `useGet` custom hook
3. Custom hook calls `apiService.postAndStore()` or `apiService.fetchAndStore()`
4. ApiService makes HTTP request with Authorization header
5. If 401/403 response detected (by status code + body inspection):
   - Check if token expired using `isTokenExpiredResponse()`
   - Call `tryRefreshToken()` to refresh access token via `POST /api/auth/token/refresh/`
   - Shared `refreshPromise` prevents concurrent refresh calls
   - On success, retry original request with new token
   - On failure, force logout and reload page
6. Response parsed and stored in Context state
7. Component re-renders with new data

**Navigation Flow:**

1. User clicks NavItem or navigates programmatically via `navigate(view, params)`
2. `useRouter` hook updates internal state: `{ view, params }`
3. `buildPath()` converts view + params to URL string (e.g., `/contests/123/play`)
4. `window.history.pushState()` adds entry to browser history (depth counter incremented)
5. App.tsx listens to state change and renders appropriate View component
6. View receives route params via `useNavigation()` context
7. User clicks back button → `goBack()` calls `window.history.back()` if depth > 0, else navigates to fallback view

**State Synchronization:**

- Router params passed through `NavigationContext` to all components
- Feature-specific Context providers (Lessons, Contests) convert route params to internal navigation state
- When route params change (browser back/forward), `useEffect` in feature components syncs internal state
- Example: In `Contests.tsx`, route param changes update `ContestNav` state via `paramsToNav()`

## Key Abstractions

**ViewState:**
- Purpose: Type-safe navigation targets
- Examples: `'dashboard' | 'leaderboard' | 'lessons' | 'rewards' | 'profile' | 'contests'`
- Pattern: Discriminated union type, used in `useRouter()` and `navigate()`
- Definition: `src/types.ts`

**RouteParams:**
- Purpose: Route parameter extraction and URL building
- Examples: `{ id: '123', subview: 'play' }`
- Pattern: Plain object, matched against route segments (`:id`, `:subview` in routes)
- Definition: `src/router/routes.ts`

**Context Providers:**
- Purpose: Feature-specific state management
- Examples: `DashboardProvider`, `LessonsProvider`, `ContestProvider`
- Pattern: React Context + useState, data fetched on mount via `useEffect`
- Key providers:
  - `DashboardProvider`: Enrollment, course, user profile data
  - `LessonsProvider`: Attendance, assignments, quiz state
  - `ContestProvider`: Contest details, registration, attempts
  - `NotificationProvider`: Poll notifications every 30 seconds
  - `LanguageContext`: i18n (English/Uzbek)
  - `NavigationContext`: Route params and navigation helpers

**API State Pattern:**
- Purpose: Standardized loading/error/data states for async operations
- Pattern: `{ data: T | null, loading: boolean, error: ApiError | null, lastUpdated: Date | null }`
- Used in: `ApiService.fetchAndStore()`, `ApiService.postAndStore()`
- Exposed via: `apiService.getState(key)`, `apiService.subscribe(key, listener)`

**Token Refresh Interceptor:**
- Purpose: Automatic token rotation on 401/403 responses
- Pattern: `isTokenExpiredResponse()` → `tryRefreshToken()` → retry original request
- Key feature: Shared `refreshPromise` to prevent "thundering herd" on concurrent 401s
- Location: `src/services/ApiService.ts` lines 170-204

## Entry Points

**Application Root:**
- Location: `src/index.tsx`
- Triggers: Browser loads HTML
- Responsibilities: Mount React app, wrap with LanguageProvider

**App Component:**
- Location: `src/App.tsx`
- Triggers: index.tsx render
- Responsibilities:
  - Initialize router with `useRouter('dashboard')`
  - Manage authentication state (check localStorage `isLogged`)
  - Choose between Login or authenticated layout
  - Wrap authenticated app with DashboardProvider, NotificationProvider
  - Render Header, Sidebar (desktop), BottomNav (mobile), main content area

**Page Components:**
- Location: `src/pages/`
- Triggers: App.tsx renders view based on currentView
- Responsibilities:
  - Render page-specific layout
  - Create feature Context provider if needed (e.g., `<LessonsProvider><LessonsContent /></LessonsProvider>`)
  - Pass data from custom hooks to feature components

**Feature Components:**
- Location: `src/features/{feature}/`
- Triggers: Page component renders
- Responsibilities: Render feature-specific UI, handle user interactions, dispatch state updates

## Error Handling

**Strategy:** Async/await with try-catch, user-facing error messages via Toast component

**Patterns:**

- **API Errors:** Caught in ApiService request/response, re-thrown as `ApiError` interface with message/status/data
- **Token Expiry:** Detected by status code (401/403) + body inspection for token-related messages, triggers automatic refresh
- **Network Errors:** Caught in ApiService, wrapped as `ApiError` with status 0 and "Network Error" message
- **Context Fetch Errors:** Stored in Context state `.error` field, displayed by component or shown via Toast
- **Force Logout:** Triggered on permanent 401 (refresh failed), clears localStorage and reloads page

**Example (DashboardContext):**
```typescript
const { data: dashboardData, loading, error } = usePost<DashboardData>(
  'dashboard-data',
  'api/dashboard/'
);
// Component checks: if (loading) <LoadingScreen/>; if (error) show error message
```

## Cross-Cutting Concerns

**Logging:** console.log used in some places (e.g., Login.tsx line 113), no centralized logging framework

**Validation:** Form validation on client-side before submission; API returns error messages for invalid requests

**Authentication:**
- Token stored in localStorage (authToken, refreshToken, studentCode, isLogged)
- Passed via Authorization header: `Bearer ${token}`
- Automatic refresh on 401/403 via `POST /api/auth/token/refresh/`
- Force logout clears localStorage and reloads page

**Theme:** Dark/light mode toggled by adding/removing `dark` class on `<html>` element, persisted in localStorage as `theme`

**Internationalization:** Translations in `src/constants/translations/{en,uz}.ts`, accessed via `useLanguage()` hook, supports `{placeholder}` interpolation

---

*Architecture analysis: 2026-03-27*
