# YouTrack API Documentation

**Base URL:** `https://yt-api.xmichael446.com`
**Auth:** `Authorization: Bearer <access_token>` on all authenticated endpoints
**Content-Type:** `application/json`

All authenticated endpoints return `401` on missing/expired token and `403` if the enrollment is inactive.

---

## Auth

### `POST /api/login/`
Pre-flight check — validates a student code exists before starting the login flow. Public.

```json
// Request
{ "student_code": "YT-E123456" }

// 200
{ "success": true, "message": "ok" }
```
Errors: `400` missing field · `404` not found

---

### `POST /api/auth/init/`
Starts a login session. Returns a Telegram deep link for the student to tap. Public.

```json
// Request
{ "access_code": "YT-E123456" }

// 200
{
  "success": true,
  "start_param": "a4f9b2e1c8d7f6a3b9e2d5c8f1a4b7e9",
  "deep_link": "https://t.me/ytrck_bot?start=a4f9b2e1c8d7f6a3b9e2d5c8f1a4b7e9",
  "expires_at": "2026-02-23T10:05:00Z"
}
```
Session expires in **5 minutes**. Errors: `400` missing field · `404` invalid code

---

### `POST /api/auth/confirm/`
Called by the Telegram bot after the student taps the deep link. HMAC-protected — bot only.

`verification_hash` = `HMAC-SHA256(BOT_SECRET, start_param + telegram_user_id)`

```json
// Request
{
  "start_param": "a4f9b2e1c8d7f6a3b9e2d5c8f1a4b7e9",
  "telegram_user_id": "123456789",
  "verification_hash": "<hmac>"
}

// 200
{
  "success": true,
  "message": "Authentication confirmed",
  "data": {
    "group_chat_id": "-100123456",
    "channel_chat_id": "-100789012",
    "access_code": "YT-E123456"
  }
}
```
Errors: `400` expired/used · `403` bad HMAC or user ID mismatch · `404` session not found

---

### `POST /api/auth/verify/`
Long-polls (up to 30 s) until the bot confirms, then issues JWT tokens. Public.

```json
// Request
{ "start_param": "a4f9b2e1c8d7f6a3b9e2d5c8f1a4b7e9", "access_code": "YT-E123456" }

// 200
{ "success": true, "access": "<jwt>", "refresh": "<jwt>" }
```
Access token lifetime: **4 hours**. Refresh: **7 days**.
Claims: `enrollment_id`, `student_code`, `telegram_user_id`, `course_id`.
Errors: `400` missing/expired/used · `404` not found · `408` bot timeout (30 s)

---

### `POST /api/auth/token/refresh/`
```json
// Request  { "refresh": "<jwt>" }
// 200      { "access": "<new-jwt>" }
```

### `POST /api/auth/token/verify/`
```json
// Request  { "token": "<jwt>" }
// 200 — empty (valid)  |  401 — invalid or expired
```

---

## Student

### `POST /api/dashboard/`
Full enrollment profile and course stats. Empty request body.

```json
// 200
{
  "success": true,
  "data": {
    "enrollment": {
      "id": 1,
      "full_name": "Ali Karimov",
      "access_code": "YT-E123456",
      "total_points": 350,
      "balance": 120,
      "rank": 3,
      "last_rank": 5,
      "group_rank": 1,
      "last_group_rank": 2,
      "streak": 7,
      "level": {
        "number": 7,
        "name": "Enthusiast",
        "icon": "🔥",
        "badge_color": "#f87171",
        "description": "Passion fuels progress.",
        "xp_current": 5600,
        "xp_required": 5400,
        "xp_next": 7200,
        "progress_percent": 28.6
      },
      "course": {
        "name": "Python Bootcamp",
        "description": "...",
        "logo": "/media/course_logos/logo.png",
        "teachers": [
          { "name": "John Doe", "image": "/media/...", "channel_link": "https://t.me/..." }
        ],
        "days": { "passed": 10, "total": 60 },
        "attendance": { "percentage": 80.0, "marked": 8, "due": 10, "total": 20 },
        "assignments": { "percentage": 75.0, "approved": 6, "due": 8, "total": 20 },
        "completion": 77.5
      },
      "upcoming_lesson": {
        "id": 12,
        "number": 11,
        "topic": "Lesson 11",
        "starts": "2026-02-24T18:00:00Z"
      },
      "curriculum": [
        {
          "id": 10,
          "number": 10,
          "topic": "Lesson 10",
          "start_datetime": "2026-02-23T18:00:00Z",
          "duration": "01:00:00",
          "status": "attended"
        }
      ]
    }
  }
}
```

