# TunHire — Changes Since Last Commit

**Branch:** `frontend-clean-push`  
**Last commit:** `5a2fa392` — *Frontend-only snapshot*  
**Generated:** 2026-05-25 (updated)  
**Status:** Uncommitted working tree (not yet pushed)

---

## Overview

Since the last commit, work spans three areas:

1. **Frontend (`frontend/`)** — Major UX overhaul aligned with `FRONTEND_IMPROVEMENT_SPEC.md`, plus smaller recruiter/candidate polish.
2. **Backend (`core-service/`)** — Auth updates, chat module, CV storage, job/company enhancements, DB migrations, AI integration wiring.
3. **AI service (`ai-service/`)** — New Python microservice for CV parsing, matching, and ranking.

---

## 1. Frontend (`frontend/`)

### 1.1 Foundation & shared UI

| Area | Changes |
|------|---------|
| Status helpers | `lib/status/applications.ts`, `lib/status/jobs.ts` — centralized labels/tones for applications and jobs |
| Shared components | `StatCard`, `StatusPipelineStrip`, `StatusFilterPills`, `EmptyStatePanel` |
| Hooks | `useCandidateApplications`, `useCandidateDashboard`, `useUserAccount` |
| Styling | `input-soft-flat` in `globals.css` — square textarea style (2px corners) for job description |

### 1.2 Candidate experience

| Page / feature | Changes |
|----------------|---------|
| Dashboard | `/dashboard/candidate` — KPIs, profile checklist, application funnel, recent applications, empty states |
| Profile | Moved to `/dashboard/candidate/profile`; prénom/nom fields; name saved via `PUT /auth/me` |
| Applications | Card layout, status pipeline strip, filter pills; **withdraw** — "Retirer ma candidature" (`DELETE /applications/{id}`) |
| Job search | `/jobs` — **multi-select dropdown filters** (Mode de travail, Contrat, Expérience), location via search bar only, 2-column master-detail, mobile bottom sheet |
| Job cards | `JobCard`, `JobCardGrid`, `FilterBar`, `JobSearchFilters` (dropdown UI); emojis via `lib/candidate/jobMeta.tsx` |
| Chat | Candidate chat at `/dashboard/candidate/chat`; conversation labels via `lib/chat/labels.ts` (`Recruiter — Company` for candidates) |
| Sidebar | Updated nav: "Tableau de bord", "Mon profil" |

### 1.3 Recruiter experience

| Page / feature | Changes |
|----------------|---------|
| Jobs list | 2-column `RecruiterJobCard` grid, status pills, applicant counts via `useCompanyDashboard` |
| Job form | Grouped sections, inline validation; **experience level dropdown** (`STAGIAIRE`, `JUNIOR`, `INTERMEDIAIRE`, `SENIOR`); flat description textarea |
| Candidates | Tabs: "Candidatures" + "Classement IA"; filters and candidate search |
| Company page | `UserAccountNameForm` for updating recruiter name |
| Chat | Recruiter chat page at `/dashboard/recruiter/chat`; direct chat passes `companyId` for labeling |
| Team page | Removed header **"Inviter un recruiter"** button; **Membres actifs** stat card uses same white style as other KPI cards; member list shows name/role (no raw user IDs) |

### 1.4 Job form & experience level

- **`lib/recruiter/jobs.ts`** — `EXPERIENCE_LEVEL_OPTIONS`, `experienceLevelLabel()`, `normalizeExperienceLevel()`
- **`components/recruiter/JobForm.tsx`** — free-text experience field replaced with `<select>`
- **`lib/candidate/jobMeta.tsx`** — `JobExperienceBadge` shows French labels (e.g. "Stagiaire" not "STAGIAIRE")

### 1.5 Auth & user account (frontend)

- **`lib/auth.ts`** — `updateStoredUser()` after profile/name updates
- **`lib/hooks/useUserAccount.ts`** — account update hook
- **`components/UserAccountNameForm.tsx`** — recruiter name editing
- **`lib/hooks/useCandidateProfile.ts`** — profile save calls `PUT /auth/me`

### 1.7 Job search filters (latest)

- **`components/candidate/JobSearchFilters.tsx`** — pill/checkbox filters replaced with **stacked multi-select dropdowns** (`MultiSelectDropdown`)
- **`lib/candidate/jobSearch.ts`** — removed `locations` from filter state; location filtering stays on the **"Ville ou région"** search field only
- **`components/candidate/FilterBar.tsx`** — active filter chips for work mode, contract, experience (unchanged)

