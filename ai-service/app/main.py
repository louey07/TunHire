from fastapi import FastAPI
from app.api.routes import cv_parser
from app.api.routes import matcher
from app.api.routes import ranker

app = FastAPI(title="TunHire AI Service - CV Parser", version="1.0.0")

app.include_router(cv_parser.router, prefix="/v1/cv", tags=["CV Parsing"])
app.include_router(matcher.router, prefix="/v1", tags=["Matching"])
app.include_router(ranker.router, prefix="/v1", tags=["Ranking"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}