`curriculum` returns up to 10 lessons centered around the next upcoming lesson (4 past + upcoming + future).
`curriculum[].status`: `"attended"` · `"absent"` · `null` (future or window still open)

---

### `POST /api/leaderboard/`
Group and course leaderboards plus the student's weekly stats. Empty request body.

```json
// 200
{
  "success": true,
  "data": {
    "enrollment": {
      "rank": 3,
      "group_rank": 1,
      "last_group_rank": 2,
      "week_points": 40,
      "total_points": 350,
      "streak": 7
    },
    "group": [
      {
        "id": 2,
        "rank": 1,
        "last_rank": 2,
        "full_name": "Bobur Yusupov",
        "total_points": 500,
        "streak": 12,
        "level": { "number": 8, "name": "Achiever", "icon": "⭐" }
      }
    ],
    "course": [
      {
        "id": 1,
        "full_name": "Bobur Yusupov",
        "total_points": 500,
        "rank": 1,
        "last_rank": 2,
        "streak": 12,
        "level": { "number": 8, "name": "Achiever", "icon": "⭐", "badge_color": "#fbbf24" }
      }
    ]
  }
}
```

- `group` — top 20 of the student's own group by `total_points` desc. Requesting student always included.
- `course` — top 20 across all groups by stored `rank` asc. Requesting student always included.
- `week_points` — XP earned in the last 7 days.
- `*.last_rank` — rank before the last points update. Use to show rank change arrows.
- `streak` — current consecutive-day activity streak. Resets if no PointEntry for a full calendar day (local timezone). Increments once per calendar day on first activity.
- `level` — compact level info (number, name, icon, badge_color) for display on leaderboard cards.

---

### Streak System

Each enrollment maintains a **streak** tracking consecutive days of activity. A "day" is a calendar day in the server's local timezone (`Asia/Tashkent`).

| Condition | Result |
|---|---|
| First PointEntry today, last activity was yesterday | Streak +1 |
| First PointEntry today, last activity was 2+ days ago | Streak resets to 1 |
| Already had activity today | Streak unchanged |
| No activity today yet | Streak preserved until end of day |
| No activity for a full calendar day | Streak resets to 0 (via nightly task) |

`streak` is returned in `enrollment` objects on both `/api/dashboard/` and `/api/leaderboard/`, and on each entry in `group` and `course` leaderboard arrays.

---

### `POST /api/lessons/`
Current attendance track, active assignment, all previous assignments with submission history, and any linked quiz per assignment. Empty request body.

```json
// 200
{
  "success": true,
  "data": {
    "attendance": {
      "track_id": 5,
      "lesson_topic": "Lesson 10",
      "number": 10,
      "opens_at": "2026-02-23T18:00:00Z",
      "closes_at": "2026-02-23T19:00:00Z",
      "status": null
    },
    "assignments": {
      "current": {
        "id": 3,
        "number": "10",
        "description": "Build a REST API",
        "lesson_topic": "Lesson 10",
        "start_datetime": "2026-02-23T18:00:00Z",
        "deadline": "2026-02-24T19:00:00Z",
        "attachments": [],
        "submissions": [],
        "quiz": {
          "session_id": 7,
          "vocab_level": "B2",
          "passing_score": 4,
          "question_count": 5,
          "already_awarded": false,
          "has_reviewed": false,
          "previous_attempts": [
            {
              "id": 3,
              "score": 4,
              "total": 5,
              "reviewed": false,
              "points_awarded": false,
              "created_at": "2026-03-09T10:00:00+05:00"
            }
          ]
        }
      },
      "previous": []
    }
  }
}
```

**`attendance.status` values:**

