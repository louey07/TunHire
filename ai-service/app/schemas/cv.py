from typing import List, Optional
from pydantic import BaseModel, Field

class Education(BaseModel):
    degree: str
    school: str
    dates: str
    mention: Optional[str] = None

class CVParseResult(BaseModel):
    candidate_id: Optional[str] = None
    full_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    years_experience: int = 0
    skills: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    education: List[str] = Field(default_factory=list)
    raw_text: str = Field(exclude=True)
    parser_version: str = "1.0.0"
    confidence_score: float = 0.0
