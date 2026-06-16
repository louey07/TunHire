from fastapi import APIRouter, HTTPException

from app.schemas.matching_v2 import MatchRequestV2, MatchResponseV2, RankRequestV2, RankResponseV2
from app.services.llm_ranking_service import score_batch_with_llm, score_with_llm
from app.services.ranking_service import current_scorer_version, rank_candidates, score_candidate

router = APIRouter()


@router.post("/match", response_model=MatchResponseV2)
def match_v2(request: MatchRequestV2):
    if not request.job.description.strip() and not request.job.title.strip():
        raise HTTPException(status_code=400, detail="job title or description is required.")

    llm_result = score_with_llm(request.job, request.candidate)
    result = score_candidate(request.job, request.candidate, llm_result)
    return MatchResponseV2(**result.model_dump())


@router.post("/rank", response_model=RankResponseV2)
def rank_v2(request: RankRequestV2):
    if not request.candidates:
        raise HTTPException(status_code=400, detail="candidates list must not be empty.")
    if not request.job.description.strip() and not request.job.title.strip():
        raise HTTPException(status_code=400, detail="job title or description is required.")

    llm_results = score_batch_with_llm(request.job, request.candidates)
    rankings = rank_candidates(request.job, request.candidates, llm_results)
    return RankResponseV2(
        scorer_version=current_scorer_version(),
        rankings=rankings,
    )