| Value | Meaning |
|---|---|
| `null` | Track is open — student has **not** marked yet. Show keyword entry UI. |
| `"marked"` | Track is open — student **already marked**. Disable entry UI. |
| `"attended"` | Track closed — student attended. |
| `"absent"` | Track closed — student missed it. |

`attendance` is `null` when no track has opened yet. `assignments.current` is `null` when no submittable assignment is open.

**`quiz`** (per assignment) is `null` when no session exists for that lesson:

| Field | Description |
|---|---|
| `session_id` | Pass to `/api/quiz/questions/` to fetch questions |
| `passing_score` | Minimum correct answers to earn points (`0` = always eligible) |
| `already_awarded` | Points already earned for this session — no further awards possible |
| `has_reviewed` | Student called review — **permanently disqualifies** from future rewards |
| `previous_attempts` | Past completed attempts with `id`, `score`, `total`, `reviewed`, `points_awarded`, `created_at` |

---

### `POST /api/attendance/mark/`
Marks the student present using the keyword shown in class.

```json
// Request
{ "track_id": 5, "keyword": "harbor" }

// 200
{ "success": true, "data": { "xp": 10, "coins": 5, "message": "Attendance marked successfully" } }
```

The attendance window must be currently open (`opens_at ≤ now ≤ closes_at`). Attempts outside the window are rejected.

Errors: `400` missing fields · `400` window not open · `400` wrong keyword · `400` already marked

---

### `POST /api/quiz/questions/`
Fetch questions for a quiz session. Call this when the student taps "Take Quiz". Options are randomly shuffled per request. Correct answers are **not** included here.

```json
// Request
{ "session_id": 7 }

// 200
{
  "success": true,
  "data": {
    "session_id": 7,
    "vocab_level": "B2",
    "passing_score": 4,
    "source_text": "The ephemeral beauty of cherry blossoms...",
    "questions": [
      {
        "id": 101,
        "word": "ephemeral",
        "question_text": "Which word is closest in meaning to 'ephemeral'?",
        "options": [
          { "id": 402, "content": "permanent" },
          { "id": 401, "content": "transient" },
          { "id": 403, "content": "ancient" },
          { "id": 404, "content": "joyful" }
        ]
      }
    ]
  }
}
```

Display `source_text` as the reading passage — questions are generated from it. Show `passing_score` as the student's target before they start.

Errors: `400` missing field · `404` session not found or not ready

---

### `POST /api/quiz/submit/`
Submit answers. Creates a completed attempt and awards points on the first passing attempt (if the student has not yet reviewed this session).

```json
// Request
{
  "session_id": 7,
  "answers": [
    { "question_id": 101, "option_id": 401 }
  ]
}

// 200
{
  "success": true,
  "data": {
    "attempt_id": 12,
    "score": 4,
    "total": 5,
    "passing_score": 4,
    "passed": true,
    "already_awarded": false,
    "has_reviewed": false,
    "points_awarded": true,
    "xp": 10,
    "coins": 5
  }
}
```

| Field | Description |
|---|---|
| `passed` | `true` if `score >= passing_score` (or `passing_score` is `0`) |
| `already_awarded` | Prior attempt already earned points — no further awards |
| `has_reviewed` | Student reviewed — **permanently disqualifies from future rewards** |
| `points_awarded` | Points awarded in this attempt |
| `xp` / `coins` | Reward values. Both `0` when not awarded |

Points are awarded when `score >= passing_score` AND `already_awarded = false` AND `has_reviewed = false`. Retakes always create a new attempt. Answers with unrecognized IDs are silently skipped.

Errors: `400` missing field · `404` session not found or not ready

---

### `POST /api/quiz/review/`
Retrieve full results for a completed attempt — correct answers, explanations, and the student's selected option. Marks the attempt as reviewed.

> **Warning:** calling this permanently disqualifies the enrollment from earning points on this session. Warn the student before they confirm.

