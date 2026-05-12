from sentence_transformers import SentenceTransformer, util

_model = None


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


def match_candidate_to_job(candidate_skills: list, job_description: str) -> dict:
    model = _get_model()

    candidate_string = ", ".join(candidate_skills)

    candidate_emb, job_emb = model.encode(
        [candidate_string, job_description], convert_to_tensor=True
    )
    similarity = float(util.cos_sim(candidate_emb, job_emb)[0][0])
    score = max(0, min(100, round(similarity * 100)))

    skill_embs = model.encode(candidate_skills, convert_to_tensor=True)
    skill_scores = util.cos_sim(skill_embs, job_emb).squeeze(1).tolist()

    # Pick skills whose individual score is in the top half relative to the overall match
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
