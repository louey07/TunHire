# TunHire AI Service — Architecture (Current Implementation)

## 1. Overview
The `ai-service` is a Python microservice built with FastAPI. It provides three production endpoints used by `core-service`:
- CV parsing from uploaded PDF/DOCX files.
- Candidate-to-job semantic matching.
- Candidate ranking for a given job description.

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
- `full_name`, `email`, `phone`, `location`, `years_experience`, `skills`, `languages`, `education`, `confidence_score`.

### 3.2 Semantic Match (`POST /v1/match`)
**Input**
- `candidate_skills` (list of strings)
- `job_description` (string)

**Flow**
1. Join candidate skills into one text.
2. Encode candidate text and job description into embeddings using `sentence-transformers`.
3. Compute cosine similarity.
4. Convert similarity into score (0–100) and level (`Weak`, `Average`, `Good`, `Excellent`).
5. Compute per-skill similarity and return `matched_skills` above dynamic threshold.

### 3.3 Candidate Ranking (`POST /v1/rank`)
**Input**
- `job_description` (string)
- `candidates`: list of `{ candidate_id, skills }`

**Flow**
1. For each candidate, call same matching logic used by `/v1/match`.
2. Build candidate score/level/matched skills.
3. Sort by score descending.
4. Return ranked list.

## 4. Current API Surface
- `GET /health`
- `POST /v1/cv/parse`
- `POST /v1/match`
- `POST /v1/rank`

No job-description generation endpoint is currently implemented in the codebase.

## 5. Project Structure (As-Is)
```text
ai-service/
├── app/
│   ├── main.py
│   ├── api/routes/
│   │   ├── cv_parser.py
│   │   ├── matcher.py
│   │   └── ranker.py
│   ├── schemas/
│   │   ├── cv.py
│   │   ├── matching.py
│   │   └── ranking.py
│   ├── services/
│   │   ├── parsing_service.py
│   │   └── matching_service.py
│   └── utils/
│       └── text_extractor.py
├── requirements.txt
├── architecture.md
└── test_parsing.py
```

## 6. Integration with `core-service`
1. `core-service` acts as the caller/gateway.
2. `core-service` invokes:
   - `POST /v1/cv/parse` to parse uploaded CVs.
   - `POST /v1/match` for one candidate/job comparison.
   - `POST /v1/rank` to rank job applicants by skills against a job description.
3. If `ai-service` is unavailable, `core-service` logs a warning and continues with safe fallback behavior (`null` response handling).

## 7. Data & Storage Model (Current State)
- There is no dedicated AI database layer in `ai-service` right now.
- No vector database (`pgvector`, Qdrant, Milvus, etc.) is currently used in implementation.
- Embeddings are generated per request and kept in memory only for the request lifecycle.

This is acceptable for the current scope (ranking applicants already selected by `core-service`), and keeps architecture simple.

## 8. Known Gaps and Next Steps

### 8.1 Dependency alignment
The code imports packages not currently listed in `requirements.txt` (for example `groq`, `python-dotenv`, `sentence-transformers`).  
The requirements file should be aligned with real runtime imports.

### 8.2 Optional future enhancement: vector persistence
If TunHire adds platform-wide semantic search (e.g., retrieve top candidates from all profiles), introduce vector persistence (such as PostgreSQL + `pgvector`) and asynchronous re-embedding pipelines.