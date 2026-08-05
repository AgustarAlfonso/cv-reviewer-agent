import React, { useState, useEffect } from 'react';
import { generateCV } from '../services/api';
import './CVGenerator.css';

/**
 * CVGenerator Component
 * Allows users to generate an ATS-friendly CV based on their Master Profile and a Job Description.
 */
function CVGenerator() {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      await generateCV(jobDescription);
      setSuccessMessage('CV generated and downloaded successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred while generating the CV.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cv-generator-container">
      <div className="cv-generator-card">
        <h2>Generate ATS-Friendly CV</h2>
        <p className="description">
          Paste the Job Description below. Our AI will select the most relevant experiences from your Master Profile and generate a tailored, ATS-friendly CV.
        </p>

        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="success-alert">
            <span className="success-icon">✅</span>
            <p>{successMessage}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="job-description">Job Description (Optional, but recommended):</label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={6}
          />
        </div>

        <button 
          className="generate-btn" 
          onClick={handleGenerate} 
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading-content">
              <span className="spinner"></span> Generating...
            </span>
          ) : (
            'Generate CV'
          )}
        </button>
      </div>
    </div>
  );
}

export default CVGenerator;
