"""
Main entry point for the CVSight FastAPI backend.
Defines the API routes for CV analysis.
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import os
import json
from typing import Optional
from schemas import AnalysisResponse, MasterProfile, StructuredCV
from parser import extract_text_from_pdf, extract_text_from_docx
from analyzer import analyze_cv, extract_profile_from_cv, generate_cv_from_profile, apply_suggestion_to_cv
from docx_generator import create_docx_from_structured_cv
from pdf_generator import create_pdf_from_structured_cv
import hashlib
import time

# Load environment variables from .env if present
load_dotenv()

app = FastAPI(
    title="CVSight MVP API",
    description="API for analyzing CVs against Job Descriptions using Gemini.",
    version="1.0.0"
)

MASTER_PROFILE_PATH = "master_profile.json"

# --- Apply Suggestion: Cache & Rate Limiting ---
# In-memory cache keyed by hash(suggestion + master_profile_version + job_description).
# Prevents duplicate API calls when user clicks the same suggestion twice.
suggestion_cache: dict[str, dict] = {}

# Simple per-IP rate limiter: tracks timestamps of recent /apply-suggestion calls.
# Format: { ip_string: [timestamp1, timestamp2, ...] }
APPLY_RATE_LIMIT = 5       # max calls per window
APPLY_RATE_WINDOW = 60     # window in seconds
rate_limit_tracker: dict[str, list[float]] = {}

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
    """
    Health check endpoint.
    
    Returns:
        dict: A welcome message indicating the API is running.
    """
    return {"message": "Welcome to CVSight API. Go to /docs for Swagger UI."}

@app.get("/profile", response_model=MasterProfile)
def get_master_profile():
    """
    Retrieves the local Master Profile.
    If it doesn't exist, returns an empty profile.
    """
    if os.path.exists(MASTER_PROFILE_PATH):
        try:
            with open(MASTER_PROFILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return MasterProfile(**data)
        except Exception:
            pass
    return MasterProfile()

@app.post("/profile")
def update_master_profile(profile: MasterProfile):
    """
    Updates the local Master Profile and saves it to a JSON file.
    """
    try:
        with open(MASTER_PROFILE_PATH, "w", encoding="utf-8") as f:
            json.dump(profile.model_dump(), f, indent=4)
        return {"status": "success", "message": "Master Profile updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_endpoint(
    cv_file: Optional[UploadFile] = File(None),
    job_description: str = Form(default="")
):
    """
    Endpoint to upload a CV (PDF) and an optional job description for analysis.
    If no CV is uploaded, it analyzes the saved Master Profile instead.
    
    Args:
        cv_file (UploadFile, optional): The uploaded PDF file containing the CV.
        job_description (str, optional): The job description to compare against. Defaults to "".
        
    Returns:
        AnalysisResponse: The structured analysis result from the AI.
        
    Raises:
        HTTPException: If the file is not a PDF, or if parsing/analysis fails.
    """
    cv_text = ""
    if cv_file:
        if cv_file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] and not cv_file.filename.endswith((".pdf", ".docx")):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
        
        try:
            # Read the uploaded file bytes
            file_bytes = await cv_file.read()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
            
        # Extract text from the PDF or DOCX
        try:
            if cv_file.filename.endswith(".pdf") or cv_file.content_type == "application/pdf":
                cv_text = extract_text_from_pdf(file_bytes)
            else:
                cv_text = extract_text_from_docx(file_bytes)
                
            if not cv_text.strip():
                raise ValueError("No text could be extracted from the file.")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"File parsing error: {str(e)}")
        
    # Read Master Profile if it exists
    master_profile_data = None
    if os.path.exists(MASTER_PROFILE_PATH):
        try:
            with open(MASTER_PROFILE_PATH, "r", encoding="utf-8") as f:
                master_profile_data = json.load(f)
        except Exception as e:
            print(f"Warning: Failed to read master profile: {e}")

    if not cv_text and not master_profile_data:
        raise HTTPException(status_code=400, detail="Must provide either a CV file or have a saved Master Profile.")

    # Analyze the CV
    try:
        analysis_result = analyze_cv(cv_text, job_description, master_profile_data)
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/profile/extract", response_model=MasterProfile)
async def extract_profile_endpoint(cv_file: UploadFile = File(...)):
    """
    Endpoint to upload a CV (PDF) and extract its data into a Master Profile schema.
    """
    if cv_file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/json", "text/json"] and not cv_file.filename.endswith((".pdf", ".docx", ".json")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and JSON files are supported.")
    
    try:
        file_bytes = await cv_file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
        
    try:
        if cv_file.filename.endswith(".pdf") or cv_file.content_type == "application/pdf":
            cv_text = extract_text_from_pdf(file_bytes)
        elif cv_file.filename.endswith(".docx") or cv_file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            cv_text = extract_text_from_docx(file_bytes)
        else:
            # Assume JSON or text
            cv_text = file_bytes.decode('utf-8')
            
        if not cv_text.strip():
            raise ValueError("No text could be extracted from the file.")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"File parsing error: {str(e)}")
        
    try:
        profile_result = extract_profile_from_cv(cv_text)
        return profile_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile extraction failed: {str(e)}")

@app.post("/generate/docx")
async def generate_cv_docx_endpoint(job_description: str = Form(default=""), language: str = Form(default="English")):
    """
    Endpoint to generate an ATS-friendly CV (.docx) based on the Master Profile and a Job Description.
    """
    master_profile_data = None
    if os.path.exists(MASTER_PROFILE_PATH):
        try:
            with open(MASTER_PROFILE_PATH, "r", encoding="utf-8") as f:
                master_profile_data = json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read master profile: {str(e)}")
            
    if not master_profile_data:
        raise HTTPException(status_code=400, detail="Master Profile not found. Please create one first.")
        
    try:
        # Generate structured JSON from Gemini
        structured_cv = generate_cv_from_profile(job_description, master_profile_data, language=language)
        
        # Convert JSON to DOCX bytes stream
        doc_stream = create_docx_from_structured_cv(structured_cv)
        
        # Return as downloadable file
        return StreamingResponse(
            doc_stream, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": "attachment; filename=Tailored_CV.docx",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV generation failed: {str(e)}")

@app.post("/generate/preview", response_model=StructuredCV)
async def generate_cv_preview_endpoint(job_description: str = Form(default=""), language: str = Form(default="English")):
    """
    Endpoint to generate an ATS-friendly CV preview (JSON) based on the Master Profile and a Job Description.
    """
    master_profile_data = None
    if os.path.exists(MASTER_PROFILE_PATH):
        try:
            with open(MASTER_PROFILE_PATH, "r", encoding="utf-8") as f:
                master_profile_data = json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read master profile: {str(e)}")
            
    if not master_profile_data:
        raise HTTPException(status_code=400, detail="Master Profile not found. Please create one first.")
        
    try:
        # Generate structured JSON from Gemini
        structured_cv = generate_cv_from_profile(job_description, master_profile_data, language=language)
        return structured_cv
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV preview generation failed: {str(e)}")

@app.post("/generate/docx/from-json")
async def generate_cv_docx_from_json_endpoint(structured_cv: StructuredCV):
    """
    Endpoint to generate an ATS-friendly CV (.docx) directly from a provided StructuredCV JSON object.
    """
    try:
        # Convert JSON to DOCX bytes stream
        doc_stream = create_docx_from_structured_cv(structured_cv)
        
        # Return as downloadable file
        return StreamingResponse(
            doc_stream, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": "attachment; filename=Tailored_CV.docx",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV DOCX generation failed: {str(e)}")

@app.post("/generate/pdf")
async def generate_cv_pdf_endpoint(job_description: str = Form(default=""), language: str = Form(default="English")):
    """
    Endpoint to generate an ATS-friendly CV (.pdf) based on the Master Profile and a Job Description.
    """
    master_profile_data = None
    if os.path.exists(MASTER_PROFILE_PATH):
        try:
            with open(MASTER_PROFILE_PATH, "r", encoding="utf-8") as f:
                master_profile_data = json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read master profile: {str(e)}")
            
    if not master_profile_data:
        raise HTTPException(status_code=400, detail="Master Profile not found. Please create one first.")
        
    try:
        # Generate structured JSON from Gemini
        structured_cv = generate_cv_from_profile(job_description, master_profile_data, language=language)
        
        # Convert JSON to PDF bytes stream
        pdf_stream = create_pdf_from_structured_cv(structured_cv)
        
        # Return as downloadable file
        return StreamingResponse(
            pdf_stream, 
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=Tailored_CV.pdf",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV PDF generation failed: {str(e)}")

@app.post("/generate/pdf/from-json")
async def generate_cv_pdf_from_json_endpoint(structured_cv: StructuredCV):
    """
    Endpoint to generate an ATS-friendly CV (.pdf) directly from a provided StructuredCV JSON object.
    """
    try:
        # Convert JSON to PDF bytes stream
        pdf_stream = create_pdf_from_structured_cv(structured_cv)
        
        # Return as downloadable file
        return StreamingResponse(
            pdf_stream, 
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=Tailored_CV.pdf",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV PDF generation failed: {str(e)}")


def _check_rate_limit(client_ip: str) -> None:
    """
    Enforces a simple per-IP rate limit for apply-suggestion calls.
    Raises HTTPException 429 if the limit is exceeded.
    """
    now = time.time()
    timestamps = rate_limit_tracker.get(client_ip, [])
    # Prune timestamps outside the window
    timestamps = [t for t in timestamps if now - t < APPLY_RATE_WINDOW]
    if len(timestamps) >= APPLY_RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Max {APPLY_RATE_LIMIT} fix requests per {APPLY_RATE_WINDOW}s."
        )
    timestamps.append(now)
    rate_limit_tracker[client_ip] = timestamps


def _make_cache_key(suggestion: str, profile_json: str, job_description: str) -> str:
    """
    Creates a deterministic cache key from suggestion + profile + JD.
    """
    raw = f"{suggestion}|{profile_json}|{job_description}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


@app.post("/apply-suggestion", response_model=StructuredCV)
async def apply_suggestion_endpoint(
    request: Request,
    suggestion: str = Form(...),
    job_description: str = Form(default=""),
    original_cv: str = Form(default=""),
    language: str = Form(default="English")
):
    """
    Applies a single analysis suggestion to generate an improved StructuredCV.

    The Master Profile is NOT modified. Instead, a new CV is generated that
    incorporates the specified suggestion fix.

    Includes in-memory caching (same suggestion + profile + JD = cached result)
    and per-IP rate limiting to prevent API abuse.

    Args:
        request: The FastAPI Request object (for client IP).
        suggestion: The suggestion text to apply.
        job_description: Optional job description for context.
        original_cv: Optional JSON string of the current StructuredCV before fix.
        language: Target language for the CV output.

    Returns:
        StructuredCV: The improved CV with the suggestion applied.
    """
    # Rate limit check
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    # Read Master Profile
    master_profile_data = None
    if os.path.exists(MASTER_PROFILE_PATH):
        try:
            with open(MASTER_PROFILE_PATH, "r", encoding="utf-8") as f:
                master_profile_data = json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read master profile: {str(e)}")

    if not master_profile_data:
        raise HTTPException(status_code=400, detail="Master Profile not found. Please create one first.")

    # Cache check
    profile_json_str = json.dumps(master_profile_data, sort_keys=True)
    cache_key = _make_cache_key(suggestion, profile_json_str, job_description)
    if cache_key in suggestion_cache:
        print(f"Cache hit for suggestion: {suggestion[:50]}...")
        return StructuredCV(**suggestion_cache[cache_key])

    # Parse original_cv if provided
    original_cv_data = None
    if original_cv.strip():
        try:
            original_cv_data = json.loads(original_cv)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in original_cv field.")

    try:
        result = apply_suggestion_to_cv(
            suggestion=suggestion,
            master_profile=master_profile_data,
            job_description=job_description,
            original_cv=original_cv_data,
            language=language
        )
        # Store in cache
        suggestion_cache[cache_key] = result.model_dump()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply suggestion: {str(e)}")
