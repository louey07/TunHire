import os
import re
from typing import List, Tuple

from app.schemas.matching_v2 import CandidateMatchInput, JobMatchInput

_EXPERIENCE_MIN_YEARS = {
    "STAGIAIRE": 0,
    "JUNIOR": 0,
    "INTERMEDIAIRE": 2,
    "SENIOR": 5,
}

_LEVEL_LABELS = {
    "STAGIAIRE": "Stagiaire",
    "JUNIOR": "Junior",
    "INTERMEDIAIRE": "Intermédiaire",
    "SENIOR": "Senior",
}


def _normalize_level(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = re.sub(r"[^A-Za-z]", "", value).upper()
    aliases = {
        "STAGE": "STAGIAIRE",
        "INTERMEDIAIRE": "INTERMEDIAIRE",
        "INTERMEDIATE": "INTERMEDIAIRE",
    }
    return aliases.get(cleaned, cleaned)


def compute_rules_score(
    job: JobMatchInput, candidate: CandidateMatchInput
) -> Tuple[int, List[str]]:
    """Return rules score 0-100 and gap messages."""
    score = 100
    gaps: List[str] = []

    skills = [s for s in candidate.skills if s and s.strip()]
    has_profile_data = bool(
        skills
        or (candidate.cv_summary and candidate.cv_summary.strip())
        or candidate.years_experience is not None
    )

    if not has_profile_data:
        gaps.append("Profil incomplet")
        return 0, gaps

    if not skills:
        score -= 15
        gaps.append("Aucune compétence renseignée")

    required_level = _normalize_level(job.experience_level)
    candidate_years = candidate.years_experience or 0
    if required_level and required_level in _EXPERIENCE_MIN_YEARS:
        min_years = _EXPERIENCE_MIN_YEARS[required_level]
        if candidate_years < min_years:
            score -= 25
            label = _LEVEL_LABELS.get(required_level, required_level)
            gaps.append(f"Expérience inférieure au niveau demandé ({label})")

    work_mode = (job.work_mode or "").upper()
    job_location = (job.location or "").strip().lower()
    candidate_location = (candidate.location or "").strip().lower()
    if (
        work_mode == "ON_SITE"
        and job_location
        and candidate_location
        and job_location not in candidate_location
        and candidate_location not in job_location
    ):
        score -= 10
        gaps.append("Éloignement géographique possible")

    return max(0, min(100, score)), gaps


def score_to_level(score: int) -> str:
    if score <= 30:
        return "Weak Match"
    if score <= 60:
        return "Average Match"
    if score <= 80:
        return "Good Match"
    return "Excellent Match"
