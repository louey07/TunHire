# TunHire Core Service — API Reference

Canonical reference for frontend integration. Generated from `core-service` controllers, DTOs, and entities.

**Base URL (local):** `http://localhost:8181`  
**Frontend env:** `NEXT_PUBLIC_API_URL=http://localhost:8181` (see `frontend/.env.example`)  
**Auth header:** `Authorization: Bearer <jwt_token>`  
**CORS:** `http://localhost:3000`

---

## Conventions

### Response envelopes (important)

Two patterns exist — handle both in the frontend:

| Pattern | Used by | Shape |
|---------|---------|-------|
| **Wrapped** | Auth, Applications, Companies, Jobs | `{ success: boolean, message: string, data: T }` |
| **Raw** | Candidates, Company Members | Direct JSON body (no `success` / `data` wrapper) |

**Success (wrapped):**
```json
{ "success": true, "message": "Job created", "data": { ... } }
```

**Error (validation / business logic):**
```json
{ "timestamp": "2026-05-24T19:00:00Z", "status": 400, "error": "Bad Request", "message": "Title is required", "path": "/jobs" }
```

**204 No Content:** `DELETE /candidates/me/skills/{id}`, `DELETE /companies/{companyId}/members/{userId}`

### Date / time types (JSON)

| Java type | JSON example | Fields |
|-----------|--------------|--------|
| `Instant` | `"2026-05-24T19:00:00.123456Z"` | `createdAt`, `updatedAt`, `expiresAt` |
| `LocalDateTime` | `"2026-05-24T19:00:00"` | `joinedAt` (membership) |
| `LocalDate` | `"2026-05-24"` | `availableFrom` (candidate profile) |

### Pagination (`GET /jobs`)

Spring `Page<JobResponse>` inside `data`:

```json
{
  "success": true,
  "message": "Jobs fetched",
  "data": {
    "content": [ /* JobResponse[] */ ],
    "totalElements": 42,
    "totalPages": 5,
    "size": 10,
    "number": 0,
    "first": true,
    "last": false,
    "empty": false
  }
}
```

### Public vs authenticated routes

| Public (no token) | Notes |
|-------------------|-------|
| `POST /auth/register`, `POST /auth/login` | |
| `GET /jobs`, `GET /jobs/{id}` | List returns **OPEN** jobs only |
| `GET /companies/{id}`, `GET /companies/slug/{slug}` | |
| `GET /applications/{id}` | |
| `GET /applications?jobId=` or `?userId=` | Returns `[]` if neither param |

All other routes require a valid JWT.

---

## Enums

### `Role` (user account — auth)

| Value | Description |
|-------|-------------|
| `CANDIDATE` | Job seeker |
| `RECRUITER` | Company recruiter |
| `ADMIN` | Platform admin |

### `MemberRole` (company membership)

| Value | Description |
|-------|-------------|
| `RECRUITER_ADMIN` | Company admin — can edit company, manage team, invite |
| `MEMBER` | Company member — can manage jobs & applications |

### `JobStatus`

| Value | Description |
|-------|-------------|
| `DRAFT` | Not visible on public job board |
| `OPEN` | Published, visible on `GET /jobs` |
| `CLOSED` | No longer accepting applications |

### `WorkMode`

| Value | Description |
|-------|-------------|
| `ON_SITE` | On-site work |
| `HYBRID` | Hybrid work |
| `REMOTE` | Remote / télétravail |

> **Note:** `location` remains required for all work modes (city, region, or country).

### `ApplicationStatus`

| Value | Description |
|-------|-------------|
| `SUBMITTED` | Initial state on apply |
| `IN_REVIEW` | Under review |
| `SHORTLISTED` | Shortlisted |
| `REJECTED` | Rejected |

> **Note:** There is no `INTERVIEW` or `HIRED` status in the backend.

---

## Database entities (reference)

Soft references use `Long` IDs (no JPA relations across modules).

### `User` → table `users`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | PK |
| email | String | unique |
| password | String | hashed, never returned in API |
| role | Role | |
| firstName | String | |
| lastName | String | |
| phone | String? | |
| createdAt | Instant | |
| updatedAt | Instant | |

### `CandidateProfile` → `candidate_profiles`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | PK |
| userId | Long | unique, FK to User |
| bio | String? | |
| resumeUrl | String? | |
| location | String? | |
| availableFrom | LocalDate? | |
| yearsOfExperience | Integer? | |

