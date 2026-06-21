# TunHire AI Service

Python microservice for CV parsing, candidate matching, and ranking.

## Prerequisites

- Python 3.10+
- A [Groq API key](https://console.groq.com/) for CV parsing (`GROQ_API_KEY`)

## Setup

```bash
cd ai-service
python -m pip install -r requirements.txt
copy .env.example .env
# Edit .env and set GROQ_API_KEY=your_key
```

On first start, the matching model (`paraphrase-multilingual-MiniLM-L12-v2`) is downloaded (~400 MB). This happens once at startup and can take a few minutes on a slow connection.

## Run

```bash
cd ai-service
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Health check: http://127.0.0.1:8000/health

The Spring `core-service` expects the AI service at `http://localhost:8000` (see `ai.service.url` in `core-service/src/main/resources/application.properties`).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Service status + model readiness |
| POST | `/v1/cv/parse` | Parse PDF/DOCX CV (multipart `file`) |
| POST | `/v2/match` | Score one structured job + candidate profile |
| POST | `/v2/rank` | Rank multiple candidates for a structured job |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ModuleNotFoundError` on start | Run `python -m pip install -r requirements.txt` |
| CV parsing returns empty fields | Set `GROQ_API_KEY` in `ai-service/.env` |
| Recruiter scores always `null` | Ensure AI service is running on port 8000 |
| First rank request very slow | Normal on first run while the model downloads; wait for startup logs |
| `Connection refused` from core-service | Start uvicorn before using ranked candidates or CV upload |
