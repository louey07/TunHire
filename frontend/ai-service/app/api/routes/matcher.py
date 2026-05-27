from fastapi import APIRouter, HTTPException
from app.schemas.matching import MatchRequest, MatchResponse
from app.services.matching_service import match_candidate_to_job

router = APIRouter()


@router.post("/match", response_model=MatchResponse)
def match(request: MatchRequest):
    if not request.candidate_skills:
        raise HTTPException(status_code=400, detail="candidate_skills must not be empty.")
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description must not be empty.")

    result = match_candidate_to_job(request.candidate_skills, request.job_description)
    return MatchResponse(**result)