### `CandidateSkill` → `candidate_skills`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | PK |
| profileId | Long | FK to CandidateProfile |
| skillName | String | |

### `Company` → `companies`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | PK |
| name | String | |
| slug | String | unique, auto-generated from name on create |
| description | String? | max 2000 |
| logoUrl | String? | |
| website | String? | |
| location | String? | |

### `CompanyMembership` → `company_memberships`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | PK |
| companyId | Long | |
| userId | Long | |
| role | MemberRole | `RECRUITER_ADMIN` \| `MEMBER` |
| joinedAt | LocalDateTime | |

### `CompanyInvitation` → `company_invitations`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | PK |
| token | String | unique UUID |
| companyId | Long | |
| createdByUserId | Long | |
| expiresAt | Instant | 24h from creation |
| isUsed | boolean | |
| createdAt | Instant | |

### `Job` → `jobs`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | PK |
| title | String | |
| companyId | Long | |
| location | String | |
| description | String | max 5000 |
| contractType | String? | e.g. CDI |
| experienceLevel | String? | |
| workMode | WorkMode | required; default `ON_SITE` for legacy rows |
| salaryMin | BigDecimal? | send as number in JSON |
| salaryMax | BigDecimal? | |
| status | JobStatus | default `DRAFT` on create |
| createdAt | Instant | |
| updatedAt | Instant | |

### `Application` → `applications`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | PK |
| jobId | Long | |
| userId | Long | candidate user id |
| status | ApplicationStatus | default `SUBMITTED` |
| createdAt | Instant | |

---

## Auth

### POST `/auth/register`

- **Auth:** public
- **Body:** `RegisterRequest`

```typescript
{
  email: string;        // required, valid email
  password: string;     // required, min 8 chars
  firstName: string;    // required
  lastName: string;     // required
  phone?: string;
  role: "CANDIDATE" | "RECRUITER" | "ADMIN";  // required
}
```

- **Response:** `ApiResponse<AuthResponse>`

```typescript
{
  success: true;
  message: string;
  data: {
    token: string;
    user: UserDto;
  }
}

// UserDto
{
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "CANDIDATE" | "RECRUITER" | "ADMIN";
  createdAt: string; // ISO Instant
}
```

### POST `/auth/login`

- **Auth:** public
- **Body:** `LoginRequest`

```typescript
{ email: string; password: string; }
```

- **Response:** `ApiResponse<AuthResponse>` (same as register)

### GET `/auth/me`

- **Auth:** Bearer token (any role)
- **Response:** `ApiResponse<UserDto>`

### PUT `/auth/me`

- **Auth:** Bearer token (any role)
- **Body:** `UpdateUserRequest`

```typescript
{
  firstName: string;  // required, max 100
  lastName: string;   // required, max 100
}
```

- **Response:** `ApiResponse<UserDto>`
- **Use case:** Update account name from candidate profile or recruiter company/settings pages

> **No logout endpoint** — client-side token removal only.

---

## Candidates

> **Response pattern:** raw JSON (not `ApiResponse` wrapper).

### GET `/candidates/me`

- **Auth:** `CANDIDATE`
- **Response:** `CandidateProfileResponse`

```typescript
{
  id: number;
  userId: number;
  bio: string | null;
  resumeUrl: string | null;       // "/candidates/me/resume" when stored
  resumeFileName: string | null;  // original upload name
  resumeContentType: string | null;
  hasResume: boolean;             // true when file is stored on server
  location: string | null;
  availableFrom: string | null;  // "YYYY-MM-DD"
  yearsOfExperience: number | null;
  skills: { id: number; skillName: string }[];
}
```

### GET `/candidates/me/resume`

- **Auth:** `CANDIDATE`
- **Response:** binary file stream (`application/pdf` or DOCX MIME)
- **Headers:** `Content-Disposition: attachment; filename="..."`
- **404:** no stored CV (legacy profiles must re-import)
- **Frontend:** fetch with JWT → blob URL for in-app PDF preview (`react-pdf`) or download

### GET `/candidates/{userId}/resume`

