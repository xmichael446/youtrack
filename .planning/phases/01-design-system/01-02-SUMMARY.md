---
phase: 01-design-system
plan: 02
subsystem: ui
tags: [react, tailwind, design-tokens, typography, dark-mode, migration]

# Dependency graph
requires:
  - phase: 01-design-system plan 01
    provides: Tailwind design tokens defined in index.html (surface colors, text colors, typography scale, spacing aliases, shadows)
provides:
  - Core layout components (App.tsx, Header.tsx, Footer.tsx, LoadingScreen.tsx, Curriculum.tsx, CoinsHistory.tsx) using semantic design tokens
  - Page components (Login.tsx, Dashboard.tsx, Leaderboard.tsx, Rewards.tsx, Profile.tsx) using semantic design tokens
  - All isDark ternary color patterns migrated to semantic tokens
  - Typography scale tokens applied across all 11 files
affects: [phase-02, phase-03, phase-04, page-redesign, component-redesign]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Semantic surface tokens: bg-surface-primary/secondary/elevated for light, dark:bg-surface-dark-primary/secondary/elevated for dark mode"
    - "Semantic text tokens: text-text-theme-primary/secondary/muted for light, dark:text-text-theme-dark-primary/secondary/muted for dark mode"
    - "Typography scale: text-h1/h2/h3/h4 (28/22/18/16px), text-body (14px), text-caption (12px), text-label (12px semibold)"
    - "Shadow tokens: shadow-card dark:shadow-card-dark on card containers"
    - "isDark ternaries migrated from raw slate/gray values to semantic tokens"

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/components/Header.tsx
    - src/components/Footer.tsx
    - src/components/LoadingScreen.tsx
    - src/components/Curriculum.tsx
    - src/components/CoinsHistory.tsx
    - src/pages/Login.tsx
    - src/pages/Dashboard.tsx
    - src/pages/Leaderboard.tsx
    - src/pages/Rewards.tsx
    - src/pages/Profile.tsx

key-decisions:
  - "Kept intentional brand colors (Telegram #2AABEE, badge_color dynamic data) as-is during migration"
  - "Kept rank 2 silver gradient in Leaderboard using slate-300/400 (intentional metallic accent, not a theme color)"
  - "bg-brand-dark used for SidebarProgress dark card and guide video section (intentional deep navy, not surface)"
  - "Off-scale spacing fixed to nearest on-grid value using 4px grid judgment (e.g., p-5->p-4, py-2.5->py-2)"
  - "Pre-existing build failure (Node 16 + Vite 6 crypto incompatibility) noted as out-of-scope pre-existing issue"

patterns-established:
  - "Pattern 1: All dark mode surface backgrounds use dark:bg-surface-dark-primary/secondary/elevated — no raw slate-*"
  - "Pattern 2: All dark mode text uses dark:text-text-theme-dark-primary/secondary/muted — no raw slate-*"
  - "Pattern 3: isDark ternaries use semantic tokens not raw color values"
  - "Pattern 4: Typography uses composite tokens (text-h1..text-caption) — no separate font-bold with text-size classes"
  - "Pattern 5: All spacing on 4px grid (p-1,p-2,p-3,p-4,p-6,p-8,p-12) — no p-2.5/p-5/p-7 etc."

requirements-completed: [DS-01, DS-02, DS-03, DS-04]

# Metrics
duration: 27min
completed: 2026-03-27
---

# Phase 01 Plan 02: Core Component Token Migration Summary

**Semantic surface/text/typography design tokens applied across all 11 core layout and page components, replacing raw slate/gray Tailwind classes and isDark ternary patterns throughout the app shell**

## Performance

- **Duration:** 27 min
- **Started:** 2026-03-27T00:18:51Z
- **Completed:** 2026-03-27T00:45:02Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Zero `dark:bg-slate-*` or `dark:text-slate-*` classes remain across all 11 files
- All isDark ternary patterns in Login.tsx (12+ occurrences), Header.tsx, and Footer.tsx migrated to semantic tokens
- Typography scale applied: headings use text-h1..text-h4, body text uses text-body, captions use text-caption
- Off-scale spacing eliminated from all 11 files (p-2.5, p-5, py-2.5, gap-1.5, gap-3.5, etc.)
- All functional logic, animations, and transitions preserved — visual-only changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate core layout components** - `b0fb20e` (feat)
2. **Task 2: Migrate page components** - `51c968e` (feat)

**Plan metadata:** (created with this SUMMARY)

## Files Created/Modified

- `src/App.tsx` - Root layout: surface tokens, nav item colors, sidebar/nav backgrounds
- `src/components/Header.tsx` - Header: surface tokens, notification panel, profile menu, isDark toggle track
- `src/components/Footer.tsx` - Footer: isDark ternary migrated to semantic muted text tokens
- `src/components/LoadingScreen.tsx` - Loading: surface background and muted text tokens
- `src/components/Curriculum.tsx` - Curriculum table/cards: surface tokens, typography scale, spacing
- `src/components/CoinsHistory.tsx` - Coins table/cards: surface tokens, typography scale, spacing
- `src/pages/Login.tsx` - Login: 12+ isDark ternaries migrated, typography scale, spacing
- `src/pages/Dashboard.tsx` - Dashboard: surface tokens, typography scale (h1..body), spacing
- `src/pages/Leaderboard.tsx` - Leaderboard: surface tokens, tab switcher, table rows
- `src/pages/Rewards.tsx` - Rewards: surface tokens for cards/empty states, badge_color preserved
- `src/pages/Profile.tsx` - Profile: error state colors and typography migrated

## Decisions Made

- Kept Telegram brand color `#2AABEE` unchanged (third-party brand requirement)
- Kept dynamic `badge_color` in Rewards.tsx (data-driven color, not a theme token)
- Kept Leaderboard rank 2 silver gradient using literal slate-300/400 (intentional metallic podium color)
- Used `bg-brand-dark` for SidebarProgress and tutorial video banner (intentional deep navy, not a surface)
- Pre-existing Node 16 + Vite 6 `crypto.getRandomValues` build failure noted as out-of-scope issue

## Deviations from Plan

None - plan executed exactly as written. All token replacements followed the exact mapping tables from design-system.md.

## Issues Encountered

- `npm run build` fails on Node 16.17.1 due to `crypto.getRandomValues is not a function` in Vite 6. This is a pre-existing environment incompatibility (not caused by this plan). The dev server (`npm run dev`) works as intended. Build was verified as already failing before any changes via `git stash` test.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 11 core files now use semantic design tokens as specified in design-system.md
- Foundation is ready for phase 03 (component library) and page redesigns
- The token system is consistently applied — future redesigns can rely on surface/text/typography tokens being correct throughout

---
*Phase: 01-design-system*
*Completed: 2026-03-27*

## Self-Check: PASSED

- SUMMARY.md: FOUND
- All 11 source files: FOUND
- Task 1 commit b0fb20e: FOUND
- Task 2 commit 51c968e: FOUND
