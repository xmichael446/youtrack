# YouTrack Design System Reference

**Version:** 1.0
**Created:** 2026-03-27
**Source of truth:** `tailwind.config` in `index.html`

This document defines every design token used across the YouTrack UI. All Tailwind class examples below correspond directly to keys in the Tailwind config. Plans 02-04 reference this document for migration guidance.

---

## 1. Color Palette

### 1.1 Brand Colors

Derived from the YouTrack logo. The primary cyan `#12C2DC` is the anchor; all other brand colors are derived from it.

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `brand-primary` | `#12C2DC` | `text-brand-primary`, `bg-brand-primary` | Primary actions, highlights, active states |
| `brand-secondary` | `#6FD9E8` | `text-brand-secondary`, `bg-brand-secondary` | Secondary highlights, subtle accents |
| `brand-accent` | `#0FA9BF` | `text-brand-accent`, `bg-brand-accent` | Hover/active states, pressed buttons |
| `brand-dark` | `#0B1622` | `text-brand-dark`, `bg-brand-dark` | Dark backgrounds, deep contrast |

**Rationale:** `brand-primary` is the logo anchor. `brand-secondary` is a lighter cyan (+40% lightness) for soft highlights. `brand-accent` is a deeper cyan (-10% lightness) for hover/active to reinforce interactivity. `brand-dark` is a near-black navy for deep backgrounds.

### 1.2 Surface Colors (Light Mode)

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `surface-primary` | `#FFFFFF` | `bg-surface-primary` | Main page background |
| `surface-secondary` | `#F6F8FA` | `bg-surface-secondary` | Cards, sections, containers |
| `surface-elevated` | `#FFFFFF` | `bg-surface-elevated` | Modals, popovers (distinguished by shadow, not color) |

