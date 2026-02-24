from pydantic import BaseModel, Field, conint
from typing import List, Optional


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)

class ChatResponse(BaseModel):
    text: str


class JobMatchRequest(BaseModel):
    jobDescription: Optional[str] = Field(default=None)
    url: Optional[str] = Field(default=None)

class MatchAnalysis(BaseModel):
    matchScore: conint(ge=0, le=100)
    strengths: List[str] = Field(..., min_length=3, max_length=3)
    gapAnalysis: str
    verdict: str

class ExtractJobRequest(BaseModel):
    url: str = Field(..., min_length=5)