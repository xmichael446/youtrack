# YouTrack API Documentation

**Base URL:** `https://yt-api.xmichael446.com`
**Auth header (authenticated endpoints):** `Authorization: Bearer <access_token>`
**Content-Type:** `application/json` for all endpoints

---

## Authentication

All student-facing endpoints (except the login/auth flow) require an Enrollment JWT. The JWT carries `enrollment_id`, not `user_id` — no `student_code` is needed in request bodies once authenticated.

**Common errors for all authenticated endpoints:**
- `401 Unauthorized` — missing, invalid, or expired token
- `403 Forbidden` — token lacks `enrollment_id` claim or enrollment is inactive

---

### `POST /api/login/`

Pre-auth check. Validates that a student code exists before initiating the login flow.

**Public — no auth required.**

**Request**
```json
{ "student_code": "YT-E123456" }
```

**Response 200**
```json
{ "success": true, "message": "ok" }
```

**Errors:** `400` missing field · `404` not found

---

### `POST /api/auth/init/`

Starts a login session. Returns a Telegram deep link for the student to tap.

**Public — no auth required.**

**Request**
```json
{ "access_code": "YT-E123456" }
```

**Response 200**
```json
{
  "success": true,
  "start_param": "a4f9b2e1c8d7f6a3b9e2d5c8f1a4b7e9",
  "deep_link": "https://t.me/ytrck_bot?start=a4f9b2e1c8d7f6a3b9e2d5c8f1a4b7e9",
  "expires_at": "2026-02-23T10:05:00Z"
}
```

Session expires in **5 minutes**. `start_param` is a cryptographically random 32-char token.

**Errors:** `400` missing field · `404` invalid access code

---

### `POST /api/auth/confirm/`

Called by the Telegram bot when the student taps the deep link. Verifies HMAC signature and marks the session confirmed.

**Public — bot-only, HMAC-protected.**

**Request**
```json
{
  "start_param": "a4f9b2e1c8d7f6a3b9e2d5c8f1a4b7e9",
  "telegram_user_id": "123456789",
  "verification_hash": "<sha256-hmac>"
}
```

The `verification_hash` is `HMAC-SHA256(BOT_SECRET, start_param + telegram_user_id)`.

