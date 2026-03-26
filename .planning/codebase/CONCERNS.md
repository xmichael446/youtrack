# Codebase Concerns

**Analysis Date:** 2026-03-27

## Type Definition Gaps

**Missing Notification Type:**
- Issue: `NotificationContext.tsx` imports and uses `Notification` type that is not defined in `apiTypes.ts`
- Files: `src/context/NotificationContext.tsx` (line 3), `src/services/apiTypes.ts`
- Impact: TypeScript compilation fails. The NotificationContext assumes `Notification[]` but only `NotificationsResponse` (generic `any[]`) is defined
- Fix approach: Add explicit `Notification` interface to `apiTypes.ts` with fields: `id: number`, `read: boolean`, `scheduled_datetime: string`, `type: string`, etc.

**Missing LevelInfo Type:**
- Issue: `DashboardContext.tsx` imports `LevelInfo` from `apiTypes.ts` but only `CompactLevelInfo` is defined
- Files: `src/context/DashboardContext.tsx` (line 4), `src/services/apiTypes.ts`
- Impact: TypeScript compilation fails. Need `LevelInfo` with xp_current, xp_next, progress_percent, badge_color fields
- Fix approach: Either export `LevelInfo` as an alias of `CompactLevelInfo` or define full type with extended fields matching usage in `ProfileData`

**Missing QuizResponse Type:**
- Issue: `LessonsContext.tsx` imports `QuizResponse` from `apiTypes.ts` but this type is never exported
- Files: `src/context/LessonsContext.tsx` (line 9), `src/services/apiTypes.ts`
- Impact: TypeScript compilation fails for lessons context. Type is unused in actual implementation but import exists
- Fix approach: Remove unused import or define the type if it's needed for future use

## TypeScript Configuration Issues

**Incorrect moduleResolution Setting:**
- Issue: `tsconfig.json` uses `"moduleResolution": "bundler"` which is causing module resolution failures
- Files: `tsconfig.json` (line 16)
- Impact: Build fails with "Cannot find module 'lucide-react'" despite package being installed. Vite build also fails with crypto error
- Fix approach: Change to `"moduleResolution": "node"` which is standard for Node/Vite projects

**Missing react-dom Types:**
- Issue: `@types/react-dom` is installed but TypeScript errors indicate JSX types are not recognized
- Files: `tsconfig.json` (implicit)
- Impact: All JSX rendering causes cascading TS2339 errors ("Property 'div' does not exist on type 'JSX.IntrinsicElements'")
- Fix approach: Ensure `react-jsx` is correctly set in tsconfig and run `npm install` to reinstall types

## State Management Fragility

**Quiz Review Warning Lack of Persistence:**
- Issue: `QuizSection.tsx` shows a warning modal before quiz review (`/api/quiz/review/`), but this is a one-time warning per session
- Files: `src/features/lessons/QuizSection.tsx` (line 49, 339)
- Impact: If user dismisses warning and leaves without confirming, they may accidentally trigger review later without re-warning. Review permanently disqualifies from earning rewards
- Fix approach: Store quiz review acknowledgment in component state across modal dismissal, or require explicit confirmation button before API call

**Optimistic Update Inconsistency in Notifications:**
- Issue: `NotificationContext.tsx` uses optimistic updates for mark-as-read but doesn't fully revert on failure
- Files: `src/context/NotificationContext.tsx` (lines 81-88)
- Impact: If `markAsRead()` fails after optimistic update, UI shows notification as read but server still has it unread. Only `markAllAsRead` refetches on error
- Fix approach: Add error recovery in `markAsRead()` to refetch or revert state on failure

**Race Condition in Concurrent Notification Marking:**
- Issue: `markAllAsRead()` sends parallel requests but if some fail while others succeed, state becomes inconsistent
- Files: `src/context/NotificationContext.tsx` (lines 90-104)
- Impact: Partial failures silently treated as success (only logged to console). User sees all marked read but server has some still unread
- Fix approach: Implement per-notification result tracking or reject entire operation if any request fails

