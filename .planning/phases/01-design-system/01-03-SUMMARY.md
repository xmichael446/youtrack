---
phase: "01-design-system"
plan: "03"
subsystem: "ui-primitives, lessons, profile"
tags: ["design-tokens", "migration", "dark-mode", "typography", "spacing"]
dependency_graph:
  requires: ["01-01"]
  provides: ["semantic-tokens-tier2", "lessons-tokens", "profile-tokens"]
  affects: ["leaderboard-components", "contests-components"]
tech_stack:
  added: []
  patterns:
    - "semantic surface tokens: bg-surface-primary/dark:bg-surface-dark-primary"
    - "semantic text tokens: text-text-theme-*/dark:text-text-theme-dark-*"
    - "composite typography tokens: text-h1..text-caption (replace raw text-xl font-bold)"
    - "shadow-modal dark:shadow-modal-dark for modal containers"
key_files:
  created: []
  modified:
    - src/components/ui/LeaderboardAvatar.tsx
    - src/components/ui/StatusBadge.tsx
    - src/components/ui/RankBadge.tsx
    - src/components/ui/PlaceIcon.tsx
    - src/components/ui/BackButton.tsx
    - src/components/ui/Shimmer.tsx
    - src/features/lessons/LessonsContent.tsx
    - src/features/lessons/ActiveAttendanceCard.tsx
    - src/features/lessons/AssignmentHistoryCard.tsx
    - src/features/lessons/CurrentAssignmentSection.tsx
    - src/features/lessons/QuizSection.tsx
    - src/features/lessons/SubmissionModal.tsx
    - src/features/profile/ProfileHero.tsx
    - src/features/profile/ProfileEdit.tsx
    - src/features/profile/AchievementShowcase.tsx
    - src/features/profile/ActivityFeed.tsx
    - src/features/profile/ActivityHeatmap.tsx
    - src/features/profile/PrivacySettings.tsx
    - src/features/profile/profileHelpers.ts
decisions:
  - "SubmissionModal uses shadow-modal dark:shadow-modal-dark semantic shadow tokens"
  - "RARITY_COLORS hex values in profileHelpers.ts preserved — data-driven rarity tier colors"
  - "heatmapColorClass empty-cell class updated to bg-surface-secondary dark:bg-surface-dark-secondary"
  - "lessonTypes.ts dark:text-slate-400 left untouched — out of plan scope, deferred"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-03-27T00:34:11Z"
  tasks_completed: 3
  files_modified: 19
---

# Phase 01 Plan 03: Migrate UI Primitives, Lessons, and Profile to Semantic Design Tokens — Summary

Migrated 19 files across three feature areas (UI primitives, lessons, profile) to use semantic design tokens for colors, typography, and spacing. Zero raw `dark:*-slate-*` classes remain in any of the 19 plan files.

## What Was Built

**Semantic token migration for three component tiers:**

1. **UI Primitives (6 files):** LeaderboardAvatar, StatusBadge, RankBadge, PlaceIcon, BackButton, Shimmer — all replaced `dark:bg-slate-*`, `dark:text-slate-*`, `dark:border-slate-*` with `surface-dark-*` and `text-theme-dark-*` tokens. Typography migrated from raw `text-xs`/`text-sm` + `font-bold` to composite `text-caption`/`text-label`/`text-body` tokens.

2. **Lesson Features (6 files):** LessonsContent, ActiveAttendanceCard, AssignmentHistoryCard, CurrentAssignmentSection, QuizSection (heaviest: ~47 typography changes), SubmissionModal — all dark mode slate classes replaced with semantic tokens. SubmissionModal now uses `shadow-modal dark:shadow-modal-dark` for the modal container. Typography throughout uses semantic scale.

3. **Profile Features (7 files):** ProfileHero, ProfileEdit, AchievementShowcase, ActivityFeed, ActivityHeatmap, PrivacySettings, profileHelpers.ts — all dark mode slate classes replaced. RARITY_COLORS hex values (`#9ca3af`, `#3b82f6`, `#8b5cf6`, `#f59e0b`) preserved unchanged as data-driven rarity tier colors used via inline styles in AchievementShowcase.

## Decisions Made

- **RARITY_COLORS preserved:** These are achievement rarity tier identifiers tied to game data, not theme colors. They render via inline `style` attributes not Tailwind classes, so they were not migrated and must not be.
- **SubmissionModal shadow:** Added `shadow-modal dark:shadow-modal-dark` to the modal container div per design system spec.
- **heatmapColorClass:** The zero-activity cell class was updated from `bg-gray-100 dark:bg-slate-800` to `bg-surface-secondary dark:bg-surface-dark-secondary` maintaining visual intent.
- **lessonTypes.ts:** This file (not in plan scope) contains `dark:text-slate-400` on a utility function. Deferred to a future pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] StatusBadge `dark:bg-slate-500` on finalized status dot**
- **Found during:** Overall verification pass
- **Issue:** The finalized status dotCls still had `dark:bg-slate-500`
- **Fix:** Simplified to `bg-gray-400` (no dark override needed for a small indicator dot)
- **Files modified:** src/components/ui/StatusBadge.tsx
- **Commit:** 8aaa95f

### Out of Scope Discoveries

Deferred to future migration pass:
- `src/features/lessons/lessonTypes.ts`: Contains `dark:text-slate-400` in `assignmentStatusColor()` utility function. Not in plan's files_modified list — deferred.

## Commits

| Task | Commit | Files | Description |
|------|--------|-------|-------------|
| Task 1 - UI primitives | d44509f | 6 | UI primitive components to semantic tokens |
| Task 2 - Lessons | 578241b | 6 | Lesson feature components to semantic tokens |
| Task 3 - Profile | f59e902 | 7 | Profile feature components to semantic tokens |
| Fix - StatusBadge dot | 8aaa95f | 1 | Remove last raw dark:bg-slate-* class |

## Known Stubs

None. All migrated components render real data. No placeholder content was introduced.

## Self-Check

- [x] All 19 plan files: zero `dark:bg-slate-*`, `dark:text-slate-*`, `dark:border-slate-*` classes
- [x] Typography scale tokens (text-h1..text-caption) visible in migrated files
- [x] RARITY_COLORS hex values unchanged in profileHelpers.ts
- [x] SubmissionModal uses shadow-modal dark:shadow-modal-dark
- [x] All commits exist
