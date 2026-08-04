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
25. ATS CV Generator (Export to DOCX): Programmatically builds a single-column, ATS-friendly Word document based strictly on the user's Master Profile.

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
│   ├── docx_generator.py    # Python-docx generation for ATS-friendly CV
│   ├── schemas.py           # Pydantic models (request/response)
│   ├── master_profile.json  # Local storage for Master Profile (ignored by git)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MasterProfile.jsx    # Orchestrates View, Edit, and Import
│   │   │   ├── ProfileViewer.jsx    # Read-only UI for profile
│   │   │   ├── ProfileEditor.jsx    # Form UI for editing profile
│   │   │   ├── ImportReviewer.jsx   # Smart Merge UI for importing JSON/PDF
│   │   │   └── CVGenerator.jsx      # UI to trigger CV DOCX generation
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
Extracts profile data from a CV (PDF) or a legacy JSON file using the Gemini AI.
**Request:**
- Format: `multipart/form-data`
- Body: `cv_file` (PDF or JSON file)

**Response:** JSON representation of the extracted Master Profile, ready to be merged on the frontend. The response maps the extracted data into the following distinct categories:
- `education`: Academic history and degrees.
- `work_experience`: Professional employment.
- `org_experience`: Volunteer, committee, or student organization roles.
- `projects`: Technical or personal projects. Includes optional `link` (Demo), `repo` (Repository), and `technologies` fields.
- `publications`: Academic papers or published articles. Includes optional `link` field.
- `certificates`: Courses and certifications. Includes optional `link` (Credential URL) and `skills` fields.
- `skills`: A standalone list of technical and soft skills.

**Auto-Aggregation of Skills:**
The frontend editor automatically aggregates any `technologies` listed in `projects` and `skills` listed in `certificates`, merging them into the main `skills` array upon saving to prevent duplicates and ensure a comprehensive skills list.

**Smart Merge Deduplication:**
When importing JSON/PDF data on the frontend, the system performs a Smart Merge to prevent duplicates. It checks for existing items based on key fields:
- `education`: matched by `institution` and `degree`.
- `work_experience`: matched by `company` and `title`.
- `org_experience`: matched by `organization` and `role`.
- `projects`, `publications`, `certificates`: matched by `name` or `title`.

**Legacy Link Mapping:**
The AI extraction prompt specifically maps legacy JSON link properties (like `credentialUrl`, `demoUrl`, `repoUrl`) to the new standard schema fields (`link`, `repo`) when parsing unstructured or old data files.

**Basic Info:**
The profile also includes a `basic_info` object that stores `location`, along with links to `github`, `linkedin`, and `portfolio`.

### `GET /generate/docx`
Generates an ATS-friendly CV based on the current local Master Profile.
**Response:** Binary stream of a DOCX file (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).

## AI Agent / Prompt Engineering Guidelines
- Must use structured output (function calling / JSON schema) to ensure a valid JSON response from the LLM, avoiding manual parsing of free text.
- The prompt must instruct the LLM to provide a score and feedback that is **specific to the CV content**, avoiding generic templates.
- **Formatting Constraints**: The LLM must be explicitly prompted to return all `description` fields as newline-separated bullet points (starting with `- `). This enables the frontend to automatically render clean HTML lists (`<ul><li>`) instead of unreadable blocks of text.
- If `job_description` is empty, the LLM should provide a general CV quality analysis (ATS-friendliness, clarity, structure) without keyword comparison.
- **GROUND-TRUTH RULE**: When extracting or tailoring content, the LLM must strictly adhere to the facts presented in the Master Profile. It must never invent, hallucinate, or creatively alter the facts (e.g., location, graduation status) beyond what is explicitly stated.
