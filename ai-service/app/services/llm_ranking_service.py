import json
import logging
import os
import re
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from groq import Groq

from app.schemas.matching_v2 import (
    CandidateMatchInput,
    JobMatchInput,
    MatchResultV2,
)
from app.services.rules_service import score_to_level

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

logger = logging.getLogger(__name__)

_GROQ_MODEL = "llama-3.3-70b-versatile"

_PROMPT = """Tu es un expert recrutement en Tunisie. Évalue l'adéquation candidat/offre.

Règle de notation (score 0-100):
- Compétences techniques et métier: 40%
- Expérience et seniority: 25%
- Localisation et mode de travail: 15%
- Formation et langues: 10%
- Cohérence globale du profil: 10%

Réponds UNIQUEMENT avec un JSON valide (sans markdown) contenant:
- score: entier 0-100
- level: "Weak Match" | "Average Match" | "Good Match" | "Excellent Match"
- matched_skills: liste de strings (compétences du candidat pertinentes pour l'offre)
- gaps: liste de strings en français (écarts ou manques)
- summary: une phrase en français expliquant le score pour un recruteur
"""


def _is_enabled() -> bool:
    mode = os.getenv("SCORER_MODE", "hybrid").lower()
    return mode in {"hybrid", "llm"} and bool(os.getenv("GROQ_API_KEY"))


def score_with_llm(
    job: JobMatchInput, candidate: CandidateMatchInput
) -> MatchResultV2 | None:
    if not _is_enabled():
        return None

    api_key = os.getenv("GROQ_API_KEY", "")
    try:
        client = Groq(api_key=api_key)
        payload = {
            "job": job.model_dump(),
            "candidate": candidate.model_dump(),
        }
        response = client.chat.completions.create(
            model=_GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": f"{_PROMPT}\n\nDONNÉES:\n{json.dumps(payload, ensure_ascii=False)}",
                }
            ],
            temperature=0,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)

        score = max(0, min(100, int(data.get("score", 0))))
        level = str(data.get("level") or score_to_level(score))
        matched = list(data.get("matched_skills") or [])
        gaps = list(data.get("gaps") or [])
        summary = data.get("summary")

        return MatchResultV2(
            score=score,
            level=level,
            matched_skills=matched,
            gaps=gaps,
            summary=summary,
        )
    except Exception:
        logger.exception("LLM ranking failed for candidate %s", candidate.candidate_id)
        return None


def score_batch_with_llm(
    job: JobMatchInput, candidates: List[CandidateMatchInput]
) -> dict[int, MatchResultV2]:
    results: dict[int, MatchResultV2] = {}
    for candidate in candidates:
        llm_result = score_with_llm(job, candidate)
        if llm_result is not None:
            results[candidate.candidate_id] = llm_result
    return results