- **Auth:** `RECRUITER` (must have access via candidate application to recruiter company job)
- **Path:** `userId` = candidate user id
- **Response:** binary file stream
- **404:** not authorized or no stored CV
- **Frontend:** recruiter candidate detail page uses this for PDF viewer and download (no separate preview API)

### PUT `/candidates/me`

- **Auth:** `CANDIDATE`
- **Body:** `UpdateProfileRequest` (all fields optional)

```typescript
{
  bio?: string;
  resumeUrl?: string;
  location?: string;
  availableFrom?: string;  // "YYYY-MM-DD"
  yearsOfExperience?: number;
}
```

- **Response:** `CandidateProfileResponse`

### POST `/candidates/me/skills`

- **Auth:** `CANDIDATE`
- **Body:** `SkillRequest`

```typescript
{ skillName: string; }
```

- **Response:** `{ id: number; skillName: string; }`

### DELETE `/candidates/me/skills/{id}`

- **Auth:** `CANDIDATE`
- **Response:** `204 No Content`

### POST `/candidates/me/cv/parse`

- **Auth:** `CANDIDATE`
- **Content-Type:** `multipart/form-data`
- **Field:** `file` (PDF/DOC CV)
- **Response:** `CandidateProfileResponse` (profile updated with parsed skills/location/experience; CV file persisted on server)
- **Side effect:** Calls AI service at `ai.service.url`; stores file under `tunhire.uploads.dir`

### GET `/candidates/{id}`

- **Auth:** `RECRUITER`
- **Path:** `id` = candidate **user** id
- **Response:** `CandidateProfileResponse`

---

## Applications

### POST `/applications`

- **Auth:** `CANDIDATE`
- **Body:** `ApplicationCreateRequest`

```typescript
{ jobId: number; }
```

- **Response:** `ApiResponse<ApplicationResponse>`

```typescript
{
  id: number;
  jobId: number;
  userId: number;
  candidateFirstName: string;
  candidateLastName: string;
  resumeUrl: string | null;
  status: ApplicationStatus;
  createdAt: string;
}
```

### DELETE `/applications/{id}`

- **Auth:** `CANDIDATE`
- **Business rule:** Caller must own the application (`application.userId === current user`)
- **Response:** `ApiResponse<null>` with message `"Application deleted"`
- **Frontend:** "Retirer ma candidature" on candidate dashboard and applications list

### GET `/applications/{id}`

- **Auth:** public
- **Response:** `ApiResponse<ApplicationResponse>`

### PATCH `/applications/{id}/status`

- **Auth:** `RECRUITER`
- **Query:** `status` = `ApplicationStatus`
- **Business rule:** Recruiter must be a **member of the job's company**
- **Response:** `ApiResponse<ApplicationResponse>`

### GET `/applications/job/{jobId}/ranked`

- **Auth:** `RECRUITER`
- **Caching:** Scores are persisted in `application_match_scores` (Postgres). Recomputed on read when job/profile hashes or `scorer_version` change.
- **Response:** `ApiResponse<RankedApplicationResponse[]>`

```typescript
{
  applicationId: number;   // note: NOT "id"
  jobId: number;
  userId: number;
  status: ApplicationStatus;
  createdAt: string;
  score: number | null;    // AI match score 0-100
  level: string | null;    // e.g. "Weak Match", "Average Match", "Good Match", "Excellent Match"
  matchedSkills: string[] | null;
  gaps: string[] | null;   // rule/LLM-identified gaps (French)
  summary: string | null;  // recruiter-facing explanation (LLM when Groq configured)
}
```

> **AI v2:** Core-service calls `POST /v2/rank` with full job + candidate profile payload. See ai-service architecture for scorer modes.

> To show candidate names, fetch `GET /candidates/{profileId}` using `userId` or join client-side.

### GET `/applications`

- **Auth:** public (but typically used with auth for own data)
- **Query:** `jobId` (optional) OR `userId` (optional)
- **Response:** `ApiResponse<ApplicationSummary[]>`

```typescript
{
  id: number;
  jobId: number;
  userId: number;
  status: ApplicationStatus;
  createdAt: string;
}
```

Returns `[]` if neither query param is provided.

---

## Companies

### POST `/companies`

- **Auth:** `RECRUITER` or `ADMIN`
- **Body:** `CompanyCreateRequest`

```typescript
{
  name: string;           // required in practice
  slug?: string;          // ignored — auto-generated from name
  description?: string;
  logoUrl?: string;
  website?: string;
  location?: string;
}
```

