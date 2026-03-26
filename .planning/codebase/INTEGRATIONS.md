# External Integrations

**Analysis Date:** 2026-03-27

## APIs & External Services

**YouTrack Backend API:**
- Base URL: `import.meta.env.VITE_API_BASE_URL` (defaults to `http://localhost:8000/api`)
- Authentication: JWT Bearer tokens (access + refresh)
- API Client: `src/services/ApiService.ts` (singleton: `apiService`)

**API Endpoints (POST-based):**
- `POST /api/login/` - Validate student code
- `POST /api/auth/init/` - Initialize Telegram auth, receive deep link
- `POST /api/auth/verify/` - Poll for Telegram login completion
- `POST /api/auth/token/refresh/` - Refresh expired access token
- `POST /api/dashboard/` - Fetch enrollment and course data
- `POST /api/lessons/` - Get lesson/assignment/attendance data
- `POST /api/attendance/mark/` - Mark attendance with keyword
- `POST /api/bot/submit-assignment/` - Submit homework with file attachments
- `POST /api/quiz/questions/` - Get quiz questions for a session
- `POST /api/quiz/submit/` - Submit quiz answers
- `POST /api/quiz/review/` - Get detailed quiz review (blocks reward earning)
- `POST /api/shop/` - Get available rewards
- `POST /api/claim-reward/` - Claim a reward
- `POST /api/notifications/` - Fetch notifications
- `POST /api/notifications/mark-read/` - Mark notification as read
- `POST /api/profile/` - Get current user profile
- `POST /api/profile/view/` - Get peer profile by enrollment ID
- `POST /api/profile/update/` - Update bio and avatar
- `POST /api/profile/privacy/` - Update privacy settings
- `POST /api/profile/activity/` - Get paginated activity feed
- `POST /api/profile/heatmap/` - Get 30-day activity heatmap
- `POST /api/leaderboard/` - Get group and course rankings
- `POST /api/contest/list/` - List visible contests
- `POST /api/contest/detail/` - Get contest details, prizes, winners
- `POST /api/contest/register/` - Register for scheduled contest
- `POST /api/contest/start/` - Start contest, receive questions
- `POST /api/contest/submit/` - Submit contest answers
- `POST /api/contest/results/` - Get finalized results and leaderboard
- `POST /api/contest/leaderboard/` - Get live contest leaderboard

**Response Format:** All endpoints return JSON: `{ success: boolean, data?: T, message?: string }`

**Error Handling:**
- SimpleJWT token errors: 401/403 with `detail` field containing "token", "expired", "not valid", or "credentials were not provided"
- Auto-refresh mechanism: On token error, attempts refresh once via `POST /api/auth/token/refresh/`, retries original request
- Race condition prevention: Shared `refreshPromise` ensures concurrent 401s don't trigger multiple refresh calls
- On refresh failure: Force logout, clear localStorage, reload page

**File Uploads:**
- Endpoint: `POST /api/bot/submit-assignment/`
- Format: `multipart/form-data`
- Field: `files` for multiple file attachments
- Also supports `attachments` JSON field for metadata

## Authentication & Identity

**Auth Provider:** Custom backend (Telegram-based)

**Flow:**
1. Student enters code → `POST /api/login/` validates
2. `POST /api/auth/init/` returns deep link to Telegram bot
3. Student clicks Telegram link → bot initiates auth flow
4. Client polls `POST /api/auth/verify/` (up to 30s, 1s intervals)
5. On success: Receive `access` and `refresh` JWT tokens
6. Tokens stored in `localStorage`: `authToken`, `refreshToken`, `studentCode`

**Token Management:**
- Access tokens included in `Authorization: Bearer {token}` header on all authenticated requests
- Refresh tokens used by auto-refresh interceptor in `ApiService.ts`
- SimpleJWT refresh endpoint: `POST /api/auth/token/refresh/` expects `{ refresh: string }`
- Returns: `{ access: string, refresh?: string }` (refresh may rotate)

**Session Storage:**
- `localStorage.authToken` - JWT access token
- `localStorage.refreshToken` - JWT refresh token
- `localStorage.studentCode` - User's enrollment code
- `localStorage.isLogged` - Boolean login state ("true"/"false")

## Telegram Integration

**Telegram Web App (Mini App):**
- SDK loaded from `https://telegram.org/js/telegram-web-app.js`
- Provides `window.Telegram.WebApp` API (if running in Telegram Mini App context)
- Used to open Telegram links via `window.Telegram.WebApp.openTelegramLink(url)`
- Deep link format: `https://t.me/[botname]?start=[start_param]`
- Auth verification: Client polls backend to check if user approved Telegram auth

