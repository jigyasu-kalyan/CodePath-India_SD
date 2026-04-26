# ER Diagram — CodePath India

## Overview
Shows all database tables, their fields with data types, primary/foreign keys, and the relationships between entities including junction tables for many-to-many relationships.

## Diagram

```mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string passwordHash
        enum role
        timestamp createdAt
        timestamp updatedAt
    }

    STUDENT {
        uuid id PK
        uuid userId FK
        int solvedCount
        int streak
        float rating
        timestamp lastActive
    }

    TEACHER {
        uuid id PK
        uuid userId FK
        string department
    }

    ADMIN {
        uuid id PK
        uuid userId FK
        json permissions
    }

    CHALLENGE {
        uuid id PK
        string title
        text description
        enum difficulty
        string[] tags
        enum type
        timestamp createdAt
        uuid createdBy FK
    }

    TEST_CASE {
        uuid id PK
        uuid challengeId FK
        text input
        text expectedOutput
        int timeLimit
        int memoryLimit
    }

    SUBMISSION {
        uuid id PK
        uuid studentId FK
        uuid challengeId FK
        text code
        enum language
        enum status
        int runtime
        int memory
        timestamp submittedAt
    }

    CLASSROOM {
        uuid id PK
        uuid teacherId FK
        string name
        string joinCode UK
        timestamp createdAt
    }

    CLASSROOM_STUDENT {
        uuid classroomId FK
        uuid studentId FK
        timestamp joinedAt
    }

    LEADERBOARD_ENTRY {
        uuid id PK
        uuid studentId FK
        int rank
        float score
        int totalSolved
        timestamp updatedAt
    }

    BADGE {
        uuid id PK
        string name
        string description
        int milestone
        string iconUrl
    }

    STUDENT_BADGE {
        uuid studentId FK
        uuid badgeId FK
        timestamp awardedAt
    }

    USER ||--o| STUDENT : "has"
    USER ||--o| TEACHER : "has"
    USER ||--o| ADMIN : "has"

    STUDENT ||--o{ SUBMISSION : "submits"
    STUDENT }o--o{ CLASSROOM : "joins via"
    CLASSROOM_STUDENT }o--|| CLASSROOM : ""
    CLASSROOM_STUDENT }o--|| STUDENT : ""

    TEACHER ||--o{ CLASSROOM : "creates"

    CHALLENGE ||--o{ SUBMISSION : "has"
    CHALLENGE ||--o{ TEST_CASE : "contains"

    STUDENT ||--o{ LEADERBOARD_ENTRY : "ranked in"
    STUDENT }o--o{ BADGE : "earns via"
    STUDENT_BADGE }o--|| STUDENT : ""
    STUDENT_BADGE }o--|| BADGE : ""

    ADMIN ||--o{ CHALLENGE : "manages"
```

## Table Summary
| Table | Type | Purpose |
|-------|------|---------|
| USER | Core | Base identity for all roles |
| STUDENT | Core | Student-specific data |
| TEACHER | Core | Teacher-specific data |
| ADMIN | Core | Admin-specific data |
| CHALLENGE | Core | Problem/challenge data |
| TEST_CASE | Core | Input/output pairs for judging |
| SUBMISSION | Core | Student code submissions |
| CLASSROOM | Core | Teacher-created classrooms |
| LEADERBOARD_ENTRY | Core | Per-student ranking data |
| BADGE | Core | Achievement definitions |
| CLASSROOM_STUDENT | Junction | Many-to-many: students ↔ classrooms |
| STUDENT_BADGE | Junction | Many-to-many: students ↔ badges |

## Notes
- `USER` table uses a **single-table strategy** — role field determines subtype
- `CLASSROOM_STUDENT` and `STUDENT_BADGE` are explicit junction tables for M:N relationships
- `joinCode` on CLASSROOM is unique — used for student enrollment
- All PKs are UUIDs for distributed-safe ID generation