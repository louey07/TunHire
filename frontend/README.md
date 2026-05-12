# TunHire Frontend

Interface web de la plateforme de recrutement TunHire — propulsée par l'IA.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- JWT Authentication

## Prérequis
- Node.js 18+
- Backend Spring Boot running on port 8081
- AI Service running on port 8000

## Installation

```bash
npm install
npm run dev
```

## Pages
- `/` → Redirects to /jobs
- `/login` → Login and Register with role selection (Candidat / Recruteur)
- `/jobs` → Public job listings with search and pagination
- `/jobs/[id]` → Job detail page
- `/dashboard/candidate` → Candidate dashboard (profile, CV upload, skills)
- `/dashboard/recruiter` → Recruiter dashboard (company, jobs, ranked applications)

## Architecture
- `lib/auth.ts` → JWT helpers: getToken(), getUser(), isLoggedIn(), logout()
- `lib/api.ts` → Base fetch helpers with auto Authorization header
- `components/Navbar.tsx` → Role-aware navigation (public, candidate, recruiter)
- `components/JobCard.tsx` → Reusable job card component
- `components/SkillBadge.tsx` → Teal skill pill with optional delete
- `proxy.ts` → Route protection for /dashboard/* using cookie

## Backend API
Base URL: `http://localhost:8081`

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register` |
| Candidate | `GET/PUT /candidates/me`, `POST /candidates/me/skills`, `DELETE /candidates/me/skills/{id}`, `POST /candidates/me/cv/parse` |
| Jobs | `GET /jobs`, `GET /jobs/{id}`, `POST /jobs`, `PATCH /jobs/{id}/status` |
| Companies | `POST /companies`, `GET /companies/{id}/jobs` |
| Applications | `POST /applications`, `GET /applications/job/{jobId}/ranked`, `PATCH /applications/{id}/status` |

## Credentials de test
| Role | Email | Password |
|---|---|---|
| Candidate | [your test email] | [password] |
| Recruiter | [your test email] | [password] |

## Modifications Backend pour l'intégration Frontend

Les modifications suivantes ont été apportées au core-service
pour permettre la communication avec le frontend Next.js :

### 1. Configuration CORS (SecurityConfig.java)
Ajout d'une configuration CORS pour autoriser les requêtes
depuis http://localhost:3000 :
- Méthodes autorisées : GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers autorisés : tous
- Credentials : activés

### 2. Fix preflight OPTIONS (JwtAuthenticationFilter.java)
Le filtre JWT interceptait les requêtes OPTIONS (preflight)
et les bloquait avec 403.
Fix : les requêtes OPTIONS sont laissées passer sans vérification du token.