- **Side effect:** Creator is added as `RECRUITER_ADMIN` membership
- **Response:** `ApiResponse<CompanyResponse>`

### GET `/companies/mine`

- **Auth:** `RECRUITER` or `ADMIN`
- **Response:** `ApiResponse<CompanyMembershipSummary[]>`

```typescript
{
  companyId: number;
  companyName: string;
  slug: string;
  logoUrl: string | null;
  location: string | null;
  role: "RECRUITER_ADMIN" | "MEMBER";
  joinedAt: string;  // LocalDateTime
}
```

### GET `/companies/{id}`

- **Auth:** public
- **Response:** `ApiResponse<CompanyResponse>`

```typescript
{
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  location: string | null;
}
```

### GET `/companies/slug/{slug}`

- **Auth:** public
- **Response:** `ApiResponse<CompanyResponse>`

### PUT `/companies/{id}`

- **Auth:** `RECRUITER` or `ADMIN`
- **Business rule:** Caller must be `RECRUITER_ADMIN` of that company
- **Body:** `CompanyUpdateRequest` (all fields optional)

```typescript
{
  name?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  location?: string;
}
```

- **Response:** `ApiResponse<CompanyResponse>`

### GET `/companies/{id}/jobs`

- **Auth:** Bearer token required
- **Business rule:** Caller must be a **member** of the company
- **Response:** `ApiResponse<JobSummaryDto[]>` — includes **all statuses** (DRAFT, OPEN, CLOSED)

```typescript
{
  id: number;
  title: string;
  location: string;
  workMode: string;  // WorkMode as string
  status: string;  // JobStatus as string
}
```

### GET `/companies/{id}/applications`

- **Auth:** Bearer token required
- **Business rule:** Company member
- **Response:** `ApiResponse<ApplicationSummary[]>`

### GET `/companies/{id}/dashboard`

- **Auth:** Bearer token required
- **Business rule:** Company member
- **Response:** `ApiResponse<CompanyDashboardResponse>`

```typescript
{
  company: CompanyResponse;
  jobs: JobSummaryDto[];
  applications: DashboardApplicationItem[];
}

// DashboardApplicationItem (enriched for recruiter Aperçu)
{
  id: number;
  jobId: number;
  jobTitle: string;
  userId: number;
  candidateFirstName: string;
  candidateLastName: string;
  status: ApplicationStatus;
  createdAt: string;
}
```

> **Note:** `GET /companies/{id}/applications` still returns plain `ApplicationSummary[]` (no names). Use `/dashboard` for the enriched list.

---

## Company members

> **Response pattern:** raw JSON (not `ApiResponse` wrapper).

Base path: `/companies/{companyId}/members`

### GET `/companies/{companyId}/members`

- **Auth:** Bearer token
- **Business rule:** Company member
- **Response:** `MembershipResponse[]`

```typescript
{
  id: number;
  companyId: number;
  userId: number;
  role: "RECRUITER_ADMIN" | "MEMBER";
  joinedAt: string;
}
```

### POST `/companies/{companyId}/members`

- **Auth:** Bearer token
- **Business rule:** `RECRUITER_ADMIN` (unless company has no members yet)
- **Body:** `MembershipRequest`

```typescript
{
  userId: number;
  role: "RECRUITER_ADMIN" | "MEMBER";
}
```

- **Response:** `MembershipResponse`

### POST `/companies/{companyId}/members/invites`

- **Auth:** Bearer token
- **Business rule:** `RECRUITER_ADMIN` only
- **Response:** `InviteTokenResponse`

```typescript
{ token: string; }  // UUID, expires in 24h
```

Frontend invite link: `/invites/accept?token={token}`

### DELETE `/companies/{companyId}/members/{userId}`

- **Auth:** Bearer token
- **Business rule:** `RECRUITER_ADMIN`; cannot remove self if admin
- **Response:** `204 No Content`

### PATCH `/companies/{companyId}/members/{userId}/role`

- **Auth:** Bearer token
- **Business rule:** `RECRUITER_ADMIN`
- **Query:** `role` = `MemberRole`
- **Response:** `MembershipResponse`

---

## Company invitations

### POST `/companies/invites/accept`

- **Auth:** Bearer token (any authenticated user)
- **Body:** `AcceptInviteRequest`

