from typing import List, Optional

from pydantic import BaseModel, Field


class JobMatchInput(BaseModel):
    title: str = ""
    description: str = ""
    location: str = ""
    work_mode: Optional[str] = None
    contract_type: Optional[str] = None
    experience_level: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None


class CandidateMatchInput(BaseModel):
    candidate_id: int
    skills: List[str] = Field(default_factory=list)
    bio: Optional[str] = None
    location: Optional[str] = None
    years_experience: Optional[int] = None
    available_from: Optional[str] = None
    languages: List[str] = Field(default_factory=list)
    education: List[str] = Field(default_factory=list)
    cv_summary: Optional[str] = None


class MatchResultV2(BaseModel):
    score: int
    level: str
    matched_skills: List[str]
    gaps: List[str] = Field(default_factory=list)
    summary: Optional[str] = None


class MatchRequestV2(BaseModel):
    job: JobMatchInput
    candidate: CandidateMatchInput


class MatchResponseV2(MatchResultV2):
    pass


class CandidateRankV2(MatchResultV2):
    candidate_id: int


class RankRequestV2(BaseModel):
    job: JobMatchInput
    candidates: List[CandidateMatchInput]


class RankResponseV2(BaseModel):
    scorer_version: str
    rankings: List[CandidateRankV2]
