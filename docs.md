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
