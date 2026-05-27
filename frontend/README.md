# TunHire Frontend

Interface web de la plateforme de recrutement TunHire.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- JWT authentication (localStorage + cookie for middleware)

## Prérequis

- Node.js 18+
- Backend Spring Boot on port `8081`

## Installation

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` (defaults to `http://localhost:8081`).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — run production build

## Route map

### Public

- `/` → redirects to `/jobs`
- `/jobs` — job search (list + detail panel)
- `/jobs/[id]` — job detail
- `/companies/[slug]` — public company profile + jobs
- `/login` — login / register

### Candidate

- `/dashboard/candidate` — profile, skills, CV import
- `/dashboard/candidate/applications` — application tracking

All candidate routes share `CandidateShell` (sidebar, centered `max-w-6xl` content).

### Recruiter

- `/dashboard/recruiter` — overview + AI-ranked pipeline
- `/dashboard/recruiter/jobs` — job management
- `/dashboard/recruiter/jobs/new` — create job
- `/dashboard/recruiter/candidates` — ranked applicants
- `/dashboard/recruiter/company` — company profile
- `/dashboard/recruiter/team` — team members

### Other

- `/invites/accept?token=…` — accept company invite
- Branded `not-found` and `error` pages

## Architecture

- `lib/api.ts` — `apiGet`, `apiPost`, `apiPatchQuery`, `NEXT_PUBLIC_API_URL`
- `lib/auth.ts` — `setSession`, `requireRole`, token helpers
- `lib/types.ts` — shared DTOs
- `middleware.ts` — protects `/dashboard/*` via cookie
- `app/(candidate)/layout.tsx` — unified candidate shell (includes `/jobs`)

## Manual test flows

1. Register as candidate → browse `/jobs` → apply → see application in `/dashboard/candidate/applications`
2. Register as recruiter → create company → publish job → view ranked candidates
3. Verify candidate cannot access `/dashboard/recruiter` (redirected by `requireRole`)
