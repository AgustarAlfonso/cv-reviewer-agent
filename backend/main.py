"""
Main entry point for the CVSight FastAPI backend.
Defines the API routes for CV analysis.
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import os
import json
from typing import Optional
from schemas import AnalysisResponse, MasterProfile
from parser import extract_text_from_pdf
from analyzer import analyze_cv, extract_profile_from_cv

# Load environment variables from .env if present
load_dotenv()

app = FastAPI(
    title="CVSight MVP API",
    description="API for analyzing CVs against Job Descriptions using Gemini.",
    version="1.0.0"
)

MASTER_PROFILE_PATH = "master_profile.json"

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
    if cv_file.content_type not in ["application/pdf", "application/json", "text/json"] and not cv_file.filename.endswith((".pdf", ".json")):
        raise HTTPException(status_code=400, detail="Only PDF and JSON files are supported.")
    
    try:
        file_bytes = await cv_file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
        
    try:
        if cv_file.filename.endswith(".pdf") or cv_file.content_type == "application/pdf":
            cv_text = extract_text_from_pdf(file_bytes)
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
