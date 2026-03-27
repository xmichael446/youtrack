---
phase: 02-core-components
verified: 2026-03-27T00:00:00Z
status: gaps_found
score: 11/12 must-haves verified
gaps:
  - truth: "Toast component uses the shared z-index scale and has consistent positioning"
    status: partial
    reason: "Toast.tsx uses hardcoded z-[70] class instead of importing Z_INDEX from constants/zIndex.ts. The zIndex.ts file exists (created in Plan 01) and exports Z_INDEX.toast = 70, but Toast never updated its TODO comment to an actual import. Functional value is identical (z-[70] === 70) but the wiring to the shared constant is broken."
    artifacts:
      - path: "src/components/ui/Toast.tsx"
        issue: "Has TODO comment referencing Z_INDEX.toast but uses hardcoded z-[70]. The constants/zIndex.ts file it references exists but is not imported."
    missing:
      - "Replace `z-[70]` class with `style={{ zIndex: Z_INDEX.toast }}` and add `import { Z_INDEX } from '../../constants/zIndex'` to Toast.tsx"
---

# Phase 2: Core Components Verification Report

**Phase Goal:** Every shared UI primitive is a consistent, reusable component that enforces the design system
**Verified:** 2026-03-27
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | All clickable actions use one of four button variants (primary, secondary, ghost, danger) with identical sizing and hover/active states | VERIFIED | `Button.tsx` — 4 variant class maps with `hover:scale-[1.01] active:scale-[0.99]`, 3 sizes, brand gradient on primary |
| 2 | Every form input, select, and textarea has the same border treatment, focus ring, and error state styling | VERIFIED | `Input.tsx` — `rounded-input`, `focus:ring-4 focus:ring-brand-primary/10`, `focus:border-brand-primary`, `border-status-error` on error, supports both input/textarea |
| 3 | Cards across all pages share the same padding, border, shadow, and hover behavior | VERIFIED | `Card.tsx` — `shadow-card`, `rounded-card`, 3 variants, 4 padding sizes, `hoverable` prop with scale transforms |
| 4 | Modals and dialogs use a consistent overlay, entrance animation, and internal layout | VERIFIED | `Modal.tsx` — `createPortal`, `backdrop-blur-sm bg-black/50`, `slide-in-from-bottom-4` mobile, `zoom-in-95` desktop, ESC handler, body scroll lock |
| 5 | The header, sidebar, and bottom nav share a unified active-state and styling treatment | VERIFIED | `App.tsx` NavItem — `font-semibold` active label, brand-primary bottom indicator bar on mobile, left indicator bar on desktop; `Header.tsx` — Z_INDEX constants for z-index layering |
| 6 | Toast component uses the shared z-index scale and has consistent positioning | PARTIAL | `Toast.tsx` — z-index value is correct (z-[70] === Z_INDEX.toast = 70) but imports the literal class instead of using the shared constant. zIndex.ts exists but is not imported. |
| 7 | All UI primitives are importable from a single barrel file | VERIFIED | `src/components/ui/index.ts` — exports 13 components: Button, Card, Input, Badge, EmptyState, Modal, Toast, Shimmer, BackButton, StatusBadge, RankBadge, PlaceIcon, LeaderboardAvatar |
| 8 | Badge component consolidates StatusBadge/RankBadge patterns into shared color variants | VERIFIED | `Badge.tsx` — 5 variants (brand/success/warning/error/muted), dot indicator with pulse, 2 sizes, `rounded-pill`, `text-label` |
| 9 | Empty list states use a consistent icon + message + optional action layout | VERIFIED | `EmptyState.tsx` — centered flex column, icon container with `rounded-card`, optional title, message, action slot |
| 10 | Header dropdowns use z-index from shared scale | VERIFIED | `Header.tsx` — imports Z_INDEX, header at `Z_INDEX.dropdown (40)`, notification and profile panels at `Z_INDEX.overlay (50)` |
| 11 | A shared z-index scale constant file exists with dropdown/overlay/modal/toast layers | VERIFIED | `src/constants/zIndex.ts` — `{ dropdown: 40, overlay: 50, modal: 60, toast: 70, fullscreen: 100 } as const` |
| 12 | Navigation active state uses brand-primary indicator with semibold text | VERIFIED | `App.tsx` NavItem — active span has `font-semibold`, mobile bottom indicator `w-5 h-[3px] bg-brand-primary rounded-full`, desktop left indicator `w-1 h-6 bg-brand-primary rounded-r-full` |

