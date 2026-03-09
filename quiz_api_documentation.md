# Quiz API Documentation

Base path: `/api/quiz/`

All endpoints require a valid **Enrollment JWT** token in the `Authorization` header:
```
Authorization: Bearer <enrollment_access_token>
```

All requests and responses use `Content-Type: application/json`.

---

## GET QUIZ

**`POST /api/quiz/get/`**

Fetch the quiz session linked to a lesson, including all questions (without revealing correct answers). Also returns the enrollment's previous completed attempts for this session.

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `lesson_id` | integer | Yes | ID of the `ScheduledLesson` to fetch the quiz for. |

```json
{
    "lesson_id": 42
}
```

### Response — 200 OK

```json
{
    "success": true,
    "data": {
        "session_id": 7,
        "vocab_level": "B2",
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
```

Note: Correct answers are **not** included in this response. They are only returned in the submit response.

### Response — 400 Bad Request

Returned when `lesson_id` is missing.

```json
{
    "success": false,
    "message": "lesson_id is required"
}
```

### Response — 404 Not Found

Returned when no ready quiz session exists for the given lesson.

```json
{
    "success": false,
    "message": "No quiz available for this lesson"
}
```

---

## SUBMIT QUIZ

**`POST /api/quiz/submit/`**

Submit answers for a quiz session. Creates a completed `Attempt` with all `UserAnswer` records. On the first completed attempt by this enrollment, awards a `PointEntry` using the `YTInstance.quiz_reason` configured for the course owner.

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | integer | Yes | ID of the `QuizSession` to submit answers for. |
| `answers` | array | Yes | List of answer objects (see below). |

Each item in `answers`:

| Field | Type | Required | Description |
|---|---|---|---|
| `question_id` | integer | Yes | ID of the `Question` being answered. |
| `selected_option` | string | Yes | One of `"A"`, `"B"`, `"C"`, `"D"`. Case-insensitive. |

```json
{
    "session_id": 7,
    "answers": [
        {"question_id": 101, "selected_option": "B"},
        {"question_id": 102, "selected_option": "A"},
        {"question_id": 103, "selected_option": "D"}
    ]
}
```

### Response — 200 OK

```json
{
    "success": true,
    "data": {
        "attempt_id": 12,
        "score": 2,
        "total": 3,
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
            },
            {
                "question_id": 102,
                "word": "verbose",
                "selected_option": "A",
                "correct_option": "C",
                "is_correct": false,
                "explanation": "'Verbose' means using more words than needed; 'wordy' is the correct synonym."
            }
        ]
    }
}
```

#### Response Fields

| Field | Type | Description |
|---|---|---|
| `attempt_id` | integer | ID of the created `Attempt`. |
| `score` | integer | Number of correct answers. |
| `total` | integer | Total number of questions in the session. |
| `is_first_attempt` | boolean | `true` if this is the enrollment's first completed attempt for this session. |
| `points_awarded` | boolean | `true` if a `PointEntry` was created (only possible on first attempt when `quiz_reason` is configured). |
| `xp` | integer | XP awarded (`PointReason.default_points`). `0` if no points were awarded. |
| `coins` | integer | Coins awarded (`PointReason.default_coins`). `0` if no points were awarded. |
| `results` | array | Per-question breakdown showing selected option, correct option, correctness, and explanation. |

### Points Logic

- Points are awarded only once per enrollment per session (on the first completed attempt).
- The `quiz_reason` is read from the `YTInstance` whose `admin` matches `enrollment.group.course.created_by`.
- If no `YTInstance` exists for the course owner, or `quiz_reason` is unset, no points are awarded and `points_awarded` will be `false`.

### Response — 400 Bad Request

Returned when `session_id` is missing.

```json
{
    "success": false,
    "message": "session_id is required"
}
```

### Response — 404 Not Found

Returned when the session does not exist or is not in `READY` status.

```json
{
    "success": false,
    "message": "Quiz session not found"
}
```

---

## Notes for Frontend

- Always call `GET /api/quiz/get/` first to retrieve the `session_id` and questions before submitting.
- `previous_attempts` in the get response lets you show a history of past scores without re-fetching.
- Answers with an unrecognized `question_id` or invalid `selected_option` are silently skipped. Validate on the client before submitting.
- Retakes are allowed: re-submitting the same session creates a new `Attempt`, but points will only be awarded once (`is_first_attempt: false` on subsequent submissions).
