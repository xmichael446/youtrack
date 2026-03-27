---
phase: 04-polish
plan: 01
subsystem: design-tokens
tags: [dark-mode, palette, tailwind-config, ui-primitives, shell-components]
dependency_graph:
  requires: []
  provides: [dark-mode-palette-v2]
  affects: [all-dark-mode-views, Card, Modal, Header, App]
tech_stack:
  added: []
  patterns: [deeper-dark-palette, semantic-token-dark-surfaces]
key_files:
  created: []
  modified:
    - index.html
    - src/components/ui/Card.tsx
    - src/components/ui/Modal.tsx
    - src/components/Header.tsx
    - src/App.tsx
    - .planning/design-system.md
decisions:
  - "Dark surface palette redesigned from slate-based to deeper navy-based: #080f1a/#111827/#1e293b instead of #0f172a/#1e293b/#334155"
  - "Sticky header uses surface-dark-primary (deepest layer) for visual weight separation from card content"
  - "Bottom nav uses surface-dark-primary to match page background depth, separated only by border"
  - "Card dark ring upgraded from ring-white/5 to ring-white/[0.07] for luminous edge treatment against deeper bg"
  - "Modal overlay darkened to bg-black/60 in dark mode for better focus against deeper backgrounds"
metrics:
  duration: "10m"
  completed: "2026-03-27"
  tasks_completed: 2
  files_modified: 6
---

# Phase 4 Plan 1: Dark Mode Palette Redesign Summary

**One-liner:** Deeper navy-black dark surface palette (#080f1a/#111827/#1e293b) replacing generic slate-900/800/700, making brand-primary pop and creating clear 3-layer visual depth.

## What Was Built

Redesigned the YouTrack dark mode palette from a functional-but-generic slate system to a premium, intentional dark experience. The entire dark scale shifted deeper — the base is now `#080f1a` (vs previous `#0f172a`), secondary is `#111827` (vs `#1e293b`), and elevated is `#1e293b` (vs `#334155`). This creates more dramatic contrast between layers and makes `#12C2DC` brand-primary pop vibrantly against darker backgrounds.

Text was also updated: dark primary text is now `#f8fafc` (slate-50, brighter) and muted text is `#475569` (slate-600, slightly lighter) for better readability on deeper backgrounds.

## Tasks Completed

### Task 1: Redesign dark palette in Tailwind config and update UI primitives

- **index.html:** Updated `surface-dark` and `text-theme-dark` color tokens in Tailwind config
- **Card.tsx:** Dark ring upgraded from `ring-white/5` to `ring-white/[0.07]` for subtle luminous edge
- **Modal.tsx:** Overlay darkened to `bg-black/50 dark:bg-black/60` for better focus context
- **Input.tsx, Badge.tsx, Toast.tsx, StatusBadge.tsx:** All verified using semantic tokens already — no changes needed

### Task 2: Update shell components and design-system.md

- **Header.tsx:** Dark background changed from `dark:bg-surface-dark-secondary/95` to `dark:bg-surface-dark-primary/95` (deepest layer for sticky header)
- **App.tsx:** Bottom nav dark background changed from `dark:bg-surface-dark-secondary/90` to `dark:bg-surface-dark-primary/90` (matches page depth, separated by border)
- **App.tsx sidebar:** Already used `dark:bg-surface-dark-secondary` (correct — one step lighter than page bg)
- **design-system.md:** Section 1.3 updated with new hex values and expanded rationale; Section 1.4 updated text-theme-dark.primary to `#f8fafc`, muted to `#475569`, inverse to `#080f1a`
- **Footer.tsx:** Already uses semantic tokens via isDark ternary — no changes needed

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- index.html: #080f1a and #111827 values present ✓
- Card.tsx: ring-white/[0.07] present ✓
- design-system.md: updated hex values ✓
- Header.tsx: surface-dark-primary used ✓
- App.tsx: surface-dark-primary for main content and bottom nav ✓
- Commits: defce8d (Task 1), ec31bd7 (Task 2) ✓
