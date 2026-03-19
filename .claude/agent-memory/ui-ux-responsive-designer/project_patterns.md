---
name: YouTrack app UI patterns
description: Tailwind class conventions, section hierarchy, and card/flat-list rules for the YouTrack React app
type: project
---

## Stack
- React + Tailwind CSS (CDN, no build step for Tailwind)
- `brand-primary` = `#12c2dc` (cyan), `brand-secondary` = cyan-600 range
- Dark mode via `dark` class on `<html>`
- Font: `font-mono` for labels/badges/stats, normal for body text

## Page Header Pattern
```tsx
<div className="flex items-start gap-4 px-1">
  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-cyan-600 flex items-center justify-center shadow-xl shadow-brand-primary/30 shrink-0 ring-2 ring-brand-primary/20">
    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
  </div>
  <div className="flex-1 min-w-0">
    <h1 className="text-2xl md:text-3xl font-[800] tracking-tight text-brand-dark dark:text-white">{title}</h1>
    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
  </div>
</div>
```

## Contest Info / Result Header Card (light theme — matches lesson cards)
```tsx
<div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
  {/* Brand accent top strip */}
  <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-cyan-400 to-brand-primary/40" />
  <div className="p-5 md:p-6">
    {/* content */}
  </div>
</div>
```
Used for: ContestDetailView header, ContestResultsView "Your Result" header.
The brand-colored top strip gives the card visual identity without a dark background.
Previous dark gradient (`#0f172a → #020617`) was replaced — DO NOT revert to it.

## Section Hierarchy Rules
- **Do NOT stack many `bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800` cards** for lists of info rows
- **Info grids / fact lists**: use a flat `divide-y divide-gray-100 dark:divide-slate-800` table with `py-3 px-1` rows
- **Prize lists / winner lists**: flat `divide-y` rows, no outer card wrapper
- **Leaderboard**: flat `divide-y` rows; highlight "YOU" row with `bg-brand-primary/5` and left border accent `w-[3px] bg-brand-primary`
- **Contest cards in list**: keep `bg-white dark:bg-slate-900 rounded-2xl border` — these are navigable items, not info sections

## Button Patterns
- Primary CTA: `w-full py-3.5 rounded-2xl font-[800] font-mono text-sm text-white bg-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/25 ...`
- Secondary/ghost: `border border-brand-primary/30 hover:bg-brand-primary/10 text-brand-primary`
- Disabled state: `bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed`

## Status Badges
```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider {colorCls}">
  <span className="w-1.5 h-1.5 rounded-full {dotCls} {pulse?'animate-pulse':''}" />
  {label}
</span>
```

## Section Label / Sub-heading
```tsx
<p className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px]">
  Section Label
</p>
```

## Full-Screen Quiz Overlay Pattern (Lessons AND Contests)
Both quiz play views use `createPortal` to render a `fixed inset-0 z-[100]` overlay — NOT an in-page container.
Structure:
1. `fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-hidden flex flex-col`
2. Sticky header: `bg-white/80 dark:bg-slate-900/80 backdrop-blur-md` with `pt-[calc(env(safe-area-inset-top)+1rem)]`
3. Scrollable middle: `flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar`
4. Sticky bottom nav: `bg-white dark:bg-slate-900 border-t ... pb-[calc(env(safe-area-inset-bottom)+...)]`

Also call `useBodyScrollLock(true)` in ContestPlayView (defined as a module-level hook).
Options grid: always `grid-cols-2` (not `grid-cols-1 md:grid-cols-2`) — vocabulary quiz options are short enough for 2-col on mobile.

## Play View Bottom Nav
Wrap both buttons AND quick-dot navigator in `max-w-4xl mx-auto` (upgraded from max-w-xl) for consistent centering on all screen widths.

## Divider Usage
- Between info rows: `divide-y divide-gray-100 dark:divide-slate-800`
- Horizontal rule: `<div className="h-px bg-gray-100 dark:bg-slate-800 mx-1" />`
