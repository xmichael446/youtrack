# Phase 2: Core Components - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a library of reusable UI primitive components (Button, Card, Input, Modal, Badge, EmptyState) that enforce the design system tokens from Phase 1. Migrate all existing inline patterns to use these components. Standardize navigation active states and z-index layering.

</domain>

<decisions>
## Implementation Decisions

### Button System
- 4 button variants: primary (brand gradient), secondary (outlined/subtle), ghost (transparent), danger (red)
- 3 sizes: sm (inline actions), md (default), lg (CTAs/full-width)
- Hover: scale-[1.01] + shadow increase. Active: scale-[0.99]. Disabled: opacity-60 + cursor-not-allowed
- Build as reusable `<Button>` component in src/components/ui/Button.tsx — enforces consistency, reduces class duplication
- Props: variant, size, disabled, loading, icon (left/right), fullWidth, children

### Card, Modal & Form Patterns
- Reusable `<Card>` component with variant prop (default, bordered, elevated) — wraps padding, shadow, radius, dark mode
- Props: variant, padding (sm/md/lg), hoverable, className, children
- Modal: bottom sheet on mobile (rounded-t-[24px], slides up), centered dialog on desktop (rounded-[24px]) — keep existing pattern but extract to reusable `<Modal>` component
- Reusable `<Input>` component with icon slot, error state, label, and helper text — consolidates 3+ input patterns (Login code input, assignment textarea, profile edit inputs)
- Shared z-index scale defined as constants: dropdown (40), overlay (50), modal (60), toast (70) — fixes current inconsistency

### Navigation & Shared Components
- Reusable `<Badge>` component with color variants (brand, success, warning, error, muted) — consolidates StatusBadge/RankBadge styling into shared primitives
- Navigation active state: brand-primary underline/fill for active tab + semibold text — unified treatment across header nav and footer/bottom nav
- Shared `<EmptyState>` component with icon + message + optional action button — consistent empty list treatment across all views
- Extend existing Shimmer component into page-specific skeleton layouts — shimmer skeletons matching actual content shape for each major page

### Claude's Discretion
- Exact component API signatures and prop types
- Internal implementation details of each component
- How to handle the transition from inline patterns to components (incremental vs big-bang per component)
- Whether to create a barrel file (src/components/ui/index.ts) or import individually
- Animation details for modal entrance/exit

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/StatusBadge.tsx` — existing badge with status variants (present/absent/late/excused)
- `src/components/ui/RankBadge.tsx` — rank display with color tiers
- `src/components/ui/BackButton.tsx` — navigation back button
- `src/components/ui/Shimmer.tsx` — basic shimmer loading component
- `src/components/ui/Toast.tsx` — notification toast
- `src/components/ui/PlaceIcon.tsx` — leaderboard place icon
- `src/components/ui/LeaderboardAvatar.tsx` — avatar with rank indicator

### Established Patterns
- Design tokens fully applied from Phase 1: surface colors, typography scale, semantic radii, transition durations
- Tailwind CDN config in index.html with all token definitions
- Dark mode via `dark:` prefix on all components
- Mobile-first responsive with `md:` breakpoint
- Interactive feedback: scale transforms on hover/active, shadow shifts
- Modals use createPortal, bottom-sheet on mobile, centered on desktop

### Integration Points
- Components will be imported by all pages (Dashboard, Login, Leaderboard, Lessons, Rewards, Profile, Contests)
- Header.tsx dropdown menus need z-index alignment with new modal scale
- SubmissionModal.tsx is the most complex existing modal — primary extraction target
- Login.tsx has the most input patterns — primary Input component reference
- ContestActionButton.tsx has existing button variant logic — can inform Button component API

</code_context>

<specifics>
## Specific Ideas

- Khan Academy-inspired playful feel — buttons should have slight bounce/scale on interaction, not flat corporate
- Brand gradient (from-brand-primary to-brand-accent) for primary CTA buttons
- Cards should feel "lifted" in dark mode with subtle border glow, not just darker rectangles
- Modal backdrop should have subtle blur (backdrop-blur-sm) for depth

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