```typescript
{ token: string; }
```

- **Side effect:** User joins company as `MEMBER`; token marked used
- **Response:** `ApiResponse<MembershipResponse>`

---

## Notifications (sidebar badges)

Server-side badge counts for sidebar red dots. Frontend polls `GET /notifications/badges` every 30s and on window focus.

### GET `/notifications/badges`

- **Auth:** Required (`CANDIDATE`, `RECRUITER`, or `ADMIN`)
- **Query:** `companyId` (required for recruiters; ignored for candidates)
- **Response:**

```typescript
type NotificationBadgesDto = {
  chatUnread: number;           // unread chat messages (all conversations)
  newApplications: number;      // recruiter: applications created after last Candidats visit
  applicationUpdates: number;   // candidate: applications whose status changed since last visit
};
```

Recruiter-only fields return `0` for candidates and vice versa.

### POST `/notifications/recruiter/candidates-seen?companyId={id}`

- **Auth:** `RECRUITER` or `ADMIN`
- **Effect:** Marks all current company applications as seen; clears recruiter **Candidats** badge
- **Response:** `ApiResponse<void>`

Call when recruiter opens `/dashboard/recruiter/candidates`.

### POST `/notifications/candidate/applications-seen`

- **Auth:** `CANDIDATE`
- **Effect:** Syncs acknowledged application statuses for the current user; clears **Mes candidatures** badge
- **Response:** `ApiResponse<void>`

Call when candidate opens `/dashboard/candidate/applications`.

---

## Chat

### Conversation model

```typescript
type ConversationType = "COMPANY_TEAM" | "DIRECT";

type ChatConversationDto = {
  id: number;
  type: ConversationType;
  companyId: number | null;
  directUserId: number | null;
  title: string;
  otherParticipantName: string | null;  // other party display name (direct chats)
  companyName: string | null;           // company label for direct/team threads
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  updatedAt: string;
};

type ChatMessageDto = {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderFirstName: string;
  senderLastName: string;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
};
```

### GET `/chat/conversations`

- **Auth:** `CANDIDATE` / `RECRUITER` / `ADMIN`
- **Response:** `ApiResponse<ChatConversationDto[]>`

### POST `/chat/conversations/company/{companyId}`

- **Auth:** `RECRUITER` / `ADMIN`
- **Business rule:** Caller must be a company member
- **Response:** `ApiResponse<ChatConversationDto>`

### POST `/chat/conversations/direct`

- **Auth:** `RECRUITER` / `ADMIN` only
- **Business rule:** Only recruiters may start a direct conversation; target must be a `CANDIDATE`. Candidates can reply in existing threads but cannot call this endpoint.
- **Body:**

```typescript
{
  targetUserId: number;   // required — candidate user id
  companyId?: number;     // optional — scopes thread to recruiter's active company (used for labels)
}
```

- **Idempotency:** Duplicate direct/company threads are deduplicated server-side (DB unique indexes + insert-or-fetch).
- **Response:** `ApiResponse<ChatConversationDto>`

### GET `/chat/conversations/{conversationId}/messages`

- **Auth:** `CANDIDATE` / `RECRUITER` / `ADMIN`
- **Query:**
  - `before` (optional, ISO instant)
  - `size` (optional, default 30, max 100)
- **Response:** `ApiResponse<ChatMessageDto[]>`

### POST `/chat/conversations/{conversationId}/read`

- **Auth:** `CANDIDATE` / `RECRUITER` / `ADMIN`
- **Response:** `ApiResponse<null>`

### STOMP / WebSocket

- **Handshake endpoint:** `/ws`
- **Client connect header:** `Authorization: Bearer <jwt>`
- **App destination (send):** `/app/chat/conversations/{conversationId}/send`
- **Topic subscription (receive):** `/topic/chat/conversations/{conversationId}`
- **Payload sent by client:**

```typescript
{ body: string; }
```

- **Broadcast payload:** `ChatMessageDto`

---

## Jobs

### POST `/jobs`

- **Auth:** `RECRUITER`
- **Business rule:** Caller must be a **member** of `companyId`
- **Body:** `JobRequest`

```typescript
{
  title: string;           // required
  companyId: number;       // required
  location: string;        // required
  description: string;     // required
  workMode: "ON_SITE" | "HYBRID" | "REMOTE";  // required
  contractType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
}
```

