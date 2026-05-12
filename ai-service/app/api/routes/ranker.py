from fastapi import APIRouter, HTTPException
from app.schemas.ranking import RankRequest, RankResponse, CandidateRank
from app.services.matching_service import match_candidate_to_job

router = APIRouter()


@router.post("/rank", response_model=RankResponse)
def rank_candidates(request: RankRequest):
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description must not be empty.")
    if not request.candidates:
        raise HTTPException(status_code=400, detail="candidates list must not be empty.")

    rankings = []
    for candidate in request.candidates:
        if not candidate.skills:
            result = {"score": 0, "level": "Weak Match", "matched_skills": []}
        else:
            result = match_candidate_to_job(candidate.skills, request.job_description)
        rankings.append(CandidateRank(candidate_id=candidate.candidate_id, **result))

    rankings.sort(key=lambda c: c.score, reverse=True)
    return RankResponse(rankings=rankings)
