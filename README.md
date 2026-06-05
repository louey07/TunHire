# TunHire

**TunHire** is an AI-powered recruitment platform that connects candidates and recruiters in Tunisia. Candidates upload a PDF CV and apply to jobs; recruiters manage companies, publish offers, rank applicants with a hybrid AI score, and communicate in real time.

Built as a **Projet de Fin d'Études** at ISET Bizerte, in partnership with **RIF Tunisie**.

## Features

### Candidates
- Register / login (JWT)
- Browse open job offers (public listing with pagination)
- Upload a **PDF CV** — skills and profile fields extracted via Groq (LLaMA 3.3)
- Manage profile and skills
- Apply to jobs and track application status
- Real-time messaging with recruiters

### Recruiters
- Create and manage a **company workspace**
- Invite team members (`RECRUITER_ADMIN` / `MEMBER`)
- Publish and lifecycle-manage jobs (`DRAFT` → `OPEN` → `CLOSED`)
- View applications and update status (`SUBMITTED`, `IN_REVIEW`, `SHORTLISTED`, `REJECTED`)
- **AI ranking** — hybrid compatibility score (SBERT + business rules + Groq)
- Cached scores in `application_match_scores` (recalculated when job or profile changes)
- Dashboard, notifications, WebSocket chat

## Architecture

```
┌─────────────┐     REST + WebSocket (JWT)     ┌──────────────────┐
│   Next.js   │ ─────────────────────────────► │   core-service   │
│  frontend   │                                │  (Spring Boot)   │
└─────────────┘                                └────────┬─────────┘
                                                        │ REST
                                                        ▼
                                               ┌──────────────────┐
                                               │    ai-service    │
                                               │    (FastAPI)     │
                                               │  SBERT + Groq    │
                                               └──────────────────┘

                        ┌──────────────────┐
                        │   PostgreSQL     │  ← core-service only
                        └──────────────────┘
```

| Service | Role | Default port (local dev) |
|---------|------|---------------------------|
| `frontend` | React / Next.js UI | `3000` |
| `core-service` | Business logic, auth, persistence | `8181` |
| `ai-service` | CV parsing, matching, ranking | `8000` |
| PostgreSQL | Database | `15432` (host) |

The AI microservice is **stateless** — it does not connect to PostgreSQL. The core service calls it over HTTP and stores results (including match scores).

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, STOMP/WebSocket |
| Backend | Java 21, Spring Boot 3.4, Spring Security, Spring Modulith, JPA, PostgreSQL |
| AI service | Python, FastAPI, pdfplumber, Sentence Transformers (SBERT), Groq API |
| Auth | JWT (stateless), BCrypt |
| DevOps | Docker Compose (optional), Maven, npm |

## Project structure

```
TunHire_fork/
├── frontend/          # Next.js App Router UI
├── core-service/      # Spring Boot modular monolith
│   ├── src/main/java/com/tunhire/tunhire/
│   │   ├── auth/
│   │   ├── candidate/
│   │   ├── companies/
│   │   ├── job_offers/
│   │   ├── applications/
│   │   ├── chat/
│   │   └── notifications/
│   └── compose.yaml   # PostgreSQL + optional app image
├── ai-service/        # FastAPI — CV parse + v2 match/rank
└── README.md
```

## Prerequisites

- **Java 21** + Maven (or `./mvnw` in `core-service`)
- **Node.js 18+**
- **Python 3.10+**
- **Docker** (for PostgreSQL via Compose)
- **Groq API key** — [console.groq.com](https://console.groq.com/) (CV parsing and LLM scoring)

## Quick start (local development)

### 1. Database

```bash
cd core-service
docker compose up -d postgres
```

PostgreSQL listens on **`localhost:15432`** (user/password/db: `tunhire` / `tunhire` / `tunhire`).

### 2. AI service

```bash
cd ai-service
python -m pip install -r requirements.txt
copy .env.example .env    # Windows
# Set GROQ_API_KEY in .env

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Health: http://127.0.0.1:8000/health

On first run, the SBERT model downloads once (~400 MB).

### 3. Core service

```bash
cd core-service
copy .env.example .env    # optional — defaults work with Compose Postgres

./mvnw spring-boot:run    # Linux/macOS
# or: mvnw.cmd spring-boot:run   # Windows
```

API base: http://localhost:8181

### 4. Frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

Set `NEXT_PUBLIC_API_URL=http://localhost:8181` in `.env.local`.

### Run order

1. PostgreSQL  
2. `ai-service` (port 8000)  
3. `core-service` (port 8181)  
4. `frontend` (port 3000)

## Environment variables

### `core-service`

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | JDBC URL | `jdbc:postgresql://localhost:15432/tunhire` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | DB credentials | `tunhire` |
| `JWT_SECRET` | Signing key (≥ 32 chars) | see `application.properties` |
| `ai.service.url` | AI service base URL | `http://localhost:8000` |

### `ai-service`

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Required for CV parsing and LLM ranking |
| `SCORER_MODE` | `hybrid` (default), `embedding`, or `llm` |
| `SCORER_EMBED_WEIGHT` / `LLM` / `RULES` | Hybrid blend (default 0.4 / 0.4 / 0.2) |

### `frontend`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Core API URL (`http://localhost:8181`) |

## Main API surface

| Area | Examples |
|------|----------|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Jobs | `GET /jobs` (public), `POST /jobs` (recruiter) |
| Candidate | `GET /candidates/me`, `POST /candidates/me/cv/parse` |
| Applications | `POST /applications`, `GET /applications/job/{jobId}/ranked` |
| Companies | `POST /companies`, invites, team, dashboard |
| Chat | REST + WebSocket (STOMP) |
| AI (direct) | `POST /v1/cv/parse`, `POST /v2/match`, `POST /v2/rank` |

## User roles

| Role | Scope |
|------|--------|
| `CANDIDATE` | Profile, applications, chat |
| `RECRUITER` | Companies, jobs, applicants, ranking |
| `RECRUITER_ADMIN` | Company admin (team, settings) |
| `MEMBER` | Company member (jobs & applications) |

## Scoring pipeline (summary)

1. **CV** — PDF → pdfplumber → Groq → structured profile  
2. **Match** — composite job/candidate text → SBERT cosine similarity  
3. **Rules** — experience level, location, profile completeness  
4. **Groq** — optional LLM evaluation  
5. **Blend** — `0.4×embed + 0.4×LLM + 0.2×rules` (or `0.7×embed + 0.3×rules` without Groq)  
6. **Cache** — scores stored per application in PostgreSQL; invalidated when job, profile, or scorer version changes  

## Docker (core + database)

To run the packaged core service with Postgres:

```bash
cd core-service
docker compose up -d
```

The app image is exposed on **port 8081** (container port 8080). Adjust `NEXT_PUBLIC_API_URL` accordingly if you use this mode instead of local Maven.

## Further reading

- [`frontend/README.md`](frontend/README.md) — routes, frontend architecture, test flows  
- [`ai-service/README.md`](ai-service/README.md) — AI endpoints and troubleshooting  
- [`core-service/chat-arch.md`](core-service/chat-arch.md) — backend modules and API notes  

## License

Academic / project repository — see repository owner for usage terms.
