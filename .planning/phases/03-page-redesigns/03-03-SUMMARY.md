---
phase: 03-page-redesigns
plan: 03
subsystem: lessons-feature
tags: [lessons, redesign, phase2-migration, card, button, badge, modal, emptystate]
dependency_graph:
  requires: [02-core-components]
  provides: [lessons-redesigned]
  affects: [src/features/lessons]
tech_stack:
  added: []
  patterns:
    - Card component wrapping content sections in lesson feature
    - Badge component for status indicators (attended/missed/approved/submitted)
    - Button component for all CTA actions (mark attendance, submit assignment, start quiz)
    - Modal component replacing raw portal overlay in SubmissionModal
    - EmptyState component for no-data states
key_files:
  created: []
  modified:
    - src/features/lessons/LessonsContent.tsx
    - src/features/lessons/ActiveAttendanceCard.tsx
    - src/features/lessons/CurrentAssignmentSection.tsx
    - src/features/lessons/AssignmentHistoryCard.tsx
    - src/features/lessons/QuizSection.tsx
    - src/features/lessons/SubmissionModal.tsx
decisions:
  - ActiveAttendanceCard Badge for lesson number uses custom flex-col layout to show LSN label above number within badge container — Badge component used as wrapper, label style applied via className
  - AssignmentHistoryCard status variant computed via helper function mapping assignment states to Badge variants (success/error/warning/muted)
  - QuizSection modal overlay modes (article/solving/results/review) kept as raw createPortal — they are immersive full-screen experiences that don't need Card wrapping; only info mode and CTA buttons migrated
  - SubmissionModal body scroll lock handled by Modal component — removed duplicate from SubmissionModal itself
metrics:
  duration: 6m
  completed: 2026-03-27
  tasks_completed: 2
  files_modified: 6
---

# Phase 3 Plan 3: Lessons Page Redesign Summary

**One-liner:** Migrated all 6 lesson feature components to Phase 2 Card/Button/Badge/Modal/EmptyState with attendance, assignment, quiz, and submission logic fully preserved.

## What Was Built

The Lessons page feature components were redesigned to use the Phase 2 UI component library throughout:

- **LessonsContent.tsx**: Replaced raw empty state divs with `EmptyState` component for both attendance and assignment sections. Section headers migrated to `text-h4` with brand-primary icon.

- **ActiveAttendanceCard.tsx**: Entire card wrapped in `Card` component. Attendance status indicators (attended/missed) migrated to `Badge` (success/error variants). Mark attendance button migrated to `Button variant="primary"`. Lesson number uses `Badge variant="brand"`.

- **CurrentAssignmentSection.tsx**: Wrapped in `Card`. Assignment status badges (approved/expired/overdue/submitted/active) use `Badge` with appropriate variant. Submit assignment button uses `Button variant="primary" fullWidth`. Tab switcher and submission history preserved as-is.

- **AssignmentHistoryCard.tsx**: History cards use `Card variant="bordered"` with dynamic border on expand. Status chips migrated to `Badge`. Resubmit button uses `Button variant="primary" size="sm"`. Expand/collapse behavior preserved.

- **QuizSection.tsx**: Start quiz CTA buttons migrated to `Button variant="primary"` and `Button variant="secondary"`. Previous attempt pass/fail status uses `Badge variant="success"|"error"`. Full-screen overlay modes (article/solving/results/review) kept as raw portal — they are immersive experiences outside the normal layout flow.

- **SubmissionModal.tsx**: Replaced raw `createPortal` overlay with `Modal` component. Submit button uses `Button variant="primary" loading`. Cancel button uses `Button variant="ghost"`. Footer passed via `footer` prop slot.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written.

### Scope Notes

- QuizSection overlay modes (solving, article, results, review) were not wrapped in Card because they are full-screen portal experiences that occupy the entire viewport. Only the info-mode CTA section and attempt list were migrated.
- SubmissionModal's `createPortal` call was replaced by the `Modal` component which handles portaling internally.

## Known Stubs

None — all data is wired from existing LessonsContext.

## Self-Check

### Files Exist

- FOUND: src/features/lessons/LessonsContent.tsx
- FOUND: src/features/lessons/ActiveAttendanceCard.tsx
- FOUND: src/features/lessons/CurrentAssignmentSection.tsx
- FOUND: src/features/lessons/AssignmentHistoryCard.tsx
- FOUND: src/features/lessons/QuizSection.tsx
- FOUND: src/features/lessons/SubmissionModal.tsx

### Commits Exist

- FOUND: 243f2d3 feat(03-03): redesign LessonsContent and ActiveAttendanceCard
- FOUND: 9849def feat(03-03): migrate assignment cards, quiz section, and submission modal

## Self-Check: PASSED