**Rationale:** Light mode uses a clean white/off-white pair. `surface-secondary` maps to the existing `neutral-bg` (#F6F8FA) — a very subtle warm gray that separates content areas without heavy borders.

### 1.3 Surface Colors (Dark Mode)

A 3-layer dark system: each layer is one Slate step darker/lighter to create clear visual hierarchy without harsh contrast.

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `surface-dark-primary` | `#0f172a` (slate-900) | `dark:bg-surface-dark-primary` | Page background |
| `surface-dark-secondary` | `#1e293b` (slate-800) | `dark:bg-surface-dark-secondary` | Cards, panels |
| `surface-dark-elevated` | `#334155` (slate-700) | `dark:bg-surface-dark-elevated` | Modals, dropdowns, elevated elements |

**Rationale:** Slate-900/800/700 forms a natural dark surface triad. Each step provides ~10% more brightness, giving clear visual depth without requiring opacity tricks.

### 1.4 Text Colors

| Token | Light Value | Dark Value | Tailwind Class | Usage |
|-------|-------------|------------|----------------|-------|
| `text-theme-primary` | `#1a1a2e` | `#f1f5f9` | `text-text-theme-primary`, `dark:text-text-theme-dark-primary` | Headings, primary content |
| `text-theme-secondary` | `#64748b` | `#94a3b8` | `text-text-theme-secondary`, `dark:text-text-theme-dark-secondary` | Secondary content, descriptions |
| `text-theme-muted` | `#94a3b8` | `#64748b` | `text-text-theme-muted`, `dark:text-text-theme-dark-muted` | Captions, hints, placeholders |
| `text-theme-inverse` | `#FFFFFF` | `#0f172a` | `text-text-theme-inverse` | Text on colored/dark backgrounds |

**Rationale:** `text-primary` uses a deep navy (`#1a1a2e`) rather than pure black for softer contrast. Secondary and muted use Slate scale values for consistency with the dark mode surfaces.

### 1.5 Status Colors

Muted pastels for a playful, non-alarming feel. Backgrounds are very light tints for inline alerts/banners.

| Token | Light Value | Dark Value | Tailwind Class | Usage |
|-------|-------------|------------|----------------|-------|
| `status-success` | `#22c55e` | `#4ade80` | `text-status-success`, `bg-status-success` | Success states, completed items |
| `status-success-bg` | `#f0fdf4` | `#052e16` | `bg-status-success-bg` | Success banners, alert backgrounds |
| `status-warning` | `#eab308` | `#facc15` | `text-status-warning`, `bg-status-warning` | Warning states, pending items |
| `status-warning-bg` | `#fefce8` | `#422006` | `bg-status-warning-bg` | Warning banners |
| `status-error` | `#ef4444` | `#f87171` | `text-status-error`, `bg-status-error` | Error states, failed items |
| `status-error-bg` | `#fef2f2` | `#450a0a` | `bg-status-error-bg` | Error banners |

**Dark mode:** Use `dark:text-status-dark-success`, `dark:bg-status-dark-success-bg`, etc.

**Rationale:** These are standard Tailwind green-500/yellow-500/red-500 variants. Dark mode uses lighter versions (+100 lightness step) for better contrast on dark backgrounds. Background tints are extremely light (50-shade) to serve as alert banners.

---

## 2. Typography

### 2.1 Scale

All typography tokens set `font-size`, `line-height`, AND `font-weight` simultaneously — a composite token.

| Token | Size | Weight | Line Height | Tailwind Class | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-h1` | 28px | 700 (bold) | 1.2 | `text-h1` | Page titles, hero headings |
| `text-h2` | 22px | 600 (semibold) | 1.3 | `text-h2` | Section headings |
| `text-h3` | 18px | 600 (semibold) | 1.4 | `text-h3` | Card titles, subsections |
| `text-h4` | 16px | 600 (semibold) | 1.4 | `text-h4` | Labels, small headings |
| `text-body` | 14px | 400 (regular) | 1.5 | `text-body` | Default body text |
| `text-caption` | 12px | 400 (regular) | 1.4 | `text-caption` | Helper text, timestamps, captions |
| `text-label` | 12px | 600 (semibold) | 1.4 | `text-label` | UI labels (often paired with `uppercase tracking-wider`) |

**Font stack:** Sora (sans) for all UI text. DM Mono for code, labels, section markers.

**Rationale:** Compact modular scale (28/22/18/16/14/12) keeps density high for mobile education content. 3 font weights (400/600/700) are already loaded from Google Fonts. Body at 14px matches common mobile app conventions.

### 2.2 Typography Migration

When migrating components from raw Tailwind classes to semantic tokens, follow this mapping:

| Raw Tailwind Classes | Semantic Token | Notes |
|---|---|---|
| `text-2xl font-bold` or `text-[28px] font-bold` | `text-h1` | Page titles. Remove separate `font-bold` — included in token |
| `text-xl font-semibold` or `text-[22px] font-semibold` | `text-h2` | Section headings. Remove separate `font-semibold` |
| `text-lg font-semibold` or `text-[18px] font-semibold` | `text-h3` | Card titles, subsections |
| `text-base font-semibold` | `text-h4` | Labels, small headings |
| `text-sm` (body content) | `text-body` | Default body text at 14px |
| `text-xs` (captions, hints) | `text-caption` | Small helper text at 12px |
| `text-xs font-semibold uppercase tracking-wider` | `text-label uppercase tracking-wider` | UI labels — keep `uppercase tracking-wider` |

**Important:** `text-h1` through `text-label` are composite tokens that set font-size, line-height, AND font-weight simultaneously. When migrating `text-xl font-bold` to `text-h2`, **remove the separate `font-bold` or `font-semibold` class** since `text-h2` already includes `fontWeight: 600`.

**Judgment calls:**
- When a `text-sm` is clearly a label (short, descriptive, all-caps context) → use `text-label`
- When a `text-sm` is body content (sentences, descriptions) → use `text-body`
- When a `text-xs` appears on a substantive line (not a caption) → keep `text-caption` — 12px is the minimum readable size

---

## 3. Spacing

### 3.1 Scale

Based on a strict 4px grid. Every spacing value must be a multiple of 4px.

| Alias | Value | Tailwind Numeric | Tailwind Alias Class |
|-------|-------|-----------------|---------------------|
| xs | 4px | `p-1`, `m-1`, `gap-1` | `p-xs`, `m-xs`, `gap-xs` |
| sm | 8px | `p-2`, `m-2`, `gap-2` | `p-sm-space`, `m-sm-space`, `gap-sm-space` |
| md | 12px | `p-3`, `m-3`, `gap-3` | `p-md-space`, `m-md-space`, `gap-md-space` |
| lg | 16px | `p-4`, `m-4`, `gap-4` | `p-lg-space`, `m-lg-space`, `gap-lg-space` |
| xl | 24px | `p-6`, `m-6`, `gap-6` | `p-xl-space`, `m-xl-space`, `gap-xl-space` |
| 2xl | 32px | `p-8`, `m-8`, `gap-8` | `p-2xl-space`, `m-2xl-space`, `gap-2xl-space` |
| 3xl | 48px | `p-12`, `m-12`, `gap-12` | `p-3xl-space`, `m-3xl-space`, `gap-3xl-space` |

### 3.2 Spacing Approach

Tailwind's default numeric spacing maps cleanly to the 4px grid:
- `p-1` = 4px = xs
- `p-2` = 8px = sm
- `p-3` = 12px = md
- `p-4` = 16px = lg
- `p-6` = 24px = xl
- `p-8` = 32px = 2xl
- `p-12` = 48px = 3xl

**These numeric values ARE on-scale and do NOT need renaming.** The semantic aliases (`p-xs`, `p-sm-space`, etc.) are available for readability but the numeric equivalents are equally valid.

### 3.3 Off-Scale Values (Must Audit)

The following spacing values are NOT on the 4px grid and must be replaced during migration:

| Off-Scale Class | Actual Value | Replace With |
|-----------------|-------------|--------------|
| `p-0.5` | 2px | Acceptable for micro-adjustments (icon alignment only) |
| `p-1.5` | 6px | `p-1` (4px) or `p-2` (8px) |
| `p-2.5` | 10px | `p-2` (8px) or `p-3` (12px) |
| `p-3.5` | 14px | `p-3` (12px) or `p-4` (16px) |
| `p-5` | 20px | `p-4` (16px) or `p-6` (24px) |
| `p-7` | 28px | `p-6` (24px) or `p-8` (32px) |
| `p-9` | 36px | `p-8` (32px) or `p-12` (48px) |
| `p-10` | 40px | `p-8` (32px) or `p-12` (48px) |
| `p-11` | 44px | `p-12` (48px) |
| `p-14` | 56px | `p-12` (48px) |

**The same applies to:** `m-`, `px-`, `py-`, `mx-`, `my-`, `mt-`, `mb-`, `ml-`, `mr-`, `gap-`, `space-x-`, `space-y-`.

**Context for replacements:** Use visual judgment. `p-5` on a container is close enough to `p-6` (24px). `p-7` on a section padding can become `p-6` or `p-8` depending on density preference.

---

## 4. Border Radius

Semantic radius tokens for each component type, creating a bubbly/playful visual character.

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `rounded-tag` | 4px | `rounded-tag` | Tags, badges, small chips |
| `rounded-button` | 8px | `rounded-button` | Buttons, CTAs |
| `rounded-input` | 12px | `rounded-input` | Input fields, text areas |
| `rounded-card` | 16px | `rounded-card` | Cards, panels, containers |
| `rounded-pill` | 9999px | `rounded-pill` | Pill buttons, avatar rings, progress bars |

**Legacy aliases (preserved for backward compat):**

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-xl` | 12px | Maps to `rounded-input` |
| `rounded-2xl` | 16px | Maps to `rounded-card` |
| `rounded-3xl` | 24px | Large rounded containers |
| `rounded-4xl` | 32px | Very large containers |
| `rounded-5xl` | 40px | Maximum roundedness before pill |

**Rationale:** 16px as the default card radius gives a bubbly, approachable feel consistent with the Khan Academy visual north star. Smaller radii (4px tags, 8px buttons) maintain hierarchy — interactive elements feel "smaller" visually.

---

## 5. Shadows

A 2-level shadow system. Light shadows suggest depth without heaviness; dark mode uses higher opacity since dark backgrounds absorb shadows less.

### 5.1 Light Mode

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` | `shadow-card` | Cards, panels — subtle lift |
| `shadow-modal` | `0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)` | `shadow-modal` | Modals, popovers, dropdowns |

### 5.2 Dark Mode

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `shadow-card-dark` | `0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)` | `dark:shadow-card-dark` | Cards in dark mode |
| `shadow-modal-dark` | `0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)` | `dark:shadow-modal-dark` | Modals in dark mode |

**Usage pattern:**
```html
<div class="shadow-card dark:shadow-card-dark rounded-card bg-surface-secondary dark:bg-surface-dark-secondary">
  Card content