**Detection & Fallbacks:**
- `isTelegramWebApp()` in `src/utils/telegram.ts` checks for `window.Telegram?.WebApp?.initData`
- Telegram links: `openTelegramLink()` uses `window.Telegram.WebApp.openTelegramLink()` or `window.open()`
- External URLs: `openExternalLink()` uses `window.Telegram.WebApp.openLink()` or `window.open()`
- Allows app to work both in Mini App and regular browser contexts

## State Management

**Client-Side:**
- React Context for feature-level state: `DashboardContext`, `LeaderboardContext`, `LessonsContext`, `ShopContext`, `NotificationContext`, `LanguageContext`
- localStorage for persistent user state and preferences
- ApiService singleton with subscription-based state management (`subscribe()`, `updateState()`)
- Automatic polling: `NotificationContext` polls for new notifications

## Data Storage

**Client-Side Storage:**
- `localStorage`:
  - Authentication: `authToken`, `refreshToken`, `studentCode`, `isLogged`
  - Theme: `theme` ("dark" or "light")
  - Language: `language` ("en" or "uz")
  - Contest state: `contest_[contestId]` (JSON-serialized play state)
- No cookies used
- No IndexedDB or service workers

**Backend Storage:** Not directly accessed by frontend
- Backend maintains all data (courses, enrollments, submissions, contests, profiles)
- Frontend reads via API endpoints only

## Caching

**Frontend Caching Strategy:**
- API responses stored in `ApiService` internal state map
- State persistence: `subscribe()` pattern for reactive updates
- Contest play state: localStorage-persisted for offline resilience
- No HTTP cache headers used (relies on Vite caching during dev)

## Internationalization (i18n)

**Translation Files:**
- `src/constants/translations/en.ts` - English translations (key-value object)
- `src/constants/translations/uz.ts` - Uzbek translations (key-value object)
- No external i18n library (custom `LanguageContext` with `t()` function)
- Simple interpolation: `t('key', { placeholder: value })` supports `{placeholder}` syntax
- User choice stored in `localStorage.language`

## Webhooks & Callbacks

**Incoming Webhooks:** None detected

**Polling (Simulated Callbacks):**
- Telegram auth verification: Client polls `POST /api/auth/verify/` every 1 second (max 30s)
- Notifications: `NotificationContext` periodically calls `POST /api/notifications/`
- No server-sent events (SSE) or WebSockets

## Monitoring & Observability

**Error Tracking:** None detected

**Logging:**
- No structured logging library detected
- Errors handled and stored in `ApiState.error` objects
- Frontend errors not centrally tracked

**Analytics:** None detected

## Environment Configuration

**Required Environment Variables:**
- `VITE_API_BASE_URL` - Backend API base URL (e.g., `https://api.youtrack.com`)

**How to Configure:**
1. Create `.env` file in project root
2. Add: `VITE_API_BASE_URL=https://api.youtrack.com`
3. Vite reads via `import.meta.env.VITE_API_BASE_URL`
4. Fallback at runtime: `http://localhost:8000/api`

**Secrets Location:**
- `.env` file (not committed to git)
- Tokens handled via runtime localStorage after login
- No API keys or secrets embedded in code

## CI/CD & Deployment

**Hosting:** Static hosting (Vite SPA build output)
- No server-side rendering or backend runtime
- Can be deployed to: Vercel, Netlify, GitHub Pages, AWS S3 + CloudFront, etc.

**CI Pipeline:** None detected in codebase

**Build Process:**
- `npm run build` → `vite build` → minified `dist/` directory
- Pure HTML/CSS/JavaScript output (no server needed)

## CORS & Security

**CORS:**
- Frontend makes cross-origin requests to backend API
- Backend must allow requests from frontend domain
- Bearer token authentication used (JSON body)

**Security Considerations:**
- Tokens stored in localStorage (accessible to XSS attacks)
- No CSRF tokens (API uses POST + JSON with Bearer auth)
- Telegram Mini App provides additional verification layer (optional)
- HTTPS required in production

## Third-Party Libraries

**Icon Library:**
- lucide-react 0.563.0 - Icon components for UI (LayoutDashboard, Trophy, BookOpen, Gift, Swords, etc.)

**Fonts:**
- Google Fonts: Sora (main), DM Mono (monospace) - via CDN preconnect

---

*Integration audit: 2026-03-27*
