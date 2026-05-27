# TunHire Frontend Architecture (Pages and Flows)

This document maps frontend pages to backend endpoints from core-service, and describes the best way to implement each page in the current Next.js App Router codebase.

Base API (local): http://localhost:8081

## 1) Route map (page inventory)

### Public
- / (redirect to /jobs)
  - Purpose: Landing redirect
  - APIs: none
- /jobs
  - Purpose: Public job list with search and pagination
  - APIs: GET /jobs?page&size
  - Notes: client-side search over current page results; keep pagination controls and empty states
- /jobs/[id]
  - Purpose: Job detail + apply CTA
  - APIs: GET /jobs/{id}; POST /applications (candidate only)
  - Notes: show apply CTA only when authenticated; handle apply success/failure
- /companies/[slug] (recommended)
  - Purpose: Public company profile and open jobs
  - APIs: GET /companies/slug/{slug}; GET /companies/{id}/jobs
  - Notes: show company info and job list; use slug for SEO
- /companies/[id] (optional fallback)
  - Purpose: Public company profile fallback
  - APIs: GET /companies/{id}

### Auth
- /login
  - Purpose: Login and register (role selection)
  - APIs: POST /auth/login; POST /auth/register
  - Notes: on success store token and user; redirect by role

### Candidate (role CANDIDATE)
- /dashboard/candidate
  - Purpose: Candidate profile hub
  - APIs: GET /candidates/me; PUT /candidates/me; POST /candidates/me/skills; DELETE /candidates/me/skills/{id}; POST /candidates/me/cv/parse
  - Notes: CV upload uses multipart/form-data; show parse progress and validation
- /dashboard/candidate/applications (recommended)
  - Purpose: My applications list
  - APIs: GET /applications?userId={userId}
  - Notes: use user id from local user payload
- /dashboard/candidate/applications/[id] (optional)
  - Purpose: Application detail
  - APIs: GET /applications/{id}

### Recruiter (role RECRUITER)
- /dashboard/recruiter
  - Purpose: Recruiter overview and ranking
  - APIs: GET /companies/{id}/jobs; GET /applications/job/{jobId}/ranked; POST /jobs; PATCH /jobs/{id}/status; PATCH /applications/{id}/status
  - Notes: keep job selector, ranked list, and quick status controls
- /dashboard/recruiter/jobs (recommended)
  - Purpose: Full job management
  - APIs: GET /companies/{id}/jobs; GET /jobs/{id}; PUT /jobs/{id}; PATCH /jobs/{id}/status; DELETE /jobs/{id}
  - Notes: allow edit, close, delete, and quick preview
- /dashboard/recruiter/jobs/new (recommended)
  - Purpose: Dedicated job creation form
  - APIs: POST /jobs
- /dashboard/recruiter/candidates/[id]
  - Purpose: Recruiter view of candidate profile
  - APIs: GET /candidates/{id}
- /dashboard/recruiter/applications/[id] (optional)
  - Purpose: Application detail + decision log
  - APIs: GET /applications/{id}; PATCH /applications/{id}/status

### Company and team management (recruiter or admin)
- /dashboard/recruiter/company
  - Purpose: Company profile management
  - APIs: GET /companies/{id}; PUT /companies/{id}
- /dashboard/recruiter/team
  - Purpose: Company members
  - APIs: GET /companies/{companyId}/members; POST /companies/{companyId}/members; DELETE /companies/{companyId}/members/{userId}; PATCH /companies/{companyId}/members/{userId}/role
- /dashboard/recruiter/team/invites
  - Purpose: Invite generation
  - APIs: POST /companies/{companyId}/members/invites
- /invites/accept
  - Purpose: Accept company invite
  - APIs: POST /companies/invites/accept
  - Notes: user must be logged in; redirect to company dashboard

### System
- /404, /500
  - Purpose: User friendly error pages
  - APIs: none

## 2) Page implementation standards

### Layouts and navigation
- Use App Router layouts to avoid repeated shells:
  - root layout for global fonts and body
  - auth layout for login/register visuals
  - dashboard layout (candidate and recruiter) for side navs and consistent spacing
- Navbar should be role-aware and use the same auth source as dashboard pages.

### Auth and route protection
- Token storage: keep localStorage for client fetch + cookie for middleware guards.
- Add middleware.ts that wraps proxy.ts to protect /dashboard/* routes.
- On protected pages, verify token early and redirect to /login when missing.

### Data access
- Use lib/api.ts for all authenticated calls to centralize headers and base URL.
- Prefer apiPublicGet for public pages, and apiPostForm for multipart.
- Move API base URL to env (NEXT_PUBLIC_API_URL) to support staging/production.

### UI states
- Every page should show explicit loading, empty, and error states.
- Lists should handle partial data (e.g., missing companyName).
- Forms should show inline validation before submit and clear errors on change.

### Candidate CV parsing flow
- Client should upload file as FormData to /candidates/me/cv/parse.
- Show parsing progress and a summary of extracted fields.
- Allow retry on failure and keep original upload state visible.

### Recruiter ranking flow
- Ranking should be triggered by selecting a job.
- Show an empty state until a job is selected.
- In ranked lists, display AI score, candidate summary, and quick status updates.

### Security and role separation
- Guard candidate and recruiter pages by role and prevent cross access.
- Disable recruiter-only actions when role mismatch is detected.
- Do not expose admin-only actions unless role is ADMIN.

## 3) Shared components (recommended)

- JobCard: use on /jobs, /companies/[slug], and recruiter job lists.
- CandidateCard: use in ranked list and recruiter candidate browsing.
- StatusChip: unified style for IN_REVIEW, SHORTLISTED, REJECTED.
- EmptyState: single component for consistent empty screens.
- PageHeader: consistent page title, subtitle, and action slots.

## 4) Suggested file structure (App Router)

app/
  (auth)/login/page.tsx
  jobs/page.tsx
  jobs/[id]/page.tsx
  companies/[slug]/page.tsx
  invites/accept/page.tsx
  dashboard/
    candidate/page.tsx
    candidate/applications/page.tsx
    recruiter/page.tsx
    recruiter/jobs/page.tsx
    recruiter/jobs/new/page.tsx
    recruiter/candidates/[id]/page.tsx
    recruiter/company/page.tsx
    recruiter/team/page.tsx
    recruiter/team/invites/page.tsx

components/
  JobCard.tsx
  CandidateCard.tsx
  StatusChip.tsx
  EmptyState.tsx
  PageHeader.tsx

lib/
  api.ts
  auth.ts

middleware.ts (wrap proxy.ts)

## 5) Release checklist

- Confirm all endpoints listed above are reachable in staging.
- Validate role-based routing and unauthorized redirects.
- Add basic e2e flows: login, apply, create job, rank candidates.
- Confirm empty states with a clean database.