</div>
```

**Rationale:** 2-level shadow system (card vs modal) is sufficient for a mobile-focused education app. Avoid overly deep shadows (> 12px blur) that feel corporate/heavy.

---

## 6. Transitions

Fast, snappy transitions for immediate feedback. Avoid sluggish animations that feel unresponsive on mobile.

| Token | Value | CSS Variable | Usage |
|-------|-------|-------------|-------|
| `duration-fast` | 200ms | `transition-duration: 200ms` | Hover states, clicks, toggles, focus rings |
| `duration-normal` | 300ms | `transition-duration: 300ms` | Accordions, slide-in panels, layout shifts |

**Timing function:** `ease-out` (cubic-bezier(0.4, 0, 0.2, 1)) — decelerates into final position, feels snappy.

**Usage pattern:**
```html
<button class="transition-colors duration-fast hover:bg-brand-accent">
  Action
</button>

<div class="transition-all duration-normal">
  Expandable content
</div>
```

**Rationale:** 200ms is the minimum perceivable interaction feedback. 300ms works for layout shifts where the user needs to track movement. Never go above 400ms for UI interactions — it feels broken on mobile.

---

## 7. Complete Token Reference Card

Quick reference for all token categories:

### Colors
- **Brand:** `brand-primary` `brand-secondary` `brand-accent` `brand-dark`
- **Surfaces (light):** `surface-primary` `surface-secondary` `surface-elevated`
- **Surfaces (dark):** `surface-dark-primary` `surface-dark-secondary` `surface-dark-elevated`
- **Text (light):** `text-theme-primary` `text-theme-secondary` `text-theme-muted` `text-theme-inverse`
- **Text (dark):** `text-theme-dark-primary` `text-theme-dark-secondary` `text-theme-dark-muted`
- **Status:** `status-success` `status-success-bg` `status-warning` `status-warning-bg` `status-error` `status-error-bg`
- **Status (dark):** `status-dark-success` `status-dark-success-bg` `status-dark-warning` `status-dark-warning-bg` `status-dark-error` `status-dark-error-bg`

### Typography
- **Headings:** `text-h1` (28px/700) `text-h2` (22px/600) `text-h3` (18px/600) `text-h4` (16px/600)
- **Body:** `text-body` (14px/400) `text-caption` (12px/400) `text-label` (12px/600)

### Spacing (4px grid)
- `p-xs` (4px) = `p-1`
- `p-sm-space` (8px) = `p-2`
- `p-md-space` (12px) = `p-3`
- `p-lg-space` (16px) = `p-4`
- `p-xl-space` (24px) = `p-6`
- `p-2xl-space` (32px) = `p-8`
- `p-3xl-space` (48px) = `p-12`

### Radii
- `rounded-tag` (4px) `rounded-button` (8px) `rounded-input` (12px) `rounded-card` (16px) `rounded-pill` (9999px)

### Shadows
- `shadow-card` `shadow-modal` `dark:shadow-card-dark` `dark:shadow-modal-dark`

### Transitions
- `duration-fast` (200ms) `duration-normal` (300ms)

---

## 8. Migration Checklist

When redesigning a page or component, follow this order:

1. **Colors first** — Replace all raw `bg-slate-*`, `text-gray-*`, `text-slate-*` with semantic tokens
2. **Typography second** — Replace `text-xl font-semibold` patterns with `text-h2`, etc.
3. **Spacing third** — Audit off-scale values (p-5, p-7, p-10) and replace with on-grid values
4. **Radii fourth** — Replace `rounded-xl`, `rounded-2xl` with semantic `rounded-card`, `rounded-input`
5. **Shadows fifth** — Add `shadow-card dark:shadow-card-dark` to cards if missing
6. **Transitions last** — Ensure interactive elements use `duration-fast`, layout shifts use `duration-normal`

---

*Reference created from locked decisions in `.planning/phases/01-design-system/01-CONTEXT.md`*