**Response 200**
```json
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

**Errors:** `403` bad HMAC / user ID mismatch / no linked account · `404` session or enrollment not found · `400` expired / already used

---

### `POST /api/auth/verify/`

Long-polls (up to 30 s) until the bot confirms the session, then issues JWT tokens.

**Public — no auth required.**

**Request**
```json
{
  "start_param": "a4f9b2e1c8d7f6a3b9e2d5c8f1a4b7e9",
  "access_code": "YT-E123456"
}
```

**Response 200**
```json
{
  "success": true,
  "access": "<jwt-access-token>",
  "refresh": "<jwt-refresh-token>"
}
```

JWT access token claims: `enrollment_id`, `student_code`, `telegram_user_id`, `course_id`.
Access token lifetime: **4 hours**. Refresh token: **7 days**.

**Errors:** `400` missing fields / expired / already used · `404` session or enrollment not found · `408` bot did not confirm within 30 s

---

### `POST /api/auth/token/refresh/`

Standard SimpleJWT token refresh.

**Request:** `{ "refresh": "<jwt-refresh-token>" }`
**Response 200:** `{ "access": "<new-jwt-access-token>" }`

---

### `POST /api/auth/token/verify/`

Checks whether an access token is still valid.

**Request:** `{ "token": "<jwt-access-token>" }`
**Response 200** — empty body (valid) · **401** — invalid or expired

---

## Student Views

---

### `POST /api/dashboard/`

Returns the student's full enrollment profile and course stats.

**Request** — empty body

**Response 200**
```json
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
        { "id": 10, "number": 10, "topic": "Lesson 10", "start_datetime": "...", "duration": "01:00:00", "status": "attended" }
      ]
    }
  }
}
```

---

### `POST /api/leaderboard/`

Returns group and course leaderboards plus the student's own weekly stats.

**Request** — empty body

**Response 200**
```json
{
  "success": true,
  "data": {
    "enrollment": { "rank": 3, "week_points": 40, "total_points": 350 },
    "group": [
      { "rank": 1, "full_name": "Bobur Yusupov", "total_points": 500, "last_rank": 2 }
    ],
    "course": [
      { "id": 1, "full_name": "Bobur Yusupov", "total_points": 500, "rank": 1, "last_rank": 2 }
    ]
  }
}
```

Group leaderboard: top 20 of the student's own group.
Course leaderboard: top 20 across all groups in the course.

---

### `POST /api/lessons/`

Returns the current attendance track, the active submittable assignment, all previous assignments with submission history, and the vocabulary quiz linked to the current lesson (if one exists).

**Request** — empty body

**Response 200**
```json
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
        "submissions": []
      },
      "previous": []
    },
    "quiz": {
      "session_id": 7,
      "vocab_level": "advanced",
      "passing_score": 4,
      "question_count": 5,
      "questions": [
        {
          "id": 101,
          "word": "ephemeral",
          "question_text": "Which word is closest in meaning to 'ephemeral'?",
          "option_a": "permanent",
          "option_b": "transient",
          "option_c": "ancient",
          "option_d": "joyful"
        }
      ],
      "previous_attempts": [
        {
          "id": 3,
          "score": 4,
          "total": 5,
          "created_at": "2026-03-09T10:00:00+05:00"
        }
      ]
    }
  }
}
```

`attendance.status` values:
- `null` — track is open (can still mark) or upcoming
- `"attended"` — student marked attendance
- `"absent"` — window closed, student did not attend

`assignments.current` is `null` when there is no submittable assignment.

`quiz` is `null` when no ready quiz session is linked to the current lesson. The quiz object includes all questions **without** correct answers. Use `passing_score` to show the student what score they need to earn points. `previous_attempts` shows their attempt history so you can conditionally show a retake UI.

The quiz is resolved from the current lesson in this priority order:
1. The lesson of the active attendance track
2. The lesson of the nearest submittable assignment

---

### `POST /api/attendance/mark/`

Marks the student present for a session using the keyword shown in class.

**Request**
```json
{ "track_id": 5, "keyword": "harbor" }
```

**Response 200**
```json
{
  "success": true,
  "data": { "xp": 10, "coins": 5, "message": "Attendance marked successfully" }
}
```

**Errors:** `400` missing fields / wrong keyword / already marked

---

### `POST /api/quiz/submit/`

Submit answers for the quiz session received from `/api/lessons/`. Creates a completed `Attempt` with all `UserAnswer` records. Awards a `PointEntry` on the **first attempt where `score >= passing_score`** (using `YTInstance.quiz_reason`). If `passing_score` is `0`, points are always awarded on the first attempt.

**Request**
```json
{
  "session_id": 7,
  "answers": [
    { "question_id": 101, "selected_option": "B" },
    { "question_id": 102, "selected_option": "A" }
  ]
}
```

`selected_option` is one of `"A"`, `"B"`, `"C"`, `"D"` (case-insensitive). Answers with an unrecognized `question_id` or invalid option are silently skipped.

**Response 200**
```json
{
  "success": true,
  "data": {
    "attempt_id": 12,
    "score": 4,
    "total": 5,
    "passing_score": 4,
    "passed": true,
    "is_first_attempt": true,
    "points_awarded": true,
    "xp": 10,
    "coins": 5,
    "results": [
      {
        "question_id": 101,
        "word": "ephemeral",
        "selected_option": "B",
        "correct_option": "B",
        "is_correct": true,
        "explanation": "'Ephemeral' means lasting for a very short time, making 'transient' the closest synonym."
      }
    ]
  }
}
```

| Field | Description |
|---|---|
| `passed` | `true` if `score >= passing_score` (or `passing_score` is `0`) |
| `is_first_attempt` | `true` if this is the enrollment's first completed attempt for this session |
| `points_awarded` | `true` if a `PointEntry` was created — only on first passing attempt when `quiz_reason` is configured |
| `results` | Per-question breakdown with correct answers and explanations revealed |

Retakes are always allowed and create a new `Attempt`, but points are only awarded once.

**Errors:** `400` missing `session_id` · `404` session not found or not ready

---

### `POST /api/shop/`

Returns available rewards (with claimed flag) and the student's last 10 point transactions.

**Request** — empty body

**Response 200**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": 1,
        "name": "Sticker Pack",
        "description": "Cool stickers",
        "image": "/media/rewards/stickers.png",
        "cost": 50,
        "claimed": false
      }
    ],
    "transactions": [
      {
        "datetime": "2026-02-23T18:00:00Z",
        "reason": "Attendance",
        "xp": 10,
        "coins": 5,
        "negative": false
      }
    ]
  }
}
```

---

### `POST /api/claim-reward/`

Redeems a reward, deducting coins from the student's balance.

**Request:** `{ "reward_id": 1 }`

**Response 200:** `{ "success": true, "message": "Reward claimed" }`

**Errors:** `400` missing field / already claimed / insufficient balance · `404` reward not found

---

### `POST /api/notifications/`

Returns today's notifications for the student. Marks `SCHEDULED` notifications as `SENT`.

**Request** — empty body

**Response 200**
```json
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

Marks a notification as read for the authenticated student.

**Request:** `{ "notification_id": 10 }`

**Response 200:** `{ "success": true }`

**Errors:** `400` missing field · `404` not found or belongs to a different student

---

## Bot Endpoints

---

### `POST /api/bot/submit-assignment/`

Submits homework for an assignment. Requires a valid student JWT.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `assignment_id` | integer | Yes | ID of the assignment |
| `comment` | string | No | Student's note to teacher |
| `attachments` | JSON array | No | Attachment metadata (max 5) |
| `files` | file[] | No | Uploaded files — count must match non-link attachments |

Attachment object: `{ "type": "file|image|link", "name": "My Work", "url": "https://..." }`
`url` required only when `type` is `"link"`.

**Response 201**
```json
{ "success": true, "message": "Homework submitted successfully", "submission_id": 42 }
```

**Errors:** `400` validation failure (max 5 attempts, already awaiting/approved, count mismatch) · `401` invalid token
