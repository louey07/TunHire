# TunHire AI Service — Architecture (Current Implementation)

## 1. Overview
The `ai-service` is a Python microservice built with FastAPI. It provides production endpoints used by `core-service`:
- CV parsing from uploaded PDF/DOCX files.
- Structured candidate-to-job matching and ranking (v2).

The service is currently stateless: it computes results on request and does not persist embeddings.

## 2. Current Tech Stack
- **Runtime/API**: Python, FastAPI, Uvicorn, Pydantic.
- **File extraction**: `pdfplumber` (PDF), `python-docx` (DOCX).
- **CV parsing**: Groq Chat Completions (`llama-3.3-70b-versatile`) with structured JSON extraction prompt.
- **Semantic matching/ranking**: `sentence-transformers` (`paraphrase-multilingual-MiniLM-L12-v2`) + cosine similarity.
- **Transport**: Synchronous HTTP calls from Spring Boot `core-service` to `ai-service`.

## 3. Implemented Features

### 3.1 CV Parsing (`POST /v1/cv/parse`)
**Input**
- Multipart file upload (`.pdf` or `.docx`).

**Flow**
1. Extract raw text from file (`pdfplumber` / `python-docx`).
2. Send CV text to Groq with a strict prompt to return valid JSON only.
3. Normalize fields and fallback values.
4. Return parsed profile with confidence score and parser version.

**Output (high-level)**
- `full_name`, `email`, `phone`, `location`, `years_experience`, `skills`, `languages`, `education`, `cv_summary`, `confidence_score`.

### 3.2 Structured ranking v2 (`POST /v2/rank`, `POST /v2/match`)

**Input**
- `job`: title, description, location, work_mode, contract_type, experience_level, salary range
- `candidate(s)`: skills, bio, location, years_experience, languages, education, cv_summary

**Flow**
1. Build composite text for job and candidate.
2. Embedding similarity on full texts (not skills-only).
3. Rule-based adjustments (experience level, incomplete profile, location/work mode).
4. Optional Groq LLM score + French summary when `GROQ_API_KEY` and `SCORER_MODE=hybrid|llm`.
5. Blend scores and return `gaps`, `matched_skills`, `summary`, `scorer_version`.

**Core-service caching:** `core-service` stores results in `application_match_scores` and reuses them until job/profile/scorer version changes.

No job-description generation endpoint is currently implemented in the codebase.

## 4. Current API Surface
- `GET /health`
- `POST /v1/cv/parse`
- `POST /v2/match` (structured job + candidate profile)
- `POST /v2/rank` (structured batch ranking; hybrid embed + rules + optional Groq LLM)

## 5. Project Structure (As-Is)
```text
ai-service/
├── app/
│   ├── main.py
│   ├── api/routes/
│   │   ├── cv_parser.py
│   │   └── matcher_v2.py
│   ├── schemas/
│   │   ├── cv.py
│   │   └── matching_v2.py
│   ├── services/
│   │   ├── parsing_service.py
│   │   ├── matching_service.py
│   │   ├── ranking_service.py
│   │   ├── rules_service.py
│   │   └── llm_ranking_service.py
│   └── utils/
│       └── text_extractor.py
├── requirements.txt
├── architecture.md
├── test_parsing.py
└── test_ranking.py
```

## 6. Integration with `core-service`
1. `core-service` acts as the caller/gateway.
2. `core-service` invokes:
   - `POST /v1/cv/parse` to parse uploaded CVs (returns `cv_summary`, education, languages).
   - `POST /v2/rank` to rank job applicants using structured job + profile payloads.
3. `core-service` caches v2 rank results in PostgreSQL (`application_match_scores`) and reuses them when job/profile/scorer version hashes are unchanged.
4. If `ai-service` is unavailable, `core-service` logs a warning and returns ranked applications with `null` scores.

## 7. Data & Storage Model (Current State)
- There is no dedicated AI database layer in `ai-service`; scoring is stateless per request.
- **Score persistence lives in `core-service`:** table `application_match_scores` stores score, level, matched skills, gaps, summary, and freshness hashes.
- No vector database (`pgvector`, Qdrant, Milvus, etc.) is used; embeddings are computed in-memory per request.

This is acceptable for ranking applicants on a single job (typically fewer than 100 profiles per batch).

## 8. Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `SCORER_MODE` | `hybrid` | `embedding`, `hybrid`, or `llm` |
| `GROQ_API_KEY` | — | Enables LLM scoring + French recruiter summary |
| `EMBED_RULES_BLEND_*` | 0.7 / 0.3 | Weights when LLM disabled |
| `HYBRID_BLEND_*` | 0.4 / 0.4 / 0.2 | embed / llm / rules when LLM enabled |

`core-service` sets `ai.scorer.version` (default `2.0`) to invalidate cached scores after scorer upgrades.

## 9. Known Gaps and Next Steps

### 9.1 Optional future enhancements
- Async precompute on application submit.
- pgvector for platform-wide candidate discovery.
- Manual "Recalculer" button for recruiters.