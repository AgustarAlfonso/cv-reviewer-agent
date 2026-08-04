from pydantic import BaseModel, Field
from typing import List

class SectionFeedback(BaseModel):
    """Feedback specific to sections of the CV."""
    summary: str = Field(description="Feedback on the professional summary section. Point out strengths and weaknesses.")
    experience: str = Field(description="Feedback on the work experience section. Are achievements quantifiable? Is the impact clear?")
    skills: str = Field(description="Feedback on the skills section. Are relevant skills highlighted?")

class AnalysisResponse(BaseModel):
    """The structured analysis of the CV against a job description (if provided)."""
    ats_score: int = Field(
        description="A score from 0 to 100 representing how well the CV matches the job description and ATS best practices.",
        ge=0, le=100
    )
    missing_keywords: List[str] = Field(
        description="A list of important keywords or skills missing from the CV compared to the job description. If no job description is provided, list general keywords expected for the implicit role.",
        default_factory=list
    )
    section_feedback: SectionFeedback = Field(
        description="Detailed feedback broken down by CV sections."
    )
    suggestions: List[str] = Field(
        description="A list of specific, actionable suggestions to improve the CV.",
        default_factory=list
    )