- **Side effect:** Created with status `DRAFT`
- **Response:** `ApiResponse<JobResponse>`

### GET `/jobs`

- **Auth:** public
- **Query:** `page` (default `0`), `size` (default `10`)
- **Filter:** Returns **OPEN** jobs only (public job board)
- **Response:** `ApiResponse<Page<JobResponse>>`

### GET `/jobs/{id}`

- **Auth:** public
- **Response:** `ApiResponse<JobResponse>` (any status)

```typescript
{
  id: number;
  title: string;
  companyId: number;
  companyName: string;
  companySlug: string | null;
  companyLogoUrl: string | null;
  companyLocation: string | null;
  companyDescription: string | null;
  companyWebsite: string | null;
  location: string;
  description: string;
  workMode: "ON_SITE" | "HYBRID" | "REMOTE";
  contractType: string | null;
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: "DRAFT" | "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}
```

### PUT `/jobs/{id}`

- **Auth:** `RECRUITER`
- **Business rule:** Member of the job's company
- **Body:** `JobRequest` (same as create)
- **Response:** `ApiResponse<JobResponse>`

### PATCH `/jobs/{id}/status`

- **Auth:** `RECRUITER`
- **Business rule:** Member of the job's company
- **Query:** `status` = `JobStatus` (`DRAFT` | `OPEN` | `CLOSED`)
- **Response:** `ApiResponse<JobResponse>`

**Typical recruiter flow:**
1. `POST /jobs` → `DRAFT`
2. `PATCH /jobs/{id}/status?status=OPEN` → publish
3. `PATCH /jobs/{id}/status?status=CLOSED` → close

### DELETE `/jobs/{id}`

- **Auth:** `RECRUITER`
- **Business rule:** Member of the job's company
- **Response:** `ApiResponse<null>` with message `"Job deleted"`

---

## Authorization matrix (frontend gating)

| Action | Required |
|--------|----------|
| Apply to job | User role `CANDIDATE` |
| Withdraw own application | User role `CANDIDATE` + owns application |
| Create/edit/delete job | User role `RECRUITER` + company **member** |
| Publish/close job | Same as above |
| Update application status | User role `RECRUITER` + member of job's company |
| View ranked candidates | User role `RECRUITER` |
| Edit company profile | User role `RECRUITER` + company **RECRUITER_ADMIN** |
| Manage team / invites | Company **RECRUITER_ADMIN** |
| Accept invite | Any authenticated user |

---

## Frontend TypeScript quick reference

Copy into `frontend/lib/types.ts` and keep in sync:

```typescript
export type UserRole = "CANDIDATE" | "RECRUITER" | "ADMIN";
export type MemberRole = "RECRUITER_ADMIN" | "MEMBER";
export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";
export type WorkMode = "ON_SITE" | "HYBRID" | "REMOTE";
export type ApplicationStatus = "SUBMITTED" | "IN_REVIEW" | "SHORTLISTED" | "REJECTED";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type JobFormValues = {
  title: string;
  location: string;
  workMode: WorkMode;
  contractType: string;
  description: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
};
```

---

## Swagger

Interactive docs (dev): `http://localhost:8181/swagger-ui/index.html`

---

## Common frontend mistakes to avoid

1. **Assuming all endpoints use `ApiResponse`** — Candidates and Members return raw bodies.
2. **Using `GET /jobs` for recruiter dashboard** — use `GET /companies/{id}/jobs` to see drafts/closed jobs.
3. **Missing required job fields** — `title`, `location`, `description` are validated server-side.
4. **Wrong candidate id** — `GET /candidates/{id}` uses profile id; applications use `userId`.
5. **Ranked response field name** — use `applicationId`, not `id`.
6. **Application status values** — only 4 statuses exist; no `INTERVIEW` / `HIRED`.
7. **MemberRole vs Role** — `RECRUITER` is the user account role; `RECRUITER_ADMIN` / `MEMBER` are company roles.
8. **Company slug on create** — sent slug is ignored; backend derives slug from `name`.
9. **Chat direct create body** — send `{ targetUserId, companyId }`; `companyId` improves candidate-side labels (`Recruiter — Company`).
10. **Backend port** — local core-service runs on **8181**, not 8081 (Windows port reservation).
