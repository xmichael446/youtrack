---
phase: 02-core-components
plan: 01
subsystem: ui
tags: [react, tailwind, button, card, z-index, design-system, forwardref]

# Dependency graph
requires:
  - phase: 01-design-system
    provides: Design tokens (brand-primary, surface colors, shadow-card, rounded-card, duration-fast) used by Button and Card

provides:
  - Button component with 4 variants (primary/secondary/ghost/danger), 3 sizes, loading spinner, icon slot, forwardRef
  - Card component with 3 variants (default/bordered/elevated), 4 padding sizes, hoverable prop, dark mode glow ring, forwardRef
  - Z_INDEX constants with 5 ordered layers (dropdown=40, overlay=50, modal=60, toast=70, fullscreen=100)

affects: [03-page-redesigns, 04-navigation, all pages importing Button or Card]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "React.forwardRef used for all primitive UI components to support ref forwarding"
    - "Variant class maps as typed Record objects for exhaustive variant coverage"
    - "Filter + join pattern for composing Tailwind class strings without clsx/cx dependency"

key-files:
  created:
    - src/components/ui/Button.tsx
    - src/components/ui/Card.tsx
    - src/constants/zIndex.ts
  modified: []

key-decisions:
  - "Button uses inline Record<variant, string> maps for exhaustive variant class lookup"
  - "Card dark mode glow applied via dark:ring-1 dark:ring-white/5 on all 3 variants"
  - "Z_INDEX exported as const assertion for type narrowing at call sites"
  - "Loading state shows spinner replacing icon prop if provided, or standalone spinner when no icon given"

patterns-established:
  - "Primitive UI component pattern: forwardRef + HTMLElement extends + variant/size Record maps + BASE_CLASSES constant"
  - "Class composition: array of class strings filtered of empty values then joined with space"

requirements-completed: [COMP-01, COMP-03]

# Metrics
duration: 3min
completed: 2026-03-27
---

# Phase 2 Plan 1: Core UI Primitives Summary

**Button (4 variants, 3 sizes, loading/icon/forwardRef) + Card (3 variants, 4 padding sizes, hoverable, dark glow) + Z_INDEX constants (5 layers) using Phase 1 design tokens**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-27T01:34:50Z
- **Completed:** 2026-03-27T01:38:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Button component with brand gradient primary CTA, hover/active scale transforms, loading spinner, icon slot, and forwardRef — matches Login.tsx CTA pattern and ContestActionButton interaction patterns
- Card component with 3 variants enforcing design system tokens (shadow-card, rounded-card, surface-secondary) and dark mode glow ring on all variants
- Z_INDEX constant file establishing a consistent 5-layer stacking order for future modal/dropdown/toast implementations

## Task Commits

Each task was committed atomically:

1. **Task 1: Create z-index scale constants and Button component** - `96de186` (feat)
2. **Task 2: Create Card component** - `34a69b7` (feat)

**Plan metadata:** (to be added below)

## Files Created/Modified
- `src/components/ui/Button.tsx` - Reusable button with 4 variants, 3 sizes, loading, icon slot, fullWidth, forwardRef
- `src/components/ui/Card.tsx` - Reusable card with 3 variants, 4 padding sizes, hoverable, dark glow ring, forwardRef
- `src/constants/zIndex.ts` - Z_INDEX const with dropdown(40)/overlay(50)/modal(60)/toast(70)/fullscreen(100)

## Decisions Made
- Used variant class maps as typed `Record<Variant, string>` objects for exhaustive TypeScript coverage without switch/if chains
- Card dark mode glow (`dark:ring-1 dark:ring-white/5`) applied at the variant level rather than as a separate prop, since the CONTEXT.md specifies all cards should have it
- Loading state logic: when `icon` prop is provided, spinner replaces icon at the same position; when no icon, spinner appears at left regardless of `iconPosition` — avoids layout shift during loading
- Filter + join pattern for class composition avoids adding clsx/classnames as a new dependency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The project has pre-existing TypeScript errors (TS1259 React default import module compatibility, TS2339 JSX intrinsic elements, TS2792 lucide-react module resolution) that affect all 54 files due to Node 16 + TypeScript/React 19 version mismatch. These are documented in STATE.md as out-of-scope and were present before this plan. The new Button.tsx and Card.tsx exhibit the same 3-4 pre-existing errors as all other React files in the codebase — no new errors introduced.

## Known Stubs

None - all component variants are fully implemented with real Tailwind classes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Button and Card primitives ready for adoption in Phase 3 page redesigns
- Z_INDEX constants ready for use in modal/dropdown/toast z-index values
- Both components use forwardRef and accept className override for composition in any context

## Self-Check: PASSED

- FOUND: src/components/ui/Button.tsx
- FOUND: src/components/ui/Card.tsx
- FOUND: src/constants/zIndex.ts
- FOUND: commit 96de186 (feat(02-01): create z-index scale constants and Button component)
- FOUND: commit 34a69b7 (feat(02-01): create Card component with 3 variants and dark mode glow)

---
*Phase: 02-core-components*
*Completed: 2026-03-27*
