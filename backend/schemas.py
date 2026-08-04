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
    location: str = ""
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
    skills: List[str] = []

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
    skills: List[str] = []
    education: List[Education] = []
    work_experience: List[WorkExperience] = []
    org_experience: List[OrganizationExperience] = []
    projects: List[Project] = []
    publications: List[Publication] = []
    certificates: List[Certificate] = []

class CVSectionHeader(BaseModel):
    name: str
    headline: str = Field(description="e.g. 'Fresh Graduate | AI Infrastructure & Systems Support'")
    location: str
    phone: str
    email: str
    portfolio: str = Field(description="e.g. 'portofolio.com'")
    linkedin: str = Field(description="e.g. 'linkedin.com/in/username'")
    github: str = Field(description="e.g. 'github.com/username'")

class CVCategorizedSkill(BaseModel):
    category: str = Field(description="e.g. 'Programming Languages'")
    items: str = Field(description="e.g. 'Python, Java, JavaScript'")

class CVSectionExperience(BaseModel):
    role: str
    company: str
    duration: str
    location: str
    bullets: List[str]

class CVSectionEducation(BaseModel):
    institution: str
    degree: str
    duration: str
    gpa: str = Field(description="e.g. 'GPA 3.76/4.00'")

class CVSectionProject(BaseModel):
    name: str
    context: str = Field(description="e.g. 'Personal Project'")
    technologies: str = Field(description="e.g. 'Python, LangChain, Docker'")
    link: str = Field(description="e.g. 'github.com/user/repo'")
    bullets: List[str]

class CVSectionPublication(BaseModel):
    citation: str = Field(description="The full citation string of the publication.")

class CVSectionCertification(BaseModel):
    name: str = Field(description="e.g. 'Belajar Dasar AI'")
    issuer: str = Field(description="e.g. 'Dicoding Indonesia (Jul 2026)'")

class CVSectionLanguageOther(BaseModel):
    languages: str = Field(description="e.g. 'Indonesian (Native), English (Fluent)'")
    other_skills: str = Field(description="e.g. 'Detail-oriented, adaptable'")

class StructuredCV(BaseModel):
    """The structured ATS-friendly CV tailored to the job description."""
    header: CVSectionHeader
    summary: str
    skills: List[CVCategorizedSkill]
    experience: List[CVSectionExperience]
    projects: List[CVSectionProject]
    publications: List[CVSectionPublication]
    certifications: List[CVSectionCertification]
    education: List[CVSectionEducation]
    languages_other: CVSectionLanguageOther
