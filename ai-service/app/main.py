import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI
from app.api.routes import cv_parser
from app.api.routes import matcher_v2
from app.services import matching_service

app = FastAPI(title="TunHire AI Service", version="2.0.0")

app.include_router(cv_parser.router, prefix="/v1/cv", tags=["CV Parsing"])
app.include_router(matcher_v2.router, prefix="/v2", tags=["Matching"])


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
