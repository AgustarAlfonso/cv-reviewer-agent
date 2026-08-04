"""
Pydantic schemas for data validation and defining the structured output 
expected from the Gemini LLM.
"""
from pydantic import BaseModel, Field
from typing import List, Optional

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
    profile_recommendations: List[str] = Field(
        description="A list of specific recommendations on which experiences, projects, or certificates from the Master Profile should be added to or swapped into the CV based on the job description.",
        default_factory=list
    )

class BasicInfo(BaseModel):
    """Basic personal information for the Master Profile."""
    name: str = ""
    email: str = ""
    phone: str = ""
    summary: str = ""
    github: str = ""
    linkedin: str = ""
    portfolio: str = ""

class Education(BaseModel):
    """Education entry for the Master Profile."""
    institution: str
    degree: str
    duration: str = ""
    description: str = Field(description="A detailed description using newline-separated bullet points starting with '- '", default="")

class WorkExperience(BaseModel):
    """Work experience entry for the Master Profile."""
    title: str
    company: str
    duration: str = ""
    description: str = Field(description="A detailed description using newline-separated bullet points starting with '- '", default="")

class OrganizationExperience(BaseModel):
    """Organization/Volunteer experience entry for the Master Profile."""
    role: str
    organization: str
    duration: str = ""
    description: str = Field(description="A detailed description using newline-separated bullet points starting with '- '", default="")

class Project(BaseModel):
    """Project entry for the Master Profile."""
    name: str
    description: str = Field(description="A detailed description using newline-separated bullet points starting with '- '", default="")
    technologies: List[str] = []
    link: str = ""
    repo: str = ""

class Certificate(BaseModel):
    """Certificate entry for the Master Profile."""
    name: str
    issuer: str
    date: str = ""
    link: str = ""

class Publication(BaseModel):
    """Publication entry for the Master Profile."""
    title: str
    publisher: str
    date: str = ""
    link: str = ""
    description: str = Field(description="A detailed description using newline-separated bullet points starting with '- '", default="")

class MasterProfile(BaseModel):
    """The user's complete Master Profile stored locally."""
    basic_info: BasicInfo = Field(default_factory=BasicInfo)
    education: List[Education] = []
    work_experience: List[WorkExperience] = []
    org_experience: List[OrganizationExperience] = []
    projects: List[Project] = []
    publications: List[Publication] = []
    certificates: List[Certificate] = []