**Score:** 11/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/ui/Button.tsx` | Button with 4 variants, 3 sizes, loading, icon slot, forwardRef | VERIFIED | All variants present, brand gradient primary, `Loader2` spinner, `React.forwardRef` |
| `src/components/ui/Card.tsx` | Card with 3 variants, 4 padding sizes, hoverable, dark glow | VERIFIED | All variants with `dark:ring-1 dark:ring-white/5`, `shadow-card`, `rounded-card`, `React.forwardRef` |
| `src/constants/zIndex.ts` | Z-index scale (dropdown/overlay/modal/toast/fullscreen) | VERIFIED | 5 ordered layers: 40/50/60/70/100 |
| `src/components/ui/Input.tsx` | Input with icon slot, label, error, helper text, textarea support | VERIFIED | `rounded-input`, `focus:ring-brand-primary/10`, `border-status-error`, `group-focus-within/input:text-brand-primary`, `React.forwardRef` |
| `src/components/ui/Badge.tsx` | Badge with 5 color variants, dot/pulse, 2 sizes | VERIFIED | 5 variants, `rounded-pill`, `animate-pulse`, dot color map |
| `src/components/ui/EmptyState.tsx` | EmptyState with icon, title, message, action | VERIFIED | Centered layout, icon in `rounded-card` container, optional slots |
| `src/components/ui/Modal.tsx` | Modal with bottom-sheet mobile, centered desktop, portal | VERIFIED | `createPortal`, `backdrop-blur-sm`, `rounded-t-[24px]` mobile, `md:rounded-[24px]` desktop, ESC handler, scroll lock, `shadow-modal` |
| `src/components/ui/Toast.tsx` | Toast with 4 variants, z-index scale, portal | PARTIAL | 4 variants (success/error/warning/info) present; uses `z-[70]` not `Z_INDEX.toast` import |
| `src/components/ui/index.ts` | Barrel export for all 13 UI primitives | VERIFIED | All 13 exports present and pointing to correct relative paths |
| `src/App.tsx` (NavItem) | Unified active state with brand-primary indicator + semibold | VERIFIED | Bottom indicator bar on mobile, left indicator on desktop, `font-semibold` when active |
| `src/components/Header.tsx` | Z_INDEX constants for header and dropdown z-index | VERIFIED | `import { Z_INDEX }`, header at `Z_INDEX.dropdown`, panels at `Z_INDEX.overlay`, no hardcoded `z-30`/`z-50` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `Button.tsx` | design-system tokens | Tailwind classes | WIRED | `from-brand-primary to-brand-accent`, `rounded-button`, `duration-fast`, `shadow-brand-primary/20` |
| `Card.tsx` | design-system tokens | Tailwind classes | WIRED | `shadow-card`, `rounded-card`, `surface-secondary`, `dark:ring-white/5` |
| `Input.tsx` | design-system tokens | Tailwind classes | WIRED | `rounded-input`, `border-brand-primary`, `focus:ring-4`, `border-status-error`, `text-label` |
| `Badge.tsx` | design-system tokens | Tailwind classes | WIRED | `rounded-pill`, `text-label`, brand/status color tokens |
| `Modal.tsx` | react-dom createPortal | import | WIRED | `import { createPortal } from 'react-dom'` confirmed at line 2 |
| `Toast.tsx` | src/constants/zIndex.ts | import Z_INDEX | NOT WIRED | File uses `z-[70]` hardcoded. Has TODO comment but no actual import. `zIndex.ts` exists. |
| `src/components/ui/index.ts` | all `src/components/ui/*.tsx` | re-export | WIRED | All 13 components exported via `export { default as X } from './X'` |
| `App.tsx` | design-system tokens (NavItem active state) | Tailwind classes | WIRED | `brand-primary` bottom indicator, `font-semibold` active label |
| `Header.tsx` | src/constants/zIndex.ts | import Z_INDEX | WIRED | `import { Z_INDEX }` at line 8, used 3 times (header, notification panel, profile panel) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| COMP-01 | 02-01-PLAN.md | Standardize button variants (primary, secondary, ghost, danger) with consistent sizing, padding, and hover/active states | SATISFIED | `Button.tsx` — 4 variants with scale transforms, 3 sizes, brand gradient primary CTA |
| COMP-02 | 02-02-PLAN.md | Standardize form inputs with consistent borders, focus rings, and error states | SATISFIED | `Input.tsx` — unified border/focus-ring/error treatment for both input and textarea |
| COMP-03 | 02-01-PLAN.md | Standardize card patterns with consistent padding, borders, shadows, and hover effects | SATISFIED | `Card.tsx` — `shadow-card`, `rounded-card`, hoverable scale transforms |
| COMP-04 | 02-02-PLAN.md | Standardize list items and badge components with consistent spacing and visual weight | SATISFIED | `Badge.tsx` — 5 semantic variants replacing scattered StatusBadge/RankBadge patterns |
| COMP-05 | 02-03-PLAN.md | Standardize modal/dialog components with consistent overlay, animation, and layout | SATISFIED | `Modal.tsx` — unified overlay shell with backdrop-blur, bottom-sheet/centered layout, ESC handler |
| COMP-06 | 02-03-PLAN.md | Standardize toast/notification display with consistent positioning and animation | SATISFIED | `Toast.tsx` — 4 variants, consistent positioning, `rounded-card shadow-modal`; z-index value correct but not via import |
| COMP-07 | 02-04-PLAN.md | Standardize navigation components (header, sidebar, bottom nav) with consistent styling and active states | SATISFIED | NavItem unified active state (brand-primary indicator + semibold), Header z-index via Z_INDEX constants |

All 7 requirements (COMP-01 through COMP-07) are satisfied. No orphaned requirements found.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/ui/Toast.tsx` | 5-6, 37 | TODO comment for Z_INDEX import never resolved; uses hardcoded `z-[70]` when `zIndex.ts` is available | Info | Functional behavior is correct (z-[70] === Z_INDEX.toast = 70). Consistency gap: all other overlays (Modal, Header) use Z_INDEX; Toast does not. |

No blocker anti-patterns found. No stub implementations, placeholder returns, or empty handlers detected in any of the 9 UI component files.

### Human Verification Required

None. All phase goal items can be verified programmatically through code inspection.

### Gaps Summary

One gap found: the Toast component does not import `Z_INDEX` from `src/constants/zIndex.ts`, despite the constants file existing. The plan's condition was to use `z-[70]` only if `zIndex.ts` did not exist yet — but Plans 01 and 03 executed in parallel and Plan 03 wrote the Toast before the constants file was available, leaving a TODO comment. The TODO was never resolved.

The functional impact is zero — `z-[70]` produces the same stacking order as `Z_INDEX.toast = 70`. This is purely a consistency/maintainability gap: if the toast layer value changes in the future, Toast.tsx will not pick up the update automatically.

All 7 COMP requirements are fully satisfied. All 13 UI primitives exist, are substantive, and the barrel export wires them into a single import path. Navigation active states are unified. The phase goal "every shared UI primitive is a consistent, reusable component that enforces the design system" is substantially achieved.

---

_Verified: 2026-03-27_
_Verifier: Claude (gsd-verifier)_
