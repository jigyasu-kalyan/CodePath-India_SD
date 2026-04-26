# Sequence Diagram — Code Submission Flow

## Overview
Illustrates the complete interaction flow when a student submits a solution — covering JWT authentication, Judge0 execution loop, verdict evaluation, leaderboard update, and badge awarding.

## Diagram

```mermaid
sequenceDiagram
    actor Student
    participant Frontend as Frontend (React)
    participant AuthMiddleware as Auth Middleware
    participant SubmissionAPI as Submission API
    participant Judge0 as Judge0 Service
    participant DB as MySQL (Prisma)
    participant Leaderboard as Leaderboard Service

    Student->>Frontend: Write code & click Submit
    Frontend->>AuthMiddleware: POST /api/submissions/submit (JWT)
    AuthMiddleware->>AuthMiddleware: Verify JWT token
    AuthMiddleware-->>Frontend: 401 Unauthorized (if invalid)

    AuthMiddleware->>SubmissionAPI: Forward request (userId, code, lang, challengeId)
    SubmissionAPI->>DB: Fetch challenge & test cases
    DB-->>SubmissionAPI: Challenge data + test cases

    loop For each test case
        SubmissionAPI->>Judge0: POST /submissions (code, input, lang)
        Judge0-->>SubmissionAPI: token (submission queued)
        SubmissionAPI->>Judge0: GET /submissions/{token} (poll result)
        Judge0-->>SubmissionAPI: TestResult (stdout, stderr, status)
    end

    SubmissionAPI->>SubmissionAPI: Evaluate all test results
    SubmissionAPI->>DB: Save Submission record (status, runtime, memory)
    DB-->>SubmissionAPI: Saved Submission

    alt All test cases passed
        SubmissionAPI->>DB: Update Student.solvedCount & rating
        SubmissionAPI->>Leaderboard: updateScore(studentId, newRating)
        Leaderboard->>DB: Upsert leaderboard entry
        Leaderboard-->>SubmissionAPI: Updated rank
        SubmissionAPI->>DB: Check badge eligibility
        DB-->>SubmissionAPI: Badge awarded (if milestone reached)
    end

    SubmissionAPI-->>Frontend: Submission result (verdict, runtime, memory, rank)
    Frontend-->>Student: Display result (Accepted / Wrong Answer / TLE)
```

## Flow Summary
| Step | Component | Action |
|------|-----------|--------|
| 1 | Frontend | Sends JWT + code to backend |
| 2 | Auth Middleware | Validates JWT, blocks if invalid |
| 3 | Submission API | Fetches challenge + test cases from DB |
| 4 | Judge0 (loop) | Executes code against each test case |
| 5 | Submission API | Evaluates all results, saves submission |
| 6 | Leaderboard Service | Updates score and rank if Accepted |
| 7 | Badge Service | Awards badge if milestone reached |
| 8 | Frontend | Displays final verdict to student |

## Design Patterns Visible
- **Observer Pattern** — Leaderboard and Badge services are notified after verdict (decoupled from SubmissionAPI)
- **Strategy Pattern** — Judge0 is a swappable execution strategy
- **Middleware Chain** — Auth middleware sits between client and business logic