```json
// Request
{ "attempt_id": 12 }

// 200
{
  "success": true,
  "data": {
    "attempt_id": 12,
    "score": 4,
    "total": 5,
    "passing_score": 4,
    "passed": true,
    "points_awarded": true,
    "reviewed": true,
    "answers": [
      {
        "question_id": 101,
        "word": "ephemeral",
        "question_text": "Which word is closest in meaning to 'ephemeral'?",
        "options": [
          { "id": 401, "content": "transient", "is_correct": true },
          { "id": 402, "content": "permanent", "is_correct": false },
          { "id": 403, "content": "ancient", "is_correct": false },
          { "id": 404, "content": "joyful", "is_correct": false }
        ],
        "selected_option_id": 401,
        "is_correct": true,
        "explanation": "'Ephemeral' means lasting for a very short time, making 'transient' the closest synonym."
      }
    ]
  }
}
```

Options are sorted by `id` (consistent order). Safe to call multiple times — disqualification is applied on the first call.

Errors: `400` missing field · `404` attempt not found or belongs to another enrollment

---

### `POST /api/shop/`
Available rewards (split into balance and level rewards) and the student's last 10 point transactions. Empty request body.

```json
// 200
{
  "success": true,
  "data": {
    "balance_rewards": [
      { "id": 1, "name": "Sticker Pack", "description": "Cool stickers", "image": "/media/rewards/stickers.png", "cost": 50, "claimed": false }
    ],
    "level_rewards": [
      {
        "id": 2,
        "name": "Exclusive Badge",
        "description": "Awarded to dedicated learners",
        "image": "/media/rewards/badge.png",
        "required_level": { "number": 5, "name": "Scholar", "icon": "🎓" },
        "unlocked": true,
        "granted": false
      }
    ],
    "transactions": [
      { "datetime": "2026-02-23T18:00:00Z", "reason": "Attendance", "xp": 10, "coins": 5, "negative": false }
    ]
  }
}
```

---

### `POST /api/claim-reward/`
Redeems a reward. Behaviour depends on the reward type:

- **Balance reward** (`is_level_reward: false`): deducts coins from `balance`.
- **Level reward** (`is_level_reward: true`): requires the student's current level ≥ `unlock_level`. No coins deducted.

```json
// Request  { "reward_id": 1 }
// 200      { "success": true, "message": "Reward claimed" }
```

Errors: `400` missing field · `400` already claimed · `400` insufficient balance (balance rewards) · `400` level too low (level rewards) · `404` reward not found

---

### `POST /api/notifications/`
Today's notifications for the student. Marks `SCHEDULED` notifications as `SENT`. Empty request body.

```json
// 200
[
  {
    "id": 10,
    "type": "lesson_times",
    "message_uz": "Dars boshlandi!",
    "message_en": "Your lesson starts in 1 hour.",
    "scheduled_datetime": "2026-02-23T17:00:00Z",
    "read": false
  }
]
```

---

### `POST /api/notifications/mark-read/`
Marks a notification as read.

```json
// Request  { "notification_id": 10 }
// 200      { "success": true }
```

Errors: `400` missing field · `404` not found or belongs to another student

---

## Profile

### `POST /api/profile/`
Returns the full profile of the authenticated student. Empty request body.

```json
// 200
{
  "success": true,
  "data": {
    "is_own_profile": true,
    "full_name": "Ali Karimov",
    "avatar": "/media/avatars/avatar_1.jpg",
    "bio": "Passionate about code.",
    "group_name": "Group A",
    "course_name": "Python Bootcamp",
    "level": {
      "number": 7,
      "name": "Enthusiast",
      "icon": "🔥",
      "badge_color": "#f87171",
      "description": "Passion fuels progress.",
      "xp_current": 5600,
      "xp_required": 5400,
      "xp_next": 7200,
      "progress_percent": 28.6
    },
    "rank": 3,
    "streak": 7,
    "longest_streak": 14,
    "stats": {
      "attendance_pct": 80.0,
      "assignment_pct": 75.0,
      "total_points": 350,
      "balance": 120
    },
    "achievements": [
      {
        "key": "first_login",
        "name": "First Steps",
        "description": "Logged in for the first time.",
        "icon": "👣",
        "rarity": "common",
        "earned_at": "2026-01-15T10:00:00+05:00"
      }
    ],
    "privacy": {
      "hide_balance": false,
      "hide_activity": false
    }
  }
}
```