## localStorage Security & Persistence Issues

**Contest Play State Persisted in localStorage:**
- Issue: Entire quiz answers and contest state cached in localStorage under `contest_${contestId}` key
- Files: `src/features/contests/ContestPlayView.tsx` (lines 50-98)
- Impact: If browser/tab crashes, answers are preserved and reloaded automatically. No server source-of-truth confirmation before resubmission. Possible to manually edit JSON in browser devtools before submission
- Fix approach: Only cache question metadata/IDs, not answers. Answers should live server-side only until submission

**Credential Storage in localStorage:**
- Issue: JWT tokens (`authToken`, `refreshToken`) and student code stored in plain localStorage
- Files: `src/pages/Login.tsx`, `src/services/ApiService.ts`, `src/context/DashboardContext.tsx`
- Impact: XSS vulnerability exposure (any injected script can read tokens). No HttpOnly flag protection
- Fix approach: Consider sessionStorage for single-session tokens or explore secure cookie alternatives if backend supports

**Theme Preference Requires Manual localStorage Access:**
- Issue: Dark mode preference stored in localStorage and synced via `dark` class on `<html>`
- Files: `src/App.tsx` (lines 93-105)
- Impact: Preference not persisted across sessions reliably if CSS-in-JS is used elsewhere. No validation that stored value matches actual DOM state
- Fix approach: Add validation on load to ensure DOM state matches localStorage

## API Layer Concerns

**Hardcoded Refresh Token Endpoint:**
- Issue: Token refresh happens via hardcoded `/api/auth/token/refresh/` endpoint, bypassing normal baseURL building
- Files: `src/services/ApiService.ts` (line 307)
- Impact: If API base URL changes, refresh will still hit old hardcoded path. Inconsistent with all other API calls
- Fix approach: Use `this.buildURL('/api/auth/token/refresh/')` instead of concatenating baseURL directly

**Empty Generic Responses:**
- Issue: Multiple API response types use generic `any` for data fields: `ShopResponse`, `LessonsResponse`, `NotificationsResponse`
- Files: `src/services/apiTypes.ts` (lines 209, 220, 254)
- Impact: No type safety when accessing response data. Easy to access non-existent fields. Breaking API changes not caught
- Fix approach: Define explicit interfaces for each response data structure (e.g., `ShopData`, `LessonsData`, etc.)

**No Request Timeout Handling:**
- Issue: `fetch()` requests have no timeout, can hang indefinitely if backend is unresponsive
- Files: `src/services/ApiService.ts` (line 168)
- Impact: Stuck loading states, poor UX on slow networks. No way to force retry
- Fix approach: Implement AbortController with configurable timeout (e.g., 30s) in request method

**Token Refresh Race Condition (Partially Mitigated):**
- Issue: While `refreshPromise` prevents multiple refresh calls, the refresh endpoint itself could return multiple different tokens if called by different clients simultaneously
- Files: `src/services/ApiService.ts` (lines 289-330)
- Impact: If two tabs refresh concurrently, second tab's token gets stored but first tab's refresh_token might be rotated out, invalidating future refreshes
- Fix approach: Store refresh timestamp and skip refresh if one completed recently, or use localStorage events to sync token across tabs

## Navigation & Routing Issues

**Deep Link Session Restoration Incomplete:**
- Issue: If user deep-links to `/profile/:id` while not authenticated, they see login but router state is lost
- Files: `src/router/useRouter.ts`, `src/App.tsx`
- Impact: After login, user redirected to dashboard instead of requested profile. No way to resume deep-linked flow
- Fix approach: Store intended destination in localStorage before logout, restore after successful login

**Back Button Depth Tracking Can Desync:**
- Issue: `useRouter` tracks `depth.ref` to know if `history.back()` stays in app, but this resets on page reload
- Files: `src/router/useRouter.ts` (line 22, 43-50)
- Impact: If user reloads mid-session, depth counter resets. goBack() may navigate to wrong fallback. Deep-linked users have depth=0
- Fix approach: Reconstruct depth from history.length or store in sessionStorage

