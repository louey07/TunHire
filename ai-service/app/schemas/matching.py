from typing import List
from pydantic import BaseModel


class MatchRequest(BaseModel):
    candidate_skills: List[str]
    job_description: str


class MatchResponse(BaseModel):
    score: int
    level: str
    matched_skills: List[str]