- `level` is `null` if the enrollment has not been assigned a level.
- `avatar` is `null` if the student has not uploaded one.
- `stats.attendance_pct` and `stats.assignment_pct` are computed over due items only (opened/started before now).

---

### `POST /api/profile/view/`
Returns a peer student's profile. Both must belong to the same course. Privacy settings on the target are enforced.

```json
// Request
{ "enrollment_id": 42 }

// 200
{
  "success": true,
  "data": {
    "is_own_profile": false,
    "full_name": "Bobur Yusupov",
    "avatar": "/media/avatars/avatar_42.jpg",
    "bio": "Learning never stops.",
    "group_name": "Group B",
    "course_name": "Python Bootcamp",
    "level": { ... },
    "rank": 1,
    "streak": 12,
    "longest_streak": 20,
    "stats": {
      "attendance_pct": 90.0,
      "assignment_pct": 85.0,
      "total_points": 500,
      "balance": null
    },
    "achievements": [ ... ],
    "privacy": {
      "hide_balance": true,
      "hide_activity": false
    }
  }
}
```

**Privacy rules:**
- `hide_balance=true` — `stats.balance` is returned as `null`.
- `hide_activity=true` — `streak`, `longest_streak`, `stats.attendance_pct`, and `stats.assignment_pct` are omitted from the response entirely.

Errors: `400` missing `enrollment_id` · `404` student not found or outside your course

---

### `POST /api/profile/update/`
Updates the authenticated student's avatar and/or bio. Accepts `multipart/form-data`.

| Field | Type | Required | Constraints |
|---|---|---|---|
| `avatar` | file | No | JPEG / PNG / WebP, max 2 MB — resized to 256×256 JPEG before storage |
| `bio` | string | No | Plain text, max 280 chars; HTML tags are stripped automatically |

```json
// 200 — returns the full updated profile (same shape as /api/profile/)
{
  "success": true,
  "data": { ... }
}
```

Errors: `400` avatar exceeds 2 MB · `400` unsupported image format · `400` image processing failed · `400` bio exceeds 280 chars

---

### `POST /api/profile/privacy/`
Updates the privacy settings for the authenticated student.

```json
// Request
{ "hide_balance": true, "hide_activity": false }

// 200
{ "success": true }
```

Both fields are optional; omit to leave unchanged. Each must be a boolean when provided.

Errors: `400` non-boolean value

---

### `POST /api/profile/activity/`
Paginated point history (20 entries per page).
Defaults to the authenticated student's own history.
Peer history is allowed unless `hide_activity` is set.

```json
// Request
{ "page": 1, "enrollment_id": null }

// 200
{
  "success": true,
  "data": {
    "entries": [
      {
        "reason": "Attendance",
        "xp": 10,
        "coins": 5,
        "negative": false,
        "datetime": "2026-03-15T18:00:00+05:00"
      }
    ],
    "page": 1,
    "total_pages": 4,
    "has_next": true
  }
}
```

- `enrollment_id: null` (or omit) — own history.
- `enrollment_id: <int>` — peer's history; subject to course scoping and `hide_activity` check.

Errors: `400` invalid `enrollment_id` · `403` peer has hidden activity · `404` peer not found or outside your course

---

### `POST /api/profile/heatmap/`
Activity heatmap for the last 30 days. Only days with at least one PointEntry are included.
Defaults to the authenticated student. Peer viewing follows the same privacy rules as `/api/profile/activity/`.

```json
// Request
{ "enrollment_id": null }

// 200
{
  "success": true,
  "data": [
    { "date": "2026-02-15", "count": 3 },
    { "date": "2026-02-16", "count": 1 },
    { "date": "2026-03-01", "count": 5 }
  ]
}
```

- `date` — ISO 8601 date string (`YYYY-MM-DD`).
- `count` — number of point entries on that day.

Errors: `403` peer has hidden activity · `404` peer not found or outside your course

---

## Frontend Implementation Guide — Student Profile

This section walks frontend developers through building the complete Student Profile feature. It covers routing, data flow, component structure, and edge cases.

### Routing

