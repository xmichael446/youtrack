# Phase 3: Page Redesigns - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign every page in the app to create a cohesive, playful visual language. Use the design system tokens (Phase 1) and reusable components (Phase 2) throughout. Visual-only changes — preserve all existing data fetching, state management, and business logic. Every page should feel like it was designed by one person.

</domain>

<decisions>
## Implementation Decisions

### Login & Dashboard Visual Direction
- Login: centered card with brand gradient background, leaf logo, playful education-focused tone — sets the visual identity immediately
- Dashboard: single-column card stack with enrollment cards as hero, stats bar (XP/coins/streak), quick-action pills — mobile-first scrollable
- Gamification prominent: XP/coins visible in stats bar, progress rings on enrollment cards, streak indicators — not hidden away
- Mandatory migration to Phase 2 components (Button, Card, Input, Modal, Badge, EmptyState) throughout all pages

### Leaderboard & Gamification Pages
- Leaderboard: podium treatment for top 3 (gold/silver/bronze visual), ranked list below with rank badges — engaging, not tabular
- Rewards/Shop: product grid with reward cards showing image/points/rarity, point balance header, claim flow via Modal component
- Contests: card-based listing with status badges (upcoming/active/ended), detail view with countdown, play view as focused experience
- Notifications: dropdown panel from header (existing pattern), read/unread states, grouped by date — keep lightweight

### Lessons, Profile & Cross-Page Consistency
- Lessons: session-based tabs (attendance/assignments/quiz) with clear status indicators — keep existing structure, polish visually
- Profile: hero header (avatar + stats) + tabbed sections (activity/achievements/settings) — engaging and information-dense
- Page transitions: shared view-entry animation (fade-in + translateY) applied consistently to all page switches
- Visual-only changes: keep all data fetching, state management, business logic intact — only restructure JSX and styling

### Claude's Discretion
- Exact layout proportions and spacing within each page
- Color accent choices for gamification elements (XP bars, streak counters)
- Exact podium visual treatment (size, spacing, animation)
- How to structure responsive breakpoints within each page
- Whether to extract page-specific sub-components (e.g., EnrollmentCard, StatBar)
- Animation timing for page-specific elements

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 2 components: Button, Card, Input, Badge, EmptyState, Modal, Toast (all in src/components/ui/)
- Barrel export: src/components/ui/index.ts
- Z_INDEX scale: src/constants/zIndex.ts
- Design tokens: all in index.html Tailwind config (semantic colors, typography, spacing, radii, shadows, transitions)
- Existing page components: Login.tsx, Dashboard.tsx, Leaderboard.tsx, Lessons.tsx (via LessonsContent), Rewards.tsx, Profile.tsx, Contests.tsx
- Feature components: src/features/lessons/, src/features/profile/, src/features/contests/

### Established Patterns
- ViewState navigation in App.tsx — pages render based on currentView string
- Each page has its own Context provider for data fetching
- Dark mode fully tokenized from Phase 1
- Mobile-first responsive with md: breakpoint
- Existing animations: view-entry (fade + translateY), shimmer, scale transforms

### Integration Points
- App.tsx renders pages based on currentView — page components are direct children
- Header.tsx provides navigation — active state already standardized
- Footer.tsx is minimal — just branding
- DashboardContext provides enrollment/course data
- LeaderboardContext provides rankings
- LessonsContext manages attendance/assignments/quiz
- ShopContext manages rewards
- ContestContext manages contests
- NotificationContext provides notification data

</code_context>

<specifics>
## Specific Ideas

- Khan Academy visual north star — playful, education-focused, warm and inviting
- Login page should make new users immediately understand this is a gamified learning app
- Dashboard enrollment cards should show course progress visually (progress bar/ring), not just text
- Leaderboard top-3 podium should feel celebratory, competitive, exciting
- Rewards should feel like a shop/store — "earn and spend" visual language

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
