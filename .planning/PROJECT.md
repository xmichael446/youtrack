# YouTrack UI Overhaul

## What This Is

A comprehensive UI standardization and redesign of the YouTrack LMS — a gamified education app for managing online courses. The app has leaderboards, a rewards shop, quizzes, and attendance tracking. The current UI was built incrementally and looks inconsistent, as if different developers built different pages with different instructions. This project brings it all under one cohesive, playful visual language inspired by Khan Academy.

## Core Value

Every page feels like it was designed by one person — consistent, playful, and polished enough that users never think "this looks AI-generated."

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

### Active

- [ ] Establish a design system: consistent spacing scale, color palette, typography hierarchy, border radii, shadows
- [ ] Standardize all component patterns: cards, buttons, inputs, modals, lists, badges
- [ ] Redesign Dashboard page with cohesive layout and visual hierarchy
- [ ] Redesign Leaderboard page with playful gamification visuals
- [ ] Redesign Lessons page (attendance, assignments, quiz views)
- [ ] Redesign Rewards/Shop page with engaging product-style cards
- [ ] Redesign Login page to set the visual tone
- [ ] Redesign Profile page
- [ ] Redesign Contest views
- [ ] Improve navigation (sidebar, bottom nav, header) for consistency and flow
- [ ] Ensure responsive design works well on mobile and desktop
- [ ] Make dark mode feel intentional, not just inverted colors

### Out of Scope

- New features or functionality — this is purely visual/UX
- Backend API changes — frontend only
- New pages or views — redesign existing ones
- Migration away from current tech stack (React, Tailwind, Vite)

## Context

- Brownfield React 19 SPA with Vite 6, Tailwind CSS (via CDN), TypeScript
- Styling uses Tailwind utilities with custom brand colors: `brand-primary` (#12C2DC), `brand-secondary` (#6FD9E8), `brand-accent` (#0FA9BF), `brand-dark` (#0B1622)
- Fonts: Sora (sans) and DM Mono (mono) via Google Fonts
- Icons: lucide-react
- Gamification is central: rewards shop, leaderboard, quiz flow, contests
- App runs as a Telegram Mini App (must preserve Telegram Web App SDK integration)
- Existing codebase map available at `.planning/codebase/`
- The visual north star is Khan Academy — playful education app, not a corporate SaaS dashboard

## Constraints

- **Tech stack**: Must stay on React + Tailwind + Vite — no new UI frameworks
- **Functionality**: All existing features must continue working — this is a reskin + redesign, not a rebuild
- **Telegram**: Must preserve Telegram Mini App integration and login flow
- **i18n**: Must support both English and Uzbek translations

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Khan Academy as visual inspiration | Playful, gamified education — matches app's identity | -- Pending |
| Design system first, then page redesigns | Consistency requires shared foundations before per-page work | -- Pending |
| Keep Tailwind CSS (no component library) | Already in use, adding a component library would be a migration not a redesign | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 after initialization*
