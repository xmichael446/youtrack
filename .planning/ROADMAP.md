# Roadmap: YouTrack UI Overhaul

## Overview

Starting from an inconsistently styled brownfield React app, this roadmap delivers a unified visual language in four phases. The design system is laid down first so every subsequent component and page draws from the same tokens. Components are standardized next so pages have consistent building blocks. All eight pages are then redesigned to feel like one coherent product. A final polish pass ensures the result is responsive, accessible, and visually intentional in both themes.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design System** - Establish the token foundation (spacing, color, typography, shadows) that all subsequent work draws from
- [ ] **Phase 2: Core Components** - Standardize every shared UI primitive (buttons, inputs, cards, modals, nav) using the design system
- [ ] **Phase 3: Page Redesigns** - Redesign all eight pages (Login, Dashboard, Leaderboard, Lessons, Rewards, Profile, Contests, Notifications) using the component library
- [ ] **Phase 4: Polish** - Ensure the full app is responsive, dark-mode-intentional, animated, and accessible

## Phase Details

### Phase 1: Design System
**Goal**: A single source of truth for visual tokens exists and is applied consistently across the codebase
**Depends on**: Nothing (first phase)
**Requirements**: DS-01, DS-02, DS-03, DS-04, DS-05
**Success Criteria** (what must be TRUE):
  1. Every spacing value used in the app comes from the defined 4/8/12/16/24/32/48px scale — no arbitrary pixel values
  2. Color references use semantic names (primary, surface, muted, error, etc.) for both light and dark themes — no raw hex values scattered in component files
  3. Typography is applied from a consistent scale (h1–h4, body, caption, label) with matching font sizes and weights across all pages
  4. Border radii, shadows, and transition durations are defined as reusable Tailwind config values rather than duplicated inline utilities
  5. A design system reference file exists at `.planning/design-system.md` that documents every token decision
**Plans:** 1/4 plans executed

Plans:
- [x] 01-01-PLAN.md — Define design tokens and implement in Tailwind config
- [ ] 01-02-PLAN.md — Migrate core layout and page components to semantic tokens
- [x] 01-03-PLAN.md — Migrate UI primitives, lessons, and profile features to semantic tokens
- [x] 01-04-PLAN.md — Migrate contest features and complete full codebase migration

### Phase 2: Core Components
**Goal**: Every shared UI primitive is a consistent, reusable component that enforces the design system
**Depends on**: Phase 1
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07
**Success Criteria** (what must be TRUE):
  1. All clickable actions across the app use one of four button variants (primary, secondary, ghost, danger) with identical sizing and hover/active states
  2. Every form input, select, and textarea has the same border treatment, focus ring, and error state styling
  3. Cards across all pages share the same padding, border, shadow, and hover behavior — no card looks different from any other
  4. Modals and dialogs use a consistent overlay, entrance animation, and internal layout
  5. The header, sidebar, and bottom nav share a unified active-state and styling treatment — the navigation feels like one system
**Plans**: TBD

### Phase 3: Page Redesigns
**Goal**: Every page in the app looks like it was designed by one person — cohesive, playful, and visually polished
**Depends on**: Phase 2
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07, PAGE-08
**Success Criteria** (what must be TRUE):
  1. The Login page sets a clear visual tone — a user landing on it for the first time understands the app is playful and education-focused
  2. The Dashboard presents enrollment cards and course progress with clear visual hierarchy — the most important information is immediately obvious
  3. The Leaderboard displays rankings with gamification visuals (rank badges, competitive styling) that feel engaging rather than tabular
  4. The Lessons, Rewards, Profile, Contest, and Notification pages each have a coherent redesign that matches the visual language established by Login and Dashboard
  5. A user navigating between any two pages sees consistent typography, spacing, color use, and component behavior — no page feels out of place
**Plans**: TBD

### Phase 4: Polish
**Goal**: The redesigned app is responsive, accessible, intentionally dark-themed, and animated — no rough edges remain
**Depends on**: Phase 3
**Requirements**: UX-01, UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. Every page is fully usable at 375px viewport width — no horizontal scrolling, no clipped content, no broken layouts
  2. Dark mode has distinct surface colors and proper contrast — toggling dark mode does not feel like inverting the light theme
  3. Buttons, cards, and page transitions have visible micro-interactions — hover states, loading spinners, and state changes are animated
  4. All text and interactive elements meet WCAG AA contrast ratios and keyboard focus states are visible on every focusable element
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design System | 1/4 | In Progress|  |
| 2. Core Components | 0/TBD | Not started | - |
| 3. Page Redesigns | 0/TBD | Not started | - |
| 4. Polish | 0/TBD | Not started | - |
