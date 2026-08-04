# CVSight Backend MVP

This is the backend MVP for CVSight, an AI agent that analyzes CVs against job descriptions.

## Setup

1. Navigate to this directory:
   ```bash
   cd cv-reviewer-agent/backend
   ```
2. Make sure you have created the virtual environment and installed dependencies (we use `uv` here):
   ```bash
   uv venv
   uv pip install -r requirements.txt
   ```
3. Create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file and insert your actual `GEMINI_API_KEY`.

## Running the API

Start the FastAPI server using Uvicorn:
```bash
# Using standard Python activation:
# Windows: .\venv\Scripts\activate
# uvicorn main:app --reload

# Or with uv run:
uv run uvicorn main:app --reload
```

## Testing

1. Open your browser and go to the Swagger UI: http://localhost:8000/docs
2. Find the `POST /analyze` endpoint and click "Try it out".
3. Upload a sample CV (PDF).
4. Optionally, paste a Job Description in the text field.
5. Execute the request and observe the structured JSON response containing the ATS score, feedback, and missing keywords.
