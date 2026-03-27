---
phase: 02-core-components
plan: 04
subsystem: navigation-and-ui-primitives
tags: [barrel-export, navigation, z-index, active-state]
dependency_graph:
  requires: [02-01, 02-02, 02-03]
  provides: [ui-barrel-index, unified-nav-active-state, header-z-index-alignment]
  affects: [all-pages, Header, App]
tech_stack:
  added: []
  patterns: [barrel-export, z-index-constants, inline-style-z-index]
key_files:
  created:
    - src/components/ui/index.ts
  modified:
    - src/App.tsx
    - src/components/Header.tsx
decisions:
  - Notification and profile dropdowns use inline style for z-index rather than Tailwind classes to ensure the value comes from the shared Z_INDEX scale constant
  - NavItem bottom indicator bar is mobile-only (md:hidden) since desktop uses the existing left indicator bar
key_decisions:
  - Barrel file exports all 13 UI primitives from a single entry point (src/components/ui/index.ts)
  - NavItem active label uses font-semibold; inactive uses font-normal for clear typographic contrast
  - Header element drops from z-30 to Z_INDEX.dropdown (40) — higher than sidebar (z-40) at same level, consistent with overlay stack
metrics:
  duration: 3m
  completed_date: "2026-03-27"
  tasks: 2
  files: 3
---

# Phase 02 Plan 04: Navigation Standardization and UI Barrel Export Summary

**One-liner:** Barrel export for all 13 UI primitives plus unified NavItem active state with brand-primary bottom indicator and Z_INDEX-aligned Header dropdowns.

## What Was Built

### Task 1: UI Barrel Export + NavItem Active State
- Created `src/components/ui/index.ts` exporting all 13 components: Button, Card, Input, Badge, EmptyState, Modal, Toast, Shimmer, BackButton, StatusBadge, RankBadge, PlaceIcon, LeaderboardAvatar
- Updated NavItem `<span>` label to use `font-semibold` when active and `font-normal` when inactive
- Added mobile-only bottom indicator bar: `absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-brand-primary rounded-full shadow-[0_0_6px_rgba(18,194,220,0.5)] md:hidden`
- Desktop sidebar already had the left indicator bar (`w-1 h-6 bg-brand-primary rounded-r-full`) — no change needed there

### Task 2: Header Z-Index Alignment
- Added `import { Z_INDEX } from '../constants/zIndex'` to Header.tsx
- Header `<header>` element: removed `z-30` Tailwind class, added `style={{ zIndex: Z_INDEX.dropdown }}` (40)
- Notification panel: removed `z-50` Tailwind class, added `style={{ zIndex: Z_INDEX.overlay }}` (50)
- Profile dropdown panel: removed `z-50` Tailwind class, added `style={{ zIndex: Z_INDEX.overlay }}` (50)
- All other Header behavior (ESC handler, click-outside, focus management) unchanged

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Barrel file + NavItem active state | a522587 | src/components/ui/index.ts, src/App.tsx |
| 2 | Header z-index alignment | f14b19c | src/components/Header.tsx |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — no UI stubs or placeholder data in the files created/modified by this plan.

## Z-Index Layer Reference (post-plan)

| Layer | Value | Source | Used by |
|-------|-------|--------|---------|
| Sidebar | `z-40` (Tailwind) | App.tsx | Desktop sidebar |
| Dropdown | `Z_INDEX.dropdown` = 40 | constants/zIndex.ts | Header element |
| Overlay | `Z_INDEX.overlay` = 50 | constants/zIndex.ts | Notification/Profile dropdowns |
| Bottom Nav | `z-50` (Tailwind) | App.tsx | Mobile bottom nav |
| Modal | `Z_INDEX.modal` = 60 | constants/zIndex.ts | Modal component |
| Toast | `Z_INDEX.toast` = 70 | constants/zIndex.ts | Toast component |
