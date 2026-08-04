import React from 'react';
import './AnalysisResults.css';

const AnalysisResults = ({ result }) => {
  if (!result) return null;

  const { ats_score, missing_keywords, section_feedback, suggestions } = result;

  // Determine color based on score
  let scoreColor = '#e53e3e'; // Red for low
  if (ats_score >= 75) scoreColor = '#38a169'; // Green for high
  else if (ats_score >= 50) scoreColor = '#d69e2e'; // Yellow for medium

  return (
    <div className="results-container">
      <div className="score-section">
        <div className="score-circle" style={{ borderColor: scoreColor, color: scoreColor }}>
          <span className="score-value">{ats_score}</span>
          <span className="score-label">/ 100</span>
        </div>
        <div className="score-text">
          <h3>ATS Compatibility Score</h3>
          <p>
            {ats_score >= 75 && "Great job! Your CV is well-optimized for this role."}
            {ats_score >= 50 && ats_score < 75 && "Good effort, but there's room for improvement."}
            {ats_score < 50 && "Your CV needs significant updates to pass ATS filters."}
          </p>
        </div>
      </div>

      {missing_keywords && missing_keywords.length > 0 && (
        <div className="result-card">
          <h3>Missing Keywords & Skills</h3>
          <p className="card-subtitle">Consider adding these naturally to your CV if you have the experience.</p>
          <div className="keywords-container">
            {missing_keywords.map((keyword, index) => (
              <span key={index} className="keyword-pill">{keyword}</span>
            ))}
          </div>
        </div>
      )}

      <div className="result-card">
        <h3>Section Feedback</h3>
        <div className="feedback-grid">
          <div className="feedback-item">
            <h4>Professional Summary</h4>
            <p>{section_feedback?.summary || "No feedback provided."}</p>
          </div>
          <div className="feedback-item">
            <h4>Work Experience</h4>
            <p>{section_feedback?.experience || "No feedback provided."}</p>
          </div>
          <div className="feedback-item">
            <h4>Skills</h4>
            <p>{section_feedback?.skills || "No feedback provided."}</p>
          </div>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="result-card">
          <h3>Actionable Suggestions</h3>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
