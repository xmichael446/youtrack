# Coding Conventions

**Analysis Date:** 2026-03-27

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Dashboard.tsx`, `BackButton.tsx`)
- Utility/helper files: camelCase (e.g., `formatDateTime.ts`, `profileHelpers.ts`)
- Type definition files: camelCase (e.g., `apiTypes.ts`, `language.ts`)
- Context files: PascalCase with "Context" suffix (e.g., `DashboardContext.tsx`, `LanguageContext.tsx`)
- Pages in `src/pages/`: PascalCase (e.g., `Profile.tsx`, `Lessons.tsx`)
- Features in `src/features/`: kebab-case directories with PascalCase component files

**Functions:**
- camelCase for utility/helper functions: `formatDateTime()`, `getInitials()`, `buildHeatmapGrid()`
- camelCase for hook functions: `useCountdown()`, `useRouter()`, `useBodyScrollLock()`
- camelCase for event handlers: `handleLogin()`, `toggleTheme()`, `navigateTo()`
- Custom hooks always start with `use`: `useLanguage()`, `useDashboard()`, `useLessons()`

**Variables:**
- camelCase for local variables and state: `currentView`, `isDark`, `timeLeft`, `submittingAssignment`
- camelCase for object properties: `enrollment`, `loading`, `error`, `lastUpdated`
- SCREAMING_SNAKE_CASE for constants/enums: `RARITY_COLORS`, `CURRENT_USER`, `LEADERBOARD_DATA`
- Underscore prefix for private/internal methods: `_doRefresh()`, `_buildURL()` (not consistently used; follow pattern when encountered)

**Types:**
- PascalCase for interface names: `HeaderProps`, `DashboardContextType`, `ApiResponse<T>`
- PascalCase for type aliases: `ViewState`, `Language`, `ContestStatus`
- PascalCase for enum names: `AttachmentType`
- Suffix Context interfaces with "ContextType": `LanguageContextType`, `DashboardContextType`, `ContestContextType`
- Suffix component props with "Props": `HeaderProps`, `FooterProps`, `LoadingScreenProps`

## Code Style

**Formatting:**
- No explicit linter/formatter configured in project (`.eslintrc`, `.prettierrc` not present)
- 2-space indentation observed in vite.config.ts
- Line length varies, no strict enforced limit
- Import statements use single quotes: `import { useState } from 'react'`

**Linting:**
- No ESLint configuration detected
- No Prettier configuration detected
- TypeScript strict mode enabled in `tsconfig.json`
- `skipLibCheck: true`, `isolatedModules: true` in compiler options

## Import Organization

**Order:**
1. React and external packages: `import React`, `import { useState }`, `import { useLanguage }`
2. Internal context/hooks imports: `import { useDashboard } from '../context/DashboardContext'`
3. Local component imports: `import Header from './Header'`
4. Utilities and types: `import { apiService } from '../services/ApiService'`, `import type { RouteParams }`
5. CSS/styling imports (minimal in this codebase - uses Tailwind)

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json`)
- Used sparingly in codebase; most imports use relative paths
- Modules exported from feature directories via barrel files: `src/features/profile/index.ts`

## Error Handling

**Patterns:**
- Try-catch blocks used for async operations (`fetch`, API calls, `JSON.parse`)
- `catch` blocks typically catch errors but may silently fall back to defaults (e.g., Header.tsx line 48-56 catches profile fetch errors and falls back to dashboard user avatar)
- Errors propagated as thrown objects with shape `ApiError` from ApiService
- No centralized error logger; errors handled inline at call sites

**ApiService Error Pattern:**
```typescript
try {
    // operation
} catch (error: any) {
    const apiError: ApiError = {
        message: error.message || 'Failed to fetch data',
        status: error.status,
        statusText: error.statusText,
        data: error.data,
    };
    throw apiError;
}
```

**Error Types:**
- `ApiError` interface with `message`, `status`, `statusText`, and optional `data` fields
- Network errors normalized to `status: 0, statusText: 'Network Error'`
- Response validation before throwing (checks `response.ok` after fetch)

## Logging

**Framework:** Console logging only (no external logging library)

**Patterns:**
- `console.log()` used minimally (observed in App.tsx line 113 for login flow)
- No structured logging approach; logging used for debugging only
- No log levels (info, warn, error) enforced
- Consider logs for: critical user actions (login), API failures, state changes during development

## Comments

**When to Comment:**
- Complex business logic: token refresh race condition prevention (ApiService.ts lines 35-37, 170-204)
- Algorithm explanations: heatmap grid building (profileHelpers.ts lines 42-66)
- Non-obvious workarounds: Vite URL normalization (ApiService.ts lines 42-45)
- Temporary debugging markers rarely used

**JSDoc/TSDoc:**
- JSDoc comments used for public methods in ApiService: `/** GET request */`, `/** POST request */`
- Method-level documentation: parameter and return types inferred from TypeScript signatures
- Minimal inline documentation; code structure is often self-documenting

## Function Design

**Size:**
- Functions kept concise (10-40 lines typical for components and utilities)
- Hooks generally 5-30 lines
- Larger functions decomposed into smaller utility functions

**Parameters:**
- React components receive props as single object with explicit interface: `const Header: React.FC<HeaderProps>`
- Utility functions accept typed parameters: `formatDateTime(iso: string): string`
- Optional parameters use TypeScript `?` operator: `buildPath(view: ViewState, params?: RouteParams)`
- Callback parameters typed explicitly: `const goBack = useCallback((fallbackView: ViewState = 'dashboard') => ...)`

**Return Values:**
- React components return `React.ReactNode` (implicitly via JSX)
- Hooks return single value or tuple: `useCountdown()` returns `string`, `useRouter()` returns object with multiple properties
- Async functions return Promise: `fetchAndStore<T>(): Promise<T>`
- Generic return types used for API calls: `ApiResponse<T>` wraps response data

## Module Design

**Exports:**
- Named exports preferred for utilities and helper functions
- Default exports used for React components (pages and major components)
- Type exports use `export type` for type-only imports
- Context providers exported as named exports: `export const DashboardProvider`
- Singleton instances exported as named exports: `export const apiService = new ApiService()`

**Barrel Files:**
- Used selectively in feature directories: `src/features/profile/index.ts` exports main profile feature
- Central index files aggregate related utilities (e.g., `context/index.ts` would export all context hooks)
- Not overused; many directories import directly from individual files

## Tailwind CSS Conventions

**Styling:**
- Brand color token `brand-primary` (#12c2dc) used throughout
- Dark mode via `dark:` prefix strategy
- Responsive design with `md:` breakpoint prefix
- Utility classes for spacing, sizing, positioning (no custom CSS files observed)
- No CSS-in-JS; 100% Tailwind-based styling

**Classes:**
- State classes for interactivity: `group-hover:`, `active:scale-95`
- Animation classes: `animate-in`, `fade-in`, `duration-500`, `transition-all`, `animate-pulse`
- Text color classes follow pattern: `text-brand-primary`, `text-gray-500`, `dark:text-slate-400`

## Types and Interfaces

**Pattern:**
- Props interfaces defined at top of component file before component definition
- API response types centralized in `src/services/apiTypes.ts` (contains 100+ type definitions)
- Domain models in `src/types.ts` and feature-specific type files
- Generic types for API wrappers: `ApiResponse<T>`, `ApiState<T>`
- Context types suffixed with "Type" or "ContextType"

**Example:**
```typescript
interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, onLogout }) => {
  // implementation
};
```

---

*Convention analysis: 2026-03-27*