### 1.8 Candidate application withdraw (latest)

- **`DELETE /applications/{id}`** — candidate-only; wired in `useCandidateApplications.ts`
- **`components/candidate/ApplicationCard.tsx`** — "Retirer ma candidature" with confirm dialog
- Used on `/dashboard/candidate` and `/dashboard/candidate/applications`

### 1.9 Chat labels (latest)

- **`lib/chat/labels.ts`** — `formatDirectChatLabel()`, `formatConversationTitle()`
- Candidates see `"Recruiter Name — Company Name"` on direct threads
- Recruiters pass `companyId` when opening direct chat (`lib/chat/api.ts`)

### 1.10 API & env (latest)

- **`lib/api.ts`**, **`.env.local`**, **`.env.example`** — backend default port **`8181`** (Windows reserved port range blocked `8081`)

### 1.11 Documentation

- **`frontend/_design-references/FRONTEND_IMPROVEMENT_SPEC.md`** — full frontend improvement backlog and implementation notes
- **`frontend/_design-references/API_ENDPOINTS.md`** — updated for port 8181, `PUT /auth/me`, `DELETE /applications/{id}`, chat DTO fields

---

## 2. Backend — Core Service (`core-service/`)

### 2.1 Authentication

- **`UpdateUserRequest.java`** — DTO for name updates
- **`AuthController.java`** — new `PUT /auth/me` endpoint
- **`AuthService` / `AuthServiceImpl`** — `updateCurrentUser()` implementation

### 2.2 Chat (new module)

Real-time messaging between recruiters and candidates:

- Entities: `ChatConversation`, `ChatMessage`, `ChatParticipant`
- Repositories, DTOs, `ChatService` / `ChatServiceImpl`, **`ChatPersistenceSupport`** (insert-or-fetch in separate transaction)
- REST: `ChatController`
- WebSocket: `ChatSocketController`, `WebSocketConfig`, `StompJwtChannelInterceptor`
- Eligibility: `RecruiterCandidateEligibility`, `RecruiterCandidateEligibilityImpl`
- **`ChatConversationDto`** extended with `companyName`, `otherParticipantName` for UI labels
- **`CreateDirectConversationRequest`** — optional `companyId` on direct chat create
- **DB dedupe + unique indexes** in `PostgresSchemaMigration` (direct + company team conversations, participants)
- Tests: `ChatServiceTest` (dedupe, concurrency fallback, DTO labels)

### 2.3 Candidate & CV

- **`CvStorageService`** + **`LocalCvStorageService`** — local CV file storage
- **`CandidateController`**, **`CandidateServiceImpl`** — CV upload/download integration
- **`CandidateProfile`** entity and **`CandidateProfileResponse`** extended
- AI parsing integration via `ApplicationService` / `parsing_service` calls

### 2.4 Jobs & applications

- **`WorkMode`** enum — `ON_SITE`, `HYBRID`, `REMOTE` on job offers
- **`Job`**, **`JobRequest`**, **`JobResponse`** — work mode, experience level, salary fields
- **`JobServiceImpl`**, **`DefaultJobSummaryProvider`** — create/update logic updates
- **`ApplicationService`** — AI matching/ranking integration, error handling for unavailable AI service
- **`ApplicationsController`** — **`DELETE /applications/{id}`** (candidate withdraws own application)

### 2.5 Companies & dashboard

- **`CompanyDashboardService`** — richer dashboard data
- **`CompanyDashboardResponse`**, **`DashboardApplicationItem`**, **`JobSummaryDto`**, **`CompanyMembershipSummary`**
- **`MembershipService` / `MembershipServiceImpl`** — membership role handling
- **`CompaniesController`**, **`CompanyInvitationController`** — API updates

### 2.6 Database migrations

- **`PostgresSchemaMigration.java`** — startup migration for PostgreSQL (membership role check + **chat dedupe/unique indexes**)
- **`db/fix-company-memberships-role-check.sql`** — manual SQL fix script

### 2.7 Configuration & errors

- **`AppConfig.java`** — RestTemplate / AI service URL config
- **`AiServiceUnavailableException.java`** — graceful handling when AI service is down
- **`GlobalExceptionHandler.java`** — extended error responses
- **`SecurityConfig.java`** — WebSocket and new endpoints secured
- **`application.properties`** — AI service URL, storage paths, **`server.port=8181`**, etc.

### 2.8 Tests

