# Project Specification: CVSight

## Project Context
CVSight is an AI agent that analyzes CVs/resumes (PDF) and compares them with job descriptions to provide an ATS compatibility score, feedback, and improvement suggestions. 
This project emphasizes an agentic workflow: PDF parsing → LLM reasoning → structured JSON output, rather than retrieval from a knowledge base (RAG).

## Goals
1. Recruiter-facing portfolio piece for an AI Engineer position.
2. A personal tool for checking CVs when applying for jobs.
3. Demonstrate agentic workflow capabilities (tool/function calling and structured output).

## Scope MVP (Strictly Limited)

### In Scope
1. Upload CV in PDF format.
2. Input job description (optional - free text paste).
3. Manage a "Master Profile" locally (privacy-first) to store all experiences, projects, and certificates.
4. AI analysis returning structured output:
   - ATS compatibility score (0-100).
   - List of missing keywords/skills compared to the job description.
   - Feedback per section (summary, experience, skills).
   - Specific and actionable improvement suggestions (not generic).
   - Tailoring suggestions (recommending experiences/projects from the Master Profile to add or swap into the CV based on the job description).

### Out of Scope (For Future Iterations)
- Multi-file batch upload.
- User authentication/login.
- Database/history for storing analysis results.
- Multi-language support (focusing on Indonesian and English first).
- Cover letter generation.

## Tech Stack
- **Backend:** FastAPI (Python)
- **PDF Parsing:** PyMuPDF (`fitz`)
- **LLM:** Gemini API (Free Tier) utilizing `genai.types.GenerateContentConfig` and Pydantic for consistent JSON responses.
- **Frontend:** React (Vite)
  - Components separated for clarity (e.g., ProfileViewer, ProfileEditor, ImportReviewer).
- **Deployment:** Docker + docker-compose.
- **Data Validation:** Pydantic schemas.

## Directory Structure
```
cv-reviewer-agent/
├── backend/
│   ├── main.py              # FastAPI entrypoint
│   ├── parser.py            # PDF text extraction (PyMuPDF)
│   ├── analyzer.py          # Gemini API logic & prompt engineering
│   ├── schemas.py           # Pydantic models (request/response)
│   ├── master_profile.json  # Local storage for Master Profile (ignored by git)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MasterProfile.jsx    # Orchestrates View, Edit, and Import
│   │   │   ├── ProfileViewer.jsx    # Read-only UI for profile
│   │   │   ├── ProfileEditor.jsx    # Form UI for editing profile
│   │   │   └── ImportReviewer.jsx   # Smart Merge UI for importing JSON/PDF
│   │   ├── services/
│   │   │   └── api.js               # API client
│   │   └── App.jsx
├── docs/
│   └── spec.md              # Project specifications
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Specifications

### `POST /analyze`

**Request:**
- Format: `multipart/form-data`
- Body:
  - `cv_file`: PDF file 
  - `job_description`: string (optional, can be empty)

**Response:**
```json
{
  "ats_score": 78,
  "missing_keywords": ["Docker", "CI/CD", "Vector Database"],
  "section_feedback": {
    "summary": "string feedback",
    "experience": "string feedback",
    "skills": "string feedback"
  },
  "suggestions": [
    "string saran spesifik 1",
    "string saran spesifik 2"
  ],
  "profile_recommendations": [
    "Tambahkan proyek X dari Master Profile karena relevan dengan requirement Y."
  ]
}
```

### `GET /profile`
Returns the current local Master Profile (`master_profile.json`).

### `POST /profile`
Updates the local Master Profile.
**Request Body:** JSON representation of the Master Profile (experiences, projects, etc.).

### `POST /profile/extract`
Extracts profile data from a CV (PDF) using the Gemini AI.
**Request:**
- Format: `multipart/form-data`
- Body: `cv_file` (PDF file)

**Response:** JSON representation of the extracted Master Profile, ready to be merged on the frontend.

## AI Agent / Prompt Engineering Guidelines
- Must use structured output (function calling / JSON schema) to ensure a valid JSON response from the LLM, avoiding manual parsing of free text.
- The prompt must instruct the LLM to provide a score and feedback that is **specific to the CV content**, avoiding generic templates.
- If `job_description` is empty, the LLM should provide a general CV quality analysis (ATS-friendliness, clarity, structure) without keyword comparison.
