# YouTrack UI Overhaul

## What This Is

A gamified education LMS with a cohesive, playful visual language inspired by Khan Academy. The app has leaderboards, a rewards shop, quizzes, contests, and attendance tracking — all redesigned under a unified design system with reusable components.

## Core Value

Every page feels like it was designed by one person — consistent, playful, and polished.

## Requirements

### Validated

- ✓ Telegram-based login flow (code + deep link + polling) — existing
- ✓ Dashboard with enrollment/course data — existing
- ✓ Leaderboard with group + course rankings — existing
- ✓ Lessons page with attendance, assignments, quiz flow — existing
- ✓ Rewards shop with listing and claiming — existing
- ✓ Notifications with polling — existing
- ✓ Dark/light theme toggle — existing
- ✓ English/Uzbek internationalization — existing
- ✓ Client-side routing with browser history — existing
- ✓ Profile and contest detail views — existing
- ✓ JWT auth with automatic token refresh — existing
- ✓ Design system: spacing scale, color palette, typography, radii, shadows, transitions — v1.0
- ✓ Standardized component library: Button, Card, Input, Badge, EmptyState, Modal, Toast — v1.0
- ✓ All pages redesigned with consistent visual language — v1.0
- ✓ Navigation standardized with active states and z-index scale — v1.0
- ✓ Responsive design at 375px+ mobile width — v1.0
- ✓ Dark mode redesigned with intentional navy-black palette — v1.0
- ✓ WCAG AA keyboard focus states on all interactive elements — v1.0
- ✓ Micro-interactions on buttons, cards, and page transitions — v1.0

### Active

(None — start next milestone to define new requirements)

### Out of Scope

- New features or functionality — v1.0 was purely visual/UX
- Backend API changes — frontend only
- New pages or views — redesign existing ones
- Migration away from current tech stack (React, Tailwind, Vite)
- Custom illustrations or mascot — v2 consideration
- Animated achievement celebrations — v2 consideration
- Skeleton loading screens per page — v2 consideration

## Context

- Shipped v1.0 UI Overhaul: 4 phases, 18 plans, ~11,000 LOC TypeScript
- React 19 SPA with Vite 6, Tailwind CSS (CDN), TypeScript
- Design system: 5 semantic color tiers, 7-level typography scale, 4px spacing grid, bubbly 16px radii
- Dark mode: 3-layer navy palette (#080f1a / #111827 / #1e293b)
- Component library: 13 UI primitives in src/components/ui/ with barrel export
- Z-index scale: dropdown(40), overlay(50), modal(60), toast(70), fullscreen(100)
- Fonts: Sora (sans) and DM Mono (mono)
- Icons: lucide-react
- App runs as Telegram Mini App

## Constraints

- **Tech stack**: React + Tailwind + Vite — no new UI frameworks
- **Functionality**: All features preserved — this was a reskin, not a rebuild
- **Telegram**: Telegram Mini App integration and login flow preserved
- **i18n**: English and Uzbek translations supported

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Khan Academy as visual inspiration | Playful, gamified education — matches app's identity | ✓ Good — unified playful tone across all pages |
| Design system first, then page redesigns | Consistency requires shared foundations before per-page work | ✓ Good — tokens + components enabled parallel page redesigns |
| Keep Tailwind CSS (no component library) | Already in use, adding a library would be a migration | ✓ Good — CDN config approach works well |
| Bubbly 16px card radii | User preferred more playful rounded corners | ✓ Good — distinctive, friendly feel |
| Muted pastels for status colors | Softer tones fit the playful education aesthetic | ✓ Good — gentler than standard green/amber/red |
| Navy-black dark palette (#080f1a) | User wanted dark mode redesigned from scratch, not just audited | ✓ Good — premium feel with distinct surface layers |
| Reusable components (Button, Card, Input, Modal, Badge, EmptyState) | Enforces design system consistency across all pages | ✓ Good — 13 components, barrel export, used by 24+ files |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-03-27 after v1.0 milestone*
