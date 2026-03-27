# Phase 1: Design System - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the complete design token system — colors, typography, spacing, radii, shadows, and transitions — as Tailwind config values. Apply consistently across the codebase. Document all decisions in a reference file.

</domain>

<decisions>
## Implementation Decisions

### Color Palette & Dark Mode
- 5 semantic color tiers: primary, secondary, error, muted, surface — minimal and sufficient
- Extract brand colors from the logo (primary cyan ~#12C2DC anchor, derive secondary/accent to match)
- 3-layer dark mode surfaces: bg (slate-900), card (slate-800), elevated (slate-700)
- Muted pastels for status colors: soft green for success, soft yellow for warning, soft rose for error — gentler, playful feel

### Typography Scale
- Compact modular heading scale: h1 28px/700, h2 22px/600, h3 18px/600, h4 16px/600
- Body text at 14px — mobile-friendly density for education content
- 3 font weights: 400 regular, 600 semibold, 700 bold (Sora already loaded with these)
- Captions and labels both at 12px — uniform small text sizing

### Spacing, Radii & Component Tokens
- 4px grid spacing scale: 4/8/12/16/24/32/48px (xs through 3xl)
- 16px (2xl) default border radius for cards — bubbly, playful feel. Full radius scale: 4px tags, 8px buttons, 12px inputs, 16px cards, 9999px pills
- 2-level shadow system: sm (cards, subtle lift) + md (modals, popovers). Dark mode uses brighter opacities
- Transition timing: 200ms ease-out for interactions, 300ms for layout shifts — snappy and responsive

### Claude's Discretion
- Exact hex values for derived secondary/accent colors (based on logo analysis)
- Exact muted pastel hex values for success/warning/error
- Light mode surface color specifics
- How to organize Tailwind config tokens (extend vs override)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Tailwind config already in `index.html` with brand colors, custom fonts, border radii, animations
- `.section-label` CSS class (DM Mono, 11px, uppercase, letter-spaced) — existing label pattern
- Shimmer animation keyframe defined
- View entry animation defined
- Custom scrollbar styling exists

### Established Patterns
- Tailwind CDN loaded from `index.html` with inline config — no `tailwind.config.js` file
- Dark mode via class strategy (`dark:` prefix)
- Brand colors: `brand-primary` (#12C2DC), `brand-secondary` (#6FD9E8), `brand-accent` (#0FA9BF), `brand-dark` (#0B1622)
- Fonts: Sora (400/600/700/800) for UI, DM Mono (400/500) for code/labels
- Neutral colors defined: `neutral-body` (#2B2B2B), `neutral-bg` (#F6F8FA)
- Existing radii overrides: xl=12px, 2xl=16px, 3xl=24px, 4xl=32px, 5xl=40px

### Integration Points
- All Tailwind config changes go in `index.html` `tailwind.config` block
- Components reference colors as `text-brand-primary`, `bg-brand-dark`, etc.
- Dark mode classes scattered across all components (`dark:bg-slate-800`, `dark:text-slate-400`, etc.)
- No CSS files — 100% Tailwind utility classes in JSX

</code_context>

<specifics>
## Specific Ideas

- Logo colors as source of truth: primary cyan from logo (~#12C2DC), derive secondary/accent
- User explicitly wants brand colors re-derived from logo rather than keeping existing secondary/accent
- Khan Academy visual north star — playful, education-focused, not corporate

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