| Route | View | Data source |
|---|---|---|
| `/profile` | Own profile | `POST /api/profile/` on mount |
| `/profile/:enrollmentId` | Peer profile | `POST /api/profile/view/` with `{ enrollment_id }` on mount |
| `/profile/edit` | Edit own profile | `POST /api/profile/update/` on submit |
| `/profile/settings` | Privacy settings | `POST /api/profile/privacy/` on submit |

The profile should also be reachable by tapping a student's name/avatar anywhere it appears (leaderboard, group list). Pass the `enrollment.id` to navigate to `/profile/:enrollmentId`.

When `enrollmentId` matches the authenticated student's own ID, redirect to `/profile` (or render as own profile — check `is_own_profile` in the response).

---

### Data Fetching Flow

```
Page mount
  │
  ├─ Own profile (/profile)
  │    └─ POST /api/profile/              → full profile data
  │    └─ POST /api/profile/heatmap/      → heatmap (parallel)
  │    └─ POST /api/profile/activity/     → first page of activity (parallel)
  │
  └─ Peer profile (/profile/:id)
       └─ POST /api/profile/view/         → { enrollment_id: id }
       └─ POST /api/profile/heatmap/      → { enrollment_id: id } (parallel)
       └─ POST /api/profile/activity/     → { enrollment_id: id, page: 1 } (parallel)
```

Fire all three requests in parallel on mount. The profile response contains everything for the hero, stats, level bar, and achievements sections. The heatmap and activity feed are independent and can render as they arrive.

**Important:** The heatmap and activity endpoints will return `403` if the peer has `hide_activity: true`. Check `data.privacy.hide_activity` from the profile response to decide whether to even call these — skip the requests and show nothing if hidden.

---

### Component Breakdown

Build these as separate components. Each maps to a visual section of the profile page:

#### 1. `ProfileHero`
The top banner area.

**Fields used:** `full_name`, `avatar`, `bio`, `group_name`, `course_name`, `rank`

**Rendering:**
- **Avatar**: Show `avatar` URL in a rounded image (e.g. 96×96px). If `null`, render the student's initials inside a colored circle. Derive the background color deterministically from the enrollment ID (e.g. `hsl(enrollmentId * 137 % 360, 60%, 50%)`).
- **Name & subtitle**: `full_name` as the heading. Below it: `group_name` and `course_name` in muted text.
- **Rank badge**: Show `rank` as "#3" if > 0. If `rank` is `0`, show nothing (unranked).
- **Bio**: Render below the name. If empty and `is_own_profile`, show a prompt: *"Tell your classmates about yourself!"* styled as a clickable placeholder that navigates to `/profile/edit`.
- **Edit button**: Only visible when `is_own_profile: true`. Navigates to `/profile/edit`.

#### 2. `StatsCards`
Three side-by-side cards (stack vertically on mobile).

**Fields used:** `stats.attendance_pct`, `stats.assignment_pct`, `stats.balance`, `stats.total_points`

| Card | Value | Visual |
|---|---|---|
| Attendance | `attendance_pct` | Circular progress ring (SVG). Ring color: green ≥80%, yellow ≥50%, red <50% |
| Assignments | `assignment_pct` | Same ring style |
| Coins | `balance` with `total_points` as a subtitle | Large number, coin icon. No ring. |

