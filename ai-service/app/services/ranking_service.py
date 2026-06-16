import os
from typing import List

from app.schemas.matching_v2 import (
    CandidateMatchInput,
    CandidateRankV2,
    JobMatchInput,
    MatchResultV2,
)
from app.services.matching_service import match_structured
from app.services.rules_service import compute_rules_score, score_to_level

EMBED_WEIGHT = float(os.getenv("SCORER_EMBED_WEIGHT", "0.4"))
LLM_WEIGHT = float(os.getenv("SCORER_LLM_WEIGHT", "0.4"))
RULES_WEIGHT = float(os.getenv("SCORER_RULES_WEIGHT", "0.2"))
EMBED_ONLY_EMBED_WEIGHT = float(os.getenv("SCORER_EMBED_ONLY_EMBED_WEIGHT", "0.7"))
EMBED_ONLY_RULES_WEIGHT = float(os.getenv("SCORER_EMBED_ONLY_RULES_WEIGHT", "0.3"))


def build_job_text(job: JobMatchInput) -> str:
    parts = [
        f"Titre: {job.title}".strip(),
        f"Lieu: {job.location}".strip() if job.location else "",
        f"Mode: {job.work_mode}".strip() if job.work_mode else "",
        f"Contrat: {job.contract_type}".strip() if job.contract_type else "",
        f"Niveau: {job.experience_level}".strip() if job.experience_level else "",
    ]
    if job.salary_min is not None or job.salary_max is not None:
        parts.append(f"Salaire: {job.salary_min or '?'} - {job.salary_max or '?'} DT")
    parts.append(job.description or "")
    return "\n".join(part for part in parts if part)


def build_candidate_text(candidate: CandidateMatchInput) -> str:
    parts = []
    if candidate.years_experience is not None:
        parts.append(f"Expérience: {candidate.years_experience} ans")
    if candidate.location:
        parts.append(f"Lieu: {candidate.location}")
    if candidate.bio:
        parts.append(f"Bio: {candidate.bio}")
    if candidate.skills:
        parts.append("Compétences: " + ", ".join(candidate.skills))
    if candidate.education:
        parts.append("Formation: " + "; ".join(candidate.education))
    if candidate.languages:
        parts.append("Langues: " + ", ".join(candidate.languages))
    if candidate.cv_summary:
        parts.append(f"Résumé CV: {candidate.cv_summary}")
    if candidate.available_from:
        parts.append(f"Disponible à partir de: {candidate.available_from}")
    return "\n".join(parts)


def _blend_scores(
    embedding_score: int,
    rules_score: int,
    llm_score: int | None,
    use_llm: bool,
) -> int:
    if use_llm and llm_score is not None:
        final = (
            EMBED_WEIGHT * embedding_score
            + LLM_WEIGHT * llm_score
            + RULES_WEIGHT * rules_score
        )
    else:
        final = (
            EMBED_ONLY_EMBED_WEIGHT * embedding_score
            + EMBED_ONLY_RULES_WEIGHT * rules_score
        )
    return max(0, min(100, round(final)))


def score_candidate(
    job: JobMatchInput,
    candidate: CandidateMatchInput,
    llm_result: MatchResultV2 | None = None,
) -> MatchResultV2:
    job_text = build_job_text(job)
    candidate_text = build_candidate_text(candidate)

    if not candidate_text.strip():
        rules_score, gaps = compute_rules_score(job, candidate)
        return MatchResultV2(
            score=0,
            level="Weak Match",
            matched_skills=[],
            gaps=gaps,
            summary=llm_result.summary if llm_result else None,
        )

    embedding = match_structured(
        candidate.skills,
        job_text,
        candidate_text,
    )
    rules_score, rule_gaps = compute_rules_score(job, candidate)

    llm_score = llm_result.score if llm_result else None
    use_llm = llm_result is not None and os.getenv("GROQ_API_KEY")

    final_score = _blend_scores(
        embedding["score"],
        rules_score,
        llm_score,
        bool(use_llm),
    )

    gaps = list(dict.fromkeys(rule_gaps + (llm_result.gaps if llm_result else [])))
    matched_skills = embedding["matched_skills"]
    if llm_result and llm_result.matched_skills:
        merged = list(dict.fromkeys(matched_skills + llm_result.matched_skills))
        matched_skills = merged

    summary = llm_result.summary if llm_result else None

    if not candidate.skills and final_score > 0:
        final_score = min(final_score, rules_score)

    return MatchResultV2(
        score=final_score,
        level=score_to_level(final_score),
        matched_skills=matched_skills,
        gaps=gaps,
        summary=summary,
    )


def rank_candidates(
    job: JobMatchInput,
    candidates: List[CandidateMatchInput],
    llm_results: dict[int, MatchResultV2] | None = None,
) -> List[CandidateRankV2]:
    llm_results = llm_results or {}
    rankings: List[CandidateRankV2] = []
    for candidate in candidates:
        llm_result = llm_results.get(candidate.candidate_id)
        result = score_candidate(job, candidate, llm_result)
        rankings.append(
            CandidateRankV2(
                candidate_id=candidate.candidate_id,
                **result.model_dump(),
            )
        )
    rankings.sort(key=lambda item: item.score, reverse=True)
    return rankings


def current_scorer_version() -> str:
    mode = os.getenv("SCORER_MODE", "hybrid").lower()
    if mode == "embedding":
        return "1.0"
    if os.getenv("GROQ_API_KEY"):
        return "2.0"
    return "1.0"
