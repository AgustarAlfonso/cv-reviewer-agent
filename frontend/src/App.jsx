import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import AnalysisResults from './components/AnalysisResults';
import MasterProfile from './components/MasterProfile';
import CVGenerator from './components/CVGenerator';
import { analyzeCV } from './services/api';

/**
 * Main application component for CVSight.
 * Manages the state for CV analysis and renders the upload form and results.
 * 
 * @returns {JSX.Element} The main App component.
 */
function App() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' or 'profile'
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  /**
   * Handles the submission of the CV and job description for analysis.
   * Updates loading and result states.
   * 
   * @param {File} file - The uploaded CV PDF file.
   * @param {string} jobDescription - The optional job description text.
   */
  const handleAnalyze = async (file, jobDescription) => {
    setIsLoading(true);
    setResult(null); // Clear previous result
    
    try {
      const data = await analyzeCV(file, jobDescription);
      setResult(data);
    } catch (error) {
      alert(error.message || 'Failed to analyze CV.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header className="app-header">
        <h1>CVSight</h1>
        <nav className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            CV Analyzer
          </button>
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Master Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            CV Generator
          </button>
        </nav>
      </header>

      {activeTab === 'analyzer' ? (
        <main>
          <p className="app-description">
            AI-Powered Resume Analyzer. Upload your CV to check its ATS compatibility and get actionable feedback.
          </p>
          <UploadForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          <AnalysisResults result={result} />
        </main>
      ) : activeTab === 'profile' ? (
        <main>
          <MasterProfile />
        </main>
      ) : (
        <main>
          <CVGenerator />
        </main>
      )}
    </div>
  );
}

export default App;
