import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI
from app.api.routes import cv_parser
from app.api.routes import matcher
from app.api.routes import ranker
from app.services import matching_service

app = FastAPI(title="TunHire AI Service - CV Parser", version="1.0.0")

app.include_router(cv_parser.router, prefix="/v1/cv", tags=["CV Parsing"])
app.include_router(matcher.router, prefix="/v1", tags=["Matching"])
app.include_router(ranker.router, prefix="/v1", tags=["Ranking"])


@app.on_event("startup")
def preload_matching_model() -> None:
    """Download/load the embedding model at startup instead of on first request."""
    matching_service.warmup_model()


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "matching_model_ready": matching_service.is_model_ready(),
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
    }