- Updated: `ApplicationServiceTest`, `CompanyServiceTest`
- New: `MembershipServiceImplTest`, `ChatServiceTest`

---

## 3. AI Service (`ai-service/`) — New

New FastAPI microservice:

| Component | Purpose |
|-----------|---------|
| `app/main.py` | FastAPI app entry |
| `app/api/routes/cv_parser.py` | CV parsing (PDF/DOCX) via Groq |
| `app/api/routes/matcher_v2.py` | Structured matching and ranking (v2) |
| `app/services/parsing_service.py` | CV text extraction + LLM parsing |
| `app/services/matching_service.py` | Sentence-transformer embeddings for v2 |
| `app/services/ranking_service.py` | Hybrid scoring (embed + rules + optional LLM) |
| `requirements.txt` | Python dependencies |
| `.env.example` | `GROQ_API_KEY` and config template |
| `README.md` | Setup and run instructions |

**Default port:** `8000` (core-service expects this; running on `8001` requires config change)

**Endpoints:**
- `GET /health`
- `POST /v1/cv/parse`
- `POST /v2/match`
- `POST /v2/rank`

---

## 4. Bug fixes addressed during development

| Issue | Fix |
|-------|-----|
| Company creation fails with `company_memberships_role_check` | DB migration to allow `RECRUITER_ADMIN` / `MEMBER` roles |
| Recruiter job creation errors | Job entity/service fixes (status, work mode, company linkage) |
| AI service unavailable | `AiServiceUnavailableException` + frontend/backend graceful degradation |
| Profile page build error | Missing `lastName` destructuring in profile hook |
| Job form description styling | `.input-soft` pill radius overridden with `.input-soft-flat` |
| Duplicate chat conversations | DB dedupe migration + unique indexes; `ChatPersistenceSupport` insert-or-fetch |
| Hibernate "null id in ChatConversation" | Conversation inserts moved to `REQUIRES_NEW` transaction with constraint-violation retry |
| Backend port 8081 blocked on Windows | Core service moved to **8181**; frontend env updated |

---

## 5. Files & areas with notable new additions

### New frontend files (examples)
- `components/ui/StatCard.tsx`, `StatusPipelineStrip.tsx`, `StatusFilterPills.tsx`, `EmptyStatePanel.tsx`
- `components/candidate/ApplicationCard.tsx`, `JobCard.tsx`, `JobCardGrid.tsx`, `FilterBar.tsx`
- `components/candidate/dashboard/ProfileChecklist.tsx`, `ApplicationFunnel.tsx`
- `components/recruiter/RecruiterJobCard.tsx`, `ApplicationRow.tsx`
- `components/UserAccountNameForm.tsx`
- `lib/status/applications.ts`, `lib/status/jobs.ts`
- `lib/hooks/useCandidateApplications.ts`, `useCandidateDashboard.ts`, `useUserAccount.ts`
- `lib/chat/labels.ts`, `lib/chat/api.ts`
- `components/candidate/ApplicationCard.tsx` (withdraw action)

### New backend files (examples)
- Entire `chat/` package
- `UpdateUserRequest.java`
- `CvStorageService.java`, `LocalCvStorageService.java`
- `PostgresSchemaMigration.java`
- `WorkMode.java`
- `ChatPersistenceSupport.java`
- `CreateDirectConversationRequest.java` (with `companyId`)

---

## 6. Operational notes

1. **Restart `core-service`** after pulling these changes (new endpoints, migrations, chat WebSocket).
2. **Core service port:** `8181` locally (`server.port` in `application.properties`; frontend `NEXT_PUBLIC_API_URL=http://localhost:8181`).
3. **Start `ai-service`** on port `8000` (or update `ai.service.url` in `application.properties`).
4. **Do not commit** `.env` files (they contain secrets).
5. **PostgreSQL** expected at `localhost:5433` (per `application.properties`; override via `SPRING_DATASOURCE_URL`).

---

## 7. Suggested commit grouping (optional)

If splitting into commits:

1. `feat(ai-service): add CV parse, match, and rank microservice`
2. `feat(core): chat module, CV storage, auth name update, job work mode`
3. `fix(core): postgres membership role migration`
4. `feat(frontend): candidate dashboard, job search, applications overhaul`
5. `feat(frontend): recruiter jobs/candidates UI + job form improvements`
6. `feat(frontend): job search dropdown filters, application withdraw, chat labels`
7. `chore: document API changes; core port 8181`
