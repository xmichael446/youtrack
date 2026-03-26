# Testing Patterns

**Analysis Date:** 2026-03-27

## Test Framework

**Status:** No test runner configured in this project

- No Jest, Vitest, or other test framework installed in `package.json`
- No test configuration files present (no `jest.config.js`, `vitest.config.ts`, etc.)
- No test files found in codebase (no `*.test.ts`, `*.spec.ts` files)
- `package.json` contains only three scripts: `dev`, `build`, `preview` — no `test` script

**Project Type:** Development-only — testing not implemented

## Test File Organization

**Location:** Not applicable — testing framework not configured

**Naming:** Not applicable

**Structure:** Not applicable

## Test Structure

Testing framework and test files are not present in this project. The codebase is built without a testing setup.

## Mocking

**Framework:** Not applicable — no testing framework configured

**Patterns:** Not applicable

**What to Mock:** Not applicable

**What NOT to Mock:** Not applicable

## Fixtures and Factories

**Test Data:**
While not in test files, the codebase contains mock data constants in `src/constants.ts`:

```typescript
export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Qobilov Hasan',
  avatar: 'https://picsum.photos/200/200',
  coins: 27,
  xp: 240,
  groupRank: 2,
  globalRank: 5
};

export const LEADERBOARD_DATA: StudentRank[] = [
  { rank: 1, name: 'Ozodbek Rajabov', points: 240, avgXp: '98%' },
  // ... more entries
];

export const ACTIVITY_LOG: ActivityItem[] = [
  { id: 'a1', date: 'Feb 3, 2026', action: 'Lesson Attendance', xpChange: 10, coinChange: 1 },
  // ... more entries
];
```

**Location:**
- `src/constants.ts` — Contains mock data for development/preview
- Mock data is hardcoded and not used in production (actual data comes from `ApiService`)

## Coverage

**Requirements:** No coverage configuration or requirements enforced

**View Coverage:** Not applicable — testing framework not present

## Test Types

**Unit Tests:** Not implemented

**Integration Tests:** Not implemented

**E2E Tests:** Not implemented

## Manual Testing Approach

The project relies on manual testing via the development server:

**Commands:**
```bash
npm run dev       # Start dev server on port 3000 with hot reload
npm run preview   # Preview production build locally
npm run build     # Build for production
```

**Development Workflow:**
1. Run `npm run dev` to start development server
2. Manual browser testing of features
3. Browser DevTools for debugging (React DevTools if available)
4. Network tab inspection for API calls
5. Console inspection for errors

## Testing Concerns & Recommendations

**Key Areas Without Tests:**

1. **ApiService Token Refresh Logic** (`src/services/ApiService.ts` lines 170-204)
   - Complex race condition prevention using shared `refreshPromise`
   - Critical path for authentication
   - No tests verify concurrent 401 handling or token rotation
   - Recommend: Unit tests for `tryRefreshToken()` and `isTokenExpiredResponse()`

2. **Router State Management** (`src/router/useRouter.ts`)
   - Custom client-side router with history tracking
   - History depth tracking via ref (`depth.current`)
   - No verification that `goBack()` correctly falls back for deep-linked routes
   - Recommend: Integration tests for navigation scenarios (forward, back, deep-link)

3. **Context Providers** (`src/context/*.tsx`)
   - Multiple context providers with side effects (localStorage, API fetches)
   - No tests verify state transitions or error handling in providers
   - Examples: `DashboardContext`, `LessonsContext`, `NotificationContext`
   - Recommend: Integration tests for context initialization and state updates

4. **API Integration** (`src/services/ApiService.ts`)
   - Complex FormData construction for file uploads (lines 114-136)
   - URL building with query parameters (lines 82-109)
   - Error response parsing for SimpleJWT messages
   - No tests verify request/response handling
   - Recommend: Mocked fetch tests for each HTTP method

5. **UI Components with Logic**
   - `Header.tsx` — Avatar fallback logic, dropdown interactions
   - `Profile.tsx` — Avatar upload, bio editing, privacy settings
   - `LessonsContent.tsx` — Conditional rendering based on attendance/assignment status
   - Recommend: Component tests with mocked contexts

6. **Helper Functions** (`src/features/profile/profileHelpers.ts`)
   - Date formatting (`formatRelative()`) with translation keys
   - Heatmap grid building with edge cases (empty data, different date ranges)
   - No tests verify correctness of these utility calculations
   - Recommend: Unit tests for edge cases and date math

## Recommended Testing Setup

If testing is added in the future:

**Framework Choice:**
- **Vitest** — Recommended for modern React projects (fast, built on Vite, compatible with Jest syntax)
- **Jest + React Testing Library** — If full ecosystem compatibility needed

**Installation:**
```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

**Configuration Structure:**
```
# vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});

# src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

**Test File Locations:**
- Co-locate tests next to components: `src/components/Header.tsx` → `src/components/Header.test.tsx`
- Utility tests in parallel: `src/utils/formatDateTime.ts` → `src/utils/formatDateTime.test.ts`
- Context tests in features: `src/context/DashboardContext.test.tsx`

**Run Script in package.json:**
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

---

*Testing analysis: 2026-03-27*
