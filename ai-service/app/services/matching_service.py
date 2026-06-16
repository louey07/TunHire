from sentence_transformers import SentenceTransformer, util

_model = None


def is_model_ready() -> bool:
    return _model is not None


def warmup_model() -> None:
    _get_model()


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    return _model


def _score_to_level(score: int) -> str:
    if score <= 30:
        return "Weak Match"
    if score <= 60:
        return "Average Match"
    if score <= 80:
        return "Good Match"
    return "Excellent Match"


def match_structured(
    candidate_skills: list,
    job_text: str,
    candidate_text: str,
) -> dict:
    """Embed composite job vs candidate texts; derive matched skills from skill list."""
    model = _get_model()

    if not candidate_text.strip():
        return {"score": 0, "level": "Weak Match", "matched_skills": []}

    candidate_emb, job_emb = model.encode(
        [candidate_text, job_text], convert_to_tensor=True
    )
    similarity = float(util.cos_sim(candidate_emb, job_emb)[0][0])
    score = max(0, min(100, round(similarity * 100)))

    matched_skills: list[str] = []
    if candidate_skills:
        skill_embs = model.encode(candidate_skills, convert_to_tensor=True)
        skill_scores = util.cos_sim(skill_embs, job_emb).squeeze(1).tolist()
        threshold = max(0.25, similarity * 0.5)
        matched_skills = [
            skill
            for skill, s in zip(candidate_skills, skill_scores)
            if s >= threshold
        ]

    return {
        "score": score,
        "level": _score_to_level(score),
        "matched_skills": matched_skills,
    }
