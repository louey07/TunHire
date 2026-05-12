# TunHire AI Service — Architecture & Design Document

## 1. Overview
The `ai-service` is a dedicated Python microservice built with **FastAPI**. It provides advanced Natural Language Processing (NLP) and Machine Learning (ML) capabilities for the TunHire platform. Offloading these CPU/memory-intensive tasks from the main Spring Boot `core-service` ensures scalability, better performance, and allows utilizing the rich Python AI ecosystem.

## 2. Tech Stack & Libraries
- **Framework**: Python 3.11+, FastAPI, Uvicorn, Pydantic
- **Database & Storage**: PostgreSQL with `pgvector` extension, `SQLAlchemy`, `psycopg2-binary` (for storing vector embeddings)
- **CV Parsing**: `pdfplumber` (PDFs), `python-docx` (DOCX), `spaCy` (`fr_core_news_md` for French NER)
- **Semantic Matching & Ranking**: `sentence-transformers` (embeddings), `scikit-learn` / `numpy` (cosine similarity)
- **Text Generation (Job Descriptions)**: `transformers`, `langchain`, or `llama-cpp-python` (depending on whether a local LLM or an API-based LLM like OpenAI is used)
- **Code Quality**: `pytest`, `black`, `flake8`

## 3. Core Features

### 3.1. CV Parsing (Extraction & Structuring)
- **Goal**: Convert raw PDF/DOCX resumes into a structured JSON profile.
- **Process**:
  1. Extract raw text using `pdfplumber`/`python-docx`.
  2. Use Regex and `spaCy` to extract Entities (Name, Email, Phone, Location).
  3. Extract "Skills" and "Education" using section-based splitting and keyword matching.
  4. Calculate `confidence_score` and return a validated Pydantic schema.

### 3.2. Semantic Matching
- **Goal**: Understand the contextual similarity between a candidate's profile (skills, experience) and a job's requirements.
- **Process**:
  1. Convert parsed Candidate Skills and Job Requirements into vector embeddings using `sentence-transformers` (e.g., `paraphrase-multilingual-MiniLM-L12-v2`).
  2. Compute Cosine Similarity to determine the semantic match percentage.
  3. Overcome exact-keyword limitations (e.g., knowing that "React" and "Next.js" are related, or "PostgreSQL" and "RDBMS" match).

### 3.3. Job Description Text Generation
- **Goal**: Auto-generate professional and attractive job descriptions for recruiters based on a few keywords (title, tech stack, location).
- **Process**:
  1. Recruiter inputs a prompt (e.g., "Senior Java Developer in Tunis, requires Spring Boot and Docker").
  2. A Language Model (Local LLM or API) receives a prompt template.
  3. The model streams or returns a formatted Markdown/Text job description.

### 3.4. Candidate Ranking
- **Goal**: Given a `job_id` and a list of `candidates`, return a sorted leaderboard of the best matches.
- **Process**:
  1. Gather the semantic matching score (Weight: ~50%).
  2. Apply heuristic rules: Experience overlap (Weight: ~30%), Location match (Weight: ~20%).
  3. Return a sorted list with a detailed breakdown of *why* each candidate matched.

## 4. Project Structure
To maintain clean code, the service will follow a domain-driven structure:

```text
ai-service/
├── app/
│   ├── main.py                     # FastAPI application instance & setup
│   ├── api/
│   │   ├── routes/                 # Endpoint definitions
│   │   │   ├── cv_parser.py
│   │   │   ├── matcher.py
│   │   │   ├── generator.py
│   │   │   └── ranker.py
│   ├── core/                       # App configuration, env vars
│   │   └── config.py
│   ├── schemas/                    # Pydantic models (Requests/Responses)
│   │   ├── cv.py
│   │   ├── matching.py
│   │   └── ranking.py
│   ├── services/                   # Heavy lifting / Business Logic
│   │   ├── parsing_service.py
│   │   ├── embedding_service.py
│   │   ├── llm_service.py          # LLM integrations
│   │   └── scoring_service.py
│   └── utils/                      # Helper functions (text cleaner, etc.)
├── data/                           # (Ignored in git) Local models/test CVs
├── tests/                          # Pytest test cases
├── requirements.txt
└── Dockerfile                      # Containerization for the AI service
```

## 5. API Design (Draft)

- `POST /v1/cv/parse`
  - **Body**: `multipart/form-data` (file)
  - **Returns**: Structured Candidate JSON.

- `POST /v1/match`
  - **Body**: JSON with `job_requirements` and `candidate_skills`.
  - **Returns**: `{ "similarity_score": 0.85, "matched_skills": [...] }`

- `POST /v1/rank`
  - **Body**: JSON with a Job profile and a List of Candidate profiles.
  - **Returns**: Sorted list of Candidates with detailed scoring.

- `POST /v1/generate/job-description`
  - **Body**: JSON with `job_title`, `keywords`, `experience_level`.
  - **Returns**: `{ "description": "L'entreprise Acme recherche..." }`

## 6. Integration with `core-service`
1. The **Spring Boot app** (`core-service`) will act as the Gateway.
2. When the frontend requests a CV parsing or Ranking, the `core-service` makes a synchronous HTTP REST call to the `ai-service`.
3. The `ai-service` will run on an internal Docker network (e.g., port `8000`) and will not be directly exposed to the public internet.

## 7. Database & Storage Architecture (Vector Data)
To support high-performance semantic matching without having to recalculate embeddings on every single request, the `ai-service` requires a specialized storage solution for **vector embeddings**.

### 7.1 Database Choice: PostgreSQL with `pgvector`
Since `core-service` already uses PostgreSQL, the most architecturally sound choice is to install the **`pgvector`** extension in the existing database infrastructure (or run a secondary Postgres container exclusively for the `ai-service`). 
- Alternatively, dedicated specialized vector databases like **Qdrant** or **Milvus** can be used if scale demands it, but `pgvector` keeps the infrastructure stack slim.
- `pgvector` allows us to store the 384-dimensional arrays directly alongside AI-specific metadata and query them using approximate nearest neighbor algorithms (e.g., Cosine Distance `<=>`).

### 7.2 Data Ownership & Flow
1. **Primary Data (Source of Truth)**: The `core-service` owns the factual data (Candidate names, true job descriptions, application status).
2. **AI Data (Derived Data)**: The `ai-service` maintains specialized tables for vector math (e.g., `candidate_embeddings`, `job_embeddings`).
   - **Columns**: `id` (UUID), `entity_id` (Reference back to `core-service` IDs), `entity_type` (CANDIDATE | JOB), `embedding` (vector(384)).
3. **Sync Mechanism**: When a candidate updates their CV, or a recruiter posts a Job, `core-service` kicks off an async request to `ai-service` to re-calculate and overwrite their embedding in the Vector DB.

### 7.3 Querying for Matches (How Ranking Works)
When a recruiter clicks "Find Candidates" for a specific Job:
1. `core-service` calls `POST /v1/match` sending the `job_id`.
2. `ai-service` retrieves the pre-computed `job_embedding` from its vector tables.
3. It runs a vector similarity search SQL query (e.g., `SELECT entity_id, (embedding <=> job_embedding) as similarity FROM candidate_embeddings ORDER BY similarity LIMIT 10;`).
4. `ai-service` returns the sorted `entity_id` values with their match scores.
5. `core-service` hydrates these bare IDs with the exact User/Profile data from its main tables to display to the recruiter in the UI.