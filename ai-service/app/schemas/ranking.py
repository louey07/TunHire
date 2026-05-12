from typing import List
from pydantic import BaseModel


class CandidateInput(BaseModel):
    candidate_id: int
    skills: List[str]


class CandidateRank(BaseModel):
    candidate_id: int
    score: int
    level: str
    matched_skills: List[str]


class RankRequest(BaseModel):
    job_description: str
    candidates: List[CandidateInput]


class RankResponse(BaseModel):
    rankings: List[CandidateRank]