**Multiple Navigation Context Variants:**
- Issue: `NavigationContext.tsx` exists and provides `navigateTo()` but most pages use `useRouter()` directly
- Files: `src/context/NavigationContext.tsx`, `src/router/useRouter.ts`
- Impact: Two separate navigation APIs create inconsistency. NavigationContext not used everywhere it could be
- Fix approach: Consolidate to single source (prefer useRouter via context provider)

## Component Size & Complexity

**QuizSection Component at 596 Lines:**
- Issue: Single component handles info/article/solving/results/review modes with complex state machine
- Files: `src/features/lessons/QuizSection.tsx`
- Impact: Hard to test, maintain, and debug. Review warning state mixed with question rendering logic
- Fix approach: Split into separate view components (`QuizInfoView`, `QuizSolvingView`, `QuizResultsView`) with controlled mode transitions

**ContestDetailView at 523 Lines:**
- Issue: Displays detail info, registration, prizes, winners, and live leaderboard in single component
- Files: `src/features/contests/ContestDetailView.tsx`
- Impact: Multiple responsibilities make testing difficult. Leaderboard polling logic embedded alongside UI
- Fix approach: Extract LeaderboardPollingContainer and PrizesTable into separate components

**Header Component at 398 Lines:**
- Issue: Manages theme toggle, language selection, notifications dropdown, profile menu, and avatar loading
- Files: `src/components/Header.tsx`
- Impact: Heavy re-renders due to multiple state changes. Avatar fetch on every mount doesn't use component lifecycle efficiently
- Fix approach: Extract NotificationDropdown, ProfileMenu, and AvatarLoader into sub-components

## Test Coverage Gaps

**No Test Framework Configured:**
- Issue: `package.json` has no test script or test framework (jest, vitest, etc.)
- Files: `package.json`
- Impact: API layer changes, context hooks, and router logic have zero test coverage. Breaking changes undetected
- Fix approach: Add vitest + @testing-library/react for component and hook testing

**Contest Storage Key Collision Risk:**
- Issue: `CONTEST_STORAGE_KEY()` in `ContestPlayView` doesn't namespace contests, only uses ID
- Files: `src/features/contests/ContestPlayView.tsx` (line 50), `src/utils/contestHelpers.ts`
- Impact: If multiple contests share same ID (different seasons/cohorts), answers overwrite
- Fix approach: Use composite key like `contest_${userId}_${contestId}` or store in IndexedDB with schema

## Performance Concerns

**Notification Polling Every 5 Minutes:**
- Issue: `NotificationContext` polls `/api/notifications/` every 5 minutes regardless of visibility
- Files: `src/context/NotificationContext.tsx` (lines 58-77)
- Impact: Unnecessary network traffic on background tabs. Initial load blocks render if response is slow
- Fix approach: Only poll when tab is visible (already implemented), consider exponential backoff or server-sent events

**Avatar URL Fetched on Every Header Mount:**
- Issue: `Header.tsx` calls `apiService.getProfile()` in useEffect with user dependency, but user object changes frequently
- Files: `src/components/Header.tsx` (lines 38-57)
- Impact: Extra API call every time user data updates (coins, rank). No cache or memoization
- Fix approach: Cache avatar URL in DashboardContext or use useMemo with stable dependency

**No Memoization of Computed Data:**
- Issue: `DashboardContext` recomputes `user`, `course`, `event` objects on every render even when enrollment hasn't changed
- Files: `src/context/DashboardContext.tsx` (lines 138-170)
- Impact: Child components relying on `course` object reference equality will re-render unnecessarily
- Fix approach: Use useMemo for computed objects, or only recreate when enrollment actually changes

## Error Handling Gaps

