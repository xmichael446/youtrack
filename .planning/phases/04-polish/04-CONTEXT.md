# Phase 4: Polish - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Final polish pass: responsive design at 375px+, redesigned dark mode palette, micro-interactions audit, and WCAG AA accessibility. No new features — refinement of everything built in Phases 1-3.

</domain>

<decisions>
## Implementation Decisions

### Responsive & Dark Mode
- Two-tier responsive: 375px minimum base + md: (768px) desktop — matches existing codebase pattern
- Redesign dark mode palette from scratch — create new dark colors that feel intentional, not just inverted light mode
- Brand-primary focus ring (focus-visible:ring-2 ring-brand-primary) on all interactive elements for keyboard accessibility

### Animations & Micro-interactions
- Button: scale + shadow feedback (already in Button component) — verify applied everywhere via Button component usage
- Card: lift + shadow increase on hover (already in Card hoverable) — apply hoverable prop to all interactive cards
- Loading: shimmer skeletons for content areas (extend existing Shimmer), spinner for action buttons (already in Button loading prop)
- Page transitions: view-entry animation already applied in Phase 3 — verify consistency

### Claude's Discretion
- Exact new dark mode color values (the palette redesign)
- Which specific cards need hoverable prop added
- Where to add shimmer skeletons (which pages benefit most)
- Specific WCAG AA contrast ratio fixes needed
- Whether to add any additional micro-interactions beyond what's specified

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Button component with loading spinner, scale hover/active states
- Card component with hoverable prop (lift + shadow)
- Shimmer component for skeleton loading
- LoadingScreen component (fixed in Phase 3 to stay in content area)
- View-entry animation on all page switches (added in Phase 3)
- Design system tokens: all semantic colors, typography, spacing, radii, shadows, transitions

### Established Patterns
- Two-tier responsive with md: breakpoint throughout
- Dark mode via dark: Tailwind prefix
- 3-layer dark surfaces: bg (slate-900), card (slate-800), elevated (slate-700)
- Interactive feedback: scale-[1.01] hover, scale-[0.99] active
- Transition timing: 200ms fast, 300ms normal

### Integration Points
- index.html Tailwind config — dark mode palette changes go here
- All page/component files may need responsive fixes
- Button/Card/Input components — focus state additions
- Every interactive element needs focus-visible check

</code_context>

<specifics>
## Specific Ideas

- Dark mode should feel like a premium, intentional dark experience — not just "white became dark gray"
- Consider deeper dark backgrounds with more contrast between surface layers
- Animations should be subtle and purposeful — not flashy or distracting
- 375px is the Telegram Mini App minimum width — must work perfectly there

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
