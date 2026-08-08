# CVSight

CVSight is an AI-powered MVP tool for analyzing CVs against Job Descriptions using Google Gemini. It allows users to extract their CV into a "Master Profile", analyze how well their profile fits a job description, and generate an ATS-friendly CV (in DOCX or PDF format) tailored to that specific job.

## Key Features

- **CV Analysis**: Upload a CV (PDF/DOCX) and a Job Description to get a detailed fit analysis and actionable improvement suggestions.
- **Master Profile Extraction**: Automatically extract a comprehensive profile from any CV file to save as a base Master Profile.
- **Tailored CV Generation**: Generate a tailored, ATS-friendly CV (PDF or DOCX) in real-time based on the Master Profile and a target Job Description.
- **Interactive Suggestions**: Apply AI-suggested fixes to the CV and immediately preview the updated version without modifying the base Master Profile.

## Privacy & Data Handling

CVSight prioritizes data privacy:
- **Local Storage**: The "Master Profile" is saved locally on your machine (`backend/master_profile.json`). No personal data is stored on external databases.
- **AI Processing**: CV data and Job Descriptions are sent to the Google Gemini API solely for the purpose of analysis and generation. Please review Google's API terms of service regarding data processing if you have strict privacy requirements.
- **Generated Files**: Any generated DOCX or PDF files are streamed directly to your browser and are not permanently hosted on any external server.

## Master Profile Workflow

The Master Profile acts as a central repository for all your skills, experiences, and achievements. Here is how the workflow operates:

1. **Extraction (One-Time Setup)**: 
   Upload your most comprehensive, generic CV. The system will extract every detail (skills, work history, projects, languages) and structure it into a single JSON schema.
2. **Local Saving**: 
   This extracted data is saved locally as your "Master Profile" (`master_profile.json`). You only need to do this once, though you can re-extract or manually update it at any time.
3. **Analysis & Tailoring**:
   When you find a new job posting, you provide the Job Description. CVSight compares the JD against your *entire* Master Profile, ensuring no relevant past experience is overlooked.
4. **Generation**:
   The AI selects the most relevant bullet points, skills, and experiences from your Master Profile that match the JD, and generates a highly targeted, ATS-friendly CV (PDF/DOCX) specifically for that job application.

## Tech Stack

- **Language**: Python 3.8+ (Backend), JavaScript/Node.js (Frontend)
- **Framework**: FastAPI (Backend), React/Vite (Frontend)
- **AI Model**: Google Gemini (`google-genai`)
- **Document Processing**: `PyMuPDF` (PDF parsing), `python-docx` (DOCX parsing/generation), `fpdf2` (PDF generation)
- **Styling**: Tailwind CSS v4

## Prerequisites

- Node.js (v18 or higher recommended)
- Python 3.8 or higher
- `uv` (optional, for fast Python dependency management) or `pip`
- Google Gemini API Key

## Quick Start

The easiest way to run the application is using Docker. Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. **Clone the repository and prepare the environment:**
   ```bash
   git clone <repository-url> cv-reviewer-agent
   cd cv-reviewer-agent
   
   # Setup environment variables
   cp backend/.env.example backend/.env
   # Open backend/.env and add your GEMINI_API_KEY
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Open the application:**
   Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Getting Started (Detailed Manual Setup)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cv-reviewer-agent
```

### 2. Setup the Backend

Ensure you have Python installed. We recommend using `uv` or `venv` to create a virtual environment.

```bash
cd backend

# Create a virtual environment and activate it
uv venv
# On Windows: .venv\Scripts\activate
# On macOS/Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Setup

Create a `.env` file in the `backend/` directory by copying the example file:

```bash
cd backend
cp .env.example .env
```

Configure the following variables in `backend/.env`:

| Variable           | Description                  | Example                                    |
| ------------------ | ---------------------------- | ------------------------------------------ |
| `GEMINI_API_KEY`   | Google Gemini API Key        | `AIzaSy...`                                |

### 4. Setup the Frontend

```bash
cd frontend
npm install
```

### 5. Start Development Servers

For **Windows users**, there is a convenient batch script to start both services at once:

```bash
.\start.bat
```

**Or manually:**

Terminal 1: Start Backend (FastAPI)
```bash
cd backend
# With uv
uv run uvicorn main:app --reload
# Or with standard python
# uvicorn main:app --reload
```

Terminal 2: Start Frontend (Vite)
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Architecture

### Directory Structure

```text
├── backend/
│   ├── analyzer.py        # Logic for interacting with Google Gemini API
│   ├── docx_generator.py  # ATS-friendly DOCX CV generation logic
│   ├── main.py            # FastAPI entry point & API routes
│   ├── parser.py          # PDF and DOCX text extraction tools
│   ├── pdf_generator.py   # ATS-friendly PDF CV generation logic
│   ├── requirements.txt   # Python dependencies
│   └── schemas.py         # Pydantic schemas for data validation
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React UI components
│   │   ├── pages/         # Page-level components
│   │   └── services/      # API communication (Axios)
│   ├── index.html         # Vite HTML entry
│   ├── package.json       # JS dependencies and scripts
│   └── vite.config.js     # Vite configuration
├── start.bat              # Script to start both servers on Windows
└── .gitignore
```

### Request Lifecycle

1. **Upload/Extract**: User uploads a CV (PDF/DOCX). The React frontend sends it to `/profile/extract`. The FastAPI backend uses `parser.py` to extract text and `analyzer.py` to structure it via Gemini into a Master Profile.
2. **Analyze**: User inputs a Job Description. Frontend calls `/analyze`. Backend uses Gemini to compare the Master Profile to the Job Description and returns fit percentage, missing keywords, and suggestions.
3. **Generate Tailored CV**: User clicks generate. Frontend calls `/generate/docx` or `/generate/pdf`. Backend merges the Master Profile and Job Description via Gemini to create a tailored JSON structure, then converts it to DOCX or PDF using `docx_generator.py` or `pdf_generator.py`.
4. **Interactive Fixes**: User clicks a suggestion. Frontend calls `/apply-suggestion`. Backend generates an updated CV preview containing the fix, caching it by a deterministic hash to prevent duplicate AI calls.

## Troubleshooting

### Port Conflicts
If you encounter `[Errno 98] Address already in use` when starting FastAPI, another service is using port 8000. Start it on a different port:
```bash
uv run uvicorn main:app --reload --port 8080
```
Update your frontend API configuration accordingly if you change the backend port.

### Gemini API Errors
Ensure your `GEMINI_API_KEY` is properly set in `backend/.env`. If you receive a 401 or 403 error, your key might be invalid or lacking permissions.
