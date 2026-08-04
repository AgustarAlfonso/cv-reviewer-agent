import os
from google import genai
from google.genai import types
from schemas import AnalysisResponse
from pydantic import ValidationError

def analyze_cv(cv_text: str, job_description: str = "") -> AnalysisResponse:
    """
    Analyzes the CV text against the job description using Gemini API.
    Returns a structured AnalysisResponse.
    """
    # Initialize the Gemini client. It automatically picks up GEMINI_API_KEY from env.
    client = genai.Client()
    
    # We define a list of models to try in case of 503 UNAVAILABLE errors due to high demand
    models_to_try = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"]
    
    if job_description.strip():
        prompt = f"""
You are an expert technical recruiter and an advanced Applicant Tracking System (ATS).
Your task is to analyze the following CV against the provided Job Description.

Job Description:
{job_description}

CV Text:
{cv_text}

Provide a detailed analysis including:
1. An ATS compatibility score (0-100) based on keyword matching, experience alignment, and overall fit.
2. A list of important keywords or skills from the Job Description that are missing in the CV.
3. Feedback specific to the CV's sections: Professional Summary, Work Experience, and Skills. If a section is missing, point it out. Focus on quantifiable achievements and clarity.
4. Specific, actionable suggestions to improve the CV for this specific job. Do not provide generic advice.

Ensure your response is highly specific to the provided CV content.
"""
    else:
        prompt = f"""
You are an expert technical recruiter and an advanced Applicant Tracking System (ATS).
Your task is to analyze the following CV and evaluate its general quality, structure, and ATS-friendliness.

CV Text:
{cv_text}

Provide a detailed analysis including:
1. An ATS compatibility score (0-100) based on general best practices, formatting, and clarity.
2. A list of general keywords or skills that are expected for the role implied by the CV but are missing.
3. Feedback specific to the CV's sections: Professional Summary, Work Experience, and Skills. If a section is missing, point it out. Focus on quantifiable achievements and clarity.
4. Specific, actionable suggestions to improve the CV. Do not provide generic advice.

Ensure your response is highly specific to the provided CV content.
"""

    last_error = None
    for model_name in models_to_try:
        try:
            print(f"Trying model: {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AnalysisResponse,
                    temperature=0.2, # Lower temperature for more consistent, analytical output
                ),
            )
            
            # The response.text is guaranteed to match the schema, but we parse it into the Pydantic model
            # to ensure it's fully validated and ready for the FastAPI response.
            return AnalysisResponse.model_validate_json(response.text)
            
        except Exception as e:
            error_str = str(e)
            last_error = error_str
            if "503" in error_str or "UNAVAILABLE" in error_str:
                print(f"Model {model_name} is unavailable due to high demand. Falling back to next model...")
                continue
            else:
                # If it's a different error, raise it immediately
                raise RuntimeError(f"Failed to analyze CV with Gemini API ({model_name}): {error_str}")

    raise RuntimeError(f"All models failed due to high demand. Last error: {last_error}")