**Generic Error Messages Lose Detail:**
- Issue: API errors wrapped in generic "Failed to..." messages, losing original error context
- Files: `src/context/LessonsContext.tsx` (lines 78-79, 99-100, 108-109)
- Impact: User sees "Failed to load quiz review" but developer can't diagnose if it was 401/403/500
- Fix approach: Preserve full error object or log details to console while showing user-friendly message

**No Global Error Boundary:**
- Issue: App has no React Error Boundary to catch component rendering errors
- Files: `src/App.tsx`
- Impact: Single component error crashes entire app with blank screen. No recovery UI
- Fix approach: Add ErrorBoundary wrapper around AppContent and pages

**Missing Loading State in Many Contexts:**
- Issue: `ContestContext`, `ShopContext` provide `loading` state but not all callers check it
- Files: `src/context/*Context.tsx`
- Impact: "Loading..." text or skeleton screens may not display. UI appears broken while data loads
- Fix approach: Make loading checks mandatory in all view components

## Data Consistency Issues

**No Optimistic Update Rollback in Form Submissions:**
- Issue: `submitHomework()` and `submitAssignment()` don't implement optimistic updates, causing lag
- Files: `src/context/LessonsContext.tsx` (lines 83-102)
- Impact: File uploads block UI until server responds. No way to cancel inflight requests
- Fix approach: Add optimistic UI state, implement request cancellation with AbortController

**Leaderboard Ranking Stale After Profile Navigation:**
- Issue: Clicking a leaderboard entry navigates to profile, but leaderboard context doesn't refresh on return
- Files: `src/context/LeaderboardContext.tsx`, `src/pages/Profile.tsx`
- Impact: Returning to leaderboard shows stale rank data. Requires manual refresh
- Fix approach: Refetch leaderboard on navigation back to view, or use cache invalidation

**Quiz State Not Cleared Between Attempts:**
- Issue: `QuizSection` mounts with `initialData` but doesn't clear form when user closes and reopens
- Files: `src/features/lessons/QuizSection.tsx` (lines 56-58)
- Impact: If user partially answers, closes, then re-opens same session quiz, previous answers are populated
- Fix approach: Clear answers on modal open or provide "restart" button

## Validation Gaps

**No Client-Side File Upload Validation:**
- Issue: `submitHomework()` accepts File[] but doesn't validate type, size, or count before upload
- Files: `src/services/ApiService.ts` (lines 114-136)
- Impact: Users can attempt uploading unsupported formats or huge files. Server rejection feels slow
- Fix approach: Validate MIME types and file size (e.g., <10MB) before creating FormData

**Missing Required Field Validation in Forms:**
- Issue: Profile update, homework submission, and assignment forms don't validate before API call
- Files: `src/features/profile/*`, `src/features/lessons/*`
- Impact: Network request sent with invalid data. Server error messages may be unclear
- Fix approach: Add form validation library (e.g., zod, yup) or implement custom validators

**No API Response Schema Validation:**
- Issue: API responses are cast to TypeScript types without runtime validation
- Files: `src/services/ApiService.ts` (entire response handling)
- Impact: If backend changes response structure, type assertions silently work until code tries to access missing fields
- Fix approach: Use zod or similar for response schema validation at fetch boundaries

## Known Limitations

**No Offline Support:**
- Issue: App requires network connection. No service worker or offline data caching
- Impact: Spotty connection causes repeated failures. No graceful degradation
- Fix approach: Implement service worker for critical endpoints, cache quiz/contest questions

**No Accessibility Audits:**
- Issue: No ARIA labels, alt text, or keyboard navigation testing documented
- Files: All component files
- Impact: Screen reader users and keyboard-only users may have poor experience
- Fix approach: Add axe-core testing, audit color contrast, ensure all interactive elements are keyboard accessible

**Single Enrollment Model:**
- Issue: Student can only be enrolled in one course at a time (stored in context as singleton)
- Files: `src/context/DashboardContext.tsx`
- Impact: Can't easily support users in multiple courses. Requires full app reload to switch
- Fix approach: Extend context to support course switching or multi-enrollment

---

*Concerns audit: 2026-03-27*
