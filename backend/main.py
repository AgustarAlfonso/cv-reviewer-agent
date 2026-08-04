from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas import AnalysisResponse
from parser import extract_text_from_pdf
from analyzer import analyze_cv

# Load environment variables from .env if present
load_dotenv()

app = FastAPI(
    title="CVSight MVP API",
    description="API for analyzing CVs against Job Descriptions using Gemini.",
    version="1.0.0"
)

# Set up CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allowing all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CVSight API. Go to /docs for Swagger UI."}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_endpoint(
    cv_file: UploadFile = File(...),
    job_description: str = Form(default="")
):
    """
    Endpoint to upload a CV (PDF) and an optional job description.
    Returns the analysis result.
    """
    if cv_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Read the uploaded PDF file bytes
        file_bytes = await cv_file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
        
    # Extract text from the PDF
    try:
        cv_text = extract_text_from_pdf(file_bytes)
        if not cv_text.strip():
            raise ValueError("No text could be extracted from the PDF.")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF parsing error: {str(e)}")
        
    # Analyze the CV
    try:
        analysis_result = analyze_cv(cv_text, job_description)
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