**Privacy handling for peer profiles:**
- If `stats.balance` is `null` → show "Hidden" in the coins card instead of a number.
- If `stats.attendance_pct` is missing (key absent from object) → the peer has `hide_activity` on. **Hide the entire Attendance and Assignments cards.** Show only the Coins card (or "Hidden" if that's also null). Do NOT show 0% — absence of the key means hidden, not zero.

**How to distinguish "hidden" from "zero":**
- `stats.attendance_pct` is a number (including `0.0`) → display it.
- `stats.attendance_pct` key is missing from the `stats` object → hidden, don't display.
- `stats.balance` is `null` → hidden. `stats.balance` is `0` → display 0.

#### 3. `LevelProgressBar`
A horizontal progress bar showing current level and XP progress toward the next level.

**Fields used:** `level` object

**Rendering:**
- If `level` is `null`: show *"No level yet — start earning XP!"* with an empty bar.
- Otherwise:
  - Left label: `level.icon` + `"Level " + level.number` + `level.name`
  - Bar fill: `level.progress_percent`% width, colored with `level.badge_color`
  - Right label: Next level number (`level.number + 1`), or "MAX" if `level.xp_next` is `null`
  - Below bar: `level.xp_current` / `level.xp_next` XP (or just `level.xp_current` XP if max level)

#### 4. `AchievementShowcase`
Horizontally scrollable row of badge icons.

**Fields used:** `achievements` array

**All possible achievement keys and their data:**

| Key | Icon | Name | Rarity |
|---|---|---|---|
| `streak_7` | 🔥 | On Fire | common |
| `streak_14` | ⚡ | Unstoppable | rare |
| `streak_30` | 👑 | Legendary Streak | legendary |
| `perfect_week` | 📅 | Perfect Week | rare |
| `hw_hero_5` | 📚 | Homework Hero | common |
| `hw_hero_10` | 🎓 | Assignment Master | epic |
| `first_blood` | 🏁 | First Blood | rare |
| `top_3` | 🏆 | Podium Finish | epic |
| `shopaholic_3` | 🛍️ | Shopaholic | common |
| `level_5` | ⭐ | Rising Star | rare |
| `level_10` | 💎 | Elite Scholar | legendary |

**Rendering:**
- Show earned badges as full-color icons. On tap/hover, show a tooltip with `name`, `description`, and `earned_at` formatted as a relative date (e.g. "3 days ago").
- Show unearned badges as greyed-out silhouettes with a lock icon. On tap/hover, show the `description` as the unlock condition. To know which badges are unearned, hardcode the full list of 11 keys above and diff against the `achievements` array from the API.
- **Rarity border colors** (suggested):
  - `common` → gray (`#9ca3af`)
  - `rare` → blue (`#3b82f6`)
  - `epic` → purple (`#8b5cf6`)
  - `legendary` → gold (`#f59e0b`)
- **Empty state**: If `achievements` is empty, show 3 locked badge placeholders with: *"Complete activities to earn badges!"*

#### 5. `ActivityHeatmap`
A GitHub-style grid for the last 30 days.

**Data source:** `POST /api/profile/heatmap/` → array of `{ date, count }`

**Rendering:**
- Build a 30-cell grid (today at the right end, 29 days ago at the left). Each cell = one calendar day.
- Fill in `count` from the API response. Days not in the response have count `0`.
- Color scale (suggested): 0 = `#e5e7eb` (light gray), 1-2 = `#bbf7d0`, 3-4 = `#4ade80`, 5+ = `#16a34a`.
- On hover/tap, show a tooltip: *"+{count} XP from {count} activities"* and the date.
- Label the first and last dates below the grid.
- **On mobile**: The grid still fits in 30 cells. Use a single row if space is tight, or wrap to 2 rows of 15.
- **Hidden state (peer)**: If `privacy.hide_activity` is `true`, do not render this component at all. Do not show an empty grid.

#### 6. `ActivityFeed`
A vertical list of recent point transactions with pagination.

**Data source:** `POST /api/profile/activity/` → paginated `entries` array

**Rendering per entry:**
- Icon: green up-arrow for positive, red down-arrow for `negative: true`
- Text: `reason` (e.g. "Attendance", "Claimed "Coffee Voucher"")
- Right side: `+{xp} XP, +{coins} coins` (or `-` for negatives)
- Subtitle: `datetime` formatted as relative ("2 hours ago") or absolute ("Mar 15, 18:00") depending on recency.
- **Load More button**: Visible when `has_next: true`. On tap, call `/api/profile/activity/` with `page: page + 1` and append results to the list. Hide button when `has_next: false`.
- **Empty state**: *"No activity yet. Attend lessons and complete assignments to start earning XP!"*
- **Hidden state (peer)**: If `privacy.hide_activity` is `true`, do not render this component. Do not show the empty state either.

---

### Profile Edit Screen (`/profile/edit`)

Only accessible when viewing own profile. Two fields:

**Avatar upload:**
- Show current avatar (or initials placeholder) with a camera/upload overlay icon.
- On tap, open the device file picker. Accept `image/jpeg, image/png, image/webp`.
- Client-side: preview the selected image immediately. Validate file size < 2 MB before uploading. Show an error toast if too large.
- Submit via `POST /api/profile/update/` as `multipart/form-data`. The field name is `avatar`.
- The server resizes to 256×256 JPEG. The response contains the updated `avatar` URL — use it to update the preview.

**Bio:**
- A textarea, max 280 characters. Show a live character counter (e.g. "42 / 280").
- Submit via the same `POST /api/profile/update/` request. The field name is `bio`. Can be sent together with `avatar` or alone.
- HTML tags are stripped server-side, so no need to sanitize on the client — but avoid rendering bio as raw HTML regardless.

**Submit flow:**
```
User taps "Save"
  → show loading spinner on button
  → POST /api/profile/update/ (multipart/form-data)
  → on 200: update local profile state, navigate back to /profile, show success toast
  → on 400: show error message from response.message
```

---

### Privacy Settings Screen (`/profile/settings`)

Two toggle switches:

| Toggle | Field | Effect explained to user |
|---|---|---|
| "Hide my coin balance" | `hide_balance` | "Other students won't see how many coins you have" |
| "Hide my activity details" | `hide_activity` | "Other students won't see your attendance rate, assignment stats, streak, or activity history" |

**Submit flow:**
```
User changes a toggle
  → POST /api/profile/privacy/ with { hide_balance: bool, hide_activity: bool }
  → on 200: show success toast
  → on 400: revert toggle, show error
```

Only send the changed field(s). Both are optional in the request.

---

### Linking Profiles from Other Screens

Profiles should be accessible from any screen that shows a student's name or avatar. Add tap handlers on:

| Screen | Element | Action |
|---|---|---|
| Leaderboard (group list) | Student name/row | Navigate to `/profile/{enrollment.id}` |
| Leaderboard (course list) | Student name/row | Navigate to `/profile/{enrollment.id}` |

Both the group and course leaderboard arrays include `id` (the enrollment ID). Use it to navigate to `/profile/{id}` on tap.

---

### Error Handling

| HTTP Status | Meaning | Frontend Action |
|---|---|---|
| `400` | Validation error (bad input) | Show `response.message` as an inline error or toast |
| `401` | Token expired | Trigger token refresh flow, retry the request |
| `403` | Peer has hidden their activity | Don't show activity/heatmap sections. You should already know this from the profile response's `privacy` object |
| `404` | Student not found or not in your course | Show a "Student not found" screen with a back button |

---

### Empty State Summary

| Condition | What to show |
|---|---|
| No avatar | Initials circle with deterministic color |
| No bio (own profile) | Clickable placeholder: *"Tell your classmates about yourself!"* |
| No bio (peer profile) | Muted text: *"This student hasn't written a bio yet"* |
| No level assigned | Empty progress bar with: *"No level yet — start earning XP!"* |
| 0% attendance (not hidden) | Show 0% in the ring — it's real data, not an error |
| No assignments exist in course | Show *"No assignments yet"* instead of 0% |
| No achievements earned | 3 locked badge placeholders: *"Complete activities to earn badges!"* |
| No activity entries | *"No activity yet. Attend lessons and complete assignments to start earning XP!"* |
| Empty heatmap (no entries in 30 days) | All cells are the empty color (`#e5e7eb`). No special message needed. |

---

## Bot

### `POST /api/bot/submit-assignment/`
Submits homework. Requires a valid student JWT. `multipart/form-data`.

| Field | Type | Required | Description |
|---|---|---|---|
| `assignment_id` | integer | Yes | Assignment ID |
| `comment` | string | No | Student note |
| `attachments` | JSON array | No | Attachment metadata (max 5) |
| `files` | file[] | No | Uploaded files — count must match non-link attachment objects |

Attachment object: `{ "type": "file|image|link", "name": "My Work", "url": "https://..." }` — `url` only required when `type` is `"link"`.

```json
// 201
{ "success": true, "message": "Homework submitted successfully", "submission_id": 42 }
```

Errors: `400` max attempts reached / already awaiting or approved / file count mismatch · `401` invalid token
