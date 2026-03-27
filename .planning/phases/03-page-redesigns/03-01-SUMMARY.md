---
phase: 03-page-redesigns
plan: 01
subsystem: pages/login-dashboard
tags: [redesign, phase2-components, login, dashboard, animation]
dependency_graph:
  requires: [02-core-components]
  provides: [login-redesigned, dashboard-redesigned, view-entry-animation]
  affects: [src/pages/Login.tsx, src/pages/Dashboard.tsx, src/App.tsx]
tech_stack:
  added: []
  patterns: [phase2-component-migration, card-layout, button-cta, badge-status]
key_files:
  created: []
  modified:
    - src/pages/Login.tsx
    - src/pages/Dashboard.tsx
    - src/App.tsx
decisions:
  - "Login page uses Card variant=elevated with padding=none to preserve internal layout flexibility while getting elevated shadow treatment"
  - "Dashboard course info strip and tutorial banner use section wrapper + Card inside since Card lacks an as prop"
  - "Badge used for event status (live=success, contest=warning, upcoming=brand) replacing raw span elements"
  - "Telegram button in polling state uses Button variant=primary with className override for Telegram blue — intentional brand color exception per CONTEXT.md"
metrics:
  duration: 212s
  completed_date: "2026-03-27T02:17:17Z"
  tasks_completed: 3
  files_modified: 3
---

# Phase 3 Plan 1: Login & Dashboard Redesign Summary

**One-liner:** Login and Dashboard pages migrated to Phase 2 Button/Input/Card/Badge components with consistent view-entry animation on all page switches.

## What Was Built

### Task 1: Login Page Redesign

Migrated `src/pages/Login.tsx` to use Phase 2 UI components:

- **`<Card variant="elevated" padding="none">`** wraps the main auth card (replaces raw backdrop-blur div)
- **`<Input icon={<User />} label={t('studentAccess')} size="lg" error={...}>`** replaces the raw `<input>` element with icon, label, and error state wired up
- **`<Button variant="primary" size="lg" fullWidth loading={isLoading} icon={<LogIn />} iconPosition="right">`** replaces the raw submit button
- **`<Button variant="primary" size="lg" fullWidth>`** replaces the raw Telegram button in polling state (className override for Telegram blue #2AABEE)
- Typography updated: `h4` → `h1` for the "Your Space" heading, `text-caption` for support link

All auth logic preserved: `studentCode` state with YT-E prefix, `authStep` state machine, `startPolling`, `handleSubmit`, `openTelegramLink`.

### Task 2: Dashboard Page Redesign

Migrated `src/pages/Dashboard.tsx` to use Phase 2 UI components:

- **Hero section** wrapped in `<Card variant="default" padding="none">` with custom internal padding
- **Event card** wrapped in `<Card variant="default" padding="md">` with `<Badge>` for status indicators
  - Live event: `Badge variant="success"`
  - Contest: `Badge variant="warning"`
  - Upcoming: `Badge variant="brand"`
- **Attendance button** replaced with `<Button variant="primary" size="md" fullWidth>` (emerald override for live state)
- **Course info strip** wrapped in `section > Card variant="bordered" padding="none"`
- **Tutorial banner** wrapped in `section > Card variant="default"` with brand-dark background override
- **Watch Tutorial button** replaced with `<Button variant="primary" size="md">`

All data logic preserved: countdown timer, `useDashboard`/`useLanguage`/`useNavigation` hooks, `RankBadge` component, `openExternalLink`.

### Task 3: View-Entry Animation

Added `animate-view-entry` class to the page wrapper div in `src/App.tsx`:

```tsx
<div key={currentView} className="w-full animate-view-entry">
```

The `key={currentView}` causes React to remount this div on every view switch, re-triggering the CSS animation defined in `index.html`. All 6 pages (Dashboard, Leaderboard, Lessons, Rewards, Contests, Profile) now get a consistent fade-in + translateY entry animation.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `9daa8dd` | feat(03-01): redesign Login page with Phase 2 components |
| 2 | `cdd718e` | feat(03-01): redesign Dashboard page with Phase 2 Card, Button, Badge |
| 3 | `9ce7ce0` | feat(03-01): apply animate-view-entry animation to all page switches |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

**Notes:**
- The plan suggested wrapping course info strip directly in `<Card>` with `as="section"` prop, but `Card` does not have an `as` prop. Used `section > Card` nesting instead — semantically equivalent. (Rule 3 auto-fix)
- The error display in Login: the Input component already shows error text below the field via its `error` prop, and the existing `AlertCircle` banner was kept for visual emphasis. Both show on API error.

## Known Stubs

None — all data flows from existing contexts (DashboardContext, LanguageContext, NavigationContext) and renders real data.

## Self-Check: PASSED

- FOUND: src/pages/Login.tsx
- FOUND: src/pages/Dashboard.tsx
- FOUND: src/App.tsx
- FOUND: .planning/phases/03-page-redesigns/03-01-SUMMARY.md
- FOUND commit: 0e7cc77 (Login redesign)
- FOUND commit: cdd718e (Dashboard redesign)
- FOUND commit: 9ce7ce0 (view-entry animation)